# ShelfCash — Found Missing UI

This register tracks required workflow states and reconciles their design, frontend implementation and remaining runtime boundaries. Historical gaps are retained after design arrives.

## Rules

- Do not invent final production UI for items in this file.
- MagicPath remains the visual source of truth.
- Business docs/API contracts may establish that a state must exist, but they do not automatically define its UI.
- Once a state is designed in MagicPath, update its status here.
- Avoid duplicate entries for the same underlying state.
- Record blocking current implementation: yes/no for every entry; a temporary fallback does not resolve a design gap.
- Keep API availability, implementation bugs, pixel differences and developer controls out of this register.

## Status

- `PARTIAL` — frozen design exists; implemented subset and remaining capability are explicitly separated.
- `BLOCKED_BY_BACKEND` — design is ready but current runtime cannot provide the required transition.
- `NOT_IMPLEMENTED` — design exists; frontend work remains.

- `FOUND` — required state discovered, no adequate design yet.
- `DESIGN_READY` — design now exists in MagicPath.
- `IMPLEMENTED` — design exists and frontend matches it.
- `NOT_NEEDED` — later analysis showed no standalone UI is required.

Initial audit015 (historical), 14/10/2026: OWNER revision `461022434871619584`, STAFF revision `461022465448091648`.
User confirmed that `(1).docx` has no behavioral changes: `docs/SHELFCASH_IMPORT_NAM_NGUYEN.docx` is the authoritative business document for this pass (13/10, SHA256 `492f5834625c1d3103eca97ea7c76927cd1511a7c2dfc04ee49cbff1339bd29d`). Current runtime contract still controls available DTOs.

## Missing UI

## FM-001 — Create entity metadata

**Status:** PARTIAL

**Blocking current implementation:** yes — immediate create+bind capability, not metadata design

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportIdentityResolver.tsx / IdentityEditor in ImportResolutionEditor.tsx`; /imports → Step 3B; BOTH.

**Frozen v1 reconciliation:** Product/Ingredient/Supplier metadata, explicit active/unit/expiry and evidence are reachable in production through supported new_entity_proposal. No supplier terms are included. Immediate create+bind/import-only scope and reusable opt-in are not represented by that API: entity reservation remains proposal → Owner → atomic commit. Do not report created from a proposal ACK.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3B — Identity

**Historical blocking assessment:** yes — create-new path; existing-entity happy path is not blocked

**Trigger**

Không tìm được entity hiện có; actor có quyền propose/create.

**Why this state is required**

Business Import §2 yêu cầu metadata, unit/active và quyền phù hợp, không auto-merge theo tên.

**What MagicPath currently covers**

STAFF 03-new-entity / 03-new-entity-blocked chỉ quay Overview; Identity drawer có nút tạo mới.

**What is missing**

Không có form metadata, validation, cancel/save hoặc review reservation cho Owner/Staff.

**Frontend impact**

IdentityEditor hiện có form tự dựng để nhập metadata.

**Temporary implementation**

Giữ form cũ chỉ trong isolated DEV playground; production không mở form mới tự thiết kế. Binding entity hiện có vẫn hoạt động.

**Design brief for MagicPath**

Thiết kế form tạo Product/Ingredient/Supplier và nhánh permission, explicit proposed reservation, cancel/save về Overview.

**Found while working on**

ImportResolutionEditor.tsx, ImportResolveDrawers.tsx

## FM-002 — Full-spec profile decision controls

**Status:** PARTIAL

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportMapping.tsx / ImportProfileSpecification.tsx`; /imports → Owner Profile review; Staff read-only.

**Frozen v1 reconciliation:** First Profile, exact active baseline, changed/full grouped comparison, evidence drawer, approval reason/ack, separate rejection reason/ack and explicit retirement confirmation implemented. Full-spec authority and CAS unchanged. Requester/submission timestamps and authoritative already-handled/rejected lifecycle readback are absent; unknown decisions stay locked. Comparison is retained in permission/error states.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** OWNER

**Flow / Step:** Step 4 — Profile approval

**Historical blocking assessment:** no — current contract controls remain; blocks final visual closure

**Trigger**

Owner quyết định proposed full spec so với exact active baseline.

**Why this state is required**

N5 cần proposal/lifecycle revisions, reason và full-spec review; approve/reject/retire không commit.

**What MagicPath currently covers**

04-review/04-approved có bốn vùng read-only và một CTA; 04-changed/handled/rejected/retired/permission có error states.

**What is missing**

Thiếu vị trí baseline comparison/evidence đầy đủ, reason/ack và reject/retire decision controls. Error screen đã có, không ghi lại như gap.

**Frontend impact**

ProfileReviewCard đang giữ thêm form quyết định và evidence detail ngoài prototype.

**Temporary implementation**

Giữ các trường contract bắt buộc hiện có theo shared field styles, không thêm decision UX mới; ghi đây là bounded legacy fallback, chưa visual-approved.

**Design brief for MagicPath**

Bổ sung interaction cho full-spec decision, before/after baseline, reason/ack và lifecycle actions; giữ approval khác commit.

**Found while working on**

ImportMapping.tsx / ImportProfileReview

## FM-003 — Persisted review confirmation

**Status:** IMPLEMENTED

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportPreview.tsx / ImportFlowWorkflow`; /imports → Review / Commit; BOTH.

**Frozen v1 reconciliation:** Persisted confirm_review pins gate phase 2. Independent Review and Commit reasons/acks; domain guards at navigation, state and mutation; commit rechecks server snapshots and permissions. Uncertainty reads retained confirmation/result without replay. Verified on controlled responses, not live BE; separate persisted domain decisions remain FM-010/011.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 5 — Review / Commit

**Historical blocking assessment:** no — bounded existing fields keep main flow usable

**Trigger**

Preview hợp lệ cần server confirm_review trước một explicit commit riêng.

**Why this state is required**

Current I05 process confirm_review cần reason/ack và exact preview/source pin; commit có reason/ack riêng.

**What MagicPath currently covers**

OWNER 05-review và STAFF 05-review chỉ thiết kế một màn final commit và CTA.

**What is missing**

Không thể hiện confirm_review chưa gửi, đã lưu, lỗi/readback và quan hệ với reason/ack commit.

**Frontend impact**

Hai form hiện có là FE bổ sung; modal confirmation thứ hai không có trong thiết kế.

**Temporary implementation**

Giữ required reason/ack fields để không bypass contract; bỏ modal commit phụ, dùng explicit CTA theo design. Chưa coi phần protocol controls là design-ready.

**Design brief for MagicPath**

Thiết kế review confirmation và final commit trong cùng flow, gồm trạng thái đã xác nhận/expired và reason/ack bắt buộc.

**Found while working on**

ImportPreview.tsx, importFlow.workflow.ts

## FM-004 — Source proof and contextual declarations

**Status:** PARTIAL

**Blocking current implementation:** yes — unsupported general period/source context cases

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportResolutionEditor.tsx / SourceContextEditor`; /imports → Analyze source-required → Step 3A; BOTH.

**Frozen v1 reconciliation:** Evidence/context and explicit source/report namespace, locale and supported amendment inputs retained in a focused resolver. No filename inference or custom→known-provider coercion. Full-page Step 2 source confirmation reuses the typed editor and actual sheet evidence. General period/custom-source catalogue capabilities remain incomplete; no unsupported period/catalog fields are sent.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 2 / 3A — Source resolution

**Historical blocking assessment:** no — existing bounded source resolution remains

**Trigger**

Header phù hợp nhưng source/report chưa có proof, hoặc cần locale/period/effectivity declaration.

**Why this state is required**

Business §1 source proof; M04 source_context cần evidence và có semantics/locale/amendment fields.

**What MagicPath currently covers**

02-source có hai dropdown nguồn/report; Mapping resolver chỉ mô tả field targets.

**What is missing**

Không có nhập source namespace ngoài preset, evidence, locale và amendment review/validation. Hai dropdown không định nghĩa catalog hợp lệ.

**Frontend impact**

SourceContextEditor hiện là form mở rộng tự dựng.

**Temporary implementation**

Giữ minimal existing contract fields, reuse designed field/error patterns; không bịa source choices hoặc tự bỏ proof để hợp ảnh.

**Design brief for MagicPath**

Thiết kế source evidence và conditional declarations với namespace/custom-source, phạm vi lần nhập và amendment review.

**Found while working on**

ImportResolutionEditor.tsx / SourceContextEditor

## FM-005 — Partial upload and exact source-set acknowledgment

**Status:** PARTIAL

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportUploadAdmission.tsx / ImportBatchWorkflow`; /imports → File / accepted-set confirmation; BOTH.

**Frozen v1 reconciliation:** Accepted/rejected rows, in-memory rejected retry/replacement, remove from operational retry list, dynamic accepted set and explicit confirmation before I03 implemented. Removal never deletes a canonical rejection or accepted source; all required rejected IDs still acknowledged. Uncertain upload only reads client receipts. Negative upload proof is unavailable; unknown remains locked. Individual retry needs retained browser File bytes; after reload replacement is available.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 1 — File admission

**Historical blocking assessment:** yes — full production-only partial-admission UX; all-accepted path is usable

**Trigger**

I02 nhận một phần file hoặc committed 422, hoặc mất acknowledgment sau upload.

**Why this state is required**

I02/I03 mechanics yêu cầu giữ accepted files và xác nhận rejected source set trước analyze; retry giữ exact intent.

**What MagicPath currently covers**

01-upload-failed/unsupported/duplicate nói giữ file thành công và retry, không thể hiện partial receipt/ack branch.

**What is missing**

Thiếu interaction partial accepted/rejected, source-set acknowledgment và retry/readback phân biệt response loss.

**Frontend impact**

ImportBatchPanel chứa controls này trong Advanced diagnostics; product chỉ có lỗi/file list tối thiểu.

**Temporary implementation**

Giữ guards và existing recovery/ack controls; không tự bỏ rejected IDs. Không tạo dashboard receipt/quota mới trong product.

**Design brief for MagicPath**

Thiết kế partial admission ngay trong File list, per-file retry và xác nhận tập nguồn trước Analyze.

**Found while working on**

ImportBatchPanel.tsx, ImportPage.tsx, importData.workflow.ts

## FM-006 — Multi-sheet resolver selection and paging

**Status:** IMPLEMENTED

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportResolveDrawers.tsx / ImportFlowWorkflow`; /imports → 3A/B/C/D drawers; BOTH.

**Frozen v1 reconciliation:** Shared File/Sheet selects, current category loaded-scope count, authoritative import-wide M01 count, unresolved/all filter, one previous/next counter, load more, loading/empty/error/retry implemented. Partial counts use ≥ and unloaded counts —; no page proves global completion. Current drawer and metadata stay shared across roles. Invalid page pins fail closed and require scope reload.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3 — Shared resolver drawers

**Historical blocking assessment:** no — bounded existing selector/paging; final multi-sheet visual needs design

**Trigger**

Batch có nhiều files/sheets hoặc M02 queue chưa đọc đủ trang của phạm vi đang xem.

**Why this state is required**

Business §1 nhiều sheet/source riêng; M02 paginated/scoped queue không đại diện global unresolved.

**What MagicPath currently covers**

03A/B/C/D resolver headers chỉ hiện một file/sheet; Overview dùng số demo đầy đủ.

**What is missing**

Chưa chỉ rõ đổi file/sheet, trang tiếp, empty/read-failed và global-vs-loaded group status trong drawer.

**Frontend impact**

File/Sheet navigator hai cột cũ không có trong resolver 500px mới; đếm một page sẽ sai.

**Temporary implementation**

Dùng một shared select/file-sheet và existing load-more/error controls tối thiểu; count thiếu hiện —. Giữ global progress authoritative, không suy zero từ page rỗng.

**Design brief for MagicPath**

Thiết kế file/sheet scope selector và queue paging/empty/error trong cùng focused resolver, với summary completeness.

**Found while working on**

ImportMapping.tsx, ImportResolveOverview.tsx, ImportResolveDrawers.tsx

## FM-007 — Uncertain resolver or profile save

**Status:** PARTIAL

**Blocking current implementation:** yes — an unprovable mutation outcome remains locked

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportMutationStatus.tsx / ImportFlowWorkflow.checkPendingState`; /imports → resolver/Profile recovery; BOTH.

**Frozen v1 reconciliation:** Saving follows actual busy state; failure preserves entered values; uncertain/checking/unknown locks mutation and offers readback. Exact persisted M03/M04 issue can confirm saved; pinned Review and I06 can confirm receipt. No timer success or blind replay. Current API cannot prove terminal not-saved or every N5 outcome, so those transitions remain blocked rather than fabricated.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3 / 4 — Mutation recovery

**Historical blocking assessment:** no — exact-intent safeguards and generic fallback remain

**Trigger**

M04/N5 không nhận ACK, hoặc write confirmed nhưng đọc summary/options mới thất bại.

**Why this state is required**

Idempotency/CAS workflow giữ intent và phải khóa sửa trong lúc đối chiếu; readback retry không ghi lại quyết định.

**What MagicPath currently covers**

03a-error/03-ui-map-error giữ input và retry; 04-changed thiết kế revision conflict; commit uncertainty đã có.

**What is missing**

Không có uncertain save/readback branch cho resolution/profile, khác failed save và commit uncertainty.

**Frontend impact**

Generic Import retry banner đang dùng copy của commit cho mọi operation.

**Temporary implementation**

Dùng generic designed error/processing pattern và existing exact-intent retry; không cho tạo intent mới khi pending. Không tạo polished standalone UX.

**Design brief for MagicPath**

Thiết kế resolver save uncertainty/readback và N5 decision uncertainty, với pending lock, retry same intent hoặc read-only recovery.

**Found while working on**

ImportFlow.tsx, importFlow.workflow.ts

## FM-008 — Readiness unassessed, unknown and unavailable

**Status:** IMPLEMENTED

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportReadiness.tsx / ImportResult.tsx`; /imports → Completion; BOTH subject to planning.context.read.

**Frozen v1 reconciliation:** Unassessed → explicit date selection → loading → ready/blocked/unknown, HTTP unavailable and permission states implemented. Unknown/missing action is not not-ready. Import receipt remains visible and unchanged. Assessment is current Store/date/authorization scoped, aborts stale reads. DEV preview values are fixtures; runtime R01 remains independent.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 6 — Completion / Readiness

**Historical blocking assessment:** no — existing bounded readiness assessment remains

**Trigger**

I06 đã thành công nhưng R01 chưa đọc, loading, unknown/error, thiếu quyền hoặc cần đổi forecast date.

**Why this state is required**

Business §7–8 completion khác action/date-scoped readiness; absent/unknown không được coi not-ready hay ready.

**What MagicPath currently covers**

06-ready/06-not-ready và STAFF 06-warning chỉ thiết kế kết quả đã biết.

**What is missing**

Thiếu idle/loading/unknown/error/permission/date-selection và retry; warning completion không giải quyết trạng thái R01 chưa biết.

**Frontend impact**

ImportReadiness có ngày/check button và generic unassessed/error chưa có equivalent design.

**Temporary implementation**

Giữ completed receipt; dùng generic loading/error/blocked pattern và minimal date/check control hiện có; không tự báo ready hoặc tự rollback.

**Design brief for MagicPath**

Thiết kế R01 state family bên dưới immutable completion, chọn ngày/scope và recovery/permission đúng quyền.

**Found while working on**

ImportReadiness.tsx, ImportResult.tsx

## FM-009 — Declaration scope and source-column replacement

**Status:** PARTIAL

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportResolutionEditor.tsx / SharedValueEditor`; /imports → Step 3C; BOTH.

**Frozen v1 reconciliation:** Explicit IMPORT_VALUE vs PROFILE_CONSTANT, false/zero/null, source evidence/before-after, required replacement ack/reason implemented. Replacement restricted to the exact source column whose evidence is loaded. Reason is recorded in supported evidence_reference; no invented request property. Descriptor-based generic field controls remain; broader source-value/raw-cell projections are not guaranteed.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3C — Declarations / batch facts

**Historical blocking assessment:** no — bounded existing declaration editor remains

**Trigger**

Field có thể được khai báo IMPORT_VALUE hoặc PROFILE_CONSTANT, hoặc override source column có explicit ack.

**Why this state is required**

M04 shared_value và business §2: batch facts không tự thành default; reusable change cần Owner approval.

**What MagicPath currently covers**

03c/03-ui-dec có recipe basis/date/price/yield và batch-only note.

**What is missing**

Thiếu scope choice, conditional typed values/null/false/zero và confirmation khi replace một source column.

**Frontend impact**

SharedValueEditor dùng generic type/scope controls ngoài prototype.

**Temporary implementation**

Chỉ hiện required fields trong descriptors; giữ existing scope/evidence/ack controls bounded, không auto-default scope hoặc fabricate declarations.

**Design brief for MagicPath**

Bổ sung conditional scope/replacement interaction, typed null/false/zero, evidence và proposal transition.

**Found while working on**

ImportResolutionEditor.tsx / SharedValueEditor

## FM-010 — Per-row sales correction and disjoint evidence

**Status:** PARTIAL

**Blocking current implementation:** yes — ambiguous relationship / separately persisted decision cases

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportDomainReview.tsx / importDomainReview.ts`; /imports → Preview Sales drawer → Review guard; BOTH.

**Frozen v1 reconciliation:** Source/before-after/evidence, explicit acknowledgment/reason and typed replacement/disjoint commit intents are staged from the server proposed_action. Pending/invalid/extraneous/duplicate decisions block all Review entry/controls and Commit. Ambiguous relationship is not guessed. Current API does not persist a relationship choice before commit or guarantee contribution history projections; those capabilities are still required.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3 / 5 — Sales resolution

**Historical blocking assessment:** no — bounded existing confirmation; final visual needs design

**Trigger**

Preview yêu cầu REPLACE_DAILY_TOTAL hoặc MERGE_DISJOINT_SALES với evidence/identity/reason.

**Why this state is required**

Business §4 và I05: correction không cộng trùng; disjoint cần explicit assertion, không quantity override.

**What MagicPath currently covers**

STAFF 03-sales-correction/03-correction-conflict có banner; Preview/Review chỉ là aggregate table/CTA.

**What is missing**

Không có per-row evidence/business key/reason/disjoint decision form hoặc confirmation/recovery.

**Frontend impact**

SalesConfirmation là existing self-designed form cần giữ contract semantics.

**Temporary implementation**

Giữ minimal existing row confirmation với shared fields; không thêm correction UI hoặc quantity editing mới; chặn commit khi thiếu xác nhận.

**Design brief for MagicPath**

Thiết kế focused row correction/disjoint review, đúng source/day/product, giữ distinction replace vs merge.

**Found while working on**

ImportPreview.tsx / SalesConfirmation

## FM-011 — Supplier term and fee confirmation

**Status:** PARTIAL

**Blocking current implementation:** yes — effectivity edits / separately persisted decision cases

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportDomainReview.tsx / SourceContextEditor`; /imports → Preview Supplier drawer → Review guard; BOTH.

**Frozen v1 reconciliation:** Supplier term/fee before-after and source evidence, reason/ack staged for exact action ID; pending/blocked/permission/stale states block Review. No silent period close or historical amendment. Effective dates remain read-only in Preview; supported amendment resolution remains upstream. Separate persisted decision/effectivity edit in frozen domain drawer is not provided by current commit-only confirmation DTO.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3 / 5 — Supplier effectivity review

**Historical blocking assessment:** no — existing required confirmation remains

**Trigger**

Preview có supplier term/fee change cần action_id và reason hoặc amendment kỳ hạn.

**Why this state is required**

Business §5 và canonical commit cần explicit supplierChanges; không tự đóng kỳ hiện hành.

**What MagicPath currently covers**

Preview có Supplier terms tab và row evidence nhưng không có effectivity/fee action confirmation.

**What is missing**

Thiếu reason/confirmation cho từng term/fee và before/after period review; generic final CTA không đủ.

**Frontend impact**

SupplierChange và source amendment forms là bounded legacy UI ngoài prototype.

**Temporary implementation**

Giữ existing required confirmation theo shared field patterns; không tự amend/close hoặc suy permission từ profile approval.

**Design brief for MagicPath**

Thiết kế term/fee period before/after, conflict/permission và explicit confirmation cho đúng action.

**Found while working on**

ImportPreview.tsx / SupplierChange; SourceContextEditor

## FM-012 — Rational conversion declaration and evidence

**Status:** IMPLEMENTED

**Blocking current implementation:** no — stated supported flow is usable; limitations remain explicit below

**Design status:** DESIGN_READY — frozen v1 OWNER `461110616439017472` / STAFF `461109945690124288`.

**Current frontend / route:** `ImportResolutionEditor.tsx / ConversionEditor`; /imports → Step 3D; BOTH.

**Frozen v1 reconciliation:** Explicit source/target units, positive exact numerator/denominator strings, evidence and shared Save footer implemented. No sample-derived target unit, density/pack guessing or floating-point factor. Saved conversions remain read-only evidence in the overview/drawer. Backend validates supported compatibility; tests do not establish real-engine acceptance.

**Historical audit below:** findings from the earlier revisions are retained for traceability; they are superseded by the reconciliation above.

**Role:** BOTH

**Flow / Step:** Step 3D — Units

**Historical blocking assessment:** no — existing explicit-ratio contract editor remains bounded; final visual closure needs design.

**Trigger**

M04 requires a user-declared exact factor with numerator, denominator and evidence for supported units.

**Why this state is required**

Business recipe/unit rules and declared_conversion require exact factors, no floating-point rounding or guessed density/pack conversion.

**What MagicPath currently covers**

03d-conversion / 03-ui-unit-conversion show an already exact conversion; needs/unsupported show a single package-capacity input.

**What is missing**

The general exact rational factor/evidence edit, validation and unsupported factor boundary is not specified by the single capacity example.

**Frontend impact**

ConversionEditor has two decimal-text fields and evidence that do not have an equivalent editable design.

**Temporary implementation**

Keep the existing required exact-factor editor using shared field styling and drawer footer. Do not infer density/pack size or invent another conversion workflow.

**Design brief for MagicPath**

Extend the Unit resolver with explicit rational factor/evidence and error/permission states for supported conversions.

**Found while working on**

ImportResolutionEditor.tsx / ConversionEditor, ImportResolveDrawers.tsx.

## Shared authentication recovery audit — 15/10/2026

Read-only audit of current MagicPath OWNER `softly-door-9234` (24 revisions, updated 14/10), STAFF `wildly-shade-4015` (23 revisions, updated 14/10), and login `gentle-forest-2488` (1 revision). The Input designs do not define a separate authentication-recovery screen. This fix reuses the existing login form, inline feedback/text-button and protected-session feedback patterns: a failed session read keeps Import protected, offers login with the return destination, and permits session retry from login. Successful login still requires a fresh A03 read before entering Import. No new FM entry: this is shared authentication recovery using existing patterns, not a new Import product state or visual closure claim. Backend session failures remain an independent runtime issue.

## Canonical Input Flow implementation status

Capability reconciliation, 16/10/2026: the statements below describe the FE scope pinned to snapshot 011. Newer BE source/handoff already provides SU01 supplier discovery, MQ submission/queue/detail, N5 request_changes and notifications, eligible RULE full-spec approval and 15 schemas; these are not proof of FE integration or live acceptance. Queue/notification continuation is now a **frontend integration dependency**, not an absent-backend claim. Strict wire and behavioral gaps are tracked in [015_Import_TechDebt.md](015_Import_TechDebt.md) and [Import guide §15](IMPORT_FLOW_OWNER_STAFF_GUIDE.md#15-đối-chiếu-be-main-và-fe--16102026). This documentation-only pass makes no new design audit or IMPLEMENTED claim; no new FM entry is created for API availability or implementation bugs.

OWNER: PARTIAL — shared operational flow and two-phase Review/Commit implemented; first/existing Profile review uses real N5. Immediate entity creation, broad source context and domain-decision persistence do not have complete runtime parity.

STAFF: PARTIAL — same geometry and current-import operational flow, permission-driven actions; reusable approval remains Owner-only. Queue/notification/outcome continuation remains to be integrated into FE from newer BE APIs; the current manual handoff and DEV simulation do not establish production parity.

Remaining frontend UI gaps: finer descriptor-specific declaration controls, friendly immutable display projections and broad frozen-state visual coverage. No new FM IDs: the twelve original designs now exist.

Remaining backend/API dependencies: see `015_Import_TechDebt.md` and `../FE_ask/015_Frozen_Input_Flow_Capability_Requests.md`. DESIGN_READY endpoints are not wired.

Known non-blocking implementation debt: compact CSS overrides retained from the previous pass, conservative scope invalidation, array-index matching in Profile comparison and DEV catalog still smaller than frozen inventory. Full Profile is always inspectable; changed-only is a display aid, never approval authority.

Status count: 4 IMPLEMENTED (FM-003/006/008/012), 8 PARTIAL (FM-001/002/004/005/007/009/010/011). All twelve are DESIGN_READY visually. IMPLEMENTED means the stated frontend scope, not live backend acceptance or pixel verification of every frozen scenario.
