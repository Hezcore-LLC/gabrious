# Multi-Format Study Notes - Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Study Notes Page (page.tsx)                      │  │
│  │                                                          │  │
│  │  [Regenerate Notes Button] ──────────────────────┐      │  │
│  │                                                   │      │  │
│  │  ┌─────────────────────────────────────────┐    │      │  │
│  │  │  Format Selection Dialog                │    │      │  │
│  │  │                                          │    │      │  │
│  │  │  ○ Christian Sermon Format              │    │      │  │
│  │  │    Summary, Key Points, Scriptures...   │    │      │  │
│  │  │                                          │    │      │  │
│  │  │  ○ Jewish Teaching Format               │    │      │  │
│  │  │    Main Text, Commentary, Mussar...     │    │      │  │
│  │  └─────────────────────────────────────────┘    │      │  │
│  │                                                   │      │  │
│  │  Dynamic Tabs (4 or 5 based on format) ◄────────┘      │  │
│  │  ┌──────┬──────┬──────┬──────┬──────┐                  │  │
│  │  │Summary│Main │ Key  │Script│ App  │                  │  │
│  │  │      │Text*│Points│tures │      │                  │  │
│  │  └──────┴──────┴──────┴──────┴──────┘                  │  │
│  │         * Only shown for Jewish format                 │  │
│  │                                                          │  │
│  │  Jewish-Specific Cards (conditional):                  │  │
│  │  ┌────────────────────────────────────┐                │  │
│  │  │ Commentary Layer                   │                │  │
│  │  │ (Rashi, Talmud, Midrash)          │                │  │
│  │  └────────────────────────────────────┘                │  │
│  │  ┌────────────────────────────────────┐                │  │
│  │  │ Ethical Insight (Mussar)           │                │  │
│  │  └────────────────────────────────────┘                │  │
│  │  ┌────────────────────────────────────┐                │  │
│  │  │ Historical & Linguistic Notes      │                │  │
│  │  └────────────────────────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Call
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND SERVICE                           │
│                                                                 │
│  studyNotesService.ts                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ regenerateStudyNotes(notesId, format)                    │  │
│  │   → POST /api/study-notes/{id}/regenerate               │  │
│  │   → Body: { format: "christian" | "jewish" }            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                               │
│                                                                 │
│  study_notes.py                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/study-notes/{id}/regenerate                    │  │
│  │                                                          │  │
│  │ 1. Validate format ("christian" or "jewish")            │  │
│  │ 2. Get existing notes                                   │  │
│  │ 3. Delete old notes                                     │  │
│  │ 4. Update transcription status                          │  │
│  │ 5. Trigger Celery task ──────────────────────┐          │  │
│  └──────────────────────────────────────────────│──────────┘  │
└──────────────────────────────────────────────────│──────────────┘
                                                   │
                                                   │ Celery Task
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND PROCESSING                        │
│                                                                 │
│  transcript_processing.py                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ process_transcript(transcription_id, format)             │  │
│  │                                                          │  │
│  │ 1. Load transcript from database                        │  │
│  │ 2. Sanitize content (remove triggers)                   │  │
│  │ 3. Add theological context                              │  │
│  │ 4. Chunk if needed (large transcripts)                  │  │
│  │                                                          │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Format-Specific Processing                         │  │  │
│  │ │                                                    │  │  │
│  │ │ IF format == "christian":                         │  │  │
│  │ │   ┌─────────────────────────────────────────┐     │  │  │
│  │ │   │ Christian AI Prompt                     │     │  │  │
│  │ │   │ "Analyze theological material..."       │     │  │  │
│  │ │   │ Extract: Summary, Key Points,           │     │  │  │
│  │ │   │          Scriptures, Application        │     │  │  │
│  │ │   └─────────────────────────────────────────┘     │  │  │
│  │ │                                                    │  │  │
│  │ │ IF format == "jewish":                            │  │  │
│  │ │   ┌─────────────────────────────────────────┐     │  │  │
│  │ │   │ Jewish AI Prompt                        │     │  │  │
│  │ │   │ "Analyze Jewish theological material..."│     │  │  │
│  │ │   │ Extract: Main Text, Commentary,         │     │  │  │
│  │ │   │          Mussar, Historical Notes       │     │  │  │
│  │ │   └─────────────────────────────────────────┘     │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ 5. Send to Azure OpenAI ──────────────────────┐          │  │
│  │ 6. Parse structured response                  │          │  │
│  │ 7. Create StudyNotes in database              │          │  │
│  │ 8. Update transcription status to COMPLETED   │          │  │
│  └──────────────────────────────────────────────│──────────┘  │
└──────────────────────────────────────────────────│──────────────┘
                                                   │
                                                   │ API Call
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE OPENAI                               │
│                                                                 │
│  GPT-3.5 / GPT-4                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Receives: Transcript + Format-Specific Prompt           │  │
│  │                                                          │  │
│  │ Generates:                                               │  │
│  │   - Summary                                              │  │
│  │   - Key Points                                           │  │
│  │   - Scripture References                                 │  │
│  │   - Discussion Questions                                 │  │
│  │   - Application Points                                   │  │
│  │                                                          │  │
│  │ IF Jewish Format, also generates:                       │  │
│  │   - Main Text (Parashah)                                │  │
│  │   - Commentary Layer (Rashi, Talmud, etc.)             │  │
│  │   - Ethical Insight (Mussar)                            │  │
│  │   - Historical & Linguistic Notes                       │  │
│  │                                                          │  │
│  │ Returns: Structured JSON matching Pydantic model        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Structured Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                                                                 │
│  StudyNotes Table                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Common Fields (both formats):                            │  │
│  │   - id (UUID)                                            │  │
│  │   - user_id (FK)                                         │  │
│  │   - transcript_id (FK)                                   │  │
│  │   - format (enum: christian/jewish) ◄─── NEW            │  │
│  │   - summary (TEXT)                                       │  │
│  │   - key_points (JSON)                                    │  │
│  │   - scriptures (JSON)                                    │  │
│  │   - discussion_questions (JSON)                          │  │
│  │   - application_points (JSON)                            │  │
│  │   - created_at, updated_at                               │  │
│  │                                                          │  │
│  │ Jewish-Specific Fields:                                  │  │
│  │   - main_text (TEXT) ◄─── NEW                           │  │
│  │   - commentary_layer (JSON) ◄─── NEW                    │  │
│  │   - ethical_insight (TEXT) ◄─── NEW                     │  │
│  │   - historical_notes (JSON) ◄─── NEW                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Christian Format Generation

```
User clicks "Regenerate" → Selects "Christian"
    ↓
API: POST /api/study-notes/123/regenerate { format: "christian" }
    ↓
Backend: Delete old notes, trigger Celery task
    ↓
Celery: Load transcript, sanitize, chunk if needed
    ↓
AI Prompt: "Analyze this sermon and extract Summary, Key Points..."
    ↓
Azure OpenAI: Generates structured response
    ↓
Database: Create StudyNotes with format="christian"
    {
      format: "christian",
      summary: "This sermon discusses...",
      key_points: ["Point 1", "Point 2"],
      scriptures: [{"reference": "John 3:16", "text": "..."}],
      discussion_questions: ["Question 1", "Question 2"],
      application_points: ["Apply 1", "Apply 2"],
      main_text: null,
      commentary_layer: null,
      ethical_insight: null,
      historical_notes: null
    }
    ↓
Frontend: Auto-refresh, display 4 tabs, show Christian sections
```

### Jewish Format Generation

```
User clicks "Regenerate" → Selects "Jewish"
    ↓
API: POST /api/study-notes/123/regenerate { format: "jewish" }
    ↓
Backend: Delete old notes, trigger Celery task
    ↓
Celery: Load transcript, sanitize, chunk if needed
    ↓
AI Prompt: "Analyze this Jewish teaching and extract Main Text, Commentary..."
    ↓
Azure OpenAI: Generates structured response with Jewish-specific fields
    ↓
Database: Create StudyNotes with format="jewish"
    {
      format: "jewish",
      summary: "This teaching explores...",
      main_text: "Parashat Bereshit, Genesis 1:1-2:3...",
      key_points: ["Point 1", "Point 2"],
      scriptures: [{"reference": "Genesis 1:1", "text": "..."}],
      commentary_layer: [
        {"source": "Rashi", "text": "Commentary..."},
        {"source": "Talmud", "text": "Discussion..."}
      ],
      ethical_insight: "Just as God rested...",
      discussion_questions: ["Question 1", "Question 2"],
      application_points: ["Apply 1", "Apply 2"],
      historical_notes: [
        {"term": "Bereshit", "explanation": "From Hebrew root..."}
      ]
    }
    ↓
Frontend: Auto-refresh, display 5 tabs, show all Jewish sections
```

## Component Hierarchy

```
StudyNotesPage
├── Header
│   ├── Back Button
│   └── Title Section
├── Hero Section
│   ├── Metadata (Pastor, Church, Date, Duration)
│   ├── Thumbnail
│   └── Action Buttons
│       ├── Regenerate Button ◄─── NEW
│       ├── Copy Button
│       ├── Print Button
│       ├── Download Button
│       ├── Share Button
│       └── Favorite Button
├── Main Content Grid
│   ├── Left Column (2/3 width)
│   │   ├── Study Notes Card
│   │   │   └── Tabs (dynamic based on format)
│   │   │       ├── Summary Tab
│   │   │       ├── Main Text Tab (Jewish only) ◄─── NEW
│   │   │       ├── Key Points Tab
│   │   │       ├── Scriptures Tab
│   │   │       └── Application Tab
│   │   ├── Discussion Questions Card
│   │   ├── Commentary Card (Jewish only) ◄─── NEW
│   │   ├── Ethical Insight Card (Jewish only) ◄─── NEW
│   │   └── Historical Notes Card (Jewish only) ◄─── NEW
│   └── Right Column (1/3 width)
│       ├── Quick Actions Card
│       └── Tags Card
├── Regenerate Dialog ◄─── NEW
│   ├── Dialog Header
│   ├── Format Options
│   │   ├── Christian Format Button
│   │   └── Jewish Format Button
│   └── Current Format Display
└── Transcript Modal
    ├── Modal Header
    ├── Transcript Content
    └── Modal Footer
```

## File Structure

```
project/
├── server/
│   ├── models/
│   │   └── study_notes.py ◄─── Modified (added format + Jewish fields)
│   ├── api/
│   │   └── study_notes.py ◄─── Modified (added regenerate endpoint)
│   ├── tasks/
│   │   └── transcript_processing.py ◄─── Modified (format-specific processing)
│   ├── migrations/
│   │   └── add_jewish_format_fields.py ◄─── NEW
│   └── README_MULTI_FORMAT.md ◄─── NEW
├── client/
│   ├── lib/
│   │   └── studyNotesService.ts ◄─── Modified (added interfaces + method)
│   └── app/
│       └── study-notes/
│           └── [id]/
│               └── page.tsx ◄─── Modified (added UI components)
├── FEATURES_TODO.md ◄─── Updated
├── IMPLEMENTATION_SUMMARY.md ◄─── NEW
├── USER_GUIDE_MULTI_FORMAT.md ◄─── NEW
├── SETUP_MULTI_FORMAT.md ◄─── NEW
├── FEATURE_COMPLETE.md ◄─── NEW
└── ARCHITECTURE_DIAGRAM.md ◄─── NEW (this file)
```

## Technology Stack

```
Frontend:
  - Next.js 14 (React framework)
  - TypeScript (type safety)
  - Tailwind CSS (styling)
  - shadcn/ui (UI components)
  - Lucide React (icons)

Backend:
  - FastAPI (Python web framework)
  - Tortoise ORM (database)
  - Pydantic (data validation)
  - Celery (background tasks)
  - Redis (task queue)

AI:
  - Azure OpenAI (GPT-3.5/GPT-4)
  - LangChain (AI orchestration)
  - Structured output parsing

Database:
  - SQLite (development)
  - PostgreSQL (production ready)
```

## Security & Performance

```
Security:
  ✓ JWT authentication required for all endpoints
  ✓ User-scoped data (can only regenerate own notes)
  ✓ Input validation with Pydantic
  ✓ Content sanitization to avoid filter triggers
  ✓ SQL injection protection via ORM

Performance:
  ✓ Background processing with Celery (non-blocking)
  ✓ Chunking for large transcripts
  ✓ Efficient database queries with prefetch_related
  ✓ JSON fields for structured data
  ✓ Minimal additional storage (~5-12 KB per note)

Scalability:
  ✓ Stateless API (horizontal scaling)
  ✓ Celery workers can be scaled independently
  ✓ Database supports millions of notes
  ✓ Cloud-ready architecture
```

This architecture provides a solid foundation for the multi-format study notes feature while maintaining flexibility for future enhancements.
