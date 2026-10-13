# 011 — TechDebt sau BE night response và triển khai FE

Ngày tạo lập: 13/10/2026. General Context: tiếp nối [010_TechDebt.md](010_TechDebt.md), dùng phản hồi R00–R13 và bundle `010_BE_FE_handoff_20261013`. Authority: CURRENT FACT / IMPLEMENTED > ACCEPTED / DESIGN_READY > FE PROPOSAL. Source/WIP, local wire parity và live acceptance là ba lớp riêng. Chi tiết evidence: [receipt 011](011_Implementation_Receipt.md).

## Đã resolve hoặc đóng subtask, không giữ như API thiếu

- `010-BE-000A` delivery: đã nhận và kiểm cả ba snapshots/80 file manifest. Đã pin T và cập nhật Import wire/UI; không xin lại artifact đã giao. Shared release/live phần còn lại nằm trong 011-BE-000.
- `010-BE-014`: local T Import schema parity cho opening/provenance/basis/diagnostics đã resolve; M03 descriptors/generic shared editor và drawer đã nhận fields tương ứng. Không phải API design còn thiếu. Full live opening/setup chain chưa nghiệm thu.
- `010-BE-011A`: source-before-reuse guard có trong supplied source, không giữ “BE chưa xử lý”. FE có flow declaration và help theo current routes; executed negative matrix/live giữ ở 011-BE-000.
- `010-BE-011B`: cross-sheet recipe scope blocker có trong source. Single-sheet giữ nguyên; split-report assembly **DEFERRED** nên đóng Product question và không mở request API split-report.
- `010-FE-004`: PDF reference/ineligible candidate, no-candidate gate, lost ACK, artifact 503 recovery và 403 gates đã resolve qua FE + controlled browser sprint 011.
- Các subtask đã đóng từ 009/010 (V01 discovery, N16 scope, M02 filtered total, initial N4, N1–N3, canonical Preview): giữ closed. General settings/location/unified timeline đã deferred, không active API debt.

## Active BE / integration dependencies

### 011-BE-000 — Shared release, environment và executed acceptance

Kế thừa phần còn lại `010-BE-000A` và `010-BE-000B`, live phần `010-BE-014/011A/011B`. **PARTIALLY RESOLVED**: local T structural parity có; runtime hợp nhất và môi trường/evidence chưa có.

T 54/50, I 54/50 và B 59/55 là các snapshots riêng, không cộng gộp theo HEAD. Bundle là reference, dependencies không đầy đủ để chạy backend và supporting source có thể được copy sau snapshot. FE target T d45b25…; backend cần phục vụ đúng schema/semantics đó trước live acceptance. Không trộn Auth demo8102 với S4.11/Import18001 như cùng database/release.

Cần integrated build identity/OpenAPI/source provenance, worker readiness, Origin/cookie/CORS/CSRF configuration, accounts/Store/grants và executed request/fresh-read evidence. Coverage cần mở gồm source-reuse/retirement/recipe guards, opening↔N6/count/declarations, price/MOQ/nullable facts và full FE chains. Health/SMTP accepted/test source không đủ. Không yêu cầu BE thiết kế endpoint mới cho việc này. Follow-up F01.

### 011-BE-001 — B1/B2 public self-service integration và FE onboarding

Kế thừa `010-BE-001`/R01. **PARTIALLY RESOLVED — SOURCE IMPLEMENTED IN AUTH WIP, NOT IN T / NOT LIVE VERIFIED**.

B1/B2 reported COMPLETE với fake delivery; snapshot B có A02/A05/A06/A07/N7, nhưng kèm B3 WIP. T không có bốn issuance/verification routes mới. Không còn debt “BE chưa có source ở bất cứ đâu”; vẫn cần stable B1/B2/integrated runtime và FE public screens/adapters/tests theo snapshot được chọn. Sprint 011 không wire public endpoints vào target T, không hứa email delivery.

A07 source trace là `/auth/password-reset/request`, khác `/auth/password-reset-requests` ở prose afternoon. Source/OpenAPI phải quyết định spelling và response/errors, không tạo hai fallback calls. Complete rồi login riêng, không Store/Owner auto-provision. Follow-up F02.

### 011-BE-002A/B — Decline B3 và consent schema drift

Kế thừa `010-BE-002A/B`/R02. **B3 SOURCE WIP / NOT COMPLETE**; true-only schema correction chưa resolve.

B có IN01, declined projections/writer/migration; T/I chưa có. Không ship chỉ vì B WIP OpenAPI có route. Cần final lifecycle/filter/reissue/race/replay/authorization acceptance và stable handoff. Cả ba AcceptInvitation schemas còn boolean trong khi runtime false bị422; FE tiếp tục chỉ true. Follow-up F03.

### 011-BE-005 — Scoped mapping counters

Kế thừa `010-BE-005`/R03. **ACCEPTED / DESIGN_READY, NOT RUNTIME** ở T/I/B. Batch Progress và filtered total hiện có không thay counter_scope/status/origin/file totals. Giữ labels thật, không đếm page length. Chờ M01/M02 extensions và snapshot tests; không Product question mới.

### 011-BE-006A — Bounded raw cells/source_effect projection

Kế thừa `010-BE-006A`/R04. **DESIGN_READY, NOT RUNTIME**. T provenance.source_value đã giao và FE hiển thị, nhưng không full SourceEvidenceCell/source_cells/planned_effect projection; private parser không public read contract. Chờ I04 extension + permissions/pins/bounds.

### 011-BE-006B — Preview aggregates theo file/sheet

Kế thừa `010-BE-006B`/R05. **ACCEPTED / DESIGN_READY, NOT RUNTIME** — không còn FE proposal/Product OPEN.

Canonical Import §17.1 chốt raw source rows riêng logical distinct actions; action nhiều locations đếm một lần trong scope, scope con có thể overlap nên không cộng thành batch total. Typed DTO/query structure chưa implemented; không tự chọn field names hoặc derive totals từ pages. Chờ I04 runtime cùng pinned digest/filters. Follow-up F04.

### 011-BE-007 — Supplier discovery

Kế thừa `010-BE-007`/R06. **DESIGN_READY, NOT RUNTIME**: SU01 chưa có trong ba snapshots. N6 nullable supplier vẫn dùng được; writer Supplier không thay picker. Chờ same-Store supplier.read/q/paging/version contract thực thi, không nhập tên thành UUID.

### 011-BE-008A — N9 creator/local created-date filters

Kế thừa `010-BE-008A`/R07. **DESIGN_READY, NOT RUNTIME**. Giữ status/forecast filters hiện có. Accepted_at theo timezone Store là ngày tạo; không dùng forecast-start thay thế hoặc gọi Owner-only membership API để dò creator.

### 011-BE-008B — Export discovery

Kế thừa `010-BE-008B`/R08. **DESIGN_READY, NOT RUNTIME**. EX01 chưa có GET collection. N10/J01/N11 + known locator vẫn hoạt động; không POST chỉ để tìm PDF cũ. Retention đã chốt; unavailable bytes không automatic recoverability.

### 011-BE-008C — Captured budget trên History

Kế thừa `010-BE-008C`/R09. **ACCEPTED / DESIGN_READY, NOT RUNTIME** — không còn FE proposal/Product OPEN.

Planning §17 chốt limit/currency tại acceptance và availability/null cho evidence cũ thiếu. RunSummary T/I/B chưa có extension; C03 có budget không chứng minh N9 list có. Giữ “Xem trong Run”; không current Store cap, no N+1 client reconstruction. Typed DTO chờ slice implementation. Follow-up F04.

### 011-BE-012A/B — Regular permission requests và inbox

Kế thừa `010-BE-012A/B`/R11/R12. **ACCEPTED / DESIGN_READY, NOT RUNTIME**. PR01–PR04/NF01–NF03 chưa source/runtime trong cả ba snapshots. B1/B2 email hay B3 decline không resolve inbox. N13 grants authority không request lifecycle; notification không task/approval authority. Không ghép hai grants writes giả atomic hoặc badge từ page/email intent.

### 011-BE-013 — Excel actual receipt

Kế thừa `010-BE-013`/R13. **DESIGN_READY, NOT RUNTIME**. T có opening/count; N6 form ACTUAL_RECEIPT có; inventory_receipts schema/consumer chưa có trong T/I/B. A2 purchase history là history-only, không receipt/inbound/movement. Chờ pipeline/ledger/atomic mixed-groups extension; không HTTP loop N6 từng dòng.

## FE / QA còn lại

### 011-FE-001 — Shared mock xuyên flow

Kế thừa `010-FE-001`, **OPEN**. Auth/invitation/import/recipe→Planning/PDF chưa là một fake backend thống nhất; Import synthetic, recipe không đổi mock engine basis, reload reset. Không được coi snapshot BE hoặc 27 browser cases là resolve mock toàn phạm vi. Không cần BE thêm API cho debt này.

### 011-FE-002 — Browser/live ma trận rộng

Kế thừa `010-FE-002`, **PARTIAL**. Sprint này thêm reference PDF/no-candidate/503 retry/new-export/403 và Import T boundary/provenance/guards. Còn opening/shared declarations end-to-end với real BE, expiry/picker nhiều trang, date-edit/withdraw/conflict/resume, multi-Store revoke/switch khi pending, Saved archive/conflict và mọi viewport/fault. B1/B2 public FE chưa nối target T; cần handoff/integration trước nghiệm thu flow chung.

### 011-FE-003 — Performance/lint và ổn định tests

Kế thừa `010-FE-003`, **OPEN**. Main bundle 993.53 kB minified/268.93 kB gzip; hai set-state-in-effect warnings còn ở OnboardingPages/RecipeSchedulePage. Dirty-close test đã sửa giả định sai về combobox focus restoration và targeted pass; full run ban đầu 26/27, không che failure lịch sử. Chưa đủ reduced-motion/viewport/performance evidence.

## Cách đóng

Các requests đã Product duyệt chỉ chờ implementation/handoff/evidence, không xin duyệt lại policy. Source guard đã có không giữ làm “thiếu BE code”; local T parity đã resolve không tiếp tục đòi ba JSON. Shared release/live, các DESIGN_READY chưa runtime và phần FE/QA chưa làm được theo dõi riêng. [FE_ask/011_FE_to_BE_Followup.md](../FE_ask/011_FE_to_BE_Followup.md) chỉ gửi dependencies còn thiếu; không chứa phạm vi Underconstruction hay split-report đã deferred.
