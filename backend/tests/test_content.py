"""
Tests for /generate-content and /convert-blog endpoints.
"""

import pytest
from unittest.mock import patch, AsyncMock


GENERATE_PAYLOAD = {
    "topic": "Morning routines for productivity",
    "platform": "instagram",
    "niche": "wellness",
    "tone": "Inspirational",
    "include_hashtags": True,
    "include_emojis": True,
    "content_type": "post",
}

BLOG_PAYLOAD = {
    "blog_content": "This is a blog post about productivity. " * 20,
    "target_platforms": ["instagram", "twitter"],
    "tone": "Casual",
}


class TestGenerateContent:
    def test_generate_content_fallback(self, client):
        """Returns valid GeneratedContent when no AI key configured."""
        resp = client.post("/generate-content", json=GENERATE_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert "caption" in data
        assert "hashtags" in data
        assert isinstance(data["hashtags"], list)
        assert "hook" in data
        assert "cta" in data

    def test_generate_content_missing_topic(self, client):
        payload = {**GENERATE_PAYLOAD, "topic": "x"}  # too short
        resp = client.post("/generate-content", json=payload)
        assert resp.status_code == 422

    def test_generate_content_invalid_platform(self, client):
        payload = {**GENERATE_PAYLOAD, "platform": "myspace"}
        resp = client.post("/generate-content", json=payload)
        assert resp.status_code == 422

    def test_generate_content_unauthenticated(self):
        """Without client fixture override, auth should be required."""
        from app.main import app
        from fastapi.testclient import TestClient
        with TestClient(app) as c:
            resp = c.post("/generate-content", json=GENERATE_PAYLOAD)
        assert resp.status_code in (401, 403, 422)


class TestConvertBlog:
    def test_convert_blog_fallback(self, client):
        resp = client.post("/convert-blog", json=BLOG_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert "platforms" in data
        assert isinstance(data["platforms"], list)
        assert len(data["platforms"]) == 2

    def test_convert_blog_short_content(self, client):
        payload = {**BLOG_PAYLOAD, "blog_content": "too short"}
        resp = client.post("/convert-blog", json=payload)
        assert resp.status_code == 422

    def test_convert_blog_no_platforms(self, client):
        payload = {**BLOG_PAYLOAD, "target_platforms": []}
        resp = client.post("/convert-blog", json=payload)
        assert resp.status_code == 422
