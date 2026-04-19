"""
Admin API Routes
=================
All endpoints are protected by require_admin dependency.
Prefix: /admin
"""

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import FileResponse
from supabase import Client
from typing import Optional
import time
import os

from app.api.deps import get_supabase, get_current_user
from app.services.audit_service import log_admin_action, log_error
from app.services.stripe_service import (
    create_checkout_session, construct_webhook_event,
    create_billing_portal_session
)
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_ROLES = {"admin", "superadmin"}


# ─── Admin Guard ──────────────────────────────────────────────

async def require_admin(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    result = supabase.table("users").select("role, blocked").eq("id", current_user["id"]).single().execute()
    row = result.data or {}
    if row.get("blocked"):
        raise HTTPException(403, "Account blocked")
    if row.get("role") not in ADMIN_ROLES:
        raise HTTPException(403, "Admin access required")
    return {**current_user, "role": row["role"]}


async def require_superadmin(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    result = supabase.table("users").select("role").eq("id", current_user["id"]).single().execute()
    role = (result.data or {}).get("role")
    if role != "superadmin":
        raise HTTPException(403, "Superadmin access required")
    return {**current_user, "role": role}


# ─── Dashboard Stats ─────────────────────────────────────────

@router.get("/stats")
async def get_stats(
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Aggregate KPIs for the admin dashboard."""
    # Total users
    users_res = supabase.table("users").select("id", count="exact").execute()
    total_users = users_res.count or 0

    # Blocked users
    blocked_res = supabase.table("users").select("id", count="exact").eq("blocked", True).execute()
    blocked_users = blocked_res.count or 0

    # Pro/Agency users
    pro_res = supabase.table("users").select("id", count="exact").in_("plan", ["pro", "agency"]).execute()
    paid_users = pro_res.count or 0

    # Total AI calls
    ai_res = supabase.table("ai_usage").select("id, cost_inr", count="exact").execute()
    ai_calls = ai_res.count or 0
    revenue_inr = sum(r.get("cost_inr", 0) for r in (ai_res.data or []))

    # Total API calls today
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).date().isoformat()
    api_res = supabase.table("api_usage").select("id", count="exact").gte("created_at", today).execute()
    api_calls_today = api_res.count or 0

    # Error count today
    err_res = supabase.table("error_logs").select("id", count="exact").gte("created_at", today).execute()
    errors_today = err_res.count or 0

    # Total posts published
    posts_res = supabase.table("posts").select("id", count="exact").eq("status", "published").execute()
    posts_published = posts_res.count or 0

    return {
        "total_users":      total_users,
        "paid_users":       paid_users,
        "blocked_users":    blocked_users,
        "ai_calls":         ai_calls,
        "revenue_inr":      round(float(revenue_inr), 2),
        "api_calls_today":  api_calls_today,
        "errors_today":     errors_today,
        "posts_published":  posts_published,
    }


# ─── Daily Analytics ─────────────────────────────────────────

@router.get("/analytics/daily")
async def daily_analytics(
    days: int = 30,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Daily DAU, new users, API calls, and revenue."""
    try:
        result = supabase.rpc("daily_user_stats", {"days": days}).execute()
        return result.data or []
    except Exception:
        return []


@router.get("/analytics/revenue")
async def revenue_analytics(
    days: int = 30,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Daily revenue and token usage."""
    try:
        result = supabase.rpc("daily_revenue_stats", {"days": days}).execute()
        return result.data or []
    except Exception:
        return []


@router.get("/analytics/top-users")
async def top_users_by_usage(
    limit: int = 10,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Top users by AI token consumption."""
    result = supabase.table("ai_usage") \
        .select("user_id, total_tokens, cost_inr") \
        .order("total_tokens", desc=True) \
        .limit(limit * 5) \
        .execute()

    # Aggregate by user
    aggregated: dict = {}
    for row in (result.data or []):
        uid = row["user_id"]
        if uid not in aggregated:
            aggregated[uid] = {"user_id": uid, "total_tokens": 0, "total_cost_inr": 0.0}
        aggregated[uid]["total_tokens"] += row.get("total_tokens", 0)
        aggregated[uid]["total_cost_inr"] += float(row.get("cost_inr", 0))

    top = sorted(aggregated.values(), key=lambda x: x["total_tokens"], reverse=True)[:limit]

    # Enrich with user emails
    if top:
        ids = [u["user_id"] for u in top]
        users_res = supabase.table("users").select("id, email, full_name, plan").in_("id", ids).execute()
        user_map = {u["id"]: u for u in (users_res.data or [])}
        for u in top:
            info = user_map.get(u["user_id"], {})
            u["email"] = info.get("email", "—")
            u["full_name"] = info.get("full_name", "—")
            u["plan"] = info.get("plan", "free")

    return top


# ─── User Management ─────────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    plan: Optional[str] = None,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Paginated user list with optional search and plan filter."""
    offset = (page - 1) * limit
    query = supabase.table("users").select(
        "id, email, full_name, plan, role, blocked, created_at, monthly_post_count",
        count="exact"
    )
    if search:
        query = query.ilike("email", f"%{search}%")
    if plan:
        query = query.eq("plan", plan)
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {
        "users": result.data or [],
        "total": result.count or 0,
        "page": page,
        "pages": max(1, ((result.count or 0) + limit - 1) // limit),
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Full profile + usage stats for a single user."""
    user_res = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not user_res.data:
        raise HTTPException(404, "User not found")

    # AI usage summary
    ai_res = supabase.table("ai_usage").select("total_tokens, cost_inr") \
        .eq("user_id", user_id).execute()
    rows = ai_res.data or []
    ai_summary = {
        "total_tokens": sum(r.get("total_tokens", 0) for r in rows),
        "total_cost_inr": round(sum(float(r.get("cost_inr", 0)) for r in rows), 2),
        "ai_calls": len(rows),
    }

    # Posts count
    posts_res = supabase.table("posts").select("id", count="exact").eq("user_id", user_id).execute()

    return {
        **user_res.data,
        "ai_summary": ai_summary,
        "total_posts": posts_res.count or 0,
    }


@router.post("/users/{user_id}/block")
async def block_user(
    user_id: str,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    supabase.table("users").update({"blocked": True}).eq("id", user_id).execute()
    log_admin_action(supabase, admin["id"], "block_user", user_id)
    return {"success": True, "message": "User blocked"}


@router.post("/users/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    supabase.table("users").update({"blocked": False}).eq("id", user_id).execute()
    log_admin_action(supabase, admin["id"], "unblock_user", user_id)
    return {"success": True, "message": "User unblocked"}


@router.post("/users/{user_id}/role")
async def change_role(
    user_id: str,
    role: str,
    admin=Depends(require_superadmin),
    supabase: Client = Depends(get_supabase),
):
    allowed = {"user", "moderator", "admin", "superadmin"}
    if role not in allowed:
        raise HTTPException(400, f"Role must be one of: {allowed}")
    supabase.table("users").update({"role": role}).eq("id", user_id).execute()
    log_admin_action(supabase, admin["id"], f"change_role_to_{role}", user_id)
    return {"success": True, "role": role}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin=Depends(require_superadmin),
    supabase: Client = Depends(get_supabase),
):
    """Permanently delete a user. Superadmin only."""
    supabase.table("users").delete().eq("id", user_id).execute()
    log_admin_action(supabase, admin["id"], "delete_user", user_id)
    return {"success": True}


# ─── Audit Logs ──────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    page: int = 1,
    limit: int = 30,
    action: Optional[str] = None,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    offset = (page - 1) * limit
    query = supabase.table("audit_logs") \
        .select("*, admin:admin_id(email, full_name), target:target_user(email, full_name)", count="exact") \
        .order("created_at", desc=True)
    if action:
        query = query.ilike("action", f"%{action}%")
    result = query.range(offset, offset + limit - 1).execute()
    return {
        "logs": result.data or [],
        "total": result.count or 0,
        "page": page,
    }


# ─── Error Logs ──────────────────────────────────────────────

@router.get("/error-logs")
async def get_error_logs(
    limit: int = 50,
    severity: Optional[str] = None,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("error_logs").select("*").order("created_at", desc=True).limit(limit)
    if severity:
        query = query.eq("severity", severity)
    result = query.execute()
    return result.data or []


# ─── Live Activity (last N events) ───────────────────────────

@router.get("/live-activity")
async def live_activity(
    limit: int = 20,
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("user_activity") \
        .select("*, user:user_id(email)") \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()
    return result.data or []


# ─── Export ──────────────────────────────────────────────────

@router.get("/export/users")
async def export_users(
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Export all users as Excel file."""
    try:
        import pandas as pd
        data = supabase.table("users").select(
            "id, email, full_name, plan, role, blocked, created_at, monthly_post_count"
        ).execute().data or []
        df = pd.DataFrame(data)
        path = "/tmp/socialai_users.xlsx"
        df.to_excel(path, index=False)
        log_admin_action(supabase, admin["id"], "export_users")
        return FileResponse(path, filename="users.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        raise HTTPException(500, f"Export failed: {e}")


@router.get("/export/ai-usage")
async def export_ai_usage(
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Export AI usage / billing data as Excel."""
    try:
        import pandas as pd
        data = supabase.table("ai_usage").select("*").order("created_at", desc=True).execute().data or []
        df = pd.DataFrame(data)
        path = "/tmp/socialai_ai_usage.xlsx"
        df.to_excel(path, index=False)
        return FileResponse(path, filename="ai_usage.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        raise HTTPException(500, f"Export failed: {e}")


# ─── Billing / Stripe ────────────────────────────────────────

@router.get("/billing/overview")
async def billing_overview(
    admin=Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """Revenue summary + per-user billing breakdown."""
    result = supabase.table("ai_usage") \
        .select("user_id, total_tokens, cost_inr, model, created_at") \
        .order("created_at", desc=True) \
        .limit(500) \
        .execute()
    rows = result.data or []

    total_inr = round(sum(float(r.get("cost_inr", 0)) for r in rows), 2)
    total_tokens = sum(r.get("total_tokens", 0) for r in rows)

    # Per-user aggregation
    by_user: dict = {}
    for r in rows:
        uid = r["user_id"]
        if uid not in by_user:
            by_user[uid] = {"user_id": uid, "tokens": 0, "cost_inr": 0.0, "calls": 0}
        by_user[uid]["tokens"] += r.get("total_tokens", 0)
        by_user[uid]["cost_inr"] += float(r.get("cost_inr", 0))
        by_user[uid]["calls"] += 1

    # Enrich with emails
    if by_user:
        ids = list(by_user.keys())
        u_res = supabase.table("users").select("id, email, plan").in_("id", ids).execute()
        for u in (u_res.data or []):
            if u["id"] in by_user:
                by_user[u["id"]]["email"] = u.get("email", "—")
                by_user[u["id"]]["plan"] = u.get("plan", "free")

    top_by_cost = sorted(by_user.values(), key=lambda x: x["cost_inr"], reverse=True)

    return {
        "total_revenue_inr": total_inr,
        "total_tokens": total_tokens,
        "per_user": top_by_cost[:20],
    }


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    supabase: Client = Depends(get_supabase),
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = construct_webhook_event(payload, sig)
    except Exception as e:
        raise HTTPException(400, f"Webhook signature invalid: {e}")

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        plan = session.get("metadata", {}).get("plan", "pro")
        customer_id = session.get("customer")
        sub_id = session.get("subscription")
        if user_id:
            supabase.table("users").update({
                "plan": plan,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": sub_id,
            }).eq("id", user_id).execute()
            log_admin_action(supabase, user_id, f"subscribed_{plan}", user_id, {"session_id": session["id"]})

    elif event_type in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        res = supabase.table("users").select("id").eq("stripe_customer_id", customer_id).single().execute()
        if res.data:
            supabase.table("users").update({"plan": "free"}).eq("id", res.data["id"]).execute()

    return {"received": True}


# ─── Checkout (user-facing) ───────────────────────────────────

@router.post("/checkout/{plan}")
async def create_checkout(
    plan: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Create Stripe Checkout session for current user."""
    origin = request.headers.get("origin", "http://localhost:3000")
    try:
        url = create_checkout_session(
            user_id=current_user["id"],
            plan=plan,
            success_url=f"{origin}/settings?upgraded=1",
            cancel_url=f"{origin}/settings",
        )
        return {"url": url}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Checkout failed: {e}")


# ─── Seed First Admin (one-time setup) ───────────────────────

@router.post("/seed-admin")
async def seed_admin(
    email: str,
    secret: str,
    supabase: Client = Depends(get_supabase),
):
    """Promote a user to superadmin using the ADMIN_SECRET_KEY env var."""
    if secret != settings.ADMIN_SECRET_KEY or secret == "change-me-admin-key":
        raise HTTPException(403, "Invalid secret")
    result = supabase.table("users").update({"role": "superadmin"}).eq("email", email).execute()
    if not result.data:
        raise HTTPException(404, f"No user found with email {email}")
    return {"success": True, "message": f"{email} is now superadmin"}
