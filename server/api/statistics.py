from fastapi import APIRouter, Depends
from models.transcription import Transcription
from models.study_notes import StudyNotes
from models.user import User
from api.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_statistics(current_user: User = Depends(get_current_user)):
    # Get current date and first day of last month
    now = datetime.now()
    first_day_last_month = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
    
    # Get total sermons count
    total_sermons = await Transcription.filter(user=current_user).count()
    last_month_sermons = await Transcription.filter(
        user=current_user,
        created_at__gte=first_day_last_month,
        created_at__lt=now.replace(day=1)
    ).count()
    
    # Get total study notes count
    total_notes = await StudyNotes.filter(user=current_user).count()
    last_month_notes = await StudyNotes.filter(
        user=current_user,
        created_at__gte=first_day_last_month,
        created_at__lt=now.replace(day=1)
    ).count()
    
    return {
        "total_sermons": total_sermons,
        "sermons_last_month": last_month_sermons,
        "total_notes": total_notes,
        "notes_last_month": last_month_notes
    }