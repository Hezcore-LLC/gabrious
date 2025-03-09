from fastapi import APIRouter

api_router = APIRouter()

from .transcription import router as transcription_router
from .study_notes import router as study_notes_router
from .auth import router as auth_router
from .statistics import router as statistics_router
from .storage import router as storage_router
from .payment import router as payment_router

api_router.include_router(transcription_router, prefix="/transcriptions", tags=["transcriptions"])
api_router.include_router(study_notes_router, prefix="/study-notes", tags=["study-notes"])
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(statistics_router, prefix="/statistics", tags=["statistics"])
api_router.include_router(storage_router, prefix="/storage", tags=["storage"])
api_router.include_router(payment_router, prefix="/payment", tags=["payment"])