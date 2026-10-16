# 008 — ShelfCash Backend / Product TechDebt

- **ID:** #008 TechDebt · **Ngày tạo:** 12/10/2026.
- **General Context:** dependency Backend/Product còn mở khi thực thi MP-M00–MP-M15; không phải danh sách TODO FE.
- **Authority:** [OpenAPI V2](../../../contracts/history/v2/generated/openapi.json), OpenAPI 3.1.0 / shelfcash-backend 0.1.0; [AUTH](../../../contracts/history/v2/docs/AUTHORIZATION_CONTRACT_VI.md), [Import](../../../contracts/history/v2/docs/IMPORT_MAPPING_API_CONTRACT_VI.md), [Inventory](../../../contracts/history/v2/docs/INVENTORY_API_CONTRACT_VI.md), [Catalog](../../../contracts/history/v2/docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), [Procurement](../../../contracts/history/v2/docs/PROCUREMENT_API_CONTRACT_VI.md), [audit #008](008-magicpath-e2e-milestones.md), [execution receipt](008_Implementation_Receipt.md).
- **State:** tất cả entries dưới đây OPEN. Không entry nào tuyên bố API đã deploy/live. Các proposals không được API mode gọi.
- **Đã giải quyết phía FE, không ghi thành BE debt:** wizard Preview3 → Review/Commit4 → Complete5; N7/N18/N19/N14/N16-events; N1–N3; N6/N8; N9/N10/N11; N20–N22 đều có contract và đã nối các entry FE. Giới hạn fidelity, mock propagation và coverage còn lại ghi trong receipt.

## TD-BE-001 — Đăng ký công khai / yêu cầu khôi phục mật khẩu

**ID:** `TD-BE-001`

**Related milestone:** MP-M01 / MP-M02

**Flow:** Đăng ký công khai / yêu cầu khôi phục mật khẩu.

**Current evidence:** N7 POST /api/v1/auth/credentials/complete có token và password 12–128 Unicode; OpenAPI không có public registration/reset-request. AUTH mô tả credential provisioning qua kênh đã xác minh. FE có login hiện hữu và route /credentials/complete mới. D02/D03 có đăng ký/recovery.

**Problem:** Hoàn tất credential từ token không cung cấp account provisioning, email verification hoặc khởi tạo reset request.

**FE impact:** Không thể tự đăng ký tài khoản hay tự gửi email reset.

**Temporary FE treatment:** Signup disabled; recovery hướng dẫn liên hệ hỗ trợ; chỉ N7 thật được nối.

**Backend clarification required:** Ai cấp token, link giao tới route nào, TTL và account enumeration policy? Có đưa public signup/reset-request vào release này?

**Proposed contract/API:** Ưu tiên quyết định phạm vi và handoff token/link N7 hiện hành. Chưa đề xuất endpoint mới khi account lifecycle chưa được Product duyệt.

**Acceptance condition:** Product chốt scope; BE cung cấp provisioning/link example và các trạng thái invalid/expired/consumed, hoặc contract public flow đầy đủ.

**Priority:** `P1`

## TD-BE-002 — Người nhận từ chối lời mời

**ID:** `TD-BE-002`

**Related milestone:** MP-M02

**Flow:** Người nhận từ chối lời mời.

**Current evidence:** N19 POST /api/v1/staff-invitations/{invitation_id}/accept nhận accept:boolean ở schema; AUTH yêu cầu accept:true. Không có decline lifecycle/path. FE mới chỉ gửi true. D03 có trạng thái từ chối.

**Problem:** Không có semantics persist/audit/replay cho decline.

**FE impact:** Không thể hiển thị “đã từ chối” như kết quả server.

**Temporary FE treatment:** Không có nút decline ghi dữ liệu; người dùng có thể rời trang.

**Backend clarification required:** Decline có kết thúc invitation, ghi audit, ngăn reissue hay chỉ là đóng màn hình?

**Proposed contract/API:** Đề nghị làm rõ N19/AUTH hoặc bổ sung lifecycle action sau quyết định Product; không dùng accept:false hiện nay. PROPOSED — NOT IMPLEMENTED BY BACKEND: contract delta, chưa đề xuất path khi lifecycle chưa chốt.

**Acceptance condition:** Schema và AUTH thống nhất, có payload/status/error/replay cases cho quyết định đã chọn.

**Priority:** `P1`

## TD-BE-003 — Hoạt động quản trị hợp nhất

**ID:** `TD-BE-003`

**Related milestone:** MP-M02 / MP-M11

**Flow:** Hoạt động quản trị hợp nhất.

**Current evidence:** N14 GET /stores/{store_id}/permission-events và N16 GET /stores/{store_id}/staff-invitations?view=events có feed/paging riêng. AUTH có actor/reason/grants evidence. FE mới có hai danh sách độc lập /store/activity. D04 có feed/filter tổng hợp.

**Problem:** Hai cursor độc lập không chứng minh một timeline toàn Store có thứ tự/snapshot chung; không phải thiếu N14/N16.

**FE impact:** Không thể merge một page mỗi feed rồi gọi là “tất cả hoạt động”.

**Temporary FE treatment:** Hai tab phân trang riêng, chỉ hiển thị fields server trả.

**Backend clarification required:** Có yêu cầu unified ordering/snapshot/filter actor/type trong release không?

**Proposed contract/API:** Ưu tiên Product chấp thuận hai feed. Nếu cần hợp nhất, đề nghị BE mở rộng projection/cursor hiện có; chưa có speculative endpoint được FE gọi.

**Acceptance condition:** Chốt UX hai feed hoặc có unified feed contract + samples pagination/snapshot stability.

**Priority:** `P2`

## TD-BE-004 — Queue Owner duyệt mapping và active/retired profiles toàn Store

**ID:** `TD-BE-004`

**Related milestone:** MP-M04

**Flow:** Queue Owner duyệt mapping và active/retired profiles toàn Store.

**Current evidence:** M01/M02/M03/M04 scoped import; N5 POST /stores/{store_id}/mapping-profiles/{profile_id}/decisions có CAS/key. Import docs mô tả profile decisions. FE giữ flow theo lô. D05 MappingApprovalFlow có queue nhiều import và quản lý profile.

**Problem:** Không có Store-wide paginated queue/profile discovery; submit/bulk/per-column vs immutable-profile semantics chưa chốt.

**FE impact:** Owner chưa thể khám phá toàn bộ proposal ngoài import hiện tại hoặc duyệt bulk an toàn.

**Temporary FE treatment:** Giữ xử lý theo lô; không dùng H02 làm global queue và không tạo submit/bulk endpoint.

**Backend clarification required:** M04 đã tạo proposal có đồng nghĩa submit? Queue filter/status/permissions thế nào; owner edit có tạo revision mới?

**Proposed contract/API:** PROPOSED — NOT IMPLEMENTED BY BACKEND: GET /api/v1/stores/{store_id}/mapping-profiles, Owner authority; query state=pending|active|retired, limit,cursor; response items {profile_id,lifecycle_version,state,source_import_id,proposal_reference,submitted_at}, meta.pagination và snapshot_id. GET không idempotency/CAS; N5 hiện hữu tiếp tục ghi với If-Match/key. Errors 401/403/404/422, invalid/stale cursor theo error catalogue BE. Không thêm bulk writer trước khi atomicity chốt.

**Acceptance condition:** BE chốt submit semantics; list contract, immutable proposal detail, permission/cursor samples và concurrent decision cases.

**Priority:** `P0 BLOCKER`

## TD-BE-005 — Mapping counters theo file/sheet/filter/auto

**ID:** `TD-BE-005`

**Related milestone:** MP-M03

**Flow:** Mapping counters theo file/sheet/filter/auto.

**Current evidence:** M01 hiện có total/completed/unresolved toàn import. Import contract không công bố đủ auto/per-file/per-sheet/filter projections. FE giữ counters đúng scope hiện có. D05 cần bốn filter và các tổng chi tiết.

**Problem:** completed không chứng minh auto-mapped; page count không chứng minh tổng scope.

**FE impact:** Không thể gắn đủ badge tổng theo design như facts authoritative.

**Temporary FE treatment:** Hiển thị số hiện hữu đúng nhãn; không suy tổng từ một page.

**Backend clarification required:** Product chấp nhận giản lược nhãn hay cần BE projections? Confidence/origin nào xác định auto?

**Proposed contract/API:** Ưu tiên mở rộng M01 bằng counts có scope/version/filter definitions; không cần endpoint mới.

**Acceptance condition:** Counts có định nghĩa, samples nhiều file/sheet/page và pin cùng mapping revision.

**Priority:** `P2`

## TD-BE-006 — Preview aggregates / provenance và schema “Nhập hàng”

**ID:** `TD-BE-006`

**Related milestone:** MP-M05

**Flow:** Preview aggregates / provenance và schema “Nhập hàng”.

**Current evidence:** I04/I05 có preview rows/source_location/digests, I06 receipt và H01/H02 history. Import docs có schema descriptors, không mặc định mọi design category đều là upload schema hỗ trợ. FE giữ rows/review/commit và đổi thứ tự wizard. D05/D07 cần group totals/source-original-normalized drawer.

**Problem:** Không có bằng chứng đủ tất cả per-file/category aggregates và original/normalized projection như design; không thể phục dựng provenance bị thiếu.

**FE impact:** Một số tabs/tổng/drawer chưa thể đạt fidelity bằng facts hiện có; receipt upload không tự thành N6.

**Temporary FE treatment:** Render dữ liệu contract đã có, không gán unknown=0 hay quảng cáo schema ngoài descriptor. FE row drawer dùng các fields sẵn có vẫn là FE work, không phải BE blocker.

**Backend clarification required:** Projection nào đã canonical; original values có sensitivity rule gì; schema nhận hàng có được publish?

**Proposed contract/API:** Ưu tiên bổ sung preview projection/schema descriptor hiện hữu nếu Product giữ yêu cầu; field definitions, pinned aggregates và permission rules. Không đề xuất endpoint song song I04.

**Acceptance condition:** BE cung cấp samples đủ categories/source fields và aggregates cùng preview_id/digest, hoặc Product thu gọn design.

**Priority:** `P1`

## TD-BE-007 — Receipt supplier/location và canonical ingredient picker

**ID:** `TD-BE-007`

**Related milestone:** MP-M06 / MP-M07

**Flow:** Receipt supplier/location và canonical ingredient picker.

**Current evidence:** N6 writer có supplier_id nullable, receipt_identity/reason/observed_at/version/cost. N20–22 hỗ trợ recipe. Inventory/Catalog docs không công bố supplier search độc lập hay receipt warehouse writer. FE dùng ingredient trên trang V01 và recipe hiện tại P02; supplier/cost explicit null. D08 có kho/nhà cung cấp; D09 cần picker rộng.

**Problem:** Location không có request field; nguồn tìm supplier/canonical picker toàn catalogue và chính sách null/cost cần chốt. V01/P02 hiện hữu vẫn dùng được cho phạm vi hạn chế.

**FE impact:** Không thể chọn warehouse hoặc gửi supplier display name làm ID. Picker nguyên liệu chưa đầy đủ là hạn chế FE một phần, không phải thiếu N6/N21.

**Temporary FE treatment:** Không có location giả; supplier/unit_cost null hiển thị rõ; picker chỉ entities đã đọc được và có quyền.

**Backend clarification required:** Null supplier/cost có hợp lệ nghiệp vụ release? Có catalogue endpoint khác trong deployment hay mở rộng nguồn hiện hữu? Location có thuộc scope?

**Proposed contract/API:** Ưu tiên hoàn thiện nguồn V01/P02 có paging hoặc catalog projection hiện hữu; location chỉ đề xuất schema delta sau Product quyết định. Không tạo supplier endpoint suy đoán.

**Acceptance condition:** BE/Product chốt null/location policy và canonical discovery contract/samples; FE hoàn thiện picker theo nguồn đã chốt.

**Priority:** `P1`

## TD-BE-008 — History creator/date-created filters và tìm lại PDF khi mất locator

**ID:** `TD-BE-008`

**Related milestone:** MP-M09

**Flow:** History creator/date-created filters và tìm lại PDF khi mất locator.

**Current evidence:** N9 hỗ trợ status/forecast_start_from/to/sort/cursor; N10 tạo export, J01 theo job, N11 binary. Procurement docs không có export-list. FE mới dùng đúng filters, lưu export_id/export_job_id trong URL. D10 có creator/date filters, D11 existing PDF recovery.

**Problem:** Forecast dates khác ngày tạo; không thể tìm lại export khi mất cả export/job locators qua contract hiện tại.

**FE impact:** Không thể lọc toàn history theo người tạo/ngày tạo hoặc tự discovery PDF cũ.

**Temporary FE treatment:** Chỉ supported filters; resume từ URL; không POST export để “tìm” file cũ.

**Backend clarification required:** Có giữ creator/date-created UX? Retention/expiry của jobs/PDF, export list và download evidence sau job retention thế nào?

**Proposed contract/API:** PROPOSED — NOT IMPLEMENTED BY BACKEND: mở rộng N9 với created_by/accepted_from/accepted_to đã định nghĩa timezone; GET /api/v1/procurement-plans/{plan_id}/exports, cùng quyền planning.export + result/cost/budget reads, limit/cursor. Response items {export_id,run_id,option_id,job_id,status,created_at,result_digest,render_version,availability}, meta.pagination/snapshot. GET không mutation key/CAS. Errors 401/403/404/422 và expired artifact theo catalogue BE. Không public URL; N11 tiếp tục kiểm quyền hiện hành.

**Acceptance condition:** BE chốt filter semantics và discovery/retention contract; có tests cursor/permissions/expired PDF.

**Priority:** `P1`

## TD-BE-009 — Today pending decisions, outlook 7 ngày, arrivals/signals

**ID:** `TD-BE-009`

**Related milestone:** MP-M10

**Flow:** Today pending decisions, outlook 7 ngày, arrivals/signals.

**Current evidence:** V01 cung cấp attention/summary, R01 readiness, N9/C03 retained planning. Không có Today aggregate projection cho toàn bộ D12. FE Today đọc V01 dùng shared stock mới; AI disabled. D12 cần pending decisions/signals/7-day outlook.

**Problem:** Không có nghĩa authoritative của pending decision hay arrivals/outlook toàn Store từ các sources hiện có. Purchase lines trong kế hoạch không phải đơn hàng/arrival thực tế.

**FE impact:** Không thể dựng số quyết định, arrivals hay forecast series như operational facts.

**Temporary FE treatment:** Giữ attention/summary/links có nguồn; không vẽ chuỗi giả hoặc tự lấy demo numbers.

**Backend clarification required:** Pending là approval nào? Arrivals từ PO hay actual logistics? Snapshot/date/timezone/permissions và completeness thế nào?

**Proposed contract/API:** Ưu tiên aggregate projection từ BE sau Product định nghĩa; chưa đề xuất endpoint khi facts chưa có owner/lifecycle. C03 daily rows chỉ dùng đúng retained scope, không gọi là Store outlook.

**Acceptance condition:** Product định nghĩa facts; BE đưa scoped projection/schema/evidence/completeness/null semantics và permission tests.

**Priority:** `P1`

## TD-BE-010 — Store profile/general settings writers và initial budget absence

**ID:** `TD-BE-010`

**Related milestone:** MP-M11

**Flow:** Store profile/general settings writers và initial budget absence.

**Current evidence:** T02 đọc profile/context; N4 có create If-None-Match:* và replace If-Match; C01 budget_ceiling nullable. Procurement docs và #007 đã nêu cần phân biệt absent/unknown/forbidden. N1–N3 có thật và nay được nối FE. D04 chrome/settings không đủ flow save profile.

**Problem:** Không có profile/hours/general-settings writer; C01 null không đủ chứng minh được initial create. Không phải thiếu saved-requirements API.

**FE impact:** Không lưu profile/settings hoặc tự tạo cap từ giá trị null không rõ authority.

**Temporary FE treatment:** Profile readonly; giữ replacement cap đã có version; initial create không bật. Saved requirements dùng N1–N3 thật.

**Backend clarification required:** Trạng thái absence của cap được xác nhận ở field nào? Phạm vi fields nào được Product cho sửa?

**Proposed contract/API:** Ưu tiên mở rộng C01 với availability=known|absent|forbidden|unknown và current version/creation authority; giữ N4 existing. Profile writer chỉ thiết kế sau Product chốt fields/validation/CAS/permissions; không gửi T02 PUT giả.

**Acceptance condition:** BE chốt absence projection và initial create samples 201/conflict/replay; Product+BE cung cấp settings writer nếu thuộc scope.

**Priority:** `P1`

## TD-BE-011 — Contextual AI hỏi đáp có evidence

**ID:** `TD-BE-011`

**Related milestone:** MP-M12

**Flow:** Contextual AI hỏi đáp có evidence.

**Current evidence:** Không có conversation/contextual AI path trong OpenAPI. C08 chỉ structured engine explanation theo Procurement docs. FE giữ các entry disabled/unavailable, không thêm chatbot transport. D08/D09/D11/D12 có AI panel.

**Problem:** Chưa có context/version/evidence schema, question lifecycle/provider failure/quota/permission contract.

**FE impact:** Không gửi câu hỏi, stream answer hay validate evidence scope.

**Temporary FE treatment:** BLOCKED_CONTRACT; không dùng C08 làm chatbot, không đưa mock answer vào API mode.

**Backend clarification required:** Conversation có persisted không; context IDs/pins; evidence allowlist/current grants; cancellation/provider errors/quota/retention?

**Proposed contract/API:** Chưa đề xuất path: cần Product/BE chốt request/context/evidence/lifecycle trước. Bất kỳ API thiết kế sau đều là PROPOSED — NOT IMPLEMENTED BY BACKEND tới khi được handoff.

**Acceptance condition:** Contract chính thức, redacted samples, permission/context-change/error cases và approved UI states.

**Priority:** `P1`

## TD-BE-012 — What-if và advanced setup không có request semantics

**ID:** `TD-BE-012`

**Related milestone:** MP-M13 / MP-M08

**Flow:** What-if và advanced setup không có request semantics.

**Current evidence:** C02 PlanningRequest chỉ nhận default/custom/saved theo schema; capability scenario_based_planning không cấp một scenario lifecycle. Không có What-if paths. Procurement docs không cho gửi unsupported Open PO/priority/model fields. FE không thêm scenario writer. D11 có Scenarios.

**Problem:** Chưa có basis run/snapshot, hypothetical inputs/bounds, async lifecycle hay result comparison contract.

**FE impact:** Không thể chạy scenario hay tự solver/derive giả KPI.

**Temporary FE treatment:** BLOCKED_CONTRACT; advanced unsupported controls disabled; C02 không nhận field lạ.

**Backend clarification required:** Input allowlist/units, stale basis, permissions, deterministic engine, scenario_id/job/result retention và baseline immutability?

**Proposed contract/API:** Cần contract riêng hoặc extension rõ trên Planning sau BE quyết định; chưa đề xuất path/lifecycle suy đoán.

**Acceptance condition:** Explicit scenario schema + lifecycle/sample/error/replay cases; baseline immutable và proof semantics.

**Priority:** `P1`

## TD-BE-013 — Retained plan/option → Draft PO

**ID:** `TD-BE-013`

**Related milestone:** MP-M14

**Flow:** Retained plan/option → Draft PO.

**Current evidence:** OpenAPI không có public PO lifecycle. N10 PDF và N6 receipt là các entity khác. Procurement docs chưa công bố create/read/update PO. D11 chỉ có entry Draft PO, chưa đủ downstream workspace. FE giữ entry không khả dụng.

**Problem:** Thiếu design và authority cho supplier/items/cost snapshot, draft/lifecycle/provenance/duplicate handling.

**FE impact:** Không tạo PO, không gọi PDF/receipt thay PO và không tăng physical stock từ planning.

**Temporary FE treatment:** BLOCKED_DESIGN_AND_CONTRACT; set aside downstream.

**Backend clarification required:** Release có submit/approve/cancel/receive không? Supplier terms nào pinned, monetary rounding/tax policy nào, authority và duplicate semantics?

**Proposed contract/API:** Minimal boundary đề nghị: create draft từ canonical retained run_id + eligible option_id + result_digest; BE materialize supplier/lines/costs; read draft riêng; key chống duplicate; version/CAS cho sửa/lifecycle. Đây là PROPOSED — NOT IMPLEMENTED BY BACKEND, chưa chốt method/path/schema khi Product chưa duyệt scope. Receipt phải vẫn qua N6 với explicit linkage nếu contract cho phép.

**Acceptance condition:** Approved downstream design + public PO contracts/samples/permissions/replay/conflict; chứng minh tạo draft không cập nhật stock.

**Priority:** `P1`

