from fastapi import APIRouter, Depends, Query
from app.models.schemas import AnalyticsSummary
from app.services.analytics_service import get_analytics_summary
from app.api.deps import get_current_user, get_supabase
from supabase import Client

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsSummary)
async def analytics(
    period: str = Query("7d", pattern="^(1d|7d|30d|90d)$"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    return await get_analytics_summary(supabase, current_user["id"], period)


@router.get("/post/{post_id}")
async def post_analytics(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("analytics").select("*").eq("post_id", post_id).execute()
    return {"post_id": post_id, "data": result.data or []}
