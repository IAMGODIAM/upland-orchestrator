from __future__ import annotations

import base64
import binascii
import os
from dataclasses import dataclass


def _password_hash_from_env() -> str:
    encoded = os.getenv("ADMIN_PASSWORD_HASH_B64", "").strip()
    if encoded:
        try:
            return base64.b64decode(encoded, validate=True).decode("utf-8")
        except (binascii.Error, UnicodeDecodeError):
            return ""
    return os.getenv("ADMIN_PASSWORD_HASH", "")


@dataclass(frozen=True)
class Settings:
    environment: str
    database_url: str
    session_secret: str
    admin_username: str
    admin_password_hash: str
    token_encryption_key: str
    upland_app_id: str
    upland_api_secret: str
    upland_webhook_secret: str
    upland_signature_header: str
    cors_origins: tuple[str, ...]

    @classmethod
    def from_env(cls) -> "Settings":
        origins = tuple(
            value.strip()
            for value in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
            if value.strip()
        )
        return cls(
            environment=os.getenv("APP_ENV", "development"),
            database_url=os.getenv("DATABASE_URL", "sqlite:///./data/upland.db"),
            session_secret=os.getenv("SESSION_SECRET", ""),
            admin_username=os.getenv("ADMIN_USERNAME", "admin"),
            admin_password_hash=_password_hash_from_env(),
            token_encryption_key=os.getenv("TOKEN_ENCRYPTION_KEY", ""),
            upland_app_id=os.getenv("UPLAND_APP_ID", ""),
            upland_api_secret=os.getenv("UPLAND_API_SECRET", ""),
            upland_webhook_secret=os.getenv("UPLAND_WEBHOOK_SECRET", ""),
            upland_signature_header=os.getenv("UPLAND_SIGNATURE_HEADER", "x-upland-signature").lower(),
            cors_origins=origins,
        )

    def readiness(self) -> dict[str, bool]:
        return {
            "session_secret": bool(self.session_secret),
            "admin_password": bool(self.admin_password_hash),
            "token_encryption": bool(self.token_encryption_key),
            "upland_app_credentials": bool(self.upland_app_id and self.upland_api_secret),
            "webhook_signature": bool(self.upland_webhook_secret),
        }
