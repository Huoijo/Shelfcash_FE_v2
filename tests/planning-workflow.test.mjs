import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PlanningWorkflow } from '../src/features/decision-planning/planning.workflow'
import { createMockPlanningDataSource, PLANNING_FIXTURE_IDS as ids, PLANNING_FIXTURE_PERMISSIONS,
  planningRunFixture, planningNoWinnerFixture, planningFailedPartialFixture, planningIngredientsFixture,
  planningIngredientFixture, planningReasonsFixture } from '../src/features/decision-planning/planning.fixtures'
import { HttpError } from '../src/shared/http/httpClient'

const permissions = [...PLANNING_FIXTURE_PERMISSIONS]
const OTHER = 'd0900000-0000-4000-8000-000000000098'
const request = () => ({ requirements_mode: 'default', forecast_start_date: '2026-10-11', default_requirements_version: 'synthetic-default/1' })
const custom = (budget = '0') => ({ requirements_mode: 'custom', forecast_start_date: '2026-10-11',
  requirements: { budget_limit: budget, paths: [{ path: 'BASE', min_fill_rate_percent: '95', product_overrides: [] }] } })
const envelope = (data) => ({ data, meta: { warnings: [], poll_after_ms: ['queued', 'running'].includes(data.status) ? 2000 : 0 }, error: null })
const navEnvelope = (data = planningIngredientsFixture(), pagination = { limit: 50, next_cursor: null, total_count: 1 }, version = 'inspection-only-version') => ({
  data, meta: { request_id: 'qa-nav', run_id: data.run_id, result_digest: data.result_digest, response_version: version, pagination }, error: null,
})
const detailEnvelope = (data = planningIngredientFixture(), version = 'inspection-only-version') => ({
  data, meta: { request_id: 'qa-detail', run_id: data.run_id, result_digest: data.result_digest, response_version: version }, error: null,
})
const whyEnvelope = (data = planningReasonsFixture()) => ({ data, meta: { request_id: 'qa-reasons' }, error: null })
const failure = (status, code = 'SERVICE_UNAVAILABLE') => new HttpError('contract', 'Controlled failure', status, { code, message: 'Controlled failure', details: {} }, 'qa-error')
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

async function setup(override = {}, grants = permissions) {
  const source = { ...createMockPlanningDataSource(), ...override }
  const workflow = new PlanningWorkflow(source, ids.store, { permissions: grants })
  await workflow.loadContext(); await workflow.assessDate('2026-10-11')
  return { source, workflow }
}
async function retained(override = {}, data = planningRunFixture()) {
  const result = await setup({ read: async () => envelope(data), ingredients: async () => navEnvelope(),
    ingredient: async () => detailEnvelope(), reasons: async () => whyEnvelope(), ...override })
  await result.workflow.resume(data.run_id)
  return result
}

test('setup/context/readiness create → canonical running → terminal retained result without separate forecast calls', async () => {
  const { workflow } = await setup()
  assert.equal(workflow.getSnapshot().phase, 'setup')
  assert.equal(workflow.getSnapshot().readinessDate, '2026-10-11')
  await workflow.create(request())
  let state = workflow.getSnapshot()
  assert.equal(state.phase, 'pending'); assert.equal(state.accepted.status, 'queued')
  assert.equal(state.run.status, 'running'); assert.equal(state.run.result, null); assert.equal(state.pollAfterMs, 2000)
  await workflow.poll()
  state = workflow.getSnapshot()
  assert.equal(state.phase, 'result'); assert.equal(state.run.status, 'completed')
  assert.equal(state.run.result.winner_option_id, ids.option); assert.equal(state.pollAfterMs, null)
  assert.equal(state.run.result.options.length, 1); assert.equal(state.run.result.strategies.length, 3)
})

test('zero budget is sent unchanged and renders completed no-winner as business result, not request failure', async () => {
  const { workflow } = await setup()
  await workflow.assessDate('2026-10-11',custom('0')); await workflow.create(custom('0')); await workflow.poll()
  const state = workflow.getSnapshot()
  assert.equal(state.phase, 'result'); assert.equal(state.error, null)
  assert.equal(state.run.configuration.budget.limit, '0')
  assert.equal(state.run.outcome, 'no_eligible_candidate'); assert.equal(state.run.result.winner_option_id, null)
  assert.deepEqual(state.run.result.options, [])
})

test('network-lost acknowledgment freezes original intent/key and refuses a new creation/reset until explicit same-key replay', async () => {
  const underlying = createMockPlanningDataSource(); const intents = []; let first = true
  const { workflow } = await setup({ ...underlying, create: async (...args) => {
    intents.push(structuredClone(args[1])); const response = await underlying.create(...args)
    if (first) { first = false; throw new HttpError('transport', 'Lost ACK') }
    return response
  } })
  const intent = custom('100000')
  await workflow.assessDate('2026-10-11',intent); await workflow.create(intent); intent.requirements.budget_limit = '999999'
  assert.equal(workflow.getSnapshot().uncertain, true); assert.equal(workflow.getSnapshot().accepted, null)
  assert.equal(workflow.reset(), false)
  await workflow.create(custom('200000'))
  assert.equal(intents.length, 1)
  await workflow.retryCreate()
  assert.equal(workflow.getSnapshot().uncertain, false); assert.deepEqual(intents[1], intents[0])
  assert.equal(intents[1].request.requirements.budget_limit, '100000')
  assert.match(intents[0].key, /^[0-9a-f-]{36}$/)
})

test('500/503 and unreadable successful creation remain uncertain; no automatic write retry', async () => {
  for (const error of [failure(500), failure(503), new HttpError('protocol', 'Unreadable accepted response')]) {
    let calls = 0
    const { workflow } = await setup({ create: async () => { calls++; throw error } })
    await workflow.create(request())
    assert.equal(workflow.getSnapshot().uncertain, true); assert.equal(calls, 1)
    await workflow.poll(); assert.equal(calls, 1)
    workflow.dispose()
  }
})

test('a later definite retry denial cannot disprove original lost-ACK acceptance or release its original intent/key', async () => {
  for (const status of [403, 422]) {
    const underlying = createMockPlanningDataSource(); const intents = []; let attempt = 0
    const { workflow } = await setup({ ...underlying, create: async (...args) => {
      intents.push(structuredClone(args[1])); attempt++
      if (attempt === 1) { await underlying.create(...args); throw new HttpError('transport', 'Original ACK lost') }
      if (attempt === 2) throw failure(status, status === 403 ? 'PERMISSION_DENIED' : 'INVALID_PLANNING_CONFIGURATION')
      return underlying.create(...args)
    } })
    await workflow.assessDate('2026-10-11',custom('100000')); await workflow.create(custom('100000')); assert.equal(workflow.getSnapshot().uncertain, true)
    await workflow.retryCreate()
    assert.equal(workflow.getSnapshot().uncertain, true, `retry${status} cannot prove original nonacceptance`)
    assert.equal(workflow.reset(), false)
    await workflow.create(custom('200000')); assert.equal(intents.length, 2)
    await workflow.retryCreate()
    assert.equal(workflow.getSnapshot().uncertain, false)
    assert.deepEqual(intents[1], intents[0]); assert.deepEqual(intents[2], intents[0])
    assert.equal(workflow.getSnapshot().run.request.requirements.budget_limit, '100000')
  }
})

test('known C02 acceptance plus failed C03 read retains Run ID and retries GET only, never POST', async () => {
  const underlying = createMockPlanningDataSource(); let writes = 0, reads = 0
  const { workflow } = await setup({ ...underlying,
    create: async (...args) => { writes++; return underlying.create(...args) },
    read: async (...args) => { reads++; if (reads === 1) throw failure(503); return underlying.read(...args) },
  })
  await workflow.create(request())
  assert.equal(workflow.getSnapshot().phase, 'error'); assert.ok(workflow.getSnapshot().accepted.run_id)
  assert.equal(workflow.getSnapshot().uncertain, false); assert.equal(workflow.getSnapshot().run, null)
  await workflow.refresh()
  assert.equal(workflow.getSnapshot().run.run_id, workflow.getSnapshot().accepted.run_id)
  assert.equal(writes, 1); assert.equal(reads, 2)
})

test('receipt warnings survive a failed first GET, latest Run metadata replaces them and resume/reset never leak old warnings', async () => {
  const underlying = createMockPlanningDataSource(); const newRun = deferred(); let reads = 0
  const receiptWarnings = [{ code: 'ACCEPTANCE_WARNING', message: 'Warning retained at acceptance' }]
  const latestWarnings = [{ code: 'READ_WARNING', message: 'Latest retained lifecycle metadata' }]
  const otherWarnings = [{ code: 'OTHER_RUN_WARNING', message: 'Warning belonging to the newly opened Run only' }]
  const { workflow } = await setup({ ...underlying,
    create: async (...args) => { const response = await underlying.create(...args); response.meta.warnings = receiptWarnings; return response },
    read: async (...args) => {
      if (args[1] === OTHER) return newRun.promise
      reads++
      if (reads === 1) throw failure(503)
      const response = await underlying.read(...args); response.meta.warnings = latestWarnings; return response
    },
  })
  await workflow.create(request())
  assert.equal(workflow.getSnapshot().phase, 'error')
  assert.deepEqual(workflow.getSnapshot().warnings, receiptWarnings)
  await workflow.refresh()
  assert.deepEqual(workflow.getSnapshot().warnings, latestWarnings)
  const reopening = workflow.resume(OTHER)
  assert.deepEqual(workflow.getSnapshot().warnings, [])
  const response = envelope(planningRunFixture({ run_id: OTHER })); response.meta.warnings = otherWarnings
  newRun.resolve(response); await reopening
  assert.deepEqual(workflow.getSnapshot().warnings, otherWarnings)
  assert.equal(workflow.getSnapshot().run.run_id, OTHER)
  assert.equal(workflow.reset(), true); assert.deepEqual(workflow.getSnapshot().warnings, [])
})

test('definite 403/422 creation denial clears uncertain retry and preserves actionable server code/request ID', async () => {
  for (const status of [403, 422]) {
    let writes = 0
    const { workflow } = await setup({ create: async () => { writes++; throw failure(status, status === 403 ? 'PERMISSION_DENIED' : 'INVALID_PLANNING_CONFIGURATION') } })
    await workflow.create(request())
    assert.equal(workflow.getSnapshot().uncertain, false)
    assert.match(workflow.getSnapshot().error, /qa-error/)
    assert.equal(workflow.reset(), true)
    assert.equal(writes, 1)
  }
})

test('creation requires current Store, run/money grants and selected-date readiness; no implicit grant from role/mock', async () => {
  let writes = 0
  const source = { ...createMockPlanningDataSource(), create: async () => { writes++; throw new Error('must not write') } }
  for (const grants of [[], permissions.filter((right) => right !== 'planning.run'), permissions.filter((right) => right !== 'budget.read')]) {
    const workflow = new PlanningWorkflow(source, ids.store, { permissions: grants })
    await workflow.loadContext(); await workflow.assessDate('2026-10-11'); await workflow.create(request())
    assert.equal(workflow.getSnapshot().accepted, null)
  }
  const wrong = new PlanningWorkflow(source, null, { permissions }); await wrong.create(request())
  assert.equal(writes, 0)
})

test('changing forecast start requires a fresh R01 assessment and never reuses old-date readiness', async () => {
  const calls = []; const base = createMockPlanningDataSource()
  const { workflow } = await setup({ ...base, readiness: async (...args) => { calls.push(args[1]); return base.readiness(...args) } })
  const next = { ...request(), forecast_start_date: '2026-10-12' }
  await workflow.create(next)
  assert.equal(workflow.getSnapshot().accepted, null); assert.match(workflow.getSnapshot().error, /readiness/)
  await workflow.assessDate('2026-10-12'); await workflow.create(next)
  assert.equal(workflow.getSnapshot().phase, 'pending')
  assert.deepEqual(calls, ['2026-10-11', '2026-10-12'])
})

test('stale/default version and unsupported setup fields fail before write', async () => {
  let writes = 0
  const { workflow } = await setup({ create: async () => { writes++; throw new Error('must not write') } })
  await workflow.create({ ...request(), default_requirements_version: 'obsolete-version' })
  assert.match(workflow.getSnapshot().error, /Phiên bản/)
  await workflow.create({ ...request(), strategy: 'lean' })
  assert.equal(workflow.getSnapshot().accepted, null); assert.equal(writes, 0)
})

test('completed no-recommendation and failed partial recommendation retain exact server status/outcome', async () => {
  for (const data of [planningNoWinnerFixture(), planningFailedPartialFixture()]) {
    const { workflow } = await retained({}, data)
    assert.equal(workflow.getSnapshot().phase, 'result')
    assert.equal(workflow.getSnapshot().run.status, data.status)
    assert.equal(workflow.getSnapshot().run.result.winner_option_id, data.result.winner_option_id)
    assert.equal(workflow.getSnapshot().pollAfterMs, null)
  }
})

test('resume re-reads retained server state without local reconstruction or duplicate create', async () => {
  let reads = 0, writes = 0
  const { workflow } = await setup({ create: async () => { writes++; throw new Error('must not create') },
    read: async (_store, runId) => { reads++; assert.equal(runId, ids.run); return envelope(planningRunFixture()) } })
  await workflow.resume(ids.run)
  assert.equal(workflow.getSnapshot().run.run_id, ids.run); assert.equal(workflow.getSnapshot().accepted, null)
  assert.equal(reads, 1); assert.equal(writes, 0)
})

test('wrong-Store retained Run is blocked and old Run cannot remain visible under a failed new locator', async () => {
  let bad = false
  const { workflow } = await retained({ read: async (_store, id) => envelope(planningRunFixture({ run_id: id, store_id: bad ? OTHER : ids.store })) })
  assert.ok(workflow.getSnapshot().run)
  bad = true; await workflow.resume(OTHER)
  assert.equal(workflow.getSnapshot().run, null); assert.equal(workflow.getSnapshot().ingredients, null)
  assert.equal(workflow.getSnapshot().phase, 'error'); assert.match(workflow.getSnapshot().error, /cửa hàng/)
})

test('bounded polling stops local auto-wait without inventing terminal server failure or issuing writes', async () => {
  const pending = planningRunFixture({ status: 'running', outcome: null, finished_at: null, result: null })
  let reads = 0
  const { workflow } = await retained({ read: async () => { reads++; return envelope(pending) } }, pending)
  for (let index = 0; index < 65; index++) await workflow.poll()
  const state = workflow.getSnapshot()
  assert.equal(state.run.status, 'running'); assert.equal(state.phase, 'pending'); assert.equal(state.pollStopped, true)
  assert.equal(state.pollAfterMs, null); assert.equal(state.error, null); assert.equal(reads, 61)
})

test('refreshing context for an existing result keeps the result phase instead of loading_context forever', async () => {
  const { workflow } = await retained()
  await workflow.loadContext()
  assert.equal(workflow.getSnapshot().phase, 'result'); assert.equal(workflow.getSnapshot().busy, false)
})

test('context refresh while Run is pending preserves canonical polling instead of silently stopping auto-wait', async () => {
  const { workflow } = await setup()
  await workflow.create(request())
  assert.equal(workflow.getSnapshot().pollAfterMs, 2000)
  await workflow.loadContext()
  assert.equal(workflow.getSnapshot().phase, 'pending')
  assert.equal(workflow.getSnapshot().pollAfterMs, 2000)
})

test('current permission removal fences new creation and retained detail requests even after prior success', async () => {
  const { workflow } = await retained()
  await workflow.loadIngredients()
  workflow.setPermissions(permissions.filter((right) => right !== 'planning.result.read'))
  await workflow.loadReasons()
  assert.equal(workflow.getSnapshot().reasons, null)
  assert.match(workflow.getSnapshot().inspectionError, /quyền/)
  assert.equal(workflow.getSnapshot().ingredients, null)
  workflow.reset()
  await workflow.assessDate('2026-10-11')
  await workflow.create(request())
  assert.equal(workflow.getSnapshot().accepted, null)
})

test('inspection reads pin digest/version across navigator/detail/reasons without assuming C03 has a digest', async () => {
  const { workflow } = await retained()
  await workflow.loadIngredients(); await workflow.loadIngredient(ids.ingredient); await workflow.loadReasons()
  const state = workflow.getSnapshot()
  assert.equal(state.inspectionError, null)
  assert.equal(state.ingredients.result_digest, ids.digest); assert.equal(state.ingredient.result_digest, ids.digest)
  assert.equal(state.reasons.result_digest, ids.digest); assert.equal(state.run.result_digest, undefined)
})

test('ingredient pagination merges same pinned snapshot only; duplicate/drift cursor clears unsafe pages', async () => {
  for (const variant of ['digest', 'duplicate', 'total', 'version']) {
    const { workflow } = await retained({ ingredients: async (_store, _run, query) => {
      if (!query.cursor) return navEnvelope(planningIngredientsFixture(), { limit: 1, next_cursor: 'page-2', total_count: 2 })
      const page = planningIngredientsFixture(); page.items[0].ingredient_id = variant === 'duplicate' ? ids.ingredient : OTHER
      if (variant === 'digest') page.result_digest = 'different-digest'
      return navEnvelope(page, { limit: 1, next_cursor: null, total_count: variant === 'total' ? 3 : 2 }, variant === 'version' ? 'different-version' : 'inspection-only-version')
    } })
    await workflow.loadIngredients(); assert.equal(workflow.getSnapshot().ingredients.items.length, 1)
    await workflow.loadIngredients('page-2')
    assert.equal(workflow.getSnapshot().ingredients, null, variant)
    assert.ok(workflow.getSnapshot().inspectionError, variant)
  }
})

test('coherent ingredient pages preserve all identities and canonical total without business aggregation', async () => {
  const { workflow } = await retained({ ingredients: async (_store, _run, query) => {
    const page = planningIngredientsFixture()
    if (query.cursor) page.items[0].ingredient_id = OTHER
    return navEnvelope(page, { limit: 1, next_cursor: query.cursor ? null : 'page-2', total_count: 2 })
  } })
  await workflow.loadIngredients(); await workflow.loadIngredients('page-2')
  assert.deepEqual(workflow.getSnapshot().ingredients.items.map((row) => row.ingredient_id), [ids.ingredient, OTHER])
  assert.equal(workflow.getSnapshot().ingredientsTotal, 2); assert.equal(workflow.getSnapshot().nextIngredientCursor, null)
})

test('detail access requires retained navigator scope; arbitrary ingredient URLs never broaden it', async () => {
  let reads = 0
  const { workflow } = await retained({ ingredient: async () => { reads++; return detailEnvelope() } })
  await workflow.loadIngredient(OTHER)
  assert.equal(reads, 0); assert.equal(workflow.getSnapshot().ingredient, null)
  assert.match(workflow.getSnapshot().inspectionError, /navigator/)
})

test('changed explanation digest invalidates inspector instead of replacing canonical retained result', async () => {
  const why = planningReasonsFixture({ result_digest: 'wrong-digest' })
  const { workflow } = await retained({ reasons: async () => whyEnvelope(why) })
  const canonical = workflow.getSnapshot().run
  await workflow.loadIngredients(); await workflow.loadReasons()
  assert.equal(workflow.getSnapshot().reasons, null); assert.equal(workflow.getSnapshot().ingredients, null)
  assert.equal(workflow.getSnapshot().run, canonical)
})

test('option inspection is local/read-only and a selection change aborts stale in-flight detail', async () => {
  const delayed = deferred(); let signal
  const { workflow } = await retained({ ingredient: async (_store, _run, _id, _option, requestSignal) => { signal = requestSignal; return delayed.promise } })
  await workflow.loadIngredients()
  const pending = workflow.loadIngredient(ids.ingredient)
  workflow.selectOption(ids.option)
  assert.equal(signal.aborted, true); assert.equal(workflow.getSnapshot().ingredients, null)
  delayed.resolve(detailEnvelope()); await pending
  assert.equal(workflow.getSnapshot().ingredient, null); assert.equal(workflow.getSnapshot().selectedOptionId, ids.option)
  assert.equal(workflow.getSnapshot().run.result.winner_option_id, ids.option)
})

test('readiness request race ignores stale dates even if a custom source ignores abort', async () => {
  const base = createMockPlanningDataSource(); const delayed = deferred(); let captured
  const { workflow } = await setup({ readiness: async (...args) => {
    if (args[1] === '2026-10-12') { captured = args[2]; return delayed.promise }
    return base.readiness(...args)
  } })
  const old = workflow.assessDate('2026-10-12')
  await workflow.assessDate('2026-10-13'); assert.equal(captured.aborted, true)
  delayed.resolve(await base.readiness(ids.store, '2026-10-12')); await old
  assert.equal(workflow.getSnapshot().readinessDate, '2026-10-13')
})

test('disposing an old Store workspace aborts read and ignores late results without contaminating a new Store', async () => {
  const delayed = deferred(); let signal
  const { workflow } = await setup({ read: async (_store, _run, captured) => { signal = captured; return delayed.promise } })
  const pending = workflow.resume(ids.run)
  workflow.dispose(); assert.equal(signal.aborted, true)
  delayed.resolve(envelope(planningRunFixture())); await pending
  assert.equal(workflow.getSnapshot().run, null)
  const fresh = new PlanningWorkflow(createMockPlanningDataSource(), OTHER, { permissions })
  assert.equal(fresh.getSnapshot().run, null); assert.equal(fresh.getSnapshot().context, null)
})

test('StrictMode cleanup/replay can reload the same workflow while the first context read remains unresolved', async () => {
  const firstRead = deferred(); const base = createMockPlanningDataSource(); let reads = 0, firstSignal
  const source = { ...base, context: async (storeId, signal) => {
    reads++
    if (reads === 1) { firstSignal = signal; return firstRead.promise }
    const result = await base.context(storeId, signal)
    result.data.context_version = 'strict-replayed-context'
    return result
  } }
  const workflow = new PlanningWorkflow(source, ids.store, { permissions })
  const original = workflow.loadContext()
  assert.equal(workflow.getSnapshot().busy, true)
  workflow.dispose(); assert.equal(firstSignal.aborted, true)
  let notifications = 0
  const unsubscribe = workflow.subscribe(() => { notifications++ })
  await workflow.loadContext()
  assert.equal(reads, 2); assert.equal(workflow.getSnapshot().busy, false)
  assert.equal(workflow.getSnapshot().phase, 'setup')
  assert.equal(workflow.getSnapshot().context.context_version, 'strict-replayed-context')
  firstRead.resolve(await base.context(ids.store)); await original
  assert.equal(workflow.getSnapshot().context.context_version, 'strict-replayed-context')
  assert.ok(notifications > 0); unsubscribe()
})

test('StrictMode locator cleanup/replay starts a fresh retained read and ignores its aborted predecessor', async () => {
  const delayed = deferred(); let reads = 0, firstSignal
  const source = { ...createMockPlanningDataSource(), read: async (_store, runId, signal) => {
    reads++
    if (reads === 1) { firstSignal = signal; return delayed.promise }
    return envelope(planningRunFixture({ run_id: runId, response_version: 'strict-replayed-run' }))
  } }
  const workflow = new PlanningWorkflow(source, ids.store, { permissions })
  const original = workflow.resume(ids.run)
  assert.equal(workflow.getSnapshot().busy, true)
  workflow.dispose(); assert.equal(firstSignal.aborted, true)
  const unsubscribe = workflow.subscribe(() => {})
  await workflow.resume(OTHER)
  assert.equal(reads, 2); assert.equal(workflow.getSnapshot().busy, false)
  assert.equal(workflow.getSnapshot().phase, 'result'); assert.equal(workflow.getSnapshot().run.run_id, OTHER)
  delayed.resolve(envelope(planningRunFixture())); await original
  assert.equal(workflow.getSnapshot().run.run_id, OTHER)
  assert.equal(workflow.getSnapshot().run.response_version, 'strict-replayed-run'); unsubscribe()
})

test('cleanup releases readiness and inspector busy latches while stale responses remain fenced', async () => {
  const delayedReadiness = deferred(), delayedIngredient = deferred(); let readinessCalls = 0
  const base = createMockPlanningDataSource()
  const { workflow } = await retained({
    readiness: async (...args) => { readinessCalls++; return readinessCalls === 2 ? delayedReadiness.promise : base.readiness(...args) },
    ingredient: async () => delayedIngredient.promise,
  })
  await workflow.loadIngredients()
  const readingIngredient = workflow.loadIngredient(ids.ingredient)
  const readingDate = workflow.assessDate('2026-10-12')
  assert.equal(workflow.getSnapshot().detailBusy, true); assert.equal(workflow.getSnapshot().readinessBusy, true)
  workflow.dispose()
  assert.equal(workflow.getSnapshot().detailBusy, false); assert.equal(workflow.getSnapshot().readinessBusy, false)
  await workflow.assessDate('2026-10-13'); await workflow.loadReasons()
  assert.equal(workflow.getSnapshot().readinessDate, '2026-10-13'); assert.ok(workflow.getSnapshot().reasons)
  delayedReadiness.resolve(await base.readiness(ids.store, '2026-10-12'))
  delayedIngredient.resolve(detailEnvelope())
  await readingDate; await readingIngredient
  assert.equal(workflow.getSnapshot().readinessDate, '2026-10-13'); assert.equal(workflow.getSnapshot().ingredient, null)
})

test('terminal results stop polling and reset clears canonical result/inspection but never sends a write', async () => {
  let reads = 0
  const { workflow } = await retained({ read: async () => { reads++; return envelope(planningRunFixture()) } })
  await workflow.loadIngredients(); await workflow.poll()
  assert.equal(reads, 1); assert.equal(workflow.reset(), true)
  assert.equal(workflow.getSnapshot().phase, 'setup'); assert.equal(workflow.getSnapshot().run, null)
  assert.equal(workflow.getSnapshot().ingredients, null); assert.equal(workflow.getSnapshot().readiness, null)
  assert.ok(workflow.getSnapshot().context)
})

test('transient reasons failure preserves previously validated ingredient evidence and scopes retry to reasons',async()=>{
  let failRead=true
  const {workflow}=await retained({reasons:async()=>{if(failRead)throw new HttpError('transport','Controlled reasons connection loss');return whyEnvelope()}})
  await workflow.loadIngredients();await workflow.loadIngredient(ids.ingredient)
  const before=workflow.getSnapshot()
  await workflow.loadReasons()
  assert.equal(workflow.getSnapshot().inspectionArea,'reasons')
  assert.ok(workflow.getSnapshot().inspectionError)
  assert.deepEqual(workflow.getSnapshot().ingredients,before.ingredients)
  assert.deepEqual(workflow.getSnapshot().ingredient,before.ingredient)
  failRead=false;await workflow.loadReasons();assert.equal(workflow.getSnapshot().inspectionError,null);assert.ok(workflow.getSnapshot().reasons)
})

test('same-date readiness for one full request cannot authorize a changed budget or requirements mode', async () => {
  const { workflow } = await setup()
  await workflow.assessDate('2026-10-11', custom('0'))
  await workflow.create(custom('1'))
  assert.equal(workflow.getSnapshot().accepted, null)
  assert.match(workflow.getSnapshot().error, /toàn bộ yêu cầu/)
  await workflow.create(request())
  assert.equal(workflow.getSnapshot().accepted, null)
  await workflow.create(custom('0'))
  assert.equal(workflow.getSnapshot().accepted.status, 'queued')
})
