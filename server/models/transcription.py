from tortoise import fields, models
from enum import Enum
from typing import Optional

class TranscriptionStatus(str, Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    EXTRACTING_AUDIO = "extracting_audio"
    TRANSCRIBING = "transcribing"
    GENERATING_NOTES = "generating_notes"
    COMPLETED = "completed"
    FAILED = "failed"

class Transcription(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='transcriptions')
    video_url = fields.CharField(max_length=500)
    title = fields.CharField(max_length=255, null=True)
    pastor = fields.CharField(max_length=255, null=True)
    thumbnail = fields.CharField(max_length=500, null=True)
    duration = fields.CharField(max_length=50, null=True)
    status = fields.CharEnumField(TranscriptionStatus, default=TranscriptionStatus.PENDING)
    transcription_text = fields.TextField(null=True)
    error_message = fields.TextField(null=True)
    file_size = fields.BigIntField(default=0)  # Size in bytes
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"{self.title or self.video_url} - {self.status}"