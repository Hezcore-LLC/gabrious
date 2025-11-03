from tortoise import fields, models
from typing import Optional
from passlib.hash import bcrypt
from enum import Enum

class FaithContext(str, Enum):
    CHRISTIAN = "christian"
    JEWISH = "jewish"

class User(models.Model):
    id = fields.UUIDField(pk=True)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    first_name = fields.CharField(max_length=50, null=True)
    last_name = fields.CharField(max_length=50, null=True)
    faith_context = fields.CharEnumField(FaithContext, default=FaithContext.CHRISTIAN, null=True)
    preferred_depth_mode = fields.CharField(max_length=20, default="intermediate", null=True)
    is_active = fields.BooleanField(default=True)
    is_verified = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Helper methods for password management
    def set_password(self, password: str):
        self.password_hash = bcrypt.hash(password)

    def verify_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.password_hash)

    def __str__(self):
        return self.email

    class Meta:
        table = "users"