# Multi-Format Study Notes Feature

## Overview

The application now supports generating study notes in two different formats to accommodate different religious teaching styles:

1. **Christian Sermon Format** - Traditional sermon study notes
2. **Jewish Teaching Format** - Torah/rabbinic study notes with commentary

## Features

### Christian Format
- **Summary**: Concise overview of the sermon's main message
- **Key Points**: Main takeaways from the sermon
- **Scriptures**: Bible references with full text
- **Discussion Questions**: Questions for group discussion or personal reflection
- **Application Points**: Practical ways to apply the sermon's message

### Jewish Format
All Christian format sections, plus:
- **Main Text (Parashah/Source Text)**: Primary Torah portion, verse, or rabbinic quote referenced
- **Commentary Layer**: Rabbinic insights (Rashi, Talmud, Midrash style)
- **Ethical Insight (Mussar)**: Moral and life reflection takeaway
- **Historical & Linguistic Notes**: Etymology, context, and historical commentary

## Usage

### For Users

1. **View Study Notes**: Navigate to any study notes page
2. **Regenerate**: Click the "Regenerate Notes" button
3. **Choose Format**: Select either Christian or Jewish format
4. **Wait**: The system will regenerate the notes (takes 1-3 minutes)
5. **Refresh**: The page will automatically reload with the new format

### For Developers

#### Backend API

**Regenerate Study Notes**
```http
POST /api/study-notes/{notes_id}/regenerate
Authorization: Bearer {token}
Content-Type: application/json

{
  "format": "jewish"  // or "christian"
}
```

**Response**
```json
{
  "message": "Study notes regeneration started",
  "task_id": "abc123...",
  "format": "jewish",
  "transcription_id": "uuid..."
}
```

#### Database Schema

**New Fields in StudyNotes Model:**
```python
format = fields.CharEnumField(StudyNotesFormat, default=StudyNotesFormat.CHRISTIAN)
main_text = fields.TextField(null=True)
commentary_layer = fields.JSONField(null=True)
ethical_insight = fields.TextField(null=True)
historical_notes = fields.JSONField(null=True)
```

**JSON Structure Examples:**

Commentary Layer:
```json
[
  {
    "source": "Rashi",
    "text": "Commentary text explaining the verse..."
  },
  {
    "source": "Talmud Bavli",
    "text": "Talmudic discussion on this topic..."
  }
]
```

Historical Notes:
```json
[
  {
    "term": "Shabbat",
    "explanation": "From Hebrew root meaning 'to cease' or 'to rest'..."
  }
]
```

#### Processing Logic

The transcript processing task (`process_transcript`) now accepts a `format` parameter:

```python
from tasks.transcript_processing import process_transcript

# Generate Christian format notes
task = process_transcript.delay(str(transcription_id), "christian")

# Generate Jewish format notes
task = process_transcript.delay(str(transcription_id), "jewish")
```

The AI prompts are customized based on the format:
- **Christian**: Focuses on sermon structure, biblical references, and practical application
- **Jewish**: Focuses on Torah/Tanakh references, rabbinic commentary, ethical insights, and historical context

## Migration

To add the new fields to an existing database:

```bash
cd server
python migrations/add_jewish_format_fields.py
```

This will add:
- `format` column (default: "christian")
- `main_text` column
- `commentary_layer` column (JSON)
- `ethical_insight` column
- `historical_notes` column (JSON)

## Frontend Components

### New UI Elements

1. **Regenerate Button**: Primary action button in the hero section
2. **Format Selection Dialog**: Modal with two format options
3. **Jewish-Specific Tabs**: 
   - Main Text tab (only shown for Jewish format)
4. **Jewish-Specific Cards**:
   - Commentary card with rabbinic sources
   - Ethical Insight (Mussar) card
   - Historical & Linguistic Notes card

### TypeScript Interfaces

```typescript
interface Commentary {
  source: string;
  text: string;
}

interface HistoricalNote {
  term: string;
  explanation: string;
}

interface StudyNotes {
  // ... existing fields
  format: "christian" | "jewish";
  mainText?: string;
  commentaryLayer?: Commentary[];
  ethicalInsight?: string;
  historicalNotes?: HistoricalNote[];
}
```

## AI Prompt Engineering

### Christian Format Prompt
```
You are an educational content analyzer specializing in theological material.
Analyze this educational content and extract structured information:
1. Main themes
2. Scripture references
3. Key insights
```

### Jewish Format Prompt
```
You are an educational content analyzer specializing in Jewish theological and rabbinic material.
Analyze this Jewish educational content and extract:
1. Main Torah/Tanakh text references
2. Commentary insights (Rashi, Talmud, Midrash style)
3. Key themes
4. Historical/linguistic notes
```

## Best Practices

### For Content Creators

1. **Choose the Right Format**: 
   - Use Christian format for sermons, Bible studies, devotionals
   - Use Jewish format for Torah studies, rabbinic teachings, Jewish educational content

2. **Regeneration**: You can switch formats at any time without losing the original transcript

3. **Review Generated Content**: AI-generated notes should be reviewed for accuracy, especially for:
   - Scripture references
   - Commentary attributions
   - Historical facts

### For Developers

1. **Error Handling**: The regeneration process deletes old notes and creates new ones. Ensure proper error handling to avoid data loss.

2. **Content Filtering**: Both formats use the same content sanitization to avoid Azure OpenAI content filter triggers.

3. **Chunking**: Large transcripts are processed in chunks. Jewish format processing may take slightly longer due to additional fields.

4. **Testing**: Test with both short and long transcripts in both formats to ensure quality output.

## Troubleshooting

### Notes Not Regenerating
- Check Celery worker is running: `celery -A celery_app worker --loglevel=info`
- Check task status in logs: `tail -f server/logs/transcript_processing.log`
- Verify Azure OpenAI credentials are configured

### Missing Jewish-Specific Sections
- Ensure the transcript contains relevant content (Torah references, rabbinic discussion)
- The AI may not generate sections if the content doesn't warrant them
- Try regenerating if the first attempt doesn't produce expected results

### Content Filter Errors
- The system uses aggressive sanitization for both formats
- If errors persist, check `server/logs/transcript_processing.log` for details
- Consider adjusting sanitization rules in `sanitize_transcript()`

## Future Enhancements

Potential improvements for this feature:

1. **More Formats**: Add formats for other traditions (Islamic, Buddhist, etc.)
2. **Custom Formats**: Allow users to define their own note structures
3. **Format Templates**: Pre-defined templates for specific use cases
4. **Batch Regeneration**: Regenerate multiple notes at once
5. **Format Preview**: Preview what the format will look like before regenerating
6. **Partial Regeneration**: Regenerate only specific sections
7. **Format Comparison**: Side-by-side view of both formats

## Support

For questions or issues:
- Check the main README.md for general setup
- Review server logs in `server/logs/`
- Check Celery worker status
- Verify database migrations ran successfully
