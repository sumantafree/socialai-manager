from fastapi import APIRouter, Depends, Query
from app.models.schemas import CompetitorAnalysisRequest, CompetitorInsight
from app.services.competitor_service import analyse_competitor
from app.api.deps import get_current_user, get_supabase, require_plan
from supabase import Client
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/competitor", tags=["competitor"])


@router.post("/analyse", response_model=CompetitorInsight)
async def analyse(
    request: CompetitorAnalysisRequest,
    current_user: dict = Depends(require_plan),  # requires any plan
    supabase: Client = Depends(get_supabase),
):
    """Analyse a competitor's content strategy and return actionable insights."""
    insight = await analyse_competitor(
        handle=request.competitor_handle,
        platform=request.platform,
        depth=request.depth,
    )

    # Persist competitor record for user
    supabase.table("competitors").upsert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "platform": request.platform,
        "handle": request.competitor_handle.lstrip("@"),
        "avg_eng_rate": insight.avg_engagement_rate,
        "top_hashtags": insight.top_hashtags,
        "content_gaps": [{"gap": g} for g in insight.content_gaps],
        "last_analysed": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="user_id,platform,handle").execute()

    return insight


@router.get("/saved", response_model=list[dict])
async def saved_competitors(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return all competitors previously analysed by this user."""
    result = supabase.table("competitors") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("last_analysed", desc=True) \
        .execute()
    return result.data or []
