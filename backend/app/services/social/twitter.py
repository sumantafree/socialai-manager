"""Twitter/X API Integration."""

import tweepy
from .base import BasePlatform, PostResult, AccountInfo, PostAnalytics
from typing import Optional
import httpx


class TwitterPlatform(BasePlatform):
    platform_name = "twitter"

    def __init__(self, access_token: str, access_token_secret: str,
                 api_key: str = "", api_secret: str = "", bearer_token: str = ""):
        super().__init__(access_token, access_token_secret)
        self.api_key = api_key
        self.api_secret = api_secret
        self.bearer_token = bearer_token
        self._client = None
        self._api = None

    def _get_client(self) -> tweepy.Client:
        if not self._client:
            self._client = tweepy.Client(
                bearer_token=self.bearer_token,
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
                wait_on_rate_limit=True,
            )
        return self._client

    async def publish_post(self, content: str, media_urls: Optional[list[str]] = None, **kwargs) -> PostResult:
        try:
            client = self._get_client()
            # Upload media if provided
            media_ids = None
            if media_urls:
                auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
                auth.set_access_token(self.access_token, self.access_token_secret)
                api_v1 = tweepy.API(auth)
                media_ids = []
                for url in media_urls[:4]:  # Max 4 images on Twitter
                    async with httpx.AsyncClient() as http:
                        resp = await http.get(url)
                    media = api_v1.media_upload(filename="media.jpg", file=resp.content)
                    media_ids.append(media.media_id)

            response = client.create_tweet(
                text=content[:280],
                media_ids=media_ids,
            )
            tweet_id = str(response.data["id"])
            return PostResult(
                success=True,
                post_id=tweet_id,
                url=f"https://twitter.com/i/status/{tweet_id}",
                platform="twitter",
            )
        except Exception as e:
            return PostResult(success=False, error=str(e), platform="twitter")

    async def publish_thread(self, tweets: list[str]) -> PostResult:
        """Post a Twitter thread."""
        try:
            client = self._get_client()
            reply_to = None
            first_id = None
            for tweet_text in tweets:
                kwargs = {"text": tweet_text[:280]}
                if reply_to:
                    kwargs["reply"] = {"in_reply_to_tweet_id": reply_to}
                response = client.create_tweet(**kwargs)
                tweet_id = str(response.data["id"])
                if not first_id:
                    first_id = tweet_id
                reply_to = tweet_id
            return PostResult(success=True, post_id=first_id, platform="twitter",
                              url=f"https://twitter.com/i/status/{first_id}")
        except Exception as e:
            return PostResult(success=False, error=str(e), platform="twitter")

    async def get_account_info(self) -> AccountInfo:
        try:
            client = self._get_client()
            me = client.get_me(user_fields=["public_metrics", "profile_image_url", "description", "verified"])
            data = me.data
            return AccountInfo(
                platform="twitter",
                handle=f"@{data.username}",
                display_name=data.name,
                followers=data.public_metrics["followers_count"],
                following=data.public_metrics["following_count"],
                profile_image=data.profile_image_url,
                bio=data.description,
                verified=data.verified or False,
            )
        except Exception:
            return AccountInfo(platform="twitter", handle="", display_name="", followers=0, following=0)

    async def get_post_analytics(self, post_id: str) -> PostAnalytics:
        try:
            client = self._get_client()
            tweet = client.get_tweet(
                post_id,
                tweet_fields=["public_metrics", "non_public_metrics", "organic_metrics"],
            )
            m = tweet.data.public_metrics
            return PostAnalytics(
                post_id=post_id,
                likes=m.get("like_count", 0),
                comments=m.get("reply_count", 0),
                shares=m.get("retweet_count", 0) + m.get("quote_count", 0),
                impressions=m.get("impression_count", 0),
                reach=m.get("impression_count", 0),
            )
        except Exception:
            return PostAnalytics(post_id=post_id)

    async def get_trending_topics(self, location: str = "1") -> list[str]:
        """Get trending topics (WOEID: 1 = worldwide)."""
        try:
            auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
            auth.set_access_token(self.access_token, self.access_token_secret)
            api_v1 = tweepy.API(auth)
            trends = api_v1.get_place_trends(id=1)
            return [t["name"] for t in trends[0]["trends"][:20]]
        except Exception:
            return []
