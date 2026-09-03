from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _items(payload: Any, keys: tuple[str, ...]) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in keys:
            candidate = payload.get(key)
            if isinstance(candidate, list):
                return [item for item in candidate if isinstance(item, dict)]
    return []


def _number(payload: Any, keys: tuple[str, ...]) -> int | float:
    if not isinstance(payload, dict):
        return 0
    for key in keys:
        value = payload.get(key)
        if isinstance(value, (int, float)):
            return value
        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                continue
    return 0


def portfolio_summary(
    properties: Any,
    nfts: Any,
    balances: Any,
    source_timestamp: str | None = None,
) -> dict[str, Any]:
    property_items = _items(properties, ("properties", "data", "items", "results"))
    nft_items = _items(nfts, ("nfts", "assets", "data", "items", "results"))
    balance_source = balances.get("balances", balances) if isinstance(balances, dict) else {}
    return {
        "source_totals": {"properties": len(property_items), "nfts": len(nft_items)},
        "balances": {
            "upx": _number(balance_source, ("upx", "UPX", "upx_balance", "balance")),
            "sparklet": _number(balance_source, ("sparklet", "SPARKLET", "spark", "SPARK", "spark_balance")),
        },
        "freshness": {
            "source_timestamp": source_timestamp or datetime.now(timezone.utc).isoformat(),
            "partial": False,
            "calculation_status": "source-summary-only",
        },
        "disclaimer": "Portfolio totals are source summaries. Cost basis, P&L, yield, and investment recommendations are not computed until a reviewed historical-index methodology is enabled.",
    }
