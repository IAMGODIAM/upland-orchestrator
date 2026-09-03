from __future__ import annotations

import json
from collections.abc import Mapping
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from .config import Settings
from .portfolio import portfolio_summary
from .security import decrypt_token, encrypt_token, issue_session, verify_password, verify_session, verify_webhook_signature
from .storage import Store
from .upland import UplandClient, basic_auth

bearer = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=1, max_length=512)


class ConnectionRequest(BaseModel):
    connection_code: str = Field(min_length=1, max_length=256)


def _settings(overrides: Mapping[str, str] | None) -> Settings:
    base = Settings.from_env()
    if not overrides:
        return base
    values = {field: getattr(base, field) for field in base.__dataclass_fields__}
    values.update(overrides)
    return Settings(**values)


def create_app(overrides: Mapping[str, str] | None = None) -> FastAPI:
    settings = _settings(overrides)
    @asynccontextmanager
    async def lifespan(_: FastAPI):
        store.initialize()
        yield

    app = FastAPI(title="Upland Orchestrator", version="1.0.0", lifespan=lifespan)
    store = Store(settings.database_url)
    client = UplandClient()
    app.state.settings = settings
    app.state.store = store
    app.state.client = client
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    def current_owner(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]) -> str:
        if not credentials or credentials.scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="authentication required")
        owner = verify_session(credentials.credentials, settings.session_secret)
        if not owner:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid or expired session")
        return owner

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        checks = settings.readiness()
        return {"status": "ok", "runtime": "sovereign-fastapi", "environment": settings.environment, "configured": all(checks.values()), "checks": checks}

    @app.post("/api/auth/login")
    def login(payload: LoginRequest) -> dict[str, str]:
        if payload.username != settings.admin_username or not verify_password(payload.password, settings.admin_password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")
        return {"access_token": issue_session(payload.username, settings.session_secret), "token_type": "bearer"}

    @app.get("/api/readiness")
    def readiness(owner: str = Depends(current_owner)) -> dict[str, Any]:
        checks = settings.readiness()
        connection = store.connection_for(owner)
        checks["upland_connection"] = bool(connection and connection.status == "connected" and connection.encrypted_access_token)
        return {"production_ready": all(checks.values()), "checks": checks, "phase": "private-read-only"}

    @app.post("/api/connections/start")
    async def start_connection(owner: str = Depends(current_owner)) -> dict[str, str]:
        if not settings.upland_app_id or not settings.upland_api_secret:
            raise HTTPException(status_code=503, detail="Upland application credentials are not configured")
        try:
            payload = await client.start_connection(settings.upland_app_id, settings.upland_api_secret)
        except Exception as error:
            raise HTTPException(status_code=502, detail=f"Upland connection initialization failed: {error}") from error
        code = str(payload.get("code") or (payload.get("data") or {}).get("code") or "")
        if not code:
            raise HTTPException(status_code=502, detail="Upland did not return a connection code")
        store.upsert_connection(owner, connection_code=code, status="pending", encrypted_access_token="")
        return {"connection_code": code, "status": "pending"}

    @app.get("/api/portfolio/snapshot")
    async def snapshot(owner: str = Depends(current_owner)) -> dict[str, Any]:
        connection = store.connection_for(owner)
        if not connection or connection.status != "connected" or not connection.encrypted_access_token:
            raise HTTPException(status_code=409, detail="Connect an Upland account before requesting a portfolio snapshot")
        try:
            authorization = f"Bearer {decrypt_token(connection.encrypted_access_token, settings.token_encryption_key)}"
            profile, balances, properties, nfts = await _gather_snapshot(client, authorization)
        except Exception as error:
            raise HTTPException(status_code=502, detail=f"Upland portfolio refresh failed: {error}") from error
        return {"profile": profile, **portfolio_summary(properties, nfts, balances, datetime.now(timezone.utc).isoformat())}

    @app.post("/api/webhooks/upland")
    async def upland_webhook(request: Request) -> dict[str, Any]:
        body = await request.body()
        signature = request.headers.get(settings.upland_signature_header)
        if not verify_webhook_signature(body, signature, settings.upland_webhook_secret):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid webhook signature")
        try:
            event = json.loads(body)
        except json.JSONDecodeError as error:
            raise HTTPException(status_code=400, detail="invalid webhook JSON") from error
        if not isinstance(event, dict) or not isinstance(event.get("type"), str):
            raise HTTPException(status_code=400, detail="webhook event type is required")
        data = event.get("data") if isinstance(event.get("data"), dict) else {}
        event_type = event["type"]
        transaction_id = str(data.get("transactionId") or "")
        if store.has_webhook_event(event_type, transaction_id):
            return {"received": True, "duplicate": True}
        if event_type == "AuthenticationSuccess":
            _apply_authentication_event(store, data, settings)
        elif event_type in {"AuthenticationFailure", "UserDisconnectedApplication"}:
            _expire_connection(store, data)
        sanitized = {key: value for key, value in data.items() if key != "accessToken"}
        store.record_webhook_event(event_type, transaction_id, json.dumps(sanitized, separators=(",", ":")))
        return {"received": True, "event_type": event_type}

    static_dir = Path(__file__).resolve().parents[1] / "static"
    if static_dir.exists():
        @app.get("/{path:path}", include_in_schema=False)
        def frontend(path: str) -> FileResponse:
            candidate = static_dir / path
            if path and candidate.is_file():
                return FileResponse(candidate)
            return FileResponse(static_dir / "index.html")

    return app


async def _gather_snapshot(client: UplandClient, authorization: str) -> tuple[Any, Any, Any, Any]:
    import asyncio
    return tuple(await asyncio.gather(*[
        client.get("/user/profile", authorization),
        client.get("/user/balances", authorization),
        client.get("/user/assets/properties", authorization),
        client.get("/user/assets/nfts", authorization),
    ]))  # type: ignore[return-value]


def _apply_authentication_event(store: Store, data: Mapping[str, Any], settings: Settings) -> None:
    code = str(data.get("code") or "")
    access_token = str(data.get("accessToken") or "")
    user_id = str(data.get("userId") or "")
    if not code or not access_token or not user_id:
        raise HTTPException(status_code=400, detail="invalid authentication success event")
    with store.session() as session:
        from .storage import Connection
        connection = session.query(Connection).filter(Connection.connection_code == code, Connection.status == "pending").first()
        if connection is None:
            raise HTTPException(status_code=404, detail="unknown or completed connection code")
        connection.status = "connected"
        connection.upland_user_id = user_id
        connection.encrypted_access_token = encrypt_token(access_token, settings.token_encryption_key)


def _expire_connection(store: Store, data: Mapping[str, Any]) -> None:
    code = str(data.get("code") or "")
    user_id = str(data.get("userId") or "")
    with store.session() as session:
        from .storage import Connection
        query = session.query(Connection)
        connection = query.filter(Connection.connection_code == code).first() if code else query.filter(Connection.upland_user_id == user_id).first()
        if connection is not None:
            connection.status = "expired"
            connection.encrypted_access_token = ""


app = create_app()
