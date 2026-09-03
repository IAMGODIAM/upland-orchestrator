# Upland Orchestrator — Agent Contract

This repository is a self-hosted private operations product.

## Non-negotiables

- Preserve the read-only Upland boundary. Do not add an endpoint that can purchase, list, transfer, escrow, or mutate an Upland asset.
- Verify webhook signatures before parsing trusted state or writing to storage.
- Never log, return, or place player access tokens in frontend-visible data.
- Tests precede behavior changes. Run backend tests and the frontend build before a commit.
- Use source totals and freshness metadata. Do not invent portfolio valuations, profit, yield, or recommendations.
- Keep production secrets in environment variables only. `.env` is ignored.

## Commands

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
npm run build
docker compose config
```
