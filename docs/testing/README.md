# Kiểm thử và evidence

## Quy trình

- [017 — Live BE/FE E2E protocol](017_Live_BE_FE_E2E_Protocol.md): Owner/Staff, scope, quyền, mutation safety, authoritative readback, coverage và exit criteria.
- [Live E2E agent skill](../../.agents/skills/live-be-fe-e2e/SKILL.md): hướng dẫn thực thi tương ứng trong `.agents`.

## Inventory và verification receipts

- [LIVE_E2E_DESIGN_INVENTORY.json](LIVE_E2E_DESIGN_INVENTORY.json): baseline danh mục thiết kế/điều kiện; không phải chứng nhận live coverage.
- [BACKEND_CAPABILITY_COVERAGE.json](BACKEND_CAPABILITY_COVERAGE.json): inventory service/state được generator pin với contract; `npm run check:capabilities-wire` kiểm tra artifact này.
- [FREEZE_019_DESIGN_AUDIT.json](FREEZE_019_DESIGN_AUDIT.json) và [FREEZE_019_VERIFICATION.json](FREEZE_019_VERIFICATION.json): design pins, source fingerprints và kết quả tại freeze019.
- [PASS_020_CAPABILITY_AUDIT.json](PASS_020_CAPABILITY_AUDIT.json) và [PASS_020_VERIFICATION.json](PASS_020_VERIFICATION.json): audit 73 operations và evidence của implementation020.

Các JSON trên được giữ nguyên bytes trong lần sắp xếp thư mục. Kết quả chỉ có giá trị với source, contract, môi trường và phạm vi đã ghi. Controlled/mock/API-only pass không đồng nghĩa BE live acceptance. Path cũ trong frozen receipts được tra qua [manifest di chuyển](../PATHS.json).

## Live runs có phạm vi cụ thể

- [API smoke — 16/10/2026](live-runs/import-smoke-2026-10-16T08-29-02-943Z/README.md): một batch staging được nhận; Analyze job còn queued. Có Origin mismatch và contract drift ngoài scope; không phải UI/live acceptance toàn flow.
