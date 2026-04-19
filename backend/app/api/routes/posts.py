from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.schemas import PostCreate, PostUpdate, PostResponse
from app.api.deps import get_current_user, get_supabase
from app.workers.tasks import publish_post_task
from supabase import Client
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/posts", tags=["posts"])
schedule_router = APIRouter(prefix="/schedule-post", tags=["posts"])


@router.get("", response_model=list[PostResponse])
async def get_posts(
    status: str | None = Query(None),
    platform: str | None = Query(None),
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("posts").select("*").eq("user_id", current_user["id"])
    if status:
        query = query.eq("status", status)
    if platform:
        query = query.eq("platform", platform)
    result = query.order("scheduled_at", desc=True).limit(limit).execute()
    return result.data or []


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("posts").select("*").eq("id", post_id).eq("user_id", current_user["id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data


@schedule_router.post("", response_model=PostResponse)
async def schedule_post(
    request: PostCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    post_data = {
        "id": post_id,
        "user_id": current_user["id"],
        "platform": request.platform,
        "content": request.content,
        "media_url": request.media_url,
        "status": "scheduled",
        "scheduled_at": request.scheduled_at.isoformat(),
        "created_at": now.isoformat(),
    }
    result = supabase.table("posts").insert(post_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save post")

    # Enqueue Celery task with ETA
    eta_seconds = max(0, (request.scheduled_at.replace(tzinfo=timezone.utc) - now).total_seconds())
    publish_post_task.apply_async(
        args=[post_id, current_user["id"]],
        countdown=int(eta_seconds),
    )

    return result.data[0]


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    request: PostUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    updates = request.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("posts").update(updates).eq("id", post_id).eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data[0]


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("posts").delete().eq("id", post_id).eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}
