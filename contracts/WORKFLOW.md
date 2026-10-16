# Consolidated workflow and ground truth

Sprint 016 · 16/10/2026. This reconciles v1/v2 workflow facts with the supplied `869eaec9` handoff. Historical bodies remain unchanged in [history](history/PROVENANCE.json). Exact request/response DTOs are owned by pinned OpenAPI, not this narrative.

## Authority and conflict resolution

- Accepted business decisions/ADRs own meaning. Current registered operations/DTOs own wire. MagicPath owns visual interaction. Tests prove only the environment, snapshot and scope actually exercised.
- v1 (09/10) describes design-reviewed routes; its counts and acceptance cases do not establish implemented HTTP APIs. v2 (11/10) supplements an earlier baseline, preserves accepted policy and reports a 54-operation checkpoint; its 9-pass/1-fail offline gate remains historical evidence, not erased by later tests.
- FE 011 pins a different 54-operation/50-path snapshot; it is not byte-identical to v2. Handoff `869eaec9` publishes 73 operations/66 paths. All use `/api/v1`; `info.version=1.0.0` is insufficient to select one.
- Newer prose can contain older checkpoint paragraphs. Apply the handoff's [document mismatch register](../shelfcash_FE_handoff_869eaec9/verification/DOC_MISMATCHES_VI.md) and current source/DTO evidence; do not rewrite older documents to pretend those facts existed earlier.
- BE's user-supplied response for `b0db90c` is reported evidence. This workspace pins supplied `869eaec9`; it does not relabel it as `b0db90c` or assert live deployment. Historical handoff health/OpenAPI/CORS checks did not verify business mutations or worker health.

## Afternoon 020 update — current additive authority

Capabilities now pins source-only BE `d5cfbfb59de7c45bc08eb47129b5ba3919e05473` under [contracts/020](020/provenance.json): 76 operations / 69 paths. All old operations/schemas are unchanged; existing feature pins stay explicit. The older narrative below is contextualized by [the afternoon receipt](../docs/sprints/020/020_Backend_Handoff_Integration.md) and current code. No BE deployment, new UI audit or live acceptance is claimed.

The accepted FE journal direction is operation/phase allowlisted, durable-before-dispatch, current actor/Store/session scoped and default-deny. Full-body replay preserves original presence/order/key/CAS; metadata-only bodies cannot be recovered from hashes. Never persist credentials, proof tokens, raw files/cells or unreviewed chat text. An opt-in IndexedDB/service boundary exists; production callers still use memory pending retention/logout/shared-device design and native-browser acceptance. No generic lookup/negative proof, silent purge or automatic retry is introduced. PR01/PR04 409 may reconcile lifecycle audits; a denied replay does not prove no effect.

AS01 creates/replays a summary explicitly; AS02 reads a retained generation without starting work; AS03 supports original same-key/body POST replay only, with no GET message/J01 recovery. Require current planning.result.read + budget.read + procurement.cost.read; use retained C03 response_version for expected_evidence_version. Preserve diagnostics, references, structured clarification and unknown values. Model-off fallback is supported; HTTP200 does not prove model execution. Version/provider/claim policy stays BE-owned. Standalone AI/What-if/PO remain parked. Legacy import registry prose does not replace the current 15 schemas.

## Authentication and Store

Cookie-backed session is authoritative; A01 login must be followed by A03 confirmation. Protected mutations use current CSRF, Origin and operation-specific key/CAS. No fabricated bearer token, Store ID or mock fallback.

The newer self-service flow is A02 signup → A05 email proof/password → A01 login → explicit T03 Store creation. Signup/verification do not themselves create a session, Store or Owner membership. A05 EMAIL_VERIFY differs from N7 SETUP/RESET. Creating a Store does not seed stock/menu/budget. 019 wires registration/verification/reset and conditional Store bootstrap against frozen designs. A05 still requires subsequent A01/A03; delivery/callback and live verification remain separate dependencies.

Each Store has current membership/grants. Read permission is not write permission; Owner role is not a client-side replacement for server authorization. Cross-Store identifiers do not grant access. Inactive/unknown/null states are not silently coerced.

## Import and profile workflow

1. I01 creates a draft; I02 stages immutable files and returns per-file receipts. Whole-batch quota comes from I04, not page length or local summation. Partial admission/UPLOAD_REJECTED receipts differ from a rejected whole request.
2. I03 seals the explicit accepted source set and acknowledged rejected IDs; J01 reports actual job status. Filename/signature alone does not establish source proof. Provider failure preserves manual resolution.
3. M01/M02/M03 expose mapping/proposals/descriptors. `needs_confirmation` with a target is a proposal to review; `profile_proposals=[]` does not remove M02 column suggestions. `source_only` is supported evidence/source input when available, not unsupported or automatically a canonical DB field.
4. M04 updates typed interpretation/resolution with mapping CAS, not approval. Unknown differs from null, zero, false and explicit IGNORE. Identity binds exact same-Store entities; conversions require declared exact ratios. IMPORT_VALUE is per-batch; PROFILE_CONSTANT affects reusable spec. New entity proposal ACK is not entity creation.
5. N5 Owner approval covers one complete valid full spec; eligible deterministic RULE candidates can be approved together with missing_fields empty and become auto_mapped. Staff cannot approve; Owner may approve their own proposal. No automatic cross-profile bulk decision. MQ submit/withdraw, Store/own queue and pinned detail exist in newer BE; 019 wires submission/withdrawal/queue/detail/evidence and Staff-only request_changes context; exact affected resolver targets remain unavailable. Notifications locate work; they neither approve nor commit.
6. I05 Preview is pinned to source/mapping/read-set/evidence; after reading all coherent pages and resolving supported row decisions, explicit confirm_review persists a separate server confirmation. A separate explicit commit rechecks current authority and facts, writes atomically, and is complete only with retained I06 evidence. 202 and J01 HTTP 200 are not sufficient success conditions.
7. Pure inserts/NO_OP may omit/null commit reason in BE. Correction/amendment and specific row decisions require justification. Current earlier020 UI already supports the conditional reason requirement from complete pinned Preview evidence (FM-003); preserve that implementation and do not regress it based on the BE audit of older FE019.

## Domain invariants retained from v1/v2

- Sales correction replaces the same contribution; independent contributions require explicit disjoint evidence. Reimport is not double addition. Unknown stockout is not false or inferred from quantity zero.
- Recipe quantity needs explicit per-serving/whole-batch basis, yield/loss/units/version/effectivity. Do not union disjoint sheets into a recipe or infer density/pack conversion.
- Supplier price/MOQ require source basis and canonical pack/base-unit evidence; missing costs/fees do not become zero. Purchase history does not create current supplier terms or stock.
- Opening stock, stock count and actual receipt are different operations. Newer main has inventory_receipts plus calendar_events, promotion_observations, usage_history and purchase_history (15 total schemas). History-only inputs do not automatically become forecast features, BOM changes or movements.
- General layout constraints, weather/uplift/combo/discount/derived savings are not new supported import schemas. Accepted-file delete/replace/unseal and separately persisted Preview domain decisions are absent. Recovery has no generic negative mutation-outcome proof; retained reads and operation-specific same-intent replay are distinct mechanisms.

## Completion, Readiness and retained Planning

I06 is the immutable import receipt; R01 is current action/date/authorization readiness. A successful import does not prove forecast quality or planning readiness. Planning R01 needs planning.context.read + budget.read + procurement.cost.read; readiness failure does not roll back import.

Default and supplied planning requests have distinct assessment scope. Missing default configuration does not automatically block a complete custom request that does not use it. Budget zero is a known cap, not unknown. Forecast fallback requires recognized causes; actual model/evidence matters more than requested TRAINED mode. Retained Runs/captures/results do not mutate when input facts change; current facts require a new explicit Run. Engine computation/feasibility/cost/safety remains backend authority.

## Current FE scope and outstanding work

[Sprint 016](../docs/016_Integration_Sprint.md) records implemented slices, deferred integration/design work and exact verification. [FE_ask/016](../FE_ask/016_Integration_Design_and_Verification.md) requests only missing evidence/design/scope clarification, not APIs already supplied. [User flow guide](../docs/guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md) describes actual buttons and recovery. Existing underconstruction Today/AI/What-if/PO flows remain outside this implementation.
