import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { searchImportEntities } from '../src/features/import-data/importEntitySearch.data'
import { readImportReadiness } from '../src/features/import-data/importReadiness.data'
import { matchesImportWire } from '../src/features/import-data/importFlow.wire'
import { validateMappingQueue, validateMappingOptions, validateProfileDecision } from '../src/features/import-data/importFlow.validation'
import { HttpError } from '../src/shared/http/httpClient'

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const item = () => ({ supplier_id: id(2), name: 'Nhà cung cấp A', active: false, version: 'supplier/1' })
const envelope = (items = [item()]) => ({ data: { items }, error: null, meta: {
  request_id: 'supplier-test', snapshot_id: 'snapshot/1', observed_at: '2026-10-16T00:00:00Z',
  pagination: { limit: 20, total_count: null, next_cursor: 'signed-next' },
} })
const request = (extras = {}) => ({ storeId: id(1), kind: 'supplier', q: '  cà phê  ', signal: new AbortController().signal, ...extras })
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

test('016 SU01 uses canonical scoped search, preserves inactive identity/version and pins pagination', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url: new URL(url), options }); const value = envelope(); if(calls.length>1)value.meta.pagination.next_cursor=null; return json(value) })
  const first = await searchImportEntities(request())
  assert.deepEqual(first.items, [{ id: id(2), name: 'Nhà cung cấp A', code: null, kind: 'supplier', active: false, version: 'supplier/1' }])
  assert.equal(first.snapshotId, 'snapshot/1')
  assert.equal(calls[0].url.pathname, `/api/v1/stores/${id(1)}/suppliers`)
  assert.equal(calls[0].url.searchParams.get('q'), 'cà phê')
  assert.equal(calls[0].url.searchParams.has('active'), false)
  assert.equal(calls[0].options.credentials, 'include')
  assert.equal(new Headers(calls[0].options.headers).has('X-CSRF-Token'), false)
  await searchImportEntities(request({ cursor: first.nextCursor, snapshotId: first.snapshotId }))
  assert.equal(calls[1].url.searchParams.get('snapshot_id'), first.snapshotId)
  assert.equal(calls[1].url.searchParams.get('cursor'), first.nextCursor)
})

test('016 SU01 rejects malformed, duplicate and switched-snapshot responses without inventing candidates', async t => {
  let data = envelope()
  t.mock.method(globalThis, 'fetch', async () => json(data))
  for (const corrupt of [
    value => { value.data.items.push(item()) },
    value => { delete value.data.items[0].version },
    value => { value.meta.snapshot_id = 'snapshot/other' },
    value => { value.meta.pagination.next_cursor = '' },
    value => { value.meta.pagination.limit = 0 },
  ]) {
    data = envelope(); corrupt(data)
    await assert.rejects(searchImportEntities(request({ snapshotId: 'snapshot/1' })), e => e instanceof HttpError && e.kind === 'protocol')
  }
})

test('016 SU01 keeps permission denial, server failure and abort distinct; invalid scope never fetches', async t => {
  let calls = 0, status = 403
  t.mock.method(globalThis, 'fetch', async () => { calls++; return json({ data: null, meta: { request_id: 'denied' }, error: { code: 'PERMISSION_DENIED', message: 'Denied', details: {} } }, status) })
  await assert.rejects(searchImportEntities(request()), e => e.status === 403 && e.problem.code === 'PERMISSION_DENIED')
  status = 503
  await assert.rejects(searchImportEntities(request()), e => e.status === 503)
  const before = calls
  await assert.rejects(searchImportEntities(request({ storeId: 'other-store' })))
  await assert.rejects(searchImportEntities(request({ q: ' ' })))
  await assert.rejects(searchImportEntities(request({ signal: AbortSignal.abort() })))
  assert.equal(calls, before)
})

test('016 all 15 M03 schemas and source_only remain typed supported source facts', () => {
  const schemas = ['sales', 'recipes', 'inventory_count', 'opening_stock', 'inventory_receipts', 'products', 'ingredients', 'suppliers', 'supplier_terms', 'payable_fees', 'scope_declarations', 'calendar_events', 'promotion_observations', 'usage_history', 'purchase_history']
  for (const schema_id of schemas) assert.equal(matchesImportWire('SchemaDescriptor', { schema_id, label: schema_id, description: '', fields: [] }), true, schema_id)
  const sourceOnly = { key: 'supplier_terms.price_basis', type: 'string', requiredness: 'required', unit_semantics: null, support: 'source_only', available: true, reason_code: null }
  const result = validateMappingOptions({ data: { schema: 'supplier_terms', schema_version: 'import_schema/1', schema_context_id: id(3), mapping_revision: 'map/1', options: [sourceOnly] }, error: null, meta: { request_id: 'typed' } })
  assert.equal(result.options[0].support, 'source_only')
  assert.equal(result.options[0].available, true)
  assert.equal(matchesImportWire('SchemaDescriptor', { schema_id: 'weather', label: 'Weather', description: '', fields: [] }), false)
})

test('016 M02 preserves counter scope/revision and N5 accepts main receipt without fabricating notifications', () => {
  const data = { items: [], counts: { total_fields: 3, completed_fields: 2, unresolved: 1 }, mapping_revision: 'map/1', counters: null, counter_scope: { sheet_id: id(3), review_only: false } }
  const result = validateMappingQueue({ data, error: null, meta: { request_id: 'main', pagination: { limit: 20, total_count: 0, next_cursor: null } } })
  assert.equal(result.mapping_revision, 'map/1')
  assert.deepEqual(result.counter_scope, data.counter_scope)
  const receipt = { profile_id: id(4), approved_version: 'active/1', active_version: 'active/1', lifecycle_revision: 'life/2', decision_id: id(5), decided_at: '2026-10-16T00:00:00Z', audit_id: id(6), submission: null, notification_delivery: { status: 'pending', event_id: id(7) } }
  assert.deepEqual(validateProfileDecision({ data: receipt, error: null, meta: { request_id: 'main' } }, id(4)).notification_delivery, receipt.notification_delivery)
  delete receipt.submission
  assert.throws(() => validateProfileDecision({ data: receipt, error: null, meta: { request_id: 'main' } }, id(4)), e => e.kind === 'protocol')
})

test('016 Import R01 accepts main assessment metadata and rejects foreign Store/date', async t => {
  const value = JSON.parse(readFileSync('shelfcash_FE_handoff_869eaec9/examples/r01-default-blocked-response.json', 'utf8'))
  // The published example includes five actions; this controlled response projects actions=planning.
  value.data.actions = value.data.actions.filter(action => action.action === 'planning')
  t.mock.method(globalThis, 'fetch', async () => json(value))
  const store = value.data.store_id, date = value.data.evaluated_forecast_start_date
  const response = await readImportReadiness('https://qa.invalid', store, date, new AbortController().signal)
  assert.deepEqual(response.planning_assessment, value.data.planning_assessment)
  await assert.rejects(readImportReadiness('https://qa.invalid', id(100), date, new AbortController().signal), e => e.kind === 'protocol')
  await assert.rejects(readImportReadiness('https://qa.invalid', store, '2026-10-25', new AbortController().signal), e => e.kind === 'protocol')
})
