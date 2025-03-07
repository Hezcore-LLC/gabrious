from models.metrics import Metrics, MetricType
from models.user import User
from uuid import UUID

class MetricsService:
    @staticmethod
    async def record_sermon_view(user: User, sermon_id: UUID):
        await Metrics.create(
            user=user,
            metric_type=MetricType.SERMON_VIEW,
            content_id=sermon_id
        )

    @staticmethod
    async def record_study_note_generation(user: User, study_note_id: UUID):
        await Metrics.create(
            user=user,
            metric_type=MetricType.STUDY_NOTE_GENERATION,
            content_id=study_note_id
        )

    @staticmethod
    async def record_favorite_interaction(user: User, study_note_id: UUID):
        await Metrics.create(
            user=user,
            metric_type=MetricType.FAVORITE_INTERACTION,
            content_id=study_note_id
        )

    @staticmethod
    async def get_user_metrics(user: User):
        metrics = await Metrics.filter(user=user).all()
        return metrics