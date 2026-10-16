# Sprint 020 — Afternoon backend handoff integration

Date: 2026-10-16. User-authorized implementation follow-up to the afternoon BE response. This supplements [the earlier 020 design implementation receipt](020_Closed_Design_Gap_Implementation.md); it does not overwrite its historical results. Current backlog: [register V1](../../status/FOUND_MISSING_UI_V1.md).

## Authority and reconciliation

Source: [BE package](../../../BE_answer/16_10_afternoon/shelfcash_FE_handoff_d5cfbfb59de7/START_HERE_VI.md), commit `d5cfbfb59de7c45bc08eb47129b5ba3919e05473`. All **155 manifest entries** verified locally. The supplied provenance says **source-only, runtime_deployed=false**. Reported BE tests are BE evidence, not tests performed by FE or deployed acceptance.

[020 OpenAPI](../../../contracts/020/openapi.main.json) SHA256: `18fb4eabe469c69c817fcf5f0c5b4764c3feb1a886adb71b382c19b347147f7a`. Inventory: **76 operations / 69 paths**, adding AS01/AS02/AS03 and 22 schemas. Local comparison confirms every old operation and schema is unchanged. The 252 historical v1/v2 files and existing 011/016 feature pins are preserved. Only the capabilities consumer moves to 020. The [recovery allowlist](../../../contracts/020/recovery_journal.json) is independently pinned and projected by `check:recovery-policy`.

`IMPORT_SCHEMA_LEGACY_HANDOFF_VI.md` audits an older registry. Its 9 types, coercions, combo graph, weather and other historical behavior do not redefine the current 15-schema Import contract. No new import fields or source-semantic defaults were added.

## Implemented scope

- **S20-BE-01 — Contract upgrade: DONE.** New immutable snapshot/provenance/diff/allowlist under `contracts/020`. Generated callable inventory covers all 76 operations. Contract checks verify old-operation/schema compatibility, hashes and historical preservation.
- **S20-BE-02 — Assistant API/state boundary: DONE; product UI pending.** `assistant.createSummary`, `readSummary`, `sendMessage` use existing cookie/CSRF transport, original keys and strict request/response schemas. Existing read/mutation controllers support all three operations. Added fixed two-element tuple validation for chat comparison context. Validate run/generation identity, requested evidence version, optional Store/version pin, locale/explicit option and follow-up context. Preserve diagnostics, references and unknowns. Assistant 409 remains unknown and blocks competing intents. AS02 performs only the explicit retained GET; AS03 has no invented GET/J01 polling. No automatic provider retry, engine-version selector, purchase action or standalone AI workspace.
- **S20-BE-03 — Durable recovery service: DONE at opt-in boundary; runtime rollout pending.** A generated default-deny policy covers 28 operation/phase rules. `prepareRecoveryRecord` validates the original request, records reviewed metadata and stores either the complete allowlisted replay input or no body. Conditional Commit/default-or-saved Planning rules are enforced without adding omitted keys. Credentials, invitation proofs, raw files/cells, chat question/history and unreviewed nested content never enter this journal.
- **S20-BE-04 — IndexedDB and recovery orchestration: DONE at opt-in boundary; native-browser acceptance NOT_RUN.** Lazy IndexedDB adapter requests strict durability; reservation blocks a duplicate key or another unresolved intent in the same actor/Store/operation/resource scope transactionally. Service waits for durable reservation before dispatch, checks current session/scope around asynchronous work, restores pending as unknown, verifies stored body/hash/key/CAS before explicit replay and confirms only after typed receipt validation. Storage failure before dispatch blocks the request; failure after ACK preserves unresolved evidence. Dispatched failures remain conservatively unknown, including denied replay. No silent expiry, deletion or logout purge.
- **S20-BE-05 — Documentation reconciliation: DONE.** Updated current register, contract workflow and indices; [follow-up](../../../FE_ask/020_Backend_Handoff_Followup.md) isolates remaining FE/design/runtime work from available BE capabilities.

Files: [typed service](../../../src/features/backend-capabilities/capabilities.data.ts), [mutation state](../../../src/features/backend-capabilities/capabilities.state.ts), [journal](../../../src/features/backend-capabilities/recovery.journal.ts), [recovery service](../../../src/features/backend-capabilities/recovery.service.ts), [controlled tests](../../../tests/backend-handoff-020.test.mjs).

Journal `confirmed` means a validated acknowledgement of that specific API intent. An accepted 202 still requires the feature's job/completion readers; it does not mean a canonical Commit or background generation finished. The journal is not a workflow engine, a generic mutation-status reader or a cross-tab/cross-device provider-execution fence.

## Runtime boundary and remaining sprint work

The recovery service is **exported but not connected to production hooks or older Import/Planning workflows**. Those callers retain their current memory-based recovery. The new Assistant services likewise have no new product caller. Do not describe either boundary as end-to-end runtime integration or close CR-01/SC-01.

- **S20-BE-06 — Production journal rollout: PENDING FE + Product/Design.** Define explicit retention/logout/shared-device behavior using current MagicPath; audit relevant Owner/Staff surfaces, then connect scoped callers and operation-specific reader/receipt adapters. Do not generically serialize old workflow intents or enable persistent storage silently. Metadata-only intents cannot reconstruct a body from a hash. Existing in-memory exact replay remains distinct from durable replay.
- **S20-BE-07 — Assistant product binding: PENDING current MagicPath/scope audit.** Decide the authorized retained-result surface through existing design authority before wiring UI. Standalone AI remains parked; available AS01–03 do not reopen it.
- **S20-BE-08 — Target-machine acceptance: NOT_RUN.** Validate native IndexedDB disk/quota/blocked-tab behavior, F5/close/reopen, actor/Store/logout transitions, concurrent tabs, lost ACK and original receipt reconciliation. Then test deployed AS01/AS02/AS03 with current Owner/Staff grants, evidence-version conflict, disabled-model fallback and claim/provider uncertainty. Preserve the target-machine PID/process-ownership preflight. This pass did not start FE/BE services, call live APIs, enable models, run workers/migrations or run browser/E2E tests.
- **Existing FE debt remains:** RT-02 terminal-failed sealed Analyze retry and FM-009 descriptor ergonomics are separate existing-design tasks. No new I03 API is needed. This pass changes no Import controls or interaction design.

## Backend findings applied to current truth

- BE fixed matching confirm_review receipt replay after canonical completion and worker uncertain-commit reconciliation. These are BE source fixes; FE does not emulate them or claim deployed repair.
- BE fingerprint may normalize omitted/null Commit reason, but FE still preserves original wire presence, array order, key and CAS.
- PR01/PR04 409 can reconcile lifecycle audit state before rejecting the requested action. A rejected action is not a guarantee of zero side effects; denied replay never disproves the original unknown outcome.
- I02 exact multipart replay exists in BE; this FE helper remains operation-specific/readback-only. It is a FE recovery limitation, not a missing BE endpoint. File bytes are excluded from the generic journal.
- Accepted-file delete/replace/unseal, independent persistence of unsubmitted Preview choices and generic mutation negative-proof/cross-device discovery remain unavailable. A fresh draft never cancels an older uncertain mutation.
- Staged entity proposals/reserved IDs are not immediate independent canonical create+bind. D01 supported sections are not purchase approval. Email proof/credential completion is not an authenticated session; A01/A03/T01 remain separate.
- The BE audit references older FE019 behavior. Current API-01–06 UI integrations retain their existing 020 evidence and statuses.

## Verification

[Afternoon verification receipt](../../testing/PASS_020_BACKEND_HANDOFF_VERIFICATION.json) records this pass separately from frozen earlier 020 evidence.

- Build and all contract/generated-wire gates passed; all 155 supplied manifest entries and 252 historical contract files verified.
- **471 controlled tests passed** across Auth 26, Import 135, Planning 79, Store 118, Operations 30 and Capabilities 83. The capability suite includes 22 new afternoon tests. Recovery orchestration uses an in-memory journal test double; native IndexedDB durability is not certified by those tests.
- Lint exited successfully with two existing `set-state-in-effect` warnings in untouched Onboarding/RecipeSchedule files. Build still reports the large-chunk warning.
- Live BE, browser UI, native IndexedDB and E2E acceptance: **NOT_RUN**. No new MagicPath/UI audit is claimed because this pass changes only API/state/storage boundaries and documentation. No commit/push.
