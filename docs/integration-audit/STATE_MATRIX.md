Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# State and transition matrix

The [case ledger](COVERAGE_MATRIX.md) distinguishes actual static/control/API results from blocked live obligations. Existing concrete browser tests supplied pre-execution scenarios; the complete active ledger was materialized during evidence reconciliation. Inventory and nested-edge audit remain partial, so no exhaustive discovery completion claim is made.

Dimensions retained: unauthenticated/valid/invalid/expired session; Owner/Staff/current each-required-grant; no/one/multi/stale/inaccessible Store; empty/populated/partial/stale/missing entity; loading/error/readback; pending/success/definite rejection/unknown; exact replay versus new-key writer; refresh/deep-link/back/forward/multiple tabs; source/schema/date/quantity/unit precision. Every registered route has a blocked normal live-UI entry case. Every Store surface additionally has separate Owner and Staff live obligations, blocked on assigned membership. Controlled tests carry synthetic fixtures; no live grants are borrowed.

## Lifecycle families and live obligations

| Family | States/conditions represented | Meaningful transitions |
| --- | --- | --- |
| Import batch | draft, analyzing, review_required, ready_for_preview, previewing, committing, completed, completed_with_warnings, failed | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| File admission | uploaded, rejected, not_started, parsed, failed | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Mapping issue | auto_mapped, resolved, needs_confirmation, ambiguous, unmatched | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Mapping submission | submitted, changes_requested, approved, rejected, stale, withdrawn | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Job/Planning/PDF | queued, running, completed, failed | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Review/commit | preview coherent, confirm_review retained, stale preview, permission lost, profile retired, known receipt + failed readback, unknown outcome + exact replay, reload loses intent | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Permission request | pending, approved, rejected, cancelled, satisfied, invalidated | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Invitation | pending, accepted, expired, revoked, declined | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |
| Readiness | ready, blocked, unknown, not_assessed, forbidden, unavailable | Allowed action; denied/stale/conflict; pending; receipt/readback; refresh/deep-link; no duplicate replay |

Import batch state names come from use-case assignments; public Draft/Batch status is a string, so these are discovered source states rather than an invented closed DTO enum. Mapping issues and MQ/PR/job states are typed literals in backend/app/application/contracts. Readiness row mixes assessment values with permission/unavailable UI conditions; those are explicitly conditions, not all one backend enum. Source schema inventory has15 values (INPUT_DATA), not six filenames.

Recipe and receipt additional obligations: current/scheduled/historical/no-current timeline; preview/confirm/commit/withdraw; yield and quantities exact; current lots/empty/missing/null received date; receipt identity replay; snapshot/CAS version conflict; threshold absent/null/zero. Planning: default/saved/custom scope, zero/absent budget, recognized model fallback, warning/no winner/completed, retained digest missing, historical read-only, PDF queued/running/failed/ready/download failure. Detailed live nested-edge enumeration remains incomplete, recorded as a confidence limit; the controlled case titles preserve what was actually exercised.

## Guarded reductions and exclusions

- Public signup/verification do not imply session/Owner/Store, so automatic verified-login/Store creation is not an accepted transition. Real email paths are excluded by the new scope; missing credentials are BLOCKED, never N/A.
- Staff cannot approve reusable profiles; Owner may self-approve. Approval != batch confirm_review != commit. No Manager role or hidden Owner-authority substitution.
- Once source set is sealed, accepted-file delete/replace/unseal is not a current capability. No test invents those writers or claims rollback on browser cancellation.
- Missing budget/cost/read rights cannot be tested by stripping price fields from a successful response. Multi/foreign-Store cases need expressly authorized fixtures, not new Stores or guessed existing IDs.
- Unknown mutation followed by empty lookup cannot unlock a competing intent. EXP-01 adds the previously untested reload edge, reproducing BUG-001; in-app exact replay still passed its original controlled case.
- Provider-backed AI, real email and parked What-if/Draft PO are OUT_OF_SCOPE/NOT_APPLICABLE. Deterministic Assistant reads/responses are conceptually in scope but blocked without a valid authorized retained plan; no model PASS inferred from HTTP200.

## Additional exploratory sweep

EXP-01: unknown T03 -> browser reload -> empty T01 -> same form submits fresh key: FAIL, controlled, BUG-001. EXP-02: current N9 captured zero budget/full meta -> coherent second page -> filter clears cursor -> reload reconstructs filter: PASS, controlled. These are additions beyond the existing59 browser cases. No live fault injection, permission changes, data deletion or arbitrary second-Store fixtures were used.
