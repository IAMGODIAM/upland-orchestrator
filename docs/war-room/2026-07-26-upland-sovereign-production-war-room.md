# Upland Orchestrator — Sovereign Production War Room

**Date:** 2026-07-26
**Directive:** Produce a private production-ready Upland operations product and remove every application-builder dependency.
**Scope:** Self-hosted private read-only console. No purchasing, listing, transfers, escrow, tournament operations, subscriptions, or public launch.

## Ralph loop

| Iteration | Goal | Gate | Result |
|---|---|---|---|
| S0 | Audit the existing product and identify the truthful release boundary | Build/test/security evidence | Existing client built; no deterministic tests, no CI, typecheck failures, generic vendor runtime, unsafe mutation proxy, unsigned webhook |
| S1 | Replace runtime with sovereign architecture | Zero legacy runtime references | React/Vite + FastAPI + SQLAlchemy + Docker Compose replacement built; tracked-source search returns zero legacy references |
| S2 | Enforce no-execution security contract | Automated security tests | Only an explicit GET allowlist remains; signed webhook and encrypted token functions have tests |
| S3 | Verify a deployable private release | Unit, build, Compose, container, browser gates | Passed locally; live Upland integration remains correctly blocked without configured Upland credentials |

## Seven moves

### 1. Recon
The prior repository had a strong PRD but a generic frontend runtime, no CI or tests, an unbounded mutation-capable Upland proxy, unsigned webhooks, and an initial JS bundle near one megabyte.

### 2. All hands
- Security lane: reduce Upland access to an explicit read-only allowlist; reject mutation methods and non-sanctioned paths.
- Product lane: make source totals and readiness legible without claiming P&L, yield, or valuation.
- Operations lane: containerize for self-hosted deployment with PostgreSQL and private ingress.

### 3. Point and committees
Hermie holds the release decision. The product is structured so external credentials and a real player connection are prerequisites, not silent assumptions.

### 4. Dalio math
A production release has multiplicative controls: `session signing × password verification × token encryption × Upland app credentials × webhook authentication × player connection`. Any zero means no release. The runtime reports this truthfully rather than simulating readiness.

### 5. Red team
- Unsigned inbound webhook: fixed by mandatory HMAC-SHA256 verification before state writes.
- Mutation proxy: removed; only GET against a fixed endpoint set remains.
- Browser token exposure: eliminated; the browser receives only a private session token, not an Upland credential.
- Token-at-rest exposure: Upland access tokens are Fernet-encrypted before persistence.
- False financial precision: disabled; the current product labels outputs as source summaries only.

### 6. Steelman
The prior PRD remains correct in its ultimate target: source provenance, historical index, reviewed golden dataset, deterministic P&L/yield/valuation methodology, and source-backed daily briefs. This build establishes the secure substrate required before that intelligence layer can be trusted.

### 7. Simulation / stress test
**Scenario:** no Upland application credentials or player connection are configured.
**Expected:** authentication works, the UI loads, release gate is BLOCKED, connection start returns a controlled configuration error, portfolio refresh cannot disclose or fabricate data.
**Observed:** container health 200, login 200, readiness 200 with `production_ready=false`, unauthenticated readiness 401, unsigned webhook 401.

## Acceptance criteria

- [x] No application-builder dependency or tracked reference remains.
- [x] Self-hosted React + FastAPI architecture builds.
- [x] Docker Compose validates with PostgreSQL production configuration.
- [x] Strict read-only Upland policy is unit-tested.
- [x] Webhook HMAC rejection and acceptance are unit-tested.
- [x] Token encryption and session handling are unit-tested.
- [x] Browser console is clean; authenticated console reports the actual blocked controls.
- [ ] Real Upland connection is live — intentionally blocked until `UPLAND_APP_ID`, `UPLAND_API_SECRET`, and the verified webhook secret are supplied through the production secret channel.

## Release decision

**Private runtime: PASS.**

**External Upland production connection: HOLD.** No secrets were found in the sovereign environment or GitHub repository secrets, and the product must not reuse a legacy hosted secret store. The hold is an integrity gate, not an incomplete build.
