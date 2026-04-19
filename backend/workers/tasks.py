"""
Celery Tasks
=============
Background jobs for auto-publishing, analytics fetching, and content recycling.
"""

import logging
from datetime import datetime, timezone, timedelta
from workers.celery_app import celery_app
from app.core.config import get_settings
from app.services.social.manager import publish_to_platform
from supabase import create_client
import asyncio

settings = get_settings()
logger = logging.getLogger(__name__)


def get_supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# ─── Publish Scheduled Post ───────────────────────────────────

@celery_app.task(
    bind=True,
    name="workers.tasks.publish_post_task",
    max_retries=3,
    default_retry_delay=120,
)
def publish_post_task(self, post_id: str, user_id: str):
    """Publish a scheduled post to its target platform."""
    supabase = get_supabase()
    try:
        # Fetch post
        post_result = supabase.table("posts").select("*").eq("id", post_id).single().execute()
        post = post_result.data
        if not post:
            logger.error(f"Post {post_id} not found")
            return

        if post["status"] != "scheduled":
            logger.info(f"Post {post_id} is not scheduled (status: {post['status']}), skipping")
            return

        # Fetch account
        account_result = supabase.table("accounts") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("platform", post["platform"]) \
            .single().execute()

        account = account_result.data
        if not account:
            logger.error(f"No connected {post['platform']} account for user {user_id}")
            supabase.table("posts").update({"status": "failed", "error": "No connected account"}).eq("id", post_id).execute()
            return

        # Publish
        result = run_async(publish_to_platform(
            platform=post["platform"],
            account=account,
            content=post["content"],
            media_urls=[post["media_url"]] if post.get("media_url") else [],
        ))

        if result.success:
            supabase.table("posts").update({
                "status": "published",
                "published_at": datetime.now(timezone.utc).isoformat(),
                "platform_post_id": result.post_id,
            }).eq("id", post_id).execute()
            logger.info(f"Post {post_id} published successfully to {post['platform']}")
        else:
            raise Exception(result.error or "Unknown publish error")

    except Exception as exc:
        logger.error(f"Failed to publish post {post_id}: {exc}")
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            supabase.table("posts").update({
                "status": "failed",
                "error": str(exc),
            }).eq("id", post_id).execute()


# ─── Scheduled Post Sweeper ───────────────────────────────────

@celery_app.task(name="workers.tasks.check_and_publish_scheduled_posts")
def check_and_publish_scheduled_posts():
    """Find posts past their scheduled_at time and trigger publishing."""
    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    result = supabase.table("posts") \
        .select("id, user_id") \
        .eq("status", "scheduled") \
        .lte("scheduled_at", now) \
        .limit(50) \
        .execute()

    posts = result.data or []
    for post in posts:
        publish_post_task.delay(post["id"], post["user_id"])
        logger.info(f"Enqueued post {post['id']} for publishing")

    if posts:
        logger.info(f"Enqueued {len(posts)} overdue posts for publishing")


# ─── Analytics Fetcher ────────────────────────────────────────

@celery_app.task(name="workers.tasks.fetch_all_analytics")
def fetch_all_analytics():
    """Fetch analytics for all published posts from the last 7 days."""
    supabase = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    posts_result = supabase.table("posts") \
        .select("id, user_id, platform, platform_post_id") \
        .eq("status", "published") \
        .gte("published_at", since) \
        .execute()

    posts = posts_result.data or []
    for post in posts:
        if post.get("platform_post_id"):
            fetch_post_analytics_task.delay(post["id"], post["user_id"], post["platform"], post["platform_post_id"])


@celery_app.task(name="workers.tasks.fetch_post_analytics_task")
def fetch_post_analytics_task(post_id: str, user_id: str, platform: str, platform_post_id: str):
    """Fetch and store analytics for a single post."""
    supabase = get_supabase()
    try:
        account_result = supabase.table("accounts") \
            .select("*").eq("user_id", user_id).eq("platform", platform).single().execute()
        account = account_result.data
        if not account:
            return

        from app.services.social.manager import get_platform
        handler = get_platform(platform, account)
        if not handler:
            return

        analytics = run_async(handler.get_post_analytics(platform_post_id))

        supabase.table("analytics").upsert({
            "post_id": post_id,
            "likes": analytics.likes,
            "comments": analytics.comments,
            "shares": analytics.shares,
            "reach": analytics.reach,
            "impressions": analytics.impressions,
            "engagement_rate": analytics.engagement_rate,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="post_id").execute()

    except Exception as e:
        logger.error(f"Analytics fetch failed for post {post_id}: {e}")


# ─── Content Recycler ─────────────────────────────────────────

@celery_app.task(name="workers.tasks.recycle_top_content")
def recycle_top_content():
    """Find top-performing posts (>avg engagement) and reschedule them."""
    supabase = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    analytics_result = supabase.table("analytics") \
        .select("post_id, engagement_rate") \
        .gte("recorded_at", since) \
        .gt("engagement_rate", 8.0) \
        .order("engagement_rate", desc=True) \
        .limit(20) \
        .execute()

    top_analytics = analytics_result.data or []
    recycled = 0

    for item in top_analytics:
        post_result = supabase.table("posts") \
            .select("*").eq("id", item["post_id"]).single().execute()
        post = post_result.data
        if not post:
            continue

        # Schedule a recycled post 3 days from now at optimal time
        scheduled_at = (datetime.now(timezone.utc) + timedelta(days=3)).replace(hour=19, minute=0, second=0)

        supabase.table("posts").insert({
            "user_id": post["user_id"],
            "platform": post["platform"],
            "content": post["content"],
            "media_url": post.get("media_url"),
            "status": "scheduled",
            "scheduled_at": scheduled_at.isoformat(),
            "is_recycled": True,
            "original_post_id": post["id"],
        }).execute()
        recycled += 1

    logger.info(f"Recycled {recycled} top-performing posts")


# ─── WhatsApp Notifier ────────────────────────────────────────

@celery_app.task(name="workers.tasks.notify_via_whatsapp")
def notify_via_whatsapp(user_id: str, notification_type: str, payload: dict):
    """
    Send a WhatsApp notification to a user via Twilio.
    Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in settings.
    """
    supabase = get_supabase()

    # Fetch user's WhatsApp number from their profile
    profile_result = supabase.table("users") \
        .select("whatsapp_number, whatsapp_notifications") \
        .eq("id", user_id).single().execute()
    profile = profile_result.data
    if not profile or not profile.get("whatsapp_number"):
        logger.info(f"No WhatsApp number configured for user {user_id}")
        return

    if notification_type not in (profile.get("whatsapp_notifications") or []):
        logger.info(f"Notification type {notification_type} not enabled for user {user_id}")
        return

    phone = profile["whatsapp_number"]
    message = _build_whatsapp_message(notification_type, payload)

    try:
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_WHATSAPP_FROM]):
            logger.warning("Twilio credentials not configured — WhatsApp not sent")
            return

        from twilio.rest import Client as TwilioClient
        client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
            to=f"whatsapp:{phone}",
            body=message,
        )
        logger.info(f"WhatsApp {notification_type} sent to {phone}")
    except Exception as e:
        logger.error(f"WhatsApp send failed for user {user_id}: {e}")


def _build_whatsapp_message(notification_type: str, payload: dict) -> str:
    """Build a human-readable WhatsApp message body."""
    if notification_type == "scheduled_post":
        platform = payload.get("platform", "social media").title()
        content_preview = payload.get("content", "")[:80]
        scheduled_at = payload.get("scheduled_at", "")
        return (
            f"✅ *Post Scheduled — SocialAI Manager*\n\n"
            f"Platform: {platform}\n"
            f"Scheduled: {scheduled_at}\n\n"
            f"Preview: _{content_preview}..._\n\n"
            f"Manage at socialai.app/calendar"
        )
    elif notification_type == "weekly_report":
        posts = payload.get("posts_published", 0)
        reach = payload.get("total_reach", 0)
        top_platform = payload.get("top_platform", "Instagram")
        return (
            f"📊 *Weekly Report — SocialAI Manager*\n\n"
            f"Posts Published: {posts}\n"
            f"Total Reach: {reach:,}\n"
            f"Top Platform: {top_platform}\n\n"
            f"View full report: socialai.app/analytics"
        )
    elif notification_type == "ai_tips":
        tip = payload.get("tip", "Consistency is the key to social media growth.")
        return (
            f"💡 *AI Growth Tip — SocialAI Manager*\n\n"
            f"{tip}\n\n"
            f"Create content: socialai.app/content-studio"
        )
    else:
        return f"📱 SocialAI Manager notification: {notification_type}"


@celery_app.task(name="workers.tasks.send_weekly_reports")
def send_weekly_reports():
    """Send weekly analytics reports via WhatsApp to opted-in users."""
    supabase = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    users_result = supabase.table("users") \
        .select("id") \
        .execute()
    users = users_result.data or []

    for user in users:
        uid = user["id"]
        posts_result = supabase.table("posts") \
            .select("id, platform") \
            .eq("user_id", uid) \
            .eq("status", "published") \
            .gte("published_at", since) \
            .execute()
        posts = posts_result.data or []
        if not posts:
            continue

        # Aggregate reach
        post_ids = [p["id"] for p in posts]
        analytics_result = supabase.table("analytics") \
            .select("reach") \
            .in_("post_id", post_ids) \
            .execute()
        total_reach = sum(a.get("reach", 0) for a in (analytics_result.data or []))

        # Find top platform
        platform_counts: dict = {}
        for p in posts:
            platform_counts[p["platform"]] = platform_counts.get(p["platform"], 0) + 1
        top_platform = max(platform_counts, key=platform_counts.get) if platform_counts else "Instagram"

        notify_via_whatsapp.delay(uid, "weekly_report", {
            "posts_published": len(posts),
            "total_reach": total_reach,
            "top_platform": top_platform.title(),
        })
