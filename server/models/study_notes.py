from tortoise import fields, models
from enum import Enum

class StudyNotesFormat(str, Enum):
    CHRISTIAN = "christian"
    JEWISH = "jewish"

class DepthMode(str, Enum):
    BASIC = "basic"  # Summary + Key Points + Scriptures
    INTERMEDIATE = "intermediate"  # + Ethical Insight + Discussion Questions
    ADVANCED = "advanced"  # + Commentary + Historical Notes + Cross-references

class StudyNotes(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='study_notes')
    transcript = fields.ForeignKeyField('models.Transcription', related_name='study_notes')
    format = fields.CharEnumField(StudyNotesFormat, default=StudyNotesFormat.CHRISTIAN)
    
    # Common fields
    summary = fields.TextField()  # Summary of the sermon/teaching
    key_points = fields.JSONField()  # List of key points
    scriptures = fields.JSONField()  # List of scripture references (store as JSON)
    discussion_questions = fields.JSONField()  # Discussion questions
    application_points = fields.JSONField()  # Application points
    
    # Jewish format specific fields
    main_text = fields.TextField(null=True)  # Parashah or Source Text
    commentary_layer = fields.JSONField(null=True)  # Commentary-style notes (Rashi, Talmudic, etc.)
    ethical_insight = fields.TextField(null=True)  # Mussar / Takeaway
    historical_notes = fields.JSONField(null=True)  # Etymology, context, historical commentary
    
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"Study Notes for {self.transcript.title or 'Untitled'}"