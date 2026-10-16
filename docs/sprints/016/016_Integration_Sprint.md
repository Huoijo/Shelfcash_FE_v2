# 016 — Consolidated contracts and BE/FE integration

Creation date: 16/10/2026. General context: consolidate v1/v2 without losing ground truth, integrate the safe slices of `shelfcash_FE_handoff_869eaec9`, and identify deeper integration/design work. Scope is FE code/docs, not BE deployment, credentials, email delivery, migrations or production business mutations. No commit/push is authorized.

## Source freeze and rollback boundaries

- [Contract workspace](../../../contracts/README.md) and [workflow](../../../contracts/WORKFLOW.md) are the integration entry points. Historical v1/v2 are preserved in `contracts/history/v1` and `v2`; [manifest](../../../contracts/history/PROVENANCE.json) records the original path, relocated path and byte hash for all 252 files. External repository links/callers are migrated; original historical bodies, ADRs and reported failures are unchanged.
- [016 OpenAPI](../../../contracts/016/openapi.main.json) is an exact copy of supplied main `869eaec914aa6905d6b935889afebe7d973004ae`, hash `790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`, 73 operations/66 paths. `b0db90c` remains BE-reported, not this artifact's verified SHA.
- Import/SU01/Import-completion R01 explicitly load the 016 slice. Auth/Store/Planning/Operations generators still default to the hash-pinned 011 snapshot, 54/50. This preserves reviewable rollout boundaries; it does not claim whole-app compatibility with every main response.
- Rollback must restore the corresponding generated wire, adapters and fixtures together; reverting a hash pin alone would leave mismatched runtime validation. Historical relocation is independent and verified by manifest.
- Business spec read: `SHELFCASH_IMPORT_NAM_NGUYEN.docx` (13/10). Its queue/receipt pending statements are historical; newer source/OpenAPI supersede capability status while preserving source/identity/approval/commit semantics.

## MagicPath audit and implementation decisions

Project [458079658328604672](https://www.magicpath.ai/files/458079658328604672) inspected read-only on 16/10/2026, including component source and rendered previews. OWNER `460747146686242816`, revision `461110616439017472`; STAFF `460747115572916224`, revision `461109945690124288`. Login `gentle-forest-2488` and Store workspace `gentle-dawn-6293` source also inspected.

- Existing Identity resolver supports Product/Ingredient/Supplier selection/search, loading/empty/error, scope navigation and a shared Save footer. SU01 uses that same pattern; no new supplier screen, auto-bind, inactive filtering or commercial-data panel is invented.
- Mapping dropdown and full-spec Profile review already exist. `source_only` selection and valid RULE proposal entry correct contract guards using these existing surfaces; final approval and all missing-field/CAS checks remain explicit.
- Completion Readiness already has permission, unknown, unavailable and date states. Enforce the three actual permissions and consume current R01 wire without adding a new action or assessment form.
- Generic typed Preview/detail patterns are reused for 15-schema wire acceptance, keeping source effects/cells/aggregates available. This is not pixel acceptance or full ergonomic coverage of every new domain. No guessed stock/calendar/history semantics are introduced.
- Commit reason currently has required wording in frozen Review/Commit design. Optional pure-insert/NO_OP reason needs design reconciliation in FM-003; preserve the existing bounded stricter form in this pass.
- MQ queue/staff handoff surfaces exist, but current-account notifications, exact pinned submission lifecycle, withdraw/request_changes/reason/recovery and self-service email/Store flow need more work. Record precise missing UI, not a claim that whole queue or signup form has no design.

## Delivered slices

### 016-I01 — consolidated contract workflow

**IMPLEMENTED (documentation/tooling).** Historical bodies remain byte-identical; authority distinguishes design-reviewed v1, v2 checkpoint, FE011 and newer main. `check:contracts` checks preservation, pins and inventories. References in README/docs/scripts/tests move to consolidated paths. No historical test result or old provenance string is reinterpreted as current runtime.

Overlap audit: 25 matching document paths/names, 10 byte-identical and 15 different. Both originals are retained with per-file hashes and the overlap map; differing bodies are not overwritten or concatenated into a false current contract.

### 016-I02 — Import wire and existing lifecycle compatibility

**IMPLEMENTED / VERIFIED_CONTROLLED; not live-certified.** Regenerated Import closure from main, retaining strict unknown-key/enum/schema validation. M01/M02 counters and scoped mapping revision are accepted/preserved; M02 revision is checked against coherent M01 reads. N5 accepts submission/notification metadata without inventing notification UI. Preview retains mapping/read-set/source-evidence pins, typed row effects/cells and aggregates. Changed pins across pages or Review readback invalidate confirmation; commit verifies the same read-set confirmation.

Schema unions accept all 15 supplied domains; existing generic Preview uses named domains. Unsupported weather/general formulas remain unsupported. This does not create separately persisted sales/supplier decisions or guarantee a live parser accepts every source file.

### 016-I03 — SU01 Supplier identity discovery

**IMPLEMENTED.** Existing Identity search calls `GET /stores/{store_id}/suppliers` with `q`, `limit=20`, `sort=name`, signed cursor and returned snapshot_id. IDs/name/active/version are typed; inactive entries are retained, not silently filtered. Malformed/duplicate/switched-snapshot/repeating-cursor results fail closed. No external Supplier request is made by default mock preview. Source target names with schema prefix resolve to the proper entity kind.

Cookie/current authorization remain server-owned; `supplier.read` denial is shown through the existing search error/retry pattern. A selected Supplier still needs explicit M04 binding and current server authorization; reader success is not creation or commit authority.

### 016-I04 — existing mapping/Profile guards

**IMPLEMENTED.** Available source_only descriptors can be selected/saved; unsupported/unavailable descriptors remain disabled. Source evidence is not turned into a canonical field. Owner can open full-spec review for a complete proposal with pending deterministic RULE candidates; Staff can open the current manual handoff for complete specs. Individual N5 missing-field/baseline/lifecycle/proposal/current-role guards remain. The backend still owns candidate eligibility and atomic approval. No Staff approval or automatic commit is introduced.

### 016-I05 — completion R01 current wire/permission

**IMPLEMENTED.** Import R01 reads main assessment metadata independently of the older Planning writer slice, validates Store/date/cutoff/action/default-configuration scope and preserves unknown/blocked semantics. CTA requires planning.context.read, budget.read and procurement.cost.read. Request cancellation on scope/date change and immutable completion behavior remain.

## Remaining sprint work

**018 boundary update:** the [additive main service/application-state layer](../018/018_Backend_Capabilities_Service_Boundary.md) now prepares every published operation without waiting for UI designs. D01–D05 below describe remaining product-flow/UI/legacy-consumer migration, not an absence of typed services for APIs already supplied. Their historical sprint status and controlled evidence are retained; no underconstruction screen is activated.

### 016-D01 — MQ/N5 request_changes/notifications

**FE_INTEGRATION_REQUIRED + DEEPER_WORK; specific UI gaps FM-016/FM-015.** BE already has MQ01 submit/withdraw, MQ02 scoped Store/own queue, MQ03 pinned detail/evidence, N5 request_changes/submission fences and NF01–03. Do not ask BE to implement them again. Existing manual handoff/UnderConstruction entries are not completion of this capability.

Required slice: explicit profile-level submit reason and import CAS; versioned withdrawal; eligible queue versus historical state; immutable evidence pagination; Owner self-review/current-role checks; exact lifecycle/submission fences; request_changes/resubmit; same-intent recovery; account notification deep links/read CAS. Acceptance must include stale proposal, revoked permission, duplicate submission/lost ACK, resolved notification without commit, and approval never granting Staff commit rights. Respect existing Underconstruction scopes until the concrete slice is implemented/reviewed; do not activate a placeholder writer.

### 016-D02 — self-service onboarding

**DESIGN_REQUIRED + DEEPER_WORK; FM-013/FM-014.** A02/A05/A06/A07/IN01/T03 exist in main. Login/register prototype alone does not define mailbox-proof/password setup, delivery-unavailable/resend/rate-limit/expired/consumed callbacks or zero-Store explicit creation. A05 EMAIL_VERIFY cannot be sent to the existing N7 SETUP/RESET page. Freeze verification callback and inspect email capability with BE before live mail tests; no email or account provisioning performed here.

### 016-D03 — global Auth/Store/Planning/Operations main parity

**DEEPER_WORK.** Review main 43-permission catalogue/new invitation states, Auth/Store self-service, PR01–04 requests, D01 section authorization, C01/R01 request-scope/forecast assessments, C03/C08 source references, N9 captured budget/filter metadata and EX01 retained export discovery. Update each strict closure/adapter/fixture and public scope/unknown-state handling together. Today/AI/What-if/PO remain underconstruction/outside current implementation; source presence alone does not reactivate those user flows.

### 016-D04 — full new-domain review ergonomics

**PARTIAL, DEEPER_WORK; existing FM-004/009/010/011 remain.** Current wire supports receipts/history/calendar/promotion and new effects/evidence. Need focused source examples, permission/cost-sensitive reads, correction/version confirmation and friendly immutable projections for all shapes. Do not interpret PNK/NCT, recipe basis, pack/MOQ, stock observation timezone or event meaning from filename/abbreviation. Block unsupported decisions instead of inventing confirmations or domain writes.

### 016-D05 — conditional commit reason

**DESIGN_RECONCILIATION_REQUIRED, FM-003.** BE permits missing/null reason for pure inserts/NO_OP. FE remains stricter until existing required-label design is reconciled. Future slice changes label/validation/workflow/mock/tests together; retains correction/amendment justification and independent Review/per-row reasons.

### 016-D06 — live environment and recovery proof

**LIVE_UNVERIFIED.** Obtain intended deployed SHA/OpenAPI hash and healthy import workers, dedicated Store plus Owner/Staff accounts before live browser acceptance. Supplied handoff reported health/OpenAPI/CORS only and stale worker observation. No generic negative mutation-outcome endpoint exists: test retained positive readback and operation-specific same-intent replay; never turn unchanged state into proof that a mutation was not applied. No reset/migrate/restart/real business mutation was run in this sprint.

## Verification and evidence limits

Executed 16/10/2026:

- `npm run check:contracts`: PASS, all 252 historical files byte-identical; 011 54/50 and 016 73/66 inventories/hash pins verified.
- Import wire gate PASS, 181 schemas/types; Planning gate PASS 80/80; Store gate PASS 25/25; Operations gate PASS 94 schemas. Untouched feature lanes retain their previous source hashes.
- `npm run test:import`: 133/133 PASS. After the final small mapping/UI fence adjustment, affected workflow/UI suites were rerun: 55/55 PASS.
- Auth 26/26, Store 118/118, Planning 77/77, Operations 30/30 PASS: 384 distinct unit/boundary/workflow/UI checks including Import. Broader checks were justified by relocation of shared fixture paths and independent consumer pin audit.
- Controlled browser files auth-recovery, import-experience and import-playground: 20 distinct scenarios have passing latest executions. The initial 17-case run had one Supplier fixture failure: its already-resolved mock queue was filtered to empty before being rewritten as a pending identity issue. Fixed fixture reads the unfiltered queue; targeted Supplier/Owner cases then passed 2/2. Three new permission cases (one missing R01 permission each) passed 3/3. No production code was weakened to bypass that failure.
- Browser cases cover existing Staff handoff/commit/recovery, source context, stale/blocked Preview, Sales/Supplier Review gate, isolated DEV playground, SU01 inactive entries/snapshot paging/explicit M04 binding, Owner RULE entry and all three Readiness grants. Network responses were intercepted controlled fixtures; no live BE business request or persistence claim.
- TypeScript and production build PASS through Playwright webServer setup; lint exits 0 with the same two unrelated set-state-in-effect warnings. Existing bundle-size warning remains. No dependencies were installed/changed.
- Active Markdown links/fences and 16 unique FM IDs/status counts verified; `git diff --check` PASS. Preserved historical documents may retain intentionally documented unavailable-source/provenance references.

Mock and intercepted API results are controlled verification, not live BE persistence.

Missing UI is maintained only in [FOUND_MISSING_UI.md](../../FOUND_MISSING_UI.md), the existing canonical register. No duplicate `missing UI logic.md` is created. A fallback does not close an FM gap; API integration bugs are tracked here rather than assigned new FM IDs.
