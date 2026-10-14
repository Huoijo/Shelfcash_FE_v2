# 013 — Import content parity / Debug isolation

14/10/2026. Bổ sung cho `012_Import_State_Mapping.md`; không thay đổi business/API authority.

## Nguồn thiết kế

MagicPath project `458079658328604672`, inspect read-only lại trong phiên này:

- OWNER `460747146686242816`, revision `460803015184642048`: 46 states.
- STAFF `460747115572916224`, revision `460804081875824640`: 48 states.

Revision vẫn trùng lần inspect 012. Đối chiếu toàn bộ source/catalog của hai component và CSS. Mapping từng state/contract nằm ở tài liệu 012; không dùng component Import lịch sử. Không mở phiên sửa canvas.

Source hiện hành có `OWNER FLOW` / `STAFF FLOW`, subtitle toàn trang, step eyebrow trong `SectionTitle` và sáu bước. Giữ các thành phần đó vì thực sự có trong thiết kế; không áp dụng ví dụ “remove badge” như một yêu cầu xóa mọi badge. Bỏ các đoạn FE tự thêm về mock/contract/backend và các thông báo trạng thái lặp không có vai trò nghiệp vụ.

## Đối chiếu presentation

- File: bỏ notice minh họa, developer sidebar footer, status/revision panel khỏi workspace. Giữ file đã chọn, lỗi upload thực và count file; chi tiết receipt/raw state vào Debug.
- Analyze: OWNER và STAFF có readout khác nhau. Normal analysis có progress rows; chỉ đánh dấu hoàn tất từ summary server đã đọc, source/profile checks dùng khả năng Preview/binding thực, không timers hoặc số liệu prototype. No-profile dùng title đúng từng role và warning state riêng; không hiển thị như successful profile matching. Failed/source/ambiguous/drift/retired/provider states tiếp tục giữ recovery trong cùng batch.
- Resolve: bốn nhóm nghiệp vụ, field bindings bằng tên trường dễ đọc; thao tác mở editor thật. Bỏ catalog schema, counters kỹ thuật và diễn giải backend khỏi màn chính. Source/header người dùng cần map vẫn được giữ.
- Owner profile: full reusable interpretation, baseline/evidence và batch-only facts đọc được; bỏ raw profile IDs/revisions và mô tả CAS khỏi normal screen. Approval reason/ack tiếp tục bắt buộc.
- Staff: waiting, approved, rejected là các screen riêng trong DEV adapter. Không chèn thông báo “backend pending/DESIGN READY” vào screen. API mode vẫn handoff/refresh trung thực, không giả gửi request.
- Preview: metrics/groups/table/row detail, nguồn file/sheet/dòng và before/after là nội dung sản phẩm. Raw pins/read-set/provenance JSON/permissions chỉ trong Debug. Stale/blocked là screen recovery riêng, không giữ table/CTA review của snapshot không dùng được.
- Review/commit: bỏ đoạn hướng dẫn implementation; giữ reason/acks, domain decisions, confirmation và uncertain retry. Không thêm progress phần trăm giả.
- Completion: một receipt kết quả, một vùng Readiness, không lặp heading/actions. Receipt kỹ thuật vào Debug; fresh R01 không đồng nhất với commit thành công.

## Một Debug drawer duy nhất

`DevelopmentTools` chỉ mount khi `import.meta.env.DEV`. Trigger fixed; drawer/backdrop overlay không chiếm chỗ trong app layout và không sửa body width/overflow. `DebugContent` portal không để wrapper/placeholder trong product tree. Production không có trigger, scenario selector hoặc raw diagnostic content.

Khi native product dialog mở, Debug portal đi vào dialog đang mở để vẫn tương tác được qua top layer. Trigger nâng khỏi footer để không che CTA. Escape đóng Debug trước, focus quay lại trigger; product dialog vẫn mở. Scenario picker chỉ nằm trong Debug và giữ chính sách reset DEV hiện hành.

## Business exceptions và dữ liệu chưa có

- I01 yêu cầu ngày dữ liệu; N5/review/commit yêu cầu reason/ack. Giữ input thật dù prototype gọn hơn; không bỏ contract validation để khớp ảnh.
- Preview T phân trang: giữ “Đọc thêm dòng Preview” và chặn Review đến khi đủ trang. Không lấy một trang làm toàn batch.
- T không có exact aggregate warning count: metric dùng Có/Không/— thay vì bịa số từ trang đã tải. Count warning summary nếu hiển thị chỉ là warning summary thực.
- Opaque entity IDs không trở thành tên giả. Chỉ dùng source token có identity rule trỏ đúng canonical ID trong retained spec; còn lại “Tên chưa được cung cấp”/“Đã liên kết với danh mục”. Raw reference vẫn được giữ trong model/Debug/payload. Không đọc catalog hiện tại để giả làm tên của immutable preview.
- Không có raw source cells/candidate picker/outcome read model thì không fabricate demo. Request bổ sung display contract ở `FE_ask/013_Import_Display_Contract_Clarifications.md`; debt nghiệp vụ 012 vẫn giữ.

## Phạm vi chứng minh

Catalog 94 state đã đối chiếu source; các trạng thái chỉ có trong design nhưng thiếu runtime DTO được ghi rõ trong mapping 012. Browser tests chứng minh các flow và edge states có fixture/contract hiện hành, không chứng minh pixel parity cho 94 runtime states hoặc live BE acceptance. Underconstruction giữ nguyên.
