"""
Audit Logging Service
======================
Records every admin action for compliance and traceability.
"""

import logging
from supabase import Client

logger = logging.getLogger(__name__)


def log_admin_action(
    supabase: Client,
    admin_id: str,
    action: str,
    target_user: str | None = None,
    metadata: dict | None = None,
) -> None:
    """Persist an admin action to the audit_logs table."""
    try:
        supabase.table("audit_logs").insert({
            "admin_id": admin_id,
            "action": action,
            "target_user": target_user,
            "metadata": metadata or {},
        }).execute()
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")


def log_user_activity(
    supabase: Client,
    user_id: str,
    action: str,
    metadata: dict | None = None,
) -> None:
    """Record a user-triggered activity event."""
    try:
        supabase.table("user_activity").insert({
            "user_id": user_id,
            "action": action,
            "metadata": metadata or {},
        }).execute()
    except Exception as e:
        logger.error(f"Failed to write user activity: {e}")


def log_api_call(
    supabase: Client,
    user_id: str,
    endpoint: str,
    method: str = "POST",
    response_time: int = 0,
    status_code: int = 200,
) -> None:
    """Track API call for usage analytics."""
    try:
        supabase.table("api_usage").insert({
            "user_id": user_id,
            "endpoint": endpoint,
            "method": method,
            "response_time": response_time,
            "status_code": status_code,
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log API call: {e}")


def log_error(
    supabase: Client,
    message: str,
    stack: str = "",
    endpoint: str = "",
    user_id: str | None = None,
    severity: str = "error",
) -> None:
    """Store an error for admin visibility."""
    try:
        supabase.table("error_logs").insert({
            "user_id": user_id,
            "endpoint": endpoint,
            "message": message,
            "stack": stack,
            "severity": severity,
        }).execute()
    except Exception as e:
        logger.error(f"Failed to write error log: {e}")
