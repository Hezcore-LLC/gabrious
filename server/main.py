from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
import os
from dotenv import load_dotenv
# from celery import app as celery_app

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Gabrious API",
    description="API for sermon transcription and study notes generation",
    version="1.0.0"
)

# Make the app importable
__all__ = ['app']

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Tortoise ORM
register_tortoise(
    app,
    db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
    modules={'models': ['models']},
    generate_schemas=True,
    add_exception_handlers=True,
)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Gabrious API"}

# Import and include API routes
from api import auth, transcription, study_notes, statistics, favorites
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(transcription.router, prefix="/api/transcriptions", tags=["transcription"])
app.include_router(study_notes.router, prefix="/api/study-notes", tags=["study_notes"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["favorites"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)