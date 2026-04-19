"""
Tests for /competitor/analyse and /competitor/saved endpoints.
"""

import pytest
from unittest.mock import patch, AsyncMock


ANALYSE_PAYLOAD = {
    "competitor_handle": "@garyvee",
    "platform": "instagram",
    "depth": "basic",
}


class TestCompetitorAnalyse:
    def test_analyse_competitor_fallback(self, client):
        """Returns valid CompetitorInsight using fallback data (no AI key)."""
        resp = client.post("/competitor/analyse", json=ANALYSE_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["handle"] == "@garyvee"
        assert data["platform"] == "instagram"
        assert "top_content_types" in data
        assert isinstance(data["top_content_types"], list)
        assert len(data["top_content_types"]) <= 5
        assert "avg_engagement_rate" in data
        assert isinstance(data["avg_engagement_rate"], float)
        assert "top_hashtags" in data
        assert "content_gaps" in data
        assert "opportunities" in data

    def test_analyse_strips_at_symbol(self, client):
        payload = {**ANALYSE_PAYLOAD, "competitor_handle": "garyvee"}
        resp = client.post("/competitor/analyse", json=payload)
        assert resp.status_code == 200

    def test_analyse_missing_handle(self, client):
        resp = client.post("/competitor/analyse", json={
            "competitor_handle": "",
            "platform": "instagram",
        })
        assert resp.status_code == 422

    def test_analyse_invalid_platform(self, client):
        resp = client.post("/competitor/analyse", json={
            "competitor_handle": "@test",
            "platform": "myspace",
        })
        assert resp.status_code == 422

    def test_analyse_all_platforms(self, client):
        for platform in ["instagram", "twitter", "linkedin", "youtube", "facebook"]:
            resp = client.post("/competitor/analyse", json={
                "competitor_handle": "@test",
                "platform": platform,
                "depth": "basic",
            })
            assert resp.status_code == 200, f"Failed for platform: {platform}"


class TestCompetitorSaved:
    def test_saved_returns_list(self, client):
        resp = client.get("/competitor/saved")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_saved_unauthenticated(self):
        from app.main import app
        from fastapi.testclient import TestClient
        with TestClient(app) as c:
            resp = c.get("/competitor/saved")
        assert resp.status_code in (401, 403, 422)
