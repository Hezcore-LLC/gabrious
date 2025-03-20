from celery import shared_task
from models import Transcription, StudyNotes, TranscriptionStatus
from celery_app import app as celery_app
from tasks.transcript_processing import process_transcript
import yt_dlp
import os
import subprocess
from openai import AzureOpenAI
from uuid import UUID
from typing import Optional, Dict, List
import asyncio
from tortoise import Tortoise
from dotenv import load_dotenv
import logging
import os
import sys
from utils.logger import setup_logger

# Set up logger for video processing
logger = setup_logger('video_processing', 'video_processing.log')

# Log startup information
logger.info("Video processing module initialized")

# Load environment variables
load_dotenv()

@shared_task
def process_video(transcription_id: UUID, video_url: str) -> Dict:
    logger.info(f"Starting video processing task for ID: {transcription_id}, URL: {video_url}")
    try:
        result = asyncio.run(_process_video(transcription_id, video_url))
        logger.info(f"Video processing task completed for ID: {transcription_id}")
        return result
    except Exception as e:
        logger.error(f"Video processing task failed for ID: {transcription_id}: {str(e)}", exc_info=True)
        raise

async def _process_video(transcription_id: UUID, video_url: str) -> Dict:
    # Initialize transcription variable outside try block to avoid UnboundLocalError
    transcription = None
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
            'outtmpl': f'temp/{transcription_id}.%(ext)s',
            # Add cookie handling to bypass YouTube bot detection
            'cookiesfrombrowser': ('chrome',),  # Try to use Chrome cookies
            'cookiefile': 'temp/youtube_cookies.txt',  # Fallback to a cookie file if available
            # Add user agent to appear more like a regular browser
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            # Add retries for transient errors
            'retries': 10,
            'ignoreerrors': True
        }
        
        # Extract video metadata before downloading
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Extracting metadata for video: {video_url}")
            info = ydl.extract_info(transcription.video_url, download=False)
            
            # Extract all metadata directly
            # Title extraction
            transcription.title = info.get('title')
            
            # Pastor/uploader extraction with fallbacks in a single line
            transcription.pastor = info.get('uploader') or info.get('channel') or info.get('creator') or info.get('artist')
            
            # Thumbnail extraction with fallbacks
            transcription.thumbnail = info.get('thumbnail')
            if not transcription.thumbnail and 'thumbnails' in info and info['thumbnails']:
                thumbnails = info['thumbnails']
                if thumbnails:
                    # Get the highest quality thumbnail (usually the last one)
                    transcription.thumbnail = thumbnails[-1].get('url')
            
            # Duration formatting
            duration_seconds = info.get('duration')
            if duration_seconds:
                minutes, seconds = divmod(duration_seconds, 60)
                hours, minutes = divmod(minutes, 60)
                transcription.duration = f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}" if hours > 0 else f"{int(minutes):02d}:{int(seconds):02d}"
            else:
                transcription.duration = None
            
            # Make sure to save all metadata before proceeding
            await transcription.save()
            
            # Now download the video
            logger.info(f"Downloading video: {video_url}")
            ydl.download([transcription.video_url])
        
        # Update status to extracting audio
        transcription.status = TranscriptionStatus.EXTRACTING_AUDIO
        await transcription.save()
        
        # Further reduce file size by converting to mono and lower bitrate
        original_file = f'temp/{transcription_id}.mp3'
        optimized_file = f'temp/{transcription_id}_optimized.mp3'
        
        logger.info(f"Optimizing audio file")
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
        
        # Calculate and store file size
        file_size = os.path.getsize(original_file)
        transcription.file_size = file_size
        await transcription.save()
        
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
        
        logger.info(f"Transcribing audio using Azure OpenAI")
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
        logger.info(f"Cleaning up temporary files")
        os.remove(f'temp/{transcription_id}.mp3')
        
        # Generate study notes using transcript processing
        logger.info(f"Initiating study notes generation via transcript processing")
        process_transcript.delay(str(transcription.id))
        
        # Status will be updated by transcript processing task
        logger.info(f"Study notes generation task queued")
        
        logger.info(f"Video processing completed successfully for ID: {transcription_id}")
        return {"status": "success", "transcription_id": str(transcription_id)}
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}", exc_info=True)
        # Update status to failed only if transcription object exists
        if transcription:
            transcription.status = TranscriptionStatus.FAILED
            transcription.error_message = str(e)
            await transcription.save()
        raise
    finally:
        # Ensure database connections are properly closed
        await Tortoise.close_connections()