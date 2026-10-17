# Visual Intelligence implementation manifest

Date: 2026-10-17. Starting branch main, HEAD b318e90888ba60c7c1c226e05855d1a1989f74a3. Existing Import typography work and its evidence are the starting worktree and must be preserved. No live BE/provider/mutation permission. No MagicPath write. Current canvas revisions match all eight supplied pins; read-only generated VI references are retained under design/ as inspection evidence, not copied production architecture.

## A. Executive status

`IMPLEMENTATION PARTIAL — DATA CONTRACT BLOCKED`

All current-data-supported visuals are implemented in the existing production surfaces. Unsupported quantitative semantics remain explicit; no placeholder business values or new API behavior were invented. Final controlled checks: 578 existing behavior tests, 10 adapter tests, 188 component/state renders, Assistant62/PDF12, final build/typecheck/lint and two final targeted E2E cases pass. The broad E2E run is **83 passed /13 failed**, and all13 failures reproduce at the same locator/timeout on pre-VI source. Four pre-existing contract/wire gates also fail. This is not complete repository-green or live acceptance.

## B–C. Production architecture / exact MagicPath references

The following feasibility map was established before production edits; all eight exact pins were read from the current canvas. Legacy Input `458395069779681280` was not used. No separate VI-language component exists, and none was invented.

No chart library exists or is required. Reuse React, CSS/SVG, existing formatters and existing isolated Vite/Playwright/browser tests. Build only shared proportion/state/legend primitives. Components take presentation inputs; domain adapters sit beside their feature. Existing queries, Store scoping, permission fences and recovery owners remain unchanged.

| Surface / route / owner | MagicPath component @ revision | Visual → current truth → adapter / placement | Classification |
|---|---|---|---|
| PlanningSetup /forecast/planning; PlanningPage state, RequirementsControls | 458414835571515392 @ 461982069816451072 | Context/date/request-key-matched R01, C01 budget and requirement selection → setup adapter → after heading, budget section | REQUIRES_FE_ADAPTER |
| PlanningResults /forecast/planning?plan_id; Planning workflow C03–C06 retained run | 458423352311304192 @ 461982090993475584 | Retained option total / run budget, strategy costs → exact ratio/delta → cost KPI, strategy view | REQUIRES_FE_ADAPTER |
| Selected Planning ingredient; existing ingredient reader | same Results pin | daily_balances requested/ending/incoming_quantity by path/day/unit → retained daily adapter → existing ingredient detail, preserve exact table | REQUIRES_FE_ADAPTER; current data supports trajectory |
| Today /today; D01 sections | 458632053018234880 @ 461976284474511360 | D01 provides attention/readiness/latest run only; no daily pulse → accepted unavailable/error/loading treatment in existing outlook | DATA_CONTRACT_REQUIRED |
| Inventory /inventory; V01–V04 snapshot owner InventoryDetail | 458590758262427648 @ 461976306079399936 | Same-snapshot lots with use_first/status and expiry dates → composition/expiry adapter in selected detail; ordered movement deltas in existing movement tab | REQUIRES_FE_ADAPTER |
| Input OWNER /imports; ImportFlow/workflow | 460747146686242816 @ 461975629559140352 | Pinned Preview summary groups, separate warning count → write composition before consequential review; existing R01 readiness action/check issues → semantic segments | REQUIRES_FE_ADAPTER |
| Input STAFF /imports; same scoped workflow, role authority separate | 460747115572916224 @ 461976479094435840 | Same presentational primitives; existing role-specific permission/approval/commit rules untouched | REQUIRES_FE_ADAPTER |
| Import History /imports/history; H01/H02 current readers | 458255053002780672 @ 461979574209744896 | H01 monthly activity total/date counts available, H02 statuses scoped to selected-day page only → month summary uses true total and unavailable state breakdown, retain exact records | IMPLEMENTABLE_WITH_CURRENT_DATA (total); DATA_CONTRACT_REQUIRED (monthly status split) |
| Menu /menu; CAT list/detail version owner MenuDetail | 458614109248847872 @ 461979355791388672 | Current recipe lines grouped by exact explicit unit, unknown quantities never zero → recipe dependency adapter after existing table | REQUIRES_FE_ADAPTER |

## E. DATA CONTRACT REQUIRED

| Surface / visual | Required semantic data and reason | Source checked | Safe presentation |
|---|---|---|---|
| Planning coverage × lead | Explicit retained coverage duration and supplier lead duration; arrival date is not lead time | PlanningIngredient/C05 detail, purchase and captured-stock types | Partial facts with unavailable coverage/lead; do not derive them |
| Planning confidence / threshold | True quantile bounds / reorder or risk threshold | Planning wire IngredientDay has LOW/BASE/HIGH scenarios, not quantiles/threshold | No bands or fabricated threshold |
| Planning trajectory | Current retained requested/ending/incoming series **does exist**; partial/null and per-path gaps still matter | PlanningIngredient.daily_balances | Plot known points only, never bridge missing dates or combine paths; no old raster |
| Today pulse | Dated demand/coverage pressure, shortage and inbound markers | D01 TodaySections has no pulse/time series | Accepted unavailable treatment; no illustrative fixture series in production |
| Inventory coverage | Expected-demand / coverage contract | V02 IngredientStock includes quantity threshold, no demand denominator | DATA CONTRACT REQUIRED; existing threshold assessment unchanged |
| Inventory historical balance | Actual balance time series | V04 contains ordered quantity_delta records only | Movement deltas only, never historical stock balance |
| Menu cost / margin / stock risk | Ingredient costs, authoritative inventory/risk links | CAT MenuProduct/MenuRecipe/RecipeIngredient | Accepted two contract-required cards; no inference from selling price |
| History monthly success/warning/failure | Whole-month status totals (or complete monthly records) | H01 counts only, H02 selected date with pagination | Unavailable monthly split, never aggregate current day into a month |
| Input positive readiness by source | Explicit per-source assessment for the planning action/date | R01 has action readiness and sourced issues, not four positive domain assessments | Sourced issues become attention; no issue remains unknown, never complete |
| Input mapping counters | Complete reconciled batch by-status counts | Optional M01 counters; filtered/paginated queue is insufficient | Use batch counters only when complete; otherwise unavailable. This is an optional-data state, not an invented endpoint requirement |

## State → application mapping

| Design state | Current owner / trigger | Data and missing/permission behavior | Actions / presentation |
|---|---|---|---|
| Setup current | React cutoff/budget/selection and context | R01 accepted only on exact request/date; loading/error/permission distinct | Existing form actions; context/relationship rail is read-only |
| Result current/historical/partial | Retained run and selected option/ingredient | Never mix with live Store values; absent cost/budget stays unavailable | Existing selection/navigation; exact-value labels plus read-only rails |
| Ingredient daily series | Existing C04 selection | Per-path/day/unit points; null series unavailable, missing dates gaps, partial evidence labeled | Keyboard accessible series selection/point values; existing table preserved |
| Today loading/error/forbidden | Existing D01 query and section availability | Never claim no pulse means zero demand or safe inventory | Existing retry/deep links only |
| Inventory selected/partial/failed | Existing sameSnapshot reader and pagination | Loaded lot subset explicitly partial; unit mismatches not compared; denial/error hides old data | Existing tabs/pagination; read-only detail intelligence |
| Input readiness | Existing assessment key includes Store/date/auth version | Do not equate workflow stages or I06 receipt with R01 planning readiness | Existing assess/retry/navigation; segment glyph/text states |
| Input Preview | Existing pinned group summary, including unloaded rows | Counts from full summary only; blocked and warnings separate; no quality score | Existing Review/Commit unchanged; density normalization documented |
| History filtered/empty/unknown | Existing successful H01/H02 snapshot pair | Preserve null/zero and selected day; no month status inference | Existing date links and exact records |
| Recipe default/empty/partial | Existing successfully reconciled MenuDetail | Only same explicit unit group denominator; no unit conversion, no inferred cost/risk | Read-only dependency rows and exact quantity labels |

## Checkpoints / verification

| Checkpoint | Implemented / controlled verification | Evidence |
|---|---|---|
| A Foundation + Planning | Shared states/proportions/exact arithmetic; setup context and budget relationship, retained cost share/delta, scenario-separated daily trajectory. Build PASS, Planning 178/178, initial adapter 4/4, production render 30/30; inspected desktop/narrow. No chart library, no confidence band | pass-a-build.txt, pass-a-planning.txt, planning-02/ and latest planning-05/ |
| B Today | Existing outlook hosts loading/error/permission/contract state. No synthetic pulse. Build PASS, capabilities 83/83, initially 6/6; expanded final 10/10 including held loading request | pass-b-build.txt, pass-b-capabilities.txt, today-05/capture.json |
| C Inventory | Selected-detail lot composition, expiry relationship, explicit movement deltas. Backend use_first/status/snapshot and pagination retained. Build PASS, Store 118/118; initially 12/12, final 18/18 including loading/503/403 | pass-c-build.txt, pass-c-store.txt, inventory-04/capture.json |
| D Input OWNER/STAFF + History | Batch mapping composition, full Preview write composition, action/date readiness segments, compact actual monthly activity and missing status split. Build PASS after normalized PreviewSummary typing correction; Import 143/143; 24 extra component cases plus 88 existing role/state captures | pass-d-build-02.txt, pass-d-import.txt, input-05/, input-history-final/capture.json |
| E Menu | Exact unit-group dependency rows in the existing reconciled detail. No cost/margin/risk inference. Build PASS, Store 118/118, adapters 10/10. Initially 14/14, final 16/16 including denial | pass-e-build.txt, pass-e-store.txt, final-adapters.txt, menu-05/capture.json |
| F Convergence | 578 existing behavior tests PASS; 10 adapter tests PASS; Assistant62/PDF12 PASS. Final build/typecheck/lint PASS. Broad E2E83/96; all13 failures reproduce on pre-VI sources. Final catalog/production parity2/2 PASS. Final state/point-marker refinements additionally verified with fresh Planning32/Today10/Input-History24 renders and Planning178 | final-regression/results.json, final-build-02.txt, final-typecheck-02.txt, final-lint-02.txt, final-planning-02.txt, e2e-baseline-comparison.json, e2e-final-targeted/results.json |

The first D build found a normalized-vs-wire PreviewSummary typing mismatch and failed; fixed by accepting only the feature-owned fields consumed by the presentation. The first Today fixture had a mismatched Store ID and correctly failed the D01 resource fence; corrected the fixture, not the fence. Menu duplicate-ingredient / zero-quantity HTTP fixtures are rejected by the existing P02 validator; final browser cases assert the error and absence of stale visuals. Duplicate line identity and zero denominators are additionally tested directly at the adapter boundary, without weakening P02 validation. Initial E2E found repeated exact “Chưa đánh giá” copy from the new pending source segments; changed the segment copy to “Chờ đánh giá”, leaving the existing global status unique and all business behavior untouched. OWNER end-to-end completion passed after the correction.

## D. Per-surface production implementation

Shared `VisualIntelligence` supplies state cards, proportional rails/legends, budget/share rails and readiness segments. `visualMath` handles exact decimal fractions, BigInt sums/ratios and exact retained-cost differences, solely for presentation geometry. Zero denominators and missing facts return null. Exact values remain visible through the existing feature formatters. Feature adapters import only types and shared arithmetic; shared components never fetch or interpret domain state.

| Surface | Production component / files (relative to src) | Features / states / fidelity |
|---|---|---|
| Planning Setup | features/decision-planning/components/PlanningSetup.tsx; PlanningVisualIntelligence.tsx/.css; ../planning.visual.ts | Context facts after heading, relationship appended to existing budget section. Live request/readiness key reused. Default/custom/saved, invalid request, zero, no ceiling, denied budget, pending/error/blocked supported. Saved budget stays unknown because only saved ID is owned by request |
| Planning Results | features/decision-planning/components/PlanningResults.tsx; PlanningEvidence.tsx; shared Planning VI files | Retained cost share inside cost KPI; selected strategy delta against balanced retained cost; selected-ingredient daily requested/ending/incoming per LOW/BASE/HIGH. Current/historical/no-winner/failed partial/absent/gapped series preserved. Daily exact table remains. Partial coverage/lead has no fake distance |
| Today | pages/today/TodayPage.tsx | Existing 7-day outlook hosts accepted unavailable state; loading, read failure, forbidden inventory distinguished. Attention/task navigation and D01 semantics unchanged |
| Inventory | features/inventory/components/InventoryDetail.tsx; InventoryVisualIntelligence.tsx/.css; ../inventory.visual.ts | Table remains first. Selected detail owns intelligence. Composition denominator is same-unit loaded lots; pagination is labeled partial. Exact lot codes/quantities, backend priority and expiry text support color. Expiry uses snapshot as_of_date and real received/expiry dates; unknown dates remain explicit. Movement tab shows chronological signed deltas, never cumulative stock |
| Input OWNER | features/import-data/components/ImportResolveOverview.tsx; ImportReadiness.tsx; ImportPreview.tsx; ImportVisualIntelligence.tsx; ../import.visual.ts | Uses canonical OWNER surface, existing approval/commit/readiness guards. Batch mapping by-status only; no fake confidence. Full-preview actions rail, warnings separate. Per-domain totals and expanded action details retained |
| Input STAFF | Same production presentational entry points; existing role owner remains ImportFlow | STAFF permissions and reusable-profile approval boundaries remain separate. Presentation reuse does not grant commit or approve powers. Controlled role matrix preserved |
| Import History | features/import-history/components/ImportCalendar.tsx; pages/import-history/ImportHistoryPage.tsx | Actual matched monthly count, selected-date emphasis and count-labeled date activity retained. Loading/zero/null distinguished. Whole-month status totals remain unavailable; exact selected-day records/navigation unchanged |
| Menu | features/menu/components/MenuDetail.tsx; MenuVisualIntelligence.tsx/.css; ../menu.visual.ts | Table/list remains first. Read-only recipe dependency beneath exact recipe table. Each explicit unit has its own denominator; single-line groups use direct quantity. Empty/no recipe/error/forbidden states preserve parent owner. Two accepted contract cards retain missing cost/risk meaning |

### MAGICPATH DENSITY NORMALIZATION

Preview/Review uses one primary global action rail. The existing domain cards retain domain row totals, which explain scope; action details remain accessible in a native disclosure instead of repeating the global action totals visibly. Warning notice count is separately labeled and never becomes another segment or a quality score. Unreconciled action-vs-row counts keep exact values and omit proportions. This preserves product information and all review/commit gates.

## F. Runtime behavior preserved

No API URL/DTO/validator/workflow/recovery/authorization/Store provider, route, mutation, journal, Assistant or PDF implementation was edited. Additions consume props from existing successful readers. Inventory and Menu retain same-snapshot/version/date guards, late-response aborts, pagination and retry owners. Input decisions retain all pins, reason/acknowledgment rules, Owner/Staff separation and uncertain-outcome locks. Tests and fixtures do not enter production routes. No backend, provider, external account, upload, or business write was used; reported browser writes are intercepted synthetic requests only.

## H. Visual evidence / accessibility / responsive

Every new rail has a visible exact-value legend/caption and an accessible name. Meaning does not depend on color or hover. Native path buttons and daily-value disclosures are keyboard accessible. Daily chart and ordered movement rows scroll locally; page width is checked at 1440 and 390. Detail inspectors keep their existing focus/close/tab behavior. Shared labels are at least 11px, body/control values 12px; typography normalization from the earlier user task is preserved. Captures block remote fonts, so local Inter or system fallback is used; no claim of exact remote-font raster equivalence.

Representative actual production-component screenshots:

- Desktop: [Planning Setup](planning-05/setup-default-1440.png).
- Narrow + exact-value keyboard disclosure: [Planning ingredient](planning-05/ingredient-default-390-keyboard.png).
- Partial retained data: [isolated daily point](planning-05/ingredient-isolated-390.png), [partial loaded lots](inventory-04/inventory-partial-390-detail.png).
- Selected/detail context: [movement deltas](inventory-04/inventory-movements-1440-detail.png), [unit-grouped Menu](menu-05/menu-mixed-390-detail.png).
- Contract unavailable: [Today pulse](today-05/today-default-1440.png).
- Permission-limited: [whole-reader403 Today](today-05/today-denial-390.png), [Input readiness](input-05/readiness-permission-390.png).
- Load failure: [History error](input-05/history-error-390.png), distinguished from loading/permission.
- Role-specific consequential review: [OWNER Review](input-history-final/owner-review-awaiting-1440.png), [STAFF uncertain commit](input-history-final/staff-commit-uncertain-390.png).

## G. Exact commands / current verification

Commands run from repository root in PowerShell. Browser runs set `SHELFCASH_CHROMIUM_PATH` to the existing installed Chromium headless shell (151.0.7922.34); no package/browser installation or second browser stack was added.

| Command | Actual result / evidence |
|---|---|
| node scripts/verify-visual-intelligence.mjs | 578/578 tests: Planning178, capabilities83, operations30, Import143, Store118, auth26. Build/lint PASS. Planning/Import/Store wire checks PASS. Four existing ordinary gates FAIL; see below |
| node tests/run-visual-intelligence.mjs | 10/10 PASS; final-adapters.txt |
| npm run build (explicit VITE_DATA_SOURCE=api, API URL 127.0.0.1:18001) | PASS; final-build-02.txt; existing bundle size warning. Final standalone tsc -b also PASS |
| node scripts/verify-planning-assistant-browser.mjs docs/testing/visual-intelligence-20261017/assistant-01 | 62/62 PASS; 23 screenshots; 44 intercepted synthetic writes; unexpected [] |
| node scripts/verify-planning-021-browser.mjs docs/testing/visual-intelligence-20261017/export-01 | 12/12 PASS; 2 intercepted POSTs and 3 intercepted downloads; unhandled [] |
| node scripts/capture-visual-intelligence.mjs planning 05 | 32/32 PASS; actual production Planning components, isolated demand/ending points and keyboard path/disclosure checks |
| node scripts/capture-visual-intelligence.mjs today 05 | 10/10 PASS; includes held loading/503/section-forbidden/whole-reader403/unknown |
| node scripts/capture-visual-intelligence.mjs inventory 04 | 18/18 PASS; default/partial/empty/expired/unknown/movements/loading/503/403; selected-detail scroll captures |
| node scripts/capture-visual-intelligence.mjs input 05 | 24/24 PASS; History error/permission plus OWNER/STAFF batch counters, missing counters, readiness warning/permission/unknown, History loading/empty/null/default |
| node scripts/capture-visual-intelligence.mjs menu 05 | 16/16 PASS; exact unit groups, direct quantity, empty/no recipe, invalid duplicate/zero contract responses and denial; selected-detail scroll captures |
| node scripts/capture-import-typography.mjs docs/testing/visual-intelligence-20261017/input-history-final | 88/88 role/state renders; page errors [], unexpected network [], document overflow [], undersized0, controls below floor0, clipped0 |
| node node_modules/@playwright/test/cli.js test --config scripts/playwright-visual-intelligence.config.ts (run e2e-current-04) | All96 existing tests executed: 83 PASS /13 FAIL /0 skipped; raw results preserved. No blanket PASS |
| SHELFCASH_VI_BASELINE=1; same CLI with --last-failed --last-failed-file docs/testing/visual-intelligence-20261017/e2e-baseline-failed/selection.json | All13 failing cases reproduce on exact pre-VI tracked component source with prior user typography preserved; same locator/timeout. No worktree rollback/reset. Source loader: scripts/vite-visual-intelligence.config.ts |
| node scripts/verify-visual-intelligence.mjs --compare-e2e | 13/13 baseline failures reproduced; full raw errors retained in e2e-baseline-comparison.json; concise locations in e2e-error-signatures.json |
| SHELFCASH_VI_BASELINE=0; same CLI with --grep '014 every catalog scenario\|013 production build' --timeout=180000 (run e2e-final-targeted) | 2/2 PASS in52.4s. Longer bounded budget for the catalog; assertions unchanged. Latest production build verified |

Four ordinary gate failures (`check:contracts`, `check:capabilities-wire`, `check:recovery-policy`, `check:operations-wire`) were already present in the starting checkout and match the prior typography regression. Historical contract file hashes/packaging and CRLF-vs-generated-LF files do not match the pinned-byte checks. Evidence remains in final-regression/; no contract was regenerated, repinned, edited or bypassed. Lint has the same two existing React effect warnings. This is not a claim that the entire repository baseline is green.

Broad E2E baseline debt is grouped as: catalog60s timeout1; legacy parked-AI expectation1; PDF readiness/recovery fixtures6; Preview/Review cases4; Decline lost-pending1. These are reproduced baseline failures, not newly resolved product defects. Raw current/baseline suites and all errors remain available for separate maintenance. The Sales/Supplier baseline also exceeded the outer60s budget while failing the same missing-button locator; this extra timing wrapper is retained in the raw comparison.

Exact PowerShell source-comparison and final targeted invocation (after setting the existing browser path):

```powershell
$env:SHELFCASH_VI_BASELINE='1'
$env:SHELFCASH_VI_E2E_RUN='e2e-baseline-failed'
node node_modules/@playwright/test/cli.js test --config scripts/playwright-visual-intelligence.config.ts --last-failed --last-failed-file docs/testing/visual-intelligence-20261017/e2e-baseline-failed/selection.json
node scripts/verify-visual-intelligence.mjs --compare-e2e
$env:SHELFCASH_VI_BASELINE='0'
$env:SHELFCASH_VI_E2E_RUN='e2e-final-targeted'
node node_modules/@playwright/test/cli.js test --config scripts/playwright-visual-intelligence.config.ts --grep '014 every catalog scenario|013 production build' --timeout=180000
```

Final read-only error-state and isolated-point refinements followed the broad96 run. They received fresh32 Planning /10 Today /24 Input-History component cases, Planning178, adapters10, final typecheck/build/lint and current production parity. The broad96 suite was not repeated after those render-only refinements. Earlier startup/proxy attempts and the corrected pending-copy ambiguity are retained in task evidence and are not counted as final passes. Remote traffic is blocked; all API/production E2E tests use the existing complete18001 interceptor, and mock projects have no API source. No backend process or real account was used.

## I. MagicPath ↔ FE drift classification

| Class | Current difference / disposition |
|---|---|
| DATA_REQUIRED_DIFFERENCE | Coverage/lead, confidence bounds/threshold, Today pulse, Inventory demand denominator, Menu cost/risk, monthly History status split and positive per-source R01 readiness remain unsupported. Safe accepted unavailable/partial states are implemented; semantic gaps remain open |
| RUNTIME_REQUIRED_DIFFERENCE | Real retained dates/quantities/units and backend priority replace prototype fixtures. Pagination is explicitly partial. LOW/BASE/HIGH are scenarios, not quantiles. Existing strict P02 rejects invalid duplicate/zero ingredient payloads |
| TYPOGRAPHY_DRIFT | Intentionally applies repository typography floors to prototype labels below 11px/body below12px; retained prior Import normalization. This creates taller readable cards than tiny prototype labels |
| SPACING_DRIFT / GEOMETRY_DRIFT | Resulting text wrapping and card height differ at narrow widths; shared padding/compact border hierarchy and table-first inspector placement are preserved. Existing shell/table geometry was not redesigned. Captures are component-level, not a pixel-perfect full-product attestation |
| COMPONENT_DRIFT | No new chart library/framework or copied prototype state architecture. Native exact-value disclosures and Preview group disclosures reuse existing disclosure patterns; intentional density normalization above |
| COLOR_DRIFT | Neutral quantities/shares remain grayscale. Green is limited to backend priority/inbound/confirmed semantics; amber/red only actual attention/expired/blocked. No decorative gradients or synthetic safe/risk colors |
| STATE_DRIFT | No unavailable facts are shown as fixture values. All implemented state families are recorded above; live backend/state coverage is NOT_RUN, and missing semantics are not marked resolved |

## J. Production files

Changed existing production files:

- src/features/decision-planning/components/PlanningSetup.tsx
- src/features/decision-planning/components/PlanningResults.tsx
- src/features/decision-planning/components/PlanningEvidence.tsx
- src/features/inventory/components/InventoryDetail.tsx
- src/pages/today/TodayPage.tsx
- src/features/import-data/components/ImportResolveOverview.tsx
- src/features/import-data/components/ImportPreview.tsx
- src/features/import-data/components/ImportReadiness.tsx
- src/features/import-history/components/ImportCalendar.tsx
- src/pages/import-history/ImportHistoryPage.tsx
- src/features/menu/components/MenuDetail.tsx

New production files:

- src/shared/visual-intelligence/VisualIntelligence.tsx
- src/shared/visual-intelligence/VisualIntelligence.css
- src/shared/visual-intelligence/visualMath.ts
- src/features/decision-planning/planning.visual.ts
- src/features/decision-planning/components/PlanningVisualIntelligence.tsx
- src/features/decision-planning/components/PlanningVisualIntelligence.css
- src/features/inventory/inventory.visual.ts
- src/features/inventory/components/InventoryVisualIntelligence.tsx
- src/features/inventory/components/InventoryVisualIntelligence.css
- src/features/import-data/import.visual.ts
- src/features/import-data/components/ImportVisualIntelligence.tsx
- src/features/menu/menu.visual.ts
- src/features/menu/components/MenuVisualIntelligence.tsx
- src/features/menu/components/MenuVisualIntelligence.css

Test-only changes: new VI fixture/capture/regression runner, adapter tests and Windows-safe existing Assistant/PDF runner path/browser options; existing Playwright test projects reused by a task-local startup config. Documentation: this consolidated manifest, raw design inspection and controlled evidence, current register VI-01. The prior Import typography files/scripts/evidence are preserved as starting changes. Historical docs/FOUND_MISSING_UI.md is not edited. No commit or push.

## K. Git

Branch main, starting HEAD unchanged: b318e90888ba60c7c1c226e05855d1a1989f74a3. Working tree is dirty with25 VI production files (11 existing +14 new), task tools/docs/evidence and the preserved prior typography changes. No commit, push, staging, reset or user-change rollback. Protected service/auth/Store/operations/recovery/contract/dependency trees have no diff; historical register remains unchanged. See boundary-audit.json for final source/working-tree checks.

## Final audit questions (1–15)

1. APIs/contracts preserved: **YES**; no production service/DTO/validation/contract files changed.
2. Store scope unchanged: **YES**; readers/providers and identity/snapshot fences unchanged.
3. Permissions unchanged: **YES**; presentation consumes existing permission/reader state; no new writer or grant.
4. Planning recovery unchanged: **YES**; workflow/journal/intent code unchanged, controlled recovery suites exercised.
5. Planning Assistant unchanged: **YES**; production Assistant files unchanged; 62 current controlled browser cases pass.
6. Fake business values introduced: **NO**; all plotted values come from retained/runtime props. Test fixture values stay in scripts/tests.
7. MagicPath fixture values copied into production: **NO**; inspection references are evidence, not production data.
8. Missing fields coerced to zero: **NO**; missing/zero denominator, missing date/unit and saved-ID budget semantics remain distinct. Known zero is preserved.
9. Shared visual primitives consistent: **YES**; common state/proportion/budget/legend/readiness grammar, feature-specific adapters only.
10. Visuals clarify complexity: **YES**, within the accepted scope; one Preview action relationship plus domain scope/disclosed detail; selected detail owns quantitative context. Existing exact tables/records remain accessible.
11. DATA CONTRACT REQUIRED explicit: **YES**; consolidated table above and VI-01 remain open. Safe fallback does not close semantic gaps.
12. Responsive verified: **CONTROLLED** at 1440 and390, including local chart scrolling, not live acceptance.
13. Permission-limited verified: **CONTROLLED** new VI states, OWNER/STAFF capture matrix and current behavior/browser suites; live permission acceptance NOT_RUN.
14. Actual production components in screenshots: **YES**; client-mounted production imports, not prototype screenshots or reimplemented mock UI. Controlled fixtures are explicitly labeled.
15. Complete current regression baseline green: **NO**; 578 existing behavior and10 adapter tests, Assistant62/PDF12, final build/lint and targeted2/2 pass. Broad E2E83/96; all13 failures reproduce on pre-VI source. Four pre-existing ordinary gates fail. Initial failures/timeouts, exact source comparison and final focused checks are reported above; no live acceptance is claimed.

