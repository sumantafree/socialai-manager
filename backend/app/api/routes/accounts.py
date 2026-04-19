from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import AccountConnect, AccountResponse
from app.api.deps import get_current_user, get_supabase
from app.core.config import get_settings
from supabase import Client
import httpx
import uuid
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/accounts", tags=["accounts"])
connect_router = APIRouter(prefix="/connect-account", tags=["accounts"])
settings = get_settings()

OAUTH_CONFIGS = {
    "twitter": {
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "client_id": settings.TWITTER_API_KEY,
        "client_secret": settings.TWITTER_API_SECRET,
    },
    "linkedin": {
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "client_secret": settings.LINKEDIN_CLIENT_SECRET,
    },
    "youtube": {
        "token_url": "https://oauth2.googleapis.com/token",
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
    },
    "instagram": {
        "token_url": "https://api.instagram.com/oauth/access_token",
        "client_id": settings.INSTAGRAM_APP_ID,
        "client_secret": settings.INSTAGRAM_APP_SECRET,
    },
    "facebook": {
        "token_url": "https://graph.facebook.com/v21.0/oauth/access_token",
        "client_id": settings.FACEBOOK_APP_ID,
        "client_secret": settings.FACEBOOK_APP_SECRET,
    },
}


@router.get("", response_model=list[AccountResponse])
async def list_accounts(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("accounts").select("*").eq("user_id", current_user["id"]).execute()
    accounts = result.data or []
    return [
        AccountResponse(
            id=a["id"],
            platform=a["platform"],
            handle=a.get("handle", ""),
            display_name=a.get("display_name"),
            followers=a.get("followers"),
            profile_image=a.get("profile_image"),
            connected=True,
            expires_at=a.get("expires_at"),
        )
        for a in accounts
    ]


@connect_router.post("")
async def connect_account(
    request: AccountConnect,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Exchange OAuth code for access token and store account."""
    config = OAUTH_CONFIGS.get(request.platform)
    if not config:
        raise HTTPException(status_code=400, detail=f"Platform '{request.platform}' not supported")

    # Exchange code for token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config["token_url"],
                data={
                    "code": request.code,
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "redirect_uri": request.redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            token_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to exchange token: {e}")

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in response")

    expires_in = token_data.get("expires_in", 3600)
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()

    account_data = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "platform": request.platform,
        "access_token": access_token,
        "refresh_token": token_data.get("refresh_token"),
        "expires_at": expires_at,
        "extra_data": token_data,
        "connected": True,
    }
    result = supabase.table("accounts").upsert(account_data, on_conflict="user_id,platform").execute()
    return {"success": True, "platform": request.platform}


@router.delete("/{account_id}")
async def disconnect_account(
    account_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    supabase.table("accounts").delete().eq("id", account_id).eq("user_id", current_user["id"]).execute()
    return {"message": "Account disconnected"}
