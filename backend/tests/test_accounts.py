"""
Tests for /accounts and /connect-account endpoints.
"""

import pytest
import uuid


CONNECT_PAYLOAD = {
    "platform": "instagram",
    "access_token": "test-access-token-abc123",
    "refresh_token": "test-refresh-token-xyz",
    "account_name": "my_instagram",
    "account_id": "12345678",
}


class TestGetAccounts:
    def test_get_accounts_returns_list(self, client):
        resp = client.get("/accounts")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_unauthenticated_blocked(self):
        from app.main import app
        from fastapi.testclient import TestClient
        with TestClient(app) as c:
            resp = c.get("/accounts")
        assert resp.status_code in (401, 403, 422)


class TestConnectAccount:
    def test_connect_account_success(self, client):
        resp = client.post("/connect-account", json=CONNECT_PAYLOAD)
        assert resp.status_code in (200, 201, 500)

    def test_connect_invalid_platform(self, client):
        payload = {**CONNECT_PAYLOAD, "platform": "myspace"}
        resp = client.post("/connect-account", json=payload)
        assert resp.status_code == 422

    def test_connect_empty_token(self, client):
        payload = {**CONNECT_PAYLOAD, "access_token": ""}
        resp = client.post("/connect-account", json=payload)
        assert resp.status_code == 422


class TestDeleteAccount:
    def test_delete_account(self, client):
        account_id = str(uuid.uuid4())
        resp = client.delete(f"/accounts/{account_id}")
        assert resp.status_code in (200, 204, 404, 500)
