"""
Unit tests for backend service layer (no HTTP layer).
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock


# ─── AI Service ───────────────────────────────────────────────

class TestAIService:
    def test_fallback_content_instagram(self):
        from app.services.ai_service import _fallback_content
        result = _fallback_content("morning routine", "instagram", "Inspirational")
        assert result["caption"]
        assert isinstance(result["hashtags"], list)
        assert result["hook"]
        assert result["cta"]

    def test_fallback_content_twitter(self):
        from app.services.ai_service import _fallback_content
        result = _fallback_content("startup tips", "twitter", "Professional")
        assert result["caption"]
        # Twitter posts should be concise
        assert len(result["caption"]) <= 500

    def test_build_system_prompt(self):
        from app.services.ai_service import build_system_prompt
        prompt = build_system_prompt("instagram")
        assert "instagram" in prompt.lower()
        assert len(prompt) > 50

    def test_generate_content_ai_fallback(self):
        """generate_content_ai() must work without API keys."""
        from app.services.ai_service import generate_content_ai
        from app.models.schemas import ContentGenerateRequest
        req = ContentGenerateRequest(
            topic="productivity hacks",
            platform="instagram",
            niche="business",
            tone="Motivational",
        )
        result = asyncio.run(generate_content_ai(req))
        assert result.caption
        assert result.hook
        assert result.cta

    def test_all_platform_fallbacks(self):
        from app.services.ai_service import _fallback_content
        platforms = ["instagram", "twitter", "linkedin", "youtube", "facebook"]
        for p in platforms:
            result = _fallback_content("test topic", p, "Casual")
            assert result["caption"], f"No caption for {p}"


# ─── Competitor Service ───────────────────────────────────────

class TestCompetitorService:
    def test_fallback_data_structure(self):
        from app.services.competitor_service import _fallback_data
        data = _fallback_data("garyvee", "instagram")
        assert len(data["top_content_types"]) == 5
        assert len(data["content_gaps"]) == 5
        assert len(data["opportunities"]) == 5
        assert len(data["top_hashtags"]) == 10
        assert isinstance(data["avg_engagement_rate"], float)
        assert 2.0 <= data["avg_engagement_rate"] <= 10.0

    def test_fallback_insight(self):
        from app.services.competitor_service import _fallback_insight
        insight = _fallback_insight("testuser", "linkedin")
        assert insight.handle == "@testuser"
        assert insight.platform == "linkedin"
        assert len(insight.top_content_types) <= 5
        assert len(insight.top_hashtags) <= 10

    def test_analyse_competitor_fallback(self):
        from app.services.competitor_service import analyse_competitor
        insight = asyncio.run(analyse_competitor("@testuser", "instagram", "basic"))
        assert insight.handle == "@testuser"
        assert insight.platform == "instagram"
        assert insight.avg_engagement_rate > 0


# ─── WhatsApp Message Builder ─────────────────────────────────

class TestWhatsAppMessages:
    def test_scheduled_post_message(self):
        from workers.tasks import _build_whatsapp_message
        msg = _build_whatsapp_message("scheduled_post", {
            "platform": "instagram",
            "content": "Check out this amazing post about morning routines!",
            "scheduled_at": "2026-04-05 09:00 UTC",
        })
        assert "Instagram" in msg
        assert "Scheduled" in msg
        assert "socialai.app" in msg

    def test_weekly_report_message(self):
        from workers.tasks import _build_whatsapp_message
        msg = _build_whatsapp_message("weekly_report", {
            "posts_published": 12,
            "total_reach": 45000,
            "top_platform": "Instagram",
        })
        assert "12" in msg
        assert "45,000" in msg
        assert "Instagram" in msg

    def test_ai_tips_message(self):
        from workers.tasks import _build_whatsapp_message
        tip = "Post consistently at the same time each day for algorithm boost."
        msg = _build_whatsapp_message("ai_tips", {"tip": tip})
        assert tip in msg

    def test_unknown_type_fallback(self):
        from workers.tasks import _build_whatsapp_message
        msg = _build_whatsapp_message("unknown_event", {})
        assert "SocialAI" in msg
