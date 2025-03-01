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
        "id": notes.id,
        "transcript_id": str(notes.transcript_id),
        "summary": notes.summary,
        "key_points": notes.key_points,
        "scriptures": notes.scriptures,
        "discussion_questions": notes.discussion_questions,
        "application_points": notes.application_points,
        "created_at": notes.created_at
    }

@router.get("/")
async def list_study_notes():
    notes = await StudyNotes.all()
    return notes

@router.delete("/{notes_id}")
async def delete_study_notes(notes_id: str):
    notes = await StudyNotes.get_or_none(id=notes_id)
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    await notes.delete()
    return {"message": "Study notes deleted successfully"}