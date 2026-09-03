# Upland Orchestrator

Private, self-hosted Upland portfolio operations console.

## Security posture

- **Read-only gateway:** only explicit `GET` paths for profile, balances, properties, NFTs, travels, and Dev Shops are accepted. Transaction, listing, transfer, and purchase methods do not exist.
- **Signed webhooks:** every inbound webhook requires HMAC-SHA256 validation before a database write.
- **Encrypted tokens:** player access tokens are Fernet-encrypted at rest; plaintext is only decrypted in memory for an outbound Upland request.
- **Private operator session:** password-authenticated, short-lived signed sessions; do not expose this service without HTTPS and a reverse-proxy access boundary.
- **No financial claims:** current runtime reports source totals only. P&L, yield, valuation, and recommendations remain disabled until a reviewed historical-index methodology and golden dataset are in place.

## Stack

- React + Vite operator interface
- FastAPI API service
- SQLAlchemy with PostgreSQL in container deployment (SQLite for local tests only)
- Docker Compose deployment

## Local development

```bash
cp .env.example .env
# Generate an Argon2 hash, then base64-encode it for Compose-safe environment loading.
# python -c "import base64; from pwdlib import PasswordHash; print(base64.b64encode(PasswordHash.recommended().hash('choose-a-long-password').encode()).decode())"
uv venv .venv
uv pip install --python .venv/bin/python -r backend/requirements.txt
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
npm install
npm run build
PYTHONPATH=backend .venv/bin/python -m uvicorn app.main:app --app-dir backend --reload
# In another terminal:
npm run dev
```

Open `http://localhost:5173`. The Vite server proxies `/api` to FastAPI on port 8000.

## Production deployment

1. Set all mandatory values in `.env`; never commit it.
2. Use an externally managed PostgreSQL volume or the Compose database for initial private deployment.
3. Deploy behind HTTPS with a Cloudflare Tunnel, reverse proxy, or equivalent access boundary.
4. Register the webhook at `https://YOUR_HOST/api/webhooks/upland` and configure the same signing secret on both sides.
5. Verify all release checks before creating a Upland connection:

```bash
docker compose up --build -d
curl -fsS https://YOUR_HOST/api/health
```

## Required environment

See `.env.example`. No development defaults are safe for production.

## Release gate

A private release is blocked unless `/api/readiness` reports every control ready:
- session signing
- administrator password hash
- token encryption key
- Upland application credentials
- webhook signing secret
- a connected account

## Test commands

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
npm run build
docker compose config
```
