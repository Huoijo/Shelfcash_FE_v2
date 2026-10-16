# ShelfCash — Thư viện tài liệu frontend

Tài liệu được nhóm theo mục đích sử dụng; các báo cáo triển khai giữ nguyên ID và tên file để truy vết. Việc chuyển thư mục không thay đổi kết luận nghiệp vụ, trạng thái API hoặc kết quả kiểm thử đã ghi nhận.

## Bắt đầu từ đâu

1. [Register hiện hành](status/FOUND_MISSING_UI_V1.md): trạng thái Design / FE / BE / verification, owner và bước tiếp theo. Đây là nơi cập nhật backlog hiện tại.
2. [Afternoon BE integration020](sprints/020/020_Backend_Handoff_Integration.md): 76-operation pin, Assistant/recovery API-state boundaries, pending rollout and offline verification. Earlier [Implementation 020](sprints/020/020_Closed_Design_Gap_Implementation.md): sáu design gaps vừa tích hợp, giới hạn contract và kết quả đối chiếu hiện tại.
3. [Kiến trúc nền tảng](architecture/001-architecture-foundation.md) và [service/application-state boundary 018](sprints/018/018_Backend_Capabilities_Service_Boundary.md): kiến trúc và bối cảnh các lớp tích hợp; đọc cùng code và receipt mới hơn.
4. [Hướng dẫn Import cho Owner/Staff](guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md): thao tác, API và lỗi theo từng bước; các phần ghi historical phải được đối chiếu với register/receipt mới nhất.
5. [Quy trình E2E với BE live](testing/017_Live_BE_FE_E2E_Protocol.md): scope, quyền, dữ liệu, readback, recovery và tiêu chí nghiệm thu. Controlled checks không thay thế live acceptance.

## Cấu trúc

- [architecture/](architecture/README.md): nền tảng kiến trúc và quy ước kỹ thuật.
- [status/](status/README.md): register hiện hành và phạm vi đang parked/underconstruction.
- [guides/](guides/README.md): hướng dẫn sử dụng theo vai trò/nghiệp vụ.
- [sprints/](sprints/README.md): báo cáo triển khai, audit, state mapping và tech debt theo ID từng lượt; đọc kết luận tại đúng thời điểm của báo cáo.
- [testing/](testing/README.md): quy trình kiểm thử và các inventory/verification receipts bằng JSON.
- [integration-audit/](integration-audit/README.md): English discovery prompt, target-machine handoff, phase 0-8 workflow, and unexecuted coverage/defect/report templates. The current preparation assignment does not authorize testing.
- [references/](references/README.md): tài liệu nghiệp vụ nguồn do người dùng cung cấp, giữ nguyên bytes.
- [archive/](archive/README.md): tài liệu đối chiếu đã có nguồn hiện hành thay thế; giữ để tra cứu lịch sử.

API contracts nằm tại [contracts/](../contracts/README.md), quy trình authority/pinning tại [contracts/WORKFLOW.md](../contracts/WORKFLOW.md). Trao đổi gửi BE/design giữ trong [FE_ask/](../FE_ask/); phản hồi và handoff BE giữ tại các thư mục nguồn hiện có, không trộn với báo cáo FE.

## Tài liệu hiện hành và bằng chứng lịch sử

- Cập nhật trạng thái hiện tại tại một register duy nhất: [FOUND_MISSING_UI_V1](status/FOUND_MISSING_UI_V1.md). Một thiết kế hoặc service đã có không tự chứng minh runtime/live acceptance.
- [FOUND_MISSING_UI.md](FOUND_MISSING_UI.md) là historical register đóng băng, giữ nguyên vị trí và bytes. Không dùng trạng thái cũ trong đó để ghi đè V1.
- Các trang `016`–`020` ở root chỉ dẫn tới tài liệu chuẩn trong thư mục mới. Chúng giữ các liên kết từ historical register và frozen JSON hoạt động, không phải bản sao nội dung hay tracker mới.
- [PATHS.json](PATHS.json) ghi đường dẫn cũ → mới, các compatibility pages và checksum của những artifact bất biến. Những path được trích trong frozen evidence vẫn mô tả vị trí tại thời điểm ghi nhận; dùng manifest khi tra cứu.
- JSON verification/inventory và tài liệu `.docx` nguồn được giữ nguyên bytes; các receipt Markdown chỉ được cập nhật đường dẫn khi chuyển thư mục.

## Khi bổ sung tài liệu

- Chọn thư mục theo mục đích; báo cáo cho ID `NNN` đặt tại `sprints/NNN/`, giữ ID/tên file nhất quán với tài liệu và FE_ask liên quan.
- Báo cáo mới ghi rõ ID, tiêu đề, ngày, bối cảnh, nguồn authority, phạm vi triển khai, kiểm chứng và giới hạn.
- Cập nhật index của nhóm và register nếu trạng thái hiện tại thay đổi. Không tạo thêm tracker cạnh tranh hoặc sửa frozen evidence để phản ánh kết quả mới.
- Dùng liên kết tương đối từ vị trí file. Khi di chuyển, cập nhật cả link nội bộ lẫn tham chiếu từ README, AGENTS/rules/skills và FE_ask.
