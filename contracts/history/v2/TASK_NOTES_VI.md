# Task audit/documentation/packaging — 11/10/2026

CURRENT FACT: scope được người dùng giao là bổ sung contract handoff cho FE đang giữ ZIP10/10; không sửa source BE/FE, DB, policy, không full suite/DB/provider/commit/stage/push/deploy.

Trước khi viết: quan sát git status với nhiều WIP S4.4–S4.11; giữ nguyên toàn bộ. Đã xác minh hai ZIP đúng SHA256; không dùng ZIP09/10. Authority theo AGENTS: CURRENT_STATE → DECISIONS/ADRs liên quan → ARCHITECTURE → API_CONTRACT → DOMAIN_MODEL → DATABASE_SCHEMA → ROADMAP → code/tests. Sáu contract VI, changelog, S411 task notes/runbook/checklist là nguồn đối chiếu; ADR-007/013/022 và authorization contract giữ nguyên intent hiện hành. Các absence statements cũ không phải runtime evidence.

Frozen contract: đối chiếu baseline design riêng với baseline source/OpenAPI; runtime hiện hành được kiểm bằng router/DTO/use case và OpenAPI sinh offline từ source. Phân biệt operation definition với reachable component/schema. Không thay accepted API/policy hay ADR.

Acceptance của task: exact ZIP hashes; bảng từng operation + diff machine-readable; examples current DTO và JSON Schema hợp lệ; paths/duplicates/CRC/manifest/checksums/refs/internal links; snapshot sáu contract; sample public FE config. Chỉ chạy kiểm tra offline liên quan và API OpenAPI tests nếu không cần DB. Kết quả runtime/browser S411 cũ phải gắn evidence đã ghi, không gọi là mới chạy.

Rollback: chỉ bỏ thư mục tài liệu mới và ZIP bổ sung mới nếu cần; baseline/v1/v2 ZIP và WIP giữ nguyên. BE/FE ảnh hưởng là hướng dẫn type/adapters/workflow; ML/Data/engine/demo/policy không thay đổi. Không khởi động app lifespan/worker và không kết nối DB/provider.

Giới hạn sau v2: so sánh byte/hash các payload v2 còn có trong checkout và OpenAPI hiện hành; kiểm source mtime như tín hiệu phụ. v2 không có manifest toàn bộ source BE nên không thể chứng minh tuyệt đối source byte-identical tại thời điểm v2 chỉ bằng payload/schema/mtime.

CURRENT FACT sau kiểm tra: offline wire gate9 PASS/1 stale Auth inventory FAIL (không sửa test).38 current DTO examples PASS; loại hai S410 History traces thiếu warnings. Kiểm links lần đầu phát hiện verification report trỏ packaging_checks chưa tạo; sửa builder audit mới để cung cấp report target trước link gate, không sửa source product. Rà soát baseline AnalyzeRequest.unique xác nhận duplicate-ID checks đã có, delta giữ semantics I03, chỉ thêm OpenAPI ETag declaration. Chỉ CURRENT_STATE/ROADMAP thêm documentation audit checkpoint; toàn WIP/source/policy/archives trước task kiểm hash giữ nguyên. Không runner bị dừng hoặc validation failure nào được tính PASS.
