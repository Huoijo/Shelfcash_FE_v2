import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPlanningDataSource, samePlanningRequest } from '../src/features/decision-planning/planning.data'
import { createMockPlanningDataSource, PLANNING_FIXTURE_IDS as ids, planningContextFixture, planningRunFixture,
  planningNoWinnerFixture, planningFailedPartialFixture, planningIngredientsFixture, planningIngredientFixture,
  planningReasonsFixture, planningReadinessFixture } from '../src/features/decision-planning/planning.fixtures'
import { comparePlanningDecimal, isPlanningMoney, isPlanningPercent, isPlanningDate, shiftPlanningDate,
  validatePlanningRequest, validatePlanningContext, validatePlanningAccepted, validatePlanningRun,
  validatePlanningIngredients, validatePlanningIngredient, validatePlanningReasons, validatePlanningReadiness } from '../src/features/decision-planning/planning.validation'
import { matchesPlanningWire } from '../src/features/decision-planning/planning.wire'
import { configureHttpSession, CsrfTokenUnavailableError, HttpError } from '../src/shared/http/httpClient'

const KEY = 'd0900000-0000-4000-8000-000000000099'
const WRONG = 'd0900000-0000-4000-8000-000000000098'
const request = () => ({ requirements_mode: 'default', forecast_start_date: '2026-10-11', default_requirements_version: 'synthetic-default/1' })
const custom = (budget = '0') => ({ requirements_mode: 'custom', forecast_start_date: '2026-10-11',
  requirements: { budget_limit: budget, paths: [{ path: 'BASE', min_fill_rate_percent: '95', product_overrides: [] }] } })
const context = () => ({ data: planningContextFixture(), meta: { request_id: 'qa-c01' }, error: null })
const readiness = () => ({ data: planningReadinessFixture(), meta: { request_id: 'qa-r01' }, error: null })
const run = (data = planningRunFixture()) => ({ data, meta: { warnings: [], poll_after_ms: ['queued', 'running'].includes(data.status) ? 2000 : 0 }, error: null })
const accepted = (status = 'queued') => ({ data: { run_id: ids.run, status, accepted_at: '2026-10-11T01:00:00Z' },
  meta: { warnings: [], poll_after_ms: ['queued', 'running'].includes(status) ? 2000 : 0 }, error: null })
const navigator = () => ({ data: planningIngredientsFixture(), meta: { request_id: 'qa-c04', run_id: ids.run,
  result_digest: ids.digest, response_version: 'inspection-version', pagination: { limit: 50, total_count: 1, next_cursor: null } }, error: null })
const detail = () => ({ data: planningIngredientFixture(), meta: { request_id: 'qa-c05', run_id: ids.run,
  result_digest: ids.digest, response_version: 'inspection-version' }, error: null })
const reasons = () => ({ data: planningReasonsFixture(), meta: { request_id: 'qa-c08' }, error: null })
const source = () => createPlanningDataSource({ dataSource: 'api', apiBaseUrl: 'https://qa.invalid' })
const respond = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
function fetchWith(t, callback) { const original = globalThis.fetch; globalThis.fetch = callback; t.after(() => { globalThis.fetch = original }) }
function session(t, onUnauthenticated = () => {}) { t.after(configureHttpSession({ getCsrfToken: () => 'synthetic-session-csrf', onUnauthenticated })) }

test('C01/R01/C02/C03/C04/C05/C08 synthetic fixtures conform to frozen current OpenAPI closure', () => {
  for (const [name, value] of [['Envelope_Context_', context()], ['Envelope_Readiness_', readiness()],
    ['PlanningRequest-Input', request()], ['PlanningEnvelope_Accepted_', accepted()], ['PlanningEnvelope_RunView_', run()],
    ['InspectionEnvelope_IngredientNavigator_', navigator()], ['InspectionEnvelope_IngredientDetail_', detail()], ['ExplanationEnvelope', reasons()]]) {
    assert.equal(matchesPlanningWire(name, value), true, name)
  }
})

test('default/custom/saved requests preserve zero, null and explicit override-list presence', () => {
  for (const value of [request(), custom('0'), custom(null), { requirements_mode: 'saved', forecast_start_date: '2026-10-11', saved_requirement_id: ids.saved }])
    assert.deepEqual(validatePlanningRequest(value), value)
  const omitted = custom(); delete omitted.requirements.budget_limit
  assert.equal(Object.hasOwn(validatePlanningRequest(omitted).requirements, 'budget_limit'), false)
  assert.deepEqual(validatePlanningRequest(custom()).requirements.paths[0].product_overrides, [])
})

test('unsupported strategy/forecast/engine/open-PO/scenario fields fail rather than being silently dropped', () => {
  for (const [field, value] of Object.entries({ strategy: 'lean', forecast_run_id: ids.forecast, engine_mode: 'stochastic',
    include_open_purchase_orders: true, scenario_count: 30, horizon_days: 7, as_of_date: '2026-10-10', currency: 'VND' }))
    assert.throws(() => validatePlanningRequest({ ...request(), [field]: value }), field)
})

test('mode-specific request rules reject missing version, mixed modes, null lists and duplicate paths/Product overrides', () => {
  const inherited = custom(); delete inherited.requirements.paths[0].min_fill_rate_percent
  assert.throws(() => validatePlanningRequest(inherited))
  inherited.default_requirements_version = 'synthetic-default/1'
  assert.deepEqual(validatePlanningRequest(inherited), inherited)
  const duplicates = custom(); duplicates.requirements.paths.push(structuredClone(duplicates.requirements.paths[0]))
  const products = custom(); products.requirements.paths[0].product_overrides = [
    { product_id: ids.product, min_fill_rate_percent: '95' }, { product_id: ids.product, min_fill_rate_percent: '95' },
  ]
  for (const value of [{ ...request(), default_requirements_version: undefined }, { ...request(), requirements: null },
    { ...request(), saved_requirement_id: ids.saved }, { ...custom(), requirements: null }, duplicates, products,
    { ...custom(), requirements: { paths: [{ path: 'BASE', min_fill_rate_percent: null, product_overrides: [] }] } },
    { ...custom(), requirements: { paths: [{ path: 'BASE', min_fill_rate_percent: '95', product_overrides: null }] } }])
    assert.throws(() => validatePlanningRequest(value))
})

test('money and percent limits remain exact decimal text beyond JavaScript safe integers', () => {
  assert.equal(isPlanningMoney('999999999999999999.123456789012345678'), true)
  assert.equal(comparePlanningDecimal('999999999999999999.1', '999999999999999999.09'), 1)
  assert.equal(comparePlanningDecimal('95.000', '95'), 0)
  for (const value of [0, ' 0', '-1', '+1', '01', '1e3', '1,000', '1000000000000000000', '0.1234567890123456789']) assert.equal(isPlanningMoney(value), false)
  for (const value of ['0', '100', '99.' + '9'.repeat(32)]) assert.equal(isPlanningPercent(value), true)
  for (const value of [0, '100.00000000000000000000000000000001', '0.' + '1'.repeat(33), '-0', '1e2']) assert.equal(isPlanningPercent(value), false)
  assert.throws(() => validatePlanningRequest(custom(50000000)))
})

test('business calendar dates never shift through browser timezone and enforce complete horizon bounds', () => {
  assert.equal(isPlanningDate('2024-02-29'), true)
  for (const value of ['2026-02-29', '2026-10-11T00:00:00Z', '0000-01-01', '2026-13-01']) assert.equal(isPlanningDate(value), false)
  assert.equal(shiftPlanningDate('2026-10-11', -1), '2026-10-10')
  assert.equal(shiftPlanningDate('2026-12-29', 6), '2027-01-04')
  for (const date of ['0001-01-01', '9999-12-26', '2026-02-29']) assert.throws(() => validatePlanningRequest({ ...request(), forecast_start_date: date }))
})

test('idempotent request comparison normalizes numeric spelling/object order only, preserving presence and array order', () => {
  assert.equal(samePlanningRequest(custom('0'), custom('0.000')), true)
  const omitted = custom(); delete omitted.requirements.budget_limit
  assert.equal(samePlanningRequest(omitted, custom(null)), false)
  const a = custom(); a.requirements.paths.push({ path: 'HIGH', min_fill_rate_percent: '90', product_overrides: [] })
  const b = structuredClone(a); b.requirements.paths.reverse()
  assert.equal(samePlanningRequest(a, b), false)
})

test('C01 allows nullable unavailable config/saved collections without fabricated budget or readiness', () => {
  const value = context(); Object.assign(value.data, { budget_ceiling: null, default_requirements: null, default_requirements_version: null,
    default_requirements_updated_at: null, saved_requirements: null, latest_business_date: null })
  Object.assign(value.data.readiness, { status: 'unknown', can_generate: false, scope_estimate: null, history_watermark: null })
  const result = validatePlanningContext(value, ids.store)
  assert.equal(result.data.budget_ceiling, null); assert.equal(result.data.saved_requirements, null)
  const defaults = context(); delete defaults.data.capabilities.include_open_purchase_orders; delete defaults.data.capabilities.scenario_based_planning
  assert.equal(validatePlanningContext(defaults, ids.store).data.capabilities.include_open_purchase_orders, false)
})

test('C01 rejects wrong Store, duplicate Product/mode and working-looking unsupported capabilities', () => {
  const bad = [context(), context(), context(), context()]
  bad[0].data.store_id = WRONG
  bad[1].data.products.push(structuredClone(bad[1].data.products[0]))
  bad[2].data.requirements_modes[1] = bad[2].data.requirements_modes[0]
  bad[3].data.capabilities.include_open_purchase_orders = true
  for (const value of bad) assert.throws(() => validatePlanningContext(value, ids.store), HttpError)
})

test('R01 assessment must match selected date/Store and cannot claim executable data while unavailable', () => {
  assert.equal(validatePlanningReadiness(readiness(), ids.store, '2026-10-11').data.actions[0].result_assessment, 'NOT_ASSESSED')
  const bad = readiness(); bad.data.actions[0].execution_status = 'unavailable'
  assert.throws(() => validatePlanningReadiness(bad, ids.store, '2026-10-11'), HttpError)
  assert.throws(() => validatePlanningReadiness(readiness(), WRONG, '2026-10-11'), HttpError)
  assert.throws(() => validatePlanningReadiness(readiness(), ids.store, '2026-10-12'), HttpError)
})

test('C02/C03 terminal statuses own canonical polling delay, not HTTP completion assumptions', () => {
  assert.equal(validatePlanningAccepted(accepted()).meta.poll_after_ms, 2000)
  assert.equal(validatePlanningAccepted(accepted('completed')).meta.poll_after_ms, 0)
  const bad = accepted(); bad.meta.poll_after_ms = 0
  assert.throws(() => validatePlanningAccepted(bad), HttpError)
  const pending = planningRunFixture({ status: 'running', outcome: null, result: null, finished_at: null })
  assert.equal(validatePlanningRun(run(pending), ids.store, ids.run).data.result, null)
  const invalid = run(pending); invalid.data.result = planningRunFixture().result
  assert.throws(() => validatePlanningRun(invalid, ids.store, ids.run), HttpError)
})

test('completed no-winner and failed partial winner are valid distinct outcomes', () => {
  for (const data of [planningNoWinnerFixture(), planningFailedPartialFixture()]) assert.deepEqual(validatePlanningRun(run(data), ids.store, ids.run).data, data)
  assert.equal(planningFailedPartialFixture().status, 'failed')
  assert.equal(planningFailedPartialFixture().result.winner_option_id, ids.option)
  const unavailable = planningRunFixture({ outcome: 'no_computable_products', forecast: null,
    result: { completeness: 'partial', strategies: [], options: [], winner_option_id: null, winner_reason: 'NOT_EVALUATED', warnings: [] } })
  assert.equal(validatePlanningRun(run(unavailable), ids.store, ids.run).data.result.strategies.length, 0)
})

test('C03 preserves nullable service/delivery and huge exact count strings without inventing zeros', () => {
  const value = run(); const option = value.data.result.options[0]
  option.costs.delivery_fees = null; option.costs.fee_classification = 'PAYABLE_FEE_TYPE_NOT_CAPTURED'
  option.product_services[0].requested = { numerator: '0', denominator: '1', decimal_view: '0' }
  option.product_services[0].service = null
  const output = validatePlanningRun(value, ids.store, ids.run)
  assert.equal(output.data.result.options[0].costs.delivery_fees, null)
  assert.equal(output.data.result.options[0].product_services[0].service, null)
  assert.equal(output.data.result.strategies[0].domain_size, '9007199254740993')
})

test('C03 rejects unknown brief/risk fields, mismatched dates, ineligible winner and noncanonical fractions', () => {
  const values = Array.from({ length: 6 }, () => run())
  values[0].data.recommendation = { available: true }
  values[1].data.forecast.start_date = '2026-10-12'
  values[2].data.result.options[0].eligible = false
  values[3].data.result.options[0].costs.total.denominator = '0'
  values[4].data.result.options[0].costs.total = { numerator: '2', denominator: '2', decimal_view: '1' }
  values[5].data.result.strategies[0].domain_size = 9007199254740992
  for (const value of values) assert.throws(() => validatePlanningRun(value, ids.store, ids.run), HttpError)
})

test('C04/C05/C08 retain null captured-only evidence and unknown names rather than live-label fallback', () => {
  const page = navigator(); page.data.result_digest = null; page.meta.result_digest = null
  Object.assign(page.data.items[0], { display_name: null, name_availability: 'not_captured', purchase_quantity: null, purchase_line_count: null, path_balances: null })
  assert.equal(validatePlanningIngredients(page, ids.run).data.items[0].display_name, null)
  const value = detail(); value.data.result_digest = null; value.meta.result_digest = null
  Object.assign(value.data, { purchases: null, daily_balances: null, evidence_availability: 'not_evaluated' })
  assert.equal(validatePlanningIngredient(value, ids.run, ids.ingredient).data.daily_balances, null)
  const why = reasons(); Object.assign(why.data, { result_digest: null, result_schema_version: null, availability: 'unavailable', evidence_availability: 'not_evaluated', options: [] })
  why.data.winner = { option_id: null, reason_code: 'NOT_EVALUATED' }
  assert.equal(validatePlanningReasons(why, ids.run).data.availability, 'unavailable')
})

test('fragment validators reject run/option/digest/page identity mismatch and foreign purchases', () => {
  const page = navigator(); page.meta.result_digest = 'different'
  assert.throws(() => validatePlanningIngredients(page, ids.run), HttpError)
  const duplicate = navigator(); duplicate.data.items.push(structuredClone(duplicate.data.items[0]))
  assert.throws(() => validatePlanningIngredients(duplicate, ids.run), HttpError)
  const value = detail(); value.data.purchases[0].ingredient_id = WRONG
  assert.throws(() => validatePlanningIngredient(value, ids.run, ids.ingredient), HttpError)
  assert.throws(() => validatePlanningReasons(reasons(), WRONG), HttpError)
  assert.throws(() => validatePlanningIngredients(navigator(), ids.run, 'other-option'), HttpError)
})

test('optional notification details stay optional and no raw provider diagnostics are admitted', () => {
  const value = reasons(); value.data.warnings = [{ code: 'EXAMPLE', message: '<script>text only</script>' }]
  assert.equal(validatePlanningReasons(value, ids.run).data.warnings[0].details, undefined)
  value.data.raw_response = 'private provider output'
  assert.throws(() => validatePlanningReasons(value, ids.run), HttpError)
})

test('C01/R01 transport uses only current Store context/date-specific readiness and credentials', async (t) => {
  let calls = 0
  fetchWith(t, async (url, init) => {
    assert.equal(init.credentials, 'include'); assert.equal(init.method ?? 'GET', 'GET'); calls++
    if (url.endsWith('/planning-context')) return respond(context())
    const params = new URL(url).searchParams
    assert.equal(params.get('actions'), 'planning'); assert.equal(params.get('forecast_start_date'), '2026-10-11')
    return respond(readiness())
  })
  const data = source(); await data.context(ids.store); await data.readiness(ids.store, '2026-10-11')
  assert.equal(calls, 2)
})

test('C02 sends explicit exact body/session CSRF/key and no forecast, CAS or model selectors', async (t) => {
  session(t)
  fetchWith(t, async (url, init) => {
    assert.equal(url, `https://qa.invalid/api/v1/stores/${ids.store}/procurement-plans`)
    assert.equal(init.method, 'POST'); assert.equal(init.credentials, 'include')
    assert.equal(init.headers.get('X-CSRF-Token'), 'synthetic-session-csrf'); assert.equal(init.headers.get('Idempotency-Key'), KEY)
    assert.equal(init.headers.has('If-Match'), false); assert.equal(init.headers.has('Authorization'), false)
    assert.deepEqual(JSON.parse(init.body), custom('0'))
    return respond(accepted(), 202)
  })
  assert.equal((await source().create(ids.store, { key: KEY, request: custom('0') })).data.status, 'queued')
})

test('unsafe IDs, invalid date/request and missing CSRF stop before any network mutation', async (t) => {
  let calls = 0; fetchWith(t, async () => { calls++; throw new Error('must not fetch') })
  await assert.rejects(source().create(ids.store, { key: KEY, request: request() }), CsrfTokenUnavailableError)
  await assert.rejects(source().create(ids.store, { key: 'bad-key', request: request() }))
  await assert.rejects(source().read('not-store', ids.run))
  await assert.rejects(source().readiness(ids.store, '2026-02-29'))
  assert.equal(calls, 0)
})

test('accepted run linkage rejects a retained request that differs from original creation intent', async (t) => {
  session(t)
  fetchWith(t, async (_url, init) => init.method === 'POST' ? respond(accepted(), 202) : respond(run()))
  const data = source(); await data.create(ids.store, { key: KEY, request: custom('0') })
  await assert.rejects(data.read(ids.store, ids.run), HttpError)
})

test('fragment adapter first proves Run owning Store and pins digest across retained fragments', async (t) => {
  const paths = []; let changed = false
  fetchWith(t, async (url) => {
    paths.push(new URL(url).pathname)
    if (url.endsWith(`/procurement-plans/${ids.run}`)) return respond(run())
    if (url.endsWith('/ingredients')) return respond(navigator())
    const value = reasons(); if (changed) value.data.result_digest = 'different-result'
    return respond(value)
  })
  const data = source(); await data.ingredients(ids.store, ids.run, {})
  assert.equal(paths[0], `/api/v1/procurement-plans/${ids.run}`)
  assert.equal(paths[1], `/api/v1/procurement-plans/${ids.run}/ingredients`)
  await data.reasons(ids.store, ids.run); changed = true
  await assert.rejects(data.reasons(ids.store, ids.run), HttpError)
})

test('C05/C08 are read-only retained GETs with allowlisted option identity, never question POST', async (t) => {
  fetchWith(t, async (url, init) => {
    assert.equal(init.method ?? 'GET', 'GET'); assert.equal(init.body, undefined)
    if (url.endsWith(`/procurement-plans/${ids.run}`)) return respond(run())
    assert.equal(new URL(url).searchParams.get('option_id'), ids.option)
    if (url.includes('/ingredients/')) { const value = detail(); value.data.selection_status = 'explicit'; return respond(value) }
    const value = reasons(); return respond(value)
  })
  const data = source(); await data.ingredient(ids.store, ids.run, ids.ingredient, ids.option)
  assert.equal((await data.reasons(ids.store, ids.run, ids.option)).data.run_id, ids.run)
})

test('direct foreign-Store fragment calls are denied before reading any Ingredient or explanation payload', async (t) => {
  const visited = []
  fetchWith(t, async (url) => {
    visited.push(new URL(url).pathname)
    return respond(run(planningRunFixture({ store_id: WRONG })))
  })
  await assert.rejects(source().ingredients(ids.store, ids.run, {}), HttpError)
  assert.deepEqual(visited, [`/api/v1/procurement-plans/${ids.run}`])
})

test('terminal captured-only Run can read null-digest/null-engine fragments without inventing a result', async (t) => {
  const captured = planningRunFixture({ status: 'failed', outcome: 'execution_error', result: null,
    errors: [{ code: 'ENGINE_SOURCE_ERROR', message: 'Controlled failure after capture' }] })
  fetchWith(t, async (url) => {
    if (url.endsWith(`/procurement-plans/${ids.run}`)) return respond(run(captured))
    const page = navigator(); page.data.result_digest = null; page.meta.result_digest = null
    Object.assign(page.data, { selected_option_id: null, selection_status: 'not_selected' })
    Object.assign(page.data.items[0], { purchase_quantity: null, purchase_line_count: null, path_balances: null })
    return respond(page)
  })
  const page = await source().ingredients(ids.store, ids.run, {})
  assert.equal(page.data.result_digest, null); assert.equal(page.data.items[0].purchase_quantity, null)
})

test('401/403 preserve shared Auth behavior and never fall back to mock output', async (t) => {
  let unauthorized = 0; session(t, () => { unauthorized++ })
  let status = 401; let mockCalls = 0
  const mockSource = { context: async () => { mockCalls++; return context() } }
  fetchWith(t, async () => respond({ data: null, meta: { request_id: 'qa-denied' },
    error: { code: status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', message: 'Denied', details: {} } }, status))
  const data = createPlanningDataSource({ dataSource: 'api', apiBaseUrl: 'https://qa.invalid', mockSource })
  await assert.rejects(data.context(ids.store), (error) => error instanceof HttpError && error.status === 401)
  status = 403
  await assert.rejects(data.context(ids.store), (error) => error instanceof HttpError && error.status === 403)
  assert.equal(unauthorized, 1); assert.equal(mockCalls, 0)
})

test('mock mode is explicit per-instance, canonical and isolated from HTTP/API fallback', async (t) => {
  fetchWith(t, async () => { throw new Error('Mock cannot make HTTP calls') })
  assert.throws(() => createPlanningDataSource({ dataSource: 'mock', apiBaseUrl: 'https://qa.invalid' }))
  const first = createMockPlanningDataSource(), second = createMockPlanningDataSource()
  assert.equal(matchesPlanningWire('Envelope_Context_', await first.context(ids.store)), true)
  assert.equal(matchesPlanningWire('Envelope_Readiness_', await first.readiness(ids.store, '2026-10-11')), true)
  const intent = { key: KEY, request: request() }
  const receipt = await first.create(ids.store, intent)
  assert.equal(matchesPlanningWire('PlanningEnvelope_Accepted_', receipt), true)
  await assert.rejects(second.read(ids.store, receipt.data.run_id))
  assert.equal((await first.read(ids.store, receipt.data.run_id)).data.status, 'running')
  const completed = await first.read(ids.store, receipt.data.run_id)
  assert.equal(validatePlanningRun(completed, ids.store, receipt.data.run_id).data.status, 'completed')
  for (const [name, value] of [['InspectionEnvelope_IngredientNavigator_', await first.ingredients(ids.store, receipt.data.run_id, {})],
    ['InspectionEnvelope_IngredientDetail_', await first.ingredient(ids.store, receipt.data.run_id, ids.ingredient)],
    ['ExplanationEnvelope', await first.reasons(ids.store, receipt.data.run_id)]]) assert.equal(matchesPlanningWire(name, value), true, name)
  const replay = await first.create(ids.store, intent)
  assert.equal(replay.data.run_id, receipt.data.run_id); assert.equal(replay.data.status, 'completed')
  await assert.rejects(first.create(ids.store, { key: KEY, request: custom('0') }))
})
