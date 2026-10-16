# #005 — Import input và schema mapping theo response BE

Ngày tạo lập: 11/10/2026.

General Context: cập nhật FE theo [response BE #004](../../../contracts/history/v1/004_IMPORT_FLOW_BE_RESPONSE_VI.md) và [current V2 OpenAPI](../../../contracts/history/v2/generated/openapi.json). Mục tiêu là gỡ những assumption DTO cũ đang chặn input/mapping, bổ sung thao tác đúng contract và giữ ranh giới approval/review/commit. Không sửa contracts hoặc triển khai backend.

## Phạm vi đã triển khai

- M01 đọc flat files và top-level sheets, join bằng file_id; full profile details được yêu cầu tường minh. Tiến độ chỉ dùng ba counters toàn batch; không dựng histogram từ trang đã lọc.
- M02 dùng status/source_header/samples/resolution_origin/profile_ref, counts:Progress và meta.pagination. M01 được đọc trước/sau queue/options để phát hiện revision thay đổi; cursor sai hoặc page trùng bị loại, không trộn snapshots.
- M03 nhận schema nullable, catalogue và descriptors của máy chủ, gồm requiredness/nullability/unit/help/support/input_sources/shared scopes. Không hardcode field catalogue hoặc biến label thành ID.
- M04 có ghép cột và bảy typed resolutions: sheet_type (kể cả IGNORE với reason/ack), source_context, identity_binding, declared_conversion, ignored_optional_field, new_entity_proposal, shared_value. Giá trị decimal giữ text; false/0/null tách biệt. Shared source switch yêu cầu đúng column index và acknowledgment.
- Owner được xem full proposed spec và exact approved baseline, rồi approve_activate/reject/retire bằng lifecycle CAS. Thiếu full spec/missing_fields hoặc baseline không khớp thì không duyệt. Staff không có quyết định Owner; IGNORE whole-sheet không được biến thành bypass approval cho ignored field/profile.
- Preview sử dụng exact retained pin, đọc đủ pages và hiển thị nested/line provenance, references, dependencies cùng configurations theo pin. Preview bị blocked/stale không được review/commit. Cấu hình đã tải không được trình bày là toàn bộ Store.
- `confirm_review` là phase200 riêng với lý do và xác nhận đã đọc đủ snapshot. Sau đó đọc lại I04/new import revision/confirmation_usable trước commit. Sales resolutions và supplier_changes dùng exact row IDs và reason, không quantity override hoặc nested confirmations.
- Commit202 chỉ là acceptance; J01 completed + retained I06 đúng commit/preview/effective-plan linkage mới là Result. Unknown/null impacts không thành0. Rights lấy từ current T02 và server projections, không từ role/grants tự tạo.
- `/imports?import_id=...` giữ locator duy nhất; refresh/Lịch sử đọc authorized I04/J01/M01/preview/I06 mà không gửi reopen/create/commit. Never-uploaded draft cần giữ locator; không giả vờ H02 discover mọi draft. Local files và exact retry intents không được persist qua refresh.
- Input boundary nhận Notice đúng schema không đòi details; timestamps chấp nhận aware offsets. Batch quota, partial admission và sealed-source behavior được giữ nguyên.

## An toàn mutation

Mapping CAS, lifecycle CAS và import CAS không dùng thay nhau. Mỗi intent dùng UUID key riêng; mất phản hồi giữ nguyên body/key/original CAS để người dùng đối chiếu/retry. Known receipt rồi lỗi GET không biến thành retry mutation. Không tự resubmit với revision mới, không tự phê duyệt và không coi checkbox cục bộ thay server review.

Current permissions, source-set/pin, all-row traversal và exact confirmation sets được kiểm lại trước thao tác. Backend vẫn là authority cho authorization, cross-field/domain validation, worker rechecks và transaction atomicity. Structural OpenAPI checks không thay thế các kiểm tra đó.

## Kiểm chứng và giới hạn

- `npm run check:import-wire`: kiểm tra frozen schemas/types khớp current OpenAPI và dependency closure; không sửa file.
- `npm run test:import`: controlled boundary/workflow và SSR rendering; không gửi dữ liệu thật lên BE. Bao phủ DTO hiện hành, typed mutations, CAS/replay/lost response, Owner/current-right fences, paging, resume và confirmation trước commit.
- `npm run test:auth`: regression Auth/session/Store/shared HTTP.
- `npm run build` và `npm run lint`: typecheck, production bundling, static lint.

Kết quả kiểm tra bàn giao: Import **93/93** và Auth **26/26** tests pass; build/typecheck, lint và `git diff --check` pass. Drift gate khớp **123 schemas / 119 types**. Tests synthetic/SSR không phải browser interaction hoặc live database evidence. Production bundle hiện có cảnh báo chunk JavaScript **597,38 kB** (>500 kB); cần code-splitting ở một lượt tối ưu riêng, không coi là lỗi build.

Backend local `http://localhost:18001/health` chưa kết nối được trong lần kiểm tra này (HTTP000/connection refused). `.env.local`, `.env.example` và default API URL đã đồng bộ18001 theo BE response; `.env.local` vẫn ignored, không thêm secret. Phải restart Vite sau đổi env và dùng localhost cho cả FE/BE theo runbook. Không reset/reseed DB, chạy worker hoặc lấy credentials tự động.

Chưa xác nhận native browser whole-chain, M03 runtime HTTP availability/uniqueness, current deployment snapshot hoặc canonical writes. Cần backend chạy, phiên đăng nhập hợp lệ và worker Import sẵn sàng để kiểm chứng upload → analysis → mapping → Owner approval → preview → confirm_review → commit → durable receipt, gồm cả refresh/re-entry.

[003](../003/003-import-flow-integration.md) và [004](../004/004-import-flow-be-clarification.md) được giữ làm lịch sử; những blocker schema/environment cũ phải đọc cùng response BE và báo cáo này. Không commit/push trong lượt triển khai này.
