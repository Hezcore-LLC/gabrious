# Setup Guide: Multi-Format Study Notes

## Quick Start

Follow these steps to enable the multi-format study notes feature in your application.

## Prerequisites

- Python 3.8+ installed
- Database configured (SQLite or PostgreSQL)
- Server dependencies installed (`pip install -r requirements.txt`)
- Celery worker running
- Azure OpenAI API configured

## Installation Steps

### 1. Run Database Migration

The migration adds new columns to the `studynotes` table.

```bash
cd server
python migrations/add_jewish_format_fields.py
```

**Expected Output:**
```
Starting migration: Adding Jewish format fields to StudyNotes...
✓ Added 'format' column
✓ Added 'main_text' column
✓ Added 'commentary_layer' column
✓ Added 'ethical_insight' column
✓ Added 'historical_notes' column

✅ Migration completed successfully!
```

**If you see errors:**
- "Column already exists" - This is fine, it means the migration was already run
- Connection errors - Check your DATABASE_URL in `.env`
- Permission errors - Ensure you have write access to the database

### 2. Restart Services

After running the migration, restart your services:

```bash
# Stop existing processes (Ctrl+C or kill commands)

# Restart FastAPI server
cd server
uvicorn main:app --reload --port 8000

# In a new terminal, restart Celery worker
cd server
celery -A celery_app worker --loglevel=info

# Optional: Restart Flower (monitoring)
cd server
celery -A celery_app flower --port=5555
```

### 3. Verify Installation

#### Check Database Schema

```bash
# For SQLite
sqlite3 server/db.sqlite3
.schema studynotes
.quit

# You should see the new columns:
# - format
# - main_text
# - commentary_layer
# - ethical_insight
# - historical_notes
```

#### Test API Endpoint

```bash
# Get a study note (replace {id} with actual ID)
curl -X GET "http://localhost:8000/api/study-notes/{id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return JSON with 'format' field
```

#### Test Regeneration

1. Open your application in a browser
2. Navigate to any study notes page
3. Look for the "Regenerate Notes" button
4. Click it and select a format
5. Wait for regeneration to complete

### 4. Frontend Setup

If you're running the frontend separately:

```bash
cd client
npm install  # or yarn install
npm run dev  # or yarn dev
```

The frontend changes are already in the code, no additional setup needed.

## Configuration

### Environment Variables

Ensure these are set in your `server/.env`:

```env
# Azure OpenAI (required for AI generation)
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_DEPLOYMENT_NAME=your_deployment_name
OPENAI_API_VERSION=2023-05-15

# Database
DATABASE_URL=sqlite://db.sqlite3  # or your PostgreSQL URL

# Celery (for background tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Optional: Adjust AI Temperature

In `server/tasks/transcript_processing.py`, you can adjust the AI creativity:

```python
llm = AzureChatOpenAI(
    # ... other params
    temperature=0.3  # Lower = more consistent, Higher = more creative
)
```

- `0.0-0.3`: Very consistent, factual (recommended for study notes)
- `0.4-0.7`: Balanced creativity and consistency
- `0.8-1.0`: More creative, less predictable

## Troubleshooting

### Migration Issues

**Problem:** "Table studynotes does not exist"
```bash
# Solution: Initialize the database first
cd server
python -c "from tortoise import Tortoise; import asyncio; asyncio.run(Tortoise.init(db_url='sqlite://db.sqlite3', modules={'models': ['models']})); asyncio.run(Tortoise.generate_schemas())"
```

**Problem:** "Column already exists"
- This is normal if you've run the migration before
- The migration is idempotent (safe to run multiple times)

### Regeneration Not Working

**Problem:** Clicking "Regenerate" does nothing

Check:
1. **Celery worker running?**
   ```bash
   ps aux | grep celery
   ```

2. **Redis running?** (if using Redis as broker)
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. **Check logs:**
   ```bash
   tail -f server/logs/transcript_processing.log
   ```

**Problem:** "Failed to regenerate study notes"

Check:
1. **Azure OpenAI credentials valid?**
   ```bash
   # Test API connection
   curl https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15 \
     -H "api-key: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```

2. **Content filter issues?**
   - Check logs for "content filter" errors
   - The system uses aggressive sanitization, but some content may still trigger filters
   - Try with different content

### UI Issues

**Problem:** Jewish sections not showing

Check:
1. **Format is actually "jewish"?**
   - Open browser dev tools
   - Check the API response for `"format": "jewish"`

2. **Data exists?**
   - Check if `mainText`, `commentaryLayer`, etc. have content
   - Empty arrays/null values won't display sections

**Problem:** Tabs look wrong

- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

## Testing

### Manual Testing Checklist

- [ ] Migration runs without errors
- [ ] Can view existing study notes
- [ ] "Regenerate Notes" button appears
- [ ] Format dialog opens
- [ ] Can select Christian format
- [ ] Can select Jewish format
- [ ] Regeneration starts (shows toast notification)
- [ ] Page refreshes after regeneration
- [ ] Christian format shows correct sections
- [ ] Jewish format shows additional sections
- [ ] Can switch between formats multiple times
- [ ] Transcript is preserved after regeneration

### Test with Sample Content

**Christian Content:**
- Upload a sermon video from YouTube
- Wait for transcription
- Try regenerating in both formats
- Verify Christian format has good content
- Jewish format should work but may have minimal Jewish-specific sections

**Jewish Content:**
- Upload a Torah study or rabbinic teaching
- Wait for transcription
- Try regenerating in both formats
- Verify Jewish format has rich commentary and historical notes
- Christian format should work but focus on universal themes

## Performance Considerations

### Processing Time

- Short transcript (5-10 min): ~30-60 seconds
- Medium transcript (20-30 min): ~1-2 minutes
- Long transcript (45-60 min): ~3-5 minutes

### Database Size

Each study note with Jewish format adds approximately:
- 2-5 KB for main_text
- 1-3 KB for commentary_layer (JSON)
- 1-2 KB for ethical_insight
- 1-2 KB for historical_notes (JSON)

Total: ~5-12 KB additional per note (minimal impact)

### API Costs

Azure OpenAI costs depend on:
- Token usage (input + output)
- Model used (GPT-3.5 vs GPT-4)
- Frequency of regeneration

Estimate:
- Christian format: ~2,000-5,000 tokens per regeneration
- Jewish format: ~3,000-7,000 tokens per regeneration (more fields)

## Rollback

If you need to rollback the feature:

### 1. Revert Code Changes

```bash
git revert HEAD  # or specific commit
```

### 2. Remove Database Columns (Optional)

```bash
cd server
sqlite3 db.sqlite3

# Remove columns (SQLite doesn't support DROP COLUMN easily)
# Easier to just leave them - they won't cause issues
```

### 3. Restart Services

```bash
# Restart FastAPI and Celery as shown above
```

## Support

For issues or questions:

1. **Check Documentation:**
   - `server/README_MULTI_FORMAT.md` - Technical details
   - `USER_GUIDE_MULTI_FORMAT.md` - User guide
   - `IMPLEMENTATION_SUMMARY.md` - Implementation overview

2. **Check Logs:**
   - `server/logs/transcript_processing.log`
   - Celery worker output
   - Browser console (F12)

3. **Common Issues:**
   - Celery not running → Start Celery worker
   - Redis not running → Start Redis server
   - Azure API errors → Check credentials and quotas
   - Content filter → Check logs for specific triggers

## Next Steps

After successful setup:

1. **Test thoroughly** with various content types
2. **Monitor logs** for any errors or warnings
3. **Gather user feedback** on generated content quality
4. **Adjust AI prompts** if needed for better results
5. **Consider adding more formats** based on user needs

Congratulations! Your multi-format study notes feature is now live! 🎉
