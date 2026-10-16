# 020 — Canonical design / published contract reconciliation

Date: 16/10/2026. Evidence and runtime: [020 receipt](../docs/sprints/020/020_Closed_Design_Gap_Implementation.md). Current tracker: [FOUND_MISSING_UI_V1](../docs/status/FOUND_MISSING_UI_V1.md). BE authority: main016 SHA256 `790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`.

## CONTRACT_CONFLICT SC020-01 — Decline reason

Invitation revision `461725062467305472` treats reason as optional; IN01 DeclineRequest requires reason. Implemented with required reason. No policy decision is requested: backend contract governs. Design copy should match it on the next canonical maintenance pass.

## CONTRACT_CONFLICT SC020-02 — Correction save semantics

OWNER `461726308171411456` / STAFF `461725038614315008` HistoryCorrection prototype simulates saving individual corrections. I05 supports history_corrections only together with canonical Commit; no per-correction persistence endpoint exists. Implemented as locally staged confirmations; Review is globally blocked until complete; whole-Commit recovery retains original intent. Design should distinguish staged confirmation from canonical success. Do not add an endpoint unless product explicitly wants separately persisted decisions.

## CONTRACT_CONFLICT SC020-03 — SourceContext semantic scope

The same OWNER/STAFF SourceContext prototype offers batch/reusable scope for missing_stockout, stockout_aliases and pack_cost_basis. Main SourceContext has no scope flag. SharedValue.scope is for a value, not an alternative semantic persistence channel.

Safe implementation: semantic declarations explicitly propose reusable interpretation through existing Profile rules; batch facts remain IMPORT_VALUE separately. No new wire key, profile bypass or silent scope conversion. The supported declarations are integrated; batch-only semantic flags are not represented as supported.

Follow-up: DESIGN align the scope explanation with the current contract. If PRODUCT requires batch-only semantic flags, BE first publish their actual DTO and lifecycle. This is a contract extension; no unclear approval policy is being sent back for a new decision.

## Remaining work classification

All 73 operations are accounted for in [020 audit](../docs/testing/PASS_020_CAPABILITY_AUDIT.json). Existing RT-02 and FM-009 are adequate-design FE debt, CR-01/02 are recovery/projection dependencies, and SC-01 remains parked. No additional concrete active missing-design candidate was established, so no next-screen worker prompt is created. Nothing was sent to a MagicPath worker or written to the canvas.
