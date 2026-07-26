import hashlib
import hmac
import json

from fastapi.testclient import TestClient

from app.main import create_app
from app.security import hash_password


def _client() -> TestClient:
    return TestClient(create_app({
        "database_url": "sqlite:///./data/webhook-test.db",
        "session_secret": "session-secret",
        "admin_password_hash": hash_password("correct horse battery staple"),
        "token_encryption_key": "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "upland_app_id": "app-id",
        "upland_api_secret": "api-secret",
        "upland_webhook_secret": "webhook-secret",
    }))


def test_webhook_refuses_unsigned_event_before_any_write():
    with _client() as client:
        response = client.post("/api/webhooks/upland", json={"type": "AuthenticationFailure", "data": {"code": "c1"}})
    assert response.status_code == 401


def test_webhook_accepts_exactly_signed_event():
    payload = {"type": "AuthenticationFailure", "data": {"code": "c1"}}
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(b"webhook-secret", body, hashlib.sha256).hexdigest()
    with _client() as client:
        response = client.post("/api/webhooks/upland", content=body, headers={"content-type": "application/json", "x-upland-signature": signature})
    assert response.status_code == 200
    assert response.json()["received"] is True
