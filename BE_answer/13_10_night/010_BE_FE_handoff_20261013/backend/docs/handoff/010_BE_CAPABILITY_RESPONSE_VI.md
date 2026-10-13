# 010 — BE trả lời yêu cầu capability FE, R00–R13

Ngày đối chiếu: 13/10/2026, timezone Asia/Saigon. Nguồn yêu cầu: [010_FE_to_BE_API_Capability_Requests.md](../../010_FE_to_BE_API_Capability_Requests.md).

## Tóm tắt cho chủ dự án

Backend tổng đã có các bổ sung Import mà OpenAPI cũ của FE chưa mô tả, gồm recipe/source provenance, supplier price/MOQ semantics, diagnostics Excel và opening stock. Các thay đổi này không thêm HTTP operation nên cùng con số 54 operations không có nghĩa cùng wire contract. Source-before-reuse và recipe multi-file conflict đã có code trong backend tổng; khai báo ghép các phần của một report chưa có.

B1/B2 được **reported COMPLETE cho backend với fake delivery** trong worktree Auth: signup, verify/resend và forgot/reset nối N7. A1 được **reported COMPLETE** trong worktree Import: sales/reimport/stockout có consumer forecast và retained Planning. Đây là checkpoints ở source chưa commit, chưa tích hợp vào backend tổng. A2 và B3 đang làm; không gọi COMPLETE. Gmail smoke đã được tài liệu Auth ghi nhận SMTP accepted và chủ dự án xác nhận nhận inbox, nhưng chưa chứng minh email của workflow thật hay browser E2E.

R03/R04/R06/R07/R08/R11/R12/R13 có thiết kế hiện hành nhưng chưa có runtime đầy đủ ở cả ba nguồn. Không cần duyệt lại các policy đã chốt để triển khai chúng. Product đã duyệt R05/R09 ở trạng thái ACCEPTED / DESIGN_READY, chưa IMPLEMENTED. Recipe split-report identity/completeness và assembly qua nhiều file/sheet là DEFERRED ngoài đợt hiện tại; không còn câu hỏi Product chặn bàn giao guards/single-sheet behavior đã có. Bản bàn giao này cung cấp ba OpenAPI source snapshots riêng; **không có OpenAPI hoặc release mới hợp nhất hai worktree**.

### Bảng trả lời R00–R13

T = backend tổng; I = Import WIP; B = Auth WIP. Snapshot và cách dùng evidence xem [provenance](#snapshot) và [evidence](#evidence). “Có source” không đồng nghĩa endpoint đang phục vụ trên môi trường FE.

| Yêu cầu | Contract status | Runtime status | Branch-snapshot | Evidence | FE cần làm | BE cần làm | Slice phụ trách / chỗ chờ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R00 Runtime/wire handoff | Shared conventions + Import/Auth hiện hành; còn drift N19 | T 54/50; I 54/50; B 59/55. Có source-generated artifacts, chưa release chung | T/I/B, [snapshot](#snapshot) | E0; [delta cụ thể](#r00) | Cập nhật wire/types/validator đúng artifact chọn; giữ Origin/cookie/CSRF | Chốt snapshot release, xử lý drift, bàn giao config/fixtures/evidence môi trường | Backend tổng: handoff/integration gate hiện có, chưa thực hiện lượt này |
| R01 Signup/verify/resend/forgot/reset | ACCEPTED; B contract ghi implemented B1/B2, T còn DESIGN_READY cho extensions | B có A02/A05/A06/A07 + N7; T/I chưa có bốn routes mới | B WIP sau B1/B2, gồm B3 | E1; [trace](#r01) | Có thể làm adapter/screens theo B1/B2; runtime chung phải chờ tích hợp | Bàn giao snapshot B1/B2 ổn định và workflow/browser evidence | B1/B2 reported COMPLETE; integration/FE gate pending |
| R02 Decline + true-only accept | Decline DESIGN_READY/ACCEPTED; true-only consent đã chốt | T/I chưa decline. B có IN01/DTO/writer WIP; schema accept vẫn boolean ở cả ba | B3 WIP, không COMPLETE | E0; [trace/drift](#r02) | Accept chỉ true; không dùng false để decline; chờ B3 handoff | Khép schema drift, lifecycle/race/replay acceptance và cập nhật snapshot | B3 đang làm trong Auth; không gộp notification vào COMPLETE |
| R03 Scoped mapping counters | Import §17 DESIGN_READY | Có M01/M02/Progress cũ; chưa counter_scope/batch+filtered/origin/file extensions | T/I/B | E0; [trace](#pending) | Giữ nhãn counters hiện có; không đếm page thành total/auto | Implement extensions M01/M02 và snapshot/cursor coverage | Import backlog sau slice đang làm; chưa có slice số/ETA được chốt |
| R04 Raw cell → canonical → effect | Import §17 DESIGN_READY | Provenance/before/after có; SourceEvidenceCell/source_cells/planned_effect projection chưa có | T/I/B | E0/E3; [trace](#pending) | Dùng provenance hiện hành; không giả raw-cell drawer đầy đủ | Implement bounded retained source-effect read, permissions/pins | Import preview projection backlog; A2 history không hoàn thành mục này |
| R05 Preview file/sheet aggregates | ACCEPTED / DESIGN_READY; [Import §17.1](../IMPORT_MAPPING_API_CONTRACT_VI.md#preview-aggregates) | Summary/groups toàn preview có; scoped aggregates chưa IMPLEMENTED | Source snapshot T/I/B giữ nguyên; decision mới ở contract T | E0; Product duyệt scope, chưa runtime evidence | Chuẩn bị raw rows/logical actions riêng; chờ runtime, không cộng overlapping scope totals | Extend projection I04 theo pinned digest, dedupe actions trong scope | Import accepted read-projection backlog trong roadmap tổng; chưa mở implementation |
| R06 Supplier discovery | API SU01 DESIGN_READY | Có canonical Supplier/Import writer/N6 nullable supplier; chưa SU01 GET picker | T/I/B | E0; [trace](#pending) | N6 hiện hành vẫn dùng nullable supplier; không bắt nhập UUID/bịa tên | Implement SU01 theo supplier.read/Store/paging contract | Backend tổng supplier discovery backlog, chưa giao slice số |
| R07 Run creator/created-date search | Planning §17 DESIGN_READY query extension | N9 có status/forecast dates; chưa ba created filters/meta timezone | T/I/B | E0; [trace](#pending) | Giữ filters được hỗ trợ; “Tôi” lấy A03, không gọi N12 để dò users | Extend N9/query/snapshot theo accepted_at và Store timezone | Backend tổng retained-history backlog, chưa giao slice số |
| R08 PDF locator discovery | EX01 DESIGN_READY; N10/N11/J01 implemented | POST create/poll/download có; GET export collection chưa có | T/I/B | E0/E4; [trace](#pending) | Giữ locator hiện có; không POST chỉ để tìm PDF cũ | Implement EX01, verify artifact availability/current rights | Backend tổng PDF discovery backlog; S4.11 vẫn PARTIAL |
| R09 Captured budget ở History | ACCEPTED / DESIGN_READY; [Planning §17](../PROCUREMENT_API_CONTRACT_VI.md#history-captured-budget) | RunSummary extension chưa IMPLEMENTED; C03 có BudgetAtAcceptance | Source snapshot T/I/B giữ nguyên; decision mới ở contract T | E0; Product duyệt scope, chưa runtime evidence | Chuẩn bị captured limit/currency + availability; chờ N9 runtime; hiện xem trong Run | Extend RunSummary từ acceptance evidence, giữ quyền/list snapshot/pagination | Planning accepted retained-history backlog trong roadmap tổng; chưa mở implementation |
| R10 Source reuse / recipe conflict / report grain | Guards policy ACCEPTED; split-report identity/completeness DEFERRED ngoài đợt hiện tại | T có source-before-reuse/scope blocker; single-sheet assembly hợp lệ giữ nguyên; split assembly không supported | T nền chung; I/B kế thừa; decision mới ở contract T | E3 reported guards evidence + source trace; [chi tiết](#r10) | Nối source workflow/single-sheet hiện hành; hiển thị blocker cross-scope | Bàn giao guards evidence đúng snapshot; giữ blocker, không auto-union/last-file-wins | Lát 3 guards đã có; split-report deferred, không Product blocker |
| R11 Staff requests / Owner decision | Auth PR01–PR04 DESIGN_READY/ACCEPTED | N12/N13/N14 grants/audit có; request workflow/catalogue Staff chưa có | T/I/B | E0; [trace](#pending) | Không giả atomic approval bằng PR04 rồi PUT grants | Implement regular request lifecycle bằng grants authority hiện có | Auth collaboration backlog sau B3; không phải B1/B2 |
| R12 Inbox/count/read | Notification NF01–NF03 DESIGN_READY/ACCEPTED | Chưa routes/DTO/storage/producer; SMTP durable intent không phải inbox | T/I/B | E0; [trace](#pending) | Không suy badge/read/task từ mail intent hoặc page length | Implement recipient projection/count/read state + producers được mở | Notification backlog trong roadmap Auth/tổng; chưa giao slice số |
| R13 Excel actual receipt | Import §16 DESIGN_READY/ACCEPTED | N6 form ACTUAL_RECEIPT có; Import opening/count có; inventory_receipts schema chưa có | T/I/B; A2 purchase history cũng không receipt | E0/E3; [trace](#r13) | Nối N6 hiện có; chưa advertise Excel actual receipt | Extend pipeline/ledger dedupe/atomic commit, không HTTP loop mỗi row | Import actual-receipt backlog; không A1/A2 COMPLETE |

<a id="decisions"></a>
### Quyết định Product đã duyệt và phần còn cần duyệt

Ba quyết định R05/R09/R10 đã chốt; không còn câu hỏi Product trong scope này. Canonical contracts sở hữu semantics; phản hồi này dẫn chỗ triển khai/bàn giao:

1. **R05 — ACCEPTED / DESIGN_READY, chưa IMPLEMENTED:** [Import §17.1](../IMPORT_MAPPING_API_CONTRACT_VI.md#preview-aggregates). Tách raw source rows và logical planned actions. Action nhiều source locations chỉ đếm một lần trong scope; totals file/sheet có thể chồng lặp và không cộng thành batch total. Totals/page cùng pinned preview/digest, không lấy page length. Dùng projection I04 hiện có, không endpoint aggregates riêng.
2. **R09 — ACCEPTED / DESIGN_READY, chưa IMPLEMENTED:** [Planning §17](../PROCUREMENT_API_CONTRACT_VI.md#history-captured-budget). RunSummary trả effective limit/currency tại acceptance, không current cap/spend/remaining balance. Old Run thiếu evidence trả availability rõ và nullable evidence, không zero giả. Giữ financial reads và list snapshot/pagination N9.
3. **R10 — split-report DEFERRED:** [Import §8.4](../IMPORT_MAPPING_API_CONTRACT_VI.md#schema-correction). Không hỗ trợ ghép recipe qua nhiều file/sheet trong đợt hiện tại; giữ scope ambiguity blocker, không auto-union/last-file-wins. Single-sheet assembly hợp lệ giữ semantics hiện hành. Split-report identity/completeness không là câu hỏi Product chặn bàn giao guards đã có evidence.

Không hỏi lại Owner self-approval/profile policy, public reset/session revocation, invitation consent/decline, retention không thời hạn, N6 nullable facts hay current permissions. Việc chọn slice/ETA triển khai DESIGN_READY là điều phối công việc, không thiếu một quyết định nghiệp vụ mới. Các mục đã tạm dừng/deferred không được mở lại ở đây.

### FE nối phần nào ngay, phần nào chờ

- **Có thể cập nhật wire và nối với môi trường chạy đúng source T:** Import basis/provenance/diagnostics/opening/count/source-context hiện hành; N6; N9 với filters cũ; N10/J01/N11 khi có locator. M03 descriptors quyết định field/source requiredness. Có source artifact chưa chứng minh môi trường đang chạy cùng build.
- **B1/B2:** có thể làm FE public adapters/screens từ schema B; runtime dùng chung chờ tích hợp. A02/A05/A06/A07 và N7 public POST kiểm exact Origin, không đòi session CSRF; protected mutations giữ CSRF. Verification/reset hoàn tất rồi login riêng, account mới không Store. Không lưu fragment proof/password vào browser storage/log.
- **Chờ B3 hoàn tất:** decline IN01 và Invitation/Offer/List/Event extensions. Không ship B3 chỉ vì route có trong OpenAPI WIP. Chờ backend sửa structural consent schema; không nới FE validator để che drift.
- **Chờ các slices chưa mở:** R03/R04/R06/R07/R08/R11/R12/R13. R05/R09 đã có accepted design nhưng chờ DTO/OpenAPI/runtime handoff của slice triển khai; split-report R10 deferred, không chặn nối guards hoặc single-sheet behavior hiện hành.
- **Demo S4.11 riêng:** API base `http://localhost:18001`, FE Origin `http://localhost:5173`; demo DB `shelfcash_integration_s411` ở5433. Theo [FULL_TEST_FLOW](../runbooks/FULL_TEST_FLOW.md), đây không phải Auth demo hoặc hai DB acceptance. Worker readiness/Stores/grants/fixtures và khả dụng hiện tại **không verified trong audit này**.
- **Auth Gmail demo riêng:** API base `https://localhost:8102`, exact FE Origin `https://localhost:5173`; DB/role `shelfcash_auth_demo` ở5434. Nguồn [Auth feature](../../../backend-auth-self-service/docs/features/AUTH_SESSION.md#local-gmail-smokedemo-profile). HTTPS + credentials include + Secure cookie, FE tự cấu hình HTTPS/screens/adapters. Không suy BE launcher khởi động FE. Chỉ smoke đã được reported, workflow/browser chưa verified. Không dùng base này cho Import/Planning acceptance chung.
- Không có endpoint/release tích hợp A1/A2+B1/B2/B3 được chứng nhận trong lượt này. Không dùng provider/worker/config default của artifact để suy live readiness. Health chỉ liveness.

### Delta cần đồng bộ khi tích hợp

ACCEPTED DECISION docs mới chỉ sửa tại backend tổng. Khi tích hợp, reconcile các phần tương ứng trong worktree Import/Auth với canonical [Import §8.4/§17.1](../IMPORT_MAPPING_API_CONTRACT_VI.md) và [Planning §17](../PROCUREMENT_API_CONTRACT_VI.md#history-captured-budget): R05/R09 từ proposal sang ACCEPTED / DESIGN_READY; R10 split-report từ Product question sang DEFERRED. Đồng bộ status/backlog tương ứng với [roadmap tổng](../ROADMAP.md), giữ riêng WIP A2/B3 và receipts/evidence lịch sử. Không copy nguyên contract tổng lên nhánh để ghi đè delta của phiên; review từng section khi được phép tích hợp.

OpenAPI/DTO/source hiện hành và ba artifacts source snapshot dưới đây giữ nguyên: chúng chưa có R05/R09 runtime extension. Contract design được duyệt không làm artifact trở thành release mới; chỉ cập nhật source-generated wire khi slice runtime đã triển khai và verified. Lượt docs này không sửa hai worktree, FE hoặc receipts lịch sử.

### Artifacts đã bàn giao và phần thiếu

| Path chính xác dưới backend tổng | Nội dung / giới hạn |
| --- | --- |
| `docs/handoff/010_BE_CAPABILITY_RESPONSE_VI.md` | Tài liệu này; bảng, trace, provenance, synthetic examples và giới hạn evidence |
| [docs/handoff/010_openapi_main.json](010_openapi_main.json) | Source T tại HEAD nền chung; 54 operations/50 paths |
| [docs/handoff/010_openapi_import-wip.json](010_openapi_import-wip.json) | Source I có cả A1 và A2 WIP; 54/50; chưa integrated release |
| [docs/handoff/010_openapi_auth-wip.json](010_openapi_auth-wip.json) | Source B có B1/B2 và B3 WIP; 59/55; chưa integrated release |

Examples JSON ở [R00](#r00) nằm trong chính tài liệu này, không có ZIP hoặc gói docs mới. Còn thiếu: artifact release hợp nhất có build identity; B1/B2/A1/A2 frozen code-to-executed-log receipts; B3 final acceptance/true-only schema; executed request IDs cùng fixtures/config môi trường FE; real credential-email/browser evidence. Không đọc/copy secret hoặc operational private artifacts để lấp chỗ thiếu.

<a id="snapshot"></a>
## 1. Snapshot, authority và phương pháp

Năm contract đọc ở backend tổng: [API_CONTRACT](../API_CONTRACT.md), [Authorization](../AUTHORIZATION_CONTRACT_VI.md), [Import](../IMPORT_MAPPING_API_CONTRACT_VI.md), [Planning](../PROCUREMENT_API_CONTRACT_VI.md), [Notification](../NOTIFICATION_API_CONTRACT_VI.md). Đối chiếu delta contracts/CURRENT_STATE/ROADMAP ở từng worktree với routes/DTO/writers/consumers. [DECISIONS](../DECISIONS.md), ADR-007/013 và [ADR-A1](../../../backend-import-sales-stockout/docs/adr/ADR-A1-observed-stockout-demand-policy.md) giữ đúng trạng thái authority; proposal trong roadmap không biến thành accepted design.

| Mã | Root / branch | HEAD | Snapshot source OpenAPI, +07:00 | Trạng thái WIP |
| --- | --- | --- | --- | --- |
| T | `D:\hocc_bk\ai\proj\projectMLAI\backend`; `feat/import_mapping_rules` | `b1ede89a3919230ce9526337537d7a19ca182f15` | 13/10/2026 18:07:31 | Không tracked source modifications; bốn untracked inputs/receipts/ZIP có sẵn. Handoff mới không nằm trong baseline |
| I | `D:\hocc_bk\ai\proj\projectMLAI\backend-import-sales-stockout`; `feat/import-sales-stockout` | Cùng HEAD T | 13/10/2026 18:07:39 | 100 status entries lúc capture; A1 reported COMPLETE, A2 acceptance in progress; code/docs/migrations/tests chưa commit |
| B | `D:\hocc_bk\ai\proj\projectMLAI\backend-auth-self-service`; `feat/auth-self-service` | Cùng HEAD T | 13/10/2026 18:07:43 | 80 status entries lúc capture; B1/B2 reported COMPLETE, B3 source đang làm; chưa commit |

CURRENT FACT: HEAD chung không chứa các deltas I/B chưa commit. Artifact ghi `x-shelfcash-handoff` gồm root/branch/HEAD/thời điểm, Git status đầy đủ, SHA256 manifest source và cờ guards. Manifest tính trên source/docs/tests/scripts/Alembic, không runtime/private/.env. Mỗi tree ổn định giữa trước/sau generation (`stable_during_generation=true`); đây không phải frozen snapshot của toàn phiên A2/B3.

Generation dùng Python process riêng với `-B`, môi trường lọc, Settings cưỡng chế `_env_file=None`, provider/LLM/all worker flags OFF; audit hook chặn đọc `.env`, file mutation của child, network/subprocess; chặn psycopg/Engine.connect. Chỉ gọi `app.openapi()`, không TestClient/lifespan/server/DB. Parent ghi đúng ba artifacts vào handoff ở T; không overwrite artifacts của phiên khác. Đây là kiểm chứng cấu trúc mới thực hiện, không HTTP/persistence acceptance.

Migrations **theo source**, không kiểm DB ở lượt này: T head0017; I `0017→0019_sales_stockout→0021_import_support_history` (A2 WIP); B `0017→0018_email_verification→0020_password_reset_delivery→0022_invitation_decline` (B3 WIP). Không copy/merge heads. Backend business logic, FE và hai worktree không bị sửa trong audit; rollback lượt này chỉ là các handoff files mới.

<a id="evidence"></a>
## 2. Evidence và giới hạn

| ID | Loại evidence / nguồn | Điều chứng minh và giới hạn |
| --- | --- | --- |
| E0 | CURRENT FACT: ba OpenAPI vừa sinh và static routes/DTO trace | Có operation/query/schema tại source snapshot; chưa chứng minh server, DB, workers, HTTP response hoặc deployment |
| E1 | HISTORICAL REPORTED: [B CURRENT_STATE](../../../backend-auth-self-service/docs/CURRENT_STATE.md), [B ROADMAP](../../../backend-auth-self-service/docs/ROADMAP.md), [AUTH_SESSION](../../../backend-auth-self-service/docs/features/AUTH_SESSION.md) | B1/B2 COMPLETE với fake-delivery/isolated PostgreSQL/fresh-session/recovery/races; Gmail smoke accepted/inbox user-confirmed là evidence riêng. Không có raw executed acceptance receipt gắn manifest WIP này được đọc; không claim rerun/pass mới |
| E2 | HISTORICAL REPORTED: [I CURRENT_STATE](../../../backend-import-sales-stockout/docs/CURRENT_STATE.md), [I ROADMAP](../../../backend-import-sales-stockout/docs/ROADMAP.md), ADR-A1 | A1 COMPLETE với isolated PG/fresh reads/correction/causal forecast/replay/Planning; A2 vẫn in progress. Không có real-data forecast quality/full FE/full-suite claim; không chứng nhận cả A2 WIP bằng A1 evidence |
| E3 | HISTORICAL REPORTED ở [T CURRENT_STATE](../CURRENT_STATE.md), [Import schema inventory](../features/IMPORT_SCHEMA_INVENTORY.md); static test/source trace bên dưới | Lát3 opening/count/setup/source fences/recipe blockers đã có patch và báo cáo synthetic public-flow/guarded PG/fresh-read coverage. Không có receipt/hash khóa chính xác historical executed snapshot trong handoff; test-file presence chỉ mô tả coverage, không PASS |
| E4 | HISTORICAL INFORMATION: [S4.11 feature](../features/S411_FE_INTEGRATION.md), [T CURRENT_STATE](../CURRENT_STATE.md), [008 FE receipt](../../008_Implementation_Receipt.md) | Các backend/API/browser segments hoặc FE controlled/intercepted tests thuộc snapshot lịch sử ghi trong nguồn; không live acceptance của deltas đang audit. S4.11 PARTIAL, whole mapping/browser/PDF/history limits giữ nguyên |

Không chạy pytest/acceptance/DB/reset/server/email trong lượt này. Không cộng các nhóm tests overlapping thành tổng unique. Không lấy setup-DB tests ở lượt trước làm evidence A1/B1/B2 pass. Khi nguồn chỉ nói “results reported in conversation”, handoff ghi **reported**; không bịa commands, counts hoặc request IDs.

E4 snapshot cụ thể: 008 FE receipt ghi baseline `9b5e31e9bb873a45b50fb6c6796f69b59284e953` trên `main` cùng các thay đổi FE chưa commit, không phải backend HEAD `b1ede89` hoặc deltas A/B. Receipt báo344 unit/workflow/boundary và8 browser cases ở controlled/mock/intercepted scope, live health probe connection refused; không dùng chúng để đóng live R00/R01/R02/R13. T CURRENT_STATE ghi tag backend `v1.0` tại `cf6732e` là HISTORICAL INFORMATION; không gắn các historical S4.11 gates vào snapshot mới chỉ vì tên feature giống nhau. B1/B2/A1/lát3 reports không cung cấp frozen code manifest của execution tại các nguồn đọc được; đó là thiếu provenance cần bàn giao, không tự gán các PASS lịch sử cho mọi WIP hiện tại.

Artifacts Auth lịch sử đọc JSON cấu trúc: `backend-auth-self-service/runtime/verification/b1-openapi/current.json` có57 operations/53 paths; `b2-openapi/current.json` có58/54; `b3/before.json` byte-identical B2 current (SHA256 `b1657c88bf41bbdd129de43caaae8c2077ed7572d962a58a95c87584fbb25f8f`). Chúng chứng minh inventory trước B3, không chứng minh tests pass hoặc gắn toàn bộ source WIP mới với execution cũ. Private Gmail receipt/cert/settings/account inputs không được đọc.

<a id="r00"></a>
## 3. R00 — delta runtime/wire và examples

### Artifact FE nào đang được so sánh

Yêu cầu010 ghi FE OpenAPI SHA256 `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`, 54 operations/50 paths. File thực đọc read-only tại `D:\hocc_bk\ai\proj\projectMLAI\Shelfcash_FE_v2\api-contract-v2\generated\openapi.json` có SHA256 `6336bc0cdbe5f260389838934ba946cd51887af1b551c763b5beb4437e5e7e1f`, vẫn54/50. Hai bytes snapshots không giống; không khẳng định hash trong yêu cầu sai hay cùng bản. Delta dưới đây tính từ **file FE thực đọc** đến T vừa sinh.

| Phần FE artifact cũ còn thiếu | Delta T verified bằng JSON/source |
| --- | --- |
| Recipe/source evidence | `ProvenanceValue.source_value`; `RecipeLineProvenance.quantity_basis`; recipe normalization/whole-yield semantics theo Import §6; giữ raw source khác canonical quantity |
| Supplier price/MOQ | Schema `SupplierTermSemantics`; `PreviewRow.supplier_term_semantics`, `CommitRowReference.supplier_term_semantics`. Có source price/basis/price quantity+unit/canonical denominator/MOQ basis/quantity+unit/conversion evidence; không đổi canonical term thành source-unit values |
| Excel parser/mapping | `SourceContext.date_format` có EXCEL_SERIAL, `pack_cost_basis` enum có PER_SOURCE_UNIT; `SheetInfo.excel_date_system/header_row/preamble_rows/preamble_samples/suggestion_diagnostic`; schema SuggestionDiagnostic; MappingIssue candidates/reasons/ignore hints |
| Opening stock | Schema OpeningValue/InventoryEffect; Schema/ProfileSpec/FieldOptions/selected-type/PreviewGroup/canonical-domain unions có **mười** domains, thêm opening_stock; PreviewRow before/after union và inventory_effect; CommitRowReference.inventory_effect |

Không phải mọi raw source input model đều reachable trong OpenAPI closure. `app/application/contracts/import_domains.py` và M03 [descriptors](../../app/application/import_descriptors.py) sở hữu typed source fields/requiredness; reusable source basis cũng đi qua rules/shared-value sources, không suy chỉ từ property name mới trên HTTP request.

Delta I so với T: A1 `SalesSource.is_stockout`, `SourceContext.missing_stockout/stockout_aliases`, `PreviewRow.normalized_source_stockout/stockout_update/sales_contributions`, completion contributions; A2 thêm calendar_events/promotion_observations/usage_history/purchase_history vào domains/category filters, history corrections/record projection và permissions-v3. Inventory vẫn54/50; A2 chưa COMPLETE.

Delta B so với T: bốn POST B1/B2: `/api/v1/auth/register` A02, `/auth/email-verifications/complete` A05, `/auth/email-verifications/request` A06, `/auth/password-reset/request` A07; B3 POST `/api/v1/staff-invitations/{invitation_id}/decline` IN01. Schemas mới RegistrationRequest/PublicEmailRequest/PublicEmailAcceptance/error envelope/DeclineInvitation/DeclineReceipt; Invitation.status/declined_at, InvitationEvent.kind, OfferRead.can_decline. N19 accept **vẫn type boolean**. Tổng59/55 là B WIP, không cộng với I thành release mới. Prose dự kiến72/66 không phải route inventory thực tế.

T OpenAPI SHA256 `d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d`; I `24cad7d12090301b4993c3b68924a47b5fe1f2d29ece1e19f67f1e922b022c2d`; B `cfd80d728652aef08d86b39cd70cb90662ca0f0cf76f6b40edcb337112040ceb`. Hash bao gồm provenance extension; không đồng nhất với bytes artifact lịch sử không có extension.

### Synthetic examples cùng schema source snapshot

Các JSON sau **không phải captured live responses**, không có real proof/credentials/request IDs. Validation cấu trúc theo artifacts kèm theo; password/token request chỉ tham chiếu schema, không in giá trị. Chúng không thay integration acceptance.

Schema B `RegistrationRequest`, A02 request:

```json
{"email":"holder@example.test","display_name":"Người dùng thử"}
```

Schema B `Envelope_PublicEmailAcceptance_`, A02/A06/A07 HTTP202:

```json
{"data":{"next_action":"check_email","delivery":{"status":"accepted"},"retry_after_seconds":60},"meta":{"request_id":"synthetic-010-accepted"},"error":null}
```

Schema B `Envelope_CompletedCredential_`, A05/N7 HTTP200:

```json
{"data":{"next_action":"login","completed_at":"2026-10-13T02:00:00Z"},"meta":{"request_id":"synthetic-010-completed"},"error":null}
```

Schema B `PublicEmailErrorEnvelope`, A02/A06/A07 HTTP503; header Retry-After60:

```json
{"data":null,"meta":{"request_id":"synthetic-010-unavailable"},"error":{"code":"EMAIL_DELIVERY_UNAVAILABLE","message":"Email delivery unavailable","details":{"reason_codes":["EMAIL_DELIVERY_UNAVAILABLE"]}}}
```

Schema T `ProvenanceValue`, **field fragment**, không complete I04 response:

```json
{"source_value":"100","origin":"DETERMINISTIC_DERIVED","applied_rule_ids":[],"value_source":"SOURCE_COLUMN","source_column_index":2,"declaration_id":null}
```

Schema T `InventoryEffect`, **field fragment** cho opening, không actual receipt:

```json
{"origin":"OPENING_STOCK","lot_id":"00000000-0000-0000-0000-000000000071","before_quantity":null,"after_quantity":"5","quantity_delta":"5","movement_type":"COUNT_CORRECTION","unit":"g","observed_at":"2026-10-13T02:00:00Z"}
```

Full I04/I06 response closures nằm trong artifact T; [Import feature examples](../features/IMPORT_CANONICAL_COMMIT.md) và canonical contract sở hữu workflow. Còn thiếu captured success/error/examples của một release chung và environment fixtures many-page/no-cap/zero-cap/expiry/invitation states. Không phát accounts/Store IDs hoặc request IDs giả như live evidence.

<a id="r01"></a>
## 4. R01 — B1/B2 trace và ba lớp evidence email

- Routes và DTO: [B auth router](../../../backend-auth-self-service/app/api/auth.py), `register`, `request_verification`, `complete_verification`, `request_password_reset`; [auth contracts](../../../backend-auth-self-service/app/application/contracts/auth.py) `RegistrationRequest`, `PublicEmailRequest`, `PublicEmailAcceptance`, `CredentialCompletion`, `CompletedCredential`. B artifact xác nhận cả bốn operation; N7 `/auth/credentials/complete` giữ route cũ.
- Writer B1: [EmailVerification.request/complete](../../../backend-auth-self-service/app/application/use_cases/email_verification.py), [email repository](../../../backend-auth-self-service/app/repositories/email_verification.py), [migration0018](../../../backend-auth-self-service/alembic/versions/0018_email_verification.py). Availability check trước account lookup; acceptance atomically lưu state/token digest/encrypted delivery intent; completion thiết lập verified proof/password, không session/Store/grants.
- B2: [PasswordReset.request](../../../backend-auth-self-service/app/application/use_cases/password_reset.py), [reset repository](../../../backend-auth-self-service/app/repositories/password_reset.py), [migration0020](../../../backend-auth-self-service/alembic/versions/0020_password_reset_delivery.py). Consumer thật [AuthUseCases.complete](../../../backend-auth-self-service/app/application/use_cases/auth.py) N7 dùng stored SETUP/RESET purpose/credential revision, atomic password change/token consume/session revocation; request tự nó không revoke session/grants. EMAIL_VERIFY thuộc A05, không N7.
- Delivery: [EmailVerificationDelivery](../../../backend-auth-self-service/app/application/use_cases/email_verification_delivery.py), [PasswordResetDelivery](../../../backend-auth-self-service/app/application/use_cases/password_reset_delivery.py), [durable_delivery](../../../backend-auth-self-service/app/application/use_cases/durable_delivery.py), [transport](../../../backend-auth-self-service/app/infrastructure/email_verification_transport.py), [main composition](../../../backend-auth-self-service/app/main.py). Intent/SMTP dispatch sau transaction, bounded recovery; generic202 accepted không nói delivered.
- **Fake-delivery acceptance reported COMPLETE:** E1. Static coverage tương ứng [test_email_verification](../../../backend-auth-self-service/tests/integration/test_email_verification.py) `test_public_signup_verify_login_empty_stores_and_no_authority`, `test_pending_delivery_recovered_in_fresh_process`; [test_password_reset](../../../backend-auth-self-service/tests/integration/test_password_reset.py) `test_public_reset_fake_delivery_n7_relogin_and_all_old_sessions_revoked`, `test_reset_preserves_existing_store_membership_and_grants`, expiry/purpose/races/rollback. Liệt kê test symbols chỉ giúp reviewer tìm coverage, không xác nhận PASS mới.
- **Gmail smoke:** E1 feature/CURRENT_STATE ghi một non-token SMTP smoke accepted và inbox được user-confirmed; private receipt không đọc. Chưa real signup/verify/reset mail-chain acceptance. **Browser E2E/deployment:** chưa verified; không suy từ HTTPS health/CORS hoặc fake delivery.

T/I chưa có public issuance routes; existing N7 không chứng minh A07 đã integrated. Artifact B2 lịch sử58/54 phù hợp B1/B2 inventory; artifact B hiện59/55 có B3. Cần frozen B1/B2 slice handoff trước khi gọi đó là release của FE.

<a id="r02"></a>
## 5. R02 — decline đang B3; consent drift còn mở

T và B cùng có [AcceptInvitation.consent](../../app/application/contracts/staff.py): StrictBool, validator yêu cầu `value is True`. False bị validation422, không tạo DECLINED event/membership. Artifact cả ba vẫn `AcceptInvitation.properties.accept.type=boolean`, chưa const/enum true-only: **TECHNICAL DEBT cấu trúc verified**, backend cần sửa; FE không nới validator hoặc dùng false shortcut.

B WIP có [staff router](../../../backend-auth-self-service/app/api/staff.py) IN01; [DeclineInvitation/DeclineReceipt/OfferRead](../../../backend-auth-self-service/app/application/contracts/staff.py); [StaffUseCases.decline](../../../backend-auth-self-service/app/application/use_cases/staff.py), migration [0022_invitation_decline](../../../backend-auth-self-service/alembic/versions/0022_invitation_decline.py). Source đọc thấy holder/current proof/issuer authority/catalogue, CAS/idempotency fences, state pending→declined, event/receipt và cancel delivery cùng transaction; không tạo membership/grants. Các extensions status/timestamp/can_decline thấy trong B OpenAPI.

Đây là **CURRENT FACT source WIP**, không B3 COMPLETE. [B3 API test](../../../backend-auth-self-service/tests/api/test_invitation_decline_openapi.py) tồn tại không chứng minh lifecycle/race/replay acceptance đã pass. Còn chờ B3 final report, accept schema correction, terminal/reissue/filter parity và fresh persistence/concurrent outcomes evidence. Auth CURRENT_STATE còn58/54 và roadmap còn ghi decline là slice riêng: giữ đúng B1/B2 boundary, báo drift source59/55 thay vì sửa lịch sử.

<a id="r10"></a>
## 6. R10 — source-before-reuse và recipe conflict đã ở backend tổng

CURRENT FACT T, không chỉ I WIP:

1. [import_analysis.discover](../../app/application/import_analysis.py) tạo source_context issue unresolved khi analyze; signature/candidates không positive source proof. [ImportStaging.resolve](../../app/application/use_cases/import_staging.py) xử lý M04 source_context: candidate theo Store/source_system_key/report_type/signature, active/nonretired pin và basis/declarations compatibility; ambiguous không auto-bind. `ImportStaging._bindings` yêu cầu declaration/resolved actor/exact scope, trả SOURCE_CONTEXT_REQUIRED/CONFLICT. Preview/confirm/commit/worker đi qua binding/lifecycle/dependency fences. N5 approval không thay source proof.
2. [import_preview.make_preview](../../app/application/import_preview.py) nhóm Product/version; hơn một source sheet_id thì thêm RECIPE_SOURCE_SCOPE_AMBIGUOUS cho các locations. File khác có sheet_id khác nên hai full reports không union, kể cả headers/version khớp. Rule bảo thủ chặn split parts; Product đã deferred split-report identity/completeness và assembly cross-file/sheet ngoài đợt hiện tại. Single-sheet assembly hợp lệ với header/duplicate/version/period checks tiếp tục hoạt động. Existing version/content conflict và sealed-batch atomic blockers giữ nguyên.
3. FE dùng M02 source_context issue→M04 declaration/evidence→M01 pin/spec→I04 preview; không khai lại khi batch context đã established. I03 chưa nhận established-source declaration trước analyze, nên chưa tự skip M04 cho một file mới chỉ vì signature cũ. Đây là giới hạn workflow, không một trust flag còn thiếu.

E3 reported coverage ở T CURRENT_STATE; static tests có [test_import_source_reuse](../../tests/integration/test_import_source_reuse.py): `test_same_headers_new_entity_does_not_imply_profile_change`, `test_pending_signature_only_pin_has_no_source_authority`, `test_retirement_after_acceptance_blocks_worker_and_fresh_reuse`; [test_import_recipe_basis](../../tests/integration/test_import_recipe_basis.py) `test_two_recipe_reports_same_version_never_union_distinct_ingredients` có reverse upload order, source locations, blocked confirmation; [setup stock](../../tests/integration/test_import_setup_stock.py) whole-chain fresh Store/atomic rollback/stale preview.

Không có rerun/executed receipt cho toàn bộ yêu cầu negative matrix source-absent/same-signature-different-source/retire-preview-commit-race trong lượt này. Coverage source giúp kiểm đúng patch; muốn đóng full public acceptance cần executed results gắn frozen snapshot, không chỉ test-file presence. Phần split-report identity/completeness là DEFERRED theo [quyết định đã chốt](#decisions), chưa field/DTO/consumer được hỗ trợ và không chặn bàn giao current guards/single-sheet assembly.

<a id="pending"></a>
## 7. Các DESIGN_READY còn thiếu runtime

| Mục | Trace có thể kiểm ở cả T/I/B | Missing delta; roadmap hiện hành |
| --- | --- | --- |
| R03 | [import router M01/M02](../../app/api/import_staging.py), [Progress/MappingList](../../app/application/contracts/import_mapping.py), ImportStaging.summary/mappings | M02 chỉ sheet_id/review_only/status/include_details/limit/cursor. Chưa file_id/origin/counter_scope/batch+filtered totals/snapshot extension. [Import §17](../IMPORT_MAPPING_API_CONTRACT_VI.md) là design, chờ preview/mapping backlog của [ROADMAP](../ROADMAP.md); A2 history không mở mục này |
| R04 | PreviewRow/provenance/source_locations/line_provenance/nested_provenance/inventory_effect/supplier_term_semantics; [parser](../../app/infrastructure/import_parser.py) giữ cached values/physical locations | I04 chỉ files/preview/rows/classification/include options hiện có; chưa projection=source_effect/file/sheet/source_cells/typed planned_effect. Private parser facts không phải public bounded raw-cell projection. Import §17, roadmap preview backlog |
| R06 | [Supplier model](../../app/models/supplier.py), Import commit supplier adapter; [StockWrites.receive](../../app/application/use_cases/stock_writes.py), [N6 router](../../app/api/stock_writes.py) validate same-Store reference | Không GET `/stores/{store_id}/suppliers` ở artifacts. [API SU01](../API_CONTRACT.md#today-operations) đã chốt supplier.read/nullable reference/no cost leak; roadmap supplier discovery. Supplier writer/cost terms không thay picker |
| R07 | [N9 history router](../../app/api/history.py) `runs`, [PublicPlanning.history](../../app/application/use_cases/planning_public.py), [RunSummary](../../app/application/contracts/history.py) có created_by/accepted_at | Query allowlist chưa created_by_user_id/created_date_from/to; chưa timezone/applied_filters. [Planning §17](../PROCUREMENT_API_CONTRACT_VI.md) và roadmap retained-history backlog; không dùng forecast_start như created date |
| R08 | [planning_exports router](../../app/api/planning_exports.py) accept/download; [PlanningExports](../../app/application/use_cases/planning_exports.py); J01 dispatch ở import job router | Chỉ POST collection và GET item, chưa GET EX01 collection. Retained rows/private verified PDF bytes không tạo discovery API. Planning §17 + roadmap PDF/S4.11 pending; retention policy đã chốt |
| R11 | [staff router](../../app/api/staff.py), [StaffUseCases](../../app/application/use_cases/staff.py), current grant writer/repository/audit | Không permission-requests routes/DTO/workflow. N12 catalogue Owner-only không Staff request catalogue. [Auth PR01–PR04](../AUTHORIZATION_CONTRACT_VI.md#permission-requests) accepted; roadmap Auth collaboration, chưa slice số được giao |
| R12 | Main composition/route artifacts không notification API; existing InvitationDelivery/email intents thuộc purpose khác | NF01–NF03 DTO/storage/materializer/count/read state/producers chưa có. [Notification contract](../NOTIFICATION_API_CONTRACT_VI.md#notification-v1) toàn DESIGN_READY. Roadmap notification là slice riêng; B3 decline không tự hoàn thành inbox |

Các pending trên gắn vào [roadmap tổng hiện có](../ROADMAP.md), [roadmap Import](../../../backend-import-sales-stockout/docs/ROADMAP.md) (A2 in progress tại snapshot), [roadmap Auth](../../../backend-auth-self-service/docs/ROADMAP.md) (B1/B2 complete; decline/notification slices riêng). Không tạo roadmap song song hoặc tự đặt tên A3/B4/ETA. Một số bullet roadmap tổng vẫn gọi provisioning/decline cần Product chốt hoặc Today PROPOSAL, trong khi năm contract đã ghi DESIGN_READY/ACCEPTED; đây là **documentation drift**, không lý do hỏi lại policy đã chốt. Bổ sung Product chỉ cập nhật canonical R05/R09/R10 và status/backlog liên quan tại repo tổng; các drift khác để owner cập nhật ở slice liên quan, không sửa worktree đang chạy.

R09 trace riêng: [RunSummary](../../app/application/contracts/history.py) không budget, trong khi [Planning public DTO](../../app/application/contracts/planning_public.py) có `BudgetAtAcceptance` trong accepted configuration cho C03. Product đã chấp nhận N9 captured-budget extension ở [Planning §17](../PROCUREMENT_API_CONTRACT_VI.md#history-captured-budget), trạng thái DESIGN_READY; RunSummary runtime vẫn chưa có extension. Không suy budget column đã implemented từ C03 consumer.

<a id="r13"></a>
## 8. R13, opening/count và A1/A2 consumer limits

CURRENT FACT T: [import_commit.SUPPORTED](../../app/application/import_commit.py) có mười domains gồm opening_stock, không inventory_receipts. [import_opening_stock.receipt_semantics/write_opening](../../app/application/import_opening_stock.py) nối `InventoryUseCases.receive_in_transaction(..., opening=True)` và shared InventoryReceiptRecord ledger. Opening tạo physical remainder/COUNT_CORRECTION baseline0; [inventory_count writer](../../app/application/use_cases/inventory.py) chỉnh retained lot bằng delta, không hàng thực nhận.

[N6 StockReceiptRequest](../../app/application/contracts/stock_writes.py), StockWrites và InventoryUseCases đã có form ACTUAL_RECEIPT; đây là writer tái dùng **trong tương lai** cho [Import §16](../IMPORT_MAPPING_API_CONTRACT_VI.md#excel-actual-receipt): stable namespace/source_record_id, aware observation, nullable real facts, expiry/late receipt, Excel↔form dedupe và atomic mixed groups. Chưa typed Excel actual-receipt schema/descriptors/preview/commit consumer trong T/I/B; FE chưa advertise ở M03.

Opening code/registry10/schema artifact đã ở committed T HEAD; vì vậy các câu “WIP lát3/chín schemas” còn ở Import §8.4/current feature summaries không mô tả đúng source hiện tại. E3 ghi synthetic public intake/commit/fresh-session/BOM/readiness/custom Planning coverage; chưa có receipt khóa historical execution vào exact HEAD này, whole FE chưa verified. Không gọi nó là finalized deployed release hoặc nâng opening/count thành actual receipt. Canonical document drift cần chỉnh trong slice owner, không đổi lịch sử receipts ở audit.

I A1: [SalesDaily](../../../backend-import-sales-stockout/app/models/sales_daily.py), [import_sales_groups](../../../backend-import-sales-stockout/app/application/import_sales_groups.py), [forecast_demand](../../../backend-import-sales-stockout/app/application/forecast_demand.py) `demand_estimates/usable_histories`, [domain stockout.reconstruct](../../../backend-import-sales-stockout/app/domain/forecasting/stockout.py), baseline/trained preparation/capture/replay và retained Planning là consumer thật. Nullable observation khác inferred stockout; observed quantity khác derived estimate; schema1 history giữ nguyên, schema2 có causal policy/evidence. E2 reported coverage + [A1 import tests](../../../backend-import-sales-stockout/tests/integration/test_import_stockout_a1.py), [forecast tests](../../../backend-import-sales-stockout/tests/integration/test_forecast_stockout_a1.py), [Planning test](../../../backend-import-sales-stockout/tests/integration/test_planning_stockout_a1.py) chỉ làm coverage trace. **Forecast accuracy/true lost demand chưa được chứng minh**, provisional causal estimator không accuracy certificate.

I A2: [history write](../../../backend-import-sales-stockout/app/application/use_cases/import_history_write.py), [history model](../../../backend-import-sales-stockout/app/models/import_history.py), retained I04/I06/H01/H02 đọc calendar/promotion/usage/purchase history. Current branch docs gọi chúng history-only; không inventory movement/receipt/inbound/recipe reconcile/forecast features. Purchase history không actual receipt; calendar/promotion storage không forecast accuracy. A2 final selected regressions còn đang làm, không COMPLETE theo source tồn tại.

## 9. Kiểm tra bàn giao và điểm dừng

CURRENT FACT: JSON artifacts parse và local `$ref` resolution được kiểm tra; synthetic examples được kiểm theo schemas tương ứng; Markdown links/file paths/anchors và whitespace được kiểm trước bàn giao. Audit ban đầu tạo handoff outputs ở backend tổng; bổ sung Product cập nhật trực tiếp Import/Planning contracts, CURRENT_STATE/ROADMAP và phản hồi này tại repo tổng, giữ nguyên artifacts runtime snapshot. Không đọc/in `.env`, credentials/proof, không DB tests/reset/migration, không server/email, không sửa FE/worktrees, không merge/cherry-pick/commit/push/deploy. Audit/docs dừng ở tài liệu/artifacts; không bắt đầu implementation hoặc integration.
