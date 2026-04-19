"""YouTube Data API v3 Integration."""

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from .base import BasePlatform, PostResult, AccountInfo, PostAnalytics
from typing import Optional
import httpx


class YouTubePlatform(BasePlatform):
    platform_name = "youtube"

    def __init__(self, access_token: str, refresh_token: str = "", client_id: str = "", client_secret: str = ""):
        super().__init__(access_token)
        self.refresh_token = refresh_token
        self.client_id = client_id
        self.client_secret = client_secret

    def _get_service(self):
        creds = Credentials(
            token=self.access_token,
            refresh_token=self.refresh_token,
            client_id=self.client_id,
            client_secret=self.client_secret,
            token_uri="https://oauth2.googleapis.com/token",
        )
        return build("youtube", "v3", credentials=creds)

    async def publish_post(self, content: str, media_urls: Optional[list[str]] = None, **kwargs) -> PostResult:
        """Upload a video to YouTube. Requires video_url in kwargs or media_urls."""
        try:
            if not media_urls:
                return PostResult(success=False, error="YouTube requires a video URL", platform="youtube")

            video_url = media_urls[0]
            title = kwargs.get("title", content[:100])
            tags = kwargs.get("tags", [])
            thumbnail_url = kwargs.get("thumbnail_url")

            service = self._get_service()
            # Download video
            async with httpx.AsyncClient() as client:
                resp = await client.get(video_url)
            video_bytes = resp.content

            from googleapiclient.http import MediaIoBaseUpload
            import io
            media_body = MediaIoBaseUpload(io.BytesIO(video_bytes), mimetype="video/*", resumable=True)
            request = service.videos().insert(
                part="snippet,status",
                body={
                    "snippet": {"title": title, "description": content, "tags": tags, "categoryId": "22"},
                    "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False},
                },
                media_body=media_body,
            )
            response = None
            while response is None:
                _, response = request.next_chunk()

            video_id = response["id"]
            return PostResult(
                success=True, post_id=video_id,
                url=f"https://www.youtube.com/shorts/{video_id}",
                platform="youtube",
            )
        except Exception as e:
            return PostResult(success=False, error=str(e), platform="youtube")

    async def get_account_info(self) -> AccountInfo:
        try:
            service = self._get_service()
            result = service.channels().list(part="snippet,statistics", mine=True).execute()
            channel = result["items"][0]
            stats = channel["statistics"]
            return AccountInfo(
                platform="youtube",
                handle=f"@{channel['snippet'].get('customUrl', channel['id'])}",
                display_name=channel["snippet"]["title"],
                followers=int(stats.get("subscriberCount", 0)),
                following=0,
                profile_image=channel["snippet"]["thumbnails"]["default"]["url"],
                bio=channel["snippet"].get("description"),
            )
        except Exception:
            return AccountInfo(platform="youtube", handle="", display_name="", followers=0, following=0)

    async def get_post_analytics(self, post_id: str) -> PostAnalytics:
        try:
            service = self._get_service()
            result = service.videos().list(part="statistics", id=post_id).execute()
            if not result.get("items"):
                return PostAnalytics(post_id=post_id)
            stats = result["items"][0]["statistics"]
            likes = int(stats.get("likeCount", 0))
            comments = int(stats.get("commentCount", 0))
            views = int(stats.get("viewCount", 0))
            return PostAnalytics(
                post_id=post_id, likes=likes, comments=comments,
                reach=views, impressions=views,
                engagement_rate=self.calculate_engagement_rate(likes, comments, 0, max(views, 1)),
            )
        except Exception:
            return PostAnalytics(post_id=post_id)
