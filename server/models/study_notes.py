from tortoise import fields, models

class StudyNotes(models.Model):
    id = fields.UUIDField(pk=True)
    transcription = fields.ForeignKeyField('models.Transcription', related_name='study_notes')
    title = fields.CharField(max_length=200)
    summary = fields.TextField()
    key_points = fields.JSONField()  # List of key points
    scriptures = fields.JSONField()  # List of scripture references
    discussion_questions = fields.JSONField()  # List of discussion questions
    application_points = fields.JSONField()  # List of application points
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return self.title