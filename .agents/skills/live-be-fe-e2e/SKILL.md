---
name: live-be-fe-e2e
description: Plan, execute, debug and assess ShelfCash FE E2E integration against a live backend. Use for live BE/FE testing, Owner/Staff integration, design coverage and live acceptance reviews.
---

# ShelfCash live BE–FE E2E

Áp dụng khi lập kế hoạch, chạy, debug hoặc đánh giá E2E với BE live trong repo này. Thực hiện đúng phạm vi user giao; viết kế hoạch/quy tắc không tự cho phép chạy mutation live. Tôn trọng authorization đã có, không hỏi lại cho thao tác đã được giao.

Tuân theo [UI MagicPath authority](../../rules/ui-magicpath-authority.md): có thể chuẩn bị API/data/service trước UI, nhưng không tự thiết kế UI để nối API hoặc hoàn tất test. UI thiếu thiết kế phải chờ MagicPath và giữ gap; data-layer PASS không thay UI/E2E acceptance.

## Quy tắc ứng xử

1. Kiểm chứng thao tác UI → request/response thực → authoritative readback. Toast, HTTP 200/202, screenshot hoặc health check riêng lẻ không chứng minh thành công nghiệp vụ.
2. Tách browser context Owner/Staff, cookie/storage và quyền hiện hành theo Store. Không mượn session/quyền Owner để làm case Staff qua. Kiểm tra cả UI guard và BE authorization.
3. Ghi FE build/dirty fingerprint, BE deployment evidence, contract hash từng slice, design revision, môi trường và dữ liệu trước khi chạy. UNKNOWN phải giữ UNKNOWN; không suy SHA deployment từ handoff.
4. Xác minh data source/API base URL, session/CSRF/Origin và worker cho operation cần job. Phân biệt live, live-with-fault-injection, controlled, mock và API-only trong từng kết quả. Runner Playwright hiện có không mặc nhiên là live runner.
5. Chốt baseline mọi design surface/state/control/transition trong scope trước khi tính coverage. Audit latest MagicPath source và preview, cả nested conditions, errors/recovery/permissions, secondary surfaces, aliases và shared scope. Mỗi nghĩa vụ có case hoặc disposition có căn cứ; không bỏ nhánh khó khỏi mẫu số.
6. Không hard-code số lượng inventory làm bằng chứng exhaustive. Reconcile khi design/build/contract thay đổi. State ngoài inventory hoặc edge chưa audit phải ghi PENDING; DEV playground không thay full design inventory.
7. Giữ đúng nghiệp vụ/API; không tự chọn mapping/entity/IGNORE, bỏ sheet/cột/dòng, suy zero/null/false từ unknown hoặc đoán semantics nguồn. Chưa rõ nghĩa thì chặn case phụ thuộc và tiếp tục phần độc lập.
8. Dùng dữ liệu/Store/recipient test thuộc phạm vi được giao, oracle độc lập và namespace theo run. Hai tài khoản không tự cho phép reset DB, migration, xóa ngoài test, đổi quyền người thật hoặc gửi thư ngoài scope. Cleanup phải được hỗ trợ, không làm mất evidence.
9. Với mutation lost ACK, phân biệt chưa gửi, rejected chắc chắn, receipt đã biết và outcome unknown. Giữ exact intent/key/body/CAS/pins; chỉ readback hoặc same-intent replay theo operation và khả năng runtime. Không đổi key để thử lại; state chưa đổi không chứng minh chưa ghi; cancel phía FE không chứng minh BE cancel.
10. Khi đã có receipt mà readback lỗi, không tự tạo mutation mới. Khi không giữ được exact intent hoặc chưa đủ authority kết luận, giữ unknown/locked và báo limitation; không đoán sau reload/logout/Store switch.
11. Khi gặp lỗi, giữ trace/network/readback, phân loại root cause và defect/blocker. Dừng writer phụ thuộc khi có sai dữ liệu, ghi trùng hoặc vi phạm isolation; tiếp tục phần độc lập. Sửa trên build mới phải có verification mới, không gộp evidence khác build.
12. Che password/cookie/CSRF/mail token/PII trong evidence. Không commit raw HAR/storageState hoặc credentials. Ghi references/alias đủ để truy vết.
13. Không tự dựng final production UI. Maintain [FOUND_MISSING_UI_V1.md](../../../docs/status/FOUND_MISSING_UI_V1.md), deduplicate gap; giữ FOUND_MISSING_UI.md làm historical evidence không rewrite; fallback/manual handoff/API availability/test PASS không tự đóng FM. Giữ scope underconstruction theo quyết định hiện hành.
14. Báo cáo từng case PASS/FAIL/BLOCKED/NOT_RUN/DEFERRED_SCOPE/NOT_APPLICABLE có lý do/evidence. Không giấu lỗi sản phẩm dưới blocker, không coi API-only hoặc mock là live UI PASS. Tách accounting, execution và acceptance; báo riêng node/edge/API/permission/data coverage.
15. Chỉ tuyên bố full in-scope live acceptance khi mọi nghĩa vụ in-scope đã enumerate và live PASS, disposition hợp lệ đã ghi rõ, không còn FAIL/BLOCKED/NOT_RUN hoặc gap/fallback ảnh hưởng scope. Không dùng điểm trung bình để bù lỗi quyền/atomicity/data integrity; không hứa đã thử mọi dữ liệu vô hạn hoặc mọi bug.

## Invariants ShelfCash phải giữ khi đánh giá

- Mapping proposal ≠ reusable profile approval ≠ persisted Review confirmation ≠ canonical commit. Staff không quyết định reusable profile; Owner được duyệt đề xuất của mình; approval không cấp quyền commit.
- Full spec hợp lệ, không còn missing_fields có thể approve các RULE đủ điều kiện chung; không bắt resolve riêng mọi RULE. `needs_confirmation` có target là proposal cần review; `profile_proposals=[]` không làm mất suggestions; available `source_only` được hỗ trợ.
- Preview/Review/commit giữ đúng source/mapping/read-set/evidence pins; stale, current permissions, domain decisions và exact intent phải được kiểm tra lại. Atomic commit không ghi dở lô; replay không ghi trùng.
- Pure inserts/NO_OP có thể thiếu/null commit reason theo contract; corrections/amendments cần justification. FE fallback luôn bắt reason không đổi policy BE.
- Purchase history không tăng stock, usage history không tự trừ stock; opening/count/actual receipt là các semantics khác nhau. Không đoán recipe yield/pack/base-unit/timezone hoặc biến calendar/promotion thành forecast feature.
- Completion là receipt bất biến; Readiness là đánh giá hiện hành độc lập. Planning R01 cần đủ `planning.context.read`, `budget.read`, `procurement.cost.read`; R01 fail không rollback hoặc cho phép commit lại.
- Không giả có API delete/replace accepted file, unseal, lưu domain decisions Preview riêng hoặc generic negative mutation-outcome proof. Kiểm tra contract hiện hành nếu capability thay đổi.

## Cách thực hiện và tài liệu chi tiết

Trước execution, đọc [017 live E2E protocol](../../../docs/testing/017_Live_BE_FE_E2E_Protocol.md): gate môi trường/dữ liệu, từng đoạn flow và bộ biến thể ngang, error register, mẫu evidence, severity và exit criteria. Áp dụng các mục liên quan scope; không mở rộng assignment để chạy toàn app khi user chỉ giao một feature.

Đọc trực tiếp các nguồn cần thiết:

- [Design inventory](../../../docs/testing/LIVE_E2E_DESIGN_INVENTORY.json): baseline khởi tạo, chưa phải live evidence. Bổ sung nested controls/edges và non-Import states trước khi claim full coverage.
- [Workflow ground truth](../../../contracts/WORKFLOW.md): semantics và authority; lấy exact DTO/error/permission từ operation snapshot và deployment đang test.
- [Owner/Staff user guide](../../../docs/guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md): route/nút/API/error thực; đối chiếu runtime khi chạy.
- [Missing UI register](../../../docs/FOUND_MISSING_UI.md) và [Underconstruction scope](../../../docs/status/Underconstruction_by_BE.md): giữ blocked/deferred có truy vết, không tự mở feature.

Ví dụ: khi Staff submit rồi Owner review, mở hai context độc lập, chứng minh current rights, submission/profile pins, thao tác UI và readback ở cả hai phía. Nếu FE còn manual handoff, chỉ nghiệm thu manual flow; nhánh MQ/notification giữ blocker, không lấy direct API success thay UI evidence.
