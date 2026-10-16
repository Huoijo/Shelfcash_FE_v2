# 013 — Import content parity implementation receipt

14/10/2026. Follow-up của 012: strict MagicPath content parity và centralized Debug isolation. Không commit/push.

## Tài liệu / authority

- Đọc cả hai pasted requests: full Import OWNER/STAFF và STRICT MAGICPATH CONTENT PARITY + DEBUG UI ISOLATION.
- Inspect lại MagicPath project `458079658328604672`, OWNER revision `460803015184642048`, STAFF revision `460804081875824640`; source/catalog 46 + 48 states, CSS. Không sửa canvas hoặc mở editing session.
- Business DOCX `docs/references/SHELFCASH_IMPORT_NAM_NGUYEN.docx` và audit/receipt/debt 012 tiếp tục áp dụng. Business thắng prototype; runtime authority vẫn `contracts/011/openapi.main.json`.
- [Đối chiếu nội dung và exceptions](013_Import_Content_Parity.md), [state mapping đầy đủ](../012/012_Import_State_Mapping.md).

## A. Architecture / files changed

Thêm `src/shared/debug/DevelopmentTools.tsx`/CSS, mount duy nhất tại App; scenario picker và diagnostic portals không chiếm normal layout. Bỏ mock footer ở SessionActions. Thêm Import presentation helpers và business facts renderer; cập nhật ImportPage, Analyze, Mapping, Flow, Preview/Explorer, Result, Readiness. Không thay endpoints/wire authority.

## B. Owner flow

Upload → Analyze → Resolve → reusable profile approval → Preview → Review → atomic commit → I06 → fresh R01 giữ nguyên. Mapping editor mở riêng; profile hiển thị business spec/evidence, raw pins vào Debug. No-profile title đúng design; blocked/stale là recovery screens. Reason/ack/CAS/current rights và exact-intent retry giữ nguyên.

## C. Staff flow

Reuse không có Owner controls. DEV reusable-change path có submit/wait/approved/rejected/resubmit screens riêng. API mode vẫn manual handoff + refresh trên cùng import; không thông báo giả đã gửi approval request. Debug không thay permissions hoặc gateway.

## D. State coverage

Giữ mapping 94 prototype states của 012. Sửa density/copy/hierarchy theo từng nhóm: upload/analyze/resolve/profile/staff approval/preview/review/commit/completion/readiness. Giữ role badges, subtitle và step eyebrows có thật trong source mới nhất. Loại catalog/IDs/revisions/raw JSON/mock notices khỏi workspace. Unknown names/counts vẫn unknown; không thay bằng demo facts.

## E. API-backed vs temporary

I01–I06/J01/M01–M04/N5/R01 tiếp tục dùng current clients/validators. DEV mock adapter/scenarios chỉ trong development; production không có Debug hoặc scenario controls. Browser API tests là controlled HTTP fixtures, không phải live BE acceptance.

## Validation

- Unit/boundary/SSR: **361 passed** (Auth 26, Store 118, Import 110, Planning 77, Operations 30). Import rerun sau các chỉnh presentation cuối: 110/110.
- Browser: **41 distinct cases đã pass trong phiên**. Full suite đầu: 38 pass/3 fail do trigger Debug che receipt footer. Đã sửa; scoped retest 28/28 pass, gồm cả ba lỗi đó, Owner/Staff/approval branches và Debug geometry/native-modal behavior. Tiếp tục retest production + mobile + API Import 8/8 pass.
- Debug geometry test so bounding boxes header/heading/stepper/dropzone/CTA và scroll trước/sau mở/đóng; focus được trả lại. Row provenance chỉ xuất hiện trong Debug, kể cả khi native product dialog đang mở; Escape không đóng nhầm product dialog.
- Production parity test chạy **bản build minified thực**, HTTP controlled fixtures; không có Debug/scenario controls/developer notices trong product screen. Đây không phải nghiệm thu live BE.
- Visual QA: xem screenshots Staff Analyze/Resolve, Owner profile và mobile Resolve; desktop/mobile screenshots sinh trong `test-results/`, có thể bị Playwright thay thế ở lần chạy sau.
- API build: PASS; bundle-size warning có sẵn (~1,021 kB main). Lint không error; còn hai warnings có sẵn ở OnboardingPages/RecipeSchedulePage.
- Bốn wire drift gates Import/Planning/Store/Operations: PASS; `git diff --check`: PASS. Không sửa pinned contracts.

## F. Known gaps

[TechDebt 013](013_Import_TechDebt.md) giữ debt nghiệp vụ chưa được BE resolve của 012 và bổ sung display contract còn thiếu. [FE → BE 013](../../../FE_ask/013_Import_Display_Contract_Clarifications.md) là **FE PROPOSAL TO BE, not runtime**. Không tuyên bố pixel/runtime parity cho toàn bộ 94 states khi backend không có tương ứng.

## G. Intentionally not implemented

Không invent candidate picker API, per-batch outcome DTO, raw source cells, A1/A2 fields ngoài T hoặc DESIGN_READY endpoints. Không đụng các milestones underconstruction/global queue/profile discovery/notifications. Không commit/push; giữ nguyên DOCX người dùng thêm và các thay đổi 012.
