Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# Defects and verification findings

**Product:1 P2 defect reproduced in CONTROLLED browser mode. QA:1 P3 fixture defect. Neither is a live Store/persistence reproduction.** No new P0/P1/P4 claim. Contract transfer observations are kept separately in CONTRACT_AUDIT.

## BUG-001 — Reload drops unknown Store-create intent and permits a competing new key

Severity: **P2**. Area: mutation recovery. Route: `/store`. Role: authenticated synthetic zero-Store account. Store: none/synthetic only. Case: EXP-01. Known scope linkage: existing V1 CR-01, newly reproduced reload edge; do not count this as a separate unknown root cause from CR-01.

Precondition: current FE951ac2d dirty baseline; accepted current d5cfbfb Authorization/journal contract; T03 outcome unknown after transport loss, T01 still empty. Test backend responses are intercepted fixtures, never live PostgreSQL.

Steps: (1) Open /store under synthetic authenticated account with zero Stores. (2) Fill audit-disposable-synthetic, Asia/Ho_Chi_Minh,VND and submit T03. (3) Abort response; observe “Chưa xác nhận được kết quả”, locked mounted writer. (4) Reload. (5) Backend fixture continues returning empty T01. (6) Open Create Store again and submit identical fields.

Expected: preserve original non-secret intent/key through reload and reconcile/exact-replay with current actor/session, or keep a competing writer locked pending resolution. Empty Store list does not prove non-application. Accepted persistent-journal direction explicitly covers T03 fields. A beforeunload warning alone does not provide recovery after reload/crash.

Actual: reload resets the memory-only mutation map; initial form returns and dispatches a second POST /api/v1/stores with identical body but new key. First key d6b07c2c-b0fb-4e84-97b9-8811db8801df; second ade2ed54-3d57-418a-bd84-761d27ed8c5b. No original-intent recovery appears after reload. Both mocked responses are aborted; no canonical Store creation is asserted. [Captured synthetic intents](evidence/20261016-windows-d5cfbfb-discovery/unknown-store-create-synthetic-intents.json) preserve the exact non-secret bodies and keys.

Frontend evidence: src/features/backend-capabilities/capabilities.react.ts retainedWrites module Map; capabilities.state.ts captured in closure; StoreBootstrap.tsx submit constructs crypto.randomUUID(). Network evidence: captured two synthetic POST bodies equal and keys differ; controlled fixture cannot establish either server application. Backend evidence: current T03 same-key replay preserves Store, new key denotes explicit new Store; tests did not call it live. Console: simulated net::ERR_FAILED from aborted responses; no credential/token captured. Screenshot: [unknown after reload](evidence/20261016-windows-d5cfbfb-discovery/unknown-store-create-after-reload.png). Exact harness, assertion error and synthetic request attachment: backend/runtime/verification/integration-audit-20261016/explorer.spec.ts and explorer.json (ignored).

Suspected boundary: browser reload -> intent retention -> keyed T03 recovery. Likely cause: only module/closure memory persists, no approved durable pre-dispatch journal. Confidence: HIGH for demonstrated FE dispatch/fence loss; duplicate live Store risk is inferred from BE new-key semantics, **not observed persistence**. Impact: user may repeat an unknown creation and create duplicates if the first request later applied. Owner: FE. Follow-up: implement accepted journal allowlist/current-actor restoration and failure-before-dispatch guard, or safe equivalent approved recovery; then test lost ACK/reload/late request/relogin. No fix authorized in this run.

## QA-001 — Existing N9 browser fixture violates the current history response contract

Severity: **P3**, verification-only. Area: test/contract drift. Route: `/forecast/planning/history`. Role/Store: synthetic Owner/Controlled Store. Case: BROWSER case for design-states.api.spec.ts:120 (see ledger); EXP-02 is the independent valid-response control.

Steps: run existing controlled-api browser test “History paginates same snapshot and empty filters never manufacture budget or results” using current FE. Handler returns RunSummary without captured_budget and meta without timezone/applied_filters. UI correctly rejects response; test expects “Xem kế hoạch” links and fails0 vs1. Inspect current RunSummary/RunHistoryMeta contract and compare fixture.

Expected: test fixture supplies required nullable/availability values and required metadata rather than testing an obsolete success body. Actual: invalid fixture fails before exercising pagination. Frontend: strict operations.data/wire validator and displayed protocol-error UI. Network: intercepted HTTP200 with missing fields. Backend: backend/app/application/contracts/history.py RunSummary.captured_budget and RunHistoryMeta.timezone/applied_filters are required; unchanged pinned/live schemas agree. Console/screenshot: [fixture rejection](evidence/20261016-windows-d5cfbfb-discovery/history-obsolete-fixture.png); no live backend call. EXP-02 supplies exact current fields, captured zeroVND budget, full meta; pagination/filter/reload passes.

Boundary/cause: stale test fixture versus current wire, not a demonstrated application history defect. Confidence: HIGH. Owner: FE QA; update fixture in an explicitly authorized follow-up and rerun affected history cases. No test/product source changed here.
