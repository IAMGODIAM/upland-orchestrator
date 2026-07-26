from fastapi.testclient import TestClient

from app.main import create_app


def test_health_is_public_and_reports_sovereign_runtime():
    client = TestClient(create_app({"session_secret": "test-secret"}))

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["runtime"] == "sovereign-fastapi"


def test_readiness_requires_authenticated_session():
    client = TestClient(create_app({"session_secret": "test-secret"}))

    response = client.get("/api/readiness")

    assert response.status_code == 401
