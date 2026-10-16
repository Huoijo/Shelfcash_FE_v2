# 020 — Closed-design implementation and contract reconciliation

Date: 16/10/2026. Current implementation receipt; 018/019 remain historical receipts. The current register remains [FOUND_MISSING_UI_V1](../../status/FOUND_MISSING_UI_V1.md), not this document. No commit/push or live business mutation was performed.

## Authority and inspected designs

BE: [main016](../../../contracts/016/openapi.main.json), supplied SHA `869eaec914aa6905d6b935889afebe7d973004ae`, OpenAPI SHA256 `790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`; 73 operations / 66 paths. This does not attest a deployed SHA or `b0db90c`.

Read the source files and rendered previews for all six canonical families in [MagicPath](https://www.magicpath.ai/files/458079658328604672):

- Store workspace: component `459953227023159296`, revision `461722261150400512`.
- Employee Invitation Acceptance: `460368412145782784`, revision `461725062467305472`.
- OWNER Input: `460747146686242816`, revision `461726308171411456`.
- STAFF Input: `460747115572916224`, revision `461725038614315008`.
- Planning Setup/History: `458414835571515392`, revision `461721652229738496`.
- Planning Results/Exports: `458423352311304192`, revision `461720833971347456`.

The old standalone Input family was not consumed. Prototype selectors, sample creators/domain records, local timers pretending to save, DOM/MutationObserver orchestration and sessionStorage business outcomes were not ported. Existing Auth/Store providers, feature services, native FlowDialog and application workflows remain the implementation boundary.

## Before → current runtime

- API-01 PARTIAL → IMPLEMENTED: `/store` → **Yêu cầu quyền**. Staff opens **Yêu cầu thêm quyền**, selects permissions from PR02's published catalog, supplies reason, confirms **Gửi yêu cầu**. Fresh T02 provides membership authorization/grants version, fenced against the catalog version. Pending requests open **Xem yêu cầu**; Staff can cancel only when allowed. Owner can explicitly select all/a subset, approve or reject with reason/ack. Approved subset is displayed as partial approval without inventing a state enum. All six actual states and submitted/current/approved/actually-added grants are shown. **Đọc lại quyền của cửa hàng** refreshes the Store provider; receipt display does not locally union grants.
- API-02 NOT_IMPLEMENTED → IMPLEMENTED: `/invitations/:id` → **Từ chối lời mời** → reason → **Xác nhận từ chối**. IN01 is separate from N19. Confirmed receipt projects the declined terminal state; no login/logout/delete/accept side effect. Unknown disables acceptance and new decline. **Kiểm tra trạng thái lời mời** reads N18 first. Only a matching pending/can_decline read enables one explicit replay of the original captured body/key/CAS; every subsequent lost replay needs another read. Matching declined readback with declined_at reconciles to an observed terminal outcome without fabricating an IN01 receipt. Revoked/expired/accepted reads stay terminal and do not authorize replay. Definite failure exposes **Đọc lại lời mời**. Existing wrong-account/invalid/unavailable/accept continuation remains; production contains no prototype label or raw `/today` copy.
- API-03 PARTIAL → IMPLEMENTED: Preview lists all `CORRECT_HISTORY_RECORD` rows; **Chi tiết bản sửa** shows source, affected entity references, current/proposed values and available cells/provenance. A required per-row reason and ack stages **Xác nhận cho lần nhập này**. Closing leaves the row unresolved. Multiple exact row/version/reason confirmations join Sales/Supplier in routing, Review and Commit gates, including fresh pinned reads before mutation. New Preview clears staged decisions. Commit captures `history_corrections`; edits are blocked while pending/unknown. Success/failure/permission/stale/readback use the existing whole-import atomic lifecycle. No separately persisted correction action is claimed.
- API-04 PARTIAL → IMPLEMENTED: Planning results → **Bản xuất đã có** opens EX01 independently from **Xuất PDF**. Lists PDF, created time, processing status and artifact availability; loading/empty/error/read-again and pinned load-more are supported. **Tải bản PDF đã có** requires server download allowance and an available artifact; N11 uses registered path plus size/SHA256 verification. Missing/failed/unverifiable does not call N10 or invent expiry duration. Existing new-export confirmation remains separate.
- API-05 PARTIAL → IMPLEMENTED: `/forecast/planning/history` exposes **Người tạo**, **Ngày tạo từ/đến** alongside status and forecast dates. Dates are sent unchanged as date-only filters; BE owns Store-local creation-date interpretation. URL restores filters; individual chips, clear-all and pagination preserve the same filters. Creator choices accumulate actual N9 rows, never prototype sample people or an Owner-only membership directory; a retained selected UUID remains selectable when absent from the loaded rows. This is not a complete creator directory. API validates echoed created-date/creator filters and existing snapshot/page identities.
- API-06 NOT_IMPLEMENTED → IMPLEMENTED for supported declarations: Analyze SourceContext and the shared resolver expose explicit `missing_stockout`, multiple tri-state `stockout_aliases`, `pack_cost_basis`, source keys/evidence and reusable confirmation. No meaning is inferred. Source semantics propose reusable interpretation and retain Profile approval authority for Owner/Staff. Existing **shared_value** `IMPORT_VALUE` remains the separate batch-fact mechanism. Unsupported batch-scoped semantic flags are not sent; see conflict SC020-03.

## UI → state/service → API

- API-01: [PermissionRequests](../../../src/features/store-workspace/components/PermissionRequests.tsx) → useCapabilityQuery/useCapabilityMutation → PR01/02/03/04, fresh T02, Store provider refresh.
- API-02: [InvitationDecline](../../../src/features/auth/InvitationDecline.tsx) + [InvitationPage](../../../src/features/auth/OnboardingPages.tsx) → retained scoped capability mutation / operation-specific N18 observation → IN01/N18. N19 acceptance retains its existing writer.
- API-03: [ImportHistoryCorrections](../../../src/features/import-data/components/ImportHistoryCorrections.tsx) → [global domain gate](../../../src/features/import-data/importDomainReview.ts), importExperience and ImportFlowWorkflow → I05 CommitRequest.history_corrections, I04/J01/I06 retained recovery. Confirm_review is a distinct I05 phase; it does not write canonical history.
- API-04: [RetainedExports](../../../src/features/operations/RetainedExports.tsx) → EX01 reader / capabilitiesApi.exports.downloadRetained → EX01/N11. PlanExport owns N10 separately.
- API-05: [PlanningHistoryPage](../../../src/features/operations/PlanningHistoryPage.tsx) → operationsSource.history / HistoryQuery → N9 with `created_by_user_id`, `created_date_from`, `created_date_to`, forecast-date/status/cursor.
- API-06: [SourceContextEditor](../../../src/features/import-data/components/ImportResolutionEditor.tsx) → ImportFlowWorkflow.resolveMapping → M04 `SourceContext`; reusable decision follows N5/MQ lifecycle, batch facts use M04 `SharedValueResolution.scope=IMPORT_VALUE`.

## Contract reconciliation

These are **CONTRACT_CONFLICT**, not silently revised policy:

- **SC020-01 — Decline reason:** Invitation prototype says optional reason. Main `DeclineRequest.reason` requires nonempty text. FE requires reason, preserves original intent and displays actual server rejection. Files: canonical Invitation `ShelfCashEmployeeInvitationAcceptance.tsx`; main schema; InvitationDecline.
- **SC020-02 — Individual correction save/recovery:** OWNER/STAFF `ShelfCashHistoryCorrectionSurface.tsx` simulates independently saving correction rows. Main exposes only I05 commit confirmations (`HistoryCorrectionConfirmation`), no independent persistence API. FE stages locally with explicit copy, sends only in atomic Commit, and recovers the whole Commit through retained state. It does not report staged rows as already written history.
- **SC020-03 — Batch/reusable semantics switch:** OWNER/STAFF `ShelfCashSourceContextSurface.tsx` presents batch/reusable scope for semantic flags. Main `SourceContext` has no scope field; `SharedValueResolution` has PROFILE_CONSTANT/IMPORT_VALUE for values, not arbitrary semantic flags. FE makes reusable interpretation explicit and preserves separate batch facts. It does not send an invented scope, silently downgrade to batch-only or route these flags through a different DTO. If batch-only semantic flags are a product requirement, BE needs to publish the supported shape/lifecycle before FE can claim that variant implemented.

Follow-up is captured in [FE_ask/020](../../../FE_ask/020_Design_Contract_Reconciliation.md). These adaptations do not reopen approval policy, Staff authority, source_only or unknown/zero/null semantics.

## Mutation and permission safeguards

Writes use current session CSRF, Store/resource ownership, explicit reason, idempotency and revision where contracted. Pending/unknown blocks competing writers; no automatic business retry or optimistic grant/profile/commit success. IN01 replay now has an operation-specific matching N18 read prerequisite in the state controller as well as UI. Reconciliation is an observed terminal state, not a forged mutation receipt. PR04 409/412 requires fresh reader/decision context. A denied replay keeps original uncertainty.

Import correctness is derived from application state and complete pinned rows, not drawer visibility. Unknown Commit preserves confirmations/body/key; its existing product recovery is read-only (not a new replay affordance). Current rights, stale Preview, retired Profile, required action set, identity/mapping blockers, persisted Review and independent Commit reason remain authoritative. Owner self-review and Staff-proposal request_changes rules and the six-step structure remain unchanged.

Recovery remains memory-only. CR-01 durable/negative outcome proof is still open; reload cannot prove an unknown operation did not apply. Current implementation does not claim a generic mutation lookup API.

## Remaining capability audit and next design work

[Per-operation audit](../../testing/PASS_020_CAPABILITY_AUDIT.json) accounts for all 73 published operations against actual route owners and existing feature adapters. This is source reachability accounting, not 73 live acceptance passes.

- **ALREADY_COVERED:** supported Auth/onboarding, Store/member/invitation, permission requests, notifications, mapping handoff/Profile, Menu/Inventory, receipts/thresholds, recipe schedule/retained change, Import/history/domain review/completion, Planning/readiness/saved requirements/budget/results/explanation/export families. Dedicated C01/R01/job screens are NOT_REQUIRED: existing flows consume those facts.
- **PARTIAL_UI:** I03 RT-02 explicit retry of a terminal-failed sealed Analyze remains unwired; the existing failed/retry design is adequate, so this is FE implementation debt. M04 FM-009 descriptor-specific validation/ergonomics remains; existing declaration design does not require another workspace. Richer Today outlook/display/recovery projections remain bounded by published BE data and existing register items.
- **PARKED_PRODUCT_SCOPE:** SC-01 global Profiles, AI, What-if and Draft PO remain parked; no reopened routes or worker brief.
- **BACKEND_ONLY_INTERNAL:** `/health`; no product action is needed. J01 is consumed by the visible processing/recovery state, not a standalone user workspace.
- **NOT_REQUIRED:** a separate correction-save screen/API claim, creator directory fabricated from Owner membership data, automatic replacement exports, generic layout/weather/combo imports outside published scope.
- **Backend limitations remain:** CR-01, CR-02, accepted-file replace/delete/unseal, independent Preview decision persistence, unsupported semantic batch scope and parked downstream contracts. These are not proof of a missing canonical UI.

**NO ACTIVE MISSING UI FOUND** outside the six reconciled designs, existing adequate-design PARTIAL_UI debt, BE gaps, not-required and parked scope. No next MagicPath worker prompt is fabricated. If scope changes, add the concrete backend-supported action/state and design evidence to V1 before implementing it.

## Verification

See [verification receipt](../../testing/PASS_020_VERIFICATION.json) for commands, exact counts, design fingerprints and limitations. Controlled browser checks cover both role entry points, partial approval/reject/cancel/stale/unknown, decline success/failure/read-first recovery, prior acceptance/wrong-account/expired/revoked behavior, multi-correction close/gate/unknown, source aliases/basis/reusable semantics and retained-export read/download/error/unavailable/empty, plus distinct creator/date filters and paging.

No live server/worker/mail/Owner–Staff integration acceptance is claimed. Visual coverage uses the six canonical references and existing primitives; full pixel/a11y acceptance of every design branch remains TD-01/LV-01. Historical FOUND_MISSING_UI bytes and all contract sources remain preserved. Parked scope stays parked.
