# 010 — TechDebt sau reconcile BE chiều 13/10

Ngày tạo lập: 13/10/2026. General Context: đối chiếu TechDebt 009 với toàn bộ năm tài liệu trong `BE_answer/13_10_afternoon/` và artifact/FE hiện có. `FE_ask/` ban đầu rỗng; chủ dự án đã xác nhận dùng [009_TechDebt.md](../009/009_TechDebt.md) làm baseline.

Authority: CURRENT FACT / IMPLEMENTED > DESIGN_READY / ACCEPTED DECISION > FE PROPOSAL TO BE. “BE reported implemented” khác “đã bàn giao artifact khớp FE”, và cả hai khác “đã kiểm thử live”. Chi tiết evidence tại [receipt 010](010_Implementation_Receipt.md); bản gửi BE tại [API/capability requests](../../../FE_ask/010_FE_to_BE_API_Capability_Requests.md).

## Những debt đóng, không đưa trở lại backlog API thiếu

- V01 discovery canonical nguyên liệu, kể cả chưa có lô: contract đã resolve; picker FE đã có từ 009. Không cần endpoint nguyên liệu mới.
- N16 events theo `invitation_id`: contract đã resolve, FE đã sửa. Dùng ID theo AUTH mới: N18 là recipient offer, N19 là accept; N12 là membership list. Không dùng số ID sai trong ghi chú cũ làm route authority.
- M02 filtered `pagination.total_count`: đã resolve. `counts` vẫn toàn batch, không phải auto count hay per-sheet count.
- C01 authorized `budget_ceiling=null` và N4 initial create-only: đã resolve; zero/create-race/replay đã có FE handling. Không còn debt “không biết tạo budget ban đầu thế nào”.
- Preview groups/before-after/source locations/provenance hiện hành: đã resolve; không yêu cầu BE giao lại các fields này. Raw cells là extension riêng phía dưới.
- Saved N1–N3 discovery/readback và captured Run coherence: đã có contract/FE. Không cần API CRUD Saved thứ hai.
- `009-BE-003` unified activity timeline: **RESOLVED BY SCOPE DECISION — DEFERRED**, theo API handoff Đợt 2. N14 và N16 giữ hai feed riêng; NF inbox không thay timeline. Đóng câu hỏi Product cũ, không yêu cầu BE implement timeline để nghiệm thu current scope.
- Phần location của `009-BE-007`: **RESOLVED BY SCOPE DECISION — DEFERRED/UNSUPPORTED**; V03 location null/unsupported. Không giữ location picker/writer như thiếu API bắt buộc trong scope này.
- Phần general Store profile/settings writers của `009-BE-010`: **RESOLVED BY SCOPE DECISION — DEFERRED**. Chỉ threshold N8, budget N4, requirements N1–N3 được dùng; không gửi language/priority/open-PO/general settings qua các writer đó. Currency/timezone mutation sau lịch sử không được mở bởi tài liệu mới.

Đóng contract/scope không có nghĩa live acceptance đã PASS. Không yêu cầu lại Product phê duyệt các quyết định Đợt 2 đã được BE ghi ACCEPTED DECISION.

## Debt BE / bàn giao đang mở

### 010-BE-000A — Artifact/source parity chưa được bàn giao

Nguồn cũ: `009-BE-000`. **PARTIALLY RESOLVED**: có handoff prose mới và danh sách phân biệt implemented/design-ready; chưa có OpenAPI/source release mới tương ứng.

OpenAPI local vẫn SHA256 `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`, 54 operations/50 paths. Không có source BE `app/...` trong checkout này để kiểm chứng các source references mới. Con số 54 không chứng minh DTO parity: Import mới báo mười schemas/opening_stock, quantity_basis/price-MOQ basis/source_value/inventory_effect, nhưng artifact local vẫn chín canonical domains và thiếu các extensions này.

BE cần giao release identity + source/generated OpenAPI đúng release + diff/examples/compatibility notes; xác định trạng thái opening_stock trước khi FE cập nhật validators. Không vá generated wire theo prose để giả parity. Gate đóng: đối chiếu schema/route/query và producer thực của cùng release.

### 010-BE-000B — Live environment, worker và acceptance evidence

Nguồn cũ: phần còn lại `009-BE-000`. **STILL BLOCKED — verification/handoff**, không phải mặc định thiếu endpoint.

Tài liệu mới không bàn giao staging URL/credentials/worker readiness hay kết quả execution mới cho FE hiện tại. Health liveness không chứng minh DB/Import/Planning/PDF readiness. Cần môi trường dùng được, Origin/cookie/CORS/CSRF configuration, fixture quyền/Store và request IDs/fresh-read evidence cho các flow current-contract. Không suy BE không implement từ việc FE chưa có môi trường. 010 không chạy HTTP/DB/browser/live; trạng thái localhost không được đo mới trong audit này.

### 010-BE-001 — Self-service account

Nguồn cũ: `009-BE-001`. **DESIGN_READY — proposed/design-ready, not runtime**. Đã resolve Product decision và product contract, chưa resolve API availability.

AUTH `auth-self-service` đã chốt A02 register, A05 verify+set password, A06 resend, A07 reset-request; N7 route hiện hành tái dùng cho completion nhưng self-service issuance/delivery chưa implemented. Signup không tạo Store/Owner/membership/session; email acceptance generic không đồng nghĩa delivered. Disabled service-wide email capability trả 503 đồng nhất, không generic 202 hứa email.

Gate đóng: runtime routes/DTO/OpenAPI và email-token lifecycle/anti-enumeration/Origin/rate-limit/reset-revocation evidence. Giữ assisted N7/Login hiện hành cho đến đó. Request R01 trong bản gửi BE.

### 010-BE-002A — Invitation decline

Nguồn cũ: `009-BE-002`. **DESIGN_READY — proposed/design-ready, not runtime**. Product decision không còn OPEN.

IN01 `/staff-invitations/{invitation_id}/decline`, declined terminal/can_decline/event/filter extensions đã thiết kế. Không tồn tại trong OpenAPI local; N19 accept:false không decline. Declined identity không reissue; lời mời mới dùng ID mới theo thiết kế.

Gate đóng: IN01 cùng lifecycle/read projections/receipts/CAS/replay/accept-decline race. Request R02.

### 010-BE-002B — OpenAPI accept boolean chưa phản ánh true-only

**PARTIALLY RESOLVED — runtime semantics rõ, structural contract drift còn tồn tại.** AUTH nêu StrictBool + true-only validator; local AcceptInvitation vẫn boolean không const true. FE đã chỉ gửi true. Cần schema mô tả đúng consent hiện hành, không nới runtime thành decline. Đây là correction contract hiện có, không endpoint mới. Request R02.

### 010-BE-005 — Mapping counters theo scope/origin

Nguồn cũ: `009-BE-005`. **DESIGN_READY — proposed/design-ready, not runtime**.

Import §17 đã định nghĩa batch/filtered counters, file/sheet/review/status/suggestion_origin filters, đơn vị mapping issues và pin mapping_revision. Không còn thiếu ý tưởng contract; chưa có query/DTO trong OpenAPI local. Giữ M01 legacy progress và M02 total đúng scope. Gate đóng: extensions thực sự xuất hiện và counts/page consistency/permission evidence. Request R03.

### 010-BE-006A — Raw source cells / typed planned effect

Nguồn cũ: một phần `009-BE-006`. **DESIGN_READY — proposed/design-ready, not runtime**.

Import §17 I04 `projection=source_effect`, file/sheet filters, SourceEvidenceCell và typed planned_effect đã được định nghĩa. Có bounds/unavailable semantics, formula chỉ cached value; không hứa full workbook viewer. Local PreviewRow/query chưa có extensions; giữ drawer 009 với source/provenance hiện có. Gate đóng: producer/schema/read-rights/snapshot/bounds evidence. Request R04.

### 010-BE-006B — Preview aggregates theo file/sheet

Nguồn cũ: phần chưa được §17 đáp ứng của `009-BE-006`. **STILL BLOCKED — FE PROPOSAL TO BE**, chưa có product contract đầy đủ.

File/sheet-filtered row page không tự cung cấp totals theo group/classification/action/issues của scope đó. Mapping counters đếm issues cũng không thay Preview action aggregates. Nếu cần badges/tổng Review theo file/sheet, BE cần chốt scope/filter/counting grain và snapshot; hoặc Product chấp nhận tổng toàn preview + số dòng đã tải hiện có. Không cộng page lengths làm totals. Request R05.

### 010-BE-007 — Supplier picker

Nguồn cũ: phần supplier của `009-BE-007`. **DESIGN_READY — proposed/design-ready, not runtime**.

API `today-operations` đã chốt SU01 `/stores/{store_id}/suppliers` với ID/name/active/version, q/paging/sort/snapshot và supplier.read; không terms/cost/contact. Local chưa có SU01. N6 nullable supplier vẫn dùng được; không gửi tên tự do vào UUID hoặc suy từ lô cũ. Inactive policy không tự bị FE siết hơn N6. Gate đóng: SU01 runtime/schema/permission/paging; expiry-tracked receipt fixtures thuộc 000B/QA, không API discovery mới mặc định. Request R06.

### 010-BE-008A — History creator/ngày tạo filters

Nguồn cũ: một phần `009-BE-008`. **DESIGN_READY — proposed/design-ready, not runtime**.

Planning §17 N9 query extensions đã chốt created_by_user_id và Store-local created_date_from/to trên accepted_at, AND với filters hiện có. DTO đã có creator; không cần user discovery mới chỉ để chọn “Tôi” hoặc creator đã đọc. Local N9 chưa có queries mới. Gate đóng: runtime/query metadata/cursor/timezone evidence. Request R07.

### 010-BE-008B — PDF export discovery mất locator

Nguồn cũ: một phần `009-BE-008`. **DESIGN_READY — proposed/design-ready, not runtime**.

Planning §17 EX01 GET exports collection đã thiết kế job/export/download locator và artifact availability. N10 POST/N11 download/J01 hiện hành không thay EX01; không POST để dò PDF cũ. Retention không thời hạn đã chốt, không giữ “cần chốt purge SLA” như Product blocker cũ. Missing/corrupt bytes vẫn unavailable; không có automatic recovery guarantee. Gate đóng: EX01 runtime/schema/list permission/integrity evidence. Request R08.

### 010-BE-008C — Captured budget trong History summary

Nguồn cũ: phần còn lại `009-BE-008`. **STILL BLOCKED — FE PROPOSAL TO BE**, chưa được N9 query extension giải quyết.

RunSummary hiện hành và thiết kế §17 không thêm effective budget/currency. Nếu cần cột ngân sách ngay trên History, cần captured budget at acceptance, có null/unavailable semantics cho legacy; không cap Store hiện tại. Hoặc Product chấp nhận “Xem trong Run”. Không cần API mới để hiển thị budget trong C03 đã có. Request R09.

### 010-BE-011A — Source-before-reuse guard

Debt mới từ Import §5.1. **PARTIALLY RESOLVED — accepted policy/design-ready guard, reported runtime gap**.

BE nêu analyze có thể auto-bind unique Store+signature candidate khi chưa có positive source evidence; copy context từ profile cũ không chứng minh nguồn file mới. M04 SourceContext đã có nhưng không làm nhánh analyze tự đúng. Cần producer enforce declared/established source trước bind, giữ unresolved khi thiếu proof; không thêm API/source truth store từ FE. FE hiển thị scope/evidence/pin và không coi auto_mapped là source verification. Gate đóng: targeted source-scope cases cả preview/commit bằng cùng source release. Request R10.

### 010-BE-011B — Recipe nhiều file cùng Product/version

Debt mới từ Import §8.4. **PARTIALLY RESOLVED — policy rõ, reported runtime guard gap; source-grain contract còn cần BE chốt**.

BE nêu assembler có thể union các Ingredient lines của hai bản recipe đầy đủ khác nhau nếu header/version giống. Policy không cho phép merge đó; chỉ report grain/scope đã xác lập mới assemble. Cần conflict/report-source semantics và whole-batch guard order-independent; không đổi recipe/BOM để chữa. API mechanism phân biệt full report với các phần của cùng report chưa được tài liệu đặc tả đủ cho FE hướng dẫn người nhập. Request R10.

### 010-BE-012A/B — Permission requests và inbox Đợt 2

Debt mới được acceptance Đợt 2 mở rõ. **DESIGN_READY — proposed/design-ready, not runtime**.

- 012A: AUTH `permission-requests` PR01–PR04. Staff submit/cancel own request, Owner approve subset/reject; approval union current grants, không replace unrelated grants hay approve-once bypass. N13/N14 hiện hành không cung cấp request lifecycle. Request R11.
- 012B: Notification NF01–NF03 list/count/read-unread. Inbox không task authority, không grant/approve bằng notification. Pending task recovery dùng queue/detail hiện hành sau khi được triển khai; read state không xóa task. Request R12.

Gate đóng riêng từng capability: routes/schema/current authorization/CAS/recovery và receipts/events đã bàn giao. Không bật bell/request-rights flows vì prose có DTO.

### 010-BE-013 — Excel actual receipt

Debt mới từ Import §16. **DESIGN_READY — proposed/design-ready, not runtime**.

N6 form receipt đã implemented; schema inventory_receipts cho Excel chưa có. Cần extension trong I01–I06/J01 pipeline hiện có, shared source identity với N6, whole-batch atomicity và typed receipt effects. Không N6 HTTP loop mỗi row; không đổi inventory_count/opening_stock thành actual receipt. Gate đóng: schema descriptors/preview/completion/receipt ledger parity và mixed-group evidence. Request R13.

### 010-BE-014 — Import runtime mới được BE báo có nhưng chưa có trong artifact FE

Liên quan 000A; **BE REPORTED CURRENT FACT / LOCAL PARITY BLOCKED**, không gắn nhầm DESIGN_READY cho tất cả.

- Recipe quantity_basis PER_SERVING/WHOLE_BATCH, provenance source_value/quantity_basis, deterministic unit normalization.
- Supplier price_basis/denominator và MOQ basis/physical quantity, supplier_term_semantics; deprecate pack_cost_basis trong proposal mới.
- EXCEL_SERIAL/epoch và header/preamble/suggestion diagnostics.
- opening_stock + inventory_effect, shared N6 identity và whole-batch setup/dependency/completeness.

Import prose về opening_stock còn nhãn WIP ở §8.4/API handoff, nhưng §13.5 và §16 nói CURRENT FACT/mười variants. Không tự kết luận release đã nghiệm thu; yêu cầu BE chỉ định finalized slice/commit và DTO từ source. Không còn yêu cầu “thiết kế opening API mới”; yêu cầu parity handoff và xác nhận trạng thái. Request R00.

## FE / QA đang mở, không yêu cầu BE thêm API để giải quyết

### 010-FE-001 — Shared mock toàn phạm vi

Kế thừa `009-FE-001`, **STILL OPEN — FE implementation**. Auth/invitation/import/recipe→Planning/PDF chưa là một fake backend thống nhất; reload reset, Import synthetic riêng, recipe chưa đổi mock engine basis. Tài liệu BE không tự sửa mock. Không đề xuất endpoint mới cho debt này.

### 010-FE-002 — Flow/permission/failure acceptance rộng

Kế thừa `009-FE-002`, **PARTIALLY RESOLVED — các slices 009 đã đạt, ma trận rộng chưa đủ**. Giữ các phần đã đóng: onboarding states/đúng Store, Preview drawer, receipt Review/dirty/recovery, recipe confirmation, Saved draft preservation, History paging, PDF alternative/download retry. Còn nhiều Store/revocation/pending switch, expiry/paged picker, recipe date-edit/withdraw/conflict/resume, multifile provenance, archive/conflict, PDF long/status/retention. BE runtime fixtures hỗ trợ kiểm chứng, không phải tất cả là API thiếu. Kết quả 350 + 22 của 009 là historical, không tests mới của 010.

### 010-FE-003 — Coverage/performance/lint

Kế thừa `009-FE-003`, **STILL OPEN — FE/QA**. Chưa đủ A/B/C/viewport/reduced-motion; bundle/lint warning theo receipt 009 chưa được đo lại. Audit docs không resolve các debt này.

### 010-FE-004 — PDF alternate export bị FE giới hạn eligible

Debt mới phát hiện từ source FE so với Planning §15.4. **STILL OPEN — FE contract alignment**, không cần BE thêm API.

`src/features/operations/PlanExport.tsx` lọc `run.result.options` bằng `o.eligible` và khóa submit theo eligible; contract hiện hành cho export candidate ineligible/reference với cảnh báo không khuyến nghị. FE cần hiển thị candidate exportable theo retained evidence, phân biệt eligibility khỏi exportability; lỗi OPTION_NOT_EXPORTABLE vẫn do BE quyết định. Không mở mọi known option mù quáng khi không có candidate. Chưa sửa runtime trong lượt audit 010; cần controlled test no-winner/ineligible candidate và xác nhận warning. N10/N11 lỗi artifact 503 cũng phải giữ nhánh unavailable/retry phù hợp, không coi chỉ 404/410 mới unavailable.

## Điều kiện cập nhật trạng thái

Thiết kế đã chốt: chuyển từ “Product OPEN” sang dependency runtime, không xin duyệt lại cùng policy. API đã có trong source nhưng FE thiếu artifact: đòi handoff/parity, không yêu cầu thiết kế endpoint trùng. Extension chưa chốt: giữ FE PROPOSAL TO BE và cần BE/Product review. Có runtime + artifact vẫn cần FE wiring/test/live acceptance riêng. Các mục ngoài phạm vi thực thi đã được chủ dự án tạm dừng không nằm trong danh sách debt active này.
