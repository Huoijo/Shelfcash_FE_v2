# #008 — Audit MagicPath và checklist milestone E2E

- **ID:** `#008`.
- **Ngày tạo:** 12/10/2026.
- **General Context:** MagicPath đã bổ sung flow nghiệp vụ vào nhiều workspace. Cần nâng cấp theo từng flow hoàn chỉnh: FE tự kiểm thử bằng mock, cùng giao diện và workflow có thể chuyển sang API thật mà không viết lại.
- **Design:** [MagicPath ShelfCash](https://www.magicpath.ai/files/458079658328604672), project `458079658328604672`, 12 component; project cập nhật `2026-10-12T14:17:34.120Z`.
- **Code baseline:** commit `9b5e31e`; snapshot audit ngày 12/10/2026.
- **Phạm vi lần này:** đọc project, source của đủ 12 component cùng các màn/overlay nhúng, đối chiếu routes, adapters, workflows, fixtures và OpenAPI trong repo. Đây là audit tĩnh và kế hoạch triển khai; không phải chứng nhận visual pixel-perfect, browser E2E của toàn bộ design mới hay kết nối BE live.

## 1. Kết luận audit

**Không chỉ là thay CSS.** Design mới thêm vòng đời nhận hàng, công thức, duyệt mapping, lời mời, lịch sử kế hoạch và PDF. Có phần đã có API nhưng FE chưa nối; có phần design chưa có contract tương ứng.

**Nền tảng hiện có có thể tái sử dụng:** Auth/Store gate, HTTP cookie/CSRF, phân quyền, đọc Kho/Menu, nhập file và continuation, lịch sử nhập, Planning core, quản lý Staff/lời mời phía Owner và cập nhật trần ngân sách đã có các boundary/workflow tương ứng. Không viết lại toàn bộ.

**Mock hiện có chưa phải một sản phẩm E2E nhất quán:** auth mock bỏ qua đăng nhập thật; form login bị vô hiệu hóa trong preview; Kho/Menu là fixtures đọc; Import là kịch bản kiểm kê cố định không parse file; Store và Planning có trạng thái mock riêng. Chưa có dữ liệu dùng chung bảo đảm import/nhận hàng/công thức làm đổi các workspace liên quan, chưa có đủ role/scenario để QA toàn bộ design.

**Thứ tự Import cần sửa tiếp:** design mới là Nhập file → Ghép cột → Xem trước dữ liệu → Kiểm tra trước khi nhập → Xác nhận ghi → Hoàn tất. Code hiện có bước “Xem lại trước khi Preview”, rồi gom preview/review/commit vào một màn. Việc bỏ khóa/chốt tập file ở lượt trước chưa hoàn tất cập nhật này.

Quy ước mọi checkbox dưới đây là **công việc/tiêu chí cần nghiệm thu**, không đánh dấu hoàn tất chỉ vì source hoặc fixture đã tồn tại. `BE_READY` và `LIVE_VERIFIED` là hai trạng thái khác nhau.

## 2. Snapshot design đã đọc

Các ID dưới đây cùng thuộc link MagicPath ở đầu file. Revision được chốt lúc audit; trước khi bắt đầu milestone cần kiểm tra revision có đổi hay chưa.

- **D01 — Homepage:** component `458083907045322752`, revision `458087405988220928`. Landing, CTA bắt đầu/đăng nhập, xem cách hoạt động.
- **D02 — Đăng nhập/Đăng ký:** `458185906336202752` / `458185906336202753`. Tabs tài khoản, nhớ đăng nhập, mật khẩu, recovery entry.
- **D03 — Nhận lời mời nhân viên:** `460368412145782784` / `460368412145782785`. Chưa đăng nhập, cần tài khoản, sẵn sàng nhận, đang nhận, thành công, sai tài khoản, hết hạn, thu hồi, đã nhận, không hợp lệ, từ chối.
- **D04 — Cửa hàng:** `459953227023159296` / `460391466682978304`. Thành viên/quyền, lời mời và hoạt động quản trị; drawer sửa quyền, dirty/save/failure/conflict/readonly, reissue/revoke và empty/loading/error states. Code mới của component tập trung vào quản trị quyền; không coi các tab Tổng quan/Thiết lập chỉ xuất hiện trên chrome là bằng chứng đã có flow lưu profile.
- **D05 — Nhập/Ghép cột:** `458395069779681280` / `460377695235239936`. Bên trong có Upload, Mapping, MappingApprovalFlow, ImportFinalSteps và History. Gồm Staff gửi/chờ/sửa đề xuất, Owner queue/review/approve/reject/retire; preview theo nhóm dữ liệu, row drawer; review/blockers; confirm/processing/long/failure/completion.
- **D06 — Lịch sử nhập:** `458255053002780672` / `458402037797892096`. Calendar, bộ lọc loại/trạng thái/tên file, kiểm tra lô theo ngày.
- **D07 — Hoàn tất:** `458406500038234112` / `460373317438836736`. Summary, đích dữ liệu, readiness và CTA. Tên component ghi “Bước 3/3”, nhưng source màn vẫn có “Bước 5/5”; xem G01.
- **D08 — Kho:** `458590758262427648` / `460380078610739200`. List/detail/lots/movements và ReceiveGoodsFlow: empty/filled/validation/existing-batch/confirm/processing/success/failed.
- **D09 — Menu:** `458614109248847872` / `460387221950861312`. Recipe hiện tại/kế tiếp, timeline, historical/scheduled detail, create/edit-scheduled, validation/conflict, diff preview/confirm/processing/success/failure.
- **D10 — Planning setup:** `458414835571515392` / `460389532173471744`. Readiness ready/warnings/blocked; queued/running/long/completed/no-feasible/failed. Có PlanHistory và các trạng thái lịch sử.
- **D11 — Planning result:** `458423352311304192` / `460389548950720512`. Overview, ingredients, alternatives, scenarios, chart/explanation, AI, Draft PO; thêm Export overlay confirm/queued/running/long/ready/failed/existing/unavailable và historical run.
- **D12 — Hôm nay:** `458632053018234880` / `458637450923900928`. Readiness, attention, quyết định đang chờ, tín hiệu vận hành, outlook 7 ngày và contextual AI.

Lưu ý: prototype switcher, setTimeout tự thành công, số liệu cố định và phép cộng stock ở design chỉ minh họa tương tác. Không đưa chúng vào API mode như nghiệp vụ thật.

## 3. Quy tắc hoàn thành một milestone

Mỗi milestone có một flow đi tới kết quả cuối, không chỉ một trang render được.

- [ ] **UI:** bám đúng revision đã chốt, đủ loading/empty/error/readonly/conflict và các state đặc thù; desktop/mobile, bàn phím, focus, Escape và reduced motion hoạt động.
- [ ] **MOCK_E2E:** QA khởi chạy không cần BE, chọn được scenario, thực hiện bằng UI, quan sát kết quả ở lần đọc tiếp theo; mock được gắn nhãn và reset được.
- [ ] **BE_READY:** cùng components/workflow, adapter thật có method/path/query/body/header/response validation, quyền, pagination, CAS/idempotency và retry đúng contract. Không còn placeholder handler ở happy path được cam kết.
- [ ] **API_PARITY:** chạy cùng ca nghiệp vụ với controlled HTTP responses qua adapter API; kiểm tra request thực sự được gửi, thứ tự, lỗi và kết quả. Mock trả object nội bộ đơn thuần không đủ chứng minh wire compatibility.
- [ ] **LIVE_VERIFIED:** chạy browser với BE phù hợp, đọc lại dữ liệu đã ghi và lưu evidence. Nếu BE chưa có/chưa truy cập được, ghi rõ chưa xác minh; không gộp vào MOCK_E2E.
- [ ] **HANDOFF:** có sample input, fixture/scenario IDs, test command, quyền cần có, API mapping, limitation và cách FE/BE chạy lại.

Nếu có gap contract chưa chốt, milestone có thể hoàn tất nhánh UI/mock nhưng **không được đánh dấu BE_READY hoặc hoàn tất toàn bộ**. Không dùng mock để che khoảng trống đó.

## 4. Checklist milestone theo flow E2E

### MP-M00 — Nền tảng mock dùng chung và ranh giới API

**Ưu tiên:** P0, làm trước các milestone mở rộng. **Chủ trì:** FE; BE review schema.

**Flow nghiệm thu:** mở app không BE → chọn Owner/Store A → chọn một scenario → đi qua Import, Kho, Menu, Planning → kết quả liên quan nhất quán → chuyển Staff/Store B → dữ liệu/quyền được cách ly → reset scenario.

**Hiện có:** `src/app/config.ts`, các `*.data.ts`, `*.fixtures.ts`, workflows và validators; chưa có scenario repository xuyên feature.

- [ ] Giữ `VITE_DATA_SOURCE=mock|api` và `VITE_API_BASE_URL`; mock chỉ DEV, không API→mock fallback. API không import seed để lấp response thiếu.
- [ ] Tạo một mock repository dùng chung, scoped Store/actor; dùng UUID canonical, exact decimal text, date/timezone/version và quyền nhất quán cho mọi adapter.
- [ ] Tạo DEV-only scenario picker: Owner, Staff, thiếu quyền, 0/1/nhiều Store; status/error/delay/stale/lost-response được chọn lặp lại, không chỉnh source để demo.
- [ ] Dữ liệu sau mutation phải xuất hiện khi đọc lại: import→Kho/Menu/History; receipt→lots/movements/Today; recipe→timeline/context; plan→History; invitation→membership/events.
- [ ] Chốt cách demo reload/resume: đề xuất snapshot **chỉ dữ liệu giả** trong sessionStorage có namespace/version/reset; không lưu password, token, CSRF, File bytes hoặc dữ liệu API. Chưa triển khai thì phải ghi rõ mock reset khi reload và cung cấp seed resume tương đương, không claim đã test persistence.
- [ ] Tách dữ liệu wire giả, response validators và view models; chạy fixture hợp lệ qua cùng boundary validation. Không bắt buộc thay thư viện/network layer nếu kiến trúc hiện có đáp ứng.
- [ ] Có test framework browser được commit vào repo và script chạy E2E mock; các script tạm trong `/tmp` không phải bộ kiểm thử bàn giao.
- [ ] Mỗi scenario có ID, seed, bước tái hiện, expected result, reset và danh sách API thật tương ứng. Một nút reset không thay dữ liệu môi trường API.

**Mock tối thiểu:** `owner-ready`, `staff-importer`, `staff-readonly`, `multi-store`, `no-store`, `empty-store`, `transport-error`, `revision-conflict`.

**BE boundary:** dùng adapters hiện có; lấy [OpenAPI V2](../../../contracts/history/v2/generated/openapi.json) làm wire baseline, [HTTP helper](../../../src/shared/http/httpClient.ts) làm đường gọi chung. FE không tự tính BOM/FEFO/forecast/khả thi/selection.

### MP-M01 — Trang công khai → đăng nhập → Store → phiên làm việc

**Ưu tiên:** P0. **Phụ thuộc:** MP-M00. **Design:** D01/D02 và shared shell. **Chủ trì:** FE.

**Flow nghiệm thu:** Homepage → Đăng nhập → xác minh session → chọn Store → mở đúng deep link → reload còn session → logout → protected route không còn hiển thị dữ liệu.

**Hiện có:** A01/A03/A04, T01/T02, AuthGuard/StoreGate và Store selector; auth mock hiện không cho thao tác login như người dùng.

- [ ] Audit CTA/navigation/shell của 12 màn; giữ một AppShell, trạng thái active theo URL và layout responsive thống nhất.
- [ ] Mock hỗ trợ hành vi login/logout/expiry/role thật sự ở mức mô phỏng; không gọi BE, không dùng credentials thật, không bật auth bypass ở production.
- [ ] Xử lý invalid credentials, session unavailable, no-Store, multi-Store, permission revoked; hủy/loại response cũ khi đổi Store/session.
- [ ] Return destination dùng allowlist nội bộ; bổ sung entry invitation/credential ở MP-M02, không chấp nhận open redirect.
- [ ] Tách “Đăng ký” và “Quên mật khẩu” khỏi login: public registration/reset-request chưa có API; N7 là hoàn tất credential từ token được cấp, không phải signup.

**API:** A01 `POST /auth/login`, A03 `GET /auth/me`, A04 `POST /auth/logout`; T01/T02 `GET /stores[/{store_id}]`, tất cả dưới `/api/v1`. Cookie/Origin/CSRF theo AUTH V2; chỉ A03 xác nhận phiên hiện hành sau login, logout204 không parse JSON.

**Mock/test:** valid/invalid login, timeout, expired session, 0/1/nhiều Store, revoked grant, unauthorized deep link. **Kết quả:** không lộ dữ liệu Store/actor cũ, không vòng lặp redirect.

### MP-M02 — Owner mời Staff → Staff nhận → quyền và audit cập nhật

**Ưu tiên:** P0. **Phụ thuộc:** MP-M00/01. **Design:** D03/D04. **Chủ trì:** FE; BE chốt G02/G03/G04.

**Flow nghiệm thu:** Owner mở Thành viên → chọn quyền/mời → xem lời mời → Staff mở link, đăng nhập đúng tài khoản, đọc offer và chấp nhận → refresh session/Stores → vào Today đúng Store → Owner đọc lại membership và hoạt động. Nhánh khác: sửa quyền/reissue/revoke và conflict.

**Hiện có:** N12/N13/N15/N16/N17 phía Owner; thiếu route/adapters N18/N19, credential completion N7 và activity N14 ở FE.

- [ ] Match sub-tabs Thành viên/Lời mời/Hoạt động, drawer read/edit/save/unsaved/conflict và Owner readonly core grants; không suy quyền từ nhãn vai trò.
- [ ] Bổ sung N14 permission events và N16 `view=events` cho invitation events; phân trang/filter đúng query được hỗ trợ, hiển thị before/after/reason/actor khi được trả.
- [ ] Mời/reissue/revoke giữ đúng receipt/version/idempotency; delivery queued/delivered không đồng nghĩa Staff đã có quyền. Accepted invitation quản lý qua membership.
- [ ] Tạo route nhận lời mời ngoài StoreGate: account chưa có membership vẫn phải đọc/accept được sau xác thực. Chốt route FE và link format trong handoff.
- [ ] Đọc token từ fragment theo contract, xóa khỏi URL trước request; N18 dùng `X-Invitation-Token`, N19 body token, no-referrer; không lưu/log token.
- [ ] Account mismatch không hiển thị Store/grants/email đích bị server từ chối; expired/revoked/invalid/already accepted xử lý đúng reason, không cấp quyền lại.
- [ ] N7 credential completion: token riêng, password12–128 Unicode characters theo contract; thành công quay về login, không tự nhận có session. Design “ít nhất8 ký tự” phải sửa đúng boundary này.
- [ ] Sau accept dùng A03/T01/T02 để lấy quyền và Store hiện hành; cập nhật Owner list/events bằng re-read, không cộng membership lạc quan.
- [ ] Nút Từ chối và đăng ký công khai chỉ trở thành flow thật sau G02/G03; không tự gửi `accept:false` vì OpenAPI type là boolean trong khi AUTH mô tả `accept:true`.

**API:** N12/N13 membership/permissions; N14 `GET /stores/{store_id}/permission-events`; N15/N16/N17 staff-invitations; N18 `GET /staff-invitations/{invitation_id}`; N19 `POST /staff-invitations/{invitation_id}/accept`; N7 `POST /auth/credentials/complete`.

**Mock/test:** Owner tạo → đổi actor → Staff nhận → đổi actor → Owner thấy Staff; wrong-account, expired/revoked/accepted, duplicate email, stale catalogue/version, lost accept response, insufficient dependent grants, activity loading/empty/error.

**Kết quả:** một membership đúng offered grants; replay không cấp lại; API mode không giả gửi email. **BE_READY phần đầy đủ phụ thuộc G02/G03/G04.**

### MP-M03 — Chọn file → phân tích → ghép cột hoàn chỉnh

**Ưu tiên:** P0. **Phụ thuộc:** MP-M00/01. **Design:** D05. **Chủ trì:** FE.

**Flow nghiệm thu:** chọn nhiều CSV/XLSX/ngày → một nút Xử lý dữ liệu → nhận file/phân tích → chọn File/Sheet → xử lý classification/context/cột/identity/conversion/shared values → đủ điều kiện sang Preview hoặc chờ Owner.

**Hiện có:** one-action upload/analyze, typed resolution editors, descriptor validation; mock chủ yếu một sheet kiểm kê đã được duyệt, không đọc nội dung file.

- [ ] Giữ không có màn khóa/chốt tập file. Seal/version/full receipt reconciliation là chi tiết API nội bộ, không bỏ điều kiện hợp lệ của I03.
- [ ] Bám File/Sheet navigator, progress, bốn filter, visible select, Xác nhận, Xem chi tiết, readonly mapped list, HDSD theo ngữ cảnh.
- [ ] Dùng số liệu có scope rõ: M01 có ba counter toàn lô, chưa có counter auto/per-file/per-sheet/filter đầy đủ; không gắn completed thành auto hoặc count page thành tổng. Xử lý G06 nếu cần fidelity tuyệt đối.
- [ ] Từng select dùng M03 đúng issue/sheet/revision; target unavailable/duplicate/unsupported không lưu được. Confidence/origin phản ánh response, không luôn gắn nhãn AI.
- [ ] Schema/category phụ thuộc descriptor; unsupported nhập hàng/location hoặc workbook không được tự quảng cáo là đã hỗ trợ.
- [ ] File rejection một phần/toàn bộ, job fail, cursor inconsistency, stale revision và uncertain request phải có đường phục hồi; retry không tạo thêm logical upload.
- [ ] Bổ sung sample files có manifest ánh xạ tới scenario nhiều file/sheet; nếu mock không parse bytes, nêu rõ sample→scenario, file khác không được nhận giả là đã phân tích thật.
- [ ] Kết nối workflow với shared mock, tạo proposal/waiting thật sự trong mock cho MP-M04.

**API:** I01/I02/I03/I04, J01, M01/M02/M03/M04; I03 giữ canonical accepted IDs, complete rejected client IDs, file-set version, CAS và idempotency.

**Mock/test:** auto-only; needs_confirmation/ambiguous/unmatched; multi-sheet; classification; shared `0`/`false`/null; unsupported; partial/all rejected; analysis failed/long; concurrent mapping. **Kết quả:** server/mock authority xác nhận khả năng tiếp tục, không suy từ hết hàng đợi visible.

### MP-M04 — Staff đề xuất → Owner duyệt → Staff tiếp tục; retire/reuse

**Ưu tiên:** P0. **Phụ thuộc:** MP-M02/03. **Design:** D05 MappingApprovalFlow. **Chủ trì:** FE+BE; G05 là blocker của queue toàn Store.

**Flow nghiệm thu:** Staff ghép mới → gửi/chờ → Owner mở yêu cầu → xem source/samples/full spec/baseline → duyệt hoặc từ chối → Staff đọc lại và tiếp tục hoặc sửa → lần nhập sau reuse; Owner retire thì lần nhập mới không dùng profile đó.

**Hiện có:** đề xuất mapping và N5 approve/reject/retire trong phạm vi lô, full spec/baseline/CAS; chưa có workspace queue/lifecycle toàn Store.

- [ ] Làm Staff existing-only/new/submit/waiting/approved/rejected; Owner entry/queue/review/edit/confirm/handled/loading/error; active/retired list.
- [ ] Xác nhận với BE “Gửi Owner duyệt” là mutation nào hay chỉ là presentation của proposal đã tạo bởi M04; không invent submit endpoint.
- [ ] Duyệt theo immutable profile proposal/version, không giả N5 duyệt từng cột độc lập. “Duyệt tất cả” phải có semantics atomic/partial/failure được chốt trước.
- [ ] Owner chỉnh target nếu được phép phải tạo/read lại proposal qua boundary đúng, rồi dùng lifecycle revision mới; không sửa approved profile tại chỗ.
- [ ] Giữ rejection reason, đúng actor/time khi API có; refresh conflict khi Owner khác xử lý. Approval không tự confirm_review/commit lô.
- [ ] Staff IGNORE own uncommitted sheet theo CA-020 độc lập với activate profile; không biến mọi thao tác Staff thành cần Owner duyệt.
- [ ] Queue active/retired/request cross-import, pagination, scope và permissions cần contract G05; không dùng H02 một page làm danh sách toàn bộ profile.

**API có sẵn:** M01 full details/proposals/approved profiles, M02/M03/M04, N5 `POST /stores/{store_id}/mapping-profiles/{profile_id}/decisions` với lifecycle CAS/key. **Chưa có:** global approval/profile list và submit semantics riêng được chốt.

**Mock/test:** hai actor trên cùng proposal; approve/reject→correct→approve; concurrent owner; retire pin chưa commit; completed receipt vẫn đọc được; approved reuse không hỏi lại. **Kết quả:** cả Staff và Owner thấy cùng vòng đời sau re-read. **BE_READY đầy đủ chờ G05.**

### MP-M05 — Preview → kiểm tra → ghi → completion → lịch sử/đích dữ liệu

**Ưu tiên:** P0. **Phụ thuộc:** MP-M03; MP-M04 cho mapping mới. **Design:** D05 ImportFinalSteps, D06/D07. **Chủ trì:** FE; BE review preview projections/G01/G07.

**Flow nghiệm thu:** mapping hợp lệ → tạo Preview → lọc nhóm/dòng cảnh báo → mở chi tiết dòng → kiểm tra summary/source/mapping/warnings → lưu server review → confirm nhập → theo dõi commit → completion → mở History/Kho/Menu/Planning đúng ngữ cảnh.

**Hiện có:** I05 preview/confirm_review/commit, J01, I06 và H01/H02; UI cần sắp xếp lại theo design mới, chưa đủ row inspection UX.

- [ ] Chuyển visible sequence thành Preview trước Review; title/step/breadcrumb/back đúng, không tạo thêm bước khóa/chốt file.
- [ ] Dựng preview data tabs, warning filters, row drawer source/file/sheet/line/original/normalized values và loại dữ liệu; dùng evidence từ server, không tự dựng dòng đã mất provenance.
- [ ] Tổng theo file/category/warning chỉ hiển thị khi API có aggregate hoặc đã đọc đủ cùng snapshot; count sample page không thành tổng428.
- [ ] Review summary rõ thêm/sửa/merge/NO_OP/cảnh báo/lỗi chặn; giữ full-page review và reason/action-specific acknowledgements theo contract dù UX được làm gọn.
- [ ] Nút Xác nhận nhập có dialog, chỉ commit khi server review/pins/quyền còn hợp lệ. Thay mapping/source phải invalidate preview/review cũ.
- [ ] Commit202 → J01 đúng operation → I06; queued/long/failed/unknown khác success. Không tự tick các giai đoạn “cập nhật cửa hàng” nếu API không có stage đó.
- [ ] Completion dùng receipt canonical rows/impacts/references/readiness; no_changes và completed_with_warnings riêng; không đồng nhất nhập xong với planning ready.
- [ ] History calendar/filter/paging dùng H01/H02, ngày lần tải đầu khác data_date. Resume import_id chỉ là locator; rời trang/reload không gửi lại commit mới.
- [ ] Deep link tới dữ liệu đã cập nhật lọc đúng resource IDs và quyền; sample files/HDSD không thêm schema ngoài contract.
- [ ] Mock commit cập nhật repository liên quan; completion, History và reads Kho/Menu đồng nhất.

**API:** I04; I05 `POST /imports/{import_id}/process` với phases preview/confirm_review/commit; J01; I06; H01/H02; P01/P02/V01–V04/R01 cho đọc kết quả liên quan.

**Mock/test:** preview-clean/warnings/row-open; review-ready/warnings/blocking; commit-confirm/processing/long/failed; lost response; stale pins; paginated preview; no_changes; canonical completion/resume. **Kết quả:** chỉ một lần ghi, đủ receipt, đọc mới thấy dữ liệu.

### MP-M06 — Kho → nhận hàng → lots/movements/attention cập nhật

**Ưu tiên:** P1. **Phụ thuộc:** MP-M00/01. **Design:** D08. **Chủ trì:** FE; BE chốt picker/location G08.

**Flow nghiệm thu:** tìm nguyên liệu → xem lots/movements → Nhận hàng → nhập quantity/unit/dates/lot/supplier → kiểm tra → confirm → receipt → đọc snapshot mới → thấy lot/movement/summary/Today thay đổi.

**Hiện có:** V01–V04 readonly; chưa có N6/N8 FE writer.

- [ ] Bổ sung Receive drawer, validation/confirm/processing/success/failure/existing-batch warning; draft không mất khi lỗi, dirty-close/focus rõ ràng.
- [ ] N6 ACTUAL_RECEIPT khác OPENING_STOCK; không dùng nhận hàng để sửa số đếm hoặc khai opening không có physical observation.
- [ ] Map đủ required fields N6: receipt_identity, exact quantity/unit, nullable supplier/lot/dates/cost, currency, observed_at, reason, expected_inventory_version. UI design thiếu trường nào phải có nguồn/chính sách được chốt, không gán đại.
- [ ] Chọn supplier/ingredient bằng canonical ID từ nguồn được phép; không gửi chuỗi “Vinamilk” vào supplier_id. Location/warehouse chưa có field tương ứng, giải quyết G08.
- [ ] Existing-batch không được FE tự merge lot theo code/ngày; server quyết định receipt/lot identity và trả outcome.
- [ ] Mất response thử lại cùng key/body/receipt identity; stale stock observation phải đối chiếu lại, không đổi key rồi cộng lượng cũ.
- [ ] Success re-read V01–V04 theo snapshot mới; exact decimals, null/unknown khác0; expired/near-expiry/low-stock đúng facts server.
- [ ] Nếu mở sửa ngưỡng, dùng N8 Owner/CAS/reason, null khác0; đây là mở rộng contract đã có, không coi design Receive là bằng chứng đã có UI threshold.
- [ ] Hỗ trợ deep link ingredient và filter ingredient_ids từ Menu/Planning; không mở Kho không lọc rồi coi là đã tới đúng nguyên liệu.

**API:** V01/V02/V03/V04; N6 `POST /stores/{store_id}/inventory/receipts`; N8 `PUT /stores/{store_id}/inventory/{ingredient_id}/threshold` nếu nằm trong scope đã chọn.

**Mock/test:** empty/filled/validation/existing-batch/confirm/processing/success/failed; duplicate replay, stale observation, received date unknown/late, expiry, missing supplier, denied write. **Kết quả:** receipt/movement và lượng đọc lại nhất quán; không biến planning purchase thành physical stock.

### MP-M07 — Menu → phiên bản công thức → preview lịch → commit → đọc lại

**Ưu tiên:** P1. **Phụ thuộc:** MP-M00/01. **Design:** D09. **Chủ trì:** FE; BE review picker dependencies.

**Flow nghiệm thu:** mở món → xem current/next/timeline → tạo version hoặc chỉnh lịch tương lai → sửa ingredients/yield/date → preview before/after → confirm → commit → đọc timeline/retained change → mở Planning thấy applicability đúng ngày.

**Hiện có:** P01/P02 readonly. **API đã hỗ trợ:** N20–N22, trong đó N21 `new_recipes` tạo nội dung mới, không chỉ gán recipe ID có sẵn.

- [ ] Bổ sung current-only/current-scheduled, historical/scheduled detail, timeline và editor theo design; lịch sử readonly.
- [ ] Form có canonical ingredient IDs, quantity/unit, yield_quantity/yield_unit/process_loss_rate; không hardcode yield1 hoặc loss0 khi chưa có quyết định nhập liệu.
- [ ] Dùng minimum_change_date/ngày Store từ server; không dùng ngày máy tính để cho sửa hôm nay/quá khứ.
- [ ] Tạo new_recipes + SET_PERIOD/WITHDRAW_FUTURE rõ ràng; explicit close/open periods, không tự đóng recipe cũ khi thiếu operation.
- [ ] Preview200 có thể blocked; render before/after/changed_ranges/new_contents/blockers/warnings, nhận đủ warning acknowledgements.
- [ ] Commit giữ change_id/digest/current schedule CAS; key riêng mỗi phase. Midnight, conflict, dependency đổi → preview lại, giữ draft để sửa.
- [ ] Thành công đọc N22/N20; P02 vẫn là recipe hôm nay. Recipe tương lai chưa làm món hôm nay đổi công thức.
- [ ] Menu→Kho dùng đúng IDs/quyền. Ingredient picker từ P02/V01 phải đủ scope; không giả có API catalogue độc lập.
- [ ] Mock calendar/version cập nhật shared repository, Planning mới dùng đúng recipe theo ngày; Run cũ vẫn giữ snapshot cũ.

**API:** P01/P02; N20 `GET /stores/{store_id}/products/{product_id}/recipe-schedule`; N21 `POST .../recipe-schedule/changes` preview/commit synchronous200; N22 `GET .../changes/{change_id}`.

**Mock/test:** current/next, timeline/historical, create/edit, invalid quantity/duplicate ingredients, overlap/gap ack, conflict/midnight, preview/confirm/processing/success/failed/replay. **Kết quả:** version mới và lịch đúng, không sửa nội dung lịch sử hay retained planning.

### MP-M08 — Thiết lập → readiness → chạy Planning → retained result

**Ưu tiên:** P0 cho core, P1 cho fidelity bổ sung. **Phụ thuộc:** MP-M00/01; MP-M05/06/07 cho chuỗi dữ liệu. **Design:** D10/D11. **Chủ trì:** FE.

**Flow nghiệm thu:** mở Planning → chọn ngày/yêu cầu/ngân sách → readiness ready/warnings/blocked → tạo run → queued/running/long → completed hoặc terminal không có phương án/lỗi → inspect Overview/Ingredients/Alternatives/Reasons → mở đúng Kho/nguyên liệu.

**Hiện có:** C01/R01/C02/C03/C04/C05/C08, lifecycle workflow, retained result, options và engine reasons. Chưa có đủ design interaction/lifecycle UX và mock dữ liệu phong phú.

- [ ] Setup dùng descriptors/default/custom/saved hợp lệ; ngày/cutoff/horizon theo API, không gửi priority/model/simulation/Open PO khi contract không nhận.
- [ ] R01 cập nhật theo ngày đã chọn; data readiness và execution availability tách biệt, warning không tự thành blocking.
- [ ] Tạo C02 bằng original intent/key; C03 poll theo server scheduling, reload qua plan_id. Long-running không coi là failed và không tự tạo run mới.
- [ ] Dựng riêng queued/running/long/completed/no-feasible/failed; partial result không thành completed recommendation. “Chạy lại” phải nói rõ resume/retry intent hay new run.
- [ ] Overview/ingredients/options/chart/reasons dùng retained facts/digest cùng run; null/unknown/not-computed không0; không lấy live recipe thay dữ liệu historical.
- [ ] Strategy LEAN/BALANCED/PROTECTED khác demand quantile/path; không FE tự chấm winner hoặc dựng KPI tổng không có projection.
- [ ] Chart chỉ vẽ chuỗi có trong response hoặc phép biểu diễn đã định nghĩa; thiếu series/KPI phải ghi gap, không nội suy stock/nhu cầu như fact.
- [ ] Mock có nhiều nguyên liệu/nhà cung cấp/options, pagination, warnings, no-winner và partial failure; kết quả tham chiếu đúng seed version từ import/receipt/recipe.
- [ ] Tab kịch bản, AI, Draft PO chuyển sang MP-M12/13/14; không coi disabled button là đã hoàn tất flow đó.

**API:** C01/R01; C02 `POST /stores/{store_id}/procurement-plans`; C03 `GET /procurement-plans/{plan_id}`; C04/C05 ingredients; C08 explanation. Planning run poll qua C03, không J01.

**Mock/test:** readiness ready/warnings/blocked, worker unavailable, queued/running/long, completed winner, terminal no-feasible, failed/partial, lost create response, same-key replay, stale digest/paging, revoked cost permission. **Kết quả:** một retained run, đúng status/outcome/proof, inspect đủ dữ liệu được phép.

### MP-M09 — Lịch sử kế hoạch → Run cũ → xuất/tải PDF

**Ưu tiên:** P1. **Phụ thuộc:** MP-M08. **Design:** D10 PlanHistory, D11 Export overlay. **Chủ trì:** FE; BE chốt G09.

**Flow nghiệm thu:** tạo run → mở History → lọc/chọn run cũ → inspect snapshot chỉ đọc → chọn option → xác nhận PDF → queued/running/long → ready → tải binary; lỗi export thử lại tác vụ export, không chạy lại Planning.

**Hiện có:** resume plan_id và core retained read; chưa có N9/N10/N11 FE adapters/UI, PDF-specific job handling.

- [ ] List/filter/paging N9 theo signed snapshot; old-completed/running/failed/no-result có đích phù hợp, không mở result rỗng.
- [ ] Design filter “người tạo” chưa có query N9; ngày tạo khác forecast_start_from/to. Giải quyết G09 thay vì gửi query tự đặt/lọc một page rồi coi là toàn bộ.
- [ ] Historical view giữ run/request/result/version; current Store/recipe/label không thay thế captured facts.
- [ ] N10 gửi đủ `format:pdf`, `locale:vi`, `option_id` explicit null hoặc ID; capture lựa chọn khi gửi, không đổi option của export đang chạy.
- [ ] Poll J01 operation planning_pdf_export, phân biệt ImportContext/PDF context, terminal error và response receipt.
- [ ] N11 fetch binary có credentials; kiểm tra content type/status/headers/bytes, tạo download/object URL và revoke; không parse PDF bằng JSON helper hoặc mở public share URL.
- [ ] Closing overlay không hủy server job. Chốt export locator/recovery để ready/existing/unavailable/resume có bằng chứng; current API chưa có export list, xem G09.
- [ ] Thiếu/hỏng/không còn quyền tải PDF không xóa run gốc; retry giữ intent gốc khi uncertain, tạo tác vụ mới chỉ khi outcome đã rõ và server cho phép.
- [ ] Mock trả PDF fixture hợp lệ cùng contract download, không file text đổi đuôi .pdf; test file tải đúng run/option và không stock/PO mutation.

**API:** N9 `GET /stores/{store_id}/procurement-plans`; C03/C04/C05/C08; N10 `POST /procurement-plans/{plan_id}/exports`; J01; N11 `GET /procurement-plans/{plan_id}/exports/{export_id}`.

**Mock/test:** list populated/empty/loading/failed; old completed/running/failed/no-result; export confirm/queued/running/long/ready/failed/existing/unavailable; response loss; binary corrupt/403; reload retained IDs. **Kết quả:** tải PDF từ đúng retained option, không tạo PO hay cập nhật Kho.

### MP-M10 — Hôm nay → xử lý attention → quay lại thấy trạng thái mới

**Ưu tiên:** P1. **Phụ thuộc:** MP-M05/06/08/09. **Design:** D12. **Chủ trì:** FE+BE cho projections thiếu.

**Flow nghiệm thu:** mở Today đúng ngày/Store → đọc readiness và attention → mở đúng Kho/lô hoặc kế hoạch → thực hiện thao tác được phép → về Today → re-read thấy facts mới, không giữ card stale.

**Hiện có:** Today đọc attention và summary từ V01, links tới Kho/Planning; chưa có đủ pending decisions/operational signals/outlook7 ngày/AI.

- [ ] Match hierarchy/readiness/attention/decision/signal/outlook; mỗi card chỉ render từ nguồn API có semantics rõ.
- [ ] Kết hợp V01/R01/N9 được phép, xử lý loading/error từng khu vực và thiếu quyền; tổng attention không dựa limit6 như tổng Store.
- [ ] Chốt “Quyết định đang chờ” là pending planning run hay một approval nghiệp vụ khác; không coi recommendation là đơn hàng được duyệt.
- [ ] Chốt forecast/outlook/expected arrivals/global signals G10; không suy forecast7 ngày từ tồn hiện tại hoặc mock cũ.
- [ ] Attention deeplink giữ resource ID và permission; quay lại/đổi Store phải revalidate; empty/healthy khác unknown/forbidden.
- [ ] Mock liên thông với receipt/import/run; kịch bản đang thiếu → nhận hàng → quay lại không còn cùng cảnh báo theo snapshot mới.

**API có thể dùng ngay:** V01, R01, N9 và retained C03 nếu card gắn run cụ thể. **Thiếu:** projection cho các facts còn lại trong G10; không có `/today` API để tự gọi.

**Mock/test:** needs-attention/healthy/missing-data/partial-permission/error; pending run→completed; receipt→refresh; multi-Store. **Kết quả:** card và đích điều hướng khớp facts, không claim cả Today BE_READY khi G10 còn mở.

### MP-M11 — Cấu hình yêu cầu/ngân sách → lưu → dùng trong một Run

**Ưu tiên:** P1 cho cấu hình đã có contract; profile/settings ngoài contract chờ G11. **Phụ thuộc:** MP-M02/08. **Design:** D04 chrome, D10 setup; một số editor cần chốt bổ sung UX. **Chủ trì:** FE+BE.

**Flow nghiệm thu:** Owner cấu hình ngân sách hoặc người có quyền lưu bộ yêu cầu → đọc lại → chọn saved/default/custom ở Planning → tạo run → kết quả giữ đúng cấu hình/version tại thời điểm chạy.

**Hiện có:** C01 và N4 known-budget replacement ở Store; chưa có N1/N2/N3 FE CRUD; Store overview/settings nhiều field readonly và initial cap absence còn mơ hồ.

- [ ] Scope editor theo contract thật: N1 create, N2 read, N3 full replace/archive với quyền creator/Owner và CAS; archived không tự restore.
- [ ] Save requirements độc lập readiness/can_generate; đúng inherit/default version, null budget late-binding, decimal limits và field presence.
- [ ] N4 initial create `If-None-Match:*` khác replace `If-Match`; không tạo cap khi null chưa phân biệt được absent/forbidden/unknown, xem G11.
- [ ] Save→re-read context→chạy saved mode; thay default/cap sau đó không sửa retained run trước.
- [ ] Thông tin tên/loại hình/địa chỉ/điện thoại/giờ mở cửa/tuần/ngôn ngữ/currency/timezone không có writer tương ứng thì giữ readonly và ghi gap; không gửi T02 PUT tự tạo.

**API:** C01, N1/N2/N3 planning-requirements, N4 planning-budget, C02/C03. **Mock/test:** save/read/replace/archive/use-saved, stale version, thiếu budget.read, absent/null/zero budget, unauthorized Staff edit. **Kết quả:** Run thể hiện cấu hình đã lưu, không đổi facts lịch sử.

### MP-M12 — Contextual AI → evidence → đúng dữ liệu nguồn

**Ưu tiên:** P2, **BLOCKED_CONTRACT**. **Phụ thuộc:** các workspace dữ liệu liên quan. **Design:** D08/D09/D11/D12. **Chủ trì:** BE+FE; G12.

**Flow nghiệm thu:** mở AI từ ingredient/product/run/Today → context hiển thị rõ → hỏi → loading/answer/error → click evidence → đúng resource/snapshot → đổi context không lẫn hội thoại/quyền.

- [ ] Chốt API request/response/streaming nếu có, context IDs/version, permissions, cancellation, limits và evidence link schema trước adapter thật.
- [ ] Chốt câu hỏi/gợi ý/loading/empty/unavailable/history-in-memory, tránh xóa draft hoặc hiển thị answer của context cũ.
- [ ] Mock deterministic Q&A/evidence rõ “minh họa”; provider unavailable không làm hỏng core Planning/Import.
- [ ] C08 là giải thích engine có cấu trúc, không thay chatbot; AI không thay đổi stock, approve mapping hoặc quyết định winner.
- [ ] Test cross-Store/forbidden evidence, late response, lỗi provider, question submit lặp và Escape/focus.

**API hiện tại:** không có contextual conversation endpoint trong OpenAPI V2. **Kết quả:** cần contract mới rồi mới có thể BE_READY; UI mock riêng không đủ đóng milestone.

### MP-M13 — What-if → chạy kịch bản → so sánh, giữ nguyên Run gốc

**Ưu tiên:** P2, **BLOCKED_CONTRACT**. **Phụ thuộc:** MP-M08. **Design:** D11 ScenariosTab. **Chủ trì:** BE+FE; G13.

**Flow nghiệm thu:** mở retained run → sửa input giả định → chạy scenario → queued/running/result hoặc lỗi → so sánh cùng basis → quay lại Run gốc không đổi.

- [ ] Chốt input allowlist/units/bounds, basis run/snapshot, deterministic engine, identity/lifecycle/result/diff và quyền; không giả C02 hiện có hỗ trợ những input chưa công bố.
- [ ] UI diff nêu rõ hypothetical, unknown và không tính được; không FE tự chạy solver/BOM hoặc dựng KPI bằng công thức tùy ý.
- [ ] Mock baseline + scenario result cùng seed; changing Store/option/input invalidates comparison, error giữ draft.
- [ ] Test baseline immutable, stale basis, response loss, delayed result, no-feasible và forbidden costs.

**API hiện tại:** chưa có What-if endpoint; `scenario_based_planning`/controls hiện chưa đủ chứng minh hỗ trợ flow này. **Kết quả:** chỉ nghiệm thu trọn vẹn sau G13.

### MP-M14 — Kết quả kế hoạch → Draft PO → trạng thái mua hàng

**Ưu tiên:** P2, **BLOCKED_DESIGN_AND_CONTRACT**. **Phụ thuộc:** MP-M08, MP-M06 cho nhận hàng nếu nằm trong scope. **Design:** D11 có entry “Tạo Draft PO”, chưa đủ full purchase-order workspace. **Chủ trì:** Product+BE+FE; G14.

**Flow cần chốt:** chọn retained plan/option → review supplier/items/qty/cost → tạo Draft PO → đọc lại draft → xử lý duplicate/failure/permissions; nếu bao gồm receive thì liên kết receipt thật ở MP-M06.

- [ ] Bổ sung design downstream và contract tạo/đọc/cập nhật/lifecycle PO, quyền và provenance plan/option; nêu rõ có/không có submit/approve/cancel/receive trong phạm vi này.
- [ ] Mapping purchase lines/canonical supplier terms, monetary policy và snapshot consistency do BE xác định; không lấy display labels làm IDs.
- [ ] Mock E2E phải có entity PO thật trong repository, không toast “đã tạo” rồi không có trang đích.
- [ ] Tạo PO không tự tăng physical stock; chỉ receipt canonical mới thay Kho. Không dùng PDF export để thay PO.
- [ ] Test create/read/duplicate replay/conflict/forbidden/partial scope theo contract được duyệt.

**API hiện tại:** OpenAPI V2 chưa có public PO endpoints. **Kết quả:** cần design+contract trước khi tuyên bố có flow BE_READY.

### MP-M15 — Nghiệm thu xuyên workspace và bàn giao BE

**Ưu tiên:** P0 để nghiệm thu core; full-design release còn phụ thuộc các milestone bị chặn. **Phụ thuộc:** các milestone trong release scope.

**Flow chuẩn A:** Owner mời Staff → Staff nhận → nhập sample mới → Owner duyệt mapping → Staff preview/review/commit → History/completion → Kho/Menu đúng dữ liệu → Planning → History run → PDF.

**Flow chuẩn B:** Owner/Staff có quyền → nhận hàng → snapshot Kho/Today đổi → lên lịch recipe tương lai → chạy Planning đúng khoảng ngày → retained run cũ/PDF cũ không đổi.

**Flow chuẩn C:** đang sửa/đang chạy → đổi Store/quyền bị thu hồi/session hết hạn → protected data bị loại → khôi phục context hợp lệ → resume bằng canonical locator; không duplicate mutation.

- [ ] Chạy A/B/C bằng UI trong mock không BE, dữ liệu/roles nhất quán, có reset và evidence assertions sau re-read.
- [ ] Chạy API-parity suite cho tất cả adapters, kể cả uploads/binary/CAS/pagination/job unions; không chỉ snapshots render hoặc HTTP200.
- [ ] Chạy A/B/C trên BE integration fixture được BE cung cấp: session, Store, grants, upload schema, worker, PDF và callback invitation; không dùng fixture FE làm bằng chứng persistence BE.
- [ ] Kiểm tra browser desktop/mobile, keyboard/reduced motion, route reload/deep link, long job, mất mạng/response và stale schema/data version.
- [ ] Cập nhật docs/runbook theo scope mới; dọn mô tả cũ “chưa có màn review/preview”, API thiếu do snapshot lịch sử và thứ tự Import không còn đúng. Không xóa evidence lịch sử; ghi bản nào supersede.
- [ ] Handoff ghi rõ milestone nào MOCK_E2E/BE_READY/LIVE_VERIFIED, contract gap còn mở và scope bị loại; không gắn “full design complete” khi AI/What-if/PO vẫn disabled.

**Kết quả:** team FE có một lệnh chạy demo và một lệnh chạy browser E2E; team BE đổi environment sang API, dùng cùng UI/workflow, không phải thay fixture IDs/component handlers.

## 5. Contract/design gaps cần chốt

Gaps là đầu việc cụ thể, không phải lý do dừng các milestone độc lập. Mỗi gap phải có decision/contract delta, sample payload và acceptance cases trước khi đóng.

- [ ] **G01 — Import step semantics.** Component Completion tên3/3 nhưng source5/5; D05 mới Preview3/5, Review/Commit4/5, Complete5/5. **Đề xuất:** một wizard5 bước: File1, Mapping2, Preview3, Review+Confirm/Commit4, Complete5; approval là nhánh phụ. Chốt với Product; không bỏ confirm_review/commit nghiệp vụ để ép3/3.
- [ ] **G02 — Registration/recovery vs credential completion.** Không có public signup/reset-request API. N7 cần token được cấp và password12–128; design invite register yêu cầu8 ký tự. **Đề xuất:** ship token credential setup hiện có; giữ signup công khai ngoài scope cho tới contract/account provisioning được chốt. Owner không đặt mật khẩu Staff.
- [ ] **G03 — Decline invitation.** N19 OpenAPI accept:boolean nhưng AUTH quy định accept:true, không có public decline route/state phù hợp. **BE chốt:** decline có persist không, endpoint/body/status/idempotency/audit; hoặc UX chỉ thoát và không ghi “đã từ chối”.
- [ ] **G04 — Activity scope/filter.** N14 permission events và N16 view=events đã có; kiểm tra mức phủ cho design tất cả/thành viên/lời mời/quyền và filter. Không dựng actor name/change detail chưa được trả hoặc merge hai paginated feed thành timeline toàn bộ khi chưa có cách ổn định.
- [ ] **G05 — Global mapping administration.** Chưa có list queue/profiles active/retired across imports; M01 chỉ theo import, N5 quyết định theo profile. Chốt submit/waiting state, per-column vs per-profile approval, owner edit, bulk behavior, list pagination/quyền và rejection evidence. Không cần tạo mutation mới nếu proposal từ M04 đã đáp ứng, nhưng phải xác định rõ.
- [ ] **G06 — Mapping counter projections.** M01 hiện trả total/completed/unresolved toàn lô; design cần auto count và counts từng file/sheet/filter. Chốt BE projection hoặc điều chỉnh UI dùng facts hiện có với label đúng; không giả counts.
- [ ] **G07 — Preview rows/categories/aggregates.** Đối chiếu projection thực tế với tabs/row drawer/normalized-original values/per-file totals. Design có “Nhập hàng” nhưng không mặc định đó là schema upload nhận hàng đã được hỗ trợ. Thiếu field nào cần delta; phép đếm client chỉ hợp lệ khi đã đọc đủ pinned scope.
- [ ] **G08 — Receipt input/location/pickers.** N6 đủ writer, nhưng design thiếu identity/reason/version/observation/cost và có warehouse chưa được API nhận. Chốt nguồn ingredient/supplier IDs, missing supplier=null policy, location scope; không hardcode warehouse hoặc giả có supplier search endpoint.
- [ ] **G09 — Planning history/PDF resume.** N9 hỗ trợ status/forecast-start range/sort, chưa creator/date-created filters như design. N10/J01/N11 có export lifecycle nhưng chưa export-list. Chốt filter UX/contract và locator recovery cho existing PDF; không auto tạo lại export chỉ để tìm file cũ.
- [ ] **G10 — Today projections.** Chốt pending decision semantics, outlook7 ngày, expected arrivals và signals; cái nào lấy từ V01/R01/N9/C03 được, cái nào cần aggregate API/retained projection. Không lấy số demo làm actual fact.
- [ ] **G11 — Store/settings/config.** Không có profile/hours/general settings writer; xác định scope lưu. C01 null ceiling còn cần phân biệt absent/unknown/forbidden trước initial N4 create. N1–N3 đã có, không báo thiếu API saved requirements.
- [ ] **G12 — Contextual AI.** Contract conversation/evidence/context/grants/provider errors/limits chưa có. C08 engine explanation không thay thế endpoint hỏi đáp.
- [ ] **G13 — Scenario/advanced setup.** What-if, priority, Open PO, simulation controls trong design chưa có request semantics tương ứng. Chốt capability và API, không bật UI bằng mock rồi gửi field lạ.
- [ ] **G14 — Draft PO.** Chưa có đủ downstream design hoặc public API; chốt vòng đời và boundary plan→PO→receipt trước triển khai.

## 6. Thứ tự triển khai đề xuất

1. **Đợt A — Nền tảng kiểm thử và quyền:** MP-M00 → MP-M01 → MP-M02. Song song về mặt chuẩn bị tài liệu: BE/Product xử lý G01–G14; chưa có nghĩa phải mở nhiều nhánh code đồng thời.
2. **Đợt B — Nhập dữ liệu trọn vòng:** MP-M03 → MP-M04 → MP-M05. MP-M04 phần queue chờ G05, nhưng nhánh auto/approved của MP-M05 vẫn làm được.
3. **Đợt C — Tác vụ vận hành:** MP-M06 và MP-M07 → bổ sung liên thông dữ liệu; MP-M11 cho saved requirements/ngân sách theo scope đã có contract.
4. **Đợt D — Quyết định và báo cáo:** MP-M08 → MP-M09 → MP-M10. Core MP-M08 có thể nâng cấp sớm bằng fixtures hiện có, không phải chờ toàn bộ writer mới.
5. **Đợt E — Mở rộng sau chốt contract:** MP-M12/13/14. Không tính vào core release nếu chưa có quyết định phạm vi rõ ràng; vẫn theo dõi là phần design chưa thực hiện.
6. **Gate xuyên suốt/cuối đợt:** MP-M15 chạy lại các journey bị ảnh hưởng; full-design acceptance chỉ khi tất cả milestone thuộc scope đã có evidence.

Không gán thời gian hoàn thành trước khi G02/G03/G05/G10/G12–G14 được định nghĩa. Đây là thứ tự theo dependency, không phải cam kết sprint hoặc công việc đã bắt đầu.

## 7. Mock dataset và cách nghiệm thu chung

### Dataset chuẩn đề xuất

- [ ] Hai Store A/B, Owner và ít nhất hai Staff với grants khác nhau; invitations/events/version thay đổi được.
- [ ] Một bộ product/ingredient/recipe/lot/supplier IDs chung; đủ current/future/historical recipe, near-expiry/expired/empty/unknown stocks, exact decimal/null/zero cases.
- [ ] Sample CSV/XLSX có manifest: approved reuse; multi-file/multi-sheet cần mapping; rejected/unsupported; warnings/blockers. Nêu chính xác mock parse thật hay chọn scenario cố định.
- [ ] Import/proposal/preview/commit/job/completion/history dùng cùng IDs và source versions; partial upload khác atomic commit.
- [ ] Planning seeds ready/blocked/worker unavailable, queued/running/long/winner/no-winner/failed-partial; nhiều options/ingredients và lịch sử cũ khác dữ liệu hiện tại.
- [ ] PDF binary hợp lệ theo run/option; receipt và recipe calendar mutations có effects đọc lại, không biến simulation thành real stock.
- [ ] Scenario faults:401/403/404/409/410/412/422/428/429/503, timeout, delayed response, malformed envelope, lost mutation response và stale cursor. Chọn các lỗi thực sự được từng operation hỗ trợ.

### Commands hiện có và deliverables cần bổ sung

Hiện có thể mở mock UI bằng:

```bash
VITE_DATA_SOURCE=mock npm run dev
```

API mode dùng URL BE origin/base do BE cung cấp, ví dụ local đã quy định trong config:

```bash
VITE_DATA_SOURCE=api VITE_API_BASE_URL=http://localhost:18001 npm run dev
VITE_DATA_SOURCE=api npm run build
```

Các lệnh kiểm tra hiện có: `npm run lint`, `npm run test:auth`, `npm run test:store`, `npm run test:import`, `npm run test:planning`, `npm run check:import-wire`, `npm run check:store-wire`, `npm run check:planning-wire`. Đây chủ yếu là controlled boundary/workflow/UI tests; không thay browser E2E hoặc live verification.

- [ ] MP-M00 bàn giao thêm script browser E2E mock được commit, ví dụ tên đề xuất `test:e2e:mock`; script này **chưa tồn tại** trong package.json lúc audit.
- [ ] Mỗi milestone cập nhật runbook chứa đúng command/scenario/seed/role/expected outcome; không yêu cầu team sửa `.tsx` để kích hoạt lỗi.
- [ ] Handoff BE có env example không secret, allowed FE Origin, cookie/credentialed CORS/CSRF/header allowlists, exposed headers cho binary/CAS, SPA deep-link fallback và worker/job prerequisites.
- [ ] Local cookie theo AUTH V2: dùng hostname nhất quán `localhost` cho FE/BE khi kiểm thử session thật; không suy cookie session từ mock hoặc dùng localhost/127.0.0.1 lẫn nhau. Production giữ chính sách HTTPS/Secure hiện hành.
- [ ] Sau mỗi write, assert bằng fresh read. Record screenshot/trace và request/response đã redact; không lưu tokens/password vào evidence.

## 8. Nguồn và giới hạn authority

- Design UI/interaction: 12 component/revision trong mục2; không sửa MagicPath trong lần audit này.
- Routes/features thực tế: [AppRouter](../../../src/app/AppRouter.tsx), [config](../../../src/app/config.ts), [Auth](../../../src/features/auth/auth.data.ts), [Store workspace](../../../src/features/store-workspace/storeWorkspace.data.ts), [Import input](../../../src/features/import-data/importData.workflow.ts), [Import continuation](../../../src/features/import-data/importFlow.workflow.ts), [Planning](../../../src/features/decision-planning/planning.data.ts), [Kho](../../../src/features/inventory/inventory.data.ts), [Menu](../../../src/features/menu/menu.data.ts), [Today](../../../src/pages/today/TodayPage.tsx).
- Wire/API baseline: [OpenAPI V2](../../../contracts/history/v2/generated/openapi.json), [operation details](../../../contracts/history/v2/generated/OPERATION_DETAILS_VI.md), [handoff delta](../../../contracts/history/v2/CONTRACT_HANDOFF_DELTA_VI.md); business semantics: [AUTH](../../../contracts/history/v2/docs/AUTHORIZATION_CONTRACT_VI.md), [Import](../../../contracts/history/v2/docs/IMPORT_MAPPING_API_CONTRACT_VI.md), [Inventory](../../../contracts/history/v2/docs/INVENTORY_API_CONTRACT_VI.md), [Catalog/Recipe](../../../contracts/history/v2/docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), [Procurement](../../../contracts/history/v2/docs/PROCUREMENT_API_CONTRACT_VI.md).
- Một số đoạn tài liệu V1/V2 và báo cáo cũ là snapshot lịch sử. Ưu tiên CURRENT FACT top-section, current generated schema và accepted semantics; nếu mâu thuẫn, ghi gap và chốt với BE, không im lặng đổi contract.
- Các trạng thái “API đã có” ở đây nghĩa là xuất hiện trong package V2 đã kiểm tra, không xác nhận deployment hiện tại. Audit này không gọi business API thật, gửi email, reset DB hoặc chạy lại toàn bộ app test suite; chỉ tạo kế hoạch và kiểm tra tài liệu.
