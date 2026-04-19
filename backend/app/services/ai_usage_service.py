"""
AI Usage & Billing Tracker
===========================
Tracks every AI call's token count + estimated cost in USD and INR.
Cost formula: (total_tokens / 1_000_000) × model_price_per_million_tokens
"""

import logging
from supabase import Client
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# ─── Model pricing (USD per 1M tokens, blended in/out) ────────
MODEL_PRICING_USD: dict[str, float] = {
    "gemini-1.5-flash":  0.075,   # $0.075 / 1M tokens (blended)
    "gemini-1.5-pro":    3.50,    # $3.50  / 1M tokens
    "gemini-2.0-flash":  0.10,
    "gpt-4o":            5.00,
    "gpt-4o-mini":       0.15,
    "claude-sonnet-4-6": 3.00,
    "claude-3-haiku":    0.25,
}

USD_TO_INR = 83.0   # update periodically or fetch from an FX API


def calculate_cost(total_tokens: int, model: str) -> tuple[float, float]:
    """Return (cost_usd, cost_inr) for a given token count and model."""
    price_per_million = MODEL_PRICING_USD.get(model, 1.0)
    cost_usd = (total_tokens / 1_000_000) * price_per_million
    cost_inr = cost_usd * USD_TO_INR
    return round(cost_usd, 6), round(cost_inr, 2)


def track_ai_usage(
    supabase: Client,
    user_id: str,
    tokens_in: int,
    tokens_out: int,
    model: str,
    endpoint: str = "",
) -> dict:
    """Insert AI usage record and return the cost breakdown."""
    total = tokens_in + tokens_out
    cost_usd, cost_inr = calculate_cost(total, model)

    try:
        supabase.table("ai_usage").insert({
            "user_id": user_id,
            "model": model,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "total_tokens": total,
            "cost_usd": cost_usd,
            "cost_inr": cost_inr,
            "endpoint": endpoint,
        }).execute()
    except Exception as e:
        logger.error(f"Failed to track AI usage: {e}")

    return {"tokens": total, "cost_usd": cost_usd, "cost_inr": cost_inr}


def get_user_usage_summary(supabase: Client, user_id: str) -> dict:
    """Return total tokens and cost for a user (all-time)."""
    try:
        result = supabase.table("ai_usage") \
            .select("total_tokens, cost_usd, cost_inr") \
            .eq("user_id", user_id) \
            .execute()
        rows = result.data or []
        return {
            "total_tokens": sum(r.get("total_tokens", 0) for r in rows),
            "total_cost_usd": round(sum(r.get("cost_usd", 0) for r in rows), 4),
            "total_cost_inr": round(sum(r.get("cost_inr", 0) for r in rows), 2),
            "ai_calls": len(rows),
        }
    except Exception as e:
        logger.error(f"Failed to get usage summary: {e}")
        return {"total_tokens": 0, "total_cost_usd": 0, "total_cost_inr": 0, "ai_calls": 0}
