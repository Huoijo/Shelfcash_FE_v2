# S4.11 local integration v1

CURRENT FACT: native backend, three independently configured real worker threads,
and PostgreSQL17 run locally. Exact DB is `shelfcash_integration_s411` on
`127.0.0.1:5433`, role `shelfcash_integration`, dedicated Compose project/volume.
Automated fixtures own `shelfcash_test` on5432; neither target may substitute for
the other. Development/production DB is never accessed by this workflow.

Run from backend with the existing venv (PowerShell):

```powershell
.venv\Scripts\python.exe -m scripts.integration init
docker compose --env-file runtime/s411/private/compose.env -f compose.integration.yaml up -d --wait
.venv\Scripts\python.exe -m scripts.integration migrate
.venv\Scripts\python.exe -m scripts.integration status
.venv\Scripts\python.exe -m scripts.integration start
.venv\Scripts\python.exe -m scripts.integration seed
.venv\Scripts\python.exe -m scripts.integration e2e
.venv\Scripts\python.exe -m scripts.integration cases
```

`init` generates private, ignored local secrets; reports/ZIP never contain them.
Settings are in `runtime/s411/private/settings.json`; private account-holder demo
credentials are in `accounts.json`, usable locally, never VITE variables or reports.
No SMTP, external recipient or provider is contacted. Verified synthetic holders
receive setup tokens through the existing internal application delivery callback,
then N7 completes credentials. Owner invites Staff and Staff explicitly accepts;
grants are ordinary product grants, initially menu.read only. A second Owner/Store
tests foreign scope. No special staging product permissions or public admin/reset.

The supported `app.main.create_app` runs through native uvicorn, loopback18001.
The thin internal launcher records run UUID/PID and a graceful stop file; no
unidentified process is killed. A previous launch without matching completion
evidence or an occupied port blocks another launch. Logs are private server.log;
existing X-Request-ID is sent/returned for correlation. Runtime artifacts persist
under `private/app`: uploaded blobs and private PDF bytes survive backend restart.
Do not delete their directory while receipts/jobs retain references.

Each of IMPORT_WORKER_ENABLED, PLANNING_WORKER_ENABLED and
PDF_EXPORT_WORKER_ENABLED remains independent/default-off in product Settings.
The generated isolated profile explicitly enables all three. OPENROUTER_API_KEY/
MODEL are absent and rejected by the integration guard; manual review is usable.
BASELINE and DEFAULT_BASE95 are explicit versioned operator commands. The fixture
selects BASE95 plus1,000,000VND cap; these are synthetic choices, not assumed
defaults for another Store. Trained artifacts/model activation remain untested.

Dataset `s411-demo/1` manifests an actual Store-local anchor day, five named/SKU
Products, one expiry-tracked Ingredient, dated recipes, fourteen days/70 sales
(including an explicit zero), supplier/term, NONE fee with explicit full coverage,
inventory/sales/procurement declarations, two opening lots (one expired). Catalog
bootstrap uses typed existing application commands; stock/configuration/sales/
history are created by actual HTTP/application transactions, never ledger/status
edits. `dataset.json` retains actual IDs/source hashes/expected state and phase.
Bootstrap retries preserve completed seed; an uncertain phase must be inspected,
not declared PASS. Old failed-review/draft examples are retained, not deleted.

ACCEPTED FALLBACK / TECHNICAL DEBT: Store-only reset is unavailable because
append-only audit/history and cross-resource dependencies need coordinated
lifecycle. For the dedicated disposable integration DB only:

```powershell
.venv\Scripts\python.exe -m scripts.integration stop
.venv\Scripts\python.exe -m scripts.integration reset-disposable
.venv\Scripts\python.exe -m scripts.integration start
.venv\Scripts\python.exe -m scripts.integration seed
```

Reset requires exact environment=test/driver/host/port/role/database/no query,
owned runtime, database ownership comment, exact actual Store allowlist, matched
server-exit evidence and no connected DB clients. It never terminates clients.
DROP DATABASE itself refuses a racing connection; no FORCE/cascade-Store delete.
It recreates only this isolated DB and applies explicit Alembic head0017; old
private artifacts are moved to an owned retired generation, not purged. ALL
integration Stores/accounts/receipts are disposable together; do not use this
profile for shared/real data. Other Store IDs or unknown clients block reset.
Existing scripts.dev guards still reject this integration DB.

Local FE repo: `../Shelfcash_FE_v2`, Node24.16.0 observed, package-lock reused.
Use existing Vite entrypoint, public env only:

```powershell
cd ..\Shelfcash_FE_v2
npm ci --no-audit --no-fund
$env:VITE_DATA_SOURCE='api'
$env:VITE_API_BASE_URL='http://localhost:18001'
npm run dev -- --host localhost --port 5173 --strictPort
```

Use **localhost on both FE and BE**, exact Origin http://localhost:5173,
credentials include, current CSRF, Idempotency-Key and quoted If-Match. Existing
ENVIRONMENT=test/AUTH_DEV_COOKIE=true is the supported loopback transport:
HttpOnly shelfcash_dev_session/SameSite=lax/Path=/; it is not production Secure
__Host authentication. Do not mix127.0.0.1 and localhost sites. CORS allows
CSRF/CAS/idempotency headers and exposes ETag/Location/Retry-After/X-Request-ID/
Content-Disposition/Content-Length/nosniff. Successful native HTTP CORS is not
browser evidence; browser results are recorded separately.

Remote FE topology is NOT deployed/tested: choose matching HTTPS FE/API origins,
Secure cookie policy and exact credentialed CORS at deployment time. This task
does not bind publicly, configure domains/certificates or expose operator secrets.

Read workflow/limitations in the versioned integration handoff. Current FE repo
has Auth, Import through analyze, History, Menu and Inventory. Mapping/preview/
commit/planning/retained/PDF UI are not implemented; no fake UI or browser-API
fetch is substituted for those missing screens. Full S4.11 browser gate remains
PARTIAL until the required real UI workflow exists and passes.

Actual existing-screen browser verification uses installed Microsoft Edge and
Playwright in ignored task runtime, without interception, mock data or CORS bypass:

```powershell
cd ..\backend
npm install --prefix runtime/s411/browser --no-audit --no-fund playwright
node scripts/integration_browser.mjs
```

Keep FE and the owned backend ready first. Private browser.json records gates and
safe request metadata; screenshots remain private and excluded from handoff.
Exit0 means existing-screen gates passed; its overall status remains PARTIAL for
the missing whole-chain screens. `--history-only` resumes only a report with prior
upload/analyze PASS evidence and rechecks login/history/logout/Staff gates.
Do not reuse that report after resetting the dataset; run the full harness then.
Generate current wire evidence with `python -m scripts.integration_contract_snapshot`
before `python -m scripts.integration_handoff --version v2`; versions cannot overwrite.
