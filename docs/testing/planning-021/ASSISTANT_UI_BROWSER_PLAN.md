# PL-01 controlled browser case plan

Execution status: **PASS — CONTROLLED PRODUCTION COMPONENT** for P01–P32, plus runtime API/journal cases in [Implementation receipt](ASSISTANT_IMPLEMENTATION_RECEIPT.md). Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`. Actual production Drawer/Workspace are used; fixture render cases and real intercepted API interactions are reported separately. Existing PDF evidence is unchanged.

## Test boundary and reusable infrastructure

Use the existing locked Playwright stack once actual canonical UI is bound. Before any browser future execution: read the local playwright-cli skill, establish host/process ownership, and inspect the selected test's intercepts. Do not start the default multi-server config blindly. Reuse existing node:test/Vite conventions for the current API-state checks; no second mocking framework or dependencies.

Current preparation helpers: `tests/helpers/planning-assistant-preparation.mjs` supplies strict fetch interception, memory implementation of the existing journal interface, metadata-only assertions, cleared-protected-facts assertions, exact-replay/explicit-continuation assertions and current Summary pin assertion. These are test infrastructure, not production adapters or browser UI tests. All unexpected requests fail; the interceptor never calls the original fetch. Fixtures are browser-importable pure TS/JSON; Node assertion/transport helpers stay in the test process and must not enter production bundles.

For future browser cases, route/block **all** requests, explicitly fulfill only known fixture routes, keep service workers blocked, fail on unhandled requests, and use an isolated context/profile. No live base URL, provider, real account, credentials or business mutations. Actual authoritative C03 reread is intercepted when the integration caller exists. AS03 has no GET. AS02 never recovers/starts work. Store scoped fake journal must not be shared with real browser storage. Do not overwrite fixed legacy capture outputs; create fresh scoped screenshot/trace receipts labeled CONTROLLED_UI, actual canonical revision, fixture, role/grants and viewport.

Future screenshots must cover representative answer/clarification/stale/permission/unknown/Summary lifecycle layouts at desktop 1440px/100% and the supported narrow viewport. Until UI exists, screenshot evidence is **NOT_RUN**; API/state PASS does not close UI acceptance.

## P01 — NORMAL_FIRST_OPEN

- **State:** `NORMAL_FIRST_OPEN`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.NORMAL_FIRST_OPEN`; clone per case.
- **Expected visible semantics:** Current Run context, no fabricated prior conversation. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit ask; explicit AS01 start with selected supported presentation.
- **Forbidden action:** Send before restore; infer permissions from OWNER; expose operational commands.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P02 — NORMAL_ANSWER

- **State:** `NORMAL_ANSWER`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.NORMAL_ANSWER`; clone per case.
- **Expected visible semantics:** Returned answer remains usable for deterministic_fallback; not a Planning failure. Canonical copy/control labels are not invented here.
- **Expected action availability:** Intentional follow-up with returned context; inspect existing authorized Planning evidence.
- **Forbidden action:** Replace valid fallback with a failure; calculate recommendation or causal claims.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P03 — LOADING

- **State:** `LOADING`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.LOADING`; clone per case.
- **Expected visible semantics:** Progress for the actual operation; no invented answer. Canonical copy/control labels are not invented here.
- **Expected action availability:** Wait/close without implying cancel; authorized readers as applicable.
- **Forbidden action:** Competing write; automatic POST retries; infer that sending always means an in-flight request.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P04 — PERMISSION_DENIED

- **State:** `PERMISSION_DENIED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.PERMISSION_DENIED`; clone per case.
- **Expected visible semantics:** Protected facts hidden; recovery outcome not misrepresented. Canonical copy/control labels are not invented here.
- **Expected action availability:** External auth/Store authority revalidation; construct fresh authorized owner and restore original journal.
- **Forbidden action:** Render old facts; infer denied replay rolled back prior work; reset unknown intent.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P05 — UNAVAILABLE

- **State:** `UNAVAILABLE`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.UNAVAILABLE`; clone per case.
- **Expected visible semantics:** Request unavailable is distinct from valid fallback and Planning failure. Canonical copy/control labels are not invented here.
- **Expected action availability:** Retry permitted readers; exact replay only for original unknown intent with its body; separate storage/restore blocker.
- **Forbidden action:** Blind generic retry; treat all error phases as settled failure.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P06 — CLARIFICATION_INGREDIENT

- **State:** `CLARIFICATION_INGREDIENT`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CLARIFICATION_INGREDIENT`; clone per case.
- **Expected visible semantics:** Question and distinct returned identities; selection is a user decision, not an error retry. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit selectCandidate for an ID present in the matching ingredient array; deliberate different question after this known response.
- **Forbidden action:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P07 — CLARIFICATION_SIMILAR_INGREDIENTS

- **State:** `CLARIFICATION_SIMILAR_INGREDIENTS`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CLARIFICATION_SIMILAR_INGREDIENTS`; clone per case.
- **Expected visible semantics:** Question and distinct returned identities; selection is a user decision, not an error retry. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit selectCandidate for an ID present in the matching similar ingredients array; deliberate different question after this known response.
- **Forbidden action:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P08 — CLARIFICATION_OPTION

- **State:** `CLARIFICATION_OPTION`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CLARIFICATION_OPTION`; clone per case.
- **Expected visible semantics:** Question and distinct returned identities; selection is a user decision, not an error retry. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit selectCandidate for an ID present in the matching option array; deliberate different question after this known response.
- **Forbidden action:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P09 — CLARIFICATION_PRODUCT

- **State:** `CLARIFICATION_PRODUCT`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CLARIFICATION_PRODUCT`; clone per case.
- **Expected visible semantics:** Question and distinct returned identities; selection is a user decision, not an error retry. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit selectCandidate for an ID present in the matching Product array; deliberate different question after this known response.
- **Forbidden action:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P10 — QUERY_UNSUPPORTED

- **State:** `QUERY_UNSUPPORTED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.QUERY_UNSUPPORTED`; clone per case.
- **Expected visible semantics:** Unsupported question is a handled conversational branch. Canonical copy/control labels are not invented here.
- **Expected action availability:** Read explanation; deliberate different supported question after known receipt.
- **Forbidden action:** Auto-retry original question; display fake selectable entity; generic error toast.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P11 — CONTEXT_STALE

- **State:** `CONTEXT_STALE`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CONTEXT_STALE`; clone per case.
- **Expected visible semantics:** Old facts visibly fenced; change of evidence not presented as a provider failure. Canonical copy/control labels are not invented here.
- **Expected action availability:** External C03 reread; retain unresolved records; later construct new owner with validated current scope/version.
- **Forbidden action:** Reuse old owner via setPresentation; automatic replay; treat old receipt as current.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P12 — CONTEXT_REFRESHING

- **State:** `CONTEXT_REFRESHING`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CONTEXT_REFRESHING`; clone per case.
- **Expected visible semantics:** Refresh progress without republishing stale conversation. Canonical copy/control labels are not invented here.
- **Expected action availability:** Await the actual C03 promise; cancel local read if scope changes.
- **Forbidden action:** Invent phase=context_refreshing in PlanningAssistant; enable ask before validated current read.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P13 — CONTEXT_RESTORED

- **State:** `CONTEXT_RESTORED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CONTEXT_RESTORED`; clone per case.
- **Expected visible semantics:** Current evidence context; no fabricated old conversation. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit new ask/summary only after both intent controllers allow it.
- **Forbidden action:** Claim C03 settled a prior unknown mutation; auto-send original or new turn.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P14 — CONTEXT_RESTORED_UNRESOLVED

- **State:** `CONTEXT_RESTORED_UNRESOLVED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.CONTEXT_RESTORED_UNRESOLVED`; clone per case.
- **Expected visible semantics:** Current Planning can be read while unresolved Chat remains blocked. Canonical copy/control labels are not invented here.
- **Expected action availability:** Read authorized Planning facts; preserve blocked Chat intent.
- **Forbidden action:** Unlock a new same-scope question just because C03 refreshed.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P15 — UNCERTAIN_AFTER_RELOAD

- **State:** `UNCERTAIN_AFTER_RELOAD`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.UNCERTAIN_AFTER_RELOAD`; clone per case.
- **Expected visible semantics:** Unknown remains unknown; no artificial retry or new-question affordance. Canonical copy/control labels are not invented here.
- **Expected action availability:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden action:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P16 — UNCERTAIN_BLOCKED_CONTINUATION

- **State:** `UNCERTAIN_BLOCKED_CONTINUATION`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.UNCERTAIN_BLOCKED_CONTINUATION`; clone per case.
- **Expected visible semantics:** Unknown remains unknown; no artificial retry or new-question affordance. Canonical copy/control labels are not invented here.
- **Expected action availability:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden action:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P17 — UNCERTAIN_NEW_QUESTION_BLOCKED

Historical receipt alias: `NEW_QUESTION_AFTER_UNCERTAIN`. This is the negative blocked-new-question case; only its label changed. Prior immutable JSON evidence keeps the old spelling.

- **State:** `UNCERTAIN_NEW_QUESTION_BLOCKED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.UNCERTAIN_NEW_QUESTION_BLOCKED`; clone per case.
- **Expected visible semantics:** Unknown remains unknown; no artificial retry or new-question affordance. Canonical copy/control labels are not invented here.
- **Expected action availability:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden action:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P18 — NEW_QUESTION_AFTER_KNOWN_TERMINAL

- **State:** `NEW_QUESTION_AFTER_KNOWN_TERMINAL`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.NEW_QUESTION_AFTER_KNOWN_TERMINAL`; clone per case.
- **Expected visible semantics:** New work is distinct from recovery of the original turn. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit new ask with new key after terminal acknowledgement; UI may retain old outcome label.
- **Forbidden action:** Convert timeout/reload/denial into terminal evidence; label a new question as recovery.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P19 — SUMMARY_INITIAL

- **State:** `SUMMARY_INITIAL`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_INITIAL`; clone per case.
- **Expected visible semantics:** No Summary until a validated result exists. Canonical copy/control labels are not invented here.
- **Expected action availability:** Explicit AS01 via generateSummary after initial setPresentation.
- **Forbidden action:** Infer Summary availability means winner; send generation before restore.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P20 — SUMMARY_RUNNING

- **State:** `SUMMARY_RUNNING`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_RUNNING`; clone per case.
- **Expected visible semantics:** Retained generation in progress, distinct from UI request spinner. Canonical copy/control labels are not invented here.
- **Expected action availability:** Bounded AS02 pollSummary; explicit refreshSummary after local 60-read cap.
- **Forbidden action:** POST merely to poll; competing generation; imply GET performs recovery.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P21 — SUMMARY_COMPLETED

- **State:** `SUMMARY_COMPLETED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_COMPLETED`; clone per case.
- **Expected visible semantics:** BE wording and scope retained; fallback is usable. Canonical copy/control labels are not invented here.
- **Expected action availability:** Read output; explicit same-presentation new generation after known outcome.
- **Forbidden action:** Mark fallback as Planning failed; replace unavailable quantities with zero.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P22 — SUMMARY_FAILED

- **State:** `SUMMARY_FAILED`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_FAILED`; clone per case.
- **Expected visible semantics:** Summary failed, independently of Planning execution outcome. Canonical copy/control labels are not invented here.
- **Expected action availability:** Inspect failure; intentional new generation after known terminal outcome and current grants.
- **Forbidden action:** Treat failed as deterministic fallback or unknown delivery; resurrect same failed generation.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P23 — SUMMARY_SAFE_RECOVERY

- **State:** `SUMMARY_SAFE_RECOVERY`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_SAFE_RECOVERY`; clone per case.
- **Expected visible semantics:** Safe original-generation recovery, distinct from start-new. Canonical copy/control labels are not invented here.
- **Expected action availability:** Known generation ID -> AS02; unknown without ID -> explicit replaySummary original key/body.
- **Forbidden action:** New key/body as retry; rewrite original expected_evidence_version; paid-call loops.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P24 — SUMMARY_NEW_GENERATION

- **State:** `SUMMARY_NEW_GENERATION`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_NEW_GENERATION`; clone per case.
- **Expected visible semantics:** New generation is deliberate independent work; mode/language change after known terminal is now verified by R05 and the B01 regression tests. Canonical copy/control labels are not invented here.
- **Expected action availability:** Intentional AS01 with a new key, after known outcome.
- **Forbidden action:** Start while running/unknown; conflate replay with new generation.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P25 — SUMMARY_VI_SIMPLE

- **State:** `SUMMARY_VI_SIMPLE`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_VI_SIMPLE`; clone per case.
- **Expected visible semantics:** Presentation selection and returned metadata agree; copy comes from the returned result. Canonical copy/control labels are not invented here.
- **Expected action availability:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden action:** Infer live language/provider quality from controlled mode metadata.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P26 — SUMMARY_VI_TECHNICAL

- **State:** `SUMMARY_VI_TECHNICAL`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_VI_TECHNICAL`; clone per case.
- **Expected visible semantics:** Presentation selection and returned metadata agree; copy comes from the returned result. Canonical copy/control labels are not invented here.
- **Expected action availability:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden action:** Infer live language/provider quality from controlled mode metadata.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P27 — SUMMARY_EN_SIMPLE

- **State:** `SUMMARY_EN_SIMPLE`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_EN_SIMPLE`; clone per case.
- **Expected visible semantics:** Presentation selection and returned metadata agree; copy comes from the returned result. Canonical copy/control labels are not invented here.
- **Expected action availability:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden action:** Infer live language/provider quality from controlled mode metadata.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P28 — SUMMARY_EN_TECHNICAL

- **State:** `SUMMARY_EN_TECHNICAL`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.SUMMARY_EN_TECHNICAL`; clone per case.
- **Expected visible semantics:** Presentation selection and returned metadata agree; copy comes from the returned result. Canonical copy/control labels are not invented here.
- **Expected action availability:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden action:** Infer live language/provider quality from controlled mode metadata.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P29 — LOADING_RETAINED_ANSWER

- **State:** `LOADING_RETAINED_ANSWER`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.LOADING_RETAINED_ANSWER`; clone per case.
- **Expected visible semantics:** Prior answer and pending turn remain distinguishable. Canonical copy/control labels are not invented here.
- **Expected action availability:** Await original response; preserve scoped prior context only under current grants.
- **Forbidden action:** Present previous text as the response to the new question; silently retry.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** Only the explicitly selected AS01/AS02/AS03 operation, fulfilled by controlled fixtures; no automatic POST. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## P30 — PERMISSION_DENIED_UNCERTAIN

- **State:** `PERMISSION_DENIED_UNCERTAIN`; browser execution PASS (controlled production component; per-case receipt).
- **Fixture:** `fixtureCatalog.PERMISSION_DENIED_UNCERTAIN`; clone per case.
- **Expected visible semantics:** Permission state and unknown outcome both remain truthful. Canonical copy/control labels are not invented here.
- **Expected action availability:** Revalidate authority externally; keep unknown record fenced.
- **Forbidden action:** Treat permission denial as rollback; enable replacement; leak cached facts.
- **Permission context:** OWNER and STAFF with the three required grants; repeat with each missing grant, expired session and foreign actor/Store as applicable. Role names do not authorize access.
- **Network expectation:** No dispatch on blocked action; reads only when explicitly supported. Every HTTP request is intercepted or denied; live BE/provider calls and real mutations = 0.
- **MagicPath state reference:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; selector/function mapping in [canonical bindings](assistant-implementation/CANONICAL_STATE_MAPPING.json).

## Required cross-case assertions

- Ingredient/option/Product selection: distinct IDs despite similar names; no first-candidate dispatch; preserve `original_question`; new key only after a known response; Product goes in context, never a top-level product_id. Zero candidates do not create a retry loop.
- Unknown reload: same actor/Store/Run metadata restored, no question/history/replay_input/AS03 receipt fabricated; replay/new-question remain blocked with zero POST; no journal deletion to unlock.
- Positive new question: independently prove terminal outcome, then capture a distinct body/key; do not conflate this with metadata-only reload recovery.
- Stale: delayed old response cannot republish; C03 refresh failure/401/403/404 keeps facts fenced; successful refresh does not settle an unknown write. A new owner rechecks journals.
- Summary: running is distinct from in-flight reader; AS02 reads only the retained ID, bounded poll stops locally, explicit reader remains possible; fallback is usable, failed has null result, known-ID restore is GET, no-ID recovery is exact original POST. Compare receipt evidence to current C03 before current display (B02).
- Deliberate new generation: new key only after known terminal and explicit intent; same presentation works. Selector change after terminal is fixed and regression-tested for B01. Test all four locale/detail pairs initially and across terminal transitions.
- Current permissions: each of the three grants separately revoked; no stale UI from an old actor/Store/session, no facts through debug controls. Permission and unknown outcome can coexist.
- Native persisted journal/browser restart tests reuse the existing isolated storage approach after real UI binding. Do not claim current fixture tests verify native IndexedDB or browser rendering.

## Exit conditions

B01 is fixed and independently regression-tested; B02 has a tested current-versus-retained evidence gate. Every case needs canonical references, actual component rendering, visible-semantic/action assertions and meaningful screenshots. No PASS from a mock-only fake Assistant screen. Live acceptance remains a separately authorized task.

## P31 — SUMMARY_REQUEST_PENDING

- **State/fixture:** test-only initial Summary with actual create request pending; no retained locator.
- **Visible semantics:** “Đang gửi yêu cầu tạo tóm tắt”; no normal retained read/new generation.
- **Actions:** inspect/close only while pending.
- **Network:** fixture render issues no HTTP; runtime R05 holds actual intercepted AS01 until explicit test release.
- **Permission:** all three current grants; late-revocation cases R10 separately.
- **Canonical:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; SummaryLifecycle / summary-request-pending.
- **Result:** PASS; see browser receipt.

## P32 — SUMMARY_RECOVERED_PREVIOUS_CONTEXT

- **State/fixture:** retained Summary result under a different current verified C03 version.
- **Visible semantics:** retained previous-context warning; old answer is valid and fenced from current evidence.
- **Actions:** deliberate current-context generation only after terminal; no unknown replacement.
- **Network:** P32 is a render case; R07 exact original AS01 replay, R08 restored-ID AS02 and R09 deliberate current-version AS01 exercise actual owners.
- **Permission:** current grants and original scope/CAS guarded.
- **Canonical:** Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`; RecoveredPreviousContextSummary / summary-recovered-previous-context.
- **Result:** PASS; see browser receipt.

Current executable matrix: `node scripts/verify-planning-assistant-browser.mjs`. All HTTP is fulfilled from explicit expected replies or aborted and recorded as a failing unexpected request. Native synthetic IndexedDB is reset **only between independent test scenarios**; production exposes no clear/expire/replace action. No journal reset is used to claim an unknown outcome became terminal.
