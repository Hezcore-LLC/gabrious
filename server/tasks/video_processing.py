from celery import shared_task
from models import Transcription, StudyNotes, TranscriptionStatus
from celery_app import app as celery_app
import yt_dlp
import os
import subprocess
from openai import AzureOpenAI
from uuid import UUID
from typing import Optional, Dict, List
import asyncio
from tortoise import Tortoise
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@shared_task
def process_video(transcription_id: UUID, video_url: str) -> Dict:
    return asyncio.run(_process_video(transcription_id, video_url))

async def _process_video(transcription_id: UUID, video_url: str) -> Dict:
    try:
        # Initialize database connection
        await Tortoise.init(
            db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
            modules={'models': ['models']}
        )
        # Get transcription object
        transcription = await Transcription.get(id=transcription_id)
        # Update video URL
        transcription.video_url = video_url
        await transcription.save()
        
        # Update status to downloading
        transcription.status = TranscriptionStatus.DOWNLOADING
        await transcription.save()
        
        # Configure yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '32',  # Reduced from 192 to 32 for smaller file size
            }],
            'outtmpl': f'temp/{transcription_id}.%(ext)s'
        }
        
        # Download video and extract audio
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([transcription.video_url])
        
        # Update status to extracting audio
        transcription.status = TranscriptionStatus.EXTRACTING_AUDIO
        await transcription.save()
        
        # Further reduce file size by converting to mono and lower bitrate
        original_file = f'temp/{transcription_id}.mp3'
        optimized_file = f'temp/{transcription_id}_optimized.mp3'
        
        # Use FFmpeg to convert to mono with 16kHz sample rate and 24kbps bitrate
        subprocess.run([
            'ffmpeg', '-y', '-i', original_file,
            '-ac', '1',  # Mono audio (1 channel)
            '-ar', '16000',  # 16kHz sample rate
            '-b:a', '24k',  # 24kbps bitrate
            optimized_file
        ], check=True)
        
        # Replace original with optimized version
        os.remove(original_file)
        os.rename(optimized_file, original_file)
        
        # Configure Azure OpenAI client
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version="2024-02-01",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        
        # Update status to transcribing
        transcription.status = TranscriptionStatus.TRANSCRIBING
        await transcription.save()
        
        # Perform transcription using Azure OpenAI
        deployment_id = os.getenv("AZURE_OPENAI_DEPLOYMENT_ID", "whisper")
        
        with open(f'temp/{transcription_id}.mp3', "rb") as audio_file:
            result = client.audio.transcriptions.create(
                file=audio_file,
                model=deployment_id  # Use the deployment_id instead of hardcoded "whisper"
            )
        
        # Save transcription text
        transcription.transcription_text = result.text
        transcription.status = TranscriptionStatus.GENERATING_NOTES
        await transcription.save()
        
        # Clean up temporary files
        os.remove(f'temp/{transcription_id}.mp3')
        
        # Generate study notes (this would be expanded with actual NLP processing)
        await generate_study_notes(transcription)
        
        # Update status to completed
        transcription.status = TranscriptionStatus.COMPLETED
        await transcription.save()
        
        return {"status": "success", "transcription_id": str(transcription_id)}
        
    except Exception as e:
        # Update status to failed
        transcription.status = TranscriptionStatus.FAILED
        transcription.error_message = str(e)
        await transcription.save()
        raise

async def generate_study_notes(transcription: Transcription) -> None:
    """Generate study notes from transcription text using NLP"""
    # This is a placeholder for the actual NLP processing
    # In a real implementation, you would use NLP libraries or AI services
    # to analyze the transcription and extract key information
    
    study_notes = await StudyNotes.create(
        transcription=transcription,
        title="Study Notes for " + transcription.video_url.split('/')[-1],
        summary="Summary will be generated using NLP",
        key_points=["Key point 1", "Key point 2"],
        scriptures=[{"reference": "John 3:16", "text": "Scripture text"}],
        discussion_questions=["Question 1?", "Question 2?"],
        application_points=["Application point 1", "Application point 2"]
    )
    
    await study_notes.save()