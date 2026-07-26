#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
npm run build
docker compose config >/dev/null
LEGACY="base""44"
if git grep -in -- "$LEGACY" >/dev/null; then
  echo "FAIL: legacy runtime references remain in tracked source" >&2
  exit 1
fi
if git grep -nE 'validate_read_only_request\("(POST|PATCH|PUT|DELETE)"' backend/app >/dev/null; then
  echo "FAIL: mutation method bypass found" >&2
  exit 1
fi
echo "PASS: sovereign production verification gate"
