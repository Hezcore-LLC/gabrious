from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Optional
from models.transcription import Transcription, TranscriptionStatus
from models.user import User
from pydantic import BaseModel
from tasks.video_processing import process_video
from api.auth import get_current_user
from services.metrics import MetricsService
import logging

logging.basicConfig(level=logging.DEBUG)

router = APIRouter()

class TranscriptionRequest(BaseModel):
    video_url: str
    title: Optional[str] = None
    pastor: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[str] = None

@router.post("/")
async def create_transcription(request: TranscriptionRequest, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    logging.debug(f"Received video_url: {request.video_url}")
    transcription = await Transcription.create(
        user=current_user,
        video_url=request.video_url,
        title=request.title,
        pastor=request.pastor,
        thumbnail=request.thumbnail,
        duration=request.duration,
        status=TranscriptionStatus.PENDING
    )
    
    task = process_video.delay(str(transcription.id), request.video_url)
    
    return {
        "id": transcription.id,
        "status": transcription.status,
        "task_id": task.id
    }

@router.get("/{transcription_id}")
async def get_transcription(transcription_id: str, current_user: User = Depends(get_current_user)):
    transcription = await Transcription.get_or_none(id=transcription_id, user=current_user)
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Record sermon view metric
    await MetricsService.record_sermon_view(current_user, transcription.id)
    
    return {
        "id": transcription.id,
        "video_url": transcription.video_url,
        "title": transcription.title,
        "pastor": transcription.pastor,
        "thumbnail": transcription.thumbnail,
        "duration": transcription.duration,
        "status": transcription.status,
        "transcription_text": transcription.transcription_text,
        "error_message": transcription.error_message,
        "created_at": transcription.created_at,
        "updated_at": transcription.updated_at
    }

@router.get("/")
async def list_transcriptions(current_user: User = Depends(get_current_user)):
    transcriptions = await Transcription.filter(user=current_user)
    return transcriptions


