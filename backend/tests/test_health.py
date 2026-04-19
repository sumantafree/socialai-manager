"""
Tests for system/health endpoints.
"""

import pytest
from fastapi.testclient import TestClient


class TestHealth:
    def test_health_endpoint(self):
        from app.main import app
        with TestClient(app) as c:
            resp = c.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "service" in data
        assert "env" in data

    def test_root_endpoint(self):
        from app.main import app
        with TestClient(app) as c:
            resp = c.get("/")
        assert resp.status_code == 200
        assert "message" in resp.json()
