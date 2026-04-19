"""LinkedIn API Integration."""

import httpx
from .base import BasePlatform, PostResult, AccountInfo, PostAnalytics
from typing import Optional

LINKEDIN_API = "https://api.linkedin.com/v2"


class LinkedInPlatform(BasePlatform):
    platform_name = "linkedin"

    async def _api(self, method: str, path: str, **kwargs) -> dict:
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            url = f"{LINKEDIN_API}/{path}"
            if method == "GET":
                resp = await client.get(url, headers=headers, params=kwargs.get("params", {}))
            else:
                resp = await client.post(url, headers=headers, json=kwargs.get("json", {}))
            resp.raise_for_status()
            return resp.json()

    async def get_account_info(self) -> AccountInfo:
        try:
            profile = await self._api("GET", "me", params={"projection": "(id,firstName,lastName,profilePicture)"})
            first = profile["firstName"]["localized"].get("en_US", "")
            last = profile["lastName"]["localized"].get("en_US", "")
            urn = f"urn:li:person:{profile['id']}"
            return AccountInfo(
                platform="linkedin",
                handle=urn,
                display_name=f"{first} {last}",
                followers=0,
                following=0,
            )
        except Exception:
            return AccountInfo(platform="linkedin", handle="", display_name="", followers=0, following=0)

    async def publish_post(self, content: str, media_urls: Optional[list[str]] = None, **kwargs) -> PostResult:
        try:
            profile = await self._api("GET", "me")
            author_urn = f"urn:li:person:{profile['id']}"
            payload = {
                "author": author_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": content},
                        "shareMediaCategory": "NONE",
                    }
                },
                "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
            }
            if media_urls:
                payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
                payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                    {"status": "READY", "originalUrl": url} for url in media_urls[:1]
                ]
            result = await self._api("POST", "ugcPosts", json=payload)
            post_id = result.get("id", "")
            return PostResult(success=True, post_id=post_id, platform="linkedin",
                              url=f"https://www.linkedin.com/feed/update/{post_id}/")
        except Exception as e:
            return PostResult(success=False, error=str(e), platform="linkedin")

    async def get_post_analytics(self, post_id: str) -> PostAnalytics:
        try:
            data = await self._api("GET", f"socialActions/{post_id}",
                                   params={"projection": "(likesSummary,commentsSummary,shareSummary)"})
            likes = data.get("likesSummary", {}).get("totalLikes", 0)
            comments = data.get("commentsSummary", {}).get("totalFirstLevelComments", 0)
            shares = data.get("shareSummary", {}).get("shareCount", 0)
            return PostAnalytics(
                post_id=post_id, likes=likes, comments=comments, shares=shares,
                engagement_rate=self.calculate_engagement_rate(likes, comments, shares, max(likes + comments + shares, 1) * 10),
            )
        except Exception:
            return PostAnalytics(post_id=post_id)
