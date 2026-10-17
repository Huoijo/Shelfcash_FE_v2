# Checklist FE — What-if REPLAN

SOURCE_READY / NOT_DEPLOYED, implementation `d555035bdb52929eea4ce7b60b5d1447ce748078`.
Các ô dưới đây là acceptance cần FE thực hiện, chưa được đánh dấu browser PASS.

- [ ] Mở Run gốc đủ retained evidence; ba preset gửi factor text và delay integer đúng body.
- [ ] Submit có Origin, current CSRF, cookie session và UUID Idempotency-Key; chỉ một intent cho double-click.
- [ ] Persist intent trước dispatch; giữ scenario ID/Location để reload/read lại.
- [ ] Queued/running poll theo meta2000ms; terminal dừng poll; không ép timeout thành failed.
- [ ] Winner: hiển thị Gốc/Giả định/Chênh lệch và hai winner baskets riêng.
- [ ] Nhãn Giả định, link Run gốc, mutation và all-supported-arrivals scope luôn rõ.
- [ ] Dùng exact text/decimal_view; giữ unit/currency/Product/path; không cộng cup với g/ml.
- [ ] Costs/fees/budget, purchase quantity, service/lost sales/requirement shortfall và expired/ending đúng source.
- [ ] Delta scenario-baseline có dấu; không tô tốt/xấu chỉ theo dấu.
- [ ] Null/unknown khác known zero; hiển thị reason, không dùng zero-fill.
- [ ] No winner, failed technical, blocked, incomplete search được phân biệt; không ghi globally infeasible.
- [ ] Lost response trước/sau nhận ID: replay cùng key/body/path/actor; không auto tạo key mới.
- [ ] Concurrent same-key submit không tạo duplicate; changed body cùng key hiển thị409.
- [ ] Session hết hạn, Staff thiếu/revoked quyền, foreign Store không lộ cached data; không suy no-effect từ403/404.
- [ ] Restart/dead owner: hiển thị PROCESS_INTERRUPTED, không auto solve lại.
- [ ] Unknown field/type/bounds errors gắn đúng field; xử lý S02 error-envelope drift theo handoff.
- [ ] C03 child có HYPOTHETICAL authority; không gọi Summary/Chat/PDF cho scenario.
- [ ] Unsupported pending inbound/challenger/chaining có reason; không fallback recapture hiện tại.
- [ ] Oracle10→15 VND và delay/combined no-winner ghi SYNTHETIC; không mô tả là số liệu quán thật.
- [ ] Baseline và tồn thực không bị FE cập nhật từ scenario; không tạo order/receipt/movement.
- [ ] Xác minh source/runtime deployment riêng trước khi thông báo feature khả dụng trên runtime8103.
