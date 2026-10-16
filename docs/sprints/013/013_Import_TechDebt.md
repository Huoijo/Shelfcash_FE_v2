# 013 — Import Technical Debt delta

14/10/2026. Baseline: `012_Import_TechDebt.md`; không bao gồm Underconstruction_by_BE.

## Resolved trong FE

- Nội dung developer/mock và raw transport diagnostics khỏi workspace; scenario picker tập trung vào DEV Debug overlay.
- Debug không tiêu thụ layout, mở được từ native product drawer, đóng có focus restoration và không che footer CTA.
- Analyze no-profile có presentation riêng theo role; normal progress không dùng fake percentages/timers.
- Resolve/profile/Preview/review/completion giảm nội dung lặp; business facts và fail-closed gates vẫn giữ.
- IDs trong bảng/row detail không được dùng như tên đối tượng. Thông tin nguồn thật và exact payloads vẫn giữ trong state.

## Còn tồn tại

1. **012-IMPORT-01 — PARTIALLY RESOLVED, FE PROPOSAL TO BE, not runtime:** N5 approval/resume đã có; thiếu per-batch waiting/rejected/latest outcome read model. API mode dùng manual handoff + refresh; DEV adapter không phải API.
2. **012-IMPORT-02 — PARTIALLY RESOLVED, FE PROPOSAL TO BE, not runtime:** unique approved binding/source clarification đã có; chưa có explicit candidate collection/selection DTO. Không tự gửi candidate fields ngoài schema.
3. **012-IMPORT-03 — SOURCE/WIP ≠ RUNTIME:** A1/A2 prose/source claims chưa tự thay current target `contracts/011/openapi.main.json`. Tri-state sales observations, contribution history/raw cells chưa được coi là available nếu T không expose. Controlled HTTP tests không phải live BE acceptance.
4. **013-IMPORT-01 — PARTIAL DISPLAY CONTRACT / FE PROPOSAL TO BE, not runtime:** Preview có canonical references và provenance hiện hành; thiếu guaranteed immutable business display names cho mọi referenced entity, friendly source/report labels cho opaque namespaces, exact aggregate warning totals. FE dùng unknown/presence indicator, không giả tên/count. Chi tiết gửi BE trong `FE_ask/013_Import_Display_Contract_Clarifications.md`.

Không xin lại source_value/provenance/pins hoặc các endpoints đã có. Không thêm DESIGN_READY routes vào HTTP client. Các debt ngoài Import giữ baseline 011; không đóng debt live acceptance bằng unit/browser mock tests.
