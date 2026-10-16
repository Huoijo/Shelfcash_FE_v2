# #003 — Import Flow Integration: evidence and handoff

- Creation date: 11/10/2026.
- General context: Milestone08 extends the existing immutable Import Batch upload/analyze flow toward mapping, preview, explicit commit and retained completion. This document separates FE implementation evidence from backend contract, reported implementation and actual live acceptance.
- Status: partial FE integration handoff, not end-to-end acceptance. The guarded continuation UI, adapters, deterministic DEV scenario and focused checks are implemented. API mapping confirmation/commit remain deliberately blocked at underspecified DTO boundaries; there is no successful live backend flow.

The whole Import flow is **not complete or live-verified**. The first live boundary is A03: the configured backend at `http://localhost:8000` was not listening during the read-only audit. The first incomplete contract boundary after analysis is the rich mapping descriptor/issue DTO surface; the supplied root contract does not fully type every extension needed for safe writable resolution. Neither condition permits API-to-mock fallback.

## A. Contract / MagicPath audit

Authority is the root package `shelfcash-fe-handoff/1-20261009-184259`, handed over 09/10/2026, especially [Import Contract V1](../../../contracts/history/v1/IMPORT_MAPPING_API_CONTRACT_VI.md), [Authorization V1](../../../contracts/history/v1/AUTHORIZATION_CONTRACT_VI.md), [aggregate contract](../../../contracts/history/v1/SHELFCASH_API_CONTRACT_V1_VI.md) and the newer [Import Batch mechanics response](../../../contracts/history/v1/IMPORT_BATCH_MECHANICS_RESPONSE_VI.md). The [package README](../../../contracts/history/v1/README_VI.md) explicitly distinguishes design-reviewed routes from implemented/verified HTTP APIs. Historical references are used only where root V1 incorporates their field definitions; their old identities, policies and runtime claims do not override root V1.

Routes below are relative to `/api/v1`:

- M01 `GET /imports/{import_id}/mapping-summary`: whole-batch mapping progress, files/sheets, immutable binding references, profile proposals, blockers and allowed actions. `can_process` may alias `can_preview`, never `can_commit`.
- M02 `GET /imports/{import_id}/mappings`: paged review queue and read-only successful pairs. Canonical statuses are `auto_mapped`, `resolved`, `needs_confirmation`, `ambiguous`, `unmatched`. Filter counts are scoped before the status filter, not derived from the visible page.
- M03 `GET /imports/{import_id}/sheets/{sheet_id}/field-options`: server-owned descriptors and target availability in the current sheet/schema context. No hardcoded general-purpose field catalog.
- M04 `PATCH /imports/{import_id}/mappings/{mapping_id}`: confirm a proposal value using an issue-specific typed resolution. Column body remains `{target_field}`. A resolved issue is not an approved/activated profile.
- I05 preview `POST /imports/{import_id}/process`: `{phase:"preview", mapping_revision}`, quoted `If-Match` import revision, same-intent idempotency. A `202` starts a job; it is not business completion.
- Commit uses the same I05 route, not a new endpoint: `{phase:"commit", preview_id, preview_digest, confirm:true, reason, resolutions}` with the current quoted import revision. Business writes are atomic and explicit.
- I04 `GET /imports/{import_id}`: source/batch state and pinned preview read via `include_preview=true`, `preview_id`, row cursor/filter. Summary counts remain whole-preview counts.
- I06 `GET /imports/{import_id}/completion`: retained durable committed/no-change outcome, impact counts, versions, readiness and audit reference. It is not an optimistic summary computed from preview rows.
- J01 `GET /jobs/{job_id}`: canonical queued/running/completed/failed job state, resource-discriminated result and terminal error.
- R01 `GET /stores/{store_id}/readiness`: current canonical action readiness. I06 readiness is a point-in-time receipt; R01 is not a client-computed forecasting threshold.
- N5 `POST /stores/{store_id}/mapping-profiles/{profile_id}/decisions`: separate Owner-only full-version decision. This milestone must not invent a truncated approval request or a Staff/Owner bypass.

M04 contract discrepancy: the route summary says CAS import revision, but the precise §9.2 operation and incorporated v0 M04 specification require **`If-Match: "<mapping_revision>"`**. The precise operation wins for M04. I03/I05 continue using import revision. Do not add an alternative body revision guard or silently try both.

MagicPath read-only audit used project `458079658328604672`, “ShelfCash · Ghép cột dữ liệu · Bước 2/5”:

- Mapping component `458395069779681280`, generated name `peaceful-time-1303`, selected/base revision `458401934337019904`. Sources: `ShelfCashMappingScreen.tsx`, its CSS and `ShelfCashMappingData.ts`.
- Completion component `458406500038234112`, generated name `rapidly-room-8445`, selected/base revision `458407962478804992`. Sources: `ShelfCashCompletionScreen.tsx`, its CSS and `ShelfCashCompletionData.ts`.
- Existing History component `458255053002780672`, generated name `radiantly-room-8537`, selected/base revision `458402037797892096`.
- The project contained ten components; no separate Preview, Commit or Review component was present. Preview/commit UI therefore needs minimal consistent composition, not a fabricated MagicPath source attribution. No remote design was edited and no canvas was opened.

Mapping design references the existing monochrome shell, breadcrumb/title/help, whole-batch summary/progress, file/sheet navigator, status-filtered queue, source sample cards, one native target select and explicit confirmation per issue, collapsible successful pairs and a bottom continuation gate. The desktop split stacks on smaller widths. Completion references a retained-outcome summary, source metrics, impact cards, readiness/action card and quiet History link.

Prototype-only behavior is not contract authority: fixture field catalogs/AI confidence, local resolution counters, generic `confirmation` status, local “Continue” announcement, fixed success/impact counts, generic forecast-ready boolean and `42/140` threshold. Prototype `/data-import`, `/forecast` and `/sales-data` paths do not authorize routes/features. Existing `/imports` and `/imports/history` remain canonical FE navigation. Unknown future actions stay unavailable.

## B. Backend readiness

Readiness labels describe evidence, not optimism: `CONTRACT_ONLY` is design/schema only; `IMPLEMENTED` requires implementation evidence (reported evidence is explicitly qualified); `VERIFIED_CONTROLLED` is a controlled test, not a live user session; `VERIFIED_LIVE` requires actual configured-backend execution. `BLOCKED` records why the next boundary cannot be accepted. FE controlled checks and backend-reported controlled checks are separate evidence.

- A01/A03/A04 and T01/T02: `CONTRACT_ONLY`; live acceptance `BLOCKED` before A03 due to connection refusal. Previous FE Auth/Store controlled-response tests do not prove backend cookie/CSRF/session/CORS implementation.
- I01 draft: `IMPLEMENTED — reported` by the newer mechanics response; targeted backend controlled evidence is reported. Current FE boundary exists; Milestone08 FE controlled browser regression passed. `VERIFIED_LIVE`: no.
- I02 immutable multi-call upload: `IMPLEMENTED — reported`; reported controlled quota/receipt evidence. Current FE boundary exists; Milestone08 FE controlled browser regression passed. `VERIFIED_LIVE`: no.
- I03 seal/analyze: `IMPLEMENTED — reported`; reported staging/analyze evidence. Current FE boundary exists; Milestone08 FE controlled browser regression passed. `VERIFIED_LIVE`: no.
- I04 source read/quota: `IMPLEMENTED — reported`; reported controlled PostgreSQL coherence evidence. FE controlled source reads and the separate DEV pinned-preview scenario passed. Exact rich pinned-preview HTTP behavior is not independently live-verified. `VERIFIED_LIVE`: no.
- M01: BE `CONTRACT_ONLY` for the exact HTTP surface, with genuine rich DTO gaps; FE core-field read `VERIFIED_CONTROLLED`. Live `BLOCKED`.
- M02: BE `CONTRACT_ONLY` for the exact HTTP surface. Incorporated v0 item/filter-count fields exist; additional issue metadata union is underspecified. FE queue/read-only diagnostic handling `VERIFIED_CONTROLLED`. Live `BLOCKED`.
- M03: BE `CONTRACT_ONLY`; root descriptor semantics exceed the complete supplied wire schema. FE disabled-option/contract-blocker handling `VERIFIED_CONTROLLED`. Live `BLOCKED`.
- M04: `CONTRACT_ONLY`; column confirmation can be wired to §9.2, but non-column resolution/profile authority must not be inferred. Live `BLOCKED`.
- I05 preview: `CONTRACT_ONLY` for exact route/receipt acceptance. The supplement reports authorized staging/preview implementation and controlled tests, but does not establish each M*/I05 HTTP wire boundary. Live `BLOCKED`.
- I05 commit: `CONTRACT_ONLY`, implementation `BLOCKED`. The newer supplement explicitly says canonical atomic commit/receipt/count/supplier integrations belong to S4.5/S4.6 and had not started.
- I06: `CONTRACT_ONLY`, implementation/live `BLOCKED` behind canonical commit and complete retained receipt schema.
- J01: BE `CONTRACT_ONLY`; FE validation/controller tests and controlled analysis browser handling `VERIFIED_CONTROLLED`. Separate DEV preview/commit jobs also passed. `VERIFIED_LIVE`: no.
- R01: `CONTRACT_ONLY`; no current live readiness evidence. If not consumed by the final implementation, record it as not called rather than imply verification.
- N5: `CONTRACT_ONLY`; no approval UI/API bypass. Unsupported profile decisions remain blocked.

The supplement reports targeted PostgreSQL tests (including a later 13-case mechanics gate). These overlapping backend-reported runs must not be summed or presented as this checkout's FE/live tests. The package does not contain the referenced backend source, migrations or test environment.

## C. Actual user workflow

Existing verified FE foundation is Upload → explicit Analyze, including local picker/drop checks, canonical receipts/quota, multi-call upload, exact seal acknowledgment and in-memory History navigation continuity.

The implemented DEV scenario is Upload → explicit Analyze → Mapping → Review → Preview → explicit Commit → retained Result. It uses an already-approved inventory profile, read-only successful mapping pairs and two fixed `inventory_count` rows, paged one row at a time. Uploaded bytes are not parsed into this scenario and it performs no real business writes. Preview/commit each enter a job state and only advance after canonical-shaped source/job/receipt reads. History roundtrips retain the current in-memory workspace; leaving that route branch or refreshing loses memory, with no fake resume.

API mode has the same UI and narrow adapters, but is a partial flow: M01/M02/M03 reads can show validated core fields and read-only diagnostics; unknown issue/descriptor metadata disables M04. Preview adapters/polling exist, but opaque counts/bindings/domain extensions disable commit. I06 renders only a validated retained receipt, not optimistic preview totals. This arrow is not evidence of a complete API or live backend flow. API errors stay honest, with no fixture substitution.

## D. State machine and transition gates

Canonical Import states are `draft`, `uploaded`, `analyzing`, `review_required`, `ready_for_preview`, `previewing`, `preview_ready`, `blocked`, `committing`, `completed`, `completed_with_warnings`, plus technical `failed`. Canonical job states are `queued`, `running`, `completed`, `failed`. Do not introduce server statuses for FE loading or selection.

`importFlow.stage.ts` projects canonical lifecycle into FE presentation stages `LOCAL_SELECTION`, `DRAFT`, `UPLOADING`, `UPLOAD_REVIEW`, `ANALYZING`, `MAPPING`, `MAPPING_COMPLETE`, `PREVIEWING`, `PREVIEW_READY`, `BLOCKED`, `COMMITTING`, `COMPLETED`, `FAILED`. They are display states, not server values. `ImportFlowWorkflow` keeps the Mapping/Review/Preview/Result view, selected sheet/filter, loading/error/notice, job/poll hint, pinned preview, reason/acknowledgment and retained pending write intent. These tabs never grant an action.

Transition authority must remain server state + allowed actions + permission + current revisions + absence of blockers. Completed mapping progress alone is not profile approval or commit capability. Seal locks source upload. Changes in mapping/profile/source versions invalidate commit capability without mutating an old retained preview. `202` stays processing; only a terminal durable job/read advances to the next business view. Failed jobs are displayed as failures, even when J01 itself returns HTTP200.

## E. Mapping implementation boundary

Implemented work uses one narrow Import boundary, not a global domain engine:

- M01 supplies whole-batch summary, file/sheet navigation, progress and preview gate.
- M02 supplies the paged queue, filter counts and successful pairs; samples are escaped text, at most the canonical bounded sample content, not row HTML or complete profile approval evidence.
- M03 supplies per-issue server options. Unavailable, `source_only`, `unsupported`, duplicate or untyped descriptors are not writable choices. Targets are unique within sheet schema context; the same target in independent sheets is not globally prohibited.
- M04 sends only a supported explicit issue variant, quoted mapping revision, current central CSRF and a stable same-intent key. Confirmation is not activation. No automatic write on select.
- On success, fresh canonical progress/revision is authoritative. A `412` or stale-version response invalidates stale options/queue/preview capability and requires reread; no silent overwrite or automatic mutation replay.

The UI has a file/sheet navigator, native status filter, review-only checkbox, read-only successful pairs, source samples, per-issue option loading, native target select and a separate explicit confirmation button. DEV default has no unresolved issue, so its empty review queue is legitimate rather than a shortcut. API responses always mark the currently underspecified issue/descriptor extensions unsupported, disabling confirmation with a visible contract explanation. Owner-only optional-ignore/full-profile approval, unknown non-column variants and unsupported source/domain semantics remain blocked. Missing required facts are unknown/blockers, never zero. Controlled keyboard/disabled/escaped-text checks are recorded in §K.

## F. Preview implementation boundary

Preview starts with I05 phase `preview`; J01/I04 reads observe its outcome. Rows come only from the pinned I04 preview, with its immutable `preview_id`/digest/source-set/bindings and row cursor. The boundary accepts a canonical classification filter, but there is no classification-filter UI in this milestone. The screen shows server group totals, source/before/after/provenance and row pagination in keyboard-focusable locally scrolling tables. It never combines pages from different preview identities or computes whole-preview totals from loaded rows.

Warnings remain warnings; errors/blockers and required confirmations remain gates. Unknown before/after domain DTOs and supplier confirmation shapes are not writable evidence. Read-only diagnostic display retains escaped raw extension data but cannot establish commit eligibility. API preview `counts`/`mapping_bindings` are deliberately marked unsupported until their full DTOs are supplied, so API commit cannot be reached by this release. Mapping/source/profile changes invalidate continuation and require a new preview. DEV two-page pinning, full-read gating and exact string rendering passed browser checks.

## G. Commit, jobs and retained result

Commit uses an explicit inline confirmation section (not a separate modal): all current pinned pages must be read; required reason must be nonblank; the user must check the acknowledgment and press “Xác nhận và ghi dữ liệu”. Editing the reason or loading another page clears acknowledgment. The write carries current preview/digest, current import CAS revision, stable idempotency key and exact reason/resolution payload. No commit on preview completion, navigation, refresh or polling. A timeout/transport uncertainty preserves the same intent rather than inventing a new key; changed payload is a new intent only after resolution of the uncertain one.

Async `202` is pending. J01 must validate operation/context/result identity and terminal error semantics, respect polling guidance, stop on terminal/failure/abort, and avoid overlap or unbounded fabricated progress. A terminal commit still needs canonical I04/I06 retained outcome before success UI. `completed_with_warnings` differs from failure; all-unchanged `no_changes` means no retained business updates, not imported-count success.

I06 alone supplies retained summary and distinct impacted-resource counts. The screen distinguishes `no_changes`, warnings and unknown counts; it does not show current entity totals as impact, infer inventory updates from ingredient creation or infer forecasting readiness from dataset size. Current action readiness remains the I06 receipt's point-in-time assessment; R01 is not called. Forecast stays disabled because its screen is unimplemented. History stays a separate uploaded-time resource and navigation does not resubmit work. DEV explicit async commit → retained I06 passed; separate isolated component fixtures check no-change/warning/unknown-count rendering. Sales replacement/merge confirmation UI, supplier confirmation, Owner N5 approval and broad API commit remain blocked. Live atomic commit/receipt acceptance is blocked.

## H. Real backend integration evidence

- Public backend URL is configured as `http://localhost:8000`; `.env.local` currently selects `VITE_DATA_SOURCE=api`. This is the user's existing configuration and was not changed by this audit/document task.
- Read-only audit found no port8000 listener. `curl /health` returned connection refusal, exit7 / HTTP000. This health probe is not A03 acceptance.
- First real application request boundary is A03 `GET /api/v1/auth/me`; connection establishment is blocked before authoritative session/CSRF validation.
- Real login passed: no. Real Store resolved: no. Live Import, mapping, preview, commit, completion, readiness or jobs exercised: none.
- Non-intercepted API-mode browser check confirmed A03 `net::ERR_CONNECTION_REFUSED`; React development bootstrap also emitted an aborted A03 read. Only A03 GETs were attempted; no business request or credential submission occurred. The visible error was “Không kết nối được máy chủ”.
- Request IDs: none available; no HTTP backend response was received. Controlled fixtures use synthetic request references and must not be presented as live IDs. No credentials, cookies, CSRF tokens, authorization values or source file bytes belong in this document.
- No live/staging/production readiness claim. Controlled route fixtures prove FE handling only; API mode must never fall back to them.

## I. Relevant source tree

Existing foundation:

```text
src/pages/imports/ImportPage.tsx
src/pages/imports/ImportWorkspace.tsx
src/features/import-data/importData.{types,validation,data,workflow,files,fixtures}.ts
src/features/import-data/components/Import{Upload,BatchPanel,Help}.{tsx,css}
src/features/auth/                       # session/CSRF authority; not Import state
src/features/store/                      # canonical Store scope; not Import state
src/shared/http/                         # protected JSON/multipart/session errors
tests/import-batch.test.mjs
tests/auth-session.test.mjs
```

Milestone08 additions:

```text
src/features/import-data/importFlow.{types,validation,data,workflow,fixtures,stage}.ts
src/features/import-data/components/ImportFlow.tsx
src/features/import-data/components/ImportFlow.css
src/features/import-data/components/ImportMapping.tsx
src/features/import-data/components/ImportPreview.tsx
src/features/import-data/components/ImportResult.tsx
tests/import-flow-boundary.test.mjs
tests/import-flow-workflow.test.mjs
tests/import-stage.test.mjs
docs/sprints/003/003-import-flow-integration.md
```

`ImportWorkspace` composes per-instance batch and continuation sources/workflows; existing mock source has a narrow instance-local continuation bridge, no global map, persistence or file parser. Poll scheduling is scoped to the mounted workspace and canonical job hint. Auth and Store remain separate owners.

## J. Exact files changed

Documentation/browser owner changed only `docs/sprints/003/003-import-flow-integration.md` in the repository; browser scripts/screenshots live outside it. Final milestone working-tree manifest (25 files):

```text
README.md
docs/architecture/001-architecture-foundation.md
docs/sprints/002/002-technical-debt-and-integration-todo.md
docs/README.md
docs/sprints/003/003-import-flow-integration.md
src/features/import-data/components/ImportBatchPanel.tsx
src/features/import-data/components/ImportHelp.tsx
src/features/import-data/components/ImportFlow.css
src/features/import-data/components/ImportFlow.tsx
src/features/import-data/components/ImportMapping.tsx
src/features/import-data/components/ImportPreview.tsx
src/features/import-data/components/ImportResult.tsx
src/features/import-data/importData.fixtures.ts
src/features/import-data/importFlow.data.ts
src/features/import-data/importFlow.fixtures.ts
src/features/import-data/importFlow.stage.ts
src/features/import-data/importFlow.types.ts
src/features/import-data/importFlow.validation.ts
src/features/import-data/importFlow.workflow.ts
src/pages/imports/ImportPage.tsx
src/pages/imports/ImportWorkspace.tsx
tests/import-flow-boundary.test.mjs
tests/import-flow-workflow.test.mjs
tests/import-stage.test.mjs
tests/run-import-batch.mjs
```

Unrelated/user-owned changes are preserved. Canonical contract files and `.env.local` were not edited. No commit or push.

## K. Validation evidence

Milestone08 focused command evidence reported by the integration owner on 11/10/2026; prior milestone counts are not reused:

- Import focused tests: `npm run test:import` passed 61/61 (31 staging, 12 boundary, 17 workflow, 1 stage projection).
- Auth focused regression: `npm run test:auth` passed 26/26.
- Build: `npm run build` passed; explicit `VITE_DATA_SOURCE=api npm run build` passed.
- Lint: `npm run lint` passed, zero warnings.
- Diff/whitespace review: `git diff --check` passed; exact manifest recorded in §J.
- Browser: ten observed groups passed, zero page errors: five full DEV journey groups, two controlled API UI/logout groups, one non-intercepted A03 connection-failure check and two isolated UI-component fixtures. None is live backend success.
- Responsive: Mapping/Review/Preview/Result passed 320/390/768/1440 page-overflow checks. Preview tables scroll inside their panels at narrow widths; desktop can fit without horizontal scrolling. Desktop/mobile screenshots were visually inspected.
- Accessibility: keyboard picker, tab-change heading focus, native filter, explicit reason/acknowledgment gate/reset, focusable table scrolling, HDSD Enter/Escape/close-focus restoration and disabled pending/future actions passed DEV browser checks. A known-type isolated mapping fixture verified labeled native select focus, selection without auto-submit and explicit Enter confirmation. Native select popup ArrowDown navigation was runner-sensitive and is not certified; standard `selectOption` exercised selection. Unknown API options/confirm remain disabled. Samples resembling HTML stayed escaped text.
- Regression: DEV upload/quota/seal, successful-pair/History state retention, I06/History navigation, Login preview, Inventory, Menu, Sidebar and legacy redirect passed. Controlled A03→T02 gating, current central CSRF, GET without CSRF, `credentials:include`/no-store, I03 quoted import CAS and bodyless204 logout passed. Full Login failure/Store matrix was not repeated in this browser milestone; focused Auth regression passed 26/26 above.
- Live integration: `BLOCKED` at A03 connection; no live successful flow or backend request IDs.

Artifacts are outside the repo in `/private/tmp/shelfcash-import08-qa.rlLVKa/`: `check.mjs` (DEV full journey), `api-check.mjs` (non-intercepted bootstrap plus controlled API UI) and `component-check.mjs` (explicit isolated UI fixtures, not backend acceptance). Screenshots use `{mapping,review,preview,result}-{320,390,768,1440}.png` and `api-mapping-blocked-{320,390,768,1440}.png`, plus `api-live-bootstrap-blocked.png`, `component-mapping-confirm-390.png` and `component-no-changes-390.png`. Representative `mapping-390.png`, `mapping-1440.png`, `preview-390.png`, `result-1440.png`, `result-320.png` and `api-mapping-blocked-390.png` were visually inspected. Browser skill was read fully; the required callable connection tools were absent, so a fresh isolated installed Chrome/Playwright runner was used. Each owned browser closed in `finally`. The two QA dev servers started for this milestone (5201/5202) were stopped after checks; pre-existing servers and user profiles are untouched.

## L. Explicit non-implementation

No expansion of Inventory, Menu, forecast, procurement, catalog mutation, sales engine, AI/classification engine, Store switching, Owner profile-management dashboard or auth/session protocol. No new File Sample download/content, arbitrary supplier Excel compatibility, FE mapping catalog, conversion engine or supplier matching heuristic. No reset/undo/remove of accepted source receipts. No fabricated backend endpoint, token, session, cookie, persistence/resume or mock fallback. Existing unrelated routes remain within their previous scope.

## M. Remaining blockers and exact incomplete boundaries

FE work: the narrow adapters, continuation UI/orchestration and deterministic approved-inventory DEV flow are implemented and tested, not a complete general Import integration. API M04 and commit remain blocked by intentionally unsupported extensions. Owner profile approval UI, optional-ignore/non-column resolutions, sales overlap evidence UI, supplier-change confirmation, live R01 refresh, preview classification filter UI and durable server resume are not implemented. Some are deferred features; others require complete canonical DTOs before safe implementation. Runtime validation fails closed without turning retained diagnostics into mutation authority.

BE work: no reachable configured service; Auth/Store live preconditions are unverified. The supplement reports staging work but explicitly excludes canonical atomic commit/receipt/count/supplier integrations, which had not started. Backend source/test/deployment evidence for exact M01–M04/I05/I06/J01/R01 routes is not supplied by this checkout.

Contract gaps requiring the same-version BE owner response:

- M01 nested `sheets`, `binding_refs`, `profile_proposals` and full profile specification/diff/evidence structures are not completely typed by the supplied wire contract.
- M02 adds `issue_type`, `resolution_origin`, `profile_ref` and source metadata without a complete discriminated union/enum shape for every writable variant. Incorporated v0 `items` and `filter_counts` are available and are not themselves missing schema.
- M03 v0 supplies option `key`, availability/reason and preference; root adds type, requiredness, support and unit semantics without complete exact metadata keys/enums. The first rich descriptor/issue boundary must remain read-only/blocked where the required writable semantics are unknown.
- Preview requires discriminated domain-specific before/after payloads, not arbitrary dictionaries, but the supplied example does not define the full sales/recipe/catalog union. Counts and supplier actions/confirmation binding across rows/pages need exact DTO definitions.
- Supplier `confirmations.supplier_changes` and relation to preview row identity are not complete enough to infer a valid mutation. Unknown supplier changes stay blocked, not silently accepted or dropped.
- Commit `202` exact receipt is not shown as fully as preview `202`; only canonically verifiable identity/job/status/revision may be normalized. An unknown response must retain uncertain intent, not claim completion.
- I06 classification-count keys and any still-undefined domain receipt/readiness variants need exact schemas before broad acceptance.
- §13 `include=configurations` / `include=preview` versus §9.3 `include_preview` needs additive-query clarification. Do not switch the canonical precise pinned-preview request or invent a second preview endpoint.
- M04 CAS summary discrepancy is resolved for FE by precise §9.2 mapping-revision authority, but should be corrected by the contract owner in a future canonical package, not by editing canonical docs here.

Staging/deployment: provide an authorized reachable BE, same contract snapshot, real login/current membership, credentialed CORS/Origin/cookie policy, CSRF/If-Match/Idempotency-Key exposure and actual job/retained-receipt behavior. Do not work around missing auth with a development Store ID or supplied fake token.

Production verification: live cookie/CSRF rotation, current permissions, concurrency/replay, real parser/source admission, canonical atomic writes and retained result/count/audit semantics, load behavior, SPA hosting and monitored deployment remain unverified. Mock/controlled acceptance cannot close these items.

Current stopping point: A03 connection is the first live blocker; rich M01/M02/M03 descriptor/issue DTOs are the first incomplete continuation contract boundary. N5 Owner approval is never bypassed, and unknown supplier changes remain blocked. This document does not certify a complete Import flow.
