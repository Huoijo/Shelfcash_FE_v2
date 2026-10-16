# S4.7 — audit remediation và lịch hiệu lực công thức

## Freeze trước chỉnh sửa (2026-10-11)

ACCEPTED DECISION: yêu cầu người dùng trong attachment aba07527 cho phép xử lý
CA-002/016/019/020/021, gán H01/H02 cho S4.10, rồi triển khai S4.7 theo exact
CAT12/N20–N22. Không S4.8, không ZIP/handoff mới, không thay engine hoặc ADR accepted.

Baseline lịch sử: shelfcash_backend_context_handoff.zip ngày10/10, SHA-256
238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd.
Branch feat/from_forecast_to_decision_run; HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5.
WIP rộng S3/S4 được giữ nguyên; trạng thái/hash trước task lưu tại runtime/s47/.
Authority: AGENTS → CURRENT_STATE/DECISIONS/accepted ADRs → kiến trúc/API/domain/schema/
roadmap; product contracts Auth/Import/Inventory/Catalog và quyết định người dùng
chi phối policy. Code/tests chỉ là implementation reality, không tự duyệt drift.
ADR-007/008/009/010/011/013 và các ADR snapshots/planning liên quan không sửa.

CURRENT FACT trước task: N20–N22 chưa có HTTP. Recipe header yêu cầu ngày bắt đầu,
exclusion inclusive toàn bộ rows; chưa biểu diễn unassigned. N6 kiểm CAS và future
observation nhưng chưa kiểm stock events sau observation. I05 yêu cầu reason mọi intent.

## Phạm vi, dependency và rollback

- Audit gate trước S4.7: Staff IGNORE own batch/invalidation/terminal guard; N6
  observation theo Ingredient dưới canonical fence, receipt gửi muộn; conditional
  commit reason; bảng bounds Money/Quantity/key và compatibility evidence.
- N20 read calendar; N21 retained preview/commit atomic; N22 retained read/audit.
  Ngày Store+1, inclusive periods; gap phải acknowledge; lịch cũ/retained Runs bất biến.
- Dùng transaction-owned RecipeUseCases, same ordered canonical table fences với
  Import. Không provider/forecast/BOM/solver/readiness execution.
- Migration chỉ cho trạng thái assignment và retained change/receipt; không xóa
  evidence, không nullable hóa inputs của domain engine. Downgrade phải chặn mất
  dữ liệu unassigned/evidence nếu không thể biểu diễn ở schema trước.
- Ảnh hưởng FE: conditional reason, bounds/descriptors, N6 actionable freshness,
  ba routes đã có design nhưng nay có HTTP. Handoff cũ chưa sync.
- Rollback phạm vi task: source/DTO/writers/routes/docs/tests vừa sửa và migration
  mới; không reset/clean WIP hoặc downgrade development DB.

## Kế hoạch verification

Targeted unit/HTTP và PostgreSQL local shelfcash_test sequential theo fixtures
guard hiện hành, fresh Sessions sau commit/rollback. Không full-suite mặc định.
Gate audit chạy trước lịch công thức; lịch có applicability/day rollover/overlap/
gap/CAS/auth/idempotency/concurrency/Import race/SQL rollback/retained GET tests.
Offline OpenAPI diff không network/DB/lifespan; JSON feature examples validate DTO.
Migration roundtrip/schema/reset allowlist và regression callers bị ảnh hưởng.
Mỗi lượt ghi command, kết quả, fail→fix và giới hạn; không cộng nhóm overlap.

## Kết quả thực chạy

Các lệnh dưới chạy từ backend qua `.\.venv\Scripts\python.exe -m pytest`;
selector paths ghi nguyên văn. PostgreSQL fixtures xác nhận exact local
`shelfcash_test` qua validate_reset_target trước reset/connect; admin connection
chỉ probe/provision test DB theo fixture hiện hành, không connection development DB.
Các lượt tuần tự, không reset test DB khi một lượt khác còn chạy.

### Các lượt trước final gate (overlap, không cộng count)

| Selectors / command suffix | Kết quả thực chạy | Fail→fix / giới hạn |
| --- | --- | --- |
| `-q tests/integration/test_s47_audit_remediation.py tests/integration/test_stock_writes.py` | 2 failed,16 passed,32.50s | Test thay clock callable làm reads giữ clock cũ; đổi clock mutable dùng chung rồi login. Staff test cần đủ read grants cho unknown sheet; sửa fixture, không nới quyền. |
| Audit broader group: audit/stock/bounds/import_inventory_supplier/import_commit | Interrupted, không final count | IndentationError trong import_configuration_preview; không coi là pass. AST check và lượt affected chạy lại. |
| `-x -q tests/integration/test_s47_audit_remediation.py` | 1 failed,3 passed,8.25s | Sửa indentation source. |
| `-x -q tests/integration/test_s47_audit_remediation.py tests/unit/test_s47_bounds_reason.py tests/integration/test_stock_writes.py` | 1 failed,4 passed,10.73s →21 passed,31.03s | Test đọc nhầm approval_required ở summary; sửa assert actual MappingUpdated DTO. Đây là audit-remediation gate trước N20–22. |
| `-q tests/integration/test_import_commit.py tests/integration/test_import_inventory_supplier.py tests/integration/test_s47_audit_remediation.py tests/unit/test_s47_bounds_reason.py` | 46 passed,151.91s | Conditional reason, Money/quantity exact và actual writers. Trước các tests bổ sung cuối. |
| `-q tests/unit/test_recipe_schedule.py` | 1 collection error0.33s →1 passed0.07s | Red gate module chưa có rồi DTO triển khai. Unit file sau đổi tên test_recipe_calendar_contract.py tránh basename collision. |
| `-q tests/unit/test_recipe_schedule.py tests/unit/test_s47_bounds_reason.py` | 4 passed,0.45s | DTO/domain calendar/bounds. |
| `-x -q tests/integration/test_recipe_schedule.py` | 14 passed,21.28s | Real HTTP + PostgreSQL initial editor gate. |
| `-x -q tests/integration/test_recipe_schedule.py tests/integration/test_recipe_schedule_schema.py tests/unit/test_recipe_calendar_contract.py` | 23 passed,34.64s | Lượt trước bị collection basename collision, chưa chạy PG; rename unit file rồi chạy lệnh này. |
| `-q tests/integration/test_recipe_schedule.py tests/integration/test_recipe_schedule_schema.py tests/integration/test_s47_audit_remediation.py tests/unit/test_recipe_calendar_contract.py tests/unit/test_s47_bounds_reason.py tests/api/test_recipe_schedule_openapi.py` | 32 passed,43.38s | Trước cuối cùng bổ sung exact normalization/read output/caps. |
| `-x -q tests/integration/test_s47_audit_remediation.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_operational_import_schema.py tests/integration/test_public_reads.py tests/integration/test_application_paths.py tests/integration/test_operational_paths.py tests/api/test_import_openapi.py tests/api/test_recipe_schedule_openapi.py` | 183 passed,211.86s | Affected schema/public reads/internal writers; không whole-suite. Sau gate thêm Money output schema/normalization nên final gate kiểm lại boundary bị tác động. |

### API/unit final gate

Exact command:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/api tests/unit/test_s47_bounds_reason.py tests/unit/test_recipe_calendar_contract.py tests/unit/test_application_contracts.py
```

Trước fix:3 failed/47 passed4.26s; sau fix **50 passed,4 warnings4.34s**.
Hai exact route inventory tests chưa có N20–22; health assertion còn thiếu N6/N8
đã có từ S4.6. Chỉ cập nhật inventories, không đổi route cũ.

CURRENT FACT / TECHNICAL DEBT: architecture guard S1 cấm direct queries mọi
application file đã drift trong baseline: ImportStaging adapter và S4.6 stock/
operational configuration. Không xóa hoặc bỏ guard rộng. Narrow explicit allowlist
chỉ ba concrete transaction adapters đã tồn tại; HTTP imports và Session.close
vẫn cấm toàn application. New S4.7/stock observation SQL queries đưa vào repository,
S1/S4.7 query separation vẫn được assert. Đây là test/documentation alignment của
approved existing adapters, không evidence runtime bug đã sửa hoặc kiến trúc mới.

### Persistence/runtime coverage và limits

- test_s47_audit_remediation.py: conditional reason HTTP, Staff own-batch IGNORE
  no Owner/profile immutable/invalidation/completed/other actor; exact Money18/18
  và197-char Quantity persist fresh session; scoped observation/late receipt/race.
- test_recipe_schedule.py: inclusive active repository lookup, future-only preview,
  scoped units/content validation, overlap/gap acknowledgment, pagination pins,
  Store timezone midnight, current grants/revocation/foreign Store, no-op/replay,
  real concurrent calendar commits và Import/editor version allocation.
- Fault injection sau actual writer flush chứng minh rollback recipes/lines/old
  closure/retained success state; lost commit ACK kiểm durable receipt bằng fresh
  session trước trả kết quả, không blind duplicate write.
- Historical ForecastRun/DecisionRun fixture JSON giữ nguyên sau calendar change.
  Đây là persistence invariant, không full PlanningRun/engine end-to-end acceptance.
- Migration0015 clean downgrade/upgrade, ORM columns/nullability/head đúng,
  immutable preview/receipt/audit constraints, downgrade refuse evidence loss.
- GET canonical SQL read-only; session authorization bookkeeping hiện hành riêng,
  không forecast/BOM/solver/parser/provider/current calendar recomputation của N22.
- Migration/lock/load production rollout, browser/SMTP/live provider/performance,
  engine quality/real-data forecasting chưa kiểm. Không full-suite/solver/provider.

### Offline OpenAPI và documentation

```powershell
$env:PYTHONPATH='.'
$env:PYTHONDONTWRITEBYTECODE='1'
.\.venv\Scripts\python.exe runtime/s47/generate_openapi.py
```

PASS: Settings _env_file=None trước import module-level main, worker false;
Engine.connect/raw_connection/socket.connect/create_connection bị guard raise,
không lifespan/DB/network/provider. Added đúng3 N20–22 paths, removed none,
operation count38=37 core+health; changed existing operation schemas chỉ M04 PATCH
và I05 POST. 230→257 schema components do new editor DTOs/input-output money schema.
Generated files ở ignored runtime/s47/openapi_after.json,openapi_diff.json;
repo không có committed OpenAPI artifact cần regenerate. Không tạo handoff/ZIP.

Bốn JSON examples feature RECIPE_SCHEDULE.md được json.loads và model_validate
với PreviewRequest/CommitRequest/Timeline/Receipt hiện hành; AST parse app và
alembic versions PASS. File/anchors mới/các links task scoped kiểm lại cuối task.



### Final source gate — current Money schema/normalization và S4.7

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/integration/test_recipe_schedule.py tests/integration/test_recipe_schedule_schema.py tests/integration/test_s47_audit_remediation.py tests/unit/test_recipe_calendar_contract.py tests/unit/test_s47_bounds_reason.py tests/api/test_recipe_schedule_openapi.py tests/integration/test_import_commit.py tests/integration/test_import_inventory_supplier.py
```

**73 passed,4 warnings198.59s**. Real guarded PostgreSQL, fresh-session SQL proofs,
concurrency/rollback/retained reads và affected Import canonical consumers.
Overlap với32/46/183/API50; không cộng các lượt thành regression/full-suite total.
Warnings hiện hành: schema field shadow Pydantic (3) và Starlette anyio alias (1).


### Affected migration/reset/read-adapter/shared-field gate

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/integration/test_database_bootstrap.py tests/integration/test_identity_store_schema.py tests/integration/test_data_semantics_correction.py tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade tests/integration/test_supplier_operational_constraints.py tests/integration/test_verification_commands.py tests/integration/test_stock_writes.py tests/integration/test_import_field_value_bindings.py tests/integration/test_decision_operational_capture.py::test_capture_readonly_and_does_not_touch_caller_transaction tests/integration/test_decision_operational_capture.py::test_one_repeatable_read_snapshot_under_concurrent_changes
```

**135 passed,1 failed,4 warnings**; pytest printed17969.28s (4:59:29).
Đây là thời lượng hiển thị của invocation, không performance benchmark hoặc thời
lượng từng test; không suy throughput từ nó. Failure duy nhất là explicit actual
SQL table inventory của test_identity_store_schema còn thiếu hai bảng S4.7;
metadata inventory cùng test đã thêm nhưng actual table assertion chưa thêm.
Sửa đúng hai tên trong assertion, không thay schema để né test. Chỉ rerun failed
case sau khi group hoàn tất; không chạy hai nhóm PG/reset đồng thời.

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/integration/test_identity_store_schema.py::test_schema_exact_tables_constraints_indexes_and_metadata
```

Rerun failed case: **1 passed10.15s**; SQL actual table inventory, migration head và Alembic compare_metadata PASS. Không ghi group ban đầu thành136 pass hoặc cộng với
73/50/183. Hai capture tests chỉ scoped MVCC/read-only; không gọi execute pipeline,
NativeSearch/solver, forecast/BOM hoặc provider. Broadening giới hạn affected
migration head/exact tables/reset allowlist và actual readers/shared bindings.


## Kết luận scope và preservation

S4.7 **COMPLETE trong scope CAT12/N20–N22**, không COMPLETE toàn v1. Audit gate
CA-002/016/019/020/021 đã sửa; IDs/historical findings giữ trong audit§9.
H01/H02 assigned S4.10 approved v1 chưa implement; FE handoff sync/codegen vẫn
REMAINING. Không còn câu hỏi sản phẩm chặn scope đã duyệt này. S4.8+ không chạy.

501 baseline paths có hash trước task;46 existing paths thay đổi đúng scope
source/DTO/readers/reset tests/docs của task,455 còn lại giữ hash. Có các source/
DTO/tests/feature/notes/migration0015 mới riêng scope. All23 ZIP cũ và các ADR/
AGENTS/FE gốc giữ hash; HEAD/index không đổi. Không stage/commit/push/clean/reset
WIP. Source .env/config/credentials không thay; không tạo ZIP mới. Baseline audit
report chỉ thêm historical banner/§9 remediation, không xóa IDs/evidence cũ.

Relevant documentation links/anchors và4JSON feature DTO examples PASS;
`git diff --check` PASS (LF→CRLF notice riêng app/main.py, không whitespace error).
Không phát hành/sửa ZIP để claim FE đã sync. Feature và compatibility changelog là
chỉ dẫn integration hiện hành trong repo, bàn giao version mới cần task riêng.

## CURRENT FACT — checkpoint resume sau sleep, 11/10/2026

Prompt gốc attachment aba07527 không nằm trong context chat hiện tại. Khôi phục
scope từ freeze/checkpoint đầy đủ ở trên, audit§9, CAT12/Auth/Import/Inventory và
compatibility changelog; giữ authorization đã ghi, không tự thêm policy. Đối chiếu
CA-002/016/019/020/021 và N20–N22 với source/tests: implementation đã hoàn tất trước
resume. H01/H02 vẫn assigned S4.10, chưa implement; handoff FE vẫn còn riêng.

Phát hiện khi resume:

- Branch `feat/from_forecast_to_decision_run`, HEAD
  `a4b68378f35fea6f71b549e24393cf4bbb35aba5`; index trống. WIP rộng giữ nguyên.
- `Get-CimInstance Win32_Process` không thấy Python/pytest/worker đang hoạt động;
  chỉ có các terminal PowerShell/command inspection. Không kill process nào.
- `runtime/s47/final_preservation.json` đã ghi lúc08:07:27; không có source/test/
  docs/migration `.py`/`.md` sửa sau mốc đó trước lượt resume. Kiểm hash độc lập:
  đủ501 baseline paths, đúng46 changed existing paths của final preservation,
  không mất/revert/thêm thay đổi vào baseline ngoài danh sách. HEAD/index unchanged.
- Runtime không còn raw pytest log hoặc OS exit status của invocation cũ. Reuse
  completion evidence trong task notes: final source73 passed; API/unit50 passed;
  affected migration/reset135 passed/1 failed, failed case sửa và rerun1 passed.
  Đây là kết quả đã ghi của lượt trước, không claim vừa chạy lại trong resume.
  Invocation indentation/collection bị ngắt ở bảng trước vẫn INTERRUPTED, không
  đổi thành PASS; các selectors bị ảnh hưởng đã có completed reruns ghi ở trên.
- Docker Desktop daemon chưa chạy; container PostgreSQL retained bị exited255.
  Read-only `inspect_database` đầu tiên timeout, exit1: DB status UNVERIFIED tại
  thời điểm đó; không phải failure evidence của pytest hay application.

Các commands thực chạy để tiếp tục (PowerShell từ backend):

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
git diff --stat
git diff --cached --stat
Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python|pytest|powershell|pwsh|uv|docker' } | Select-Object ProcessId,ParentProcessId,Name,CreationDate,CommandLine | Format-List
docker compose ps --all
Get-Service *docker* | Select-Object Name,Status
Start-Process -FilePath 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -WindowStyle Hidden
$env:PYTHONPATH='.'
$env:PYTHONDONTWRITEBYTECODE='1'
.\.venv\Scripts\python.exe runtime/s47/generate_openapi.py
docker compose start postgres
.\.venv\Scripts\python.exe runtime/s47/resume_verify.py
git diff --check
```

Fail→recovery: initial inline hash/DB inspection exit1 do ConnectionTimeout khi
daemon chưa chạy. `docker compose ps --all` báo missing Linux engine pipe; bật
Docker Desktop, start **existing** postgres container/named volume, không recreate
schema. Lượt đầu `resume_verify.py` exit1 vì PostgreSQL còn starting up; chờ10s,
chạy lại đúng command, **exit0/PASS**. Không sửa application để né lỗi startup.

`resume_verify.py` giữ exact read-only procedure trong ignored runtime: validate
test target trước connect, dùng supported `inspect_database`, không admin/dev DB,
reset, seed hoặc Alembic mutation. Final DB status: exact local `shelfcash_test`,
actual/expected head `0015_recipe_schedule`, at_head=true,52 tables. Hash/HEAD/index,
AST app/migrations và4 feature examples validated với current DTO cũng PASS;
artifact `runtime/s47/resume_state.json` giữ kết quả. Offline OpenAPI exit0: đúng3
N20–N22 paths added, none removed, existing operation changes chỉ M04 PATCH/I05
POST,38 operations; warnings schema-shadow hiện hành. `git diff --check` exit0.

Không có source change mới hoặc gate thiếu completion sau đối chiếu, nên không
khởi chạy lại pytest/full-suite chỉ vì sleep. Các kiểm tra resume xác nhận recovery/
schema/contract/preservation, không thay thế persistence/concurrency tests trước
đó và không cộng overlap thành regression total. Không có command resume bị ngắt
còn pending; hai DB probe failures được ghi riêng, không tính PASS.

Kết quả: audit remediation trong scope resolved; S4.7 COMPLETE theo CAT12 với
giới hạn acceptance ghi ở trên. FE/browser/live provider/production rollout và
handoff sync chưa kiểm/chưa thực hiện. Không OpenRouter/engine execution, stage/
commit/push/deploy/ZIP/S4.8. Resume chỉ bổ sung checkpoint này và ignored runtime
recovery artifacts; giữ nguyên implementation/migration và WIP ngoài scope.
