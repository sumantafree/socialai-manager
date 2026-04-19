"""
Stripe Billing Service
=======================
Manages checkout sessions and subscription webhooks.
"""

import logging
import stripe
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

PLAN_PRICE_MAP = {
    "pro":    settings.STRIPE_PRO_PRICE_ID,
    "agency": settings.STRIPE_AGENCY_PRICE_ID,
}


def get_stripe():
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def create_checkout_session(user_id: str, plan: str, success_url: str, cancel_url: str) -> str:
    """Create a Stripe Checkout session and return the redirect URL."""
    s = get_stripe()
    price_id = PLAN_PRICE_MAP.get(plan)
    if not price_id:
        raise ValueError(f"Unknown plan: {plan}")

    session = s.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user_id, "plan": plan},
        client_reference_id=user_id,
    )
    return session.url


def create_billing_portal_session(stripe_customer_id: str, return_url: str) -> str:
    """Create a Stripe Billing Portal session for self-serve subscription management."""
    s = get_stripe()
    session = s.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=return_url,
    )
    return session.url


def construct_webhook_event(payload: bytes, sig_header: str):
    """Verify Stripe webhook signature and return the event object."""
    s = get_stripe()
    return s.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )


def get_subscription_status(stripe_subscription_id: str) -> dict:
    """Fetch current subscription status from Stripe."""
    if not stripe_subscription_id:
        return {"status": "none"}
    try:
        s = get_stripe()
        sub = s.Subscription.retrieve(stripe_subscription_id)
        return {
            "status": sub.status,
            "current_period_end": sub.current_period_end,
            "cancel_at_period_end": sub.cancel_at_period_end,
        }
    except Exception as e:
        logger.error(f"Stripe subscription fetch failed: {e}")
        return {"status": "unknown"}
