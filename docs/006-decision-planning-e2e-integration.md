# #006 — Decision / Planning E2E integration

- ID: #006 — Milestone 09.
- Ngày tạo lập: 11/10/2026.
- General Context: nối màn hình Dự đoán / Kế hoạch nhập hiện có với Auth/Store và public planning contract đã bàn giao; giữ nguyên kiến trúc FE và thiết kế MagicPath. Đây là artifact review, không phải chứng nhận staging.
- Phạm vi evidence: code FE hiện tại, toàn bộ baseline V1 do audit đọc, planning/auth/readiness liên quan, current V2 OpenAPI và handoff BE, MagicPath read-only, controlled tests và probe local mới. Không có Python source/runtime BE trong checkout để tự chạy lại các bài BE.

## 1. Executive status

**PARTIAL.** FE đã triển khai canonical planning flow và kiểm thử `VERIFIED_CONTROLLED`; chưa có `VERIFIED_LIVE`. `http://localhost:18001` từ chối kết nối, kể cả probe read-only ngoài sandbox. Điểm chặn đầu tiên trước session bootstrap A03; không có session, Store hay Run thật được xác minh.

Canonical flow trong cả baseline V1 và current V2 là **C01 → R01 theo ngày chọn → C02 → C03 → C04/C05/C08**. Chuỗi ForecastRun → DecisionRun → Decision Brief trong mô tả milestone không tồn tại dưới các route đó trong package hiện hành. FE không phát minh route hay orchestrate engine primitives. What-if, contextual AI và chuyển sang PO chưa được triển khai; các control hiện có giữ disabled và giải thích giới hạn.

Nguồn authority: [V1 aggregate, public planning](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md), [V2 handoff delta](../api-contract-v2/CONTRACT_HANDOFF_DELTA_VI.md), [current OpenAPI](../api-contract-v2/generated/openapi.json), [public planning implementation handoff](../api-contract-v2/docs/features/PUBLIC_PLANNING.md), [procurement contract](../api-contract-v2/docs/PROCUREMENT_API_CONTRACT_VI.md), [source evidence manifest](../api-contract-v2/generated/source_evidence.json). BE `IMPLEMENTED` bên dưới là evidence của handoff/archived tests, không phải Python vừa được đọc/chạy lại hoặc live acceptance.

## 2. User E2E flow

```text
Login A01 → session authority A03 → current Store T02 → existing AppShell
  → /forecast → /forecast/planning
  → C01: ngày gợi ý, defaults, budget ceiling, capabilities
  → R01: readiness cho chính forecast_start_date đang chọn
  → C02: explicit create, một request + một Idempotency-Key
  → C03: queued/running → completed hoặc failed, cùng run_id
  → Tổng quan / Phương án: retained planning_result/1
  → C04: navigator nguyên liệu, optional option_id, cursor
  → C05: retained chi tiết nguyên liệu và daily LOW/BASE/HIGH
  → C08: engine reasons đã lưu, không phải hội thoại AI
```

Forecast prepare/reuse, BOM, FEFO, procurement/2, comparison/2 và selector/1 nằm **bên trong BE worker**, không thành chuỗi browser calls. Không gọi train, không dựng ingredient-demand, không tính lại basket hoặc winner ở FE.

`/forecast/planning?plan_id=<UUID>` là locator để đọc lại C03 qua session và Store hiện hành. `/forecast/planning/results` là FE alias, giữ query/hash; không phải endpoint backend. Return sau Login chấp nhận đúng protected prefix, giữ locator/hash, không nhận foreign origin hoặc prefix lookalike. Refresh/re-entry không lấy business truth từ localStorage. Locator rỗng/sai/khác Store không cho thao tác trên kết quả cũ; có retry hoặc bỏ locator để thiết lập mới, không tự chuyển Store.

Đường đã triển khai là logic FE/controlled responses. Các bước trên chưa được chứng minh bằng live BE/browser.

## 3. API orchestration

`IMPLEMENTED/HANDOFF` = BE package công bố implemented; `VERIFIED_CONTROLLED` = FE boundary/workflow/SSR checks; **mọi hàng đều BLOCKED_LIVE** hiện tại.

| Stage | Method | Path | Purpose | Status |
| --- | --- | --- | --- | --- |
| Session | POST | `/api/v1/auth/login` (A01) | AuthProvider hiện có; real credentials/CSRF, không auth riêng cho Planning | Existing FE; controlled regression pass; chưa live |
| Session authority | GET | `/api/v1/auth/me` (A03) | Bootstrap trước protected UI | Existing FE; probe connection refused |
| Current Store | GET | `/api/v1/stores/{store_id}` (T02) | Current Store/membership/effective permissions | Existing FE; controlled regression pass; chưa live |
| Setup | GET | `/api/v1/stores/{store_id}/planning-context` (C01) | Defaults/version, current budget ceiling, readiness/capabilities | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Selected-date gate | GET | `/api/v1/stores/{store_id}/readiness?actions=planning&forecast_start_date=YYYY-MM-DD` (R01) | Không lấy default-date C01 readiness làm authority cho ngày khác | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Create | POST | `/api/v1/stores/{store_id}/procurement-plans` (C02) | Chấp nhận durable Run; included cookies + shared CSRF + Idempotency-Key | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Poll/resume | GET | `/api/v1/procurement-plans/{plan_id}` (C03) | Retained status/configuration/scope/options/winner | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Ingredient navigator | GET | `/api/v1/procurement-plans/{plan_id}/ingredients` (C04) | Optional `option_id`, opaque `cursor`; không suy totals từ một trang | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Ingredient detail | GET | `/api/v1/procurement-plans/{plan_id}/ingredients/{ingredient_id}` (C05) | Optional `option_id`, retained names/facts/day balances | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |
| Engine reasons | GET | `/api/v1/procurement-plans/{plan_id}/explanation` (C08) | Optional `option_id`; deterministic retained evidence, không LLM | IMPLEMENTED/HANDOFF; VERIFIED_CONTROLLED; BLOCKED_LIVE |

Shared A04 logout/session invalidation giữ nguyên. Planning không tự gọi T01 để đoán Store, R01 `actions=forecast` để đòi thêm `sales.read`, hoặc endpoint engine nội bộ. Đây là danh sách runtime integration; không có business POST nào thực sự được gửi trong probe live lần này.

C02 body chỉ có `requirements_mode`, `forecast_start_date` và các nhánh hợp lệ `default_requirements_version`, `requirements`, `saved_requirement_id`. Setup sử dụng default hoặc custom cho budget override; không dựng UI saved-requirements mới. Không gửi `strategy`, `cutoff`, `horizon`, `engine_mode`, `model_id`, `forecast_run_id`, `currency`, `scenario_count`, `random_seed` hoặc Open PO.

C01/R01 cần `planning.context.read` + `budget.read` + `procurement.cost.read`; C02 cần `planning.run` + money rights; C03–C05/C08 cần `planning.result.read` + money rights. Setup cũng đòi result rights để không tạo một Run người dùng không thể đọc. Không suy permission từ nhãn Owner/Staff. Revoked grants khóa thao tác và ẩn cached sensitive context/result; response Store mismatch bị từ chối. BE vẫn là authority cho mọi authorization.

## 4. Canonical vs compatibility surfaces

| Surface được yêu cầu/audit | Evidence hiện hành | FE classification / decision |
| --- | --- | --- |
| `forecast-runs` / separate forecast polling | Không có public route trong V1/V2 OpenAPI được bàn giao | NOT_PRESENT; forecast orchestration nội bộ C02 worker; không gọi |
| `ingredient-demand` | Không có public primitive route | NOT_PRESENT; dùng retained C05 simulation, không tự BOM |
| `procurement-plans` | Canonical C01–C05/C08, `planning_result/1` | CANONICAL; dùng trực tiếp; không coi là compatibility-only |
| `plan-runs` | Không có route được bàn giao | NOT_PRESENT; không invent alias backend |
| `decision-runs` raw / raw Decision Package | Không có public route | NOT_PRESENT; không đưa engine raw lên UI |
| Decision Brief route | Không có route riêng | NOT_PRESENT; C03 condensed projection là nguồn product result, không đổi tên thành API Brief |
| Explanation | C08 retained engine reasons có thật | CANONICAL C08 được dùng; contextual AI explanation là capability khác, chưa có |
| What-if | Không có route/semantics public hiện hành | NEEDS_REVIEW / PRODUCT GAP; disabled, không fake preview/result |
| PO compatibility bridge | C09 được ghi DEFERRED trong contract; không có runtime bridge | DEFERRED; không tự chọn option/convert/create PO |
| Planning history N9 | GET Store procurement-plans đã implemented trong V2 | Có backend thật; chưa consume vì thiết kế hiện tại không có workflow History; không fake local list |
| PDF N10/N11 | Handoff có artifact/export surface | Có backend; ngoài controls được yêu cầu của thiết kế đang dùng; không consume |

Không gọi những route absent là “deprecated” hay “compatibility” khi không có evidence. Đây không phải V1→V2 đổi topology: V1 đã dùng procurement-plans. `lean/balanced/protected` là construction/result strategies; LOW/BASE/HIGH là customer demand paths, không phải mapping cho control Ưu tiên. Engine/resource policy mặc định do server quyết định; FE không thêm engine mode từ suy đoán.

## 5. MagicPath → API mapping

Read-only project `458079658328604672` (ShelfCash · Ghép cột). Setup component `458414835571515392`, revision `458416333273579520`; Results `458423352311304192`, revision `458595022460325888`. Đã đọc full code context và xem render của hai component; không sửa MagicPath. Reuse existing shared shell, grayscale spacing/cards, setup/footer, result tabs/three-card layout/navigator. Không thêm shell hay redesign.

| Control/component | FE field/behavior | Canonical request field | Response source / boundary |
| --- | --- | --- | --- |
| Dữ liệu tính đến ngày | Date input cutoff theo thiết kế; derive start=cutoff+1, không gửi cutoff riêng | `forecast_start_date` được derive | C01 date hints; C03 `configuration` là accepted fact; không fallback latest business date thành default start |
| Lập kế hoạch cho | Select cố định 7 ngày; hiển thị start=cutoff+1, end=start+6; calendar bounds validation | Không có horizon field | C01 default date, R01 selected-date prerequisites, C03 accepted range; không UTC-shift date-only |
| Ngân sách trống | Inherit server accepted ceiling; unknown không phải unlimited | Default mode/version, hoặc null/omission theo custom semantics | C01 budget ceiling; C03 resolved budget/currency |
| Ngân sách override | Exact decimal, zero hợp lệ; vượt ceiling báo lỗi không clamp | Custom full `requirements`, thay `budget_limit` | Copy đầy đủ resolved paths/rates/overrides từ C01; không reset customer requirements |
| Ưu tiên | Giữ ba pills nhưng disabled, không default chọn giả Balanced | Không có canonical input | Không biến UI choice thành strategy, LOW/BASE/HIGH hoặc hidden request |
| Open PO | Disabled và unchecked | Không gửi | C01 capability false; không hứa engine đã tính pending PO |
| Advanced / stochastic | Unavailable theo capability, không random scenario | Không gửi | C01 scenarios false, horizon cố định; không vì schema khác có field mà tự bật |
| Readiness/footer/CTA | Check đúng ngày; blocked/unknown/no rights/busy đều không tạo | R01 query; C02 chỉ sau explicit click | R01 `actions[]`: action=planning, availability/can_execute/execution_status/blockers/warnings; không đọc nhầm `can_generate` của C01 |
| Create/pending | C02 receipt → C03, không coi 202 là success result | Một body/key theo intent | `run_id`, status, `accepted_at`, PollMeta; không invent success `request_id` |
| Result KPI cards | Chi phí canonical; global service/risk hiển thị chưa có dữ liệu | Không có | C03 costs; không tự average product service, tính budget utilization hoặc tạo critic score |
| Kế hoạch mua / warnings | Exact purchases + canonical notices; UUID khi chưa captured name | Không có | C02/C03 meta.warnings, C03 errors/result/forecast warnings; optional Notice.details; C04 captured name chỉ trong cùng snapshot |
| Phương án | Render ba strategy references; bấm chỉ inspect option, không đổi winner | Optional `option_id` cho read fragments | C03 strategies/options; ba references có thể cùng một basket; không tạo ba phương án giả |
| Nguyên liệu / detail panel | C04 navigator + paging, C05 detail; mua-row drill-down đọc C04 trước C05 nếu cần | `option_id`, `cursor`, ingredient locator | C04/C05 retained capture; không lấy live Menu/Inventory metadata để vá snapshot |
| Detail chart panel | Bảng daily LOW/BASE/HIGH exact facts trong panel hiện có | Không có | C05 daily balances, không dựng P25/P50/P75 curve/confidence interval; chart visual fidelity còn giới hạn bởi data shape |
| Lý do engine | Explicit read action, structured reasons/proof/gaps/exclusions | C08 optional `option_id` | Deterministic retained evidence; không gọi nó là Hỏi AI |
| Thử kịch bản / Hỏi AI | Existing affordances disabled với lý do | Không gửi | Không có supported endpoint; không fixed chat/scripted recommendation |
| Chuyển sang PO | Disabled, không tự ghi canonical data | Không gửi | C09 deferred; future product/contract gate riêng |
| Planning History | Không thêm local history/UI ngoài thiết kế | Không gửi N9 | N9 có thật, cần thiết kế riêng; không lẫn Import H01/H02 |

Budget input MoneyText giữ exact decimal strings (tối đa 18 integer/18 fraction); requirement PercentText 0–100, tối đa 32 fractional digits. Đây là input bounds, không áp vào rational output. C03 costs/quantities giữ exact numerator/denominator authoritative; decimal_view và service.percent_view là display projection của server, không tính ngược exact facts từ text hiển thị. UI không dùng float để quyết định budget/service/quantity hoặc unit conversion.

## 6. State machine

FE-only phases: `setup`, `loading_context`, `creating`, `pending`, `result`, `error`. Chúng là UI/workflow state, không ghi đè server Run status.

- C01 load → setup; thay date → abort R01 cũ → selected-date R01 mới. C02 chỉ chạy sau valid defaults/version/capabilities/current grants/readiness cho cùng ngày.
- C02 durable acceptance → lưu `run_id` trong memory và URL → GET C03. `queued`/`running` dùng server `meta.poll_after_ms` (canonical 2000); terminal hint 0 không có timer mới. C03 HTTP200/status failed vẫn là terminal failure, không network success business.
- `completed` với eligible winner → result; `completed/no_eligible_candidate`, `no_computable_products`, `computation_blocked` → no-winner semantic state. `failed` → failure + retained partial facts nếu server có; không đổi thành completed.
- Tối đa 60 automatic poll attempts; hết lượt chỉ dừng timer FE, không hủy server Run, không đánh dấu failure, không POST lại. User có thể GET kiểm tra tiếp.
- Transport/protocol/5xx khi C02 chưa có known receipt → uncertain; giữ nguyên deep-copied request + UUID key, explicit retry cùng intent. Không automatic replay. Một retry 403/422 **không chứng minh** POST cũ chưa được nhận, nên không xóa uncertainty/key. Initial definitive rejection trước mọi uncertainty có thể giải phóng intent.
- Known C02 receipt nhưng C03 lỗi → retry GET Run đó; tuyệt đối không POST C02 lại. Reset/new intent bị chặn khi busy/uncertain.
- Context refresh trong pending Run giữ poll hint cũ; không làm timer biến mất. StrictMode effect cleanup giải phóng request locks, hủy old work, cho mounting read lặp lại an toàn.
- Store-keyed page/controller + AbortController + independent core/readiness/inspection epochs chặn late responses. URL change ẩn/khóa old result trước hydration; grant removal ẩn sensitive cached content. Không Store auto-switch.
- C03 response_version đổi → clear fragments. C03 **không có** result_digest/schema_version; C04/C05 pin cùng digest/version, C08 cùng digest. Không đòi C04/C05 version bằng C03 version vì contract không bảo đảm. Cursor/option/total drift hoặc duplicate row → clear inspection, không merge partial pages âm thầm.

Intent chưa rõ outcome chỉ ở memory của mounted Planning page: refresh, rời route, Store change hoặc session unmount đều làm mất nó. UI cảnh báo giới hạn này; **không có cross-navigation/reload uncertain POST recovery**. URL chỉ giúp resume sau known Run ID. Per-Store intent journal/leave protection là TECH DEBT, không âm thầm thêm local persistence.

## 7. Decision result semantics

| Concept | Handling hiện tại |
| --- | --- |
| `recommendation.available=false` trong yêu cầu milestone | Không có field này ở C03 hiện hành. Dùng outcome + nullable winner/options canonical; không invent DTO. Không winner không đồng nghĩa proven infeasible. |
| No eligible / blocked / no computable | Hiển thị đúng terminal outcome, exclusions/notifications và facts còn giữ; không render fake purchase recommendation. |
| Failed + verified partial winner | Giữ status failed, nhãn một phần, retained costs/purchases/evidence để kiểm tra; không tuyên bố recommendation đã hoàn tất. |
| Null metrics vs zero | Null/missing = chưa có/không áp dụng, không hiển thị 0 hoặc 100%. Budget 0 và known zero costs vẫn là giá trị thật. requested=0 với product_services[].service=null không thành 100%. |
| Strategy comparison | Source strategies có thể collapse vào một option; winner của server không đổi khi inspect strategy khác. Cost/feasibility/construction path được giữ riêng. |
| Service | Product/path exact facts; không có Store-global fill rate và không average thành KPI mới. Customer requirement feasibility khác construction feasibility. |
| Risk / critic | Không có global risk KPI/critic narrative/score trong C03. Giữ unknown/unavailable và structured engine evidence, không tạo green safe label. |
| Procurement rows | Ingredient/supplier/term IDs, packs, exact quantities, arrival/expiry, outlay được đọc từ result. Không invent supplier name, pack size hay order date không được chụp. |
| Fees | Total/payable fees theo canonical option; delivery_fees null là unknown classification, không zero. Không cộng aggregate fees lặp trên từng purchase row. |
| Ingredient demand | C05 là retained BOM/simulation daily paths và balance, không calibrated P25/P50/P75, không physical stock hiện tại. Không tự tính demand từ product forecast. |
| Names | Captured display_name chỉ dùng khi name_availability=captured; missing/null → UUID với trạng thái chưa chụp, không live metadata fallback. |
| Proof / reasons | C08 giữ customer/construction gaps, proof/provenance/exclusions riêng. No-pass không tự thành certified infeasible; engine reasons không AI answer. |

## 8. Live integration evidence

Probe mới trong lượt triển khai, target public local base `http://localhost:18001`; không đọc/gửi credentials, cookie, CSRF hoặc token. Không tạo/import/mutate business records, không tự start BE worker hay bootstrap DB.

| Step | Method/path | Status | request_id | Safe IDs | Outcome |
| --- | --- | --- | --- | --- | --- |
| Initial health | GET `http://localhost:18001/health` | curl exit 7; HTTP000 | Không có HTTP response | Không có | Connection refused trong sandbox |
| Confirm network diagnosis | GET `http://localhost:18001/health` read-only ngoài sandbox | curl exit 7; HTTP000 | Không có | Không có | Cùng lỗi; không quy lỗi riêng cho sandbox |
| First E2E authority gate | GET `http://localhost:18001/api/v1/auth/me` read-only ngoài sandbox | curl exit 7; HTTP000 | Không có | Không có user/store/run ID | Không tới được A03; đây là first live blocker |
| Auth / Store / C01 / selected-date R01 | Không chạy được tiếp sau connection gate | NOT_VERIFIED_LIVE | Không có | Không có | Không có session/Store thật để tiếp tục |
| Forecast internal / C02 / C03 result | Không gửi C02 khi chưa Auth/Store | NOT_VERIFIED_LIVE | Không có | Không có | Không claim Forecast/Decision/Brief live |
| C04/C05/C08 | Không có live Run để inspect | NOT_VERIFIED_LIVE | Không có | Không có | Explanation chưa live |
| What-if / contextual AI / PO | Không có supported runtime route | NOT_IMPLEMENTED | Không có | Không có | Disabled; không pretend verification |

HTTP000 là curl chưa nhận HTTP response, không phải status do BE trả. Không có request_id để suy ra hoặc tự điền. Local frozen OpenAPI được dùng để kiểm tra drift; **không fetch được live OpenAPI**.

Khi environment reachable: xác minh A01→A03→T02 bằng tài khoản được cấp, C01/R01 đúng ngày, C02 receipt/key, C03 cùng Run qua queued/running/terminal, C04/C05/C08 cùng retained aggregate và authorization. Kiểm tra worker enablement/liveness, Store readiness và business outcomes; giữ safe IDs/request references từ response thật. Không dùng fixture thành bằng chứng live.

## 9. Concerns / issues

| ID | Concern | Evidence | Impact | Classification | Owner | Recommended next action | Blocking? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M09-01 | Request topology khác package canonical | V1 aggregate + V2 OpenAPI/C01–C08; absent forecast-runs/decision-runs/brief routes | Không thể implement literal request chain | CONTRACT DRIFT (request/spec vs package, không V1→V2 drift) | PO + BE/FE | Chấp nhận C02 worker + C03 projection là product flow; nếu muốn API mới cần contract riêng | Literal chain: yes; safe canonical FE: no |
| M09-02 | Local BE không reachable | Fresh health/A03 probes exit7/HTTP000 trong và ngoài sandbox | Không Auth/Store/live business verification | LIVE ENVIRONMENT BLOCKER | BE/DevOps | Cấp environment hoạt động + account hợp lệ; kiểm tra dedicated planning worker liveness | Yes, live completion |
| M09-03 | UI priority không có request semantics | C02 body không strategy; strategy result ≠ customer paths | Không map pills tùy tiện | PRODUCT GAP | PO + BE | Định nghĩa priority semantics hoặc bỏ control ở design revision; hiện disabled | Priority: yes; canonical defaults: no |
| M09-04 | What-if/contextual AI không có route | OpenAPI absent; C08 chỉ deterministic reasons | Không complete Thử kịch bản/Hỏi AI | PRODUCT GAP | PO + BE | Scope/auth/provenance/request contract trước implementation | These features: yes |
| M09-05 | PO bridge chưa shipped | Contract C09 DEFERRED | Không conversion hay automatic PO | PRODUCT GAP | PO + BE | Milestone riêng có explicit option/intent/authority | PO: yes; planning read: no |
| M09-06 | Open PO/scenarios/horizon choices unsupported | C01 literal capabilities false, fixed7days; worker engine policy owned by BE | Không enable advanced có vẻ hoạt động | PRODUCT GAP | PO + BE/design | Giữ disabled; chỉ mở sau meaningful capability + evidence | Advanced only |
| M09-07 | Global KPI/chart/critic thiếu canonical facts | C03 không global fill/risk/critic; C05 daily paths không forecast quantiles | Một số visual labels không có data tương đương | DESIGN GAP | PO + Design | Chốt labels/unavailable states và daily evidence table thay curve | Pixel/feature parity only |
| M09-08 | History có BE nhưng thiếu design workflow | V2 N9 implemented, current two MagicPath screens không History | Chưa có retained planning history UI | DESIGN GAP | PO + Design/FE | Thiết kế N9 list/filter/paging/resume riêng; không dùng local history | History only |
| M09-09 | Lost-ACK intent mất khi unmount | Page-owned in-memory workflow, no journal | Reload/navigation có thể mất key khi chưa biết Run ID | TECH DEBT | FE + PO | Product-approved scoped recovery/leave protection; hiện warning rõ | Cross-navigation uncertain recovery |
| M09-10 | Interactive browser/responsive QA chưa chạy | Browser skill yêu cầu Node REPL tool; `node_repl.*js` không available trong session | SSR/CSS không chứng nhận clicks/layout/focus | TECH DEBT | FE/QA | Chạy browser acceptance tại desktop/narrow viewport với đúng browser tooling | Browser acceptance |
| M09-11 | Cold C03 decode và bundle size | Archived 50Product C03 ~12.728s; final build main598.26kB/Planning117.79kB | Latency/performance risk; không SLA | TECH DEBT | BE + FE | C03 read timeout30s; đo live cold/warm+navigation; profile main chunk sau scope này | No current controlled failure |
| M09-12 | Four defects caught during review | Review + controlled regressions: context refresh stopped polling; rejected replay erased uncertainty; StrictMode busy lock; empty locator escape | Could stall/duplicate if left unfixed | FE BUG — FIXED | FE | Preserve poll hint/key; invalidate/release lifecycle locks; consistent present locator and clear action; keep regression tests | Resolved at FE/controlled boundary; browser still pending |

Chưa có evidence đủ để gán một **BE BUG** runtime. Worker flag/liveness và cold decode là deployment/performance concerns từ handoff, không lỗi đang tự tái hiện. Route xuất hiện không chứng minh worker đang enabled/healthy; FE không sửa operator settings. Historical V1/docs001–003 “BE absent”/localhost8000 không dùng làm kết luận hiện tại.

## 10. Open questions

1. PO có chấp nhận canonical C02/C03 flow làm scope M09, thay các tên ForecastRun/DecisionRun/Brief trong request không?
2. Ưu tiên cần semantics mới nào (nếu có), và design sẽ diễn đạt KPI unknown/daily balances như thế nào?
3. Environment/account/Store sẵn sàng nào được cấp cho live acceptance, với planning worker enabled/healthy?
4. What-if/contextual AI, PO, N9 History và uncertain-intent recovery sẽ được ưu tiên ở milestone riêng nào?

Không mở lại những điểm contract đã rõ: fixed7days/cutoff, money rights, default-version pin, null budget inheritance, strategy vs demand paths, server winner và C08 không phải AI.

## 11. Test evidence

Kết quả trên working tree hiện tại; controlled fixtures không phải real engine forecast, canonical writes, login hoặc live retained Run.

| Gate | Result | Evidence boundary |
| --- | --- | --- |
| `npm run test:planning` | **76/76 PASS**: boundary27 + workflow30 + UI SSR16 + navigation3 | VERIFIED_CONTROLLED; C01/R01/C02/C03/C04/C05/C08; exact/date/null/no-winner/failed-partial, rights/Store, retry/poll/warnings, retained drift/cursor, cancellation/StrictMode |
| Published handoff examples | **12/12 PASS** against strict current validators | C02 modes, C03 lifecycle states, C04/C05 including null-digest states, C08; recorded agent check, not live |
| `npm run test:import` | **93/93 PASS** | Existing suites, not modified for M09 |
| `npm run test:auth` | **26/26 PASS** | Existing suites; navigation adds separate Planning suite |
| `npm run build` | PASS; TypeScript + production Vite | Planning lazy chunk; existing >500kB main-chunk warning remains |
| `npm run lint` | PASS, zero warnings | Static check |
| `npm run check:planning-wire` | PASS: 80schemas/80types | Frozen current OpenAPI closure; SHA256 `d0d0ad5c72a9c1cd3adb722410c478f793488517da8ffdcd1dcffb22a21569e0` |
| `npm run check:import-wire` | PASS: 123schemas/119types | Regression drift gate; no M09 Import schema changes |
| `git diff --check` | PASS | Whitespace, not functional acceptance |
| Browser QA | NOT_VERIFIED | Required Node REPL browser tool unavailable; no fallback driver or browser screenshot claimed |
| Responsive | NOT_VERIFIED_INTERACTIVE | CSS media queries/overflow and SSR reviewed only; no desktop/mobile click/layout certification |
| Live E2E | BLOCKED / NOT_VERIFIED_LIVE | Exact first blocker in §8 |

API factory never falls back to fixtures. Mock mode requires explicit injected source; DEV-only `mock_preview` warning, per-instance deterministic queued→running→terminal simulation, zero budget no-winner example. Production config remains API-only. No auth, forecast engine, AI, canonical data mutation or backend availability is simulated as real.

## 12. Files changed

Exact M09 manifest below; the worktree already contained M08 Import/contracts/docs changes. Those unrelated dirty files are preserved, **not attributed to this milestone**. No dependency/lockfile, environment, contract, Menu/Inventory business data or MagicPath changes.

Modified existing files (6):

- `README.md`
- `docs/README.md`
- `package.json`
- `src/app/AppRouter.tsx`
- `src/features/auth/AuthGuard.tsx`
- `src/layouts/app-shell/Sidebar.tsx`

Added files (21):

- `docs/006-decision-planning-e2e-integration.md`
- `scripts/check-planning-wire.mjs`
- `src/features/auth/auth.navigation.ts`
- `src/features/decision-planning/planning.types.ts`
- `src/features/decision-planning/planning.wire.ts`
- `src/features/decision-planning/planning.validation.ts`
- `src/features/decision-planning/planning.data.ts`
- `src/features/decision-planning/planning.workflow.ts`
- `src/features/decision-planning/planning.fixtures.ts`
- `src/features/decision-planning/planning.format.ts`
- `src/features/decision-planning/components/PlanningSetup.tsx`
- `src/features/decision-planning/components/PlanningResults.tsx`
- `src/features/decision-planning/components/PlanningEvidence.tsx`
- `src/features/decision-planning/components/Planning.css`
- `src/pages/forecast/PlanningPage.tsx`
- `src/pages/forecast/PlanningPage.css`
- `tests/planning-boundary.test.mjs`
- `tests/planning-workflow.test.mjs`
- `tests/planning-ui.test.mjs`
- `tests/planning-navigation.test.mjs`
- `tests/run-planning.mjs`

No commit/push performed. Manifest counts are checked at final handoff; generated `dist`/temporary test bundles are not source changes.

## 13. Remaining scope

- **FE incomplete:** interactive browser/responsive acceptance and live integration; no cross-navigation uncertain-intent recovery; N9 History, What-if, contextual AI and PO intentionally not implemented. Existing canonical controls are complete at controlled boundary, not certified live.
- **BE incomplete:** handoff reports C01–C05/C08 and N9 implemented; no fresh runtime source/test execution here. What-if/contextual AI absent, C09 deferred; no assertion that implemented endpoints are missing just because service is down.
- **Contract unclear:** no blocker in the consumed canonical C01/R01/C02/C03/C04/C05/C08 surface. Request/product mismatch and future priority/AI/What-if contracts need explicit decision, not FE guesses.
- **MagicPath/design missing:** meaningful priority semantics, global KPI alternatives/daily-path chart wording, History workflow, future AI/What-if/PO states. Current unavailable controls stay honest; no remote edits.
- **Deployment/staging issue:** reachable BE/auth/account/Store; secure cookie or explicit BE loopback policy, exact credentialed CORS/Origin/CSRF; dedicated worker enablement/liveness and real Store readiness. SPA direct-path rewrite remains hosting responsibility.
- **Future enhancement:** scoped intent recovery, retained N9 history, supported artifact exports, measured cold read/bundle performance, then separately contracted product capabilities. No training/orchestration/admin/stock mutations added to this milestone.
