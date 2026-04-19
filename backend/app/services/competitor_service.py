"""
Competitor Analysis Service
==============================
Analyses a competitor's social profile and generates strategic insights.
"""

import json
import random
from app.core.config import get_settings
from app.models.schemas import CompetitorInsight

settings = get_settings()


async def analyse_competitor(
    handle: str,
    platform: str,
    depth: str = "basic",
) -> CompetitorInsight:
    """
    Analyse a competitor's social media presence.
    In production: scrape via platform APIs or third-party tools (Apify, Phantom Buster).
    Here we use AI to generate strategic insights based on known patterns.
    """
    clean_handle = handle.lstrip("@")

    # Build AI prompt for strategic analysis
    prompt = f"""You are a social media strategy expert. Analyse the likely content strategy of @{clean_handle} on {platform}.

Based on best practices and general knowledge of this type of account, provide:
1. Top 5 content types they likely use
2. Average engagement rate range
3. Posting frequency
4. Best posting times
5. Top 10 hashtags they likely use
6. 5 content gaps (things they DON'T do well)
7. 5 opportunities for a competitor to outperform them
8. Strengths and weaknesses

Respond ONLY with valid JSON in this exact structure:
{{
  "top_content_types": ["type1", "type2", "type3", "type4", "type5"],
  "avg_engagement_rate": 4.2,
  "posting_frequency": "1x/day",
  "best_times": ["Mon-Fri 7-9 AM", "Evenings 7-9 PM"],
  "top_hashtags": ["#tag1", "#tag2"],
  "content_gaps": ["gap1", "gap2", "gap3", "gap4", "gap5"],
  "opportunities": ["opp1", "opp2", "opp3", "opp4", "opp5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"]
}}"""

    try:
        if settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7,
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
        elif settings.ANTHROPIC_API_KEY:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            msg = client.messages.create(
                model=settings.AI_MODEL_ANTHROPIC,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            data = json.loads(msg.content[0].text)
        else:
            data = _fallback_data(clean_handle, platform)

        return CompetitorInsight(
            handle=f"@{clean_handle}",
            platform=platform,
            top_content_types=data.get("top_content_types", [])[:5],
            avg_engagement_rate=float(data.get("avg_engagement_rate", 4.0)),
            posting_frequency=data.get("posting_frequency", "Unknown"),
            best_times=data.get("best_times", []),
            top_hashtags=data.get("top_hashtags", [])[:10],
            content_gaps=data.get("content_gaps", [])[:5],
            opportunities=data.get("opportunities", [])[:5],
        )

    except Exception:
        return _fallback_insight(clean_handle, platform)


def _fallback_data(handle: str, platform: str) -> dict:
    return {
        "top_content_types": ["Motivational quotes", "Short-form video", "Carousels", "Story polls", "User stories"],
        "avg_engagement_rate": round(random.uniform(3.0, 8.0), 1),
        "posting_frequency": random.choice(["1x/day", "5x/week", "3x/week"]),
        "best_times": ["Mon–Fri 7–9 AM", "Tue & Thu 6–8 PM"],
        "top_hashtags": ["#entrepreneur", "#success", "#growthmindset", "#motivation", "#hustle",
                         "#business", "#mindset", "#goals", "#leadership", "#inspiration"],
        "content_gaps": [
            "No tutorial or how-to content",
            "Rarely engages in comments",
            "Missing LinkedIn presence",
            "No UGC campaigns",
            "Lacks long-form carousel posts",
        ],
        "opportunities": [
            f"Create tutorial content that @{handle} doesn't produce",
            "Engage their comment section to attract their followers",
            "Target same audience on platforms they're absent from",
            "Post in their time-off windows (weekends/evenings)",
            "Run UGC challenges they haven't attempted",
        ],
        "strengths": ["Consistent posting", "Strong brand voice", "High video content"],
        "weaknesses": ["Over-relies on quotes", "Declining caption quality", "No CTAs"],
    }


def _fallback_insight(handle: str, platform: str) -> CompetitorInsight:
    data = _fallback_data(handle, platform)
    return CompetitorInsight(
        handle=f"@{handle}",
        platform=platform,
        top_content_types=data["top_content_types"],
        avg_engagement_rate=data["avg_engagement_rate"],
        posting_frequency=data["posting_frequency"],
        best_times=data["best_times"],
        top_hashtags=data["top_hashtags"],
        content_gaps=data["content_gaps"],
        opportunities=data["opportunities"],
    )
