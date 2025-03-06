from tortoise import fields, models

class Favorite(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='favorites')
    study_notes = fields.ForeignKeyField('models.StudyNotes', related_name='favorited_by')
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'study_notes')

    def __str__(self):
        return f"Favorite {self.study_notes.transcript.title or 'Untitled'} by {self.user.email}"