from celery import shared_task
from models import Transcription, StudyNotes, TranscriptionStatus
from celery_app import app as celery_app
from uuid import UUID
from typing import Dict, List
import asyncio
from tortoise import Tortoise
from dotenv import load_dotenv
import logging
import os
from utils.logger import setup_logger
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# Set up logger for transcript processing
logger = setup_logger('transcript_processing', 'transcript_processing.log')

# Load environment variables
load_dotenv()

# Pydantic models for structured output
class Scripture(BaseModel):
    reference: str = Field(description="The scripture reference (e.g., 'John 3:16')")
    text: str = Field(description="The full text of the scripture verse")

class SermonStudyNotes(BaseModel):
    summary: str = Field(description="A concise summary of the sermon's main message")
    key_points: List[str] = Field(description="Key points or main takeaways from the sermon")
    scriptures: List[Scripture] = Field(description="Scripture references used in the sermon")
    discussion_questions: List[str] = Field(description="Questions for group discussion or personal reflection")
    application_points: List[str] = Field(description="Practical ways to apply the sermon's message")

@shared_task
def process_transcript(transcription_id: UUID) -> Dict:
    logger.info(f"Starting transcript processing task for ID: {transcription_id}")
    try:
        result = asyncio.run(_process_transcript(transcription_id))
        logger.info(f"Transcript processing task completed for ID: {transcription_id}")
        return result
    except Exception as e:
        logger.error(f"Transcript processing task failed for ID: {transcription_id}: {str(e)}", exc_info=True)
        raise

async def _process_transcript(transcription_id: UUID) -> Dict:
    try:
        # Initialize database connection
        await Tortoise.init(
            db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
            modules={'models': ['models']}
        )

        # Get transcription object
        transcription = await Transcription.get(id=transcription_id)
        
        # Update status to generating notes
        transcription.status = TranscriptionStatus.GENERATING_NOTES
        await transcription.save()

        # Initialize Azure OpenAI
        llm = AzureChatOpenAI(
            openai_api_version=os.getenv('OPENAI_API_VERSION'),
            azure_deployment=os.getenv('AZURE_DEPLOYMENT_NAME'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_key=os.getenv('AZURE_OPENAI_API_KEY')
        )

        # Set up the output parser
        parser = PydanticOutputParser(pydantic_object=SermonStudyNotes)

        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", "As a divinely-inspired analytical tool, you serve as a faithful partner in strengthening church ministries. \
                        Your mission is to illuminate biblical wisdom within sermons, empowering congregations through structured \
                        analysis that supports spiritual growth, community building, and practical application of Scripture."),
            # ("user", "Please analyze this sermon transcript and extract the following information:\n\n{transcript}\n\n{format_instructions}")
               ("user", "Reverently analyze this sermon transcript and  extract and structure the following elements with pastoral sensitivity: \n\n{transcript}\n\n{format_instructions}")
        ])

        # Format the prompt with the transcript and parser instructions
        formatted_prompt = prompt.format_prompt(
            transcript=transcription.transcription_text,
            format_instructions=parser.get_format_instructions()
        )

        # Generate the study notes using the language model
        output = llm.predict(formatted_prompt.to_string())
        study_notes_data = parser.parse(output)

        # Create study notes in database
        study_notes = await StudyNotes.create(
            transcript=transcription,
            user=transcription.user,  # Add the user from the transcription
            summary=study_notes_data.summary,
            key_points=study_notes_data.key_points,
            scriptures=[{"reference": s.reference, "text": s.text} for s in study_notes_data.scriptures],
            discussion_questions=study_notes_data.discussion_questions,
            application_points=study_notes_data.application_points
        )

        # Update transcription status to completed
        transcription.status = TranscriptionStatus.COMPLETED
        await transcription.save()

        return {
            "id": str(study_notes.id),
            "transcript_id": str(transcription.id),
            "summary": study_notes.summary,
            "key_points": study_notes.key_points,
            "scriptures": study_notes.scriptures,
            "discussion_questions": study_notes.discussion_questions,
            "application_points": study_notes.application_points,
            "created_at": study_notes.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}", exc_info=True)
        if transcription:
            transcription.status = TranscriptionStatus.FAILED
            transcription.error_message = str(e)
            await transcription.save()
        raise

    finally:
        # Close database connection
        await Tortoise.close_connections()