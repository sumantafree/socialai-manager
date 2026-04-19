from pydantic import BaseModel, Field, UUID4
from typing import Optional, Literal
from datetime import datetime


# ─── Content Generation ──────────────────────────────────────

class ContentGenerateRequest(BaseModel):
    platform: Literal["instagram", "twitter", "linkedin", "youtube", "facebook", "pinterest"]
    niche: str = ""
    topic: str = Field(..., min_length=3, max_length=500)
    tone: Literal["Inspirational", "Educational", "Entertaining", "Professional", "Casual", "Bold & Direct"] = "Inspirational"
    target_audience: str = ""
    include_script: bool = True
    hashtag_count: int = Field(default=10, ge=5, le=30)


class GeneratedContent(BaseModel):
    hook: str
    caption: str
    cta: str
    hashtags: list[str]
    script: Optional[str] = None
    creative_idea: Optional[str] = None
    seo_title: Optional[str] = None
    platform: str
    estimated_reach: Optional[str] = None


# ─── Posts ───────────────────────────────────────────────────

class PostCreate(BaseModel):
    platform: str
    content: str
    media_url: Optional[str] = None
    scheduled_at: datetime
    account_id: Optional[str] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[Literal["draft", "scheduled", "published", "failed"]] = None


class PostResponse(BaseModel):
    id: str
    user_id: str
    platform: str
    content: str
    media_url: Optional[str]
    status: str
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime


# ─── Analytics ───────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    post_id: str
    platform: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    impressions: int = 0
    engagement_rate: float = 0.0
    recorded_at: datetime


class AnalyticsSummary(BaseModel):
    period: str
    total_reach: int
    total_engagement: int
    avg_engagement_rate: float
    best_platform: str
    best_post_id: Optional[str]
    growth_rate: float
    data_points: list[dict]
    ai_insights: list[str]


# ─── Social Accounts ─────────────────────────────────────────

class AccountConnect(BaseModel):
    platform: str
    code: str  # OAuth authorization code
    redirect_uri: str = ""


class AccountResponse(BaseModel):
    id: str
    platform: str
    handle: str
    display_name: Optional[str]
    followers: Optional[int]
    profile_image: Optional[str]
    connected: bool
    expires_at: Optional[datetime]


# ─── Trends ──────────────────────────────────────────────────

class TrendTopic(BaseModel):
    topic: str
    category: str
    volume: str
    growth: str
    platforms: list[str]
    content_ideas: list[str] = []


class TrendHashtag(BaseModel):
    tag: str
    posts: str
    weekly_growth: str
    niche: str
    relevance_score: float = 0.0


class TrendsResponse(BaseModel):
    topics: list[TrendTopic]
    hashtags: list[TrendHashtag]
    viral_hooks: list[str]
    updated_at: datetime


# ─── Blog Converter ──────────────────────────────────────────

class BlogConvertRequest(BaseModel):
    content: str = Field(..., min_length=100)
    platforms: list[str] = ["instagram", "twitter", "linkedin"]
    tone: str = "Inspirational"


class BlogConvertResponse(BaseModel):
    posts: dict[str, GeneratedContent]


# ─── Users ───────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    plan: Literal["free", "pro", "agency"] = "free"
    posts_this_month: int = 0
    max_posts_per_month: int = 5
    created_at: datetime


# ─── Competitor Analysis ─────────────────────────────────────

class CompetitorAnalysisRequest(BaseModel):
    competitor_handle: str
    platform: str
    depth: Literal["basic", "deep"] = "basic"


class CompetitorInsight(BaseModel):
    handle: str
    platform: str
    top_content_types: list[str]
    avg_engagement_rate: float
    posting_frequency: str
    best_times: list[str]
    top_hashtags: list[str]
    content_gaps: list[str]
    opportunities: list[str]
