# 010 — FE → BE: API / capability requests còn thiếu

Ngày tạo lập: 13/10/2026. General Context: reconcile [TechDebt 009](../docs/009_TechDebt.md) với năm contract BE bàn giao chiều 13/10. Đây là tài liệu gửi BE review; không phải tuyên bố các API đề xuất đã có. Chi tiết trạng thái tại [TechDebt 010](../docs/010_TechDebt.md).

## Ranh giới bàn giao

FE hiện dùng `api-contract-v2/generated/openapi.json`, SHA256 `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`: 54 operations/50 paths. Đợt 2 dự kiến 72 operations/66 paths trong prose **không phải runtime inventory FE được phép gọi**. Checkout FE không chứa source BE `app/...` để xác thực source references mới.

Ưu tiên authority: CURRENT FACT / IMPLEMENTED > DESIGN_READY / ACCEPTED DECISION > FE PROPOSAL TO BE. Với từng request, mong BE trả lời: đã implemented ở release nào / vẫn DESIGN_READY / partially resolved / cần Product decision; kèm artifact hoặc câu hỏi còn cần chốt. Không cần BE thiết kế infrastructure/DB implementation trong phản hồi này.

Các mục đã tạm dừng bởi chủ dự án không nằm trong danh sách yêu cầu thực thi này. General settings/location/unified activity đã được BE ghi deferred cũng không được mở lại. N5 per-import hiện hành vẫn giữ nghĩa approval profile khác canonical commit.

## R00 — Handoff runtime và wire parity của release mới

**HANDOFF REQUEST cho BE REPORTED CURRENT FACT; không phải đề xuất endpoint mới.** Liên quan 010-BE-000A/B và 014.

FE cần source-generated OpenAPI đúng release, commit/build identity, schema/query diff và examples success/error cùng release. Các điểm cần xác nhận cụ thể:

- Import mới có quantity_basis và source_value/line provenance; price/MOQ basis/denominator và supplier_term_semantics; EXCEL_SERIAL/epoch/header/preamble diagnostics; opening_stock/inventory_effect.
- Local artifact còn chín canonical domains, chưa có các extensions trên. Runtime mới trả fields mà validator local chưa biết có thể bị FE từ chối; không giải bằng cách nới validator tùy ý.
- opening_stock được mô tả CURRENT FACT/mười schemas ở Import §13.5/16 nhưng còn WIP ở §8.4/API handoff. Xin chỉ rõ slice finalized, commit và public acceptance; không yêu cầu endpoint opening mới vì N6 form đã có.
- N19 schema accept boolean cần phản ánh consent true-only; false không decline.

Để nghiệm thu runtime, FE còn cần base URL/config chạy, Origin/cookie/CORS/CSRF setup, worker readiness, accounts/Store/permissions và fixtures many-page/no-cap/zero-cap/expiry-tracked/invitation states. Health ok chỉ là liveness. Xin bàn giao evidence executed và request IDs; specification/test-file presence không thay runtime evidence. Không đề nghị quyền reset DB staging hoặc seed business facts giả.

## Các capability đã có thiết kế BE — đề nghị triển khai/bàn giao, không thiết kế lại

### R01 — Signup, verify/resend, forgot/reset

**BE DESIGN_READY / ACCEPTED DECISION — proposed/design-ready, not runtime.** Nguồn: [AUTH self-service](../BE_answer/13_10_afternoon/AUTHORIZATION_CONTRACT_VI.md#auth-self-service). Debt 010-BE-001.

Flow: người chưa có account đăng ký/verify; người quên mật khẩu yêu cầu reset; holder hoàn tất password rồi login riêng. FE gửi email/display_name khi signup, email khi resend/reset-request, token + password khi completion; nhận next_action/check_email/cooldown hoặc completed_at/login và lỗi an toàn.

Expected capability: account mới chưa có Store/Owner/grants; anti-enumeration cho account classes; password policy N7; token đúng purpose/single-use/reissue; reset revoke sessions, không đổi grants. Service-wide email unavailable trả 503 đồng nhất trước acceptance, không bắt người dùng chờ email không thể gửi. Generic 202 không nói delivered. Public completion không tự login.

BE đã đặt A02/A05/A06/A07, N7 consumer tái dùng. FE cần routes/DTO/errors/delivery runtime và examples đúng release, không một reset endpoint thứ hai. Không dùng N7 đã có để suy reset-request/email issuance đã tồn tại.

### R02 — Recipient decline và true-only accept schema

**BE DESIGN_READY / ACCEPTED DECISION — proposed/design-ready, not runtime** cho IN01. **CURRENT-CONTRACT CORRECTION** cho accept true-only. Nguồn: [AUTH self-service/decline](../BE_answer/13_10_afternoon/AUTHORIZATION_CONTRACT_VI.md#auth-self-service). Debt 010-BE-002A/B.

Flow: đúng holder đọc offer rồi chủ động từ chối, thấy terminal result; Owner có thể gửi lời mời identity mới. FE gửi token + reason cùng invitation version và logical intent, nhận declined receipt/event/version; offer/list cần can_decline, declined state/timestamp và filter đúng lifecycle.

Expected capability: không tạo membership/grants; accept/decline/revoke race chỉ một outcome; retry giữ intent; pending offer đổi phải review lại. Declined invitation cũ không hồi sinh qua reissue. Không accept:false shortcut, không dùng revoke để giả recipient decline. Xin đồng thời sửa structural OpenAPI accept thành true-only theo runtime hiện hành.

### R03 — Mapping counters đúng file/sheet/filter/origin

**BE DESIGN_READY — proposed/design-ready, not runtime.** Nguồn: [Import §17](../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md#mapping-projections). Debt 010-BE-005.

Flow: người nhập xem tiến độ và số issue theo file/sheet/status/origin, không phải đọc toàn bộ pages để đếm. FE gửi các filters đã thiết kế; cần batch và filtered totals/by_status/by_suggestion_origin cùng counter_scope/mapping_revision, nhất quán với page M02.

Expected capability: đơn vị mapping issues; zero thật khác chưa biết; legacy Progress không đổi nghĩa; filters AND; revision/cursor đổi phải refresh. Không lấy completed_fields làm auto count, không cộng page lengths. Xin triển khai extensions M01/M02 đã chốt, không endpoint metrics song song.

### R04 — Raw source → canonical → planned effect

**BE DESIGN_READY — proposed/design-ready, not runtime.** Nguồn: [Import §17](../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md#mapping-projections). Debt 010-BE-006A.

Flow: Preview row drawer đối chiếu ô nguồn với normalized values và tác động dự kiến trước Review/Commit. FE gửi pinned preview + projection/source filters/cursor; cần SourceEvidenceCell location/label/raw cached value/kind/formula_present, typed planned effect và warning/unavailable khi không thể hiển thị nguồn.

Expected capability: cùng preview digest/mapping/read-set; read không recanonicalize; không formula execution/whole workbook leak; bounds không biến truncated value thành bằng chứng đầy đủ. Permissions giữ Import whole-response sensitive rights. Before/after/provenance hiện có vẫn dùng được trong lúc chờ, không yêu cầu giao lại endpoint Preview cơ bản.

### R06 — Canonical supplier discovery cho Receive Goods

**BE DESIGN_READY — proposed/design-ready, not runtime.** Nguồn: [API supplier discovery](../BE_answer/13_10_afternoon/API_CONTRACT.md#today-operations). Debt 010-BE-007.

Flow: tìm và chọn supplier của receipt thực nhận. FE gửi Store + q/active/sort/limit/cursor/snapshot; cần supplier_id/name/active/version và page metadata. Sau chọn, N6 gửi supplier UUID theo contract hiện có.

Expected capability: same-Store canonical identity, current supplier.read, không lộ terms/cost/contact; revoke/stale choice không cấp authority ghi. Không tự cấm inactive trái policy N6. SU01 đã được BE thiết kế; xin bàn giao runtime. Nullable supplier vẫn cho phép receipt hiện hành, không buộc user nhập UUID hoặc bịa supplier từ tên.

### R07 — Tìm Run theo creator và ngày tạo tại Store

**BE DESIGN_READY — proposed/design-ready, not runtime.** Nguồn: [Planning §17](<../BE_answer/13_10_afternoon/PROCUREMENT_API_CONTRACT_VI (1).md#planning-discovery>). Debt 010-BE-008A.

Flow: History tìm đúng lần chạy theo người tạo/khoảng ngày tạo, độc lập forecast start. FE gửi created_by_user_id/created_date_from/to; cần filtered RunSummary, applied_filters/timezone và cursor/snapshot đúng scope.

Expected capability: ngày tạo là accepted_at theo Store timezone; local-day inclusive, không browser timezone; filters AND; creator lạ trả empty trong Store, không account enumeration. “Tôi” dùng A03; creator đã đọc dùng RunSummary, không yêu cầu Staff gọi Owner-only N12. Xin N9 query extensions, không creator API mới.

### R08 — Tìm lại PDF khi không còn export/job locator

**BE DESIGN_READY — proposed/design-ready, not runtime.** Nguồn: [Planning §17 EX01](<../BE_answer/13_10_afternoon/PROCUREMENT_API_CONTRACT_VI (1).md#planning-discovery>). Debt 010-BE-008B.

Flow: mở Run cũ → danh sách exports → resume J01 hoặc download N11. FE gửi Run và option/status/page filters; cần export_id/job_id/option/result digest/render version/status, artifact availability, allowed actions và locator/hash/size chỉ khi đủ evidence.

Expected capability: GET không tạo export/render; current export+result+finance rights; missing/corrupt artifact khác job failure; historical bytes không được thay bằng current costs/stock/labels. Retention không thời hạn đã chốt; không yêu cầu lại purge policy để dùng flow. N10 key mới chỉ khi user chủ động tạo export mới, không POST để dò locator. Xin EX01 runtime, không regenerate endpoint mới.

### R11 — Staff yêu cầu quyền / Owner quyết định

**BE DESIGN_READY / ACCEPTED DECISION — proposed/design-ready, not runtime.** Nguồn: [AUTH permission requests](../BE_answer/13_10_afternoon/AUTHORIZATION_CONTRACT_VI.md#permission-requests). Debt 010-BE-012A.

Flow: Staff chọn tác vụ thiếu, gửi lý do; xem/cancel own request; Owner review subset/approve/reject; FE refresh current grants. FE cần catalogue cho Staff, pending/history list, detail/version/allowed actions, requested/current/approved/actually_added permissions, decision/reason và mutation receipts.

Expected capability: submit không grant; approval union giữ unrelated grants; current version/catalogue/CAS và actor scope; satisfied/invalidated/terminal rõ; no-op không fake grant event. Đây là regular grants request, không approve-once bypass. PR01–PR04 đã được thiết kế; N13/N14 vẫn grants/audit authority. Không FE gọi approve rồi PUT grants lần hai để giả atomic outcome.

### R12 — In-app inbox/count/read state

**BE DESIGN_READY / ACCEPTED DECISION — proposed/design-ready, not runtime.** Nguồn: [Notification contract](../BE_answer/13_10_afternoon/NOTIFICATION_API_CONTRACT_VI.md#notification-v1). Debt 010-BE-012B.

Flow: actor đăng nhập thấy thông báo cộng tác theo Store accessible/account scope, unread badge, mark read/unread, mở đúng object. FE cần safe plain-text title/body, event/object locator, authorized relative link, read_at/version, count và consistent list/count snapshots; gửi read boolean với conditional mutation.

Expected capability: own recipient only, mất membership ẩn row/count/name; object phải reauthorize khi mở; read state không approve/cancel/xóa pending task. Badge không suy từ page length. Delivery pending không guarantee inbox row; failure không undo business decision. NF01–NF03 đã thiết kế; không yêu cầu push/SMS/delete/dismiss/task store. Mapping producer có thể nối khi capability tương ứng được mở, không mở lại phạm vi đã tạm dừng trong lần handoff này.

### R13 — Excel actual receipt trong pipeline Import

**BE DESIGN_READY / ACCEPTED DECISION — proposed/design-ready, not runtime.** Nguồn: [Import §16](../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md#excel-actual-receipt). Debt 010-BE-013.

Flow: upload bảng hàng đã thực nhận → map identity/nullable facts → Preview nguồn/canonical/receipt effect → Review/Commit → completion và refresh Kho. FE gửi file + declarations/bindings/review intent qua pipeline hiện có; cần M03 advertise schema khi supported và typed actual receipt/source identity/effects/committed refs.

Expected capability: source_record_id ổn định + namespace, exact quantity/unit, real observation timestamp, nullable supplier/cost/received_date, tracked expiry và late-receipt semantics N6. Excel↔form N6 dedupe một receipt/lot/movement; conflict không upsert; mixed groups atomic toàn batch. Không count/opening giả actual receipt, không N6 HTTP loop per row; planned purchases của Run không phải hàng thực nhận. Đây là schema/consumer extension, không import endpoint mới.

## Các capability FE còn đề xuất — cần BE/Product review

### R05 — Preview aggregates theo file/sheet

**FE PROPOSAL TO BE — chưa accepted design, chưa runtime.** Debt 010-BE-006B. Đề nghị BE chốt khả năng bổ sung hoặc Product thu gọn UI.

Flow: Preview/Review chọn file/sheet và biết tổng đầy đủ của scope trước khi bấm ghi. FE cần gửi pinned preview + file/sheet và các filters được hỗ trợ; nhận scope metadata + totals theo canonical group/classification/planned action/blocker/warning, không chỉ rows page.

Expected semantics cần chốt: raw rows hay logical actions; grouped recipe/multi-source actions được tính thế nào khi liên quan nhiều file; filter scope trước/sau group; totals không double count; totals/page cùng digest; current sensitive rights. Có thể bổ sung projection I04 thay vì API mới, BE chọn contract. §17 mapping counters đếm issues và source_effect page chưa đáp ứng totals này. Nếu không làm, FE giữ total toàn preview + nhãn số dòng đã tải, không giả per-file aggregates.

### R09 — Captured effective budget trên History

**FE PROPOSAL TO BE — chưa accepted design, chưa runtime.** Debt 010-BE-008C.

Flow: so sánh các Run ngay trên History mà không mở từng Run để thấy ngân sách thực dùng. FE cần read effective budget limit/currency tại acceptance, gắn đúng run_id; availability/null semantics nếu old Run không có evidence. Không cần write ngân sách qua History.

Expected capability: captured value bất biến, không Store cap hiện tại, không spent/reserved balance, quyền như N9; cùng list snapshot/cursor. Đề nghị BE review extension RunSummary, không N+1 đọc mọi C03 chỉ để giả list contract. Nếu cột này không thuộc nghiệm thu, Product chấp nhận “Xem trong Run”; C03 đã đáp ứng xem ngân sách từng Run.

## Hoàn thiện capability hiện có, không xin endpoint trùng

### R10 — Source proof trước reuse và recipe full-report conflict

**BE REPORTED RUNTIME GAP + ACCEPTED POLICY; source-grain representation cần review.** Debt 010-BE-011A/B. Nguồn: [Import §5.1](../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md#source-reuse), [§8.4](../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md#schema-correction).

Flow 1: nhập file có headers trùng profile cũ nhưng chưa chứng minh cùng nguồn. FE đã có M04 SourceContext gửi source_system_key/report_type/evidence và M01 đọc context/pin. Cần BE giữ source_context unresolved hoặc trả blocker/reason khi thiếu/ambiguous proof; unique signature không tự authorize reuse. Nếu source workflow đã established thì không bắt khai lại mỗi lần. Không thêm trust flag do FE tự đặt hoặc source endpoint thứ hai.

Flow 2: hai files chứa hai bản recipe đầy đủ cùng Product/version/header nhưng khác line sets. FE cần Preview trả conflict cùng source locations và hướng dẫn scope hợp lệ; không union thành recipe mới. Chỉ assemble các phần thuộc đúng một report grain/scope đã xác lập. **FE PROPOSAL TO BE** cho phần chưa chốt: có cách khai báo/đọc lại identity và completeness của report recipe, đủ phân biệt “hai bản đầy đủ” với “hai phần của cùng bản”. BE chọn representation trong context/provenance hiện có hoặc đề xuất extension; FE không tự đặt endpoint/DTO đã tồn tại.

Expected capability chung: cùng business key khác nội dung không last-file-wins, order-independent, blockers chặn toàn batch, current rights/pins/read-set giữ nguyên. Xin targeted evidence source absent/same-signature-different-source, reversed upload order, full-recipe conflicts, retire/preview/commit race. Supplier runtime không cần rewrite chỉ từ thiếu cross-file acceptance; bổ sung evidence đúng guard hiện có.

## Không yêu cầu BE bổ sung API cho các việc FE tự làm được

V01 ingredient picker, N16 scoped events, initial budget N4, N1–N3 Saved UX, canonical Preview drawer cơ bản đã có contract. Mock coherence, browser coverage/performance/lint và PDF UI eligible-only là FE work; N10 đã cho export candidate ineligible kèm cảnh báo. Không ghi những việc này thành API blocker mới.

Đề nghị trả lời theo R00–R13 với release/status, phần contract đã resolve, phần pending và evidence/điều kiện bàn giao. Với R05/R09 và phần report-grain của R10, cần BE/Product quyết định trước khi FE coi là accepted contract. Với các mục DESIGN_READY, cần runtime handoff; không phải xin phê duyệt lại policy đã chốt.
