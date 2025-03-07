from fastapi import APIRouter, HTTPException, Depends
from models.favorite import Favorite
from models.study_notes import StudyNotes
from models.user import User
from api.auth import get_current_user
from services.metrics import MetricsService

router = APIRouter()

@router.post("/{notes_id}")
async def add_to_favorites(notes_id: str, current_user: User = Depends(get_current_user)):
    # Check if the study notes exist
    notes = await StudyNotes.get_or_none(id=notes_id)
    if not notes:
        raise HTTPException(status_code=404, detail="Study notes not found")
    
    # Check if already favorited
    existing = await Favorite.get_or_none(user=current_user, study_notes=notes)
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    # Add to favorites
    favorite = await Favorite.create(user=current_user, study_notes=notes)
    
    # Record favorite interaction metric
    await MetricsService.record_favorite_interaction(current_user, notes.id)
    
    return {"message": "Added to favorites successfully"}

@router.delete("/{notes_id}")
async def remove_from_favorites(notes_id: str, current_user: User = Depends(get_current_user)):
    # Check if the favorite exists
    favorite = await Favorite.get_or_none(study_notes_id=notes_id, user=current_user)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # Remove from favorites
    await favorite.delete()
    return {"message": "Removed from favorites successfully"}

@router.get("/")
async def list_favorites(current_user: User = Depends(get_current_user)):
    favorites = await Favorite.filter(user=current_user).prefetch_related('study_notes__transcript')
    
    result = []
    for favorite in favorites:
        note = favorite.study_notes
        result.append({
            "id": str(note.id),
            "transcriptionId": str(note.transcript_id),
            "title": note.transcript.title or "",
            "pastor": note.transcript.pastor or "",
            "church": "Global",
            "date": note.created_at.isoformat() if note.created_at else "",
            "duration": note.transcript.duration or "",
            "thumbnail": note.transcript.thumbnail or "",
            "summary": note.summary,
            "keyPoints": note.key_points,
            "scriptures": note.scriptures,
            "discussionQuestions": note.discussion_questions,
            "applicationPoints": note.application_points,
            "created_at": note.created_at.isoformat() if note.created_at else "",
            "updated_at": note.updated_at.isoformat() if note.updated_at else "",
            "favorited_at": favorite.created_at.isoformat()
        })
    
    return result