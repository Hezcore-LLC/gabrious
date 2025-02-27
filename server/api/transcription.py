from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
from models.transcription import Transcription, TranscriptionStatus
from pydantic import BaseModel
from tasks.video_processing import process_video
import logging

logging.basicConfig(level=logging.DEBUG)


router = APIRouter()

class TranscriptionRequest(BaseModel):
    video_url: str



@router.post("/")
async def create_transcription(request: TranscriptionRequest, background_tasks: BackgroundTasks):
    # Create a new transcription record
    # logging.debug(f"Received video_url: {video_url}")
    logging.debug(f"Received video_url: {request.video_url}")
    transcription = await Transcription.create(
        video_url=request.video_url,
        status=TranscriptionStatus.PENDING
    )
    
    # Start the background task for video processing
    task = process_video.delay(str(transcription.id), request.video_url)
    
    return {
        "id": transcription.id,
        "status": transcription.status,
        "task_id": task.id
    }

@router.get("/{transcription_id}")
async def get_transcription(transcription_id: str):
    transcription = await Transcription.get_or_none(id=transcription_id)
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    return {
        "id": transcription.id,
        "video_url": transcription.video_url,
        "status": transcription.status,
        "transcription_text": transcription.transcription_text,
        "error_message": transcription.error_message,
        "created_at": transcription.created_at,
        "updated_at": transcription.updated_at
    }

@router.get("/")
async def list_transcriptions():
    transcriptions = await Transcription.all()
    return transcriptions


