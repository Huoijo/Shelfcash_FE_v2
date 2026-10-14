# 015 — Canonical Input Flow Technical Debt

14/10/2026. Frozen design v1: OWNER `461110616439017472`, STAFF `461109945690124288`. Current runtime target: `contracts/011/openapi.main.json`. Baseline API debts remain [013](013_Import_TechDebt.md); underconstruction scope is excluded.

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
5. **012/013 retained debts.** Current target vs WIP/source/live acceptance, explicit profile candidates, friendly immutable display/aggregate warning totals and Supplier search remain per baseline. Existing queue/outcome dependency remains documented in baseline; no underconstruction implementation or new request is included here.

Detailed product-level requests: [FE_ask/015](../FE_ask/015_Frozen_Input_Flow_Capability_Requests.md). Proposed/design-ready APIs remain **not runtime** until supported by source/OpenAPI and verified.

## Remaining frontend work

- Full-page Step 2 source context and Step 3 resolver share the typed editor; descriptor-specific declaration ergonomics and supported source context choices need further adaptation.
- Profile diff pairs array entries by position; array reorder may display changes conservatively. Full Profile is inspectable and approval always covers the full proposal. Do not use display diff as approval authority.
- DEV catalog retains 81 representative scenarios; frozen catalog includes 160 OWNER and149 STAFF entries including secondary surfaces/aliases. Not every design scenario has a dedicated executable fixture.
- Paginated mapping read failure conservatively discards the scoped read set and requires reload. It never treats a partial/empty page as global completion.
- Per-file retry after browser reload needs replacement bytes; accepted files are not removable through the current runtime contract. Rejected removal preserves canonical I03 acknowledgments.
- A sealed failed Analyze batch can read current status but cannot initiate a new worker attempt without explicit supported server retry semantics; no automatic unseal/re-upload is invented.
- Existing bundle-size warning and two unrelated lint warnings remain; no unrelated refactor was performed.

Missing UI statuses and bounded production adaptations: [FOUND_MISSING_UI](FOUND_MISSING_UI.md). A designed state and a passing controlled-response test do not prove live production parity.
