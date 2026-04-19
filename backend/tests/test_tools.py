"""
Tests for /tools/* endpoints (hashtag generator, reel script, WhatsApp notifier).
"""

import pytest


HASHTAG_PAYLOAD = {
    "topic": "morning routine",
    "niche": "wellness",
    "platform": "instagram",
    "count": 30,
}

REEL_PAYLOAD = {
    "topic": "5-minute morning routine",
    "duration": "30s",
    "style": "Educational",
    "platform": "Instagram Reels",
    "hook": "",
}

WHATSAPP_SETUP_PAYLOAD = {
    "phone_number": "+14155551234",
    "notifications": ["scheduled_post", "weekly_report"],
}


class TestHashtagGenerator:
    def test_generate_hashtags_fallback(self, client):
        resp = client.post("/tools/hashtags", json=HASHTAG_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert "viral" in data
        assert "niche_tags" in data
        assert "long_tail" in data
        assert "trending" in data
        assert "recommended_mix" in data
        assert isinstance(data["viral"], list)
        assert len(data["viral"]) == 5

    def test_hashtags_custom_count(self, client):
        payload = {**HASHTAG_PAYLOAD, "count": 15}
        resp = client.post("/tools/hashtags", json=payload)
        assert resp.status_code == 200

    def test_hashtags_count_too_low(self, client):
        payload = {**HASHTAG_PAYLOAD, "count": 2}
        resp = client.post("/tools/hashtags", json=payload)
        assert resp.status_code == 422

    def test_hashtags_count_too_high(self, client):
        payload = {**HASHTAG_PAYLOAD, "count": 100}
        resp = client.post("/tools/hashtags", json=payload)
        assert resp.status_code == 422

    def test_hashtags_topic_too_short(self, client):
        payload = {**HASHTAG_PAYLOAD, "topic": "x"}
        resp = client.post("/tools/hashtags", json=payload)
        assert resp.status_code == 422

    def test_hashtags_all_platforms(self, client):
        for platform in ["instagram", "twitter", "linkedin", "tiktok", "youtube"]:
            resp = client.post("/tools/hashtags", json={**HASHTAG_PAYLOAD, "platform": platform})
            assert resp.status_code == 200, f"Failed for platform: {platform}"


class TestReelScriptGenerator:
    def test_generate_reel_30s(self, client):
        resp = client.post("/tools/reel-script", json=REEL_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert "title" in data
        assert "hook" in data
        assert "scenes" in data
        assert "cta" in data
        assert "audio_suggestion" in data
        assert "thumbnail_idea" in data
        assert data["duration"] == "30s"

    def test_reel_scene_count_30s(self, client):
        resp = client.post("/tools/reel-script", json=REEL_PAYLOAD)
        scenes = resp.json()["scenes"]
        assert len(scenes) == 4

    def test_reel_scene_count_15s(self, client):
        payload = {**REEL_PAYLOAD, "duration": "15s"}
        resp = client.post("/tools/reel-script", json=payload)
        assert resp.status_code == 200
        scenes = resp.json()["scenes"]
        assert len(scenes) == 2

    def test_reel_scene_count_60s(self, client):
        payload = {**REEL_PAYLOAD, "duration": "60s"}
        resp = client.post("/tools/reel-script", json=payload)
        assert resp.status_code == 200
        scenes = resp.json()["scenes"]
        assert len(scenes) == 6

    def test_reel_scene_structure(self, client):
        resp = client.post("/tools/reel-script", json=REEL_PAYLOAD)
        scene = resp.json()["scenes"][0]
        assert "timestamp" in scene
        assert "visual" in scene
        assert "voiceover" in scene
        assert "text_overlay" in scene

    def test_reel_with_hook(self, client):
        payload = {**REEL_PAYLOAD, "hook": "This ONE habit changed my life forever"}
        resp = client.post("/tools/reel-script", json=payload)
        assert resp.status_code == 200
        assert resp.json()["hook"] == "This ONE habit changed my life forever"

    def test_reel_topic_too_short(self, client):
        payload = {**REEL_PAYLOAD, "topic": "ab"}
        resp = client.post("/tools/reel-script", json=payload)
        assert resp.status_code == 422

    def test_reel_all_styles(self, client):
        for style in ["Educational", "Motivational", "Tutorial", "Story", "Comedy"]:
            resp = client.post("/tools/reel-script", json={**REEL_PAYLOAD, "style": style})
            assert resp.status_code == 200, f"Failed for style: {style}"


class TestWhatsAppNotifier:
    def test_setup_whatsapp(self, client):
        resp = client.post("/tools/whatsapp/setup", json=WHATSAPP_SETUP_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "+14155551234" in data["message"]
        assert "notifications_enabled" in data

    def test_setup_phone_too_short(self, client):
        payload = {**WHATSAPP_SETUP_PAYLOAD, "phone_number": "123"}
        resp = client.post("/tools/whatsapp/setup", json=payload)
        assert resp.status_code == 422

    def test_send_test_message(self, client):
        resp = client.post("/tools/whatsapp/send-test")
        assert resp.status_code == 200
        assert resp.json()["success"] is True
