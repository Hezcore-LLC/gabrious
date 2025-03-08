from typing import Optional
from models.transcription import Transcription
from models.subscription import SubscriptionPlan, PlanTier

class StorageService:
    @staticmethod
    async def get_user_storage_usage(user_id: str) -> int:
        """Calculate total storage usage for a user in bytes"""
        transcriptions = await Transcription.filter(user_id=user_id)
        return sum(t.file_size for t in transcriptions)

    @staticmethod
    async def check_storage_limit(user_id: str, additional_size: int = 0) -> bool:
        """Check if user has enough storage space for additional content"""
        subscription = await SubscriptionPlan.get_or_none(user_id=user_id)
        if not subscription:
            return False

        current_usage = await StorageService.get_user_storage_usage(user_id)
        storage_limit = subscription.storage_limit

        return (current_usage + additional_size) <= storage_limit

    @staticmethod
    async def get_storage_stats(user_id: str) -> dict:
        """Get storage statistics for a user"""
        subscription = await SubscriptionPlan.get_or_none(user_id=user_id)
        if not subscription:
            return {
                "used": 0,
                "total": 0,
                "percentage": 0
            }

        used_storage = await StorageService.get_user_storage_usage(user_id)
        total_storage = subscription.storage_limit
        percentage = (used_storage / total_storage * 100) if total_storage > 0 else 0

        return {
            "used": used_storage,
            "total": total_storage,
            "percentage": round(percentage, 2)
        }