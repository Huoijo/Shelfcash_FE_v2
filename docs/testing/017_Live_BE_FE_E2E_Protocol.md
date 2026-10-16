# 017 — Bộ ứng xử và tiêu chí kiểm thử E2E với BE live

**Ngày tạo:** 16/10/2026. **General Context:** chuẩn hóa cách kiểm thử Owner/Staff trên FE và BE thật, có bằng chứng, giữ đúng nghiệp vụ và truy vết mọi nhánh thiết kế. Đây là quy trình phải áp dụng cho một đợt test, chưa phải báo cáo nghiệm thu live.

## 1. Quy tắc agent trong `.agents`

Phần ứng xử được duy trì tại [live-be-fe-e2e/SKILL.md](../../.agents/skills/live-be-fe-e2e/SKILL.md). [AGENTS.md](../../AGENTS.md) yêu cầu agent đọc và áp dụng skill khi lập kế hoạch, chạy, debug hoặc đánh giá E2E với BE live. Skill chứa quy tắc vận hành và invariants; tài liệu này giữ checklist chi tiết, mẫu evidence và tiêu chí đánh giá để tham chiếu khi thực hiện. Không duy trì hai bản danh sách ứng xử song song.

## 2. Nguồn sự thật và phạm vi

- Nghĩa nghiệp vụ: quyết định đã được chấp nhận, [workflow hợp nhất](../../contracts/WORKFLOW.md) và tài liệu nghiệp vụ. Payload, quyền và lỗi cụ thể: OpenAPI đúng operation/snapshot; xác minh thêm với deployment đang test.
- UI/interaction: MagicPath project `458079658328604672`; kiểm tra revision mới nhất trước mỗi chiến dịch. Nếu revision thay đổi, lập diff và bổ sung node/edge/case trước khi so coverage.
- Runtime FE: checkout/build đang chạy, route và data source thật. [Hướng dẫn thao tác Owner/Staff](../guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md) là điểm bắt đầu cho nút/API, phải đối chiếu nhãn thật khi chạy.
- Theo [sprint 016](../sprints/016/016_Integration_Sprint.md), Import/SU01/Import R01 pin 016, các slice khác còn pin 011. Không lấy `info.version=1.0.0` làm bằng chứng mọi operation tương thích. `b0db90c` do BE báo và handoff `869eaec9` không tự chứng minh SHA deployment hiện tại.
- Phạm vi mặc định là toàn bộ surface trong project, gồm homepage, auth/onboarding, Store, invitation, Import hai vai trò, history, Menu/Recipe, Inventory, Planning setup/results và Today. Entry underconstruction vẫn phải được liệt kê cùng scope disposition; không tự mở lại feature đang tạm dừng.
- [FOUND_MISSING_UI.md](../FOUND_MISSING_UI.md) là register duy nhất cho thiếu thiết kế. Không tạo register “missing UI logic” thứ hai. Trạng thái IMPLEMENTED ở register chưa chứng minh live PASS.

## 3. Sổ coverage để không bỏ nhánh thiết kế

[Inventory khởi tạo](LIVE_E2E_DESIGN_INVENTORY.json) lấy trực tiếp catalog OWNER/STAFF từ MagicPath ngày 16/10/2026:

- OWNER component `460747146686242816`, revision `461110616439017472`: **160 entry**.
- STAFF component `460747115572916224`, revision `461109945690124288`: **149 entry**.
- **13 điều kiện scope**, áp dụng cho hai vai trò và bốn resolver: cần xét **104 tổ hợp role × resolver × scope**. Tổ hợp bất khả đạt phải có lý do nghiệp vụ cụ thể.
- **13 component** toàn project đã được liệt kê; Input legacy `458395069779681280` là reference bị thay thế, không dùng làm authority cho Input mới.

309 entry là mẫu số catalog Import, không phải 309 state nghiệp vụ độc lập. Giữ ID `role/surface/scenario`: `completed-ready` và `ready` cùng state `06-ready` vẫn có hai ngữ cảnh cần chứng minh. STAFF `03-spec-changed` xuất hiện ở hai surface cũng không được mất một entry khi deduplicate.

Inventory hiện có `caseIds=[]`, `status=NOT_RUN`, `edgeAuditStatus=PENDING`. Đây là danh sách cần phủ. Nó chưa liệt kê mọi control lồng nhau/transition hoặc state của các component ngoài Import. Các phần đó phải hoàn tất trước khi tuyên bố full-design coverage; 81 scenario DEV playground không thay thế mẫu số này.

Trước execution, tôi lập các sổ sau trong thư mục riêng cho run:

1. **Node:** mỗi state/variant của mỗi surface, role, revision; route/runtime component tương ứng, case ID, blocker nếu có. Audit cả code điều kiện render và preview; không chỉ màn mặc định.
2. **Control/edge:** mọi button/link/menu/tab/input/select/checkbox, mở/đóng drawer/dialog, submit/cancel/back/retry, điều kiện enable/disable và chuyển tự động. Mỗi edge có `from`, `trigger`, guard, operation hoặc “không gọi API”, pending, success, rejection và recovery. Edge không hợp lệ phải có case chứng minh bị chặn.
3. **Requirement/API:** mỗi yêu cầu nghiệp vụ và operation được dùng có case positive/negative, schema/permission/CAS/idempotency, đọc lại và evidence. Chức năng UI không gọi API cũng có expectation rõ ràng.
4. **Cross-cutting:** scope/role/browser/viewport/network/concurrency/accessibility và domain fixtures liên kết tới node/edge. Không lấy một happy path làm đại diện cho mọi tổ hợp.

Đi từng component từ entry tới mọi nhánh; kiểm tra tab phụ, menu ba chấm, footer, hover/focus, trạng thái rỗng/loading/error, pagination, tooltip, cảnh báo, deep-link, Back/Forward và route redirect. Từng control phải được gán case hoặc có lý do không áp dụng. Không để node không có đường vào, edge không có đích hoặc case không truy về requirement.

“Exhaustive” ở đây nghĩa là mọi nghĩa vụ trong baseline đã chốt đều được hạch toán và đánh giá. Không thể chứng minh mọi tổ hợp dữ liệu vô hạn hoặc mọi bug đều đã được thử. Dùng lớp tương đương và giá trị biên có ghi rõ; permission, data integrity, recovery và atomicity phải có case trực tiếp, không chỉ pairwise.

## 4. Điều kiện vào test và dữ liệu chuẩn

- Ghi run ID, FE SHA + dirty diff/build fingerprint, BE build/SHA nếu có bằng chứng, URL FE/BE, OpenAPI hash từng slice, thời gian/timezone, browser/version và thiết kế/revision. Không biết BE SHA thì ghi UNKNOWN và giới hạn kết luận, không đoán.
- Kiểm tra HTTPS/certificate, Origin/CORS, cookie/credentials, CSRF và phiên thật. Theo handoff, local deployment dự kiến dùng FE `https://localhost:5173`, BE `https://localhost:8103`; phải kiểm tra cấu hình đang chạy, không hard-code coi là đã đúng.
- Xác nhận `VITE_DATA_SOURCE=api`, API base URL đúng, không có mock adapter/service worker/route.fulfill tạo response giả. Health/OpenAPI đọc được chưa chứng minh job worker chạy được.
- Xác nhận quyền thực của Owner và Staff theo từng Store. Lưu snapshot grant đã che định danh nhạy cảm; đối chiếu cả UI và BE. Thiếu quyền không tự nâng quyền để làm case PASS.
- Dùng hai browser context tách cookie/storage. Owner và Staff cùng một Store test để bàn giao; nếu kiểm tra isolation thì thêm Store B/fixture được phép, phân biệt cả membership và đối tượng bên trong.
- Chuẩn bị namespace theo run, file SHA256, số file/sheet/dòng, schema, giá trị kỳ vọng và readback ban đầu. Mỗi case có tiền điều kiện xác định; không phụ thuộc thứ tự chạy ngầm.
- Chốt semantics nguồn: PNK là purchase history hay thực nhận; NCT là ngày gì; recipe quantity theo suất hay toàn yield; giá/MOQ theo pack hay base unit; ngày kiểm kê/timezone; calendar biểu thị sự kiện gì. Chưa rõ thì BLOCKED_DATA cho case liên quan, không đoán từ tên file.
- Tập dữ liệu gồm đủ 15 schema theo snapshot M03; mỗi schema có tối thiểu valid, thiếu required, invalid type/unit/date, duplicate/conflict, null/unknown và permission phù hợp. Layout không được hỗ trợ là negative case, không ép vào schema gần giống.
- Có oracle độc lập: số/giá trị trước–sau, rounding/rational conversion, ngày hiệu lực, provenance, version, tổng đóng góp và expected NO_OP. Không dùng chính hàm FE đang test để tính expected.
- Tạo dữ liệu riêng cho concurrency/stale/retirement/revoke/recovery để không phá case chuẩn. Ghi rõ cleanup được hỗ trợ; không xóa/replace file đã nhận hoặc unseal nếu BE không có API đó.

`npm run test:e2e` hiện chạy mock/controlled-api/production-parity theo [playwright.config.ts](../../playwright.config.ts). Không phải lệnh live acceptance. Một lần live cần cấu hình/harness riêng, trỏ deployment thật và giữ bằng chứng network; tài liệu này chưa tạo live runner.

## 5. Cách tôi chạy từng case

1. Kiểm tra tiền điều kiện bằng reader được phép; ghi baseline. Mở route bằng phiên đúng role, xác nhận Store và trạng thái thiết kế cần test.
2. Dùng đúng control mà người dùng thấy; ghi nhãn thực + accessible role/test locator ổn định. Không gọi API để nhảy qua bước UI rồi tính E2E PASS.
3. Kiểm tra trước thao tác: dữ liệu/evidence đúng scope; nút enable/disable đúng guard; không có cảnh báo bị che. Thử thao tác bị cấm theo negative case riêng.
4. Thực hiện một intent. Theo dõi operation/path/method, Store/import/entity IDs, payload, key/CAS/revision, response/receipt/job và thời gian. Bấm nhiều lần là case riêng.
5. Kiểm tra pending: khóa cạnh tranh, feedback/focus, không mất draft; success/error đúng thiết kế. Chờ điều kiện nghiệp vụ với timeout hữu hạn, không sleep tùy ý hoặc chờ vô hạn.
6. Đọc lại state BE có authority qua operation phù hợp. Kiểm tra dữ liệu ghi đúng và dữ liệu không được phép đổi vẫn giữ nguyên. Job cần terminal status nghiệp vụ, không chỉ HTTP thành công.
7. Refresh/reopen/deep-link và đọc bằng context còn lại khi có handoff. Phân biệt read model có độ trễ đã công bố với đọc chưa thấy thay đổi; hết deadline ghi rõ quan sát.
8. Ghi outcome, evidence, defect/blocker và hậu điều kiện. Chỉ chạy cleanup nằm trong scope và không làm mất bằng chứng. Không sửa code/fixture giữa run rồi gộp kết quả như cùng một build.

## 6. Nghĩa vụ theo từng đoạn flow

### Auth, session, onboarding và Store

- Mở protected URL → kiểm tra A03; bấm **Đăng nhập**, kiểm tra A01 rồi A03 xác nhận. Login success nhưng session read fail vẫn chưa được vào Store/Import.
- Sai credentials, session absent/expired, A03 network/5xx/invalid envelope; **Thử lại**, **Đăng nhập lại**, giữ return destination hợp lệ. Form login phải dùng được khi session check lỗi; không mắc vòng retry vô hạn.
- Logout/expire ở tab khác; refresh/back/deep-link; context cũ không tiếp tục mutation bằng auth/CSRF cũ. Không rò dữ liệu của phiên trước vào phiên mới.
- Chọn **Cửa hàng hiện tại**; zero/one/many Store, membership revoked/inactive, switch khi đang tải/đang sửa/đang ghi. Response Store A đến trễ không được ghi vào Store B.
- T03, signup A02 → A05 → A01, EMAIL_VERIFY, SETUP/RESET và invitation là các lifecycle riêng. Test invalid/expired/used/revoked token, identity mismatch, resend/rate limit nếu được contract hỗ trợ. Không coi signup tự tạo session/Store/Owner.
- FM-013/014/015 còn thiếu thiết kế; A02/A05/T03/NF chưa có đầy đủ runtime UI. Giữ BLOCKED_DESIGN/FE theo nhánh; không dựng màn mới để hoàn tất test.

### File, admission và analyze — I01/I02/I03/I04/J01

- Bấm chọn/kéo file, tạo draft, upload; zero/one/many, đúng/sai format, rỗng/corrupt, Unicode tên file, duplicate, vượt giới hạn file/byte/batch theo contract. Kiểm tra accepted/rejected receipt từng file và tổng authoritative.
- Partial accepted: nhánh can-continue/must-resolve, retry riêng file bị reject, thay intent khi rejection đã xác nhận. Không upload lại file đã được nhận để thay bytes.
- Mất ACK upload: checking/confirmed/unknown; đọc retained state và khóa thao tác có thể ghi trùng. Accepted source set phải đúng các receipt đã chọn/acknowledge trước seal/analyze.
- Bấm analyze theo UI: running/progress/complete/failed/provider unavailable, reload/resume job. Manual resolution vẫn có đường đi khi provider thất bại nếu nghiệp vụ cho phép.
- Source evidence/locale/period/custom/amendment, invalid/missing/conflicting context; no-profile/ambiguous/drift/retired. Không lấy filename làm bằng chứng nguồn hoặc tự bỏ sheet không nhận dạng.

### Resolve 3A/3B/3C/3D — M01/M02/M03/M04, SU01 và reader liên quan

- Mở từng drawer từ overview, chọn file/sheet/category, phân trang/**tải thêm**/**vấn đề tiếp theo** đúng nhãn thực. Test đủ 13 scope condition; current page sạch không có nghĩa toàn batch sạch.
- Mapping: view/edit/manual/duplicate target/explicit IGNORE/save failed/saved; source_only được hỗ trợ khi descriptor available. `needs_confirmation` có target là proposal phải review; `profile_proposals=[]` không làm mất column suggestions.
- Identity: no match/one/many/ambiguous/selected/inactive, q Unicode/blank/special characters, signed cursor/snapshot, hết trang/repeated cursor/stale snapshot. SU01 phải kiểm tra `supplier.read`; Product/Ingredient dùng quyền reader riêng. Không auto-bind từ tên giống hoặc response cũ đến muộn.
- Create proposal: metadata/duplicate/permission/validation/failure/cancel. ACK proposal chưa chứng minh entity đã tồn tại hoặc đã bind. Nhánh created+bound thiếu capability phải được ghi blocker riêng.
- Declarations: missing/typed invalid/zero/null/unknown, batch-only/reusable, source-value/replacement/evidence/ack/reason, permission/save fail. Không tái dùng evidence cột khác hoặc tự chuyển scope reusable.
- Units: compatible/exact/needs/unsupported; numerator/denominator, zero/negative/non-finite/precision theo contract, evidence và units đúng pair. Không suy density/pack/yield bằng sample hoặc float làm mất tỷ lệ chính xác.
- Mọi M04: saving/failed/uncertain/checking/saved/unknown/confirmed-not-saved, CAS conflict và current permissions. Nhánh “not saved” chỉ PASS khi có bằng chứng negative đủ authority; retained state không đổi một mình là chưa đủ.

### Profile và handoff — N5, MQ01/MQ02/MQ03/NF khi runtime hỗ trợ

- Owner đọc changed-only lẫn full spec, first/existing/staff/self proposal; không có reusable change thì không tạo version giả.
- Full spec hợp lệ, missing_fields rỗng và RULE đủ điều kiện có thể approve chung; kiểm tra RULE issues chuyển auto_mapped. Không bắt phải resolve riêng mọi RULE trước duyệt.
- Bấm quyết định được UI hỗ trợ: approve/activate/reject/retire; request_changes theo scope đã tích hợp. Thiếu field/evidence/reason/ack, changed/already handled/retired/permission và hai Owner quyết định cạnh tranh phải có case.
- Staff không được quyết định reusable profile, cả UI lẫn direct API negative probe. Owner được duyệt đề xuất mình tạo. Approval không cấp quyền commit.
- Staff submit → Owner queue/detail/evidence → quyết định → Staff đọc lại; withdraw/request_changes/resubmit, nhiều profile, stale eligibility, notification deep-link, revoked grant và lost ACK phải được hạch toán.
- MQ/NF API đã có không có nghĩa FE có đủ lifecycle. FM-016 và FM-015 giữ nhánh bị chặn; manual handoff chỉ chứng minh manual flow, không thay thế auto queue/notification E2E.

### Preview và domain decisions — I05 và các reader phụ thuộc

- Clean/warning/blocked/stale; đọc đủ coherent pages với mapping_revision/read_set_digest/source_evidence_digest/snapshot đúng. Reload, đổi filter, page errors và dữ liệu thay đổi giữa trang phải giữ pin hoặc yêu cầu refresh đúng workflow.
- Đối chiếu số dòng/count/aggregate/effect với nguồn và baseline. Null/unknown/unavailable phải hiện đúng nghĩa; không suy stockout=false từ qty=0.
- Sales: same contribution correction/replacement, disjoint contribution, thiếu evidence, conflict, permission/save fail. Sau commit không cộng đôi và không thay contribution khác.
- Supplier terms/fees: changed/effective date/overlap/pack/base unit/missing costs/permission/failure. Không suy missing cost thành zero hoặc purchase history thành current terms.
- Inventory: opening/count/correction/actual receipt khác nhau; timestamp/timezone/observed date/concurrent movement và stale version. Purchase history không tăng stock; usage history không tự trừ stock.
- Recipe: per-serving/whole-yield, yield/loss, units/effectivity/version và partial recipe; không nối sheet tùy ý. Calendar/promotion/history không tự trở thành weather/uplift/BOM/forecast feature.
- Domain decisions được gửi cùng commit theo contract; không yêu cầu API lưu Preview riêng vốn chưa có. Cancel/Back/reload phải phản ánh đúng mức lưu thực tế, không thông báo đã persist khi chỉ có local intent.

### Review, commit, completion và Readiness — I05/I06/J01/R01

- **Xác nhận Review** là mutation riêng có retained confirmation và pin. Chưa confirm/confirming/failed/uncertain/confirmed/expired/permission đều có case; không coi mở Preview là đã xác nhận.
- Chỉ bấm commit khi confirmation usable, tất cả required_actions đủ và domain blockers hết. Đổi mapping/source/profile/read-set hoặc expiry sau confirm phải chặn stale intent.
- Reason omitted/null được BE cho pure inserts/NO_OP; correction/amendment vẫn yêu cầu justification. FE fallback bắt reason mọi trường hợp là FM-003, không đổi thành policy BE và không ghi full UI parity PASS.
- Commit: double-click, concurrent tab, replay cùng key/body, khác body cùng key, CAS stale, retired profile, grant revoked, timeout/5xx/lost ACK. Kết quả thành công phải có retained I06/receipt và số liệu canonical đúng.
- Atomicity: batch có một phần invalid hoặc concurrent conflict không được ghi dở phần còn lại. Xác minh tất cả miền bị ảnh hưởng, không chỉ dòng lỗi/toast; NO_OP không sinh tác động dữ liệu mới ngoài audit hợp lệ.
- Completion ready/not-ready/warnings/receipt reload là state riêng. Import completed không đảm bảo Readiness hoặc Planning thành công.
- R01: not-assessed/selecting/loading/ready/not-ready/unknown/unavailable/permission, date/cutoff/scope/default-vs-custom và warning variants. Planning cần đủ `planning.context.read`, `budget.read`, `procurement.cost.read`; bỏ từng grant để kiểm tra độc lập.
- R01 fail không làm mất hoặc rollback completion. Không gọi lại commit để chữa Readiness.

### Các surface còn lại của project

- Homepage/navigation: mọi CTA, route/deep-link, public/protected, redirect và auth return; link không được đi nhầm context hoặc mở chức năng tạm dừng như đã dùng được.
- Store workspace: settings/budget/membership/grants/invitation/activity có validation, current rights, CAS, replay và refresh. Budget=0 khác chưa khai báo. Invitation chỉ gửi tới recipient test thuộc scope.
- Menu/Recipe/Inventory: listing/search/filter/sort/page/empty/error/detail/edit/cancel/save nếu control tồn tại, corrections/effectivity/source/version; độc lập quyền đọc/ghi. Imported facts phải đọc lại đúng màn này.
- Planning setup/results/history: audit mọi control thiết kế; C01/R01/C02/C03/C04/C05/C08 và operation PDF/history đúng snapshot. Run/capture/results retained không đổi khi nguồn mới đổi; chạy mới cần intent mới. Kiểm tra budget known/unknown/zero, readiness, model/fallback cause, infeasible/no supplier/no cost, permissions, job và PDF retry/expiry khi hỗ trợ.
- Import history/Planning history/activity: paging/filter/detail/deep-link/permission/retained evidence và unknown item; không lộ batch/run của Store khác.
- Today/AI/What-if/Draft PO và global queue đang underconstruction: đối chiếu [scope đang tạm dừng](../status/Underconstruction_by_BE.md). Kiểm tra entry thông báo đúng và không gọi writer chưa bật; nghiệp vụ bên trong ghi DEFERRED_SCOPE có tham chiếu, không PASS.
- Inventory hiện tại chưa enumerate nested states/edges ngoài Import. Phải audit các component này trước full-app exit; danh sách trên là nghĩa vụ audit, không phải kết luận đã phủ.

## 7. Bộ biến thể ngang bắt buộc

Áp dụng theo operation/guard thực, không giả định API nào cũng có mọi HTTP code:

- **Quyền:** Owner/Staff; có/thiếu từng grant; read-only; quyền bị thu hồi sau load/before submit/in-flight; membership đổi; cross-Store/path/body/entity/cursor substitution; object không tồn tại so với không được đọc, không leak nội dung qua error.
- **Dữ liệu:** empty/min/typical/max/max+1 theo contract; trim/Unicode/duplicate; integer/decimal/precision; null/absent/zero/false/unknown; enum lạ/field dư; invalid date/leap day/day boundary/timezone; units/pack/yield/effectivity boundary.
- **Network:** offline trước send, request chậm, response chậm/out-of-order, read fail, mutation response mất sau BE áp dụng; retry đúng operation. Tách trước-send và after-apply, không gọi chung là timeout case.
- **Lỗi:** validation FE; envelope/domain rejection; 401/403/404/conflict/stale/validation/rate-limit/5xx nếu operation có; response non-JSON/malformed/missing pins; terminal job failed/cancelled/unknown và polling timeout. Mã chưa biết phải fail closed ở quyết định ghi, có feedback/fallback đã thiết kế, không crash hoặc tự success.
- **Concurrency:** hai role, hai tab, hai reviewer; duplicate click; navigation/Store switch/refresh trong pending; stale response không ghi đè state mới; cancel request phía FE chưa chứng minh BE cancel.
- **Persistence:** Back/Forward/reopen/refresh/new context; draft local khác persisted; acknowledged result đọc lại; resumed locator chỉ là định danh, không thay quyền hoặc tái dựng intent bị mất từ trí nhớ.
- **UI:** desktop/mobile theo viewport thiết kế; overflow/long text/large data; focus/keyboard/Enter/Escape/tab order/dialog return focus; readable validation, loading, disabled reasons, feedback screen reader và tương phản. Chỉ kiểm tra breakpoint/interaction thực có; thiếu product design ghi FM phù hợp.
- **Hiệu năng:** đặt trước SLO từ yêu cầu hoặc baseline đồng thuận; đo read/upload/job/render/paging với kích thước dữ liệu đã ghi, polling hữu hạn, không request storm hoặc memory tăng liên tục. Chưa có SLO thì báo số đo, không tự đặt threshold rồi nghiệm thu.

Lập error register theo **operation + transport/status + domain code + UI catch point + recovery + data effect**. Lấy enum/mã từ contract, BE evidence và lỗi quan sát; giữ một case unknown-code. Không khẳng định đã biết trước “mọi lỗi tương lai”.

## 8. Ứng xử khi gặp lỗi và mutation chưa rõ kết quả

1. Chụp state/trace/network đã lọc, note thời điểm/role/Store/intent và expectation. Không bấm tiếp liên tục để “xem có hết không”.
2. Phân loại read hay write; request chưa gửi, bị BE reject chắc chắn, ACK success, hoặc outcome unknown. Transport error không tự là rejection.
3. Nếu read lỗi: retry có giới hạn khi UI/contract cho phép, giữ scope/pin; không lấy response của scope khác làm fallback.
4. Nếu write có receipt: đọc receipt/retained state/job phù hợp. Readback fail sau receipt đã biết không mở lại cùng writer như một thao tác mới.
5. Nếu write unknown: giữ exact key/body/CAS/pins trong cơ chế được hỗ trợ. Readback hoặc same-intent replay chỉ theo quy tắc của operation và runtime có khả năng giữ intent; không đoán key/body sau logout/reload/switch.
6. Không có endpoint tổng quát chứng minh một mutation mất ACK chưa xảy ra. “Vẫn chưa thấy đổi” không đủ để unlock competing writer hoặc tạo key mới. Nhánh không thể chứng minh giữ UNKNOWN/BLOCKED và ghi limitation.
7. Nếu phát hiện data integrity/security issue: đóng băng evidence và namespace liên quan, ngừng writer phụ thuộc, mở defect P0/P1; không cleanup làm mất dấu vết. Không tự reset worker/DB để làm test qua.
8. Nếu cần sửa FE/BE/design: tách implementation khỏi verification. Run lại case lỗi và tập case bị ảnh hưởng trên build mới; giữ evidence build cũ, không ghi đè lịch sử.

Fault injection có nhãn riêng: request chặn trước BE; pass-through để BE áp dụng rồi làm mất response; response JSON giả từ mock. Case after-apply cần bằng chứng BE đã nhận/áp dụng. Chỉ mock response thành công không chứng minh idempotency live. Các test hybrid có ích nhưng phải báo riêng với live không can thiệp.

## 9. Tiêu chí đánh giá và mức nghiêm trọng

**PASS:** đúng tiền điều kiện/role/build; thao tác FE đúng design; request và guard đúng contract; pending/error/recovery đúng; canonical/readback đúng oracle; không tác dụng phụ ngoài scope; có evidence. Với negative case, BE từ chối đúng và không ghi cũng là PASS.

**FAIL:** quan sát lệch expectation có authority, gồm UI không đi được dù capability/design đã có, API sai, dữ liệu sai, quyền sai, stale/duplicate writes hoặc thiếu bằng chứng bắt buộc sau một execution tuyên bố thành công.

**BLOCKED_ENV / BLOCKED_DATA / BLOCKED_CONTRACT / BLOCKED_DESIGN / BLOCKED_FE / BLOCKED_BE:** tiền điều kiện/capability cần thiết chưa đủ để đánh giá nhánh. Ghi root cause, dependency, owner xử lý và case còn bị ảnh hưởng. Một tính năng đã cam kết hoạt động nhưng đang lỗi phải mở FAIL/defect tương ứng; không giấu dưới BLOCKED.

**NOT_RUN:** chưa thực hiện; **DEFERRED_SCOPE:** ngoài phạm vi được chốt, có nguồn quyết định; **NOT_APPLICABLE:** tổ hợp không thể xảy ra, có chứng minh guard/semantics. Không dùng N/A để né thiếu tài khoản/dữ liệu/design.

- **P0:** truy cập/ghi trái Store hoặc lộ credentials; hỏng canonical diện rộng; atomicity/idempotency vỡ gây ghi trùng hoặc dở lô. Dừng writer liên quan ngay.
- **P1:** sai semantics/số tiền/tồn/recipe, quyền mutation sai, sai approval/confirmation/commit, không thể phục hồi intent an toàn hoặc chặn core flow không workaround hợp lệ.
- **P2:** chức năng phụ/recovery/validation hoặc fidelity ảnh hưởng đáng kể nhưng không gây sai dữ liệu; severity theo tác động thực, không theo HTTP code.
- **P3:** lệch nhỏ về trình bày/copy không ảnh hưởng nghĩa/thao tác. Nếu che action/evidence hoặc đổi nghĩa giá trị thì nâng mức theo tác động.

Không dùng điểm trung bình để bù một lỗi phân quyền/atomicity bằng nhiều màn đẹp. Data integrity, authorization và core business gates là điều kiện chặn độc lập.

## 10. Bằng chứng và báo cáo mỗi run

Mỗi case phải ghi đủ:

```text
case_id / requirement_ids / design_node_ids / design_edge_ids
run_id / FE build fingerprint / BE evidence / OpenAPI hashes / design revisions
mode: live | live-with-fault-injection | controlled | mock | API-only
role / current grants / Store alias / data namespace / file hashes
preconditions / independent expected before-and-after
steps: route → control label/locator → exact action → expected state
operations: method/path/operationId, sanitized request, key/CAS/pin aliases
responses: status/domain code/receipt/job alias; chronological observations
readback: authority used, expected/actual, unrelated effects checked
UI: screenshot/trace, focus/responsive/error/recovery observations
outcome / severity / defect or blocker / cleanup / evidence references
```

Kết quả API-only negative probe bổ sung bảo mật nhưng không thay thao tác UI. Không copy cookie/token vào template. Mỗi retry giữ attempt history; case chỉ pass sau retry vẫn phải nêu intermittent defect nếu có.

Báo cáo cuối ghi scope đã chốt, environment, case totals theo outcome/mode/role/surface, blocker/defect, cleanup và các giới hạn. Tách bốn số:

- **Accounting:** bao nhiêu nghĩa vụ đã có case hoặc disposition hợp lệ / tổng baseline. BLOCKED có thể được hạch toán nhưng chưa được kiểm chứng.
- **Execution:** bao nhiêu nghĩa vụ đã thực hiện live / tổng in-scope baseline. NOT_RUN/BLOCKED nằm trong mẫu số. Một case map nhiều node phải có assertion/evidence cho từng node.
- **Acceptance:** bao nhiêu nghĩa vụ live PASS / tổng in-scope baseline; FAIL và BLOCKED không thành PASS.
- **Coverage riêng:** node, control/edge, requirement/API, quyền và dữ liệu biên. Không gộp chúng thành một phần trăm gây hiểu nhầm.

Baseline 309 là catalog entries Import; scope combinations và nested edges có mẫu số riêng. Non-Import chưa enumerate thì báo UNKNOWN/PENDING, không suy coverage 100% từ việc 13 component đã có tên.

## 11. Điều kiện kết thúc

Một run có thể kết thúc và bàn giao báo cáo dù đang bị chặn. Chỉ tuyên bố **full in-scope live acceptance** khi đồng thời:

- Revision/build/contract được khóa và mọi thay đổi giữa run đã reconcile; toàn bộ component/state/control/edge trong scope được enumerate, không còn unclassified/orphan.
- 100% node, edge/guard, requirement/operation và nghĩa vụ bắt buộc có live evidence PASS; tổ hợp N/A có căn cứ, deferred có quyết định scope, không âm thầm thu mẫu số.
- Hai vai trò đều có hành trình đầu–cuối qua UI; handoff phối hợp thực được kiểm chứng trong phạm vi tuyên bố. Manual flow không chứng nhận MQ/NF chưa tích hợp.
- Mọi schema trong phạm vi có oracle dữ liệu trước–sau; correction/atomicity/idempotency/current permission/cross-Store/stale/unknown-outcome đã kiểm chứng theo cơ chế có thật.
- Không còn FAIL, BLOCKED hoặc NOT_RUN trong phạm vi được tuyên bố accepted. Không còn defect P0/P1 mở ảnh hưởng scope; ngoại lệ được chấp nhận chỉ tạo nghiệm thu có điều kiện, không gọi full PASS.
- Không còn thiếu thiết kế hoặc fallback chưa reconcile ảnh hưởng scope. Review [FOUND_MISSING_UI.md](../FOUND_MISSING_UI.md), giữ đúng trạng thái và link evidence; test pass riêng không tự đóng FM.
- Evidence được lọc bí mật, truy vết được; dữ liệu test còn lại/cleanup/dependency được bàn giao rõ ràng.

**Trạng thái lúc lập tài liệu:** chưa chạy BE live; 309 catalog entry và 13 scope condition đều NOT_RUN; edge audit và state audit ngoài Import còn PENDING. Không tạo UI mới, không đổi policy, không thực hiện business mutation. FM-001–016 giữ nguyên đánh giá hiện hành; đây là coverage debt cần hạch toán, không có gap thiết kế mới được xác nhận trong pass tài liệu này.
