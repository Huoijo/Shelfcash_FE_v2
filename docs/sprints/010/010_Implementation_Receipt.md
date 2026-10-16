# 010 — Implementation Receipt: reconcile Technical Debt với BE

Ngày tạo lập: 13/10/2026. General Context: audit toàn bộ handoff BE chiều 13/10, reconcile baseline FE và lập yêu cầu capability gửi BE. **Documentation/audit only**: không wire endpoint, không sửa runtime FE/OpenAPI/generated types, không commit/push.

HEAD quan sát: `e417048dfb20c50f3bc4336e58ff9c4c03baa382`. Giữ nguyên các thay đổi có sẵn, bao gồm hai file BE 008 đang bị xóa và thư mục BE answers mới; không phục hồi/xóa/sửa tài liệu đầu vào.

## Tài liệu đã đọc

Đã đọc toàn bộ năm file, tổng 5.754 dòng, trong [BE_answer/13_10_afternoon](../../../BE_answer/13_10_afternoon):

- [API_CONTRACT.md](../../../BE_answer/13_10_afternoon/API_CONTRACT.md): 1.063 dòng. SHA256 `322f4fce741d1635e1723366a8a531a813af4222b7b5d7beff8846f2b1f7014d`.
- [AUTHORIZATION_CONTRACT_VI.md](../../../BE_answer/13_10_afternoon/AUTHORIZATION_CONTRACT_VI.md): 838 dòng. SHA256 `b3a6861b344530a480144e87d814f8886a8382c742fbe78205006e378b281a14`.
- [IMPORT_MAPPING_API_CONTRACT_VI.md](../../../BE_answer/13_10_afternoon/IMPORT_MAPPING_API_CONTRACT_VI.md): 2.300 dòng. SHA256 `3bfe145c22082aef66239045a0401fdfea63363f998cb0bddd05f62d9c3fc8ce`.
- [NOTIFICATION_API_CONTRACT_VI.md](../../../BE_answer/13_10_afternoon/NOTIFICATION_API_CONTRACT_VI.md): 165 dòng. SHA256 `a74ecfb85a0ef66b02f23517b72a33d09610daae22dc4c0f65d106c84930db61`.
- [PROCUREMENT_API_CONTRACT_VI (1).md](<../../../BE_answer/13_10_afternoon/PROCUREMENT_API_CONTRACT_VI (1).md>): 1.388 dòng. SHA256 `d84809510c2763ba45467555dd54302e9cc2f2905f571fb0d9002021503e8f26`.

`FE_ask/` rỗng khi bắt đầu audit: không có file input nào để đọc hoặc debt riêng để suy diễn. Đã hỏi và nhận xác nhận của chủ dự án **“Dùng TechDebt 009 làm baseline”**. Vì vậy audit truy vết từng debt từ [009_TechDebt.md](../009/009_TechDebt.md), không giả có FE_ask response bị thiếu. File requests 010 được tạo trong FE_ask là **output của lượt này**.

Nguồn đối chiếu bổ sung: [receipt 009](../009/009_Implementation_Receipt.md), [phạm vi tạm dừng](../../status/Underconstruction_by_BE.md), `docs/README.md`, `contracts/history/v2/AGENTS.md`, phần đầu CURRENT_STATE của handoff v2, toàn bộ route/query inventory và relevant component schemas trong `contracts/history/v2/generated/openapi.json`; source FE `PlanExport.tsx`, `ImportPreviewExplorer.tsx`, Import validators/wire và bốn drift-gate scripts. Không có source backend `app/...` trong checkout FE; source references trong tài liệu mới được ghi là BE-reported, không là source vừa chạy/đọc trực tiếp ở BE.

## Authority và runtime/API parity

Ưu tiên CURRENT FACT / IMPLEMENTED > DESIGN_READY / ACCEPTED DECISION > FE proposal. Phân biệt ba lớp:

1. Policy/product contract đã được BE chốt: có thể đóng câu hỏi Product tương ứng.
2. Producer/schema/query implementation và artifact cùng release: cần đối chiếu trước FE wiring.
3. Executed acceptance/live: cần môi trường, worker, current rights và evidence thực thi; không suy từ prose/example/test presence.

OpenAPI local SHA256 vẫn `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`, **54 operations/50 paths**. Đã kiểm static inventory: không có 18 operations Đợt 2 (A02/A05–A07/IN01, PR01–PR04, NF01–NF03, MQ01–MQ03, D01/SU01/EX01). Surface 72/66 trong BE handoff là **thiết kế tương lai**, không runtime OpenAPI mới. Phần MQ/D01 vẫn thuộc phạm vi chủ dự án tạm dừng, chỉ ghi nhận trạng thái tài liệu, không đưa vào active requests/TechDebt 010.

Ngay trên routes hiện có, parity cũng chưa đủ:

- N9 chưa có creator/created-date queries và RunSummary chưa có budget.
- M01/M02 chưa có counter extensions; I04 chưa có source_effect/file/sheet projection queries.
- Local PreviewRow/CommitRowReference chưa có source_cells/planned_effect/supplier_term_semantics/inventory_effect; ProvenanceValue chưa có source_value, RecipeLineProvenance chưa có quantity_basis.
- SourceContext local date_format chưa có EXCEL_SERIAL; SheetInfo thiếu header/preamble/suggestion diagnostics mới.
- Local canonical value union vẫn chín domains, chưa có opening_stock; không inventory_receipts.
- N19 AcceptInvitation local là boolean, không const true; Invitation/Offer chưa có declined/can_decline. BE đã ghi false bị validator 422, không decline capability.

Các fields/schema mới được BE mô tả CURRENT FACT cần handoff artifact, không tự hạ tất cả xuống DESIGN_READY chỉ vì local cũ. Ngược lại, các endpoints BE ghi rõ DESIGN_READY không được nâng thành runtime vì prose có typed DTO hoặc operation count.

## Reconcile từng debt baseline 009

### Resolved contract / quyết định scope

- V01 canonical discovery, N16 invitation-scoped events, M02 filtered total, C01 authorized null cap/N4 create-only, Preview canonical groups/provenance và N1–N3 Saved semantics: giữ trạng thái resolved contract/FE của 009; không tái yêu cầu API trùng. Current API/AUTH/Import/Planning xác nhận các semantics này.
- `009-BE-003`: unified activity timeline đã được API handoff ghi **DEFERRED**. Đóng câu hỏi Product “cần một feed hợp nhất hay hai feed”; N14/N16 vẫn riêng, Notification inbox không phải timeline thay thế.
- Phần location của `009-BE-007`: location/warehouse management deferred, V03 location unsupported. Không giữ như blocker active cho receipt nullable hiện hành.
- Phần general writers của `009-BE-010`: general settings CRUD/currency-timezone mutation ngoài scope đã deferred; initial budget đã resolve từ 009. Không còn active debt bắt BE giao writer profile/settings để gọi N4/N8/N1–N3 hiện có.

“Resolved by scope decision” không có nghĩa capability đã implemented. Các phần chưa nằm trong nghiệm thu active không được chuyển thành API requests bắt buộc mới.

### Design-ready, chưa runtime

- `009-BE-001` → `010-BE-001`: A02/A05/A06/A07 self-service đã có accepted policy/DTO/lifecycle/delivery semantics; N7 completion route hiện có không chứng minh issuance self-service. Đóng Product OPEN, giữ runtime dependency.
- `009-BE-002` → `010-BE-002A`: IN01 decline cùng terminal/read/event/filter semantics đã chốt; chưa implemented. Tách `010-BE-002B` structural true-only accept drift, không dùng accept:false.
- `009-BE-005` → `010-BE-005`: Import §17 đã chốt mapping issue counters theo scope/origin và revision. Đóng phần thiếu thiết kế, giữ query/DTO/runtime delivery.
- Một phần `009-BE-006` → `010-BE-006A`: I04 source_cells + typed planned_effect projection đã có design. Canonical drawer hiện hành vẫn dùng được, không bật query mới.
- Phần supplier của `009-BE-007` → `010-BE-007`: SU01 picker đã có design/permissions/paging; N6 nullable supplier tiếp tục chạy current contract.
- Hai phần `009-BE-008` → `010-BE-008A/B`: N9 creator/local-created-date và EX01 export discovery đã có design. Retention không thời hạn và explicit export retry đã rõ; không giữ câu hỏi retention cũ như thiếu Product decision.

### Partially resolved / vẫn blocked

- `009-BE-000` → `010-BE-000A/B`: prose authority rõ hơn, nhưng artifact/source release parity và live handoff chưa được giao. Không khẳng định BE chưa implement những gì tài liệu ghi CURRENT FACT; cũng không chứng nhận release từ prose.
- Phần còn lại `009-BE-006` → `010-BE-006B`: per-file/sheet Preview aggregates chưa được counters của mapping hay row projection giải quyết. Giữ **FE PROPOSAL TO BE**, cần counting grain/scope Product contract hoặc thu gọn UI.
- Phần còn lại `009-BE-008` → `010-BE-008C`: budget trên History summary chưa có; N9 query extensions không thêm field đó. Giữ **FE PROPOSAL TO BE** hoặc chấp nhận “Xem trong Run”.
- `009-FE-001` → `010-FE-001`: shared mock toàn flow vẫn FE work; BE docs không resolve mock.
- `009-FE-002` → `010-FE-002`: các UI/controlled slices 009 giữ đã đóng; ma trận nhiều Store/rights/fault/resume rộng vẫn partial.
- `009-FE-003` → `010-FE-003`: coverage/performance/lint chưa được sửa hoặc đo lại trong audit docs.

## Debt mới nhận diện từ handoff và source FE

- `010-BE-011A`: Import §5.1 nêu analyze source-before-reuse gap. Accepted policy/clarification đã rõ; BE báo unique signature candidate có thể bind khi thiếu positive source evidence. M04 source declaration có mặt không tự resolve nhánh analyze.
- `010-BE-011B`: Import §8.4 nêu assembler có thể union hai bản recipe đầy đủ cùng version. Policy yêu cầu conflict; source/report-grain representation và guard/evidence cần hoàn thiện. Không mở generic upsert/correction hoặc sửa BOM để chữa.
- `010-BE-012A/B`: PR01–PR04 permission request và NF01–NF03 inbox là accepted Đợt 2 nhưng **DESIGN_READY, not runtime**. N13 direct grants không có request lifecycle; inbox không task authority/approval bypass.
- `010-BE-013`: Excel inventory_receipts **DESIGN_READY**, reuse pipeline + N6 shared identity; không count/opening để giả actual receipt. N6 form hiện hành đã có, không HTTP loop per Excel row.
- `010-BE-014`: quantity basis, supplier price/MOQ basis, source_value, EXCEL_SERIAL và opening stock/effect là BE-reported current implementations nhưng thiếu local artifact parity. Opening còn nhãn WIP và CURRENT FACT trong cùng handoff, cần release confirmation. Đây là handoff clarification, không đề nghị thiết kế API mới.
- `010-FE-004`: PlanExport.tsx chỉ cho eligible options, trong khi Planning §15.4 đã cho export candidate ineligible/reference kèm cảnh báo. Đây là FE alignment có thể sửa theo current contract; chưa sửa trong lượt audit. Không cần BE thêm API, không đồng nhất candidate exportability với eligibility.

## Những quyết định FE có thể thực hiện từ answers mới

Đã thực hiện ở tài liệu: đóng Product OPEN đã được accepted; bỏ active debt đã deferred; split phần contract resolved khỏi runtime chưa giao; ghi riêng proposals chưa accepted và runtime gaps BE tự báo; tạo bản requests R00–R13 đủ gửi BE.

FE implementation tiếp theo có thể làm trong current contract: sửa PDF alternate export gating/warning theo candidate evidence, mở rộng controlled/browser coverage, cải thiện mock/performance. Những việc đó không cần gọi endpoints Đợt 2. Phần fields BE reported implemented cần artifact release trước khi regenerate types/validators và cập nhật source→canonical UI; không sửa wire bằng ghi chú prose.

FE có thể chuẩn bị flow/state/copy theo design-ready, nhưng runtime feature phải chờ actual API parity. Không bật signup/decline/request-rights/inbox/SU01/EX01 hay gửi new queries vào runtime cũ. Không tự thêm Store creation/self-owner, one-time bypass, source proof do FE đoán, currency conversion, actual stock từ planned purchases hoặc settings fields vào writer sai trách nhiệm.

Giữ profile approval ≠ dữ liệu đã nhập. Notification approved wording chỉ nói profile đã duyệt và cần mở batch tiếp tục preview/resolutions/review/commit. Read/unread/hidden notification không xóa pending task; current detail/rights quyết định actions, không notification snapshot.

## Files bàn giao

- [010_TechDebt.md](010_TechDebt.md): trạng thái mới và gate đóng theo từng debt, giữ trace về 009, không giữ việc resolved như API thiếu.
- [010_FE_to_BE_API_Capability_Requests.md](../../../FE_ask/010_FE_to_BE_API_Capability_Requests.md): một file gửi BE, chia requests design-ready, FE proposals và capability/guard completion. Mỗi mục có dữ liệu FE lấy/gửi, flow và expected semantics; không thiết kế backend storage/implementation.
- Receipt này và liên kết trong README. Không sửa receipt/debt 009 để thay bằng evidence mới; không sửa Underconstruction.

## Kiểm chứng của lượt 010 và giới hạn

- Đọc toàn bộ năm handoff files; lập line-count/SHA256 inventory; xác nhận FE_ask ban đầu rỗng và baseline được chủ dự án duyệt.
- Static parse local OpenAPI: 54 operations/50 paths; đối chiếu absence của 18 designed operations và relevant schema/query differences kể trên.
- `check:import-wire`, `check:planning-wire`, `check:store-wire`, `check:operations-wire`: PASS với artifact local. Đây là local frozen wire agreement, **không chứng minh agreement với release BE chiều 13/10**.
- Kiểm tra UTF-8, relative links/explicit anchors, truy vết đủ 12 debt active baseline 009 và whitespace của ba file mới; kiểm WIP/diff. Không sửa input BE, source FE, package hoặc generated OpenAPI.
- Không chạy lại app tests/build/browser/HTTP/DB/worker trong task documentation-only. 350 tests/22 browser tests của 009 là evidence lịch sử, không kết quả chạy mới của 010. Không dùng các acceptance specifications trong BE docs làm executed PASS.

**RUNTIME/API PARITY: PARTIAL. LIVE_VERIFIED IN 010: NO.** Đã reconcile policy/product contract; các design-ready extensions và BE-reported runtime schema changes chưa đủ handoff để wire hoặc nghiệm thu live.
