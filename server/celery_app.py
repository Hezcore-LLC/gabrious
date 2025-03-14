from celery import Celery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Celery app
app = Celery(
    'gabrious',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
)


# Celery Configuration
app.conf.update(
    # Broker settings
    broker_transport_options={'visibility_timeout': 3600},
    broker_connection_retry_on_startup=True,  # Moved here
    result_backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1
)

# Auto-discover tasks
app.autodiscover_tasks(['tasks'], force=True)
