from tortoise import fields, models
from enum import Enum

class PlanTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"

class SubscriptionPlan(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='subscription')
    plan_tier = fields.CharEnumField(PlanTier, default=PlanTier.FREE)
    storage_limit = fields.IntField(default=1024 * 1024 * 1024)  # Default 1GB in bytes
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan_tier}"

    class Meta:
        table = "subscription_plans"

    @property
    def storage_limit_gb(self) -> float:
        """Return storage limit in GB"""
        return self.storage_limit / (1024 * 1024 * 1024)

    @classmethod
    def get_plan_storage_limit(cls, plan_tier: PlanTier) -> int:
        """Get storage limit in bytes for a plan tier"""
        limits = {
            PlanTier.FREE: 1024 * 1024 * 1024,      # 1GB
            PlanTier.BASIC: 5 * 1024 * 1024 * 1024,  # 5GB
            PlanTier.PREMIUM: 20 * 1024 * 1024 * 1024 # 20GB
        }
        return limits[plan_tier]