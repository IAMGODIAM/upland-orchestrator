import hashlib
import hmac

from app.security import (
    decrypt_token,
    encrypt_token,
    issue_session,
    verify_session,
    verify_webhook_signature,
)


def test_webhook_signature_accepts_exact_hmac_sha256():
    body = b'{"type":"AuthenticationSuccess"}'
    secret = "webhook-secret"
    signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    assert verify_webhook_signature(body, signature, secret) is True


def test_webhook_signature_rejects_tampering():
    assert verify_webhook_signature(b"payload", "invalid", "webhook-secret") is False


def test_token_encryption_round_trip_never_returns_plaintext():
    key = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
    encrypted = encrypt_token("upland-access-token", key)

    assert encrypted != "upland-access-token"
    assert decrypt_token(encrypted, key) == "upland-access-token"


def test_session_is_scoped_and_expiring():
    token = issue_session("admin", "session-secret", ttl_seconds=60)

    assert verify_session(token, "session-secret") == "admin"
