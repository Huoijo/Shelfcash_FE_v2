# Examples synthetic theo main

Đọc [index.json](index.json) để biết operation, direction, HTTP status, model, nguồn và giới hạn của từng example. [http-contracts.json](http-contracts.json) có headers/cookie/CSRF/key cho login, me và mutations; [contextual-queries.json](contextual-queries.json) có URL encoding thật đã round-trip.

Mỗi example có schema riêng dưới `schemas/`, sinh từ chính Pydantic boundary type của route main. Request/response JSON đều được `TypeAdapter.validate_json` bằng source DTO, gồm custom validators mà JSON Schema không diễn đạt được. Import fragments được ghi rõ `direction=fragment`: chúng không phải complete HTTP request/response.

Fixtures committed được giữ synthetic provenance; các variations thiết kế trong gói được đánh dấu rõ. Đây không phải live response recordings, solver output mới hoặc bằng chứng persistence. Không dùng example UUID/version/default-1/snapshot cursor làm thông tin tài khoản hay precondition thật.

Password/token/CSRF placeholder có chữ `SYNTHETIC`, không là credentials thật. Ngày và metadata là ví dụ cố định; request thực cần ngày user chọn và current server versions. Secret cookie do browser quản lý; không đưa session/token thật vào logs hoặc localStorage.

Completed fixture quan sát demand zero: service null hợp lệ. No-winner variation là minh họa positive demand không đạt requirement, proof UNKNOWN/UNPROVEN, không chứng minh infeasibility. Failed partial giữ candidate verified là một trạng thái riêng; không đổi failed thành success chỉ vì thấy winner.

[Kết quả validation](../verification/examples.json), [hướng dẫn FE](../FE_START_HERE_VI.md).
