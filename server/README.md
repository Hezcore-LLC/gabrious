# Gabrious Server

This is the backend server for Gabrious, a sermon transcription and study notes generation service.

## Project Structure

```
app/
├── main.py                # FastAPI app instance
├── models/                # Database models
├── tasks/                 # Celery task definitions
├── services/             # Azure integrations (speech-to-text, AI)
├── api/                  # API routes and controllers
├── core/                 # Configs, logging, settings
└── static/               # Static files (if needed)

celery.py                 # Celery app initialization
Dockerfile                # Docker setup
requirements.txt          # Python dependencies
README.md                 # Project documentation
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
- Create a `.env` file in the root directory
- Add required environment variables:
  ```
  DATABASE_URL=your_database_url
  REDIS_URL=your_redis_url
  AZURE_SPEECH_KEY=your_azure_key
  AZURE_SPEECH_REGION=your_azure_region
  ```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

4. Run Celery worker:
```bash
celery -A celery worker --loglevel=info
```

## API Routes

### Transcription Endpoints

#### Create Transcription
```
POST /api/transcriptions

Request Body:
{
    "video_url": "string",    # URL of the video to transcribe
    "title": "string"        # Optional title for the transcription
}

Response:
{
    "id": "uuid",
    "video_url": "string",
    "status": "string",      # PENDING, DOWNLOADING, TRANSCRIBING, etc.
    "created_at": "datetime"
}
```

#### Get Transcription Status
```
GET /api/transcriptions/{transcription_id}

Response:
{
    "id": "uuid",
    "video_url": "string",
    "status": "string",
    "transcription_text": "string",  # Available when status is COMPLETED
    "error_message": "string",      # Available when status is FAILED
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### Study Notes Endpoints

#### Get Study Notes
```
GET /api/study-notes/{transcription_id}

Response:
{
    "id": "uuid",
    "transcription_id": "uuid",
    "title": "string",
    "summary": "string",
    "key_points": ["string"],
    "scriptures": [
        {
            "reference": "string",
            "text": "string"
        }
    ],
    "discussion_questions": ["string"],
    "application_points": ["string"],
    "created_at": "datetime"
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- Video/Audio transcription using Azure Speech-to-Text
- Study notes generation
- Asynchronous task processing with Celery
- RESTful API with FastAPI