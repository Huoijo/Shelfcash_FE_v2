# Local public planning verification — S4.9

## CURRENT FACT — supported execution

Use one backend process. Its lifespan owns the planning thread; public GETs never
start a worker. Defaults keep Import and planning workers disabled independently.
Do not launch a second test runner or worker while the owned task process remains
active. Before resuming, inspect branch/index/WIP, task notes, logs/exit status and
guarded DB head. Missing completion evidence is UNVERIFIED/INTERRUPTED, never PASS.

Automated verification uses only the repository fixtures and supported
`scripts.dev` reset/status guard. They validate local host, environment=test and
exact shelfcash_test before DB ownership. No manual reset/migration is needed for
S4.9: existing head0016 supports its additive JSONB integration.

Example targeted command from backend, after confirming no old runner:

```powershell
.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_public.py tests/integration/test_planning_public_security.py tests/integration/test_planning_public_sources.py tests/api/test_planning_public_openapi.py
```

This is synthetic real HTTP/PostgreSQL/forecast/engine/worker coverage. Fixtures
own only shelfcash_test and assert committed state through fresh Sessions.
It does not create real business seed entities or prove browser/real-data quality.

## Manual test-environment flow

Use private local test environment settings with DATABASE_URL pointing to exact
local shelfcash_test and ENVIRONMENT=test. Do not use development DB. Check target
before starting a server or operator command:

```powershell
.\.venv\Scripts\python.exe -c "from app.config import Settings; from scripts.dev import validate_reset_target; from sqlalchemy.engine import make_url; s=Settings(); validate_reset_target(s); assert make_url(s.database_url).database=='shelfcash_test'; print('Exact local shelfcash_test guard PASS')"
.\.venv\Scripts\python.exe -m scripts.dev status
```

Use existing [FULL_TEST_FLOW](FULL_TEST_FLOW.md) auth/operator setup and
authorized operational routes to provide Store, grants, cap/defaults, observed
sales, dated assigned recipes, inventory evidence and full fees/limits/inbound
context. Keep identity evidence and operator secrets private. Missing history is
not observed zero. Config Save is independent from executable readiness.

Write a reviewed local operator command file (replace UUID/version/evidence with
actual values) using the existing supported configuration command:

```json
{"store_id":"00000000-0000-4000-8000-000000000001","action":"BASELINE","expected_version":null,"evidence_reference":"verified local explicit BASELINE approval"}
```

```powershell
.\.venv\Scripts\python.exe -m scripts.configure_planning --command-file runtime/planning-baseline.json
```

The operator credential is prompted, never put in the command line. CAS retries
use the actual current version. DEFAULTS initialization is a separate explicit
operator action; BASELINE selection neither trains nor creates observations.
An unconfigured Store stays MODEL_CONFIGURATION_UNKNOWN.

For an explicitly enabled local test server, configure private test environment
Origin/cookies according to the auth runbook, then opt into its own planning thread:

```powershell
$env:PLANNING_WORKER_ENABLED='true'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

These are manual instructions, not commands executed against development runtime
by this task. Do not use `--reload` or multiple process workers. Import's flag is
unrelated. Remove the temporary opt-in after stopping this test server.

With current authenticated Store rights, GET C01 and R01 planning action. Check
data_status and execution_status separately; can_generate is not feasibility.
C01 winner_selection reflects actual registered worker capability. POST C02 with
Origin, X-CSRF-Token, a fresh UUID key and the selected request mode. Default mode
uses the current C01 default_requirements_version; fully custom/saved do not
inherit defaults. Send no strategy, model selector, currency or selected option.

Follow Location C03 at poll_after_ms (2000 nonterminal/0 terminal). Retry uncertain
HTTP acknowledgment using exactly the same key and original request. Receipt202
confirms durable intent only. Read status, outcome, exclusions, errors and proof
separately from winner_option_id; no purchase order is executed. ETag is opaque;
v1 always returns full200. Result history is immutable after completion despite
live data/config changes; current read permissions still apply.

## Failure/recovery inspection

Inspect task-owned logs and durable Run before retry. Real process death is
recovered conservatively to failed/PROCESS_INTERRUPTED, not recomputed. A live or
unknown owner cannot be stolen by another backend/elapsed timeout. Thread-only
abandonment in a living process remains a documented limitation. Overall deadline
is cooperative resource accounting, not proof that native computation was killed.
Failed source errors can retain verified partial output; unverified output stays
null. No test SQL/source mutation should be mistaken for a supported business API.
