from tortoise import fields, models
from enum import Enum

class MetricType(str, Enum):
    SERMON_VIEW = "sermon_view"
    STUDY_NOTE_GENERATION = "study_note_generation"
    FAVORITE_INTERACTION = "favorite_interaction"

class Metrics(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='metrics')
    metric_type = fields.CharEnumField(MetricType)
    content_id = fields.UUIDField()  # ID of the related content (sermon, study note, etc.)
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.metric_type} by {self.user.email}"

    class Meta:
        table = "metrics"