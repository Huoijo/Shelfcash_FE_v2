# 011 — Implementation Receipt: tiếp nhận BE night handoff

Ngày tạo lập: 13/10/2026, Asia/Saigon. General Context: tiếp tục sprint 011 từ [reconcile 010](010_Implementation_Receipt.md), xử lý phần FE current-contract, rồi tiếp nhận bundle BE được bổ sung trong cùng sprint. Không commit/push/deploy; không sửa backend hoặc phạm vi Underconstruction.

## Nguồn và snapshot được chọn

Đã đọc toàn bộ [BE response R00–R13](../BE_answer/13_10_night/010_BE_CAPABILITY_RESPONSE_VI.md), SHA256 `73b118604742c3c3c1521a26f62377ca9bed8ce75b56999cf51113a1ae7ea129`, 236 dòng; [TechDebt 010](010_TechDebt.md) và [FE requests 010](../FE_ask/010_FE_to_BE_API_Capability_Requests.md).

Gói bổ sung: `BE_answer/13_10_night/010_BE_FE_handoff_20261013/`. Đọc README/REFERENCE_MANIFEST, kiểm hash cả **80/80 files: khớp**. Đối chiếu ba OpenAPI snapshots; đọc delta của năm canonical contracts so với afternoon (API/Auth/Notification giống; Import/Planning có clarification và accepted R05/R09 mới), source guards `import_analysis.discover`, `_bindings`, recipe grouping trong `import_preview`, opening preview, descriptors và source-context editor/validators/wire FE. Không chạy Python backend hoặc coi reference bundle là backend runnable; supporting files có thể được copy sau thời điểm snapshot.

Chọn **T/main snapshot**, HEAD BE `b1ede89a3919230ce9526337537d7a19ca182f15`, captured 13/10/2026 18:07:31 +07:00, 54 operations/50 paths:

- SHA256 T: `d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d`.
- Pin nguyên bytes tại [contracts/011/openapi.main.json](../contracts/011/openapi.main.json); `scripts/wire-source.mjs` kiểm hash trước đọc.
- Giữ nguyên artifact v2 lịch sử SHA `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`. Hash `6336bc...` trong phản hồi BE là FE artifact họ đọc ở máy khác, không phải bytes workspace này và không ghi đè provenance.
- I/import-wip SHA `24cad7d12090301b4993c3b68924a47b5fe1f2d29ece1e19f67f1e922b022c2d`, 54/50; B/auth-wip SHA `cfd80d728652aef08d86b39cd70cb90662ca0f0cf76f6b40edcb337112040ceb`, 59/55. Không trộn I/B vào T, không coi chung HEAD là shared release chứa WIP.

R00 “chưa nhận ba JSON” đã resolve sau bổ sung. Shared integrated release/live evidence (`010-BE-000B`) vẫn chưa có. B1/B2 và A1 là reported COMPLETE của worktree riêng; A2/B3 vẫn WIP. Gmail SMTP smoke/inbox confirmation không chứng minh workflow email/browser E2E. N19 schema boolean drift vẫn mở; FE chỉ gửi true.

## Triển khai FE trong sprint 011

### Import: wire và bằng chứng theo T

Đã chuyển cả bốn drift gates sang snapshot main được pin. Import wire regenerate từ source schemas qua `node scripts/sync-import-wire.mjs`; Operations dùng generator hiện có. Planning/Store closures không đổi nghĩa/schema. Không thay schema bằng prose hoặc nới validator để nhận arbitrary fields.

Import closure hiện **127 schemas/127 types**; nhận được opening_stock và các extensions đã có ở T:

- `ProvenanceValue.source_value`, `RecipeLineProvenance.quantity_basis`: giữ raw lexical/basis và applied rules; FE không tính lại quantity/loss hoặc chuẩn hóa money.
- `SupplierTermSemantics` trên Preview/completion refs: giữ price denominator/basis, source MOQ, canonical MOQ/packs và fee coverage riêng. Drawer có phần cơ sở giá/MOQ; unknown fee không biến thành zero/readiness.
- `OpeningValue`, `InventoryEffect`: selector schema đọc từ M03 nhận mười domains; nhãn “Tồn đầu kỳ thực tế”, drawer hiển thị effect đã ghim. Opening vẫn COUNT_CORRECTION baseline0, không receipt lịch sử, không xác nhận đủ toàn kho.
- SheetInfo header/preamble/epoch/safe suggestion diagnostics: hiển thị plain-text evidence giới hạn của server. Không execute nội dung nguồn hoặc dùng Qwen confidence làm approval.
- SourceContext editor cho EXCEL_SERIAL theo epoch workbook; không convert ngày tại FE hoặc biến date-only thành timestamp. Bỏ input `pack_cost_basis` deprecated khỏi proposal mới; price/MOQ dùng descriptors/cột hoặc shared values hiện hành. Existing retained evidence vẫn đọc được.

Files chính: `importFlow.wire.ts`, `ImportResolutionEditor.tsx`, `ImportMapping.tsx`, `ImportPreviewExplorer.tsx`, `preview.labels.ts`, bốn check scripts, `wire-source.mjs`, `sync-import-wire.mjs` và snapshot pin.

Không bật `inventory_receipts`, source_effect projection, scoped counters/aggregates hoặc query mới của N9 vì T chưa có. Không có FE arithmetic/stock writer mới.

### R10: source proof và recipe cross-sheet blockers

Source bundle xác nhận analyze tạo source_context unresolved; `_bindings` kiểm declaration/actor/scope trước preview/confirm/commit; recipe group qua nhiều sheet trả RECIPE_SOURCE_SCOPE_AMBIGUOUS. Đóng nhận định cũ “BE chưa có guards” ở mức static implementation; full executed matrix/live vẫn mở.

FE tiếp tục M02 → M04 declaration/evidence → M01 pinned spec → I04 preview qua routes hiện hành. Thêm hướng dẫn source proof ở mapping card và hướng dẫn SOURCE_CONTEXT_REQUIRED/CONFLICT, RECIPE_SOURCE_SCOPE_AMBIGUOUS ở Review/row drawer. Giữ code/message/source locations gốc; lỗi vẫn chặn nguyên tử toàn lô. Không auto-union, chọn file cuối, bỏ row lỗi hoặc tự approve. Split-report assembly đã DEFERRED; không còn Product question để yêu cầu lại.

### PDF: resolve 010-FE-004

`PlanExport.tsx` dùng retained candidate evidence thay eligibility làm điều kiện xuất. Candidate ineligible/reference được chọn để xuất với cảnh báo “Phương án tham khảo — không được khuyến nghị” và rejection reasons; không có winner thì phải chọn explicit candidate, không tự chọn. Không candidate thì không gửi N10. Failed/nonterminal Run không được mở khả năng xuất trái contract.

Mất ACK replay cùng option/body/key. Cảnh báo vẫn hiện khi có biên nhận; export không đổi winner hoặc đặt hàng. Download `503 EXPORT_ARTIFACT_UNAVAILABLE` có trạng thái riêng: thử GET cùng artifact hoặc chủ động chọn tạo export mới → confirmation → key mới; không tự POST để chữa download. 403 khóa download/retry/new-export. Không hứa regenerate chắc chắn khôi phục bytes hoặc lấy current facts thay retained Run.

## Reconcile trạng thái từ 010

- `010-BE-000A`, `010-BE-014`: artifact delivery và local T Import structural parity đã resolve cho phạm vi dùng; integrated release/live giữ phần còn lại, không còn xin lại ba JSON đã nhận.
- `010-BE-011A/B`: source guards đã xác nhận static; FE blocker help hoàn thiện. Split-report Product question đóng bằng DEFERRED; executed/live guard acceptance chưa chứng nhận.
- `010-BE-006B` (R05) và `010-BE-008C` (R09): chuyển **FE PROPOSAL TO BE → ACCEPTED / DESIGN_READY, not runtime**. Đã đọc canonical sections mới; typed wire/consumer chưa có, không tự dựng field names.
- `010-BE-001`: B1/B2 source được bàn giao trong Auth WIP, không còn mô tả “không có implementation ở mọi tree”. Integration vào T/stable handoff và FE public flow vẫn pending. A07 source dùng `/auth/password-reset/request`, khác prose afternoon; không hard-code route theo prose cũ.
- `010-BE-002A`: B3 có IN01 source WIP; chưa COMPLETE, không ship decline. `010-BE-002B` true-only structural drift vẫn còn ở cả ba snapshots.
- `010-BE-005/006A/007/008A/008B/012A/B/013`: vẫn design-ready/not-runtime; không bật các capability đó hoặc hỏi lại Product policy đã chốt.
- `010-FE-004`: đã resolve FE + controlled browser. `010-FE-002`: bổ sung coverage PDF/Import, chưa toàn ma trận. `010-FE-001/003`: shared mock/coverage/performance/lint vẫn mở.

Chi tiết active debt và điều kiện đóng tại [011_TechDebt.md](011_TechDebt.md). Yêu cầu gửi BE đặt trong [FE_ask/011_FE_to_BE_Followup.md](../FE_ask/011_FE_to_BE_Followup.md); không đưa Underconstruction vào backlog active.

## Kiểm chứng và giới hạn

- 80/80 bundle manifest hashes; T pin byte/hash; schema closure và regeneration idempotence được kiểm.
- Auth **26**, Store **118**, Import **103**, Planning **77**, Operations **30** passed: tổng **354 unit/component/workflow/boundary tests** trong sprint này.
- Browser full regression: **26 passed, 1 failed** ở test dirty-close do focus quay về combobox mở lại popup, Escape đóng popup thay drawer. Sửa test dùng nút đóng drawer cho bước thứ hai (Escape popup vẫn được kiểm riêng); targeted rerun **1 passed**. Tổng **27 distinct browser cases đạt qua full run + rerun**, không ghi nhầm 27 passed trong cùng full invocation. Năm ca PDF mới và hai PDF regression cũng đã đạt targeted run 7/7 trước khi pin T.
- Bốn `check:*‑wire` gates PASS theo T/main. Import 127 schemas; Planning 80; Store 25; Operations 94. Không chứng minh parity với I/B WIP hoặc server đang chạy.
- `npm run build`: PASS; main bundle **993.53 kB** minified, **268.93 kB** gzip, còn warning >500 kB.
- `npm run lint`: PASS, còn hai warnings set-state-in-effect ở OnboardingPages/RecipeSchedulePage. Không thêm warning mới.
- Xem screenshot PDF reference warning; document links/trace/whitespace/WIP checks. Không chạy DB/migrations/reset/SMTP/provider hoặc merge/cherry-pick backend.

**LIVE_VERIFIED: NO.** Các kiểm tra browser dùng mock/controlled HTTP. Chưa có runtime hợp nhất T+I+B, chưa verified môi trường demo hiện tại; không coi source-generated snapshot là deployed release. Receipt 009/010 và BE inputs giữ nguyên lịch sử. Chưa commit/push.
