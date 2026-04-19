"""
Tests for /trends endpoint.
"""

import pytest


class TestTrends:
    def test_trends_default(self, client):
        resp = client.get("/trends")
        assert resp.status_code == 200
        data = resp.json()
        assert "topics" in data
        assert "hashtags" in data
        assert "viral_formulas" in data
        assert isinstance(data["topics"], list)

    def test_trends_with_niche(self, client):
        resp = client.get("/trends?niche=fitness")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["topics"]) > 0

    def test_trends_with_platform(self, client):
        resp = client.get("/trends?platform=tiktok")
        assert resp.status_code == 200

    def test_trends_topic_structure(self, client):
        resp = client.get("/trends")
        topics = resp.json()["topics"]
        if topics:
            topic = topics[0]
            assert "title" in topic
            assert "category" in topic
            assert "growth_percent" in topic
