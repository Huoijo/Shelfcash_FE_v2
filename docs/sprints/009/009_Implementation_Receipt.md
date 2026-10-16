# 009 — Implementation Receipt

Ngày tạo lập: 13/10/2026. General Context: tiếp tục triển khai theo phản hồi BE và các thiết kế MagicPath mới do chủ dự án hoàn thiện. Tiếp tục từ worktree 008; không commit, push hoặc deploy. Baseline HEAD: `9b5e31e9bb873a45b50fb6c6796f69b59284e953`.

## Phạm vi và nguồn xác nhận

Dùng phản hồi trong `BE_answer/008_TechDebt.md` để triển khai phần đã có contract hiện hành. `BE_answer/008_Implementation_Receipt.md` giống hệt receipt 008 trong docs, không phải bằng chứng nghiệm thu BE mới. Không thay đổi schema hoặc tự thêm API dựa trên proposal.

M04/M10/M12/M13/M14 được chuyển sang [Underconstruction_by_BE](../../status/Underconstruction_by_BE.md) theo yêu cầu. 009 chỉ thay đổi entry để thông báo đang xây dựng; không tiếp tục nghiệp vụ của các mục này.

OpenAPI local SHA256: `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`. BE báo SHA mới `19d6500f7071fe77909096eef77d35226e4e16e939217779974370e2cccb7d19`, nhưng chưa bàn giao artifact mới trong repository. Giữ drift gates theo artifact thực tế đang có.

## Kết quả triển khai 009

### M02 — Hoạt động quản trị theo đúng phạm vi

- N16 luôn gửi `view=events` và `invitation_id`; không đọc event như feed toàn Store.
- Owner chọn lời mời từ danh sách phân trang rồi xem lịch sử riêng. Đổi lời mời đặt lại cursor và chặn phản hồi cũ bằng resource key/AbortController.
- Adapter từ chối event sai Store hoặc sai invitation. Không gửi request N16 khi chưa chọn invitation.
- N14 vẫn là feed thay đổi quyền riêng biệt; không tự hợp nhất hoặc suy diễn thứ tự giữa hai feed.

Files: `src/features/operations/StoreActivityPage.tsx`, `operations.data.ts`.

### M03 — Bộ lọc và số đếm mapping hiện có

- Thêm bộ lọc `auto_mapped` và `resolved`; khi chọn, FE tắt `review_only` để không loại các mục đã xử lý.
- Hiển thị `pagination.total_count` cho đúng Sheet/bộ lọc hiện tại, tách khỏi tiến độ toàn lô M01.
- Trang lọc rỗng không còn ngụ ý toàn bộ mapping đã hoàn tất. Không tính auto count từ `completed_fields` hoặc từ số items trên trang.
- Không tạo aggregates theo file/sheet chưa có contract; xem debt 009-BE-005.

File: `src/features/import-data/components/ImportMapping.tsx`.

### M06 / M07 — Chọn nguyên liệu canonical

- Picker dùng V01, tìm theo `q`, đọc trang bằng cursor, giới hạn 50 và chỉ cho chọn nguyên liệu đang hoạt động.
- Nhận hàng và công thức mới không còn bị giới hạn vào trang kho đang mở hoặc nguyên liệu của công thức cũ. Theo BE, V01 bao gồm cả nguyên liệu chưa có lô.
- Đơn vị lấy từ nguyên liệu đã đọc; nhận hàng gửi inventory version của snapshot lựa chọn. Không tự quy đổi hoặc suy ra supplier/cost.
- Ngày nhận được kiểm tra theo ngày cửa hàng; nullable supplier/cost giữ nguyên theo contract.
- Recipe preview/commit và receipt/threshold tiếp tục giữ CAS, idempotency, retry intent và đọc lại dữ liệu sau ghi.

Files: `src/features/operations/IngredientPicker.tsx`, `InventoryActions.tsx`, `RecipeSchedulePage.tsx`.

### M08 / M11 — Saved requirements và ngân sách

- C01 thành công có `budget_ceiling=null` cho phép tạo trần ban đầu qua N4 với `If-None-Match:*`. Trần có sẵn vẫn dùng `If-Match`.
- Giá trị `0` hợp lệ, giữ nguyên decimal text. Create race 412 đọc lại trần hiện hành, không tự đổi thành replace. Mất ACK giữ nguyên create key/body/condition.
- N1/N3 ghi bộ yêu cầu xong đọc lại N2 và refresh discovery qua C01. Nếu đã có biên nhận nhưng đọc lại thất bại, nút recovery chỉ đọc lại, không tạo thêm resource. Bộ mới có thể chọn và tạo Run ngay.
- Chuyển sang “Tùy chỉnh” tạo ý định lưu bộ mới, không vô tình ghi đè bộ vừa chọn. Retry khi uncertain dùng hành động đã giữ, kể cả archive; bộ đã archive không được lưu active lại qua cùng editor.
- Mock C01/N2/N1/N3 dùng chung saved repository. C02 mock chụp đúng requirements, saved version và trần tại thời điểm nhận Run; thay đổi/archive sau đó không sửa configuration của Run cũ.
- Mock cap thiếu trả lỗi cấu hình khi tạo Run, không tự tạo cap hoặc configuration trái schema. Mock vẫn là dữ liệu tổng hợp, không chạy engine nghiệp vụ.

Files: `storeWorkspace.workflow.ts`, `StoreOperatingDefaults.tsx`, `StorePage.tsx`, `RequirementsControls.tsx`, `PlanningSetup.tsx`, `PlanningPage.tsx`, `mockSources.ts`, `operations.fixtures.ts`, `planning.fixtures.ts`.

### Các entry được tạm dừng

Thêm `src/shared/UnderConstruction.tsx`, thay entry Today và các nút mapping toàn Store/AI/What-if/Draft PO. Dialog có nút đóng, Escape và tiêu đề truy cập được. Chi tiết phạm vi nằm trong file Underconstruction, không nằm trong backlog BE cần resolve của 009.

## Đối chiếu MagicPath mới nhất và cập nhật flow/state

Project: [ShelfCash MagicPath](https://www.magicpath.ai/files/458079658328604672), cập nhật canvas `2026-10-13T04:35:48.778Z`. Đọc source với revision được chỉ định; cả sáu response trả đúng revision yêu cầu:

- Import Preview / Review — component `458395069779681280`, revision `460597241762168832`.
- Invitation / Staff Onboarding — `460368412145782784`, revision `460601872768720896`.
- Kho / Receive Goods — `458590758262427648`, revision `460395468028002304`.
- Menu / Recipe Schedule — `458614109248847872`, revision `460607009654472704`.
- Planning Setup / History / Saved Requirements — `458414835571515392`, revision `460610508773548032`.
- Planning Result / PDF — `458423352311304192`, revision `460610545930895360`.

Lần inspect này không còn hiện tượng source Kho trả revision cũ hơn canvas. Các revision trên là evidence tại thời điểm inspect, không khẳng định các chỉnh sửa sau đó cũng đã được kiểm tra. Không tạo code session hoặc sửa canvas MagicPath.

### Import Preview / Review

Thay bảng Preview bằng group tabs, bộ lọc lỗi/cảnh báo trên các dòng đã tải và drawer chi tiết mở bằng chuột/Enter/Space. Drawer hiển thị source locations, before→after, normalized records, mapping context và provenance từ server; Escape đóng và trả focus về dòng. Giữ dữ liệu cấu hình/bằng chứng lồng nhau để đối chiếu đầy đủ.

Review hiển thị tổng hợp nhóm từ server, giữ yêu cầu đọc đủ snapshot, server review acknowledgement và warning acknowledgement. Nút ghi mở confirmation riêng; hủy confirmation quay lại Review mà không ghi. Loading/empty/error/stale gates tiếp tục dựa trên workflow hiện có. Inventory import vẫn là stock-count; không đổi thành receipt vì nhãn prototype. Raw cells/per-file aggregates chưa có contract được ghi rõ thay vì dựng dữ liệu.

Files chính: `ImportPreviewExplorer.tsx/.css`, `preview.labels.ts`, `ImportPreview.tsx`, `ImportFlow.tsx`.

### Invitation / Staff Onboarding

Bổ sung layout public card và các trạng thái credentials đang gửi/thành công/token không dùng được; invitation chưa đăng nhập, sai tài khoản, expired, revoked, pending, accepting, uncertain, accepted và xác minh quyền lỗi. Sai tài khoản chỉ hiển thị tài khoản đang đăng nhập; không lộ Store/grants/email đích từ lỗi 403.

Giữ N7 password 12–128 ký tự, giới hạn byte và yêu cầu đăng nhập riêng. BE gom token invalid/expired/used thành một mã lỗi nên FE không tự phân biệt ba nguyên nhân. Token hash được scrub khỏi URL, chỉ giữ trong memory theo locator; hoàn tất credentials không xóa proof invitation khác.

Accept mất ACK replay cùng body/key/version. Có biên nhận thì chỉ đọc lại T01/T02 và session. Sửa lỗi remount khi A03 refresh chuyển tạm sang bootstrapping làm mất biên nhận/trạng thái xác minh; đổi actor thật vẫn reset màn hình. Link tiếp tục được xử lý qua Store discovery và cơ chế select Store/T02 hiện có, chọn đúng Store được mời rồi bỏ query locator; không dùng receipt làm authority quyền hiện tại.

Files: `OnboardingPages.tsx/.css`, `invitationProof.ts`, `RequestedStore.tsx`, `StorePage.tsx`.

### Receive Goods

Drawer chia nhóm nguyên liệu, số lượng, thông tin nhận và snapshot tồn kho. Canonical combobox hỗ trợ q/cursor, loading/empty/retry và bàn phím; Escape đóng popup trước khi đóng drawer. Form → Review → xác nhận ghi là các bước riêng. Có dirty-close confirmation và guard khi đổi Store/rời trang.

Ghi thành công đọc lại snapshot/detail/lots/movements. Nếu readback lỗi, màn hình giữ biên nhận và recovery chỉ đọc; không tạo receipt mới. Uncertain replay cùng logical intent; conflict yêu cầu đọc lại lựa chọn/snapshot. Giữ decimal text, source identity, ngày/nullability và quyền hiện hành. Supplier không có discovery nên không gửi tên tự do vào trường UUID, không gộp lô tự động.

Files: `InventoryActions.tsx`, `IngredientPicker.tsx/.css`, `useOperation.ts`.

### Recipe Schedule

Timeline phân biệt current/scheduled/past; version detail chỉ đọc. Editor tạo version mới có picker canonical, thêm/xóa dòng, validation và prefill nội dung hiện hành. Sửa ngày/rút lịch tương lai giữ nội dung công thức bất biến.

Preview hiển thị đầy đủ before/after, changed ranges, warnings/blockers và acknowledgement; bước confirmation riêng mới commit. Dirty-close giữ hoặc bỏ draft theo lựa chọn. Conflict giữ draft để preview lại theo timeline mới. Uncertain replay captured change; commit đã xác nhận nhưng readback lỗi chỉ tải lại timeline/change evidence. Response cũ không ghi đè màn hình mới.

File: `RecipeSchedulePage.tsx`.

### Planning Setup / Planning Result

Setup gồm bốn phần kỳ dự báo, chế độ requirements, Store cap/Run budget và readiness. Readiness theo ngày chọn; kỳ bảy ngày và semantics C02 giữ nguyên. Saved mode không bị chặn bởi ngân sách custom cũ; trạng thái đang tải/lưu/xác minh requirements chặn tạo Run. Priority/open-PO/advanced chưa có contract giữ không khả dụng.

Lifecycle hiển thị creating/queued/running/long/uncertain và request đã gửi; không dựng phần trăm. Trong khi C02 chưa rõ kết quả, giữ component Setup để không mất draft. Result có bốn tab overview/ingredients/alternatives/reasons và banner Run lịch sử chỉ đọc. Lỗi transport/HTTP 5xx hợp lệ của một fragment giữ các fragment đã xác thực khác để retry riêng; lỗi quyền/protocol/pinning vẫn xóa dữ liệu theo boundary hiện có.

Files: `PlanningSetup.tsx`, `PlanningLifecycle.tsx`, `PlanningResults.tsx`, `PlanningPage.tsx`, `planning.workflow.ts`.

### Planning History / PDF Export

History có loading/error/empty/filter-empty, status và forecast-start filters, pagination cùng snapshot, row keyboard navigation và liên kết đúng Run lịch sử. Không trộn snapshot/duplicate Run; filter đổi đặt lại cursor. N9 không có captured budget nên cột ngân sách dẫn người dùng xem trong Run, không lấy trần Store hiện tại thay thế.

PDF drawer chọn phương án eligible mà không đổi winner; tạo export chụp option đã chọn. Hiển thị queued/running/long/poll-error/ready/download-pending/download-success/download-failure/forbidden/unavailable và resume bằng locator đã biết. Download lỗi chỉ retry artifact; tạo export mới là hành động xác nhận riêng. Giữ cookie/CSRF, quyền cost, binary MIME/size/hash checks. Không giả lập discovery khi mất export/job locator.

Files: `PlanningHistoryPage.tsx`, `PlanExport.tsx`.

### Saved Requirements UX

Ba mode Mặc định/Tùy chỉnh/Đã lưu có draft riêng; chuyển mode hoặc đọc Saved không xóa custom draft. Saved summary chỉ đọc; quản lý mở drawer riêng với N3/CAS, archive confirmation hoặc copy sang custom cho lần chạy mới. Lưu bộ mới yêu cầu tên ở dialog riêng. Conflict đọc version mới nhưng giữ draft; uncertain khóa editor và replay intent đã giữ. Có biên nhận mà N2/C01 readback lỗi chỉ retry reads; invalid/archived/forbidden configuration không trở thành executable selection.

File: `RequirementsControls.tsx`. Thiết kế cung cấp mode selector và entry quản lý trong Setup; phần CRUD sử dụng contract hiện có, không giả định có canvas CRUD độc lập chưa được cung cấp.

### Thành phần dùng chung và xác nhận giao diện

Native dialog dùng top layer/focus trap, Escape/backdrop, focus heading và trả focus khi đóng; dùng chung drawer/confirmation/discard states. `RecordFacts` trình bày cấu trúc dữ liệu server và exact values. Đã xem ảnh browser của Preview drawer, Review, receipt recovery, onboarding success và recipe timeline; kiểm tra mobile bằng Chromium. Đây là QA hình ảnh tại những trạng thái đã chụp, không phải chứng nhận pixel-perfect mọi trạng thái/viewport.

## Trạng thái nghiệm thu

Các phần FE current-contract nêu trên đã triển khai và có evidence mock/controlled tương ứng. Chưa đánh dấu toàn milestone COMPLETE khi live verification hoặc extension ngoài contract còn mở.

- M00: shared saved/budget/Run và stock/recipe repositories đã có; auth/invitation/import/recipe→Planning/PDF mock toàn phạm vi chưa thống nhất.
- M01/M02: giữ session semantics; recipient flow, privacy, lost ACK và chọn đúng Store đạt controlled browser. Public signup/reset request và decline chưa có contract.
- M03/M05: mapping filters/count và Preview drawer→Review→confirmation đã đạt kiểm tra. Raw cells/per-file aggregates còn là dữ liệu ngoài contract.
- M06/M07: canonical picker, receipt review/recovery/dirty close và recipe preview→confirmation→fresh timeline đã triển khai; chưa nghiệm thu mọi nhánh lỗi với BE thật.
- M08/M11: Saved UX, captured requirements, initial cap/create race/lost ACK đã có kiểm thử; profile/settings writers vẫn thiếu contract.
- M09: History pagination/filter-empty, retained Result và PDF alternative/download retry đạt controlled browser; export discovery mất locator chưa có API.
- M15: 350 unit/component/workflow tests và 22 browser tests đạt. Live acceptance và ma trận quyền/Store/fault toàn diện chưa hoàn tất.

## Kiểm chứng

- `npm run test:auth`: 26 passed.
- `npm run test:store`: 118 passed.
- `npm run test:import`: 99 passed.
- `npm run test:planning`: 77 passed.
- `npm run test:operations`: 30 passed.
- `npm run test:e2e`: 22 passed, gồm desktop mock, mobile Chromium và controlled API.
- `npm run build`: passed; cảnh báo bundle chính 985.53 kB minified (267.31 kB gzip), vượt 500 kB.
- `npm run lint`: passed, 2 cảnh báo set-state-in-effect tại OnboardingPages và RecipeSchedulePage; không có lint error.
- `check:import-wire`, `check:planning-wire`, `check:store-wire`, `check:operations-wire`: passed theo OpenAPI local.

Các ca kiểm tra N16 scope/wrong invitation, initial cap zero/create race/lost ACK, saved discovery→captured Run→archive, thông báo Underconstruction, và browser save→Run ngân sách 0. Browser bổ sung: Preview keyboard/focus/Review gate; credentials minimum và token scrubbing; invitation wrong account/expired/revoked/lost ACK→fresh Store selection; receipt known-write readback recovery; custom draft mode preservation/dirty close; History snapshot paging/filter-empty; PDF alternative/download retry. Unit mới kiểm tra fragment failure isolation và proof memory theo locator. Không dùng Today làm bằng chứng propagation tồn kho.

**LIVE_VERIFIED: NO.** Kiểm tra `http://127.0.0.1:18001/health` trong lượt 009 không kết nối được. Controlled API trong Playwright là intercept, không phải server BE đang chạy. Không có endpoint staging/credentials/deployment mới được bàn giao trong tài liệu.

Chạy lại bằng các npm scripts ở trên. E2E khởi động Vite tại 4173/4174. Mock reset khi reload; không dùng browser storage làm authority nghiệp vụ.

## Handoff

[009_TechDebt.md](009_TechDebt.md) chỉ giữ dependencies còn cần xử lý và phần FE/QA thực sự còn mở. Không sửa receipt 008 để biến kiểm chứng cũ thành kiểm chứng mới. Giữ các thay đổi và tài liệu WIP có sẵn trong worktree; chưa commit/push/deploy.
