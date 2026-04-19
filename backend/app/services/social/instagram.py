"""Instagram Graph API Integration (via Facebook Business API)."""

import httpx
from .base import BasePlatform, PostResult, AccountInfo, PostAnalytics
from typing import Optional

GRAPH_API = "https://graph.facebook.com/v21.0"


class InstagramPlatform(BasePlatform):
    platform_name = "instagram"

    def __init__(self, access_token: str, ig_user_id: str = ""):
        super().__init__(access_token)
        self.ig_user_id = ig_user_id

    async def _graph(self, method: str, path: str, **kwargs) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            url = f"{GRAPH_API}/{path}"
            params = {"access_token": self.access_token, **kwargs.get("params", {})}
            if method == "GET":
                resp = await client.get(url, params=params)
            else:
                resp = await client.post(url, params=params, json=kwargs.get("json", {}))
            resp.raise_for_status()
            return resp.json()

    async def publish_post(self, content: str, media_urls: Optional[list[str]] = None, **kwargs) -> PostResult:
        """Publish photo/video post to Instagram via Graph API."""
        try:
            if not media_urls:
                # Instagram requires media — use a placeholder or skip
                return PostResult(success=False, error="Instagram requires media", platform="instagram")

            media_url = media_urls[0]
            is_video = any(media_url.endswith(ext) for ext in [".mp4", ".mov", ".avi"])

            # Step 1: Create media container
            create_params = {
                "caption": content,
                "access_token": self.access_token,
            }
            if is_video:
                create_params["media_type"] = "REELS"
                create_params["video_url"] = media_url
            else:
                create_params["image_url"] = media_url

            container = await self._graph("POST", f"{self.ig_user_id}/media", params=create_params)
            container_id = container["id"]

            # Step 2: Publish container
            publish = await self._graph("POST", f"{self.ig_user_id}/media_publish",
                                        params={"creation_id": container_id})
            post_id = publish["id"]
            return PostResult(
                success=True,
                post_id=post_id,
                url=f"https://www.instagram.com/p/{post_id}/",
                platform="instagram",
            )
        except Exception as e:
            return PostResult(success=False, error=str(e), platform="instagram")

    async def get_account_info(self) -> AccountInfo:
        try:
            data = await self._graph("GET", self.ig_user_id,
                                     params={"fields": "username,name,biography,followers_count,follows_count,profile_picture_url"})
            return AccountInfo(
                platform="instagram",
                handle=f"@{data.get('username', '')}",
                display_name=data.get("name", ""),
                followers=data.get("followers_count", 0),
                following=data.get("follows_count", 0),
                profile_image=data.get("profile_picture_url"),
                bio=data.get("biography"),
            )
        except Exception:
            return AccountInfo(platform="instagram", handle="", display_name="", followers=0, following=0)

    async def get_post_analytics(self, post_id: str) -> PostAnalytics:
        try:
            data = await self._graph("GET", f"{post_id}/insights",
                                     params={"metric": "impressions,reach,likes,comments,shares,saved"})
            metrics = {item["name"]: item["values"][0]["value"] for item in data.get("data", [])}
            likes = metrics.get("likes", 0)
            comments = metrics.get("comments", 0)
            shares = metrics.get("shares", 0)
            reach = metrics.get("reach", 0)
            return PostAnalytics(
                post_id=post_id,
                likes=likes,
                comments=comments,
                shares=shares,
                reach=reach,
                impressions=metrics.get("impressions", 0),
                saves=metrics.get("saved", 0),
                engagement_rate=self.calculate_engagement_rate(likes, comments, shares, reach),
            )
        except Exception:
            return PostAnalytics(post_id=post_id)
