from fastapi import APIRouter, Depends, Query
from app.models.schemas import TrendsResponse, TrendTopic, TrendHashtag
from app.api.deps import get_current_user
from app.core.config import get_settings
from datetime import datetime
import json

router = APIRouter(prefix="/trends", tags=["trends"])
settings = get_settings()

# Curated seed data (replace with live API calls in production)
SEED_TOPICS = [
    {"topic": "AI Side Hustles 2025", "category": "Business", "volume": "2.4M", "growth": "+340%", "platforms": ["twitter", "linkedin", "instagram"]},
    {"topic": "Morning Routine Optimisation", "category": "Lifestyle", "volume": "1.8M", "growth": "+220%", "platforms": ["instagram", "youtube"]},
    {"topic": "Passive Income Streams", "category": "Finance", "volume": "3.1M", "growth": "+180%", "platforms": ["youtube", "twitter"]},
    {"topic": "ChatGPT Prompts for Business", "category": "Tech", "volume": "4.2M", "growth": "+520%", "platforms": ["twitter", "linkedin"]},
    {"topic": "Micro SaaS Ideas", "category": "Tech", "volume": "890K", "growth": "+410%", "platforms": ["twitter", "linkedin"]},
    {"topic": "Creator Economy Tips", "category": "Business", "volume": "1.2M", "growth": "+190%", "platforms": ["instagram", "youtube", "linkedin"]},
    {"topic": "Remote Work Productivity", "category": "Lifestyle", "volume": "2.1M", "growth": "+230%", "platforms": ["linkedin", "twitter"]},
    {"topic": "Digital Minimalism", "category": "Personal Dev", "volume": "760K", "growth": "+150%", "platforms": ["instagram", "twitter"]},
]

SEED_HASHTAGS = [
    {"tag": "#entrepreneur", "posts": "48M", "weekly_growth": "+12%", "niche": "Business", "relevance_score": 0.95},
    {"tag": "#aitools", "posts": "21M", "weekly_growth": "+67%", "niche": "Tech", "relevance_score": 0.98},
    {"tag": "#sidehustle", "posts": "18M", "weekly_growth": "+34%", "niche": "Finance", "relevance_score": 0.90},
    {"tag": "#growthmindset", "posts": "32M", "weekly_growth": "+8%", "niche": "Personal Dev", "relevance_score": 0.85},
    {"tag": "#contentcreator", "posts": "55M", "weekly_growth": "+15%", "niche": "Creator", "relevance_score": 0.88},
    {"tag": "#digitalmarketing", "posts": "41M", "weekly_growth": "+9%", "niche": "Marketing", "relevance_score": 0.87},
    {"tag": "#passiveincome", "posts": "29M", "weekly_growth": "+28%", "niche": "Finance", "relevance_score": 0.89},
    {"tag": "#productivity", "posts": "38M", "weekly_growth": "+22%", "niche": "Lifestyle", "relevance_score": 0.86},
    {"tag": "#startup", "posts": "26M", "weekly_growth": "+18%", "niche": "Business", "relevance_score": 0.84},
    {"tag": "#personalbranding", "posts": "14M", "weekly_growth": "+41%", "niche": "Marketing", "relevance_score": 0.91},
]

VIRAL_HOOKS = [
    "Stop doing [X] — it's killing your growth. Here's what to do instead:",
    "I went from 0 to [number] followers in [timeframe]. Here's the exact strategy:",
    "Nobody talks about this [niche] hack… and it's your loss.",
    "The [niche] advice that 99% of creators get completely wrong:",
    "I tested [X] strategies for 30 days. Only ONE actually worked:",
    "Hot take: [popular belief in your niche] is completely wrong. Here's why:",
    "What [successful person/brand] does that you probably haven't noticed:",
    "This single [niche] mistake is costing you [specific consequence]:",
]


@router.get("", response_model=TrendsResponse)
async def get_trends(
    niche: str | None = Query(None),
    platform: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Return trending topics, hashtags, and viral hooks."""
    topics = SEED_TOPICS
    if niche:
        topics = [t for t in topics if niche.lower() in t["category"].lower() or niche.lower() in t["topic"].lower()]

    hashtags = SEED_HASHTAGS
    if niche:
        hashtags = [h for h in hashtags if niche.lower() in h["niche"].lower()]

    return TrendsResponse(
        topics=[TrendTopic(**t, content_ideas=[]) for t in topics],
        hashtags=[TrendHashtag(**h) for h in hashtags],
        viral_hooks=VIRAL_HOOKS,
        updated_at=datetime.utcnow(),
    )
