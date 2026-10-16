# Live API smoke — một batch nhỏ

Run: `import-smoke-2026-10-16T08-29-02-943Z`. Môi trường: BE `https://localhost:8103`, Store **ShelfCash Local Demo**. Mode: **LIVE_API_ONLY**, không phải UI E2E. Chi tiết request IDs, input digest, nguồn đã nhận và các readback tại [report.json](report.json).

## Kết quả

- Owner/Staff đăng nhập và đọc phiên/Store được; role/grants được đọc từ BE bằng hai API contexts độc lập.
- Một CSV synthetic, một dòng nguyên liệu, 250 byte. Chỉ staging, chưa ghi canonical.
- I01 tạo draft: **201**. I02 nhận file: **200**. I04 xác nhận file/size/checksum/source set đúng.
- I03 Analyze: **202**, có job ID. Poll J01 có giới hạn45 giây: job vẫn **queued**. Đọc lại lúc `2026-10-16T08:33:10Z` vẫn queued; batch **analyzing**, file **not_started**, chưa có completion.
- Import ID: `7bb43402-4792-41e9-8651-fe9b8ccbb083`. Job ID: `b84fd1a3-ed63-4ccb-bbe0-a84c10cd81ee`.

## Các giới hạn đã quan sát

1. FE đang phục vụ HTTP localhost:5173, BE chỉ allow Origin HTTPS localhost:5173. Preflight HTTP trả400, không có allow-origin; HTTPS trả200. API smoke dùng Origin đã cấu hình. Chưa thực hiện UI E2E hoặc thay cấu hình.
2. Analyze chưa bắt đầu trong cửa sổ quan sát. Local `.env` bật worker, nhưng sức khỏe worker/runtime config chưa có bằng chứng; chưa kết luận nguyên nhân. Cần kiểm tra worker/lifespan/log xử lý đúng job hiện có, không gửi lại Analyze hoặc tạo thêm batch để né lỗi.
3. Live OpenAPI khác main016: khác biệt operation ngoài description ở R01/C01 và8 component schemas. Các schema request/receipt Draft/Upload/Analyze/Job được kiểm tra trong smoke khớp; không suy deployment SHA từ handoff.

Không sửa quyền, chọn mapping, duyệt Profile, Review/Commit, reset DB/queue hoặc xóa nguồn. TLS verification chỉ được bypass cho chứng chỉ local trong API context riêng; không phải xác nhận browser tin cậy chứng chỉ. Không lưu password/cookie/CSRF trong evidence.
