from tortoise import fields, models

class Scripture(models.Model):
    id = fields.UUIDField(pk=True)
    study_notes = fields.ForeignKeyField('models.StudyNotes', related_name='scripture_references')
    reference = fields.CharField(max_length=100)  # e.g., "John 3:16"
    text = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return self.reference