from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models.study_notes import StudyNotes
from models.transcription import Transcription
from models.scripture import Scripture

router = APIRouter()

class ScriptureCreate(BaseModel):
    reference: str
    text: str

class StudyNotesCreate(BaseModel):
    title: str
    content: str
    scriptures: List[ScriptureCreate]

@router.post("/")
async def create_study_notes(study_notes: StudyNotesCreate):
    # Create study notes
    notes = await StudyNotes.create(
        title=study_notes.title,
        content=study_notes.content
    )
    
    # Create associated scriptures
    for scripture in study_notes.scriptures:
        await Scripture.create(
            study_notes=notes,
            reference=scripture.reference,
            text=scripture.text
        )
    
    return {
        "id": notes.id,
        "title": notes.title,
        "content": notes.content,
        "created_at": notes.created_at
    }

@router.get("/{notes_id}")
async def get_study_notes(notes_id: str):
    notes = await StudyNotes.get_or_none(id=notes_id).prefetch_related('scripture_references')
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    scriptures = await notes.scripture_references.all()
    
    return {
        "id": notes.id,
        "title": notes.title,
        "content": notes.content,
        "created_at": notes.created_at,
        "scriptures": [
            {
                "reference": scripture.reference,
                "text": scripture.text
            } for scripture in scriptures
        ]
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