from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from app.core.config import get_settings
from supabase import create_client, Client

settings = get_settings()


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def get_current_user(
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """Validate Supabase JWT and return user dict."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"id": response.user.id, "email": response.user.email, **response.user.user_metadata}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def require_plan(
    min_plan: str = "free",
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """Check user's plan meets minimum requirement."""
    PLAN_ORDER = {"free": 0, "pro": 1, "agency": 2}
    result = supabase.table("users").select("plan").eq("id", current_user["id"]).single().execute()
    user_plan = result.data.get("plan", "free") if result.data else "free"
    if PLAN_ORDER.get(user_plan, 0) < PLAN_ORDER.get(min_plan, 0):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"This feature requires {min_plan} plan or higher",
        )
    return {**current_user, "plan": user_plan}
