from __future__ import annotations

from base64 import b64encode
from collections.abc import Mapping

import httpx

UPLAND_API_BASE = "https://api.prod.upland.me/developers-api"
READ_ONLY_ENDPOINTS = frozenset({
    "/user/profile",
    "/user/balances",
    "/user/assets/properties",
    "/user/assets/nfts",
    "/user/travels",
    "/devshops",
})


def validate_read_only_request(method: str, endpoint: str) -> str:
    normalized_method = method.upper().strip()
    normalized_endpoint = endpoint.strip()
    if normalized_method != "GET":
        raise ValueError("Upland gateway is read-only; only GET is permitted")
    if not normalized_endpoint.startswith("/") or "://" in normalized_endpoint or ".." in normalized_endpoint:
        raise ValueError("invalid Upland endpoint")
    if normalized_endpoint not in READ_ONLY_ENDPOINTS:
        raise ValueError("endpoint is not in the sanctioned read-only allowlist")
    return normalized_endpoint


def basic_auth(app_id: str, api_secret: str) -> str:
    if not app_id or not api_secret:
        raise ValueError("Upland app credentials are not configured")
    encoded = b64encode(f"{app_id}:{api_secret}".encode("utf-8")).decode("ascii")
    return f"Basic {encoded}"


class UplandClient:
    def __init__(self, timeout_seconds: float = 20.0) -> None:
        self.timeout_seconds = timeout_seconds

    async def get(self, endpoint: str, authorization: str) -> Mapping[str, object] | list[object]:
        allowed = validate_read_only_request("GET", endpoint)
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(
                f"{UPLAND_API_BASE}{allowed}",
                headers={"Authorization": authorization, "Accept": "application/json"},
            )
        response.raise_for_status()
        return response.json()

    async def start_connection(self, app_id: str, api_secret: str) -> Mapping[str, object]:
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.post(
                f"{UPLAND_API_BASE}/auth/otp/init",
                headers={"Authorization": basic_auth(app_id, api_secret), "Accept": "application/json"},
            )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, Mapping):
            raise ValueError("Upland returned an invalid connection response")
        return payload
