# 015 — Canonical Input Flow Technical Debt

**Historical sprint 015 scope:** implementation status below is superseded where stated by [sprint 016](../016/016_Integration_Sprint.md). Import/SU01/Import R01 now use 016; other feature pins remain 011. SU01, source_only/RULE entry, current Import wire and completion Readiness guards have been integrated. MQ/NF/onboarding/optional-reason/deeper parity remain open. Original 015 assessments are retained for traceability, not treated as current endpoint absence.


14/10/2026; capability reconciliation updated 16/10/2026. Frozen design v1: OWNER `461110616439017472`, STAFF `461109945690124288`. FE pinned target remains `contracts/011/openapi.main.json`; this is not the newest BE capability inventory. Baseline debts in [013](../013/013_Import_TechDebt.md) describe that earlier snapshot; superseding evidence and frontend gaps are below. Underconstruction scope is excluded from implementation in this documentation pass.

## Resolved within frontend scope

- Shared 3A/B/C/D overview/resolver, File/Sheet scope, unresolved/all filtering, one issue navigation counter, paging/retry/loading/empty presentation.
- Explicit accepted-source-set confirmation before Analyze; rejected retry/replacement/removal product controls.
- Global domain gate at navigation, Review controls/mutation and Commit; duplicate/extraneous decisions fail closed.
- Two-phase persisted Review → separate Commit reason/ack; Owner no-change path skips unnecessary approval/version creation.
- Full/changed Profile comparison, first-profile baseline semantics, explicit reject and retire acknowledgments, retained permission/error context.
- Read-only uncertain-outcome recovery in product, independent date-scoped Readiness and exact user-declared unit ratio; no sample-derived unit guessing.

## Remaining runtime/API parity

1. **015-API-01 — PARTIAL / FE PROPOSAL TO BE, not runtime.** Positive readback exists for some receipts/resolutions. No guaranteed terminal not-applied or complete N5 outcome read model. Unknown stays locked; no blind replay. Profile rejection/retirement uncertainty and unknown or absent issue recovery may remain blocked; positive filtered-away issues are now searched with a coherent unfiltered readback.
2. **015-API-02 — PRODUCT DECISION / FE PROPOSAL TO BE, not runtime.** Frozen immediate create+bind/import-only recognition scope differs from current M04 new_entity_proposal → Owner → atomic commit. FE exposes supported proposal metadata without claiming entity created.
3. **015-API-03 — PARTIAL / FE PROPOSAL TO BE, not runtime.** Domain decisions stage in FE for I05 commit; no separate persistence/effectivity or ambiguous relationship resolution boundary before Review. Unsupported relationship/date/conflict cases remain blocked; no invented write.
4. **015-API-04 — PARTIAL / FE PROPOSAL TO BE, not runtime.** Source namespace/evidence/locale/amendment supported; general period context/catalog/display identifiers not complete. No unsupported properties submitted.
5. **012/013 retained debts, reclassified 16/10.** Supplier discovery and mapping submission/queue/notification are **available in newer BE source/handoff, not integrated in FE**, rather than absent BE APIs. Explicit candidates/display/aggregates and snapshot/live acceptance still need FE reconciliation. Do not issue duplicate capability requests for SU01/MQ/NF based on old baseline documents; no underconstruction implementation is included in this pass.

Detailed product-level requests: [FE_ask/015](../../../FE_ask/015_Frozen_Input_Flow_Capability_Requests.md). Proposed/design-ready APIs remain separate from source-implemented capabilities, FE integration and live verification. SU01/MQ/NF have newer source/OpenAPI evidence; unavailable exact deployment evidence does not turn them back into DESIGN_READY-only APIs.

## Current BE capability versus FE integration — 16/10/2026

Full evidence, routes, acceptance and priorities: [Import guide §15](../../guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md#15-đối-chiếu-be-main-và-fe--16102026). BE reported main `b0db90c`; exact source not accessible in this pass. Available handoff is `869eaec9` (73 operations/66 paths), local source `052cddee`; FE remains pinned to 011 (54/50). No pin/code/UI was changed and no live E2E was run.

- **Priority: wire parity before feature integration.** Strict old Import validators reject newer valid schema/fields. Controlled probes confirmed `inventory_receipts` descriptor, M02 mapping_revision and N5 response submission/notification fields are rejected. Review required PreviewPage pins and typed effects, plus shared Planning R01 callers; do not loosen arbitrary-object validation to mask drift.
- **FE approval navigation bug.** Owner Profile and Staff handoff entry use global unresolved==0. BE allows eligible RULE candidates in complete valid full spec, missing_fields=[]; approval changes corresponding RULE issues to auto_mapped. Preserve real unresolved blockers, missing fields and CAS rather than requiring a separate M04 for every RULE candidate. Owner self-approval is allowed; no new policy decision required.
- **FE descriptor gate bug.** BE supports available source_only targets, distinct from unsupported/canonical DB fields. FE editor/workflow/shared selectors currently require support===supported. Keep source evidence/input_sources/scope semantics; do not silently IGNORE source_only.
- **Supplier integration gap.** SU01 has supplier.read, q/paging/snapshot/active/version. Import search still only Product/Ingredient; Supplier reader must be integrated, not requested from BE again.
- **Collaboration integration gap.** MQ01 submit/withdraw, MQ02 Store/own queue, MQ03 pinned details/evidence, N5 request_changes and notification APIs exist in newer BE. FE is manual-link fallback with direct approve/reject/retire only. Respect submission/version fences; notifications are not commit authority.
- **Schema coverage gap.** Newer BE has 15 Import schemas; FE enums have 10. Five additions: inventory_receipts, calendar_events, promotion_observations, usage_history, purchase_history. Existing Preview/Review/commit/completion are connected on the old baseline, not proved compatible with the new DTOs.
- **FE commit reason too strict.** BE permits omitted/null reason for pure inserts/NO_OP, while FE UI/workflow/mock always demand it. Keep required justification for corrections and per-action confirmations, plus separate Review reason.
- **FE Readiness permission gate incomplete.** R01 actions=planning requires planning.context.read + budget.read + procurement.cost.read; ImportReadiness checks only the first before enabling CTA. Server still denies unauthorized requests; fix permission feedback and response assessment compatibility without changing completion.
- **Still no BE capability:** accepted-file delete/replace/unseal, separate persisted sales/supplier Preview decisions, general negative mutation-outcome endpoint. Decisions remain staged for commit; recovery uses retained state and operation-specific idempotent replay. General layout/weather/uplift/combo formulas remain outside supported direct Import scope per BE response.

Verification: baseline wire gate PASS (127 schemas/types); Import boundary/workflow/mapping UI controlled tests 67/67 PASS; 9 temporary wire accept/reject probes matched expectations. These checks establish old-baseline behavior and observed incompatibilities, not main deployment acceptance. Next implementation must audit latest OWNER/STAFF designs and preserve existing FM status distinctions.

## Remaining frontend work

- Full-page Step 2 source context and Step 3 resolver share the typed editor; descriptor-specific declaration ergonomics and supported source context choices need further adaptation.
- Profile diff pairs array entries by position; array reorder may display changes conservatively. Full Profile is inspectable and approval always covers the full proposal. Do not use display diff as approval authority.
- DEV catalog retains 81 representative scenarios; frozen catalog includes 160 OWNER and149 STAFF entries including secondary surfaces/aliases. Not every design scenario has a dedicated executable fixture.
- Paginated mapping read failure conservatively discards the scoped read set and requires reload. It never treats a partial/empty page as global completion.
- Per-file retry after browser reload needs replacement bytes; accepted files are not removable through the current runtime contract. Rejected removal preserves canonical I03 acknowledgments.
- A sealed failed Analyze batch can read current status but cannot initiate a new worker attempt without explicit supported server retry semantics; no automatic unseal/re-upload is invented.
- Existing bundle-size warning and two unrelated lint warnings remain; no unrelated refactor was performed.

Missing UI statuses and bounded production adaptations: [FOUND_MISSING_UI](../../FOUND_MISSING_UI.md). A designed state and a passing controlled-response test do not prove live production parity.
