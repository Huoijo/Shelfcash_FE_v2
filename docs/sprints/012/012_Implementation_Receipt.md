# 012 — Role-specific Import implementation receipt

Ngày: 14/10/2026. Phạm vi: full Import OWNER / STAFF theo yêu cầu mới. Không commit/push; không sửa backend hoặc thay wire authority.

## Tài liệu và authority

- Đọc yêu cầu Import được đính kèm trong prompt.
- `docs/references/SHELFCASH_IMPORT_NAM_NGUYEN.docx`: SHA256 `492f5834625c1d3103eca97ea7c76927cd1511a7c2dfc04ee49cbff1339bd29d`. Đã đọc toàn bộ paragraph/table qua OOXML. Bản trong Downloads có cùng hash. Giữ nguyên file người dùng bổ sung.
- MagicPath project `458079658328604672`: OWNER component `460747146686242816`, revision `460803015184642048`; STAFF component `460747115572916224`, revision `460804081875824640`. Đọc toàn bộ source và catalog **46 OWNER + 48 STAFF states**, xem preview cả hai, đối chiếu CSS; không dùng component Input flow cũ, không sửa canvas/start editing session.
- [State mapping trước implementation](012_Import_State_Mapping.md) ghi từng prototype state → FE projection → contract/giới hạn runtime.
- Current runtime target vẫn `contracts/011/openapi.main.json` (T), cùng các Import/Planning types, clients, validators và workflows hiện hành. Đối chiếu thêm source/handoff `IMPORT_MAPPING_API_CONTRACT_VI.md`, `import_analysis.py`, `import_staging.py` trong bundle BE night để xác nhận source guard, ambiguity, drift, retirement và N5 CAS. DOCX thắng prototype về business; claims A1/A2 trong prose không tự thay thế DTO runtime T.

## A. Architecture / files

- `importExperience.ts`: typed screen projection, role-specific step number, Analyze assessment, fault classification, Preview → Review guard, resolution groups và DEV approval adapter interface. Navigation không cấp quyền hoặc thay canonical lifecycle.
- `ImportWorkspace.tsx`: role/grants từ current membership cho cả API và DEV; bỏ bypass khiến mọi mock actor thành Owner. Inject mock-only review gateway; HTTP source không có gateway.
- `ImportPage.tsx` / CSS và `components/ImportExperience.tsx`: header/tabs, 6 bước, source context, Analyze checkpoint, responsive operational cards; giữ sidebar/routing/Store/auth/HTTP hiện có.
- `ImportFlow.tsx`: Resolve cards/group filters, Owner profile checkpoint, Staff reuse và approval branch, distinct stale/blocked/recovery, terminal completion navigation.
- `ImportMapping.tsx`: bốn phần reusable interpretation từ full spec, evidence/baseline vẫn đọc đầy đủ; không tự tạo backend diff. Missing optional counts hiện chưa được cung cấp, không biến thành 0.
- `ImportPreview*`: giữ same-pin paging/table/keyboard drawer/provenance/domain actions; chặn Review cho incomplete/unsupported/blocked/stale snapshot; bỏ số bước 5-step cũ và stale notice lặp.
- `ImportResult.tsx` / `ImportReadiness.tsx`: I06 immutable receipt riêng; R01 planning assessment theo ngày/quyền, có ready/blocked/unknown/error/warnings; retry Readiness không commit lại Import.
- `importFlow.workflow.ts`: thêm profile navigation, typed fault, Review navigation guard, completion terminal guard; giữ CAS/idempotency/review confirmation/atomic commit. HTTP 401/403 không được biến thành retry mutation uncertain. Upload's special committed-422 recovery không bị thay đổi.
- DEV fixtures/scenarios: Owner first profile, Staff importer reuse, Staff approval và rejected/resubmit. Mô phỏng actor Owner riêng; không cấp Staff N5 controls. IMPORT_VALUE batch-only không tự tạo reusable proposal. Mock state vẫn memory-only.

## B. Owner flow

File → **Phân tích dữ liệu** → Analyze status/completion → **Kiểm tra cách hiểu** → resolve source/semantics/identity/declarations/units → **Xem profile sẽ được lưu** → review reusable spec/baseline/evidence + lý do/ack → N5 approve → **Tạo Preview** → đọc đủ pages → Review confirmation trên server → explicit commit confirmation → I06 completion → R01 Readiness.

Approval và batch-only facts được tách rõ; Owner approval không commit và không chứng minh planning readiness. Reused profile không có proposal không cần một quyết định N5 giả. Reject/retire/error vẫn giữ batch và có đường quay lại Resolve/refresh.

## C. Staff flow

- Normal: File → Analyze → Resolve/reuse approved binding → Preview → Review → Commit → Completion. Không chèn Owner approval checkpoint, không có activate/reject/retire controls.
- Reusable change: dùng M01 `profile_proposals`/server blockers làm authority. Không suy approval-needed từ giá, quantity hoặc date thay đổi.
- API: **Bàn giao cho Owner** mở đúng URL `import_id`; Owner quyết định qua N5 hiện hành; Staff đọc lại M01/I04 rồi tiếp tục. Không ghi queue/send request giả, không hứa đã gửi thông báo. Reload giữ locator và đọc server, không tạo batch thay thế.
- DEV: submit → waiting (resolution bị khóa) → separate simulated Owner approved → Preview; hoặc rejected → edit mapping → new proposal revision → resubmit. File/source set/import ID giữ nguyên. Gateway đọc lại khi quay về workspace; reload toàn trang vẫn reset mock theo chính sách DEV hiện có.

## D. State coverage và giới hạn

- Upload: empty/selected/multiple, unsupported/duplicate local validation, server receipts/rejection/quota/conflict và lost-ACK intents giữ nguyên.
- Analyze: queued/running/completed/failed; source-required, ambiguous profile, drift, retired, no approved pin và provider unavailable có typed assessment/copy riêng khi server cung cấp evidence. Provider diagnostic unavailable/invalid cho phép CTA manual, không tự approve hay bypass blocker.
- Resolve: structure/source và identity/conversion/declarations giữ distinct typed editors. Category filter chỉ trên các issue đã đọc của Sheet; không bịa scoped/global counts hoặc tự bind entity theo tên.
- Profile: full spec + exact active baseline, missing fields, permissions, lifecycle CAS conflicts, reject/retire/approval failure và uncertain intent. T không có separate already-handled vs concurrent-change read model; UI yêu cầu đọc lại, không tự kết luận ai đã xử lý.
- Preview: warnings vẫn read/review được; blocker toàn batch và stale có recovery khác nhau. Không drop INVALID, không commit theo trang/filter đang nhìn. Regeneration tạo pin mới, reset confirmation theo workflow.
- Commit: current required actions + server reauthorization; queued/running, permission/retirement/stale/conflict/system failure và uncertainty được phân biệt. Lost ACK giữ cùng key, body, If-Match; completion restore không gửi commit mới.
- Completion/readiness: successful write/no-op/warnings tách khỏi R01 ready/not-ready/unknown. Permission thiếu hoặc assessment lỗi không rollback completion.
- Tri-state stockout/A1 contributions, raw cells và explicit profile-candidate picker không được fabricate ngoài current DTO T. Đây là giới hạn integration/contract, không phải đã implement đủ mọi dữ liệu demo trên MagicPath.

## E. API-backed và temporary

- API-backed architecture: I01/I02/I03/I04/I05/I06, J01, M01–M04, N5 và R01 bằng clients/validators hiện có, không đổi endpoints/DTOs.
- Temporary: chỉ DEV data source cung cấp submit/wait/Owner-simulated-decision adapter. Scenario picker DEV hiện có được giữ; không ship MagicPath prototype state selector.
- Browser API tests intercept HTTP bằng controlled server fixtures; **không phải live BE acceptance**. Không có fallback từ API errors sang mock.

## Validation

- `VITE_DATA_SOURCE=api npm run build`: PASS. Vẫn có bundle-size warning (main ~1,021 kB); không coi là lỗi type/build.
- Unit/boundary/SSR suites: **361 passed** = Auth 26 + Store 118 + Import 110 + Planning 77 + Operations 30.
- Import, Planning, Store, Operations wire drift gates: PASS; không đổi pinned OpenAPI/wire.
- Browser: **38 distinct cases đã pass**. Full run: 35 pass, 3 fail (2 selectors cũ sau thay layout và 1 duplicate stale notice). Đã sửa, focused retest 3/3 pass. Visual retest Owner desktop + Staff mobile 2/2 pass; sau chỉnh mobile stepper tự cuộn, focused mobile 1/1 pass.
- New browser coverage: Owner end-to-end + R01 ready, Staff reuse/approval/rejection/resubmit end-to-end, unknown locator refresh, actual HTTP handoff/resume, permission revoked, commit lost ACK exact intent + I06 reload + blocked readiness, stale regeneration, blocked Preview return Resolve, mobile width/6 steps.
- Visual screenshots sinh trong `test-results/`: Owner profile review/approved/completion, Staff mobile upload/resolve. Thư mục test output có thể bị Playwright thay thế ở lần chạy sau; không phải artifact được commit.
- Lint: không error, chỉ 2 warnings có sẵn ở OnboardingPages/RecipeSchedulePage. `git diff --check`: PASS.

## F. Known gaps

Xem [Import TechDebt 012](012_Import_TechDebt.md) và [FE → BE requests](../../../FE_ask/012_Import_Capability_Requests.md). Không tuyên bố runtime parity cho queue/outcome discovery/candidate-selection DTO hay A1/A2 chưa có trong target T. Chưa nghiệm thu với backend/database/worker đang chạy thật.

## G. Intentionally unsupported / parked

Store-wide Staff approval queue/profile discovery, notifications và các milestones đã park trong `Underconstruction_by_BE.md` vẫn không được triển khai runtime. Owner secondary buttons báo đang xây dựng; không chặn main import. Không tự invent Excel actual receipt, purchase-history-as-stock, split-report recipe assembly, planning safety-stock policy hay per-field raw values backend chưa cung cấp. Không commit/push.
