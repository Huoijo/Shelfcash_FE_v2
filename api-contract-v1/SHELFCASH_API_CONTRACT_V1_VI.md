# ShelfCash — bàn giao API contract FE v1 và kiểm kê coverage

Ngày kiểm kê: 09/10/2026. Version: shelfcash-fe-handoff/1.
**DESIGN / DOCUMENTATION ONLY. Core contract đã review để FE thiết kế integration; scope mở rộng còn cần đánh giá riêng, chưa có business HTTP runtime.** Phần
READY bên dưới đã review contract trong scope ghi rõ; không đồng nghĩa HTTP/auth
đã triển khai hoặc verified. Không bắt đầu implementation từ tài liệu này.

Đây là **điểm vào duy nhất** để FE tra scope/canonical routes/dependencies. Các
contract cụm giữ định nghĩa chi tiết; không copy JSON toàn bộ hoặc tạo competing
definitions. FE gốc giữ nguyên làm evidence, không override quyết định mới.

## Mục lục

- [Nguồn và cách đọc trạng thái](#authority)
- [Phạm vi v1, authority và các luồng cần review](#scope)
- [Coverage theo màn hình/luồng](#journeys)
- [Toàn bộ endpoints gốc và canonical](#routes)
- [Endpoints mới và trách nhiệm còn thiếu](#new-routes)
- [Conventions/quyền/errors và khác biệt đã đối chiếu](#conventions)
- [Chỗ kẹt end-to-end và dependencies](#gaps)
- [Trình tự review/implementation](#sequence)
- [Ready for FE, quyết định còn thiếu và verification](#handoff)

<a id="authority"></a>
## 1. Authority, nguồn và classification

| Ký hiệu | Nguồn định nghĩa chi tiết / evidence |
| --- | --- |
| FE0 | [ShelfCash_FE_BE_API_CONTRACT_v0.md](references/ShelfCash_FE_BE_API_CONTRACT_v0.md), đủ41 endpoint candidates, 0 confirmed business HTTP. |
| PLAN | [PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md), C01–C03 + mục14 cấu hình. |
| CAT | [CATALOG_MENU_RECIPE_API_CONTRACT_VI.md](CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), P01/P02 và [timeline/đổi hiệu lực](CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#recipe-effectivity), recipe→V01 dependency. |
| IMP | [IMPORT_MAPPING_API_CONTRACT_VI.md](IMPORT_MAPPING_API_CONTRACT_VI.md), I*/M*/H*/J01, creation policy mục6.1/12.3. |
| AUTH | [AUTHORIZATION_CONTRACT_VI.md](AUTHORIZATION_CONTRACT_VI.md#auth-v1), session/assisted setup/Store/current grants/Owner quản lý Staff và [invitation](AUTHORIZATION_CONTRACT_VI.md#auth-invitations); bản trước là lịch sử. |
| INV | [INVENTORY_API_CONTRACT_VI.md](INVENTORY_API_CONTRACT_VI.md), V01–V04, N6/N8; quantity/status/receipt/threshold. |
| RUNTIME | [API_CONTRACT.md](references/API_CONTRACT.md), `app/main.py`, internal use cases/contracts/models; public chỉ health. |
| S364 | [S364_TASK_NOTES.md](references/runbooks/S364_TASK_NOTES.md), [PLANNING_RUN.md](references/features/PLANNING_RUN.md); historical PostgreSQL acceptance/internal slice, không HTTP/auth/worker/config DB adapter. |
| RULES | [AGENTS.md](references/AGENTS.md), accepted ADRs và schema/domain notes. Không đổi business authority, forecast/requirements/winner/FEFO. |

**Contract states:** READY=review đủ trách nhiệm trong scope đã chỉ định;
NEEDS_REVIEW=còn contract boundary/policy/luồng chưa đủ; DEFERRED=ngoài scope hiện hành theo quyết định cụ thể;
không áp mặc định cho capability chưa có FE design; MERGED=responsibility dùng canonical route
khác, không triển khai route cũ; REMOVED=bỏ responsibility (hiện0).
Chỉ A02/C09 giữ deferred trong phạm vi hiện hành. Yêu cầu làm rõ scope mới thay
phân loại mặc định đối với dashboard/AI/what-if/approval: NEEDS_REVIEW, không tự
coi included hoặc deferred. Không đồng nhất NEEDS_REVIEW với backlog code.

**Implementation states riêng:** chưa có; nội bộ; HTTP; verified (ghi scope/evidence).
Mọi route business dưới đây **chưa có HTTP**, kể cả rows ghi “nội bộ”. S364 verified
chỉ là nội bộ, evidence từ ghi chép đã đọc; không tests chạy trong task này.
`GET /health` HTTP/verified theo ghi chép/API tests cũ, nằm ngoài41 FE business routes.
`/openapi.json` metadata framework, không readiness/business endpoint.

<a id="scope"></a>
## 2. Core v1 đã chốt và scope còn cần review theo nhu cầu khách

Thiết lập account/Store có hỗ trợ → hoàn tất credential → login/chọn Store →
Owner mời Staff/chọn quyền → Staff chấp nhận → import/mapping/preview/commit → ghi nhận lô ban đầu/hàng
thực nhận → Menu/Kho → nhập/review supplier/phí/completeness → cấu hình planning
→ nhận Run/xử lý nền → kết quả và lý do engine → lịch sử/mở lại → PDF.

**ĐÃ CHỐT**: assisted setup (A02 chưa tự đăng ký); nhận lô ban đầu/hàng thực nhận;
nhập/review supplier/phí; Product/Ingredient creation Owner explicitapproval+
creategrants/atomicimport; Storemapping Owner-only/deterministicreuse; sales
replace/confirmeddisjointmerge; count onlyidentifiedlot; default/custom/saved,
Storebudget/winner/requirements/P1–P3/Runretentionimmutable. Không hỏi lại.

**Scope bổ sung trực tiếp ngày09/10/2026:** gần hạn7 ngày, sắp hết theo ngưỡngOwner;
giữ PDF, lịch sử Run, màn hình Owner quản lý quyền Staff. C08 giữ đọc engine reasons/
warnings, không LLM generation. Unknowncost/fees/dates không0; không selectedoption,
PO hoặc confirmationofpurchase. Demo5–10 Products chỉ demo, không giới hạn sản phẩm.

| Cụm | Scope v1 hiện hành / nguồn |
| --- | --- |
| Auth/Store/Staff permissions | GIỮ A01/A03/A04/T01/T02 + N7/N12–N19; account/Store ban đầu có hỗ trợ, Owner tự mời Staff/chọn quyền, chỉ accept hợp lệ mới tạo membership/quyền. Không mời Owner. |
| Catalog/Menu/Recipe | GIỮ P01/P02 và canonical creation qua Import; THÊM N20–N22 timeline/preview/commit hiệu lực từ ngày Store kế tiếp, chưa sửa lịch sử. Không table CRUD. |
| Import/mapping/supplier/fees | GIỮ I*/M*/H*/J01/N5; IMP13–14 mở rộng đúng typed input engine, scope declarations. |
| Kho | GIỮ V01–V04/N6/N8; INV, opening quantity là số còn hiện tại, khác actualreceipt. |
| Planning config/Run/result | GIỮ C01–C03/N1–N4; PLAN, no tự đặt hàng. |
| Readiness | GIỮ R01 IMP14 canonical, C01/I06 projections, GET không compute. |
| History/reasons/PDF | GIỮ N9/C08/N10–N11, PLAN15; retained facts/currentrights, không browser screenshot hoặc LLM. |

### Authority scope hiện hành

FE0 là nguồn đối chiếu endpoint/ý định cũ, không giới hạn chức năng hoặc authority
cao hơn quyết định sản phẩm mới. Đề xuất thêm màn hình/workflow/route khi giải
quyết nhu cầu cụ thể; giữ/gộp/bỏ route theo responsibility, không theo số bảng DB
hoặc việc prototype đã vẽ. FE có thể thay đổi theo quyết định sản phẩm người dùng.

| Nhóm | Trạng thái / nhu cầu và dependencies |
| --- | --- |
| Owner quản lý Staff/quyền Store | READY N12–N19: Owner mời và chọn quyền; Staff xác minh đúng account/email, xem offer và chấp nhận. Quyền riêng từng Store, reissue thay token/version và phải xem lại offer. |
| Lịch sử/mở lại Run, PDF winner/option khác | GIỮ v1, READY N9–N11. Không cần FE0 có sẵn màn hình. |
| Chi tiết/lý do/cảnh báo engine | GIỮ v1 C04/C05/C08. C06 gộp C05 daily rows; FE chart đổi theo path/retained checkpoints, không confidence interval giả. |
| Dashboard D01 | NEEDS_REVIEW: entry/attention giúp biết việc cần làm; dependency readiness, nguồn cảnh báo và action navigation. Có giá trị vận hành, chưa chốt inclusion/deferral. |
| AI diễn giải X01/X02 | NEEDS_REVIEW: giúp đọc kết quả; dependency authorized retained facts, evidence linking, provider/privacy/failure semantics. Không thay engine reasons, chưa chốt scope. |
| What-if S01/S02 | NEEDS_REVIEW: thử giả định trước sử dụng đề xuất; dependency retained baseline, allowed hypothetical changes và comparison đúng scope. Không persist thành thực tế; chưa chốt inclusion. |
| Duyệt vượt quyền một lần | NEEDS_REVIEW: tác vụ thiếu quyền có lý do có thể cần Owner; dependency allowlist/lifetime/payload+version binding/audit/retry. Không bypass trong core hiện có, không suy tất cả đã duyệt. |
| A02 self-registration | DEFERRED theo quyết định assisted account/Store đã chốt; không mở lại. |
| C09 draft PO | DEFERRED trong scope hiện hành, không biến PDF/inspection thành order. |

C04/C05/Staff grants/history/PDF là các ưu tiên đã có authority, không hỏi lại.
Không gọi toàn bộ scope ShelfCash COMPLETE khi nhóm NEEDS_REVIEW chưa được quyết.
Đánh giá optional theo giá trị/dependencies trước hỏi sản phẩm; thiếu FE design
không phải lý do hoãn. Raw import/audit retention dài hạn và Owner lifecycle rộng
hơn vẫn review riêng, không tự purge/grant ownership.

### Những chỗ khách còn phải nhờ hỗ trợ/developer

| Luồng | Phân loại và bước cần giải quyết |
| --- | --- |
| Tạo account/Store, credential reset | Assisted đã được duyệt; phải có operator application command/delivery/audit trong AUTH, không SQL/seed. Chưa self-service do quyết định sản phẩm, không do FE thiếu design. |
| Đưa Staff vào Store | READY invitation AUTH6; N15–N19 giải quyết tự mời/chấp nhận, không developer bind. Account chưa có vẫn được hỗ trợ thiết lập/xác minh; invitation chưa accept không cấp quyền. |
| Menu đổi công thức đang open-ended | READY CAT12/N20–N22: preview đóng kỳ cũ/mở kỳ mới và commit atomic; chỉ thay ngày Store kế tiếp trở đi, chưa sửa lịch sử. Không autoclose từ import hay sửa DB thủ công. |
| Supplier có tier/mixed/percentage fees hoặc correction hồi tố | Engine hiện chỉ hỗ trợ fee modes cụ thể; contract phải báo unsupported/blocker, không developer tự bịa fixedfee. Review giá trị và semantics nếu đưa vào scope. |
| Model phục vụ/technical runtime config | Assisted versioned configuration là integration dependency; không để khách chọn artifact path hoặc giả public control đã có. |

### FE cần bổ sung hoặc đổi

Owner chọn Staff/tick quyền/audit, gửi/reissue/revoke lời mời và Staff xem/chấp nhận;
Menu timeline công thức, editor phiên bản và preview/xác nhận đổi kỳ; Run history/list/
reopen; export PDF + trạng thái job/download; Ingredient navigator/detail/issues
và chart từ C05; phân biệt captured stock/hypothetical balances/Kho hiện tại.
Không sửa design trong task này; đây là yêu cầu integration và màn hình đề xuất.

<a id="journeys"></a>
## 3. Coverage theo màn hình/luồng

| Người dùng làm gì | Endpoint IDs / nguồn | Contract | Implementation riêng | Dependency chưa code |
| --- | --- | --- | --- | --- |
| Credential/login/session/chọn Store | N7/A01/A03/A04/T01/T02 AUTH | READY | stored identity nội bộ, auth chưa có | Provision command/delivery/session/CSRF/current membership. |
| Owner tick Staff grants/xem audit | N12–N14 AUTH | READY | membership reservedpermissions=[] | Schema+catalogue+CAS+auth fence/audit. |
| Owner mời Staff/chọn quyền → Staff chấp nhận | N15–N19 AUTH6 | READY | chưa có invitation/verified identity/HTTP | Token/version/delivery, consent và membership+grants+audit atomic; account thiếu thiết lập có hỗ trợ. |
| Đổi lịch công thức → xem diff → xác nhận | N20–N22 CAT12 | READY | chỉ create/get recipe nội bộ | Timeline/applicability storage, preview/readset/CAS, next-Store-day fence và audit; không đổi ngày quá khứ/hôm nay. |
| Tạo/bind Product/Ingredient/Supplier; mapping review | I*/M*/N5 IMP6.1/13 | READY | catalog writer nội bộ, importer chưa có | Owner reviewedidentity/units/provenance, nofuzzy/LLMtruth. |
| Preview→atomic commit→completion/history | I04/I05/I06/H01/H02/J01 IMP | READY | domain writers riêng nội bộ | Transactioncomposing/importjobs/readset/idempotency. |
| Opening/new received lot; kiểm kê lô đã định danh | N6 INV / I05 IMP | READY | receive/adjust nội bộ, openingwriter chưa có | Sourceidentity+movement+receipt/auditatomic; count không tạo lot. |
| Menu/recipe→Kho/lots/movements | P01/P02 CAT; V01–V04 INV | READY | catalog/inventoryrepos nội bộ | Public scopedread/snapshots, physical/usable/completeness. |
| Owner khai báo sắp hết | N8 INV | READY | chưa có thresholdstorage | Owner-only setting/CAS, không planningconstraint. |
| Supplierterms/phí/coverage review | I*/M* IMP13 | READY | SupplierTerm create/get, callerfees nội bộ | Fee/config/declarationstorage/versionedpreview/rights. |
| Save/manage requirements/budget | N1–N4 PLAN14 | READY | detachedresolver nội bộ | DBconfigwriters/sourceversions/currentauth. |
| Actionreadiness→Run→result | R01 IMP14/C01–C03 PLAN | READY | evaluator chưa có; S364 verified nội bộ | Loader/forecastreuse/durablelocalworker/publicHTTP. |
| Engine reasons / history / PDF | C08/N9–N11 PLAN15 | READY | Run đã lưu byID nội bộ, exports chưa có | Listing/projection/renderjob/artifact/localdownload/auth. |
| Priorities/rerun | C07→C03,C10→C02 | MERGED | engines nội bộ | Read/focus khác mutation; newkeynewRun. |
| Chi tiết kết quả có nguồn | C04/C05/C08 PLAN16/15 | READY | retained candidate daily facts nội bộ | Public projection/metadata/scope/auth chưa có. |
| Chart | C06→C05 | MERGED | retained daily facts nội bộ | FE vẽ theo path, không interval giả. |
| Dashboard/AI/what-if | D01/S*/X* | NEEDS_REVIEW | workflows chưa có | Đánh giá nhu cầu/dependencies, chưa duyệt inclusion hoặc deferral. |
| Deferred hiện hành | A02/C09 | DEFERRED | chưa có public workflow | Assisted setup; không order. |

<a id="routes"></a>
## 4. Toàn bộ41 endpoint FE gốc — inventory không bỏ sót

READY là **design scope**, tất cả41 business routes chưa HTTP. FE0 dùng đối chiếu các route gốc; cột contract ghi nguồn hiện hành.
Routes mới/màn hình mới không cần có mặt trong FE0 để được đề xuất. Deferred rows vẫn giữ evidence
route gốc, **không canonical v1 route được bật**. MERGED routes không đếm hai lần.

| ID | Method | Route gốc | Contract | State | Implementation | Gap/canonical behavior |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | POST | `/auth/login` | FE0/AUTH | READY | chưa có | AUTH v1: login cookie/session/CSRF, assisted account. |
| A02 | POST | `/auth/register` | FE0/AUTH | DEFERRED | chưa có | Assisted provisioning được người dùng chọn. |
| A03 | GET | `/auth/me` | FE0/AUTH | READY | chưa có | AUTH v1: current actor/session, quyền không freeze login. |
| A04 | POST | `/auth/logout` | FE0/AUTH | READY | chưa có | AUTH v1: revoke session hiện tại, 204. |
| I01 | POST | `/stores/{store_id}/imports` | IMP9.1 | READY | chưa có | Draft only, source date context. |
| I02 | POST | `/imports/{import_id}/files` | IMP9.1 | READY | chưa có | Immutable upload bytes; not canonical writes. |
| I03 | POST | `/imports/{import_id}/analyze` | IMP9.1 | READY | chưa có | Approved profile first; sealed accepted files. |
| I04 | GET | `/imports/{import_id}` | IMP9.3 | READY | chưa có | Read inspection + immutable preview. |
| H01 | GET | `/stores/{store_id}/imports/calendar` | IMP11 | READY | chưa có | Distinct uploaded batches/Store timezone. |
| H02 | GET | `/stores/{store_id}/imports` | IMP11 | READY | chưa có | History/paging/filter scopes. |
| M01 | GET | `/imports/{import_id}/mapping-summary` | IMP9.2 | READY | chưa có | Progress/Owner full profile inspection. |
| M02 | GET | `/imports/{import_id}/mappings` | IMP9.2 | READY | chưa có | Typed issues + read-only successful bindings. |
| M03 | GET | `/imports/{import_id}/sheets/{sheet_id}/field-options` | IMP9.2 | READY | chưa có | Schema descriptors; only supported destinations. |
| M04 | PATCH | `/imports/{import_id}/mappings/{mapping_id}` | IMP9.2 | READY | chưa có | Proposal edit only; no activation grant. |
| I05 | POST | `/imports/{import_id}/process` | IMP7/8/9.3 | READY | domain writers nội bộ | Atomic allsupportedgroups; supplier/fees IMP13 included. |
| I06 | GET | `/imports/{import_id}/completion` | IMP11 | READY | chưa có | Retained commit impact + IMP14 point-in-time readiness. |
| R01 | GET | `/stores/{store_id}/readiness` | IMP14 | READY | validators nội bộ | IMP14: canonical action evaluator; no computeGET. |
| D01 | GET | `/stores/{store_id}/today` | FE0 | NEEDS_REVIEW | chưa có | Đánh giá riêng giá trị/dependencies; chưa chốt inclusion hoặc deferral. |
| V01 | GET | `/stores/{store_id}/inventory` | INV3 | READY | stock repositories nội bộ | INV3: recordedphysical/usable/completeness/statuses. |
| V02 | GET | `/stores/{store_id}/inventory/{ingredient_id}` | INV3 | READY | get lots nội bộ | INV3: Ingredient detail + initial lotpage/snapshot. |
| V03 | GET | `/stores/{store_id}/inventory/{ingredient_id}/lots` | INV3 | READY | list lots nội bộ | INV3: same-snapshot additional lotpages. |
| V04 | GET | `/stores/{store_id}/inventory/{ingredient_id}/movements` | INV3 | READY | movement reads nội bộ | INV3: canonical movement kinds/append history. |
| P01 | GET | `/stores/{store_id}/products` | CAT6 | READY | list/get persistence nội bộ | Menu read includes retail price; recipe count permission-aware. |
| P02 | GET | `/stores/{store_id}/products/{product_id}` | CAT7 | READY | recipe/catalog read nội bộ | Today's effective recipe; full recipe read permissions. |
| C01 | GET | `/stores/{store_id}/planning-context` | PLAN4 | READY | resolver nội bộ | Contract projection IMP14; DB/runtimeadapter vẫn backlog. |
| C02 | POST | `/stores/{store_id}/procurement-plans` | PLAN5–8 | READY | S364 verified nội bộ | Durable acceptance/internal capture; missing HTTP/auth/worker/forecast orchestration. |
| C03 | GET | `/procurement-plans/{plan_id}` | PLAN9 | READY | S364 retained read verified nội bộ | Public plan_id=run_id projection chưa có. |
| C04 | GET | `/procurement-plans/{plan_id}/ingredients` | PLAN16 | READY | ingredient facts nội bộ | Navigator/detail từ retained computed scope/option; no live recompute. |
| C05 | GET | `/procurement-plans/{plan_id}/ingredients/{ingredient_id}` | PLAN16 | READY | comparison facts nội bộ | Navigator/detail từ retained computed scope/option; no live recompute. |
| C06 | GET | `/procurement-plans/{plan_id}/ingredients/{ingredient_id}/forecast-series` | PLAN16 | MERGED | BOM/forecast facts nội bộ | Canonical C05 daily_balances cho chart; bỏ interval chưa có definition. |
| C07 | GET | `/procurement-plans/{plan_id}/strategies` | PLAN1/9 | MERGED | comparison/selector nội bộ | Canonical GET C03; no separate route. |
| C08 | GET | `/procurement-plans/{plan_id}/explanation` | PLAN15.3 | READY | chưa có | PLAN15.3: retained engine reasons/warnings, no LLM. |
| C09 | POST | `/procurement-plans/{plan_id}/draft-purchase-orders` | FE0/AUTH | DEFERRED | chưa có | Not auto-order/selected_option; no public PO flow. |
| C10 | POST | `/procurement-plans/{plan_id}/regenerate` | PLAN1 | MERGED | pipeline nội bộ | Canonical POST C02 with deliberate new key/Run, refreshed acceptance facts. |
| S01 | POST | `/procurement-plans/{plan_id}/scenarios` | FE0/ADR-006 | NEEDS_REVIEW | chưa có workflow | Đánh giá riêng giá trị/dependencies; chưa chốt inclusion hoặc deferral. |
| S02 | GET | `/procurement-plans/{plan_id}/scenarios/{scenario_id}` | FE0 | NEEDS_REVIEW | chưa có | Đánh giá riêng giá trị/dependencies; chưa chốt inclusion hoặc deferral. |
| X01 | POST | `/stores/{store_id}/ai/explain` | FE0/AUTH | NEEDS_REVIEW | chưa có | Đánh giá riêng giá trị/dependencies; chưa chốt inclusion hoặc deferral. |
| X02 | GET | `/ai/explanations/{explanation_id}` | FE0 | NEEDS_REVIEW | chưa có | Đánh giá riêng giá trị/dependencies; chưa chốt inclusion hoặc deferral. |
| T01 | GET | `/stores` | FE0/AUTH | READY | membership persistence nội bộ | AUTH v1: active accessible Stores/pagination. |
| T02 | GET | `/stores/{store_id}` | FE0/AUTH | READY | Store get nội bộ | AUTH v1: Store context/current grants, không cost. |
| J01 | GET | `/jobs/{job_id}` | IMP4/9 | READY | chưa có public job service | Scoped import/export jobs; planning vẫn C03 polling. |

**READY là contract design**, gồm các schema IMP13 và R01 evaluator; tất cả
business routes chưa registered HTTP. Contract ready không đủ cho live integration.

<a id="new-routes"></a>
## 5. Endpoints mới — không thêm CRUD theo bảng DB

N-label chỉ inventory tracking, không thay ID FE0. Tất cả READY design, chưa HTTP.

| Nhãn | Method | Canonical route | Source/state | Implementation | Luồng thực tế |
| --- | --- | --- | --- | --- | --- |
| N1 | POST | `/stores/{store_id}/planning-requirements` | PLAN14 READY | chưa có writer | Save mới. |
| N2 | GET | `/stores/{store_id}/planning-requirements/{saved_requirement_id}` | PLAN14 READY | chưa có public reader | Detail/version. |
| N3 | PUT | `/stores/{store_id}/planning-requirements/{saved_requirement_id}` | PLAN14 READY | chưa có writer | Replace/archive ownStaff/allOwner. |
| N4 | PUT | `/stores/{store_id}/planning-budget` | PLAN14 READY | chưa có writer | Storecap known/CAS. |
| N5 | POST | `/stores/{store_id}/mapping-profiles/{profile_id}/decisions` | IMP5/9 READY | chưa có | Owner activate/reject/retire. |
| N6 | POST | `/stores/{store_id}/inventory/receipts` | INV4 READY | receive nội bộ | Opening/newactualreceipt, không tạo lô từ kiểm kê. |
| N7 | POST | `/auth/credentials/complete` | AUTH2 READY | chưa có | Single-use setup/reset delivery an toàn. |
| N8 | PUT | `/stores/{store_id}/inventory/{ingredient_id}/threshold` | INV5 READY | chưa có | Owner ngưỡng sắp hết. |
| N9 | GET | `/stores/{store_id}/procurement-plans` | PLAN15.2 READY | retainedbyID nội bộ | StoreRunhistory/reopen. |
| N10 | POST | `/procurement-plans/{plan_id}/exports` | PLAN15.4 READY | chưa có | RenderPDF winner/option từ facts đã lưu. |
| N11 | GET | `/procurement-plans/{plan_id}/exports/{export_id}` | PLAN15.4 READY | chưa có | Protected PDFdownload. |
| N12 | GET | `/stores/{store_id}/memberships` | AUTH4 READY | storedmembership nội bộ | Owner chọn Staff/currentgrants/catalogue. |
| N13 | PUT | `/stores/{store_id}/memberships/{membership_id}/permissions` | AUTH4 READY | reservedemptyJSON | Owner fullreplacegrants/CAS/audit. |
| N14 | GET | `/stores/{store_id}/permission-events` | AUTH4 READY | chưa có | Owner đọc audit thay đổi quyền. |
| N15 | POST | `/stores/{store_id}/staff-invitations` | AUTH6 READY | chưa có | Owner mời Staff với tập quyền đã chọn. |
| N16 | GET | `/stores/{store_id}/staff-invitations` | AUTH6 READY | chưa có | Owner list trạng thái/lifecycle audit lời mời. |
| N17 | POST | `/stores/{store_id}/staff-invitations/{invitation_id}/actions` | AUTH6 READY | chưa có | Reissue đầy đủ offer hoặc revoke; CAS/token mới. |
| N18 | GET | `/staff-invitations/{invitation_id}` | AUTH6 READY | chưa có | Account đúng email đã xác minh xem Store/quyền trước accept. |
| N19 | POST | `/staff-invitations/{invitation_id}/accept` | AUTH6 READY | chưa có | Staff chấp nhận; tạo membership/quyền atomic, không cấp Owner. |
| N20 | GET | `/stores/{store_id}/products/{product_id}/recipe-schedule` | CAT12 READY | create/get dated recipe nội bộ | Timeline/version, không giả HTTP đã có. |
| N21 | POST | `/stores/{store_id}/products/{product_id}/recipe-schedule/changes` | CAT12 READY | chưa có | Preview hoặc commit explicit đổi kỳ/phiên bản, chỉ tương lai. |
| N22 | GET | `/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id}` | CAT12 READY | chưa có | Đọc lại diff/receipt/audit, không tính lại lịch sử. |

Supplier/completeness dùng I*/M* hiện có; readiness vẫn R01; export polling dùng
J01, không thêm generic supplier/config CRUD hoặc status endpoint nữa.

### Số đếm canonical routes — method+path, không đếm MERGED hai lần

| Phạm vi | Số |
| --- | --- |
| FE0 đã đối chiếu | 41 |
| Gốc giữ trong core đã review | 31 READY |
| Gốc cần scope/contract review riêng | 5 NEEDS_REVIEW (D01,S01/S02,X01/X02) |
| Gốc MERGED | 3 (C06→C05,C07→C03,C10→C02) |
| Gốc DEFERRED | 2 (A02,C09) |
| Gốc REMOVED | 0 |
| Routes mới có contract | 22 READY |
| Canonical core v1 đã review | 53 =31 giữ +22 thêm |
| READY design trong53 core | 53 |
| Candidate routes chưa tự đưa vào v1 | 5 NEEDS_REVIEW, không tính vào53 |

Không tính health/OpenAPI ngoài businessinventory. C04/C05 nay giữ v1; C06 gộp C05. Không thêm route chi tiết mới; optional candidates
không thành approved scope chỉ vì có FE0 route. Supplier extension không tăng route.

<a id="conventions"></a>
## 6. Conventions chung và đối chiếu khác biệt

Nguồn chi tiết là PLAN2/CAT5/IMP4/9; bảng chỉ thống nhất cách FE đọc/adapt.

| Khác nhau / concept | Quy tắc handoff và scope |
| --- | --- |
| FE0 opaque example IDs vs cluster UUID | Resource IDs dùng UUID canonical lowercase. OptionId/snapshot/cursor/version opaque theo DTO, không ép UUID. Example FE0 như store_001 là fixture, không accepted production ID. |
| FE0 integer VND vs cluster exact money | MoneyText decimal string, Store.currency, không currency conversion hoặc display formatting vào API; C03 exact cost fractions giữ theo PLAN, không ép MoneyText display thành arithmetic truth. |
| Quantities/ratios/loss | QuantityText exact canonical; process_loss_rate decimal string [0,1). Fill requirement PercentText0..100 khác exact fulfilled ratio; P25/P50/P75 khác strategy. |
| Dates/timestamps | Business DATE theo timezone Store; event timestamps RFC3339 UTC, không source missing date fallback upload time; P02 hôm nay khác recipe trong từng ngày của Run. |
| Envelope | Success data/meta/error=null; failure data=null/meta/error structured code/message/details; success request_id/warnings theo clusters; 202 chỉ accepted job/Run, chưa completed. |
| Warnings khác shape | Shared code/message/details; IMP thêm severity/field/entity/impact mandatory domain extension. FE parse typed extension, không bỏ provenance/severity hoặc mutate các contracts thành shape khác. |
| Null/zero/[] | Unknown/unavailable/forbidden khác known zero/known empty. P01 count availability flags; P02 thiếu quyền whole denial; missing recipe null khác empty recipe. |
| Paging | limit50/max100/cursor ở paged reads; **C01 saved list không paging** theo reviewed contract. Summary/total filtered/all Store scopes đúng DTO, không page-length totals. |
| Product status | Canonical active boolean→active/paused adapter; không invent timed pause/lifecycle delete. Kho theo INV2: gần hạn7, ngưỡng sắp hết do Owner khai báo, watch khi unknown; không prototype risk. |
| CAS/version | Immutable profile version, proposal/import revision, saved/budget version, recipe integer version khác nhau. If-Match/If-None-Match đúng per mutation; absent428, stale412; source/preview stale409 không silent recompute. |
| Idempotency | Scope/digest per endpoint/phase trong clusters, không giả mọi mutations dùng một digest. Decimal numeric equivalence C02 như PLAN6; file bytes content hash exact. GET không mutation/LLM/solver. |
| Async | Import dùng J01/job_id; Planning C03 same run_id=plan_id polling. Không buộc FE gọi separate forecast training hay dùng J01 cho C02. |
| S364 internal serialization vs public counts | S364 giữ large Python/JSON integers exact nội bộ; PLAN public domain_size dùng UnboundedCountText string. HTTP mapper phải theo public DTO, không gửi raw retained engine JSON rồi để JavaScript Number mất precision. |
| Cache/read snapshots | Partition actor/Store/permission/resource/version; không mix Menu current/Kho current với retained Run; no-store private policy CAT giữ nguyên. |

Session/CSRF/CORS/errors đã định nghĩa AUTH v1; cookie session và current auth
fence, không bearer transport thứ hai. QuantityText của Kho/Import là decimal
string; ExactQuantity/SignedDelta của C03 là rational object, không cùng JSON type.
Các conventions đã nhất quán đủ để FE dựng DTO/adapters cho READY scope, không
enable live endpoint bởi capability fixture true.

### Quyền và errors đã thống nhất trong scope reviewed

Owner quyền trong đúng Store; Staff explicit grants; server resolves resource
Store và rechecks membership/permission từng read/retry/commit. Mapping activation
Owner-only, approval khác import write. Commit atomic toàn groups, missing rights
không drop rows. Menu.read gồm retail price, không procurement costs/budget.
C01/C02/C03 full-response denial nếu thiếu planning+budget.read+cost.read; config
writes không đòi cost.read vì không trả cost. P01 recipe count redaction có flag
khác P02/Planning/IMP whole-response denial; không toàn app tự bật redaction.

Chung:400 malformed request;401 unauthenticated;403 missing rights trong scope biết;
404 resource ngoài scope/not found;422 validation/filter;409 state/key/preview conflict;
412 stale CAS;428 required precondition;413 size limits;503 temporary unavailable/
verified integrity unavailable. Domain codes giữ chi tiết từng cluster, không
HTTP2xx fake error data hoặc500 cho failed retained Run GET hợp lệ.
One-time approval chưa allowlist/lifecycle: không automatically approval_allowed
true, không shared Owner key. Auth/catalogue/enforcement là dependency bắt buộc
trước expose; màn hình Owner grant editor cũng đã giữ trong v1.

<a id="gaps"></a>
## 7. Luồng xuyên suốt và giới hạn cần FE biết

| Boundary | Contract hiện hành / dependency implementation |
| --- | --- |
| Login→Store→grants | AUTH provision/token/session/currentactive; không có Store không loop403; Owner chỉ Store mình. |
| Catalogbootstrap→stock | IMP createsentities atomic; N6 actualreceivedlot, không kiểm kê lô chưa định danh→receipt. |
| Toàn bộ tồn kho completeness | Explicit khai báo toàn bộ lot IDs hoặc confirmedempty IMP13, stale versions invalidate; nhận một lô không proof toàn bộ tồn kho Store. |
| Supplier/fees→planning | Strict datedterms/fullpayablecoverage+contextdeclarations, unknownblocked; unsupported feeconditions không silentlydrop. |
| Forecast/preflight→capture | IMP14/PLAN7 scope chính xác+digest lịch sử+actualartifact/modelconfiguration; missingdate≠0, GET no computation. |
| Config→Run/background | Acceptedrequirements immutable, operationalcapture riêng; S364 chỉ nội bộ, public worker/auth/loaders cần slice. |
| Result→C08/history/PDF | Retainedaggregate/proofscope, currentrights; không live recalculation/LLM/autoorder. |

Core đã review có định nghĩa API; **chưa gọi toàn scope sử dụng đầy đủ READY**.
Invitation và workflow đổi hiệu lực công thức đã review, chưa có runtime;
optional Dashboard/AI/what-if/approval cần quyết định theo giá trị/dependencies. Runtime end-to-end vẫn kẹt vì chưa có auth/HTTP/import/
config+declarations loaders/worker/PDF; đó là backlog implementation, không policy OPEN.
Supplier lịch sửpricecorrection/tierfees và lifecycle Owner rộng hơn không supported
v1 này; không gọi genericExcel ghi mọi bảng. Unknowninputs khách phải bổ sung
explicitfacts; không bịa0/expiry/MOQ để làmready.

ADR013 authorizedmapper selfapproval cần future supersedingADR theo Owner-only
policy; ADR008 additiveblanket wording cần điều kiện confirmeddisjointsalesmerge.
Không sửa acceptedADR. CURRENT_STATE/S364 notes không đổi, không pretend runtime
đã theo các design mở rộng trong lượt tài liệu này.

<a id="sequence"></a>
## 8. Review và implementation theo dependencies — chưa bắt đầu code

Invitation và lịch công thức đã chốt trong AUTH6/CAT12. Review kế tiếp: đánh giá
Dashboard/AI/what-if/approval theo giá trị và dependencies ở bảng mục2; không
mặc định included/deferred và không mở lại policy invitation/ngày hiệu lực.
Phân biệt thiếu authority sản phẩm với các adapter/runtime chưa code.

Sau khi scope tương ứng được chốt, thứ tự implementation đề xuất:

1. Auth/session/Store assistedprovisioning/credentialcompletion + permissioncatalogue,
   Owner Staff grants/invitation/verified identity/delivery/CAS/audit, migrations/auth
   fences được giao riêng.
2. Catalog scopedreads + import stagedbytes/profiles/Owneractivation; atomic catalog/
   sales/recipe commit và source identity/provenance; timeline/preview/atomic recipe
   effectivity sau catalogue/auth, không tự đóng kỳ từ import; no LLM canonical truth.
3. Kho reads/receiptopening+actual/threshold+countbridge, auditatomic/idempotency,
   then Supplierterms/fee/context/completeness importstorage/adapters.
4. Planning saved/budget DBconfiguration/versionguards + coherent R01/C01 evaluator;
   exactforecastprepare/reuse + registry model thực dùng adapter, no algorithmchange.
5. C02/C03 public authorization + durable local one-process worker composition atop
   S364; scopes/exclusions/capture/retention/errorrecovery/OpenAPI contractverification.
6. C08 retainedprojection + lịch sử Run theo Store + PDFjobs/localartifacts/authdownload.
   End-to-end acceptance fresh-session committedstate, không chỉ HTTP2xx.

Bắt đầu bằng slice1 sau authorization implementation riêng. Không source/tests/
DB/solver trong task documentation; không tự tiếp tục implement.

<a id="handoff"></a>
## 9. Bàn giao FE, quyết định ngoài scope và verification

**Ready để FE thiết kế integration trong scope v1 đã chốt:** Auth/Store/grants,
Catalog/Menu/Recipe, Import/Mapping/Supplier/fees/declarations, Kho/receipts/threshold,
Readiness, Planning/config/C01–C05, engine reasons/history/PDF, invitation và đổi kỳ công thức tương lai. 53 canonical routes
READY design; **0 business HTTP live verified trong task**. FE dùng contracts cụm
được link, không prototypes hoặc fileFE0 để override semantics mới.

Không còn quyết định sản phẩm chặn invitation và đổi kỳ công thức trong scope đã
chốt: Owner tự mời, Staff chấp nhận quyền theo Store; chỉ thay hiệu lực từ ngày Store
kế tiếp, chưa sửa lịch sử. Các nhóm ngoài scope đã review vẫn cần đánh giá riêng:
Dashboard/AI/what-if/one-time approval; Owner lifecycle/reactivation rộng hơn;
raw import/audit retention dài hạn. Không tự grant ownership, purge evidence hoặc
coi các nhóm này đã được duyệt. Thiếu runtime là implementation backlog riêng.

Verification lượt trước là HISTORICAL: inventory41 với18READY/10NEEDS_REVIEW/
11DEFERRED/2MERGED,23/11 trong34; đó là trước khi hoàn thiện gaps, không count mới.
Phạm vi verification lịch sử bên dưới:
JSON syntax, typedexamples/routes43/source41/permissions/links/UTF-8/whitespace,
FE0 SHA-256 và protectedsource/WIP hashes. Không pytest/solver/DB/OpenAPI runtime,
không design/code/migrations/acceptedADR/statusWIP/commit/push/ZIP.

Verification lượt hoàn thiện gaps trước làm rõ scope — HISTORICAL PASS:

- Script Python đọc tài liệu qua `.\.venv\Scripts\python.exe -`: 26 JSON examples
  parse hợp lệ; 99 links/anchors local đúng đích, anchors không trùng, UTF-8 và
  whitespace hợp lệ. Kiểm types ví dụ quantity/cost/count, fee basis/coverage,
  readiness.can_execute và permission catalogue dùng keys thống nhất.
- Đối chiếu đủ41 ID/method/route FE0, không thiếu/trùng;29 READY/10 DEFERRED/
  2 MERGED.14 routes thêm,43 cặp method+path canonical không trùng;0 REMOVED.
- SHA-256 FE0 giữ `648946afd476324603b7cdf8a7b810c41eaeb5cdbab0a1357aec49cb79cf6dde`.
  363 file nguồn/tests/migrations/ADRs/tài liệu ngoài phạm vi được chụp hash trước
  chỉnh sửa vẫn giữ nguyên. Không suy hash unchanged thành runtime verified.
- `git diff --check -- docs/AUTHORIZATION_CONTRACT_VI.md docs/INVENTORY_API_CONTRACT_VI.md docs/IMPORT_MAPPING_API_CONTRACT_VI.md docs/PROCUREMENT_API_CONTRACT_VI.md docs/SHELFCASH_API_CONTRACT_V1_VI.md`: exit0.
  Các file untracked cũng được kiểm whitespace trực tiếp bằng script.

Acceptance trong contract là specifications chưa thực thi. Không tests/solver/DB,
không PDF artifact thực, HTTP/OpenAPI runtime hoặc full regression trong task này.

HISTORICAL — cập nhật authority scope trong lượt làm rõ: priority contracts giữ và bổ sung
C04/C05; C06 mergeC05; optional NEEDS_REVIEW. Số hiện hành45 reviewed core routes,
5 FE candidates cần review,2 deferred,3 merged; không dùng số43 của verification
lịch sử để gọi scope hiện hành COMPLETE. Chưa implement hoặc sửa design FE.

Verification lượt làm rõ scope — HISTORICAL PASS: script Python đọc ba tài liệu chỉnh sửa
kiểm17 JSON examples,60 local links/anchors, UTF-8/whitespace, exact41 endpoint
FE0. Trạng thái hiện hành31READY/5NEEDS_REVIEW/2DEFERRED/3MERGED;14 additions,
45 reviewed canonical method+path không trùng.363 protected source/WIP files giữ
hash; `git diff --check` scoped ba docs exit0. Không tests/solver/DB hoặc implement.
Ở lượt lịch sử này câu hỏi invite Staff còn pending; đã được trả lời và thay bằng
AUTH6/N15–N19 trong lượt hiện hành, không dùng pending cũ làm policy.

Verification invitation + hiệu lực công thức — PASS, hiện hành 09/10/2026:

- Python qua `.\.venv\Scripts\python.exe -`: 10 JSON examples parse hợp lệ,
  45 local links/anchors đúng đích; anchors duy nhất, UTF-8/whitespace hợp lệ.
  Đối chiếu đủ41 ID/method/route gốc; 31 READY/5 NEEDS_REVIEW/2 DEFERRED/3 MERGED.
  22 routes thêm, **53 canonical READY design**, không trùng method+path; N15–N22
  có định nghĩa đúng route trong AUTH6/CAT12, catalogue permissions-v2 thống nhất.
- 365 files nguồn/tests/migrations/ADRs/tài liệu ngoài ba file được giao giữ nguyên
  SHA-256 so với snapshot trước lượt sửa. FE0 hash giữ nguyên như ghi bên trên;
  không sửa Procurement/Import/Inventory hoặc WIP S3.6.4.
- `git diff --check -- docs/AUTHORIZATION_CONTRACT_VI.md docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md docs/SHELFCASH_API_CONTRACT_V1_VI.md`: exit0;
  file untracked cũng được script kiểm whitespace trực tiếp.

Acceptance là specification chưa chạy. Không tests/solver/DB, HTTP/OpenAPI runtime,
code/migrations/accepted ADRs/commit/push/ZIP. Không còn câu hỏi chặn invitation và
hiệu lực tương lai; optional scope ở mục2 vẫn cần review, không gọi toàn bộ COMPLETE.
