# 008 — ShelfCash Implementation Receipt

- **ID:** #008 Implementation · **Ngày tạo lập:** 12/10/2026.
- **General Context:** thực thi phần FE an toàn theo current contract, đánh giá đủ MP-M00–MP-M15; phân biệt UI, mock, controlled HTTP và live.

## 1. Execution scope

- Repository: `/Users/thuong/Desktop/Shelfcash_FE_v2`; branch `main`; baseline `9b5e31e9bb873a45b50fb6c6796f69b59284e953`.
- Milestones attempted/evaluated: MP-M00–MP-M15. Không có milestone toàn phạm vi được chứng nhận COMPLETE.
- Sources: pasted task; [audit #008](008-magicpath-e2e-milestones.md); [API bổ sung](../../archive/SHELFCASH_FE_BO_SUNG_API.md); business flow `SHELFCASH_FLOW_NAM_NGUYEN.docx` (đọc paragraphs từ DOCX, không sửa); [#006](../006/006-decision-planning-e2e-integration.md), [#007](../007/007-store-workspace-e2e-integration.md); current generated OpenAPI và AUTH/Import/Inventory/Catalog/Procurement V2 docs. Các báo cáo cũ vẫn là evidence lịch sử, receipt này cập nhật phần đã làm thêm.
- OpenAPI `3.1.0`, `shelfcash-backend 0.1.0`; SHA256 `f160bf4a46453404f103a32431da5dc722382fb02494612e61e2000e57533961`. Không sửa backend/contracts.
- Environments actually used: DEV mock; controlled fetch/wire suites; Chromium Playwright với Vite mock `127.0.0.1:4173` và API mode `127.0.0.1:4174`, requests tới `127.0.0.1:18001` bị test intercept. Không cookie-backed live session. Local `http://localhost:18001/health` không kết nối được. Localhost/127.0.0.1 của intercepted tests không là evidence cookie/CORS deployment; live nên dùng hostname thống nhất như AUTH.
- MagicPath project `458079658328604672` được mở/read-only qua MagicPath integration; đọc code context đủ 12 component. Selected revisions trùng mục2 audit: D01 `458087405988220928`, D02 `458185906336202753`, D03 `460368412145782785`, D04 `460391466682978304`, D05 `460377695235239936`, D06 `458402037797892096`, D07 `460373317438836736`, D08 `460380078610739200`, D09 `460387221950861312`, D10 `460389532173471744`, D11 `460389548950720512`, D12 `458637450923900928`.
- Visual reference previews đọc D03/D05/D09/D10/D11. D08 view_component latest báo revision `460395468028002304`, previewAvailable=false; get_component_code_context đọc lại vẫn trả selected revision `460380078610739200`. Vì chênh revision/không preview, chưa xác nhận D08 latest visual; không gọi adaptation modal là pixel-perfect. Các trang mới bám tone đơn sắc, nhưng recipe full-page, receipt modal, activity/history table khác drawer/grouping trong design.

## 2. Executive summary

Thêm public credential/invitation routes, hoạt động quản trị, receipt/threshold writers, recipe preview/commit/retained evidence, saved requirements, Planning History/PDF, shared mock stock/retained History và DEV scenarios. Import đã đúng Preview3 → Review/Commit4 → Complete5. Có 16 operation mới được nối FE và J01 thêm PDF context; bảng dưới ghi mức evidence từng operation.

MP-M00–MP-M11 và MP-M15 là `PARTIAL_BE_BLOCKED`; MP-M12/13 `BLOCKED_CONTRACT`; MP-M14 `BLOCKED_DESIGN_AND_CONTRACT`. **PARTIAL_BE_BLOCKED không có nghĩa phần FE còn lại đã xong:** một số milestone còn nhiều FE-only work, được tách rõ trong “Remaining limitation” và mục Remaining frontend work. Status enum theo yêu cầu không có PARTIAL_FE; không dùng COMPLETE_FE khi chưa đủ nghiệm thu.

Có 13 Backend/Product dependencies `TD-BE-001`–`013`. Không ghi mock/auth/import/shared-state/fidelity TODO thành BE debt. Không có live verification. Kết quả tests và các failures trung gian được ghi bên dưới; không claim toàn bộ test matrix/design đã covered.

## 3. Milestone receipt

### MP-M00 — Nền tảng mock dùng chung

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm DEV scenario picker 8 IDs, shared stock repository, Store-scoped receipts/thresholds/recipe changes/saved requirements, singleton Store/Planning sources và retained History; Playwright được khai báo trong package.

**User-visible result:** Chọn/reset scenario bằng UI, nhận hàng rồi đọc stock/lots/movements mới; Planning tạo rồi History mở lại trong cùng phiên SPA.

**Frontend architecture changes:** features/mock; operations.source chọn mock/API rõ ràng; generated wire closure 94 schemas; useOperation và Mutation giữ intent khi uncertain.

**Backend APIs integrated:** Không thêm operation HTTP cho scenario; tái dùng adapters hiện hữu và operations mới bên dưới.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/mock/*; src/features/operations/{operations.source,operations.fixtures,mutation,useOperation}.ts; playwright.config.ts

**Remaining limitation:** Chưa coherent toàn bộ: auth còn preview bypass, invitation chưa cập nhật membership/events, import còn source riêng, recipe chưa cấp basis cho Planning. Mock reset dữ liệu khi reload; chỉ scenario ID nằm sessionStorage. Store B vẫn bị gate ngăn mở feature data. Các phần này là FE work còn lại, không đổ cho BE. Dependencies: TD-BE-004, TD-BE-007, TD-BE-010; xem [TechDebt](008_TechDebt.md).

### MP-M01 — Homepage → Login → Store → session

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Giữ Auth/Store gates và HTTP cookie/CSRF hiện hữu; return allowlist thêm invitation UUID nội bộ. Không thay đổi login authority.

**User-visible result:** Login API vẫn qua A01 rồi A03; invitation có thể quay lại từ login. No-store/readonly scenarios có browser assertions.

**Frontend architecture changes:** auth.navigation và routes public mới; reuse AuthProvider/StoreProvider.

**Backend APIs integrated:** Kế thừa: POST /api/v1/auth/login; GET /api/v1/auth/me; POST /api/v1/auth/logout; GET /api/v1/stores; GET /api/v1/stores/{store_id}.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:auth` / `test:store` / `test:import` / `test:planning` theo feature; không có test live hoặc full journey mới.

**Files materially changed:** src/features/auth/auth.navigation.ts; src/features/store/store.fixtures.ts; src/app/AppRouter.tsx

**Remaining limitation:** Mock login/logout/expiry vẫn chưa mô phỏng như người dùng; tests auth kiểm boundary/guards chứ không chứng minh full browser session journey. Registration/reset-request bị chặn contract. Dependencies: TD-BE-001; xem [TechDebt](008_TechDebt.md).

### MP-M02 — Invitation / credential / admin activity

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm N7 credential completion, N18 offer, N19 accept; capture fragment token vào memory, scrub URL, no-referrer; accept true/CAS/key, đọc mới T01/T02/A03. Thêm N14 và N16 view=events với hai feed phân trang riêng.

**User-visible result:** Mở /credentials/complete#token=… hoặc /invitations/{UUID}#token=…; đặt password 12–128 Unicode; đăng nhập đúng account, xem offer và accept nếu server cho phép; Owner mở Hoạt động.

**Frontend architecture changes:** OnboardingPages ngoài StoreGate; invitation keyed actor/locator; operations API typed; StoreActivityPage scoped Store/auth version.

**Backend APIs integrated:** POST /api/v1/auth/credentials/complete; GET /api/v1/staff-invitations/{invitation_id}; POST /api/v1/staff-invitations/{invitation_id}/accept; GET /api/v1/stores/{store_id}/permission-events; GET /api/v1/stores/{store_id}/staff-invitations?view=events. N12/N13/N15/N16/N17 Owner flows kế thừa.

**Mock E2E:** NOT VERIFIED. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/auth/{OnboardingPages.tsx,invitationProof.ts}; src/features/operations/StoreActivityPage.tsx; src/pages/store/StorePage.tsx

**Remaining limitation:** Recipient/credential mock trả API_ONLY rõ ràng. Chưa browser Owner→Staff→Owner; errors offer hiện thông báo an toàn tổng quát thay vì đầy đủ D03 từng trạng thái. Decline chưa có contract; activity chưa unified. Accepted Store link chưa tự chọn Store nếu session default là Store khác. Password/proof không persisted. Dependencies: TD-BE-001, TD-BE-002, TD-BE-003; xem [TechDebt](008_TechDebt.md).

### MP-M03 — Upload / analyze / mapping

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Giữ one-action upload/analyze và typed mapping workflow; entry sang Preview không còn qua Review trước. Không thêm bước seal visible.

**User-visible result:** Mapping hợp lệ đi tới bước Preview3; source-file/CAS/idempotency boundary hiện hữu được giữ.

**Frontend architecture changes:** importFlow.workflow.setTab và ImportFlow navigation thay đổi, không rewrite upload adapters.

**Backend APIs integrated:** Kế thừa: POST /api/v1/stores/{store_id}/imports; POST /api/v1/imports/{import_id}/files; POST /api/v1/imports/{import_id}/analyze; GET /api/v1/imports/{import_id}; GET /api/v1/jobs/{job_id}; GET /api/v1/imports/{import_id}/mapping-summary; GET /api/v1/imports/{import_id}/mappings; GET /api/v1/imports/{import_id}/sheets/{sheet_id}/field-options; PATCH /api/v1/imports/{import_id}/mappings/{mapping_id}. Xem topology thực tế trong #005; không coi mọi label operation ở đây là integration mới.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:auth` / `test:store` / `test:import` / `test:planning` theo feature; không có test live hoặc full journey mới.

**Files materially changed:** src/features/import-data/{importFlow.workflow.ts,components/ImportFlow.tsx}; src/pages/imports/ImportPage.tsx

**Remaining limitation:** Mock vẫn synthetic upload/analyze, không parse business bytes hay có manifest nhiều-file/sheet mới. Fidelity/counters và canonical shared import effects còn thiếu. Browser chỉ smoke initial step; suite import đã kiểm workflow/boundaries. Dependencies: TD-BE-005; xem [TechDebt](008_TechDebt.md).

### MP-M04 — Mapping proposal / approval / reuse / retire

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Rà soát flow theo import và N5 hiện hữu, giữ nguyên immutable profile/version/key boundary; không thêm global queue giả.

**User-visible result:** Owner tiếp tục quyết định proposal trong phạm vi import hiện hữu.

**Frontend architecture changes:** Không thay writer/lifecycle ở milestone này.

**Backend APIs integrated:** Kế thừa POST /api/v1/stores/{store_id}/mapping-profiles/{profile_id}/decisions và import mapping operations. Không API global list/submit/bulk mới.

**Mock E2E:** NOT VERIFIED. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:auth` / `test:store` / `test:import` / `test:planning` theo feature; không có test live hoặc full journey mới.

**Files materially changed:** Không có file writer mới riêng MP-M04; import continuation được giữ.

**Remaining limitation:** Global queue/active-retired discovery chưa có contract; mock hai actor/shared proposal và full owner/staff UI chưa hoàn tất. Không gọi phần FE đó là BE blocker. Dependencies: TD-BE-004; xem [TechDebt](008_TechDebt.md).

### MP-M05 — Preview → Review/Commit → Completion/History

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Sửa wizard thành File1, Mapping2, Preview3, Review/Commit4, Complete5. ImportPreview có stage preview/review, vẫn dùng server review/pins và confirmation trước commit; completion/history/resume core giữ nguyên.

**User-visible result:** Xem dữ liệu trước, sang kiểm tra/xác nhận, commit rồi theo dõi lifecycle hiện hữu. Approval là nhánh phụ.

**Frontend architecture changes:** stage prop phân presentation cùng workflow; setTab khóa review nếu chưa có preview authoritative.

**Backend APIs integrated:** Kế thừa GET /api/v1/imports/{import_id}; POST /api/v1/imports/{import_id}/process phases preview/confirm_review/commit; GET /api/v1/jobs/{job_id}; GET /api/v1/imports/{import_id}/completion; GET /api/v1/stores/{store_id}/imports. History/detail paths kế thừa #003/#005.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:auth` / `test:store` / `test:import` / `test:planning` theo feature; không có test live hoặc full journey mới.

**Files materially changed:** src/features/import-data/components/{ImportFlow,ImportPreview}.tsx; src/features/import-data/importFlow.workflow.ts; src/pages/imports/ImportPage.tsx

**Remaining limitation:** Chưa full D05 grouped preview/row drawer và complete browser wizard; mock commit chưa propagate canonical resources sang Kho/Menu. Các fields projection thiếu ghi debt, còn UI dùng fields sẵn có là FE work. Dependencies: TD-BE-006; xem [TechDebt](008_TechDebt.md).

### MP-M06 — Receive Goods / Opening stock / thresholds

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm N6 actual/opening receipt và N8 Owner threshold; exact qty, required source identity/observed_at/reason/version, nullable supplier/cost, positive qty, physical observation check cho opening. Capture intent; transport loss retry nguyên key/body/version. Sau success đọc V01 rồi V02/V03/V04 cùng snapshot; null threshold khác zero.

**User-visible result:** Trong Kho mở Nhận hàng hoặc Thiết lập ngưỡng; confirm ghi; xem bằng chứng quantity/lot/movement đọc lại. Đóng kết quả mới refresh bảng, tránh mất dialog.

**Frontend architecture changes:** InventoryActions keyed Store/auth version; shared fake stock; HTTP/operations validators; threshold prerequisite read có abort và giữ original CAS khi retry.

**Backend APIs integrated:** POST /api/v1/stores/{store_id}/inventory/receipts; PUT /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold; GET /api/v1/stores/{store_id}/inventory; GET /api/v1/stores/{store_id}/inventory/{ingredient_id}; GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/lots; GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/movements.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/operations/InventoryActions.tsx; src/features/inventory/inventory.data.ts; src/pages/inventory/InventoryPage.tsx; src/features/mock/mockRepository.ts

**Remaining limitation:** Core receipt verified mock/browser + controlled browser, không toàn milestone: native modal thay design drawer, picker chỉ current page, supplier/cost chưa có editor, riêng biệt confirm màn chưa đạt D08. Fake receipt expiry/usable projection còn giản lược; chưa chứng minh mọi date/null/expired cases; đọc evidence một page không bảo đảm lot/move sẽ ở page đầu. Dependencies: TD-BE-007; xem [TechDebt](008_TechDebt.md).

### MP-M07 — Recipe timeline / change preview / commit

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm N20 timeline past/in_effect/scheduled/unassigned, N21 preview/commit, N22 retained change. Form yield/loss/ingredient exact quantities; explicit close-current SET_PERIOD; edit scheduled hoặc preview WITHDRAW_FUTURE; warnings ack/blockers; preview và commit keys riêng. Fresh N20/N22 sau commit; chặn old in-flight timeline overwrite fresh read.

**User-visible result:** Menu chọn món → Lịch công thức; tạo recipe tương lai, xem before/after, xác nhận và đọc timeline mới. change_id URL là locator giữ bằng chứng.

**Frontend architecture changes:** RecipeSchedulePage scoped Store/auth/resource; wire validators + retained change fake backend; generic uncertain retry dùng captured action.

**Backend APIs integrated:** GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule; POST /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes; GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id}; GET /api/v1/stores/{store_id}/products/{product_id} hiện hữu.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/operations/RecipeSchedulePage.tsx; src/features/operations/operations.fixtures.ts; src/pages/menu/MenuPage.tsx

**Remaining limitation:** Full-page editor thay D09 drawer; choices chỉ recipe hiện tại, món chưa recipe chưa tạo được từ broad catalogue. Changed ranges/new content inspection chưa đủ fidelity. Mock không propagate calendar vào Menu upcoming hoặc Planning applicability; immutable old timeline được test, historical plan/PDF chain chưa verified. Dependencies: TD-BE-007; xem [TechDebt](008_TechDebt.md).

### MP-M08 — Planning setup / readiness / retained result

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Tái dùng C01/R01/C02/C03/C04/C05/C08; nối RequirementsControls cho default/custom/saved, kiểm request và budget ceiling; thêm History entry và PlanExport; bỏ override permissions mock để dùng grants Store. Singleton planning retained reads cấp History.

**User-visible result:** Tạo run từ cấu hình hợp lệ, resume plan_id, xem retained result; lịch sử và export không tạo stock/PO mutation.

**Frontend architecture changes:** PlanningSetup dependency injection operations source giữ SSR tests độc lập; planning workflow hiện hữu không đổi authority.

**Backend APIs integrated:** Kế thừa GET /api/v1/stores/{store_id}/planning-context; GET /api/v1/stores/{store_id}/readiness; POST /api/v1/stores/{store_id}/procurement-plans; GET /api/v1/procurement-plans/{plan_id}; GET /api/v1/procurement-plans/{plan_id}/ingredients; GET /api/v1/procurement-plans/{plan_id}/ingredients/{ingredient_id}; GET /api/v1/procurement-plans/{plan_id}/explanation. Saved operations ở MP-M11; export ở MP-M09.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:auth` / `test:store` / `test:import` / `test:planning` theo feature; không có test live hoặc full journey mới.

**Files materially changed:** src/features/decision-planning/components/PlanningSetup.tsx; src/pages/forecast/PlanningPage.tsx; src/features/mock/mockSources.ts

**Remaining limitation:** Chưa toàn D10/D11 fidelity/chart/projection hoặc shared imported/recipe basis. Mock planning vẫn synthetic one-product seed và không dùng newly saved requirement contents làm actual captured configuration; chưa nghiệm thu run từ bộ vừa lưu. What-if/AI/PO giữ unavailable. Dependencies: TD-BE-010, TD-BE-011, TD-BE-012, TD-BE-013; xem [TechDebt](008_TechDebt.md).

### MP-M09 — Planning History / PDF

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm N9 paginated status/forecast-date filters, retained plan links; N10 export request explicit option_id:null|ID + vi/pdf; J01 đúng PDF context; N11 binary cookie/no-referrer/MIME/signature/size/SHA256. Poll capped rồi manual; query export_id/export_job_id để resume, close không cancel server; abort stale download.

**User-visible result:** History mở Run cũ; API mode mở export overlay, theo dõi queued/running/completed/failed rồi download đúng artifact. Controlled browser quan sát download event và không có stock/PO writer.

**Frontend architecture changes:** PlanningHistoryPage, PlanExport, shared requestPdf; export job union identity checks; export locator không tự tạo job để recovery.

**Backend APIs integrated:** GET /api/v1/stores/{store_id}/procurement-plans; POST /api/v1/procurement-plans/{plan_id}/exports; GET /api/v1/jobs/{job_id}; GET /api/v1/procurement-plans/{plan_id}/exports/{export_id}; retained C03 hiện hữu.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/operations/{PlanningHistoryPage,PlanExport}.tsx; src/shared/http/httpClient.ts; tests/e2e/operations.api.spec.ts

**Remaining limitation:** Mock PDF worker/binary cố ý API_ONLY, chưa có valid renderer PDF fixture trong mock. Controlled PDF fixture chỉ chứng minh transport/hash/download, chưa verify PDF rendering/layout. Export list/creator-date filters chờ contract; chưa browser reload/resume/full long/error permutations. History table khác D10 calendar/group design. Dependencies: TD-BE-008; xem [TechDebt](008_TechDebt.md).

### MP-M10 — Today attention / operational overview

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Today giữ UI/logic V01 hiện hữu nhưng mock đọc shared repository nên receipt thay lots summary ở lần đọc mới. Browser kiểm lot count tăng sau receipt bằng SPA navigation.

**User-visible result:** Nhận hàng → đóng modal → Hôm nay thấy positive lot count mới; attention vẫn theo source V01.

**Frontend architecture changes:** Today không thêm forecast/arrivals business logic.

**Backend APIs integrated:** GET /api/v1/stores/{store_id}/inventory hiện hữu; không Today/AI endpoint mới.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** NOT VERIFIED. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/inventory/inventory.data.ts; src/features/mock/mockRepository.ts; tests/e2e/operations.mock.spec.ts

**Remaining limitation:** D12 pending decision/outlook/signals/readiness richness chưa có; không coi receipt làm thay toàn Today authority. Core V01 controlled có ở baseline nhưng Today-specific API journey chưa chạy. Dependencies: TD-BE-009; xem [TechDebt](008_TechDebt.md).

### MP-M11 — Saved requirements / budget / Store settings

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm N1 create/N2 read/N3 replace hoặc archive full payload, reason-independent schema theo contract, CAS/key; null inheritance, zero và [] giữ nguyên. Save đọc N2 lại, không tự create Run; permissions create/manage riêng. Store/Planning mock cùng workspace budget source.

**User-visible result:** Trong Planning chọn default/custom/saved; tạo/sửa/lưu trữ bộ yêu cầu và chọn bộ để dùng qua API. Known version budget replacement trong Store vẫn giữ.

**Frontend architecture changes:** RequirementsControls/useOperation scoped parent Planning; readSaved abort/late-response fence; StorePage tái dùng singleton workspace source.

**Backend APIs integrated:** POST /api/v1/stores/{store_id}/planning-requirements; GET /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}; PUT /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}; C01 và PUT /api/v1/stores/{store_id}/planning-budget known-version replacement hiện hữu.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** src/features/operations/RequirementsControls.tsx; src/features/decision-planning/components/PlanningSetup.tsx; src/pages/store/StorePage.tsx

**Remaining limitation:** Sau save có N2 fresh read; chưa re-read C01 discovery đầy đủ trong UI. Mock saved map chưa coherent với context seed và engine captured config; tests CRUD không chứng minh use-saved run. Initial absent budget/profile writers chờ Product/BE; saved editing còn UI cần refinement. Dependencies: TD-BE-010; xem [TechDebt](008_TechDebt.md).

### MP-M12 — Contextual AI

**Final status:** `BLOCKED_CONTRACT`

**Implemented:** Đã đánh giá current OpenAPI/design; không thêm conversation adapter hoặc giả C08 thành chatbot. Giữ unavailable entry hiện hữu.

**User-visible result:** Không có AI question/answer flow mới.

**Frontend architecture changes:** Không thêm production transport.

**Backend APIs integrated:** Không có API contextual AI được gọi.

**Mock E2E:** NOT APPLICABLE. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** NOT APPLICABLE. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** Audit current OpenAPI + MagicPath source; không chạy feature E2E vì không có flow mới.

**Files materially changed:** Không có file AI mới.

**Remaining limitation:** Approved shell/mock Q&A chưa triển khai thêm; contract context/evidence/provider/grants thiếu. Không tuyên bố UI/mock hoàn tất. Dependencies: TD-BE-011; xem [TechDebt](008_TechDebt.md).

### MP-M13 — What-if

**Final status:** `BLOCKED_CONTRACT`

**Implemented:** Đã đánh giá PlanningRequest/capabilities; không gửi scenario fields qua C02 và không chạy solver FE.

**User-visible result:** What-if vẫn unavailable.

**Frontend architecture changes:** Không thêm scenario endpoint.

**Backend APIs integrated:** Không có API What-if được gọi.

**Mock E2E:** NOT APPLICABLE. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** NOT APPLICABLE. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** Audit current OpenAPI + MagicPath source; không chạy feature E2E vì không có flow mới.

**Files materially changed:** Không có file scenario writer mới.

**Remaining limitation:** Chưa scenario lifecycle/basis/diff contract hoặc deterministic mock comparison. Dependencies: TD-BE-012; xem [TechDebt](008_TechDebt.md).

### MP-M14 — Draft Purchase Orders

**Final status:** `BLOCKED_DESIGN_AND_CONTRACT`

**Implemented:** Đã đánh giá design downstream và OpenAPI; không đồng nhất PDF, planning option hay N6 receipt với PO.

**User-visible result:** Không có Draft PO lifecycle mới.

**Frontend architecture changes:** Không thêm PO writer.

**Backend APIs integrated:** Không có API PO được gọi.

**Mock E2E:** NOT APPLICABLE. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** NOT APPLICABLE. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** Audit current OpenAPI + MagicPath source; không chạy feature E2E vì không có flow mới.

**Files materially changed:** Không có file PO mới.

**Remaining limitation:** Thiếu downstream design + public PO contract; minimal boundary trong TechDebt chỉ proposal. Dependencies: TD-BE-013; xem [TechDebt](008_TechDebt.md).

### MP-M15 — Cross-workspace acceptance / handoff

**Final status:** `PARTIAL_BE_BLOCKED`

**Implemented:** Thêm 8 Playwright cases (5 mock desktop, 1 mock mobile, 2 controlled API), operations boundary/mock suite và wire generation check. Re-read audit toàn bộ, MagicPath contexts 12 component, đối chiếu source + previews có sẵn; tạo receipt/debt/runbook.

**User-visible result:** Một lệnh test:e2e chạy các segments đã mô tả, scenario picker cho manual QA. Không phải full journey A/B/C.

**Frontend architecture changes:** Playwright 2 explicit Vite env servers; generated schema drift checks; reports ignored trong git.

**Backend APIs integrated:** Các operations được dùng trong tests liệt kê bên dưới, không gọi API proposed.

**Mock E2E:** PARTIAL. Scenario `owner-ready` cho segments mới; `staff-readonly`/`no-store` cho gating. Không dùng các scenarios này làm evidence full milestone.

**API parity:** PARTIAL. Controlled evidence chỉ ở mức case được thực thi, không toàn bộ UI states.

**Live backend:** LIVE_VERIFIED: NO

**Tests / evidence:** `npm run test:operations` và `npm run test:e2e` (chỉ các ca có tên tương ứng trong test log).

**Files materially changed:** playwright.config.ts; tests/e2e/*; tests/operations-*.test.mjs; tests/run-operations.mjs; scripts/check-operations-wire.mjs; docs/008_*.md

**Remaining limitation:** Journey A chưa invitation→import→canonical resources; B chỉ receipt/Today + recipe timeline + retained plan/export segments, chưa applicability/history PDF proof; C có existing unit fencing + readonly/no-store UI, chưa browser Store-switch/revoke/expiry khi write đang chạy. Chưa broad keyboard/reduced-motion/visual fidelity regression; live unavailable. Dependencies: TD-BE-001, TD-BE-002, TD-BE-004, TD-BE-006, TD-BE-007, TD-BE-008, TD-BE-009, TD-BE-010, TD-BE-011, TD-BE-012, TD-BE-013; xem [TechDebt](008_TechDebt.md).

## Backend operations newly used by FE

`Controlled API verified` bên dưới nghĩa là operation có controlled adapter case hoặc browser request assertion; không có nghĩa toàn bộ feature/API parity đạt nghiệm thu. N21 kiểm preview qua API boundary, commit/fresh read qua mock; không claim API commit happy path đã chạy live. J01 path đã dùng bởi Import; phần mới là PDF job context/result handling.

| Method | Path | Milestone | FE entry point | Verified level |
| --- | --- | --- | --- | --- |
| POST | /api/v1/auth/credentials/complete | MP-M02 | /credentials/complete | Controlled API verified |
| GET | /api/v1/staff-invitations/{invitation_id} | MP-M02 | /invitations/:invitationId | Controlled API verified |
| POST | /api/v1/staff-invitations/{invitation_id}/accept | MP-M02 | Offer acceptance button | Controlled API verified |
| GET | /api/v1/stores/{store_id}/permission-events | MP-M02 | /store/activity | Controlled API verified |
| GET | /api/v1/stores/{store_id}/staff-invitations?view=events | MP-M02 | Activity → Lời mời | Controlled API verified |
| POST | /api/v1/stores/{store_id}/planning-requirements | MP-M11 | Planning → Lưu thành bộ mới | Controlled API verified |
| GET | /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id} | MP-M11 | Planning → bộ đã lưu / fresh read | Controlled API verified |
| PUT | /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id} | MP-M11 | Lưu thay đổi / Lưu trữ | Controlled API verified |
| POST | /api/v1/stores/{store_id}/inventory/receipts | MP-M06 | Kho → Nhận hàng | Controlled API verified |
| PUT | /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold | MP-M06 | Kho → Thiết lập ngưỡng | Controlled API verified |
| GET | /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule | MP-M07 | Menu → Lịch công thức | Controlled API verified |
| POST | /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes | MP-M07 | Preview / confirm commit | Controlled API verified |
| GET | /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id} | MP-M07 | change_id resume / commit fresh read | Controlled API verified |
| GET | /api/v1/stores/{store_id}/procurement-plans | MP-M09 | /forecast/planning/history | Controlled API verified |
| POST | /api/v1/procurement-plans/{plan_id}/exports | MP-M09 | Retained run → Xuất PDF | Controlled API verified |
| GET | /api/v1/jobs/{job_id} | MP-M09 | PDF polling/manual check | Controlled API verified |
| GET | /api/v1/procurement-plans/{plan_id}/exports/{export_id} | MP-M09 | Tải PDF | Controlled API verified |

API-only paths đều đi qua shared HTTP: credentials include/no-store, cookie session, protected write CSRF, canonical IDs, runtime response validation. Không JWT/browser-managed cookie hoặc fallback API→mock. Binary download có MIME/signature và optional J01 hash/byte_count validation; chưa kiểm PDF parser/render correctness.

## Cross-workspace consistency

- **Invitation — PARTIAL:** Owner invite/reissue/revoke flows hiện hữu; recipient offer/accept/new T01/T02/A03 đã nối API. Chưa thực hiện Owner→Staff→Owner browser/shared mock membership/events, không suy propagation từ acceptance receipt.
- **Import — PARTIAL:** preview → review/commit → completion/history hiện hữu có workflow/controlled tests; wizard sequence đã sửa. Mock commit chưa thay inventory/menu shared entities; không claim import→canonical resource propagation.
- **Receipt — VERIFIED MOCK (segment):** receipt → V01 fresh snapshot → V02 detail → V03 lots → V04 movements có asserts; SPA sang Today đọc positive lot count tăng. **VERIFIED API (segment, controlled):** route intercept ghi rồi mất response → cùng key/body retry → V01/V02/V03/V04 đọc quantity/lot/move, một movement. Today controlled API chưa test; không live.
- **Recipe — PARTIAL:** mock preview không ghi; commit → N20/N22 mới; old timeline clone giữ nguyên, browser scheduled entry. Future Planning applicability chưa shared; chưa nghiệm thu retained plan/PDF immutable qua recipe change.
- **Planning — PARTIAL:** create → retained run → shared History → mở lại Run `VERIFIED MOCK` trong SPA. Retained Run → N10/J01/N11 download `VERIFIED API` với intercepted HTTP; mock PDF API_ONLY, không xuyên chuỗi full mock hay live. Reload mock reset state đúng ghi chú.
- **Journey A — PARTIAL:** các segments Import/Planning có tests; missing invitation shared lifecycle, cross-import mapping queue, import effects và mock PDF.
- **Journey B — PARTIAL:** receipt/Today và recipe timeline, retained export segments đã kiểm riêng; thiếu recipe applicability vào new run và historical plan/PDF comparison.
- **Journey C — PARTIAL:** baseline auth/store/planning tests kiểm abort/late responses/scope invalidation; browser kiểm readonly/no-store. Chưa browser chuyển Store/revoke/session-expiry trong mọi new mutation. Các overlays mới chưa có một cơ chế chung refresh toàn workspace sau mọi 403; không suy UI stale-grant handling hoàn chỉnh từ server rejection tests.

## Commands and tests executed

Kết quả cuối: 344 unit/workflow/boundary tests và 8 Playwright cases PASS; build/wire checks PASS. Các failures trung gian đã xử lý như dưới đây. Failures trung gian không bị xóa khỏi receipt: lần đầu operations boundary có fixtures N18/N21 sai schema; sau đó blocker details và lỗi `p` ngoài scope ở mock fail handler được sửa. Store tests ban đầu giả định default mock có hai Store/ba quyền, nay scenario default một Store và readonly có recipe.read; tests chuyển explicit multi-store và expected four grants. Lượt browser đầu 4/8 fail: dialog bị parent refresh unmount, locator ingredient test sai cách tìm và C03 controlled meta chứa field ngoài schema. Sửa code/fixtures rồi có lượt 8/8 đạt. Lượt tiếp theo 7/8 do sửa hook khi Vite đang chạy test gây Fast Refresh hook order error; chạy lại trên code ổn định, không thay hook trong lượt nghiệm thu cuối.

| Command / Test | Scope | Result | Notes |
| --- | --- | --- | --- |
| npm run test:auth | Cookie/CSRF/login/guards/session boundaries | PASS — 26 tests | Controlled/SSR, không live |
| npm run test:store | Store context/workspace/grants/invitations/budget | PASS — 116 tests | Có wrong-scope, concurrent/late responses, uncertain writes |
| npm run test:import | Input/mapping/continuation/review/commit/history | PASS — 99 tests | Không chứng minh browser full wizard/shared resource effects |
| npm run test:planning | C01/R01/C02/C03/C04/C05/C08 workflow/boundary/UI | PASS — 76 tests | Không What-if/AI/PO |
| npm run test:operations | New operations controlled boundary + shared mock | PASS — 27 tests | 21 controlled/proof/mutation cases + 6 mock cases; PDF204 rejected |
| npm run test:e2e | 5 mock desktop + 1 mock mobile + 2 intercepted API browser | PASS — 8 tests | Final stable rerun 8/8; intermediate failures described above |
| npm run check:import-wire | Drift vs current OpenAPI | PASS | Existing generator/check |
| npm run check:planning-wire | Drift vs current OpenAPI | PASS | Existing generator/check |
| npm run check:store-wire | Drift vs current OpenAPI | PASS | Existing generator/check |
| node scripts/check-operations-wire.mjs --write | Generate new operation closure | PASS | 94 schemas |
| npm run check:operations-wire | Drift vs current OpenAPI | PASS | 94 schemas |
| npm run lint | oxlint | PASS with warnings | 0 errors, 2 warnings (async loading effects); no-unused-expression warning fixed |
| npm run build | tsc -b + Vite bundle | PASS | Final build passed; >500kB chunk warning, no performance claim |
| npm install -D @playwright/test --cache /private/tmp/shelfcash-npm-cache | Browser test dependency | PASS after network retry | Initial ENOTFOUND registry; approved network retry succeeded; 0 audit vulnerabilities at install |
| npx playwright install chromium | Browser runtime | PASS | Chromium 156 / Playwright revision1248 installed |
| curl --max-time 3 -sS http://localhost:18001/health | Live availability probe | FAILED — connection refused | No live session/Store/worker/PDF evidence; LIVE_VERIFIED:NO |

First Playwright launch in sandbox could not listen on 127.0.0.1 (EPERM); approved elevated command ran local servers. In-app Browser skill's required Node REPL tool was not available in this session, so standalone Playwright was used. This is a tooling limit, not backend evidence. Evidence screenshots/traces in `test-results/` are generated and gitignored, not committed fixtures. Only synthetic controlled test data is captured.

### Browser coverage delivered

`tests/e2e/operations.mock.spec.ts`: receipt/re-read/Today SPA propagation; Planning→History→retained link; recipe preview→commit→fresh timeline; readonly/no-store guards; Import initial step smoke. `responsive.spec.ts`: mobile Inventory/receipt modal, Escape and public credential missing-token state. `operations.api.spec.ts`: CSRF receipt lost response with exact same intent replay and fresh reads; retained C03→PDF create→completed J01→authenticated binary download and no procurement/stock write.

Not run: live A/B/C; full invitation recipient browser flow; full Import mapping/approval/commit browser journey; saved-requirements→run configuration browser proof; PDF parser/layout; full visual regression, all focus/Escape/dirty-close/reduced-motion permutations; comprehensive mobile on all new pages. No tests for contextual AI/What-if/PO because no contracts/flows.

## Architecture changes

- `features/mock` holds scenario ID selection, cloned per-Store stock, shared workspace source and retained planning reads. Necessary for later reads to observe actual fake mutations. Scope remains incomplete across all features as stated above; no credentials/token/File/API persistence.
- `features/operations` adds narrow V2 operations source, generated wire closure, explicit mock implementation, UI entry points and mutation intent preservation. Existing Import/Planning/Store workflows remain authorities for their flows. API never calculates forecast/BOM/FEFO/winner/permissions or receipt identity business rules.
- `requestPdf` shares cookie/timeout/401 handling with JSON transport but validates successful binary separately; 204 cannot masquerade as valid PDF. Current 401 invalidates session only for non-stale captured session hooks.
- Public invitation/credential routes live outside StoreGate; offer still protected by authenticated server session. Fragment proof scrubbed before requests, kept in memory, forgotten after successful completion/accept verification; refreshing the page may require reopening original link.
- Important new writes distinguish confirmed receipt from failed follow-up read, so read failure does not trigger duplicate write. Uncertain writes preserve original key/body/version; known conflicts allow re-read/reconcile. In-memory intent is not durable across browser reload; no automatic recreate on resume.
- New components keyed by Store/authorization/resource where applicable and abort unmounted reads. Recipe commit fences earlier concurrent timeline reads. Download aborts if scope component unmounts.
- Import stage split changes presentation, retaining server confirm_review/commit, pins and async lifecycle. No extra visible file-set lock step.

## Remaining frontend work (not Backend TechDebt)

1. Complete MP-M00 actor/session model and shared invitation/import/menu/recipe/planning entities; deterministic faults across every feature; consistent catalogue IDs; implement safe mock resume seeds or synthetic persistence. Current 8 scenario IDs do not imply every adapter models that scenario.
2. Implement mock login/logout/expiry behavior; public invite per-state UI, correct accepted Store selection, mock recipient lifecycle/activity; do not present generic API_ONLY as E2E completion.
3. Sample manifest/parser policy for synthetic imports; richer mapping/preview/grouped row inspection and coherent commit→History/Kho/Menu. Existing mock accepts supported file inputs into synthetic analysis; it does not parse business content and must not be described as doing so.
4. Complete receipt drawer/confirmation/focus UX, broad canonical picker via existing reads where possible, supplier/cost entry policy, expiry/usable fake projections and invalidation/readback recovery cases. Current receive form deliberately narrower than full D08.
5. Recipe drawer/details/diff/changed ranges, new-recipe picker for products with no current recipe, Menu upcoming and future Planning basis; dirty edit navigation guards. Full generated schema existence is not full UI coverage.
6. Saved requirements context refresh/discovery, mock seed/read/configuration consistency, browser CRUD→use-saved run; cap changes must affect synthetic planning authority consistently. Current singleton budget read is only partial coherence.
7. Proper mock PDF fixture/lifecycle, export reload/recovery cases allowed by existing locator contract, broader history states; improve locale/date/status labels and D10/D11 fidelity.
8. Extend browser A/B/C, permission revocation/403 cache disposal and Store switch while pending, late/unmounted requests, accessibility/keyboard/reduced-motion and all mobile layouts. Investigate bundle split: current operations wire + app chunk exceeds 500kB minified. No performance regression benchmark was run.

## Outstanding Backend/Product dependencies

| TechDebt ID | Milestone | Short reason | Current FE treatment |
| --- | --- | --- | --- |
| TD-BE-001 | M01/M02 | Public signup/reset request absent | Disabled; N7 token completion only |
| TD-BE-002 | M02 | Decline lifecycle undefined | No decline writer |
| TD-BE-003 | M02/M11 | Unified admin timeline/filter scope | Two independent feeds |
| TD-BE-004 | M04 | Store-wide mapping queue/profile discovery | Existing per-import decisions |
| TD-BE-005 | M03 | Scoped auto/file/sheet/filter counters | Existing counters with accurate labels |
| TD-BE-006 | M05 | Preview aggregates/provenance/category contract | Existing preview fields only |
| TD-BE-007 | M06/M07 | Supplier/location/canonical discovery policy | Current-page/current-recipe choices; nullable supplier/cost |
| TD-BE-008 | M09 | Creator/created-date filters and PDF discovery | Supported filters + URL locator only |
| TD-BE-009 | M10 | Pending/outlook/arrivals/signal semantics | V01 attention/summary only |
| TD-BE-010 | M11 | Settings writers / cap absence authority | Readonly profile; versioned cap replacement |
| TD-BE-011 | M12 | Context/evidence/provider AI contract | Unavailable |
| TD-BE-012 | M13 | What-if input/basis/lifecycle contract | Unavailable; no C02 extra fields |
| TD-BE-013 | M14 | PO downstream design and lifecycle | Set aside; PDF/receipt remain separate |

## Runbook / reproducibility

```bash
npm ci
VITE_DATA_SOURCE=mock npm run dev
# API, with compatible BE actually running and configured Origin/cookies/workers:
VITE_DATA_SOURCE=api VITE_API_BASE_URL=http://localhost:18001 npm run dev
npm run test:operations
npx playwright install chromium
npm run test:e2e
npm run build
```

`test:e2e` starts its own two strict-port Vite servers; keep ports4173/4174 free. Tests intercept API responses; they do not start a backend. In DEV mock picker, selecting an ID or Reset reloads `/store` and resets all fake in-memory state; only ID retained in `shelfcash:dev-scenario:v1`. Reset has no effect on API mode because picker is absent there. For mutation propagation use AppShell links, not full page reload.

| Scenario ID | Seed / role | Manual steps / expected result | Coverage limit |
| --- | --- | --- | --- |
| owner-ready | Owner, Store A with synthetic stock/planning | /inventory receive positive quantity with unique identity and observed time → fresh lot/move; SPA /today → lot count +1 | No shared invite/import effects |
| staff-importer | Staff with input/operational grants | /store inspect role then /imports or /inventory; only allowed entries | Not full staff/owner approval journey |
| staff-readonly | Staff ingredient/inventory/menu/recipe reads | /inventory no receive button; /forecast/planning blocked by grants | Browser verified guards |
| multi-store | Two Store discovery entries | /store select Store B → other feature gate explicitly unavailable | No Store A fixture leaked; full B dataset not implemented |
| no-store | Empty Store discovery | Protected workspace shows “Chưa có cửa hàng” | Browser verified |
| empty-store | Empty shared stock | /inventory empty list/summary | Planning/menu sources still synthetic, not globally empty |
| transport-error | Deterministic shared stock read failure | /inventory reports connection error, retry stays error | Not every adapter faults |
| revision-conflict | Operations mutation 412 | Receipt/threshold/recipe write rejects; no success readback | Not global Import/Store fault injection |

Sample receipt: ingredient milk fixture `10000000-0000-0000-0000-000000000001`, quantity `2.125`, unit from selected entity, source `qa-browser`, new unique record identity, dates `2026-10-10`/`2026-11-01`, observed_at `2026-10-10T03:00:00Z`, reason and explicit confirmation. Fake seed starts `15.5`, fresh value `17.625`. Product recipe sample `00000000-0000-0000-0000-000000000011`, effective `2026-10-11`, yield `2 cup`, loss `0.02`, existing canonical ingredient quantity `300`, explicit close-current. Dates are deterministic seed Store dates, not live current applicability.

Live handoff still needs compatible backend URL, verified account/cookie session, Store/grants, allowed FE Origin + credentialed CORS and CSRF/custom header allowlist, worker/PDF services, invitation token delivery callback and SPA fallback. These are prerequisites, not requests to loosen production cookie policy.

## Final Git/worktree receipt

Baseline remains `9b5e31e9bb873a45b50fb6c6796f69b59284e953` on `main`. No commit/push/branch mutation. User WIP audit/API docs/DOCX retained. `docs/README.md` already modified at task start; only additional document index entries appended. API supplemental document gets an append-only implementation delta; original requirements preserved.

New files: `src/features/mock/*`, `src/features/operations/*`, `src/features/auth/OnboardingPages.tsx`, `invitationProof.ts`, `scripts/check-operations-wire.mjs`, `tests/operations-boundary.test.mjs`, `tests/operations-mock.test.mjs`, `tests/run-operations.mjs`, `tests/e2e/*`, `playwright.config.ts`, `docs/sprints/008/008_TechDebt.md`, `docs/sprints/008/008_Implementation_Receipt.md`. Materially modified: App/routes, navigation, Store fixture grants/scenarios, inventory mock reads/InventoryPage, Menu entry, Planning setup/page, Store source/activity link, Import presentation/workflow, shared HTTP, package/lock/scripts, .gitignore, scenario-aware Store tests. Generated outputs `dist/`, reports/traces ignored. Work remains uncommitted/untracked as appropriate.

Final verification: 344 unit/workflow/boundary + 8 browser cases PASS, all four wire checks PASS, build PASS; lint 0 errors/2 warnings, build chunk-size warning. No known failing test in executed final suites. Tests not executed and incomplete journey/design coverage remain as listed above. No live evidence or claims of full design completion.

## Final milestone matrix

| Milestone | Final status | UI | Mock E2E | API integrated | API parity | Live verified | TechDebt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MP-M00 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | PARTIAL | PARTIAL | NO | 004/007/010; FE work remains |
| MP-M01 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 001; mock auth remains |
| MP-M02 | PARTIAL_BE_BLOCKED | PARTIAL | NO | YES | PARTIAL | NO | 001/002/003 |
| MP-M03 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 005; mock import remains |
| MP-M04 | PARTIAL_BE_BLOCKED | PARTIAL | NO | PARTIAL | PARTIAL | NO | 004 |
| MP-M05 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 006; resource propagation remains |
| MP-M06 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 007 |
| MP-M07 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 007; applicability remains |
| MP-M08 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 010/011/012/013 |
| MP-M09 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 008; mock PDF remains |
| MP-M10 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | PARTIAL | NO | NO | 009 |
| MP-M11 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | YES | PARTIAL | NO | 010; saved run mock remains |
| MP-M12 | BLOCKED_CONTRACT | PARTIAL | N/A | NO | N/A | NO | 011 |
| MP-M13 | BLOCKED_CONTRACT | PARTIAL | N/A | NO | N/A | NO | 012 |
| MP-M14 | BLOCKED_DESIGN_AND_CONTRACT | NO | N/A | NO | N/A | NO | 013 |
| MP-M15 | PARTIAL_BE_BLOCKED | PARTIAL | PARTIAL | PARTIAL | PARTIAL | NO | all relevant above; A/B/C incomplete |

UI=PARTIAL for M12/M13 means existing unavailable controls only, not a working approved AI/scenario shell. API integrated=YES means core reachable operations as enumerated; it does not override overall partial status or certify all design capabilities.
