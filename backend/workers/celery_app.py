"""
Celery Application Configuration
===================================
Starts the Celery worker:
  celery -A workers.celery_app worker --loglevel=info
Start beat (periodic tasks):
  celery -A workers.celery_app beat --loglevel=info
"""

from celery import Celery
from celery.schedules import crontab
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "socialai_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
    # Retry config
    task_max_retries=3,
    task_default_retry_delay=60,
    # Rate limits
    task_annotations={
        "workers.tasks.publish_post_task": {"rate_limit": "10/m"},
        "workers.tasks.fetch_analytics_task": {"rate_limit": "30/m"},
    },
)

# ─── Periodic Tasks (Beat) ────────────────────────────────────
celery_app.conf.beat_schedule = {
    # Check for posts to publish every minute
    "check-scheduled-posts": {
        "task": "workers.tasks.check_and_publish_scheduled_posts",
        "schedule": crontab(minute="*"),  # every minute
    },
    # Fetch analytics for published posts every hour
    "fetch-post-analytics": {
        "task": "workers.tasks.fetch_all_analytics",
        "schedule": crontab(minute=0),  # every hour
    },
    # Recycle top content weekly
    "recycle-top-content": {
        "task": "workers.tasks.recycle_top_content",
        "schedule": crontab(day_of_week="monday", hour=9, minute=0),
    },
    # Send weekly WhatsApp reports every Monday at 8 AM
    "send-weekly-reports": {
        "task": "workers.tasks.send_weekly_reports",
        "schedule": crontab(day_of_week="monday", hour=8, minute=0),
    },
}
