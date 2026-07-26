import base64

from app.config import Settings


def test_settings_accepts_base64_password_hash_without_compose_dollar_interpolation(monkeypatch):
    expected = "$argon2id$v=19$m=65536,t=3,p=4$hash"
    monkeypatch.setenv("ADMIN_PASSWORD_HASH", "")
    monkeypatch.setenv("ADMIN_PASSWORD_HASH_B64", base64.b64encode(expected.encode()).decode())

    assert Settings.from_env().admin_password_hash == expected
