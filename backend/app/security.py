from __future__ import annotations

import hashlib
import hmac
import time
from typing import Any

import jwt
from cryptography.fernet import Fernet
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError


_PASSWORDS = PasswordHash.recommended()


def verify_webhook_signature(body: bytes, supplied_signature: str | None, secret: str) -> bool:
    if not body or not supplied_signature or not secret:
        return False
    supplied = supplied_signature.removeprefix("sha256=").strip().lower()
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(supplied, expected)


def encrypt_token(value: str, key: str) -> str:
    if not value or not key:
        raise ValueError("token encryption key is required")
    return Fernet(key.encode("utf-8")).encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_token(value: str, key: str) -> str:
    if not value or not key:
        raise ValueError("token encryption key is required")
    return Fernet(key.encode("utf-8")).decrypt(value.encode("utf-8")).decode("utf-8")


def hash_password(password: str) -> str:
    return _PASSWORDS.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if not password or not password_hash:
        return False
    try:
        return _PASSWORDS.verify(password, password_hash)
    except UnknownHashError:
        return False


def issue_session(subject: str, secret: str, ttl_seconds: int = 3600) -> str:
    if not subject or not secret:
        raise ValueError("session subject and secret are required")
    now = int(time.time())
    payload: dict[str, Any] = {"sub": subject, "iat": now, "exp": now + ttl_seconds, "scope": "upland:read"}
    return jwt.encode(payload, secret, algorithm="HS256")


def verify_session(token: str, secret: str) -> str | None:
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) and subject else None
