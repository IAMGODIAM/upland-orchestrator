from app.portfolio import portfolio_summary


def test_portfolio_summary_preserves_source_counts_and_freshness():
    result = portfolio_summary(
        properties=[{"id": "p1"}, {"id": "p2"}],
        nfts=[{"id": "n1"}],
        balances={"upx": 1200, "sparklet": 2},
        source_timestamp="2026-07-26T00:00:00Z",
    )

    assert result["source_totals"] == {"properties": 2, "nfts": 1}
    assert result["balances"] == {"upx": 1200, "sparklet": 2}
    assert result["freshness"]["source_timestamp"] == "2026-07-26T00:00:00Z"
