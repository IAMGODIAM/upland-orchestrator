from fastapi.testclient import TestClient

from app.main import create_app


def test_login_with_malformed_password_hash_returns_unauthorized_not_server_error():
    app = create_app({"session_secret": "test-secret", "admin_password_hash": "not-a-password-hash"})
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert response.status_code == 401
