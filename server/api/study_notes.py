from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from models.study_notes import StudyNotes
from models.transcription import Transcription

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

@router.post("/")
async def create_study_notes(study_notes: StudyNotesCreate):
    # Get the transcription
    transcript = await Transcription.get_or_none(id=study_notes.transcript_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Create study notes
    notes = await StudyNotes.create(
        transcript=transcript,
        summary=study_notes.summary,
        key_points=study_notes.key_points,
        scriptures=study_notes.scriptures,
        discussion_questions=study_notes.discussion_questions,
        application_points=study_notes.application_points
    )
    
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
async def get_study_notes(notes_id: str):
    notes = await StudyNotes.get_or_none(id=notes_id).prefetch_related('transcript')
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    return {
        "id": str(notes.id),
        "transcriptionId": str(notes.transcript_id),
        "title": notes.transcript.title or "",
        "pastor": notes.transcript.pastor or "",
        "church": "Global",  # This field is not in the model, defaulting to empty string
        "date": notes.created_at.isoformat() if notes.created_at else "",
        "duration": notes.transcript.duration or "",
        "thumbnail": notes.transcript.thumbnail or "",
        "summary": notes.summary,
        "keyPoints": notes.key_points,
        "scriptures": notes.scriptures,
        "discussionQuestions": notes.discussion_questions,
        "applicationPoints": notes.application_points,
        "created_at": notes.created_at.isoformat() if notes.created_at else "",
        "updated_at": notes.updated_at.isoformat() if notes.updated_at else ""
    }

@router.get("/")
async def list_study_notes():
    notes = await StudyNotes.all().prefetch_related('transcript')
    
    result = []
    for note in notes:
        result.append({
            "id": str(note.id),
            "transcriptionId": str(note.transcript_id),
            "title": note.transcript.title or "",
            "pastor": note.transcript.pastor or "",
            "church": "Global",  # This field is not in the model, defaulting to empty string
            "date": note.created_at.isoformat() if note.created_at else "",
            "duration": note.transcript.duration or "",
            "thumbnail": note.transcript.thumbnail or "",
            "summary": note.summary,
            "keyPoints": note.key_points,
            "scriptures": note.scriptures,
            "discussionQuestions": note.discussion_questions,
            "applicationPoints": note.application_points,
            "created_at": note.created_at.isoformat() if note.created_at else "",
            "updated_at": note.updated_at.isoformat() if note.updated_at else ""
        })
    
    return result

@router.delete("/{notes_id}")
async def delete_study_notes(notes_id: str):
    notes = await StudyNotes.get_or_none(id=notes_id)
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    await notes.delete()
    return {"message": "Study notes deleted successfully"}