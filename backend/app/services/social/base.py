"""
Social Media Platform Abstraction Layer
========================================
All platform integrations extend BasePlatform.
Adding a new platform = create a new class, register in manager.py.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class PostResult:
    success: bool
    post_id: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None
    platform: str = ""


@dataclass
class AccountInfo:
    platform: str
    handle: str
    display_name: str
    followers: int
    following: int
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    verified: bool = False


@dataclass
class PostAnalytics:
    post_id: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    impressions: int = 0
    saves: int = 0
    clicks: int = 0
    engagement_rate: float = 0.0


class BasePlatform(ABC):
    """Abstract base for all social media platform integrations."""

    platform_name: str = "base"

    def __init__(self, access_token: str, access_token_secret: str = ""):
        self.access_token = access_token
        self.access_token_secret = access_token_secret

    @abstractmethod
    async def publish_post(
        self,
        content: str,
        media_urls: Optional[list[str]] = None,
        **kwargs,
    ) -> PostResult:
        """Publish a post to the platform."""
        ...

    @abstractmethod
    async def get_account_info(self) -> AccountInfo:
        """Retrieve account information and stats."""
        ...

    @abstractmethod
    async def get_post_analytics(self, post_id: str) -> PostAnalytics:
        """Retrieve analytics for a specific post."""
        ...

    async def delete_post(self, post_id: str) -> bool:
        """Delete a post (optional, override in subclass)."""
        return False

    async def get_trending_topics(self, location: str = "worldwide") -> list[str]:
        """Get trending topics for the platform (optional)."""
        return []

    def calculate_engagement_rate(self, likes: int, comments: int, shares: int, reach: int) -> float:
        if reach == 0:
            return 0.0
        return round(((likes + comments * 2 + shares * 3) / reach) * 100, 2)
