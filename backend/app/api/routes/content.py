from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ContentGenerateRequest, GeneratedContent, BlogConvertRequest, BlogConvertResponse
from app.services.ai_service import generate_content_ai, generate_blog_to_social
from app.api.deps import get_current_user, get_supabase
from supabase import Client

router = APIRouter(prefix="/generate-content", tags=["content"])


def _check_post_limit(user_id: str, supabase: Client) -> None:
    """Enforce monthly post limit for free plan users."""
    user = supabase.table("users").select("plan, posts_this_month").eq("id", user_id).single().execute()
    if not user.data:
        return
    plan = user.data.get("plan", "free")
    used = user.data.get("posts_this_month", 0)
    limits = {"free": 5, "pro": 999999, "agency": 999999}
    if used >= limits.get(plan, 5):
        raise HTTPException(
            status_code=402,
            detail=f"Monthly limit reached for {plan} plan. Upgrade to Pro for unlimited posts.",
        )


@router.post("", response_model=GeneratedContent)
async def generate_content(
    request: ContentGenerateRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Generate AI-powered social media content."""
    _check_post_limit(current_user["id"], supabase)
    content = await generate_content_ai(request)

    # Increment usage counter
    supabase.rpc("increment_post_count", {"user_id": current_user["id"]}).execute()
    return content


blog_router = APIRouter(prefix="/convert-blog", tags=["content"])


@blog_router.post("", response_model=BlogConvertResponse)
async def convert_blog(
    request: BlogConvertRequest,
    current_user: dict = Depends(get_current_user),
):
    """Convert a blog post into social media posts for multiple platforms."""
    posts = await generate_blog_to_social(request.content, request.platforms, request.tone)
    return BlogConvertResponse(posts=posts)
