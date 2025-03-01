from tortoise import fields, models

class StudyNotes(models.Model):
    id = fields.UUIDField(pk=True)
    transcript = fields.ForeignKeyField('models.Transcription', related_name='study_notes')
    summary = fields.TextField()  # Summary of the sermon
    key_points = fields.JSONField()  # List of key points
    scriptures = fields.JSONField()  # List of scripture references (store as JSON)
    discussion_questions = fields.JSONField()  # Discussion questions
    application_points = fields.JSONField()  # Application points
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"Study Notes for {self.transcript.title or 'Untitled'}"