"""Analytics Service — aggregate, compute, and generate insights."""

from datetime import datetime, timedelta
from typing import Optional
from app.models.schemas import AnalyticsSummary
from app.services.ai_service import generate_ai_insights
from supabase import Client


async def get_analytics_summary(
    supabase: Client,
    user_id: str,
    period: str = "7d",
) -> AnalyticsSummary:
    """Aggregate analytics for a user over the given period."""

    # Parse period
    period_map = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}
    days = period_map.get(period, 7)
    since = (datetime.utcnow() - timedelta(days=days)).isoformat()

    # Fetch posts in period
    posts_result = supabase.table("posts") \
        .select("id, platform, published_at") \
        .eq("user_id", user_id) \
        .eq("status", "published") \
        .gte("published_at", since) \
        .execute()

    posts = posts_result.data or []
    post_ids = [p["id"] for p in posts]

    if not post_ids:
        return AnalyticsSummary(
            period=period, total_reach=0, total_engagement=0,
            avg_engagement_rate=0.0, best_platform="N/A",
            best_post_id=None, growth_rate=0.0,
            data_points=[], ai_insights=["Post consistently to start tracking analytics."],
        )

    # Fetch analytics
    analytics_result = supabase.table("analytics") \
        .select("*") \
        .in_("post_id", post_ids) \
        .execute()

    analytics = analytics_result.data or []

    # Aggregate
    total_reach = sum(a.get("reach", 0) for a in analytics)
    total_likes = sum(a.get("likes", 0) for a in analytics)
    total_comments = sum(a.get("comments", 0) for a in analytics)
    total_shares = sum(a.get("shares", 0) for a in analytics)
    total_engagement = total_likes + total_comments + total_shares

    avg_eng_rate = round((total_engagement / max(total_reach, 1)) * 100, 2)

    # Best platform by engagement
    platform_engagement: dict[str, int] = {}
    for post in posts:
        pid = post["id"]
        platform = post.get("platform", "unknown")
        post_analytics = [a for a in analytics if a["post_id"] == pid]
        eng = sum(a.get("likes", 0) + a.get("comments", 0) + a.get("shares", 0) for a in post_analytics)
        platform_engagement[platform] = platform_engagement.get(platform, 0) + eng

    best_platform = max(platform_engagement, key=platform_engagement.get, default="N/A")  # type: ignore

    # Best post
    post_scores = {}
    for a in analytics:
        score = a.get("likes", 0) * 1 + a.get("comments", 0) * 2 + a.get("shares", 0) * 3
        post_scores[a["post_id"]] = post_scores.get(a["post_id"], 0) + score
    best_post_id = max(post_scores, key=post_scores.get, default=None) if post_scores else None  # type: ignore

    # Daily data points
    data_points = []
    for i in range(min(days, 30)):
        day = datetime.utcnow() - timedelta(days=days - 1 - i)
        day_str = day.strftime("%Y-%m-%d")
        day_posts = [p for p in posts if p.get("published_at", "").startswith(day_str)]
        day_ids = [p["id"] for p in day_posts]
        day_analytics = [a for a in analytics if a["post_id"] in day_ids]
        data_points.append({
            "date": day_str,
            "reach": sum(a.get("reach", 0) for a in day_analytics),
            "engagement": sum(a.get("likes", 0) + a.get("comments", 0) for a in day_analytics),
            "posts": len(day_posts),
        })

    # Growth rate (compare first half vs second half of period)
    half = len(data_points) // 2
    first_half_reach = sum(d["reach"] for d in data_points[:half]) if half > 0 else 0
    second_half_reach = sum(d["reach"] for d in data_points[half:]) if half > 0 else 0
    growth_rate = round(
        ((second_half_reach - first_half_reach) / max(first_half_reach, 1)) * 100, 1
    )

    # AI insights
    ai_insights = await generate_ai_insights(data_points)

    return AnalyticsSummary(
        period=period,
        total_reach=total_reach,
        total_engagement=total_engagement,
        avg_engagement_rate=avg_eng_rate,
        best_platform=best_platform,
        best_post_id=best_post_id,
        growth_rate=growth_rate,
        data_points=data_points,
        ai_insights=ai_insights,
    )
