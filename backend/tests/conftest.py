"""
Shared pytest fixtures for SocialAI Manager backend tests.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import uuid


# ─── Mock Settings ────────────────────────────────────────────

@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """Patch settings so tests never require real API keys."""
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon-key")
    monkeypatch.setenv("OPENAI_API_KEY", "")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")


# ─── Mock Supabase ────────────────────────────────────────────

def make_supabase_mock(data=None, error=None):
    """Return a chainable Supabase mock that always resolves to `data`."""
    result = MagicMock()
    result.data = data or []
    result.error = error

    mock = MagicMock()
    # Chain: .table().select().eq().execute() → result
    chain = mock.table.return_value
    for method in ("select", "insert", "update", "upsert", "delete",
                   "eq", "neq", "gte", "lte", "gt", "lt", "in_",
                   "order", "limit", "single"):
        getattr(chain, method).return_value = chain
    chain.execute.return_value = result
    return mock, result


@pytest.fixture
def supabase_mock():
    mock, result = make_supabase_mock()
    return mock, result


# ─── Test User ────────────────────────────────────────────────

TEST_USER = {
    "id": str(uuid.uuid4()),
    "email": "test@example.com",
    "full_name": "Test User",
    "plan": "pro",
    "monthly_post_count": 5,
}


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-jwt-token"}


# ─── App Client ───────────────────────────────────────────────

@pytest.fixture
def client():
    """TestClient with auth dependency overridden."""
    from app.main import app
    from app.api.deps import get_current_user, get_supabase, require_plan

    async def override_get_current_user():
        return TEST_USER

    async def override_require_plan():
        return TEST_USER

    def override_get_supabase():
        mock, _ = make_supabase_mock()
        return mock

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_plan] = override_require_plan
    app.dependency_overrides[get_supabase] = override_get_supabase

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
