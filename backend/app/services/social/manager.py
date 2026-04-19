"""
Social Media Platform Manager
================================
Central registry: resolves platform integrations from stored tokens.
"""

from app.services.social.base import BasePlatform, PostResult
from app.services.social.instagram import InstagramPlatform
from app.services.social.twitter import TwitterPlatform
from app.services.social.linkedin import LinkedInPlatform
from app.services.social.youtube import YouTubePlatform
from app.core.config import get_settings
from typing import Optional

settings = get_settings()


def get_platform(platform: str, account: dict) -> Optional[BasePlatform]:
    """
    Instantiate the correct platform integration from stored account data.
    `account` is a row from the `accounts` table.
    """
    token = account.get("access_token", "")
    extra = account.get("extra_data", {}) or {}

    if platform == "instagram":
        return InstagramPlatform(
            access_token=token,
            ig_user_id=extra.get("ig_user_id", ""),
        )
    elif platform == "twitter":
        return TwitterPlatform(
            access_token=token,
            access_token_secret=extra.get("token_secret", ""),
            api_key=settings.TWITTER_API_KEY,
            api_secret=settings.TWITTER_API_SECRET,
            bearer_token=settings.TWITTER_BEARER_TOKEN,
        )
    elif platform == "linkedin":
        return LinkedInPlatform(access_token=token)
    elif platform == "youtube":
        return YouTubePlatform(
            access_token=token,
            refresh_token=extra.get("refresh_token", ""),
            client_id=settings.YOUTUBE_CLIENT_ID,
            client_secret=settings.YOUTUBE_CLIENT_SECRET,
        )
    return None


SUPPORTED_PLATFORMS = ["instagram", "twitter", "linkedin", "youtube", "facebook", "pinterest"]


async def publish_to_platform(platform: str, account: dict, content: str, media_urls: list[str] = None, **kwargs) -> PostResult:
    """Publish a post using the correct platform integration."""
    handler = get_platform(platform, account)
    if not handler:
        return PostResult(success=False, error=f"Platform '{platform}' not supported", platform=platform)
    return await handler.publish_post(content, media_urls or [], **kwargs)
