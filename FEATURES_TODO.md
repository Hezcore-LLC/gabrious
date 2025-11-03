# Features To Implement

## ✅ COMPLETED: Multi-Format Study Notes (Christian & Jewish)

### Status: Implemented

### Description

The application now supports generating study notes in two different formats:

1. **Christian Sermon Format** - Traditional sermon study notes with Summary, Key Points, Scriptures, and Application
2. **Jewish Teaching Format** - Torah/rabbinic study notes with Main Text (Parashah), Commentary Layer, Ethical Insight (Mussar), Historical Notes, and Discussion Questions for chavruta study

### Implementation Details

**Backend:**

- Extended `StudyNotes` model with format field and Jewish-specific fields (main_text, commentary_layer, ethical_insight, historical_notes)
- Updated transcript processing to support both formats with specialized prompts
- Added `/api/study-notes/{id}/regenerate` endpoint to regenerate notes in a different format
- Created Pydantic models for both `SermonStudyNotes` and `JewishStudyNotes`

**Frontend:**

- Added "Regenerate Notes" button with format selection dialog
- Dynamic tab layout that shows Jewish-specific sections when applicable
- New sections: Main Text, Commentary, Ethical Insight (Mussar), Historical & Linguistic Notes
- Updated TypeScript interfaces to support both formats

**Database Migration:**

- Migration script created at `server/migrations/add_jewish_format_fields.py`
- Adds: format, main_text, commentary_layer, ethical_insight, historical_notes columns

### Usage

Users can click "Regenerate Notes" on any study notes page and choose between:

- **Christian Format**: Summary, Key Points, Scriptures, Application Points, Discussion Questions
- **Jewish Format**: Summary, Main Text (Parashah/Source), Key Points, Scriptures, Commentary Layer (Rashi, Talmud, Midrash), Ethical Insight (Mussar), Discussion Questions (for chavruta), Application Points, Historical & Linguistic Notes

---

## Audio File Storage and Playback

### Priority: Medium-High

### Description

Currently, the application downloads audio from videos, transcribes them, and then deletes the audio files. Users cannot listen to the original sermon audio directly from the Study Notes page.

### Why This Feature Matters

This is an **important feature** for several reasons:

1. **User Experience**: Users may want to listen to the sermon while reading the study notes, allowing them to:

   - Hear the pastor's tone and emphasis
   - Follow along with the transcript
   - Review specific sections they found interesting
   - Share the audio with others who prefer listening

2. **Accessibility**: Some users prefer audio content over reading, making this crucial for:

   - Users with visual impairments
   - Users who want to listen while commuting or doing other activities
   - Multi-modal learning (reading + listening)

3. **Value Proposition**: Having both transcript AND audio makes the app more valuable than just having text notes

4. **Competitive Advantage**: Most note-taking apps don't provide the original audio alongside notes

### Current Implementation

- Audio files are downloaded to temporary directory as `{transcription_id}.mp3`
- Files are optimized (mono, 16kHz, 24kbps) to reduce size
- Files are **deleted** after transcription completes
- Only the `video_url` (YouTube link) is stored

### Proposed Implementation

#### Backend Changes

1. **Database Schema Update**

   ```python
   # Add to Transcription model (server/models/transcription.py)
   audio_file_path = fields.CharField(max_length=500, null=True)
   audio_file_url = fields.CharField(max_length=500, null=True)
   ```

2. **Storage Options** (Choose one):

   **Option A: Local File Storage**

   - Store audio files in a persistent directory (e.g., `storage/audio/`)
   - Serve files through FastAPI static file endpoint
   - Pros: Simple, no external dependencies
   - Cons: Doesn't scale well, backup complexity

   **Option B: Cloud Storage (Recommended)**

   - Upload to AWS S3, Azure Blob Storage, or Google Cloud Storage
   - Store the public URL in the database
   - Pros: Scalable, reliable, CDN support
   - Cons: Additional cost, requires cloud account setup

   **Option C: Hybrid Approach**

   - Store locally initially
   - Optionally move to cloud storage for premium users
   - Pros: Flexible, cost-effective for small scale
   - Cons: More complex implementation

3. **API Endpoint**

   ```python
   # Add to server/api/transcription.py
   @router.get("/{transcription_id}/audio")
   async def get_audio_file(transcription_id: str, current_user: User = Depends(get_current_user)):
       """Stream or redirect to audio file"""
       # Return audio file or signed URL
   ```

4. **Video Processing Update**
   ```python
   # Modify server/tasks/video_processing.py
   # Instead of: os.remove(audio_file)
   # Do: Store file and save path/URL to database
   ```

#### Frontend Changes

1. **Audio Player Component**

   - Add HTML5 audio player to Study Notes page
   - Features:
     - Play/pause controls
     - Seek bar with timestamps
     - Playback speed control (0.5x, 1x, 1.5x, 2x)
     - Volume control
     - Download button

2. **UI Integration**

   - Add audio player in the sidebar "Quick Actions" card
   - Show audio duration and file size
   - Display loading state while audio loads
   - Handle errors gracefully (e.g., file not found)

3. **Service Method**
   ```typescript
   // Add to client/lib/studyNotesService.ts
   getAudioUrl: async (transcriptionId: string): Promise<string> => {
     // Fetch audio URL from API
   };
   ```

### Storage Considerations

**File Size Estimates:**

- 1 hour sermon ≈ 10-15 MB (optimized)
- 100 sermons ≈ 1-1.5 GB
- 1000 sermons ≈ 10-15 GB

**Cost Estimates (AWS S3):**

- Storage: ~$0.023 per GB/month
- 1000 sermons: ~$0.35/month storage
- Data transfer: ~$0.09 per GB (first 10TB)
- Bandwidth costs will be the main expense

### Implementation Steps

1. [ ] Choose storage solution (local vs cloud)
2. [ ] Update Transcription model with audio file fields
3. [ ] Create database migration
4. [ ] Modify video processing to save audio files
5. [ ] Implement audio file API endpoint
6. [ ] Add audio player component to frontend
7. [ ] Update Study Notes page UI
8. [ ] Add audio file management (cleanup old files, etc.)
9. [ ] Test with various audio lengths and formats
10. [ ] Add analytics to track audio playback usage

### Alternative: Link to Original Video

**Lower Priority Alternative:**
Instead of storing audio, provide a direct link to the original YouTube video with timestamp support. This:

- Requires no storage
- Always has the latest version
- May have ads or be removed
- Requires internet connection

This could be implemented as a quick win while planning the full audio storage feature.

### Recommendation

**Implement this feature in Phase 2** after core functionality is stable. It's important but not critical for MVP. Start with the "Link to Original Video" alternative as a quick win, then implement full audio storage based on user feedback and usage patterns.

### Related Features to Consider

- Timestamp synchronization between audio and transcript
- Audio bookmarking (save favorite moments)
- Audio sharing (generate shareable links)
- Offline audio download for mobile apps
- Audio quality selection (low/medium/high)
