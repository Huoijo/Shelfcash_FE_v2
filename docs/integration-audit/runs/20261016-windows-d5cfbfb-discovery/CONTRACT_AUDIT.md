Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# Contract audit and deployment comparison

CURRENT FACT: source current handoff backend/docs/handoff/openapi.json, byte SHA25627cba64462983b88effd0036910ff264a720ba3ef937719b2f9adab6e279649c, belongs to verified source d5cfbfb. Parsed JSON is identical to TLS-verified live OpenAPI. Live response byte SHA256f5db5878d5799770f96035d10c15a7960774329bf2a0bb868cd36ba41aa25d1e; serialization differs, semantics match.

FE main016 pin SHA256790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee is supplied869eaec9,73/66. Unchanged baseline reader pin011 SHA256d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d. All73 operations match live verb/path/path/query/header/body/responses/security JSON and their transitive schema closures exactly. No old operation/DTO incompatibility was found. Only AS01 POST summary, AS02 GET retained summary and AS03 POST messages are added. Older FE version is not a BE defect and does not authorize enabling parked AI UI.

Canonical prose hashes at this checkout: Authorization bd07d11580879fd8d61d7c2af095f6f684ef0f112a6d419100d2ebe18638b2bc; Import068d71b2bf6f35edef2d7bc8e9cc20c089b32f5e2cdc459582ffe6b8491ba504; Planning9a560bd6a389c1f6901f96d0103e8a9abd2b4c8f5394ae80f7b384918d108f51; API808bed92a5ea5bc447b9b1a07ba54ff4714b1b6278c36ac1aa8930cde3af3f7d. Exact runtime meaning still depends on current use cases and actual rights, not document hashes alone.

## Executed static gates

| Command | Exit/result | Disposition |
| --- | --- | --- |
| npm run check:contracts | 1 / FAIL | 97 exact +153 CRLF-only +2 missing macOS .DS_Store among252 manifest entries;0 other content changes. Original-byte provenance does not pass. |
| npm run check:capabilities-wire | 1 / FAIL | In-memory LF diagnostic passes73 operations/467 schemas; no semantic regeneration needed to explain raw failure. |
| npm run check:import-wire | 0 / PASS | 181 schemas/types |
| npm run check:planning-wire | 0 / PASS | 84 schemas/types |
| npm run check:store-wire | 0 / PASS | 25 schemas/types |
| npm run check:operations-wire | 1 / FAIL | In-memory LF diagnostic passes96 schemas; original raw gate remains failed. |

Normalization diagnostics temporarily wrap readFileSync in the ignored harness, only for diagnostic --check invocation. No product/generator/pin/manifest bytes were rewritten. These failures are engineering/transfer observations, not demonstrated user-facing wire defects. Preserve original provenance before any follow-up repair.

## Behavioral audit findings

BUG-001 is the known FE durable-recovery gap independently reproduced across reload, against the accepted current journal direction. It is not a BE idempotency failure. QA-001 is an obsolete controlled N9 fixture missing captured_budget and meta.timezone/applied_filters; strict client rejection is expected. EXP-02 passes with current fields, so the original failure does not establish broken production history.

Shared HTTP structured errors/CSRF/current session, no mock fallback, Store scoping, Upload partial receipts, atomic commit/confirmation separation, exact replay and read fences were covered by the449 controlled/SSR/mock tests and59 existing browser cases. That is not authenticated live enforcement. No permission escalation or leak was demonstrated in anonymous GET probes: body data=null; early token/filter validation and404 resource masking are recorded as observed, not coerced into uniform401 expectations. Public-read error meta is deliberately EmptyMeta with request ID header; missing meta.request_id there is not a wire defect.

Unused/service-only backend endpoints remain capability coverage, not a demand to invent UI. The all76 inventory and observed source references are in SYSTEM_MAP. Full consumer semantic/guard/nullable/optimistic-cache review and every nested control remain incomplete under this environment-limited run; no schema comparison alone closes them.

## Relevant source and accepted decisions

Backend canonical Authorization/Import/Planning/API contracts; ADR007 synchronous PostgreSQL,008 import identity/correction,009 inventory audited mutations,010 unknown facts,011 immutable retained runs,013 Owner-authorized profile self-approval,019 procurement engine,020 requirements/selector,021 temporal capture,022 durable planning. No accepted decision or intent was modified. Current recovery journal allowlist is backend/docs/handoff/recovery_journal.json; exact same-key replay remains operation-specific, not generic negative proof.
