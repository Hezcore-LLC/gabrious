from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from models.study_notes import StudyNotes
from models.transcription import Transcription, TranscriptionStatus
from models.user import User
from api.auth import get_current_user
from services.metrics import MetricsService
from tasks.transcript_processing import process_transcript

router = APIRouter()

class ScriptureItem(BaseModel):
    reference: str
    text: str

class StudyNotesCreate(BaseModel):
    transcript_id: str
    summary: str
    key_points: List[str]
    scriptures: List[Dict[str, str]]
    discussion_questions: List[str]
    application_points: List[str]
    format: Optional[str] = "christian"

class RegenerateStudyNotesRequest(BaseModel):
    format: str = "christian"  # "christian" or "jewish"

@router.post("/")
async def create_study_notes(study_notes: StudyNotesCreate, current_user: User = Depends(get_current_user)):
    # Get the transcription
    transcript = await Transcription.get_or_none(id=study_notes.transcript_id, user=current_user)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Create study notes
    notes = await StudyNotes.create(
        user=current_user,
        transcript=transcript,
        summary=study_notes.summary,
        key_points=study_notes.key_points,
        scriptures=study_notes.scriptures,
        discussion_questions=study_notes.discussion_questions,
        application_points=study_notes.application_points
    )
    
    # Record study note generation metric
    await MetricsService.record_study_note_generation(current_user, notes.id)
    
    return {
        "id": notes.id,
        "transcript_id": str(notes.transcript_id),
        "summary": notes.summary,
        "key_points": notes.key_points,
        "scriptures": notes.scriptures,
        "discussion_questions": notes.discussion_questions,
        "application_points": notes.application_points,
        "created_at": notes.created_at
    }

@router.get("/{notes_id}")
async def get_study_notes(notes_id: str, current_user: User = Depends(get_current_user)):
    notes = await StudyNotes.get_or_none(id=notes_id, user=current_user).prefetch_related('transcript')
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    result = {
        "id": str(notes.id),
        "transcriptionId": str(notes.transcript_id),
        "title": notes.transcript.title or "",
        "pastor": notes.transcript.pastor or "",
        "church": "Global",
        "date": notes.created_at.isoformat() if notes.created_at else "",
        "duration": notes.transcript.duration or "",
        "thumbnail": notes.transcript.thumbnail or "",
        "videoUrl": notes.transcript.video_url or "",
        "format": notes.format,
        "summary": notes.summary,
        "keyPoints": notes.key_points,
        "scriptures": notes.scriptures,
        "discussionQuestions": notes.discussion_questions,
        "applicationPoints": notes.application_points,
        "created_at": notes.created_at.isoformat() if notes.created_at else "",
        "updated_at": notes.updated_at.isoformat() if notes.updated_at else ""
    }
    
    # Add Jewish-specific fields if applicable
    if notes.format == "jewish":
        result.update({
            "mainText": notes.main_text,
            "commentaryLayer": notes.commentary_layer,
            "ethicalInsight": notes.ethical_insight,
            "historicalNotes": notes.historical_notes
        })
    
    return result

@router.get("/")
async def list_study_notes(current_user: User = Depends(get_current_user)):
    notes = await StudyNotes.filter(user=current_user).prefetch_related('transcript')
    
    result = []
    for note in notes:
        note_dict = {
            "id": str(note.id),
            "transcriptionId": str(note.transcript_id),
            "title": note.transcript.title or "",
            "pastor": note.transcript.pastor or "",
            "church": "Global",
            "date": note.created_at.isoformat() if note.created_at else "",
            "duration": note.transcript.duration or "",
            "thumbnail": note.transcript.thumbnail or "",
            "videoUrl": note.transcript.video_url or "",
            "format": note.format,
            "summary": note.summary,
            "keyPoints": note.key_points,
            "scriptures": note.scriptures,
            "discussionQuestions": note.discussion_questions,
            "applicationPoints": note.application_points,
            "created_at": note.created_at.isoformat() if note.created_at else "",
            "updated_at": note.updated_at.isoformat() if note.updated_at else ""
        }
        
        # Add Jewish-specific fields if applicable
        if note.format == "jewish":
            note_dict.update({
                "mainText": note.main_text,
                "commentaryLayer": note.commentary_layer,
                "ethicalInsight": note.ethical_insight,
                "historicalNotes": note.historical_notes
            })
        
        result.append(note_dict)
    
    return result

@router.post("/{notes_id}/regenerate")
async def regenerate_study_notes(
    notes_id: str, 
    request: RegenerateStudyNotesRequest,
    current_user: User = Depends(get_current_user)
):
    """Regenerate study notes with a different format (Christian or Jewish)"""
    notes = await StudyNotes.get_or_none(id=notes_id, user=current_user).prefetch_related('transcript')
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    # Validate format
    if request.format not in ["christian", "jewish"]:
        raise HTTPException(status_code=400, detail="Invalid format. Must be 'christian' or 'jewish'")
    
    # Delete the old notes
    transcript_id = notes.transcript_id
    await notes.delete()
    
    # Update transcription status
    transcription = await Transcription.get(id=transcript_id)
    transcription.status = TranscriptionStatus.GENERATING_NOTES
    await transcription.save()
    
    # Trigger regeneration with the new format
    task = process_transcript.delay(str(transcript_id), request.format)
    
    return {
        "message": "Study notes regeneration started",
        "task_id": task.id,
        "format": request.format,
        "transcription_id": str(transcript_id)
    }

@router.delete("/{notes_id}")
async def delete_study_notes(notes_id: str, current_user: User = Depends(get_current_user)):
    notes = await StudyNotes.get_or_none(id=notes_id, user=current_user)
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    await notes.delete()
    return {"message": "Study notes deleted successfully"}