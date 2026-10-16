# ShelfCash — Current Missing UI & Runtime Register v1

Last reconciled: **17/10/2026**. General context: current engineering backlog sau implementation020. API-01–06 dùng canonical designs mới; trạng thái runtime chỉ theo code và controlled verification.
Earlier 020 checkout: dirty HEAD `2d43d9d0fbf02b06b73a04d37e231c93ba1e7b1b`; 019 baseline fingerprint `b8275c7a64712d504533f9426270e90139b23f812f65449c0ac05c70b1acf05a`; current020 evidence trong [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md).
Backend contract: capabilities now pins [main020](../../contracts/020/openapi.main.json), SHA256 `18fb4eabe469c69c817fcf5f0c5b4764c3feb1a886adb71b382c19b347147f7a`, supplied BE `d5cfbfb59de7c45bc08eb47129b5ba3919e05473`, **76 operations / 69 paths**. The 73 existing operations/schemas are unchanged; older feature pins remain main011/main016. The package itself says runtime_deployed=false; the later [Windows run](../integration-audit/REPORT.md) independently reports deployed d5cfbfb on that host. This does not attest deployment on the current macOS host. [Afternoon integration receipt](../sprints/020/020_Backend_Handoff_Integration.md) supplements the earlier 020 evidence; neither proves deployment.
Earlier020 behavioral design evidence: project `458079658328604672`; Owner `461726308171411456`, Staff `461725038614315008`, Store `461722261150400512`, Invitations `461725062467305472`, Planning Setup `461721652229738496`, Results `461720833971347456`. Source và rendered previews của sáu revisions đã audit; hashes trong [020 verification](../testing/PASS_020_VERIFICATION.json). Notifications/Auth và các phần ngoài sáu gap giữ019 evidence, không claim audit mới cho mọi family.

Current visual authority (17/10/2026): [13 canonical final revisions](../testing/VISUAL_GREEN_20261017_DESIGN_AUDIT.json), including OWNER `461895559079428096` and STAFF `461895532667871232`. [Visual refinement receipt](../sprints/020/020_Visual_Language_Refinement.md) records the CSS/presentation-only green pass. Behavioral authority and prior evidence above remain historical; no workflow/routing/IA/state changes or FE browser acceptance are claimed.

Later visual-convergence audit (17/10/2026): [current source inventory](../testing/visual-fidelity/CANONICAL_DESIGN_AUDIT.json) supersedes the green-pass pins for Planning Setup (`461898344663502848`) and Results (`461899945612550144`); other canonical pins are unchanged. [Convergence report](../testing/visual-fidelity/MAGICPATH_FE_CONVERGENCE.md) records bounded Planning CSS corrections, two provenance-classified copy removals and isolated controlled static component captures. Full-product visual convergence remains PARTIAL; no live BE/E2E acceptance or business-gap closure.

## How to read this file

V1 là current planning source of truth. [FOUND_MISSING_UI.md](../FOUND_MISSING_UI.md) là **historical audit register**, giữ nguyên bytes. Chi tiết lịch sử nằm ở đó; 018 mô tả service-only tại thời điểm018, không phủ định UI callers019. Stale statements trong older receipts/workflow notes không override code/main016/019 khi có evidence cụ thể dưới đây.

- **Design:** READY / MISSING / NOT_REQUIRED — adequate design cho behavior nêu trong item. MISSING có thể là thiếu *action variant*, không phải toàn screen chưa từng tồn tại.
- **Frontend:** IMPLEMENTED / PARTIAL / NOT_IMPLEMENTED / NOT_REQUIRED — production integration, không tính generated service là UI. Current state và Remaining gap giới hạn rõ scope; BE-blocked extension không tự biến existing supported UI thành absent.
- **Backend:** SUPPORTED / PARTIAL / MISSING / UNCERTAIN / NOT_REQUIRED — published contract, không phải deployment attestation. UNCERTAIN là semantics chưa đủ evidence, không tự gán endpoint missing.
- **Live verification:** VERIFIED / CONTROLLED_ONLY / NOT_RUN / BLOCKED. CONTROLLED_ONLY chỉ có evidence cho phần đã implement (có thể service/unit/browser); không certify missing variants hoặc live. BLOCKED chỉ dùng khi có blocker được xác nhận hiện tại; unavailable API riêng đã nằm ở Backend.
- **Owner** là bên làm next action; blockers liệt kê theo ưu tiên. Safe current behavior mô tả giới hạn thực; guard chưa có được đánh dấu rõ CẦN LÀM. Không invent UI/policy để đóng gap; UI mới theo MagicPath.
- Counts bên dưới được tính từ 29 item headings/status lines; buckets overlap và tính theo obligations, không phải số unique endpoints/root causes. FM crosslinks tới CR/API không tạo FM mới. SC-01 là một scoped deferred expansion item, được tính riêng, không phải blocker để chạy existing Import.

## Executive status

- Register items: **29**; đủ FM-001 → FM-016, không tạo thêm FM ID.
- Design missing: **1** (parked SC-01); READY **26**; NOT_REQUIRED **2**.
- FE incomplete: **13** (PARTIAL **12**, NOT_IMPLEMENTED **1**); IMPLEMENTED **16**.
- BE missing/partial: **14** (MISSING **1**, PARTIAL **13**); UNCERTAIN **0**, SUPPORTED **13**, NOT_REQUIRED **2**.
- Live NOT_RUN/BLOCKED: **4** (NOT_RUN **4**, BLOCKED **0**); CONTROLLED_ONLY **25**, VERIFIED **0**. Tất cả **29** items còn thiếu live acceptance, kể cả CONTROLLED_ONLY.
- Cross-cutting runtime gaps: **2** — CR-01 durable recovery, CR-02 immutable display; durable recovery gap count **1**.

Ưu tiên: **RT-02** là FE integration debt trên design đã có; **CR-01** là durable recovery dependency xuyên flow. API-03 đã có typed intent/global gate và production confirmations020. FM-002/003/007/013–016 được tách implementation khỏi dependency/verification; FM-006/008/012 giữ implemented scope. Không mở lại policy approval/permissions/source_only/unknown/IGNORE. Source semantics (PNK/NCT, recipe yield, pack basis, timezone/calendar) chỉ hỏi source owner khi file cụ thể thiếu evidence, không thành global Product blocker.

Immediate work: [dependency-ordered tasks](#immediate-work-and-dependency-order). DESIGN follow-up: afternoon020 journal retention/logout/shared-device behavior and authorized Assistant result binding; API-01–06 retain their existing implementation/design statuses. BE runtime limits: FM-001/004/005/010/011/013–016, CR-01/02, RT-01. RT-02/API-03 là FE gaps trên APIs đã có.

## Current actionable FM items

### FM-001 — Entity metadata / immediate create + bind

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY

- **Current state:** M04 metadata proposal → Owner → atomic commit đã có.
- **Remaining gap:** Chưa có immediate create+bind/reuse-scope boundary.
- **Next action:** BE publish boundary; FE nối sau contract.
- **Safe current behavior:** Cho existing bind/proposal; ACK không chứng minh entity đã tạo.
- **Evidence:** [IdentityEditor](../../src/features/import-data/components/ImportResolutionEditor.tsx), M04; [019 gaps](../../FE_ask/019_Freeze_Integration_Gaps.md#p1--resolver-createbind-and-precise-staff-feedback-target).
- **Historical reference:** [FM-001](../FOUND_MISSING_UI.md#fm-001--create-entity-metadata).

### FM-004 — Source proof / source-level period context

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY

- **Current state:** Source/report/evidence/semantics/locale/specific amendments đã nối.
- **Remaining gap:** Thiếu general source-level from/to/catalogue; per-schema dates vẫn supported.
- **Next action:** BE làm rõ general context projection; source options sẵn có xem API-06.
- **Safe current behavior:** Không filename inference hoặc gửi fields ngoài M04.
- **Evidence:** [SourceContextEditor](../../src/features/import-data/components/ImportResolutionEditor.tsx), `SourceContext`/M04; [015 source brief](../../FE_ask/015_Frozen_Input_Flow_Capability_Requests.md#4-source-context-period-and-human-readablecustom-source-presentation).
- **Historical reference:** [FM-004](../FOUND_MISSING_UI.md#fm-004--source-proof-and-contextual-declarations).

### FM-005 — Partial upload / exact accepted source set

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY, RECOVERY_LIMIT

- **Current state:** Partial receipts, rejected retry/local replacement/removal và exact source-set ACK đã có.
- **Remaining gap:** Accepted DELETE/replace/unseal thiếu; reload mất File bytes; CR-01.
- **Next action:** BE xác định accepted-byte mutation; FE test partial/reload boundaries.
- **Safe current behavior:** Không xóa canonical rejection; unknown I02 chỉ receipt readback.
- **Evidence:** [Upload workflow](../../src/features/import-data/importData.workflow.ts), I02/I03/I04; [019 accepted-source gap](../../FE_ask/019_Freeze_Integration_Gaps.md#p1--accepted-source-modification).
- **Historical reference:** [FM-005](../FOUND_MISSING_UI.md#fm-005--partial-upload-and-exact-source-set-acknowledgment).

### FM-007 — Resolver/Profile uncertain outcomes

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** RECOVERY_LIMIT, LIVE_VERIFICATION

- **Current state:** Busy/failure/unknown, positive readback và keyed MQ/N5 exact replay đã có.
- **Remaining gap:** Chưa có terminal negative proof cho mọi outcome; durable loss xem CR-01.
- **Next action:** BE cung cấp per-operation retention/proof; FE mở rộng recovery cases.
- **Safe current behavior:** Unknown locked; replay denial không phủ định original write; không tự replay public token/I02.
- **Evidence:** [Import recovery](../../src/features/import-data/importFlow.workflow.ts), [mutation state](../../src/features/backend-capabilities/capabilities.state.ts), [React retention](../../src/features/backend-capabilities/capabilities.react.ts); [recovery tests](../../tests/e2e/frozen-lifecycle.api.spec.ts).
- **Historical reference:** [FM-007](../FOUND_MISSING_UI.md#fm-007--uncertain-resolver-or-profile-save).

### FM-009 — Declaration scope / descriptor ergonomics

**Design:** READY · **Frontend:** PARTIAL · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE · **Blocker category:** FE_IMPLEMENTATION

- **Current state:** Shared scope/value/evidence và exact source-column replacement ack/reason đã có. User-requested classification draft now updates column options immediately from validated M03 `schemas[].fields`, before Save. Draft stays within the current import/sheet/revision drawer; unavailable/unsupported targets remain disabled. Column confirmation waits for explicit classification persistence and authoritative per-column M03 reload. [Implementation and current Owner/Staff design-source audit](../sprints/020/020_Classification_Draft_Options.md); 143 controlled Import tests pass, browser/live acceptance NOT_RUN for this change.
- **Remaining gap:** Generic value-kind picker chưa đầy đủ descriptor validation/ergonomics; raw source_cells đã publish.
- **Next action:** FE tighten documented type/nullable/input_sources/scopes trong controls hiện có; add negatives.
- **Safe current behavior:** Không infer value/precision, drop source column hay reuse batch fact.
- **Evidence:** [SharedValueEditor](../../src/features/import-data/components/ImportResolutionEditor.tsx), M03/M04 `FieldOption`/`SharedValueResolution`; immutable labels xem CR-02.
- **Historical reference:** [FM-009](../FOUND_MISSING_UI.md#fm-009--declaration-scope-and-source-column-replacement).

### FM-010 — Sales correction / disjoint decisions

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY

- **Current state:** Sales replacement/disjoint reason/ack và staged resolutions globally gate Review.
- **Remaining gap:** Separate relationship persistence/ambiguity writer thiếu; sales_contributions đã có ở BE.
- **Next action:** FE hiển thị published contribution evidence trong existing drawer; BE xác định separate persistence.
- **Safe current behavior:** Không auto-sum; đóng drawer không bỏ blocker; staged ≠ persisted.
- **Evidence:** [Domain guard](../../src/features/import-data/importDomainReview.ts), [domain UI](../../src/features/import-data/components/ImportDomainReview.tsx), I05 `resolutions`; [019 gap](../../FE_ask/019_Freeze_Integration_Gaps.md#p2--preview-domain-decisions--display-projections).
- **Historical reference:** [FM-010](../FOUND_MISSING_UI.md#fm-010--per-row-sales-correction-and-disjoint-evidence).

### FM-011 — Supplier term / fee decisions

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY

- **Current state:** Supplier evidence/reason/ack/commit confirmations và upstream M04 amendments đã có.
- **Remaining gap:** Separate decision persistence/direct Preview effectivity-edit boundary thiếu.
- **Next action:** BE xác định boundary; FE chỉ nối supported transitions.
- **Safe current behavior:** Preview dates read-only; không tự close/amend periods hoặc bỏ pending blocker.
- **Evidence:** [Domain review](../../src/features/import-data/components/ImportDomainReview.tsx), [SourceContextEditor](../../src/features/import-data/components/ImportResolutionEditor.tsx), I05/M04; [019 gaps](../../FE_ask/019_Freeze_Integration_Gaps.md).
- **Historical reference:** [FM-011](../FOUND_MISSING_UI.md#fm-011--supplier-term-and-fee-confirmation).

### FM-013 — Signup / email verification / continuation

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY, LIVE_VERIFICATION

- **Current state:** A02/A05/A06/A07 UI và A01/A03 app/Store/invitation continuation đã nối.
- **Remaining gap:** Token outcomes gộp; login denial không chứng minh unverified; deployed mail/callback chưa verify.
- **Next action:** BE xác minh delivery/callback; mở richer outcomes nếu cần; FE chạy live continuation.
- **Safe current behavior:** Explicit login; không reuse account khác/auto-accept/create Store. A05 không tạo session.
- **Evidence:** [AccountLifecycle](../../src/features/auth/AccountLifecycle.tsx), [AuthGuard](../../src/features/auth/AuthGuard.tsx), A02/A05/A06/A07; [browser cases](../../tests/e2e/frozen-lifecycle.api.spec.ts).
- **Historical reference:** [FM-013](../FOUND_MISSING_UI.md#fm-013--self-service-signup-and-email-verification-lifecycle).

### FM-014 — Authenticated zero-Store bootstrap

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE + Product/Design · **Blocker category:** RECOVERY_LIMIT, BACKEND_CAPABILITY, FE_IMPLEMENTATION

- **Current state:** Conditional T03 name/timezone/currency, readback/exact replay và Store continuation đã có.
- **Remaining gap:** Type/address hoặc universal negative creation proof chưa hỗ trợ.
- **Next action:** BE làm rõ richer fields nếu cần; durable recovery theo CR-01; FE live-test bootstrap.
- **Safe current behavior:** Empty T01 không chứng minh noncreation; không seed business data.
- **Evidence:** [StoreBootstrap](../../src/features/store/StoreBootstrap.tsx), [StorePage](../../src/pages/store/StorePage.tsx), T01/T02/T03; [019 gaps](../../FE_ask/019_Freeze_Integration_Gaps.md#p1--mutation-proof-after-unknown-outcome).
- **Historical reference:** [FM-014](../FOUND_MISSING_UI.md#fm-014--explicit-store-creation-for-an-authenticated-zero-store-account).

### FM-015 — Notification inbox / read state / handoff

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY, LIVE_VERIFICATION

- **Current state:** NF inbox/count/filter/paging/read state và ba registered destination families đã nối.
- **Remaining gap:** Import/invitation object types/finer null-link causes chưa publish.
- **Next action:** BE bổ sung projections nếu cần; FE live-test stale/revoked/handled handoff.
- **Safe current behavior:** Read/open không business-action; chỉ allowlisted matching paths; neutral null-link copy.
- **Evidence:** [Inbox](../../src/features/notifications/NotificationsPage.tsx), [navigation](../../src/features/notifications/notifications.navigation.ts), NF01–03/`NotificationObject`; [019 gap](../../FE_ask/019_Freeze_Integration_Gaps.md#p2--notification-destination-expressiveness).
- **Historical reference:** [FM-015](../FOUND_MISSING_UI.md#fm-015--account-notification-inbox-and-authorized-deep-link-recovery).

### FM-016 — Staff ↔ Owner persisted submission lifecycle

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY, LIVE_VERIFICATION

- **Current state:** MQ submit/wait/withdraw/resubmit, Owner decisions và feedback → retained Step3/sheet đã nối.
- **Remaining gap:** Structured affected resolver/issue target thiếu; full collaboration live matrix chưa chạy.
- **Next action:** BE bổ sung target nếu cần; FE controlled rồi live withdraw/changes/resubmit/race matrix.
- **Safe current behavior:** Không parse reason/re-upload; Staff-only request_changes, Owner self-approval vẫn allowed.
- **Evidence:** [Staff lifecycle](../../src/features/import-data/components/ImportSubmissionLifecycle.tsx), [Owner detail](../../src/features/import-data/components/MappingSubmissionsPage.tsx), [policy](../../src/features/import-data/importSubmission.policy.ts), MQ01–03/N5; [Staff browser test](../../tests/e2e/import-experience.api.spec.ts).
- **Historical reference:** [FM-016](../FOUND_MISSING_UI.md#fm-016--mapping-submission-lifecycle-extensions-to-existing-handoffqueue).

## Cross-cutting runtime gaps

### CR-01 — Durable mutation recovery

**Design:** NOT_REQUIRED · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** RECOVERY_LIMIT, BACKEND_CAPABILITY

- **Current state:** Production T03 Store creation now uses its dedicated actor-scoped allowlisted IndexedDB journal, exact key/body restoration, strict transactions/Web Locks and fresh A03/CSRF replay. The Windows report records eight focused controlled browser cases, with no extra live Store created. Separately, afternoon020 adds an exported generic recovery service/IndexedDB adapter and BE-pinned 28-rule allowlist; those generic callers remain opt-in and unwired. Other production mutation families still retain intent in memory/internal navigation.
- **Remaining gap:** Non-T03 production journal rollout and native-browser acceptance of the generic adapter remain open. Metadata-only/excluded bodies cannot be reconstructed; generic authoritative negative proof/cross-device discovery is absent. T03 shared-device/XSS/manual clearing/eviction and broader retention-policy limits remain; clearing local data does not cancel accepted server work.
- **Next action:** Preserve the dedicated T03 owner; extend separately reviewed operation/phase allowlists under explicit scope rather than adding a competing Store writer. FE + Product/Design define retention/logout/shared-device behavior through current MagicPath, connect non-T03 scoped callers/readers, then validate on the target machine. A generic BE status endpoint is not a prerequisite for this accepted direction.
- **Safe current behavior:** No automatic replay/new-key retry, silent expiry/purge or rollback inference. T03 uses its deployed hook's explicit recovery path; the generic boundary is not silently enabled. Denied replay never disproves original uncertainty; PR01/PR04 409 may include lifecycle reconciliation effects. Logout is not cancellation.
- **Evidence:** [T03 journal](../../src/features/store/storeCreate.journal.ts), [T03 production hook](../../src/features/store/storeCreate.react.ts), [Windows recovery report](../integration-audit/REPORT.md), [generic recovery boundary](../../src/features/backend-capabilities/recovery.service.ts), [afternoon receipt](../sprints/020/020_Backend_Handoff_Integration.md), [accepted allowlist](../../contracts/020/recovery_journal.json).

### CR-02 — Immutable friendly display projections

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** NOT_RUN
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY, FE_IMPLEMENTATION

- **Current state:** Retained values/provenance/raw cells có; missing names dùng neutral fallback.
- **Remaining gap:** EntityRefs không guarantee immutable friendly names cho mọi ID; custom labels/metrics thiếu.
- **Next action:** BE chỉ rõ projection coverage; FE reuse pinned fields đã có trước khi xin extension.
- **Safe current behavior:** Không dùng latest catalogue/UUID làm historical name hoặc page length làm total.
- **Evidence:** [BusinessFacts](../../src/features/import-data/components/ImportBusinessFacts.tsx), `EntityRefs`/`SourceEvidenceCell`/`PreviewSummary`; [display brief](../../FE_ask/013_Import_Display_Contract_Clarifications.md).

CR-01 affects FM-001/005/007/010/011/013–016, resolver M04, N5, MQ01, I05 Review/Commit, T03, NF03, Planning C02 and other keyed writers. Desired capability (**proposal, not an existing endpoint**): `operation_id / idempotency_key → authorized authoritative status/readback → pending / succeeded / rejected / unknown`, with retention and exact actor/Store/resource association. The accepted FE-owned allowlisted journal may help reconnect; it is never business truth. This generic lookup remains a proposed extension, not a prerequisite for the accepted operation-specific journal direction. Public token/email and upload recovery remain operation-specific. CR-02 affects resolver/Profile/Preview/notifications/history displays; supplied raw cells/contribution projections are not re-requested as absent.

## Backend-supported capabilities — canonical020 implementation

### API-01 — Permission-request lifecycle

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** PR01–04 list/submit/detail/approve-all/subset/reject/cancel; catalog từ PR02, fresh grants T02, sáu terminal/pending states, stale và exact-intent recovery.
- **Remaining gap / boundary:** PermissionRequest partial approval = approved với subset, không enum mới; quyền thực tế không được cập nhật local từ form. Live readback/current-rights vẫn cần xác nhận.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/store-workspace/components/PermissionRequests.tsx), [controlled browser checks](../../tests/e2e/pass020.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

### API-02 — Invitation decline lifecycle

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** IN01 confirmation/reason/current CAS; unknown → N18 matching read trước exact replay; declined readback reconciles terminal, không forged receipt. Accept vẫn riêng.
- **Remaining gap / boundary:** SC020-01 CONTRACT_CONFLICT: prototype optional reason, main yêu cầu reason. Các terminal states/current account đã giữ; không copy route/debug/prototype ra sản phẩm.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/auth/InvitationDecline.tsx), [controlled browser checks](../../tests/e2e/pass020.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

### API-03 — History correction global confirmation

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Multi-row before/after/context/evidence/reason/ack; historyCorrections tham gia route, Review, Commit và conditional reason; gửi I05 history_corrections với exact row/version. Pending/unknown giữ nguyên intent.
- **Remaining gap / boundary:** SC020-02 CONTRACT_CONFLICT: confirmation staged local, không separately saved correction. Thành công canonical qua whole Commit/J01/I06; đóng drawer không bypass; live atomic history revision còn NOT_RUN.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/import-data/components/ImportHistoryCorrections.tsx), [controlled browser checks](../../tests/e2e/import-experience.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

### API-04 — Retained export discovery

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Bản xuất đã có → EX01 list/paging/snapshot/availability → N11 registered path + checksum. N10 tạo mới vẫn confirmation riêng.
- **Remaining gap / boundary:** Missing/unverifiable/failed artifacts không trigger POST; không suy đoán retention duration. Live PDF worker/artifact acceptance còn mở.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/operations/RetainedExports.tsx), [controlled browser checks](../../tests/e2e/pass020.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

### API-05 — Run creator / Store-local creation-date filters

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** N9 creator/created_date_from/to độc lập forecast dates; URL restore, individual chips, clear-all và filtered paging. Validate BE echoed filters.
- **Remaining gap / boundary:** Creator select từ actual N9 rows, không fabricated directory hay Owner-only N12. Catalog người tạo chỉ gồm các run đã đọc/selected query; chưa có dedicated creator directory contract. Ngày do BE diễn giải theo Store timezone.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/operations/PlanningHistoryPage.tsx), [controlled browser checks](../../tests/e2e/pass020.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

### API-06 — Supported SourceContext options and scope

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** M04 missing_stockout/tri-state stockout_aliases/pack_cost_basis/evidence; Analyze và shared resolver dùng chung editor. Explicit reusable confirmation; batch facts giữ SharedValue IMPORT_VALUE.
- **Remaining gap / boundary:** SC020-03 CONTRACT_CONFLICT: SourceContext không có batch scope. Không gửi invented field hoặc dùng SharedValue để giả semantic scope. Batch-only semantic flags chưa được BE hỗ trợ; reusable changes giữ N5/MQ approval rules.
- **Next action:** Bounded live Owner/Staff validation theo017; các CONTRACT_CONFLICT theo [020 reconciliation](../../FE_ask/020_Design_Contract_Reconciliation.md), không mở lại policy.
- **Safe current behavior:** Chỉ claim published supported scope và server-confirmed facts; unknown không đồng nghĩa thất bại.
- **Evidence:** [runtime](../../src/features/import-data/components/ImportResolutionEditor.tsx), [controlled browser checks](../../tests/e2e/import-experience.api.spec.ts), [020 receipt](../sprints/020/020_Closed_Design_Gap_Implementation.md), [020 verification](../testing/PASS_020_VERIFICATION.json).

## Other runtime / scope gaps

### RT-01 — Today D01 supported sections versus richer outlook

**Design:** READY · **Frontend:** PARTIAL · **Backend:** PARTIAL · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** BACKEND_CAPABILITY

- **Current state:** D01 inventory/tasks/readiness/latest Run đã nối /today.
- **Remaining gap:** Seven-day outlook/arrivals/pending procurement decision projection thiếu.
- **Next action:** BE publish richer snapshot; FE adapt/test available/partial/unknown/forbidden.
- **Safe current behavior:** Unknown không zero/calm; latest Run không pending decision; không fabricate forecast.
- **Evidence:** [TodayPage](../../src/pages/today/TodayPage.tsx), D01/`TodaySections`; [019 Today gap](../../FE_ask/019_Freeze_Integration_Gaps.md#p2--today-snapshot-lacks-complete-frozen-projection).

### RT-02 — Retry a terminal failed sealed Analyze

**Design:** READY · **Frontend:** PARTIAL · **Backend:** SUPPORTED · **Live verification:** NOT_RUN
**Owner:** FE · **Blocker category:** FE_IMPLEMENTATION, LIVE_VERIFICATION

- **Current state:** I03/J01 và same sealed source set đã có; contract §9.1 cho explicit retry/new job khi failed và chưa có analysis_json.
- **Remaining gap:** prepareAnalysis chặn sealed batch, nên terminal-failed re-analysis chưa nối. Đây là FE gap, supersedes thiếu-capability claim của015.
- **Next action:** FE nối explicit I03 retry theo current allowed_actions/fresh CAS/full source set; test new job sau terminal failure, không replay để restart.
- **Safe current behavior:** Giữ sealed bytes bất biến. Chỉ retry khi BE cho phép; lost ACK vẫn dùng original intent, không tự tạo new job.
- **Evidence:** [workflow](../../src/features/import-data/importData.workflow.ts), [main contract §9.1](../../shelfcash_FE_handoff_869eaec9/contracts/docs/IMPORT_MAPPING_API_CONTRACT_VI.md), I03/I04/J01. Không cần endpoint mới.

### SC-01 — Parked expansion: global Profiles / AI / What-if / Draft PO

**Design:** MISSING · **Frontend:** NOT_IMPLEMENTED · **Backend:** MISSING · **Live verification:** NOT_RUN
**Owner:** BE + PRODUCT · **Blocker category:** PRODUCT_DECISION, BACKEND_CAPABILITY, DESIGN

- **Current state:** 019 mở MQ/D01; global Profiles/AI/What-if/Draft PO vẫn parked. Afternoon020 adds AS01–03 typed API/state only for retained-plan Assistant; no product caller, scope reopening or UI acceptance. Backend MISSING here refers to the full parked workspace expansion, not these supplied Assistant endpoints.
- **Remaining gap:** Runtime contracts/adequate full-scope action design thiếu, nhất là downstream PO.
- **Next action:** PRODUCT chỉ explicit reopen; BE/DESIGN chốt contracts/interactions sau đó.
- **Safe current behavior:** Giữ construction/disabled entries; PDF/N6/C05/C08 vẫn riêng; layout/weather/combo imports là expansion.
- **Evidence:** [parked scope](Underconstruction_by_BE.md#freeze-019-scope-update--16102026), [Import entries](../../src/pages/imports/ImportPage.tsx), [018 missing published APIs](../sprints/018/018_Backend_Capabilities_Service_Boundary.md#capability-audit-and-implementation).

## Live verification backlog

### LV-01 — Live Owner/Staff acceptance / complete design coverage

**Design:** NOT_REQUIRED · **Frontend:** PARTIAL · **Backend:** NOT_REQUIRED · **Live verification:** NOT_RUN
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** 019:445 tests,41 selected browser cases across runs;347 catalogue entries chỉ accounting.
- **Remaining gap:** Chưa deployed identity/worker/mail/Owner-Staff business acceptance; không current blocker evidence.
- **Next action:** FE hoàn thiện controlled matrix; BE cấp prerequisites; chạy bounded isolated live + readback.
- **Safe current behavior:** Giữ NOT_RUN/CONTROLLED_ONLY; không đổi fixture/screenshot thành live PASS.
- **Evidence:** [019 verification](../testing/FREEZE_019_VERIFICATION.json), [freeze inventory](../testing/FREEZE_019_DESIGN_AUDIT.json), [017 protocol](../testing/017_Live_BE_FE_E2E_Protocol.md), [016 environment follow-up](../../FE_ask/016_Integration_Design_and_Verification.md#be-evidenceenvironment-needed).

Cover signup/email/Store/invitation continuation; partial and lost-ACK uploads; source proof/identity/declarations/units; Owner self-approval and Staff denial; submit/withdraw/changes_requested/resubmit/reject/approve; notification read CAS/destination revocation; global domain gates and conditional reasons; persisted Review/atomic commit/retained I06; C02 full-request readiness and captured budgets; D01 unknown/partial. Include negative cross-Store/current-rights/stale/replay/readback cases. API-03 and unsupported BE/design variants need explicit dispositions, not fabricated PASS. Workers/mail/engine/data integrity require deployed evidence, not fixture acceptance.

- **Bounded live API smoke 16/10/2026:** Owner/Staff A01/A03/T01/T02 và một batch I01/I02/I04 đã phản hồi; I03 nhận job nhưng J01 vẫn queued sau bounded poll/later readback. FE HTTP / BE HTTPS Origin mismatch; worker execution chưa được xác minh. [Run evidence](../testing/live-runs/import-smoke-2026-10-16T08-29-02-943Z/README.md). Đây là LIVE_API_ONLY, không đóng UI acceptance hoặc đổi các mục CONTROLLED_ONLY thành VERIFIED.

## Non-blocking FE polish / technical debt

### TD-01 — Non-blocking FE visual / diff / bundle debt

**Design:** READY · **Frontend:** PARTIAL · **Backend:** NOT_REQUIRED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE · **Blocker category:** VISUAL_POLISH, FE_IMPLEMENTATION

- **Current state:** Bounded earlier screenshots có; array diff positional; bundle/lint debt còn. The 17/10 canonical green visual refinement is implemented across existing surfaces, with current/completed full-arrow stepper shared by Owner/Staff and explicit neutral negative/uncertain actions. All 13 final design sources were inspected; AST/CSS checks and 479 controlled tests pass. New FE browser/render/a11y acceptance remains NOT_RUN; see [visual receipt](../sprints/020/020_Visual_Language_Refinement.md).
- **Remaining gap:** Thiếu full visual/a11y, reorder-friendly diff và bundle isolation. The later [visual-convergence pass](../testing/visual-fidelity/MAGICPATH_FE_CONVERGENCE.md) adds controlled static Planning/default/blocked/busy/permission/Readiness/mobile and Import/History loading captures, plus 252 controlled regressions. Planning geometry/typography is closer to current canonical; full generic requirement-widget fidelity, complete copy provenance and hydrated all-family/state acceptance remain open. Earlier green-pass browser NOT_RUN is historical and is not changed into live acceptance.
- **Next action:** FE audit frozen states/focus; stable-identity diff; đo/split generated registry.
- **Safe current behavior:** Full spec vẫn authority; không redesign hoặc merge theo tên.
- **Evidence:** [Profile diff](../../src/features/import-data/components/ImportProfileSpecification.tsx), [capabilities imports](../../src/features/backend-capabilities/capabilities.react.ts), [019 screenshots/checks](../sprints/019/019_Main_Frontend_Implementation.md#final-verification-receipt--16102026).

## Sufficiently implemented — live acceptance still open

These entries do not need a replacement screen or a new backend endpoint for their stated supported scope. They stay in verification accounting; “implemented” is not “live closed”.

### FM-002 — Full-spec Profile review / decision

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Full/changed/first Profile, approve/reject/retire, pinned baseline/MQ review đã có.
- **Remaining gap:** Thiếu live stale/retired/current-rights/self-approval evidence.
- **Next action:** Chạy live N5/MQ03 matrix; global discovery xem SC-01.
- **Safe current behavior:** Approval bao phủ full spec; không thay baseline bằng latest.
- **Evidence:** [Profile specification](../../src/features/import-data/components/ImportProfileSpecification.tsx), [MQ detail](../../src/features/import-data/components/MappingSubmissionsPage.tsx), N5/M01/MQ03.
- **Historical reference:** [FM-002](../FOUND_MISSING_UI.md#fm-002--full-spec-profile-decision-controls).

### FM-003 — Persisted Review / conditional Commit reason

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Persisted Review và independent Commit reason/ack đã có; pure insert/NO_OP reason optional.
- **Remaining gap:** Thiếu live pins/atomic receipt; history corrections xem API-03.
- **Next action:** Regression global gates đã bao gồm API-03; live I05 → I06 vẫn cần xác nhận.
- **Safe current behavior:** Không reuse Review reason hoặc bypass domain/stale/unknown blocker.
- **Evidence:** [Preview](../../src/features/import-data/components/ImportPreview.tsx), [reason policy](../../src/features/import-data/importCommitReason.ts), [workflow](../../src/features/import-data/importFlow.workflow.ts), I05/I06; [freeze tests](../../tests/frozen-policy.test.mjs).
- **Historical reference:** [FM-003](../FOUND_MISSING_UI.md#fm-003--persisted-review-confirmation).

### FM-006 — File/Sheet resolver scope / paging

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Shared scope selection, unresolved/all, issue navigation, load-more và load/empty/error/retry đã có.
- **Remaining gap:** Chưa live-verify multi-file/multi-sheet và snapshot drift; không phải thiếu thiết kế/screen.
- **Next action:** Chạy Owner/Staff paging/scope matrix với coherent M01/M02/M03 snapshots.
- **Safe current behavior:** Loaded page/count không chứng minh toàn import đã resolve; stale/invalid scope phải reload.
- **Evidence:** [Resolver](../../src/features/import-data/components/ImportFlow.tsx), [workflow](../../src/features/import-data/importFlow.workflow.ts), M01/M02/M03; [019 audit](../testing/FREEZE_019_DESIGN_AUDIT.json).
- **Historical reference:** [FM-006](../FOUND_MISSING_UI.md#fm-006--multi-sheet-resolver-selection-and-paging).

### FM-008 — Completion versus current Readiness

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** I06 tách R01; unassessed/unknown/unavailable/permission states và ba quyền đã có.
- **Remaining gap:** Thiếu real data/worker/current-rights live acceptance.
- **Next action:** Test I06 bất biến, R01 theo Store/date và ba quyền.
- **Safe current behavior:** Không đổi unknown thành zero; R01 fail không cho commit lại.
- **Evidence:** [Readiness](../../src/features/import-data/components/ImportReadiness.tsx), [R01 adapter](../../src/features/import-data/importReadiness.data.ts); [controlled Import cases](../../tests/e2e/import-experience.api.spec.ts).
- **Historical reference:** [FM-008](../FOUND_MISSING_UI.md#fm-008--readiness-unassessed-unknown-and-unavailable).

### FM-012 — Exact rational unit conversion

**Design:** READY · **Frontend:** IMPLEMENTED · **Backend:** SUPPORTED · **Live verification:** CONTROLLED_ONLY
**Owner:** FE + BE · **Blocker category:** LIVE_VERIFICATION

- **Current state:** Exact positive numerator/denominator, units/evidence/Save đã có.
- **Remaining gap:** Thiếu real compatibility/engine live acceptance.
- **Next action:** Chạy unit/pack/density negative matrix với BE.
- **Safe current behavior:** Không infer conversion hoặc dùng float.
- **Evidence:** [ConversionEditor](../../src/features/import-data/components/ImportResolutionEditor.tsx), M04 `Conversion`; [019 receipt](../sprints/019/019_Main_Frontend_Implementation.md).
- **Historical reference:** [FM-012](../FOUND_MISSING_UI.md#fm-012--rational-conversion-declaration-and-evidence).

Planning supplied-request R01/body fence and N9 captured budget are also implemented ([Planning workflow](../../src/features/decision-planning/planning.workflow.ts), [readiness adapter](../../src/features/decision-planning/planning.data.ts), [History page](../../src/features/operations/PlanningHistoryPage.tsx)); verification belongs to LV-01, not a newly invented FM. SU01 Supplier search, available source_only, valid RULE full-spec approval, 15 schema enums, raw cells/source effects/scoped projections and EX01/PR/IN01 APIs exist in main: absence claims from older target011 are superseded. History corrections được nối020 trong supported atomic-commit scope; xem API-03/SC020-02, không claim separately persisted decisions.

## Immediate work and dependency order

1. **FE — RT-02 sealed Analyze retry:** existing failed/retry design đủ; nối published I03 explicit terminal retry với fresh CAS/source set/current allowed_actions. Lost ACK vẫn recovery của original intent; không unseal/thay bytes.
2. **FE — FM-009 / TD-01:** descriptor validation/ergonomics và full visual/a11y coverage trong controls có sẵn. Không cần invent replacement workspace.
3. **FE + Product/Design — CR-01 / Assistant boundary:** Dedicated T03 recovery is wired and has Windows controlled browser evidence. The separate [afternoon020](../sprints/020/020_Backend_Handoff_Integration.md) generic journal/AS01–03 boundaries remain without product callers. Audit current MagicPath before non-T03 rollout; generic native IndexedDB acceptance and Assistant live acceptance remain NOT_RUN.
4. **FE + BE — LV-01:** controlled checks020 không phải live acceptance; cần bounded deployed Store/account/worker/mail evidence theo017. CR-01 durable recovery và CR-02 projections là dependencies riêng.

Waiting on BE: immediate create+bind; source-level period/display projections; accepted-byte replace/delete/unseal; separate Preview decisions; generic negative-outcome proof as a proposed extension. The accepted allowlisted journal direction is available; its production rollout is FE/Product/Design work. SC020-01–03 là design/contract discrepancies đã ghi cách xử lý an toàn, không policy ambiguity. API-01–06 không còn waiting-on-design trong supported scope. SC-01 vẫn parked.

## Next missing UI audit — 020

Earlier [73-operation reconciliation](../testing/PASS_020_CAPABILITY_AUDIT.json) remains historical. The current [76-operation service inventory](../testing/BACKEND_CAPABILITY_COVERAGE.json) adds AS01–03 at the API/state boundary only; it is not an updated UI audit. The earlier reconciliation so sánh published capabilities, reachable routes/adapters và canonical designs. I03 RT-02 và M04 FM-009 là **PARTIAL_UI** có design; supported D01 sections, retained recipe changes và remaining service families có callers. Dedicated infrastructure workspaces là **NOT_REQUIRED**, health là **BACKEND_ONLY_INTERNAL**, SC-01 là **PARKED_PRODUCT_SCOPE**.

Earlier020 audit conclusion: **NO ACTIVE MISSING UI FOUND** ngoài supported designs đang implement, adequate-design FE debt, BE gaps và parked/not-required scope. Afternoon020 performs no new UI audit; recovery rollout/Assistant binding still require current MagicPath review and cannot be marked design-approved from this historical conclusion. Không tạo next-screen spec hoặc MagicPath worker prompt giả. Danh sách conflict và limitations chi tiết tại020; không đổi historical register.

## Reconciliation evidence / maintenance

Read [019 implementation](../sprints/019/019_Main_Frontend_Implementation.md), [018 service boundary](../sprints/018/018_Backend_Capabilities_Service_Boundary.md), [019 FE_ask](../../FE_ask/019_Freeze_Integration_Gaps.md), [016 follow-up](../../FE_ask/016_Integration_Design_and_Verification.md), [015 debt](../sprints/015/015_Import_TechDebt.md), [013 display brief](../../FE_ask/013_Import_Display_Contract_Clarifications.md), [handoff mismatch corrections](../../shelfcash_FE_handoff_869eaec9/verification/DOC_MISMATCHES_VI.md) and current callers/OpenAPI for every row. UI existence was checked in source; API existence in main016; freeze readiness uses recorded refs. 020 đã chạy controlled regression/browser checks; xem receipt020. Không chạy live BE acceptance. Đã giữ đủ FM-001–016, recount29 status lines và kiểm historical SHA256/contract preservation (252 files); current link/verification evidence theo020. README/AGENTS/.agents/Import rule trỏ current planning sang V1; 020 có đổi runtime trong sáu supported gaps; các historical receipts vẫn được giữ như bằng chứng thời điểm trước.

When updating: change independent dimensions only with evidence; recount all item status lines, retain all FM references, add non-FM IDs for distinct runtime/API/verification debt, and leave historical register unchanged. Re-audit MagicPath before implementing new interaction. No commit/push.
