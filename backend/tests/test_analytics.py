"""
Tests for /analytics endpoint.
"""

import pytest


class TestAnalytics:
    def test_analytics_default_period(self, client):
        resp = client.get("/analytics")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_posts" in data
        assert "total_reach" in data
        assert "avg_engagement_rate" in data
        assert "platform_breakdown" in data
        assert "daily_metrics" in data

    def test_analytics_7d(self, client):
        resp = client.get("/analytics?period=7d")
        assert resp.status_code == 200

    def test_analytics_30d(self, client):
        resp = client.get("/analytics?period=30d")
        assert resp.status_code == 200

    def test_analytics_invalid_period(self, client):
        resp = client.get("/analytics?period=invalid")
        assert resp.status_code in (200, 422)  # service may default gracefully
