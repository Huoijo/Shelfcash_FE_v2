# 014 — Import Debug → UI State Playground

14/10/2026. Không commit/push. Scope là development controller, giữ business/API semantics và các thay đổi 012/013.

## Authority đã đọc

- Pasted request `b385da1d-8ce7-4658-ad87-c44e5613defc`: UI State Playground, role/step/scenario catalogs, presets, error simulation, canonical navigation, reset và diagnostics hierarchy. File đính kèm kết thúc tại mục “Raw”; các yêu cầu hoàn chỉnh phía trước đã được thực hiện.
- MagicPath project `458079658328604672`: xác minh lại OWNER `460747146686242816` revision `460803015184642048`, STAFF `460747115572916224` revision `460804081875824640`; revision không đổi. Dùng source/catalog đã inspect tại 012/013, đối chiếu lại các nhánh Profile. Không sửa canvas/start editing session.
- `013_Import_Content_Parity.md`, `013_Import_TechDebt.md`, current Import/Planning workflows, fixtures và typed wire. Không thêm API hoặc DESIGN_READY routes.

## Thay đổi

- Primary Debug là **UI State Preview**, Role → Step → Scenario, compact current preview, Previous/Next, Data condition, Simulate error, bốn happy-path shortcuts và Reset scenario.
- **81 scenarios**: 40 Owner + 41 Staff. Tất cả render component Import thật, không có gallery HTML riêng. Đổi role/step/scenario không reload.
- `importPlayground.catalog.ts` + memory store + isolated mock session + lazy boundary nằm trong `src/shared/debug/`. Public workflow actions dựng phases; edge cases dùng explicit DEV projections. Lần thao tác sản phẩm đầu tiên bỏ projection và tiếp tục mock world.
- ImportPage nhận optional selection/view hints; normal Outlet/workflows vẫn được giữ mounted khi preview mở. Không ghi preview locator vào URL, không đổi current membership hoặc source của lô thật.
- Optional editor view defaults mở new-entity/declaration form; optional Readiness value đi qua Result riêng khỏi completion receipt. Không gọi HTTP Readiness từ playground.
- Diagnostics/capacity/receipts/raw JSON và legacy whole-app scenario picker vào Advanced diagnostics mặc định đóng. Production không có các controls này.
- Fixed overlay giữ geometry. Native key capture xử lý cả content portal, focus trap bỏ qua diagnostics đang ẩn. Preview suspend/restore native dialog của lô thật, giữ draft; trigger vẫn tránh footer CTA.
- Profile failure labels phân biệt failed/changed/rejected/retired khi render fault context; không thay request/decision semantics. PROFILE_REJECTED trong playground chỉ là projection, không tuyên bố có runtime outcome DTO.

## Kiểm tra

- **365 unit/boundary/SSR tests pass**: Import 114 (gồm 4 tests mới seed toàn bộ catalog, business guards, uncertain intent và isolated sessions) + Store 118 + Auth 26 + Planning 77 + Operations 30.
- **47 distinct browser cases đã pass**: full regression 46/46 pass; sau chỉnh Next/Previous về sufficient và Running progression, focused retest 7/7 pass, gồm mobile playground mới. Không chạy lại toàn bộ suite sau các chỉnh DEV cuối; những flow bị ảnh hưởng đã được retest.
- Browser catalog sweep render **cả 81 scenarios** trên actual Import components, xác nhận đúng role/step và không navigation/reload. Không đồng nghĩa pixel parity của toàn bộ MagicPath states.
- Hai canonical happy path, Processing không tự chuyển mất, Data condition/error/reset, original selected-file/date preservation, live native drawer suspend/restore, actual product button progression trong mock world: PASS.
- API-mode playground test không ghi nhận request Import/Readiness. Production test chạy build minified thực, không có Debug/control surfaces.
- Geometry/focus/scroll checks PASS. Visual QA xem Owner Profile Review, Staff Waiting và mobile controller screenshots; artifact tạm ở `test-results/`, bị thay thế khi rerun Playwright.
- Build/typecheck PASS qua production web-server build; chỉ còn bundle-size warning hiện có (~1,025 kB main). Lint không error, chỉ hai warnings baseline OnboardingPages/RecipeSchedulePage.
- Import/Planning wire drift gates và `git diff --check`: PASS. Không đổi pinned contracts hoặc HTTP clients.

## Debt / runtime boundary

Không phát sinh yêu cầu backend mới từ controller này. [TechDebt 013](../013/013_Import_TechDebt.md) tiếp tục là baseline; các projection không resolve API/outcome/candidate/display/live acceptance debt. Không thêm underconstruction vào scope. Không commit/push.

[Hướng dẫn sử dụng và catalog](014_UI_State_Playground.md).
