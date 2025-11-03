# Comprehensive Multi-Faith Study Platform - Feature Roadmap

## Vision

Transform Gabrius from a Christian sermon note-taking app into a comprehensive, multi-faith study platform for teachers, scholars, and faith leaders across traditions.

## Phase 1: Depth Modes ✅ (Implemented)

### Overview
Three depth levels that let users control how detailed their study notes are.

### Depth Levels

**Basic Mode**
- Summary
- Key Points  
- Scripture/Source References
- **Use Case**: Quick reference, sermon prep, teaching outline

**Intermediate Mode** (Default)
- Everything in Basic
- Ethical Insight/Mussar
- Discussion Questions
- Application Points
- **Use Case**: Group study, personal reflection, weekly teaching

**Advanced Mode**
- Everything in Intermediate
- Commentary Layer (Rashi, Talmud, Church Fathers)
- Historical & Linguistic Notes
- Cross-references
- Deep textual analysis
- **Use Case**: Academic study, sermon series, in-depth teaching preparation

### Implementation Status
- ✅ Database schema updated (depth_mode field)
- ✅ API endpoint supports depth_mode parameter
- ✅ Backend processing respects depth modes
- ✅ Frontend service method updated
- ⏳ UI for depth selection (next step)

### Database Migration Needed
```sql
ALTER TABLE studynotes ADD COLUMN depth_mode VARCHAR(20) DEFAULT 'intermediate';
ALTER TABLE users ADD COLUMN preferred_depth_mode VARCHAR(20) DEFAULT 'intermediate';
```

---

## Phase 2: Faith Context System ✅ (Partially Implemented)

### Overview
User-level faith context setting that tailors language, terminology, and content structure.

### Faith Contexts

**Christian**
- Terminology: Pastor, Sermon, Church, Bible
- Sources: Old Testament, New Testament, Church Fathers
- Structure: Traditional sermon format

**Jewish**
- Terminology: Rabbi, Teaching, Synagogue, Torah/Tanakh
- Sources: Torah, Prophets, Writings, Talmud, Midrash, Rashi
- Structure: Parashah-based with commentary layers

### Implementation Status
- ✅ Database schema updated (faith_context field in users table)
- ✅ Enum defined for faith contexts
- ⏳ User profile settings UI
- ⏳ AI prompts adapted per faith context
- ⏳ Terminology mapping system

---

## Phase 3: Textual & Language Tools

### Hebrew/Aramaic Integration

**Translation Toggle**
- Show Hebrew text alongside English
- Transliteration option
- Verse-by-verse toggle

**Root Word Finder**
- Click any Hebrew word to see root
- Show other verses using same root
- Etymology and meaning evolution

**Text Analysis**
- Parallel verse linking
- Textual variants
- Manuscript traditions

### API Integrations

**Sefaria API** (Jewish texts)
- Free, comprehensive Jewish text library
- Torah, Talmud, Midrash, commentaries
- Hebrew and English translations
- Cross-references built-in

**Bible API** (Christian texts)
- Multiple translations
- Cross-references
- Parallel passages

**Quran API** (Muslim texts - Future)
- Multiple translations
- Tafsir (commentary)
- Recitation audio

### Implementation Plan
```typescript
// Example: Sefaria integration
interface SefariaReference {
  ref: string;  // e.g., "Genesis 1:1"
  heText: string;
  text: string;  // English
  commentary: Commentary[];
}

// Auto-link references in transcript
const linkReferences = (text: string) => {
  // Detect patterns like "in Bereshit..." or "Genesis 1:1"
  // Create clickable links to Sefaria/Bible API
};
```

---

## Phase 4: Neutral Branding & Marketing

### Rebrand Positioning

**Current**: "AI-powered sermon note-taking for pastors"

**New**: "AI-powered study companion for Christian and Jewish faith leaders"

### Target Audiences

1. **Christian Pastors** - Sermon preparation and study
2. **Jewish Rabbis** - Torah study and teaching prep
3. **Theology Professors** - Academic research and teaching
4. **Seminary Students** - Study and research tool
5. **Study Group Leaders** - Facilitating discussions

### Marketing Messages

**For Christian Leaders**:
"Transform your sermon prep with AI-powered study notes that extract key points, scriptures, and application from any teaching."

**For Jewish Leaders**:
"Generate comprehensive Torah study notes with commentary layers, historical context, and discussion questions for chavruta study."

**For Scholars**:
"Analyze biblical and rabbinic texts with depth modes from basic summaries to advanced scholarly analysis with cross-references and linguistic notes."

### Website Updates
- Multi-faith imagery
- Diverse testimonials
- Faith-specific landing pages
- Neutral color scheme (not just Christian blue/gold)

---

## Phase 5: Advanced Features

### 1. Collaborative Study
- Share notes with study groups
- Collaborative annotations
- Discussion threads on sections
- Version history

### 2. Personal Notes & Highlights
- Add personal insights to any section
- Highlight important passages
- Tag and categorize notes
- Search across all personal notes

### 3. Cross-Reference Engine
- Automatic cross-reference detection
- Link related teachings
- Build knowledge graph
- "See also" suggestions

### 4. Audio Integration
- Store sermon/teaching audio
- Timestamp synchronization
- Audio bookmarks
- Playback speed control

### 5. Export & Sharing
- PDF export with custom formatting
- Markdown export
- Share via link (public/private)
- Embed in websites

### 6. Mobile Apps
- iOS and Android native apps
- Offline access
- Audio recording
- Voice notes

### 7. AI Enhancements
- Ask questions about the teaching
- Generate additional discussion questions
- Suggest related scriptures
- Summarize in different styles

---

## Technical Architecture

### Database Schema Updates

```sql
-- Users table
ALTER TABLE users ADD COLUMN faith_context VARCHAR(20) DEFAULT 'general';
ALTER TABLE users ADD COLUMN preferred_depth_mode VARCHAR(20) DEFAULT 'intermediate';
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN show_original_language BOOLEAN DEFAULT false;

-- Study Notes table  
ALTER TABLE studynotes ADD COLUMN depth_mode VARCHAR(20) DEFAULT 'intermediate';
ALTER TABLE studynotes ADD COLUMN cross_references JSON;
ALTER TABLE studynotes ADD COLUMN personal_notes JSON;
ALTER TABLE studynotes ADD COLUMN highlights JSON;

-- New tables
CREATE TABLE scripture_references (
  id UUID PRIMARY KEY,
  study_note_id UUID REFERENCES studynotes(id),
  reference_text VARCHAR(255),
  source_api VARCHAR(50),  -- 'sefaria', 'bible_api', etc.
  original_language_text TEXT,
  translation_text TEXT,
  created_at TIMESTAMP
);

CREATE TABLE user_annotations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  study_note_id UUID REFERENCES studynotes(id),
  section_id VARCHAR(100),
  annotation_text TEXT,
  annotation_type VARCHAR(50),  -- 'note', 'highlight', 'question'
  created_at TIMESTAMP
);
```

### API Integrations

**Sefaria API**
```python
import requests

def get_sefaria_text(reference: str):
    url = f"https://www.sefaria.org/api/texts/{reference}"
    response = requests.get(url)
    return response.json()

# Example: get_sefaria_text("Genesis.1.1")
```

**Bible API**
```python
def get_bible_verse(reference: str, translation: str = "ESV"):
    # Use API.Bible or similar
    pass
```

### AI Prompt Templates

**Faith-Aware Prompts**
```python
FAITH_CONTEXT_PROMPTS = {
    "christian": {
        "system": "You are analyzing a Christian sermon. Use terminology like 'pastor', 'church', 'Bible', 'New Testament', 'Old Testament'.",
        "sources": "Reference the Bible, Church Fathers, and Christian theological tradition."
    },
    "jewish": {
        "system": "You are analyzing a Jewish teaching. Use terminology like 'rabbi', 'synagogue', 'Torah', 'Tanakh', 'Talmud'.",
        "sources": "Reference Torah, Prophets, Writings, Talmud, Midrash, and rabbinic commentaries like Rashi."
    }
}

DEPTH_MODE_INSTRUCTIONS = {
    "basic": "Provide only: Summary, Key Points, and Scripture/Source references. Be concise.",
    "intermediate": "Include: Summary, Key Points, Scriptures, Ethical Insights, Discussion Questions, and Application.",
    "advanced": "Provide comprehensive analysis including: All intermediate content PLUS Commentary Layer, Historical/Linguistic Notes, Cross-references, and Deep Textual Analysis."
}
```

---

## Implementation Priority

### Immediate (Week 1-2)
1. ✅ Add depth_mode to database
2. ✅ Update API to accept depth_mode
3. ✅ Modify AI prompts for depth modes
4. ⏳ Create UI for depth selection in regenerate dialog
5. ⏳ Add faith_context to user profile settings

### Short Term (Week 3-4)
1. Integrate Sefaria API for Jewish texts
2. Add Bible API for Christian texts
3. Implement auto-linking of scripture references
4. Create faith-specific landing pages
5. Update branding and marketing materials

### Medium Term (Month 2-3)
1. Hebrew/Aramaic text display
2. Translation toggle functionality
3. Root word finder
4. Cross-reference engine
5. Personal notes and highlights

### Long Term (Month 4-6)
1. Mobile apps (iOS/Android)
2. Collaborative features
3. Audio integration
4. Advanced AI features
5. Muslim/Islamic content support

---

## Success Metrics

### User Engagement
- % of users trying different depth modes
- % of users setting faith context
- Average time spent on study notes
- Number of notes generated per user

### Feature Adoption
- Depth mode distribution (basic/intermediate/advanced)
- Faith context distribution
- API integration usage (Sefaria, Bible API)
- Cross-reference clicks

### Growth Metrics
- New user signups by faith tradition
- User retention by faith context
- Conversion rate by audience segment
- Revenue by user type

---

## Competitive Analysis

### Current Competitors

**Logos Bible Software** (Christian)
- Strengths: Comprehensive library, advanced tools
- Weaknesses: Expensive, complex, Christian-only
- Our Advantage: Multi-faith, AI-powered, simpler UX

**Sefaria** (Jewish)
- Strengths: Free, comprehensive Jewish library
- Weaknesses: No AI features, no note generation
- Our Advantage: AI-generated notes, depth modes, cross-tradition

**Accordance** (Christian/Academic)
- Strengths: Academic rigor, original languages
- Weaknesses: Expensive, steep learning curve
- Our Advantage: AI-powered, easier to use, multi-faith

### Market Opportunity

**Total Addressable Market**:
- Christian pastors/leaders: ~400,000 in US
- Jewish rabbis/educators: ~4,000 in US
- Theology professors/students: ~50,000
- **Total**: ~450,000+ potential users in US alone

**Pricing Strategy**:
- Free tier: Basic mode, 10 notes/month
- Pro tier ($15/month): All depth modes, unlimited notes
- Scholar tier ($30/month): API access, collaboration, advanced features
- Institution tier (custom): Multi-user, admin features

---

## Conclusion

By implementing these features, Gabrius transforms from a niche Christian tool into a comprehensive, multi-faith study platform that serves teachers, scholars, and faith leaders across traditions. The depth mode system provides flexibility for different use cases, while faith context ensures culturally appropriate language and structure.

**Next Steps**:
1. Run database migrations for new fields
2. Update UI to include depth mode selection
3. Add user profile settings for faith context
4. Begin Sefaria API integration
5. Update marketing materials for neutral branding

This positions Gabrius as the leading AI-powered study companion for religious education across traditions.
