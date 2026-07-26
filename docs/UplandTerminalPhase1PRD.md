# Upland Terminal — Phase 1 Product Requirements Document

Status: Approved for agent handoff  
Date: 2026-07-24  
Primary objective: Agentic showcase  
Delivery model: Four iterative workstreams with evidence-based gates; agents may execute tasks in parallel, but no phase passes without validation.

## 1. Executive Summary

### Problem Statement

Upland power users manage large portfolios in a contracting, oversupplied market without reliable per-property profit, yield, liquidation, or deal intelligence. Existing community tools are incomplete or abandoned, while DevCore currently summarizes holdings but does not persist asset history or produce decision-grade portfolio analysis.

### Proposed Solution

Build Upland Terminal as an agent-maintained, read-only intelligence layer over the connected user's Upland portfolio. It will combine sanctioned Upland Developer API data with verified public Appchain/Hyperion history, then expose auditable P&L, yield, liquidation, and deal-finding intelligence through a polished dashboard and the DevCore operator agent.

### Success Criteria

- Index at least 99% of properties and NFTs returned for the connected account; report every omitted or malformed asset.
- Reconcile displayed property and NFT totals to source totals with 100% agreement on each completed refresh.
- Produce cost basis, realized/unrealized P&L, and yield results with 100% agreement against a reviewed golden dataset of at least 25 representative properties.
- Every recommendation displays its source timestamps, inputs, confidence, and deterministic reasoning; no unexplained recommendation is release-eligible.
- Complete core dashboard and agent flows without critical errors at 390px, 768px, and 1440px widths; all interactive controls are keyboard accessible.
- Cached portfolio views render within 2 seconds at p95 and refreshes visibly report progress, freshness, partial failures, and completion.

## 2. User Experience & Functionality

### User Personas

- **Portfolio principal:** Owns hundreds of properties and NFTs and needs daily decisions, not raw inventories.
- **Operator agent:** Maintains data quality, detects opportunities, explains recommendations, and prepares a daily decision brief.
- **Reviewer/auditor:** Validates methodology, source provenance, calculation accuracy, and release readiness.
- **Future community user:** A deferred public persona who may receive read-only analytics after the private product proves reliable.

### User Stories and Acceptance Criteria

#### Story 1 — Complete portfolio index

As a portfolio principal, I want every connected asset indexed so that no recommendation is based on an incomplete picture.

Acceptance criteria:

- Imports properties, NFTs, balances, profile, and relevant activity history from approved sources.
- Stores stable source identifiers, raw-source timestamps, normalized values, and last successful sync time.
- Deduplicates repeated source events without dropping legitimate revisions.
- Marks partial refreshes as partial and preserves the last known-good snapshot.
- Shows indexed, rejected, and unresolved record counts.

#### Story 2 — Per-property P&L

As a portfolio principal, I want defensible property-level cost basis and P&L so that I can identify winners, losers, and uncertain holdings.

Acceptance criteria:

- Displays acquisition basis, modeled current value, realized proceeds when available, fees included, and unrealized/realized P&L separately.
- Labels inferred values and never presents estimates as confirmed transactions.
- Links each calculation to its underlying source records and formula version.
- Supports sorting and filtering by city, neighborhood, value, gain/loss, confidence, and liquidity.
- Passes the reviewed 25-property golden dataset with zero unexplained variance.

#### Story 3 — Yield model

As a portfolio principal, I want current and scenario-based yield estimates so that I can allocate assets under mission-conditional earning rules.

Acceptance criteria:

- Shows current yield, annualized estimate, assumptions, mission state, and confidence.
- Supports at least baseline, conservative, and optimistic scenarios without modifying source data.
- Recomputes outputs when a scenario input changes and identifies the changed assumption.
- Includes a methodology panel with formula version and effective date.

#### Story 4 — Liquidation advisor

As a portfolio principal, I want a ranked exit plan so that I can reduce exposure without blindly joining an oversupplied market.

Acceptance criteria:

- Ranks holdings using modeled demand, comparable sales, yield opportunity cost, confidence, and portfolio concentration.
- Provides suggested price range, estimated time-to-sale band, rationale, and known uncertainty.
- Supports an explicit reserve/do-not-sell list.
- Remains advisory and read-only; it cannot list, transfer, sell, or mutate Upland assets in Phase 1.

#### Story 5 — Deal finder

As a portfolio principal, I want undervalued listings identified against transparent comparables so that I can inspect potential acquisitions.

Acceptance criteria:

- Shows candidate listing, ask, comparable range, modeled discount, liquidity indicator, and source freshness.
- Allows filtering by city, neighborhood, collection relevance, price ceiling, discount, and confidence.
- Suppresses stale or insufficient-data candidates by default while permitting an explicit low-confidence view.
- Does not purchase or reserve assets.

#### Story 6 — Agentic daily brief

As a portfolio principal, I want the operator agent to explain the best actions today so that I can move from data to decisions quickly.

Acceptance criteria:

- Produces a maximum of five ranked actions grounded in current Terminal records.
- Every action includes evidence, expected impact, confidence, risk, source freshness, and a direct link to the relevant dashboard view.
- The agent can answer follow-up questions about calculations without inventing unavailable facts.
- If data is stale, partial, or unavailable, the agent states that limitation before recommending action.
- All Phase 1 agent tools are read-only.

#### Story 7 — Audit and iteration review

As a reviewer, I want evidence at each phase gate so that parallel agent speed does not bypass quality control.

Acceptance criteria:

- Each gate records reviewed fixtures, reconciliation results, unresolved risks, screenshots across target widths, accessibility findings, and go/rework decision.
- A failed criterion creates a tracked remediation task and blocks the next release gate.
- Methodology and formula changes are versioned and reflected in regenerated fixtures.

### Non-Goals

- Public multi-user launch, subscriptions, ads, or payment processing.
- Automated purchases, listings, transfers, escrow mutations, or tournament operations.
- Dev Shop construction, Permission Delegation commerce, or tournament product development.
- Guaranteed market value, sale timing, profit, or financial outcomes.
- Native mobile applications; Phase 1 delivers a responsive web experience.
- Replacing DevCore's existing Explorer, Production, World Data, Logs, Roadmap, or agent controls.

## 3. AI System Requirements

### Tool Requirements

- Existing authenticated Upland connection and read-only Developer API access.
- Public Appchain/Hyperion read access for transaction and ownership history.
- Versioned portfolio, asset, transaction, valuation, comparable, recommendation, and sync-run records.
- Read-only agent tools for portfolio summaries, asset details, valuation evidence, yield scenarios, liquidation ranks, and deal candidates.
- Existing DevCore operator agent as the conversational surface; no unrestricted general-purpose mutation tool.

### Evaluation Strategy

- Maintain a golden dataset with at least 25 properties spanning mints, secondary purchases, sales, missing basis, multiple cities, and low-liquidity cases.
- Run deterministic calculation checks on every methodology change; required pass rate is 100% for known-answer cases.
- Evaluate at least 30 agent questions covering summaries, provenance, comparisons, stale data, missing data, and adversarial requests to mutate assets.
- Require at least 95% factual correctness across agent answers, 100% citation coverage for numerical claims, and 100% refusal of Phase 1 mutation requests.
- Review the top 20 liquidation and deal recommendations manually at each release gate; every ranking must be reproducible from stored inputs.

## 4. Technical Specifications

### Architecture Overview

1. The connected user authorizes through the existing Upland authentication flow.
2. A sync orchestrator reads sanctioned account endpoints and public chain history in parallel.
3. Normalizers preserve raw provenance while creating stable property, NFT, transaction, balance, and market records.
4. Versioned deterministic calculators produce P&L, valuation confidence, yield scenarios, liquidation scores, and deal scores.
5. Dashboard queries return the latest completed snapshot plus freshness and sync-health metadata.
6. Read-only agent tools query the same calculated records; the agent does not independently calculate financial values.
7. Logs and review artifacts provide traceability from displayed recommendation to source records and formula version.

### Integration Points

- Reuse the existing Upland connection, authentication webhook, API proxy, readiness monitoring, and portfolio snapshot functions where their current contracts apply.
- Use bearer authentication only for the connected user's approved account endpoints.
- Use application credentials only for sanctioned basic-auth Developer API endpoints.
- Add Appchain/Hyperion ingestion only after documenting endpoint contracts, pagination, rate behavior, identifiers, and freshness guarantees.
- Preserve the self-hosted authentication boundary and admin-only control surfaces.
- Continue using the existing Roadmap for phase tasks and evidence-gate tracking.

### Data Contracts

Minimum persisted concepts:

- **Portfolio snapshot:** owner, source totals, normalized totals, sync status, freshness, rejected count, formula versions.
- **Asset:** source asset ID, type, location/classification, ownership interval, acquisition evidence, current state, source timestamps.
- **Transaction:** source transaction ID, asset ID, event type, amount, currency/unit, fees, counterparties when lawful and available, block/time, raw provenance.
- **Market comparable:** asset/location keys, sale/listing evidence, normalized price, timestamp, source, confidence eligibility.
- **Asset analysis:** basis, modeled value, realized/unrealized P&L, yield scenarios, liquidity, confidence, formula version.
- **Recommendation:** type, rank, score components, evidence IDs, rationale, risk, confidence, freshness, generated timestamp.
- **Sync run:** source, start/end, cursor, counts, partial/complete/failed state, error summary.

### Security & Privacy

- Never expose or persist Upland access tokens in client-visible records, logs, analytics, agent messages, or recommendations.
- Webhooks must validate authenticity before service-role writes; unresolved authenticity blocks public launch.
- Scope service-role operations to the minimum required records and keep all Phase 1 analysis private to authorized admins.
- Sanitize raw provider responses before logging and cap stored payload sizes.
- Agent permissions remain read-only for portfolio intelligence during Phase 1.
- Treat market analysis as informational, display methodology and uncertainty, and avoid guaranteed-return language.

### Quality Requirements

- All primary screens support 390px, 768px, and 1440px widths without clipped content or horizontal page scrolling.
- Keyboard users can reach and operate every filter, table control, disclosure, and agent action.
- Empty, loading, partial, stale, disconnected, and provider-error states are visibly distinct.
- Cached dashboard response p95 is under 2 seconds for a 500-property/2,500-NFT portfolio.
- A complete refresh is resumable after interruption and never replaces a last known-good snapshot with a partial result.
- No release with known critical or high-severity defects.

## 5. Risks & Roadmap

### Phase 1A — Recon, Contracts, and Truth Set

Objective: prove data access and define what can be known before building recommendations.

Deliverables:

- Source contract and field inventory for Developer API and Appchain/Hyperion.
- Versioned data model and normalization rules.
- Complete account reconciliation report.
- Golden dataset and calculation specification.
- Authentication/webhook trust review and private-access boundary.

Gate A:

- Source totals reconcile, unknown fields are documented, golden cases are reviewed, and no critical auth/data-provenance gap remains.

### Phase 1B — Deterministic Intelligence Engine

Objective: build reproducible portfolio analytics independent of presentation or agent prose.

Deliverables:

- Historical asset and transaction index.
- Per-property basis and P&L engine.
- Yield scenario model.
- Comparable valuation and confidence model.
- Liquidation and deal-ranking engines.

Gate B:

- Golden calculations pass 100%, rankings reproduce from stored inputs, partial/stale behavior is proven, and reviewer signs off on methodology.

### Phase 1C — Terminal and Agentic Experience

Objective: turn the intelligence engine into a leading-edge decision surface and auditable agent demonstration.

Deliverables:

- Responsive Terminal overview and asset intelligence views.
- P&L, yield, liquidation, and deal workflows.
- Provenance and methodology disclosures.
- Read-only agent tools and daily brief.
- Deep links between agent evidence and dashboard records.

Gate C:

- Thirty-question agent evaluation meets thresholds, target-width reviews pass, all core keyboard flows work, and every numerical recommendation has evidence.

### Phase 1D — Hardening, Showcase, and Release

Objective: make the private product reliable enough to demonstrate continuously without manual rescue.

Deliverables:

- Resumable syncs, monitoring, freshness indicators, and operator runbook.
- Performance and accessibility remediation.
- End-to-end regression coverage for auth, sync, analytics, dashboard, and agent flows.
- Showcase narrative with live methodology, provenance, and maintenance-loop demonstration.
- Release evidence package and post-release recon cadence.

Gate D:

- Zero critical/high defects, core flow passes end-to-end, p95 targets pass, recon evidence is archived, and the private showcase is approved for ongoing use.

### Technical Risks

- **Incomplete chain history:** preserve uncertainty, expose missing intervals, and prohibit false precision.
- **Provider contract changes:** version adapters, record schema drift, and fail refreshes without corrupting last known-good data.
- **Weak comparable liquidity:** apply minimum sample and freshness rules; prefer no score over a misleading score.
- **Authentication webhook trust:** keep the app private and blocked from public release until webhook authenticity is verified end to end.
- **Agent hallucination:** require record-backed tools, deterministic calculations, numerical citations, and adversarial evaluations.
- **Parallel-agent inconsistency:** assign one canonical contract per domain, require shared fixtures, and merge only through phase gates.
- **Pixel-quality regression:** validate target widths and states at every gate rather than deferring visual review to release.

### Handoff Rules

- Agents may execute independent tasks concurrently within a phase.
- A later phase may be prototyped, but cannot be marked accepted before the prior evidence gate passes.
- Every task must identify its source contract, expected output, test evidence, and rollback or safe-failure behavior.
- New findings that change assumptions must update this PRD, the golden dataset, and affected roadmap tasks before implementation continues.
- Optimize for iteration velocity, not skipped validation: recon, implement, measure, review, and refine at each gate.