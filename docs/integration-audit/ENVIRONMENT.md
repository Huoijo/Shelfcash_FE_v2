Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# Environment and authorized boundaries

CURRENT FACT: this is the target-machine discovery run explicitly assigned in chat. The older handoff/preparation documents are historical, not a prohibition on this run. Baseline/execution window: 2026-10-16 approximately16:35–17:10 Asia/Saigon; exact test timestamps are in local JSON evidence. No prior completed audit occupied the active templates; no historical run was overwritten.

## Source and host baseline

Windows10.0.26300, native X64/AMD64. Python3.11.9; Node24.16.0; npm11.13.0. Backend venv is backend/.venv/Scripts/python.exe (system Python lacks project dependencies). Installed FastAPI0.115.14, Pydantic2.13.5, SQLAlchemy2.1.3, psycopg3.3.6, httpx0.28.1, uvicorn0.54.0. FE Vite8.3.2, React19.3.0, Router8.4.0, TypeScript6.0.2/installed6.0.3, Playwright1.64.0. Browser actually used: installed Edge155.0.4283.45. Playwright bundled Chromium1248 is absent; no dependency installation performed.

| Checkout | HEAD | Initial dirty state | Initial fingerprint |
| --- | --- | --- | --- |
| FE | 951ac2d07631f23927ba28da1a612619b4731d86 |  M README.md  M package-lock.json  M package.json  M vite.config.ts ?? engine_reviews/  | 9fd0601d7ef1641a641c59625aed58318e2d1113b529f75af98216610e45dc35 |
| BE | d5cfbfb59de7c45bc08eb47129b5ba3919e05473 | ?? 018_Backend_Capabilities_Service_Boundary.md ?? 019_Main_Frontend_Implementation.md ?? dts/  | f2653425b4a30e5723c222dbe751819ed9e7f5d8ac0cb355ebdccf81e7737e4a |
| RUNNING_BE | d5cfbfb59de7c45bc08eb47129b5ba3919e05473 | clean | 10f9073f7e1f5dd53ea7f43a1712aafa4aa1a33a762349b2586a41d5ba3c7bb0 |

Fingerprint algorithm: sorted union of git ls-files -co --exclude-standard, unique paths; SHA256(path UTF8 + NUL + SHA256(file bytes)) accumulated. Includes docs/untracked source, excludes ignored secrets/runtime/dependencies. It is a baseline fingerprint, not a deployed build attestation. FE dirty README/package/package-lock/vite and engine_reviews; BE untracked018/019/dts were preserved. Same BE HEAD; clean runtime checkout independently inspected.

## Running backend

API https://localhost:8103; exact allowed Origin https://localhost:5173. Manifest source root backend-local-runtime-d5cfbfb, SHA d5cfbfb59de7c45bc08eb47129b5ba3919e05473. Supported local_runtime status verifies current_database=shelfcash_local, limited role shelfcash_local_runtime, loopback5433, owned DB marker, head l5_20261016_assistant_f4 and76 tables. Docker container shelfcash-integration-s411-postgres-1, PostgreSQL17-bookworm. Other containers/DBs untouched.

Manifest owner PID33552, Windows birth134366169414845097, run7fdc61c9-8989-439d-acfe-af0c86886e45. OS CIM records its venv Python launcher and listener child21420, parent33552, matching serve/run command. Supported _birth reports ALIVE with matching incarnation; worker observations carry matching run/digest and are fresh. Import/Planning/PDF/Notifications threads=true; email-verification=false. This proves thread observation, not execution of a real job. No new batch/job was submitted; actual Analyze execution remains BLOCKED.

CURRENT FACT: status configuration_matches=false because current .env differs from launched overrides. User explicitly supplied runtime Email/Import Qwen/Summary/Chat OFF and forecast host default. Email thread OFF independently confirmed. Status does not expose effective Import/Assistant flags or host selection; those remain user-attested, not independently introspected. No process memory/secrets were read, flags changed, provider/email workflow invoked, or runtime restarted. No mismatch is attributed to a backend defect merely from .env. Main checkout start is prohibited by its clean-source guard; no bypass/commit attempted.

API TLS probe verified the exact local PEM; no verify=false. Allowed CORS preflight200 with credentials and required headers; HTTP localhost or HTTPS127.0.0.1 Origins400/no Allow-Origin. Source cookie contract is Secure HttpOnly SameSite=Lax Path=/ __Host-shelfcash_session, session-backed CSRF/Origin; A01 followed by independent A03 succeeded. Credentials/cookies/CSRF never written to tracked evidence.

## Frontend and browser

FE .env public settings: VITE_DATA_SOURCE=api, VITE_API_BASE_URL=https://localhost:8103. Started unchanged source via README-supported Vite HTTPS mode at https://localhost:5173, no port fallback. Owned nodePID15952/birth134366176996035600; command node vite --mode https --host localhost --port5173 --strictPort, source root Shelfcash_FE_v2. Edge navigation with ordinary TLS checks failed ERR_CERT_AUTHORITY_INVALID before rendering. Certificate trust is B-TLS; no safety checks disabled.

Independent controlled browser server: current same FE source, HTTP127.0.0.1:4174, VITE_DATA_SOURCE=api/API=http://127.0.0.1:18001, intercepted by existing test helper. Owned exec session96046/nodePID16360/birth134366179009794195. Dummy API is not the live backend; no controlled Store/account/receipt reaches PostgreSQL. Dedicated temporary config avoids the existing POSIX shell commands and missing bundled browser; installed Edge, workers1, retries0, normal TLS checks, existing60s test timeout. The initial background controlled-server launch was rejected by automatic approval review (reason returned: blocked by policy); a foreground owned exec session succeeded instead. Both audit-owned FE servers are stopped after verification; existing BE stays running.

## Account/Store prerequisite

docs/testing/TEST_ACCOUNTS.local absent. User explicitly permitted authentication/identity/membership/grant inspection of ignored backend runtime/local/private/test-owner.json and test-staff.json. Two separate httpx cookie jars, A01/A03/T01/T02200. Owner user2596a493-212d-4d37-8a1a-90b445b71c0a has43 current permissions; Staff usera67c4983-c484-4e00-ad2a-a91338dfb2a7 has menu.read only. Both expose exactly one Store **Local Test Store**, ID **e2597866-e772-4bd5-9f3d-1996ddd0179c**, timezoneAsia/Ho_Chi_Minh/currencyVND. Membership IDs/current authorization versions are in redacted evidence.

Assigned Store **ShelfCash Local Demo** has no verified ID or membership in these candidate sessions. Supplied Staff description (menu/ingredient/inventory reads) disagrees with current grant set. This is B-ACCOUNT, an account/data prerequisite, not proven product authorization failure. No Store business write/read sweep, account creation, grant change, reset/migration/deletion, additional fixture Store or external email was performed. Login sessions are the only live application mutations.

## Blockers and boundaries

| ID/category | Observation | Affected scope | Exact prerequisite / owner |
| --- | --- | --- | --- |
| B-ACCOUNT / DATA | Both candidates belong only to Local Test Store; Staff only menu.read | All assigned-Store live reads/mutations, Analyze and downstream flows, role/isolation/persistence | Environment owner privately provides correct existing Owner/Staff credentials whose T01/T02 resolves ShelfCash Local Demo; exact Store ID and current rights verified; no autonomous grant/account changes |
| B-TLS / ENVIRONMENT | Edge rejects HTTPS5173 certificate | All normal live UI routes/controls | Environment owner establishes trust for the exact FE localhost certificate in the browser trust configuration; recheck without skipping verification |
| B-FIXTURES / DATA | No authorized second/zero-Store account or multi-Store fixture | Live multi/foreign-Store, revocation/concurrency actor cases | User supplies expressly authorized fixtures/accounts; controlled evidence is separate |
| B-CONFIG / ENVIRONMENT | Runtime overrides differ from .env; status lacks model/host flags | Independent effective-model/default attestation | Supported non-secret runtime configuration diagnostic or launch override record from environment owner; keep all provider/email paths out of scope |
| TRANSFER / CONTRACT | Raw provenance/wire gates fail on checkout bytes | Engineering provenance gate | Restore original manifest byte provenance through an authorized follow-up; do not repin or regenerate during discovery |

Polling/retry policy: no live job submitted, no mutation replay. Controlled suites retries0; API diagnostics timeout10–15s. No performance SLO inferred. Prior macOS PID blocker remains historical user-reported; Windows identity checks do not independently establish its root cause.
