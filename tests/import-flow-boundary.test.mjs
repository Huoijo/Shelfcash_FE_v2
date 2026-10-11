import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createImportFlowDataSource } from '../src/features/import-data/importFlow.data'
import {
  validateImportCompletion, validateImportJob, validateMappingOptions, validateMappingQueue,
  validateMappingSummary, validatePreviewBundle, validateProcessReceipt,
} from '../src/features/import-data/importFlow.validation'
import { configureHttpSession, CsrfTokenUnavailableError, HttpError } from '../src/shared/http/httpClient'

const id = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`
const IMPORT = id(1), STORE = id(2), SHEET = id(3), MAPPING = id(4), PREVIEW = id(5), JOB = id(6), KEY = id(7), FILE = id(9)
const digest = `sha256:${'a'.repeat(64)}`
const at = '2026-10-11T01:00:00+00:00'
const pagination = { limit: 50, total_count: 0, next_cursor: null }
const meta = { request_id: 'flow-boundary-qa', warnings: [], pagination, poll_after_ms: null }
const envelope = (data, extras = {}) => ({ data, meta: { ...meta, ...extras }, error: null })
const progress = { total_fields: 1, completed_fields: 1, unresolved: 0 }
const file = () => ({ client_file_id: id(10), file_id: FILE, filename: 'inventory.csv', type: 'csv',
  size_bytes: 8, content_digest: digest, upload_status: 'uploaded', error: null, parse_status: 'parsed' })
const sheet = () => ({ file_id: FILE, sheet_id: SHEET, name: 'Sheet', schema_signature: 'count-signature',
  row_count: 1, headers: ['on_hand'], profile_id: null, selected_type: 'inventory_count', suggested_type: null,
  classification_origin: 'MANUAL', confidence: null, ignored: false, ignore_reason: null, shared_field_bindings: [], import_values: [] })
const summary = () => ({ import_id: IMPORT, analysis_id: id(8), mapping_revision: 'opaque mapping revision', progress,
  files: [file()], sheets: [sheet()], binding_refs: [], profile_proposals: [], approved_profiles: [], approved_contexts: [],
  can_preview: true, blockers: [], allowed_actions: ['preview'], warnings: [] })
const issue = () => ({ mapping_id: MAPPING, sheet_id: SHEET, issue_type: 'column', code: 'AMBIGUOUS',
  source_header: 'on_hand', samples: ['<script>text only</script>'], status: 'needs_confirmation', target_field: null,
  suggested_target_field: 'on_hand', suggestion_origin: 'RULE', confidence: null,
  source_location: { file_id: FILE, sheet_id: SHEET, source_column_index: 0 },
  resolution_origin: 'UNRESOLVED', profile_ref: null, resolution: null, resolved_by: null, ignored: false })
const queue = () => ({ items: [issue()], counts: progress })
const field = () => ({ key: 'on_hand', type: 'decimal', requiredness: 'required', unit_semantics: null,
  support: 'supported', available: true, reason_code: null, label: 'Observed stock', description: '', aliases: [],
  conditional_requirements: [], nullable: false, input_sources: ['excel'], allowed_shared_scopes: [], input_help: '',
  value_role: 'canonical_candidate' })
const options = () => ({ schema: 'inventory_count', schema_version: 'import_schema/1', schema_context_id: SHEET,
  mapping_revision: 'opaque mapping revision', duplicate_mapping_allowed: false, options: [field()],
  schemas: [{ schema_id: 'inventory_count', label: 'Inventory count', description: '', supported: true, fields: [field()] }] })
const updated = () => ({ mapping_id: MAPPING, status: 'resolved', mapping_revision: 'next mapping', progress,
  sheets: [sheet()], proposal_revision: 'proposal-v2', approval_required: true })
const process = (phase) => ({ import_id: IMPORT, status: phase === 'preview' ? 'previewing' : 'committing',
  phase, job_id: JOB, import_revision: 'opaque import revision', job_status: 'queued',
  ...(phase === 'commit' ? { commit_id: id(13), preview_id: PREVIEW, effective_plan_digest: digest } : {}) })
const job = () => ({ job_id: JOB, operation: 'import_preview', status: 'queued', stage: 'queued', progress: null,
  created_at: at, started_at: null, completed_at: null, context: { import_id: IMPORT, store_id: STORE }, result: null, error: null })
const previewSummary = () => ({ preview_id: PREVIEW, digest, created_at: at, source_set_version: 'source-set', mapping_bindings: [],
  policy_version: 'import_mapping_policy/1', mode: 'atomic', validation_status: 'ready', can_commit: false, required_actions: [],
  groups: [], counts: { NEW: 0, UNCHANGED: 0, CHANGED: 1, INVALID: 0, CONFLICT: 0 }, blockers: [], warnings: [], confirmed_resolutions_version: null })
const previewRow = () => ({ row_id: id(11), source_location: { file_id: FILE, sheet_id: SHEET, row_number: 2 },
  classification: 'CHANGED', proposed_action: 'COUNT_CORRECTION', entity_refs: { lot_id: id(12) },
  before: { domain: 'inventory_count', ingredient_id: id(14), lot_id: id(12), on_hand: '12', unit: 'l', observed_at: at, reason: 'Observed count' },
  after: { domain: 'inventory_count', ingredient_id: id(14), lot_id: id(12), on_hand: '10', unit: 'l', observed_at: at, reason: 'Observed count' },
  changes: [{ field: 'on_hand', before: '12', after: '10', delta: '-2' }],
  provenance: { on_hand: { origin: 'SOURCE_EXPLICIT', applied_rule_ids: [] } }, blockers: [], warnings: [], confirmation_required: true })
const confirmation = () => ({ version: 'import_review/1', confirmation_id: id(15), import_id: IMPORT, preview_id: PREVIEW,
  preview_digest: digest, file_set_version: 'source-set', source_digest: digest, mapping_revision: 'mapping opaque',
  binding_digest: digest, reviewed_import_revision: 'import opaque', read_set_digest: digest,
  confirmed_by: id(16), confirmed_at: at, reason: 'Đã review', content_digest: digest })
const previewRead = () => ({ import_id: IMPORT, display_number: 'IMP-QA', store_id: STORE, data_date: '2026-10-11',
  status: 'preview_ready', import_revision: 'opaque import revision', created_at: at, imported_at: at, file_count: 1,
  file_set_version: 'source-set', active_job_id: null, files: [file()], files_page: { ...pagination, total_count: 1 },
  source_set: { version: 'source-set', sealed: true, accepted_file_ids: [FILE], digest }, allowed_actions: ['preview'],
  completion_available: false, configurations: null, review_confirmation: null, confirmation_usable: false,
  quota: { accepted_file_count: 1, accepted_total_bytes: 8, remaining_file_slots: 19, remaining_bytes: 100 * 1024 ** 2 - 8 },
  preview: { summary: previewSummary(), rows: [previewRow()], rows_page: { ...pagination, total_count: 1 }, stale: false } })
const completion = () => ({ import_id: IMPORT, data_date: '2026-10-11', status: 'completed', outcome: 'no_changes', mode: 'atomic', completed_at: at,
  commit_id: id(13), preview_id: PREVIEW, effective_plan_digest: digest, mapping_bindings: [],
  summary: { files: 1, sheets: 1, rows: 1, mapped_fields: 1, errors: 0, warnings: 0,
    counts: { NEW: 0, UNCHANGED: 1, CHANGED: 0, INVALID: 0, CONFLICT: 0 }, inserted_record_count: 0, changed_record_count: 0, no_op_count: 1 },
  updated_resources: { inventory: { updated: false, affected_ingredient_count: null, changed_record_count: null },
    menu: { updated: false, affected_product_count: 0, changed_record_count: 0 }, sales: { updated: false, added_record_count: 0, changed_record_count: 0 },
    catalog: { created_product_count: 0, created_ingredient_count: 0 } },
  readiness: { evaluated_at: at, as_of_date: '2026-10-11', data_version: 'facts-v1', actions: [],
    evaluated_actions: [], omitted_actions: [{ action: 'inventory', reason: 'NOT_AUTHORIZED' }] },
  audit_reference: id(17), canonical_references: [] })
const source = () => createImportFlowDataSource({ dataSource: 'api', apiBaseUrl: 'https://qa.invalid' })
function fetchWith(t, callback) {
  const original = globalThis.fetch; globalThis.fetch = callback
  t.after(() => { globalThis.fetch = original })
}
const respond = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })
const session = (t) => t.after(configureHttpSession({ getCsrfToken: () => 'session-csrf', onUnauthenticated() {} }))

test('M01 consumes current flat files and top-level sheets with full profile detail query', async (t) => {
  fetchWith(t, async (url, init) => {
    const params = new URL(url).searchParams
    assert.equal(params.get('include_clean_sheets'), 'true')
    assert.equal(params.get('include_profile_details'), 'true')
    assert.equal(init.credentials, 'include')
    return respond(envelope(summary()))
  })
  const result = await source().summary(IMPORT)
  assert.equal(result.files[0].file_id, result.sheets[0].file_id)
  assert.deepEqual(result.progress, progress)
  assert.deepEqual(result.unsupportedFields, [])
  const legacy = summary(); legacy.files[0].sheets = [sheet()]
  assert.throws(() => validateMappingSummary(envelope(legacy), IMPORT), HttpError)
  assert.throws(() => validateMappingSummary(envelope({ ...summary(), import_id: id(99) }), IMPORT), HttpError)
})

test('M02 uses batch counts, exact issue fields and signed cursor filters without invented revision/histogram', async (t) => {
  fetchWith(t, async (url) => {
    const params = new URL(url).searchParams
    assert.equal(params.get('cursor'), 'cursor + opaque')
    assert.equal(params.get('sheet_id'), SHEET)
    assert.equal(params.get('review_only'), 'false')
    return respond(envelope(queue(), { pagination: { limit: 50, total_count: 30, next_cursor: 'next' } }))
  })
  const result = await source().queue(IMPORT, { sheet_id: SHEET, cursor: 'cursor + opaque', review_only: false })
  assert.equal(result.items[0].samples[0], '<script>text only</script>')
  assert.deepEqual(result.counts, progress)
  assert.equal(result.pagination.total_count, 30)
  assert.equal(result.mapping_revision, undefined)
  const legacy = queue(); legacy.filter_counts = { all: 1 }
  assert.throws(() => validateMappingQueue(envelope(legacy)), HttpError)
  const malformed = queue(); malformed.items[0].resolution_origin = null
  assert.throws(() => validateMappingQueue(envelope(malformed)), HttpError)
})

test('M03 validates typed requiredness, nullable selection and per-sheet availability', () => {
  const result = validateMappingOptions(envelope(options()))
  assert.equal(result.options[0].requiredness, 'required')
  assert.equal(result.options[0].unit_semantics, null)
  assert.equal(result.schemas[0].schema_id, 'inventory_count')
  assert.deepEqual(result.unsupportedFields, [])
  assert.equal(validateMappingOptions(envelope({ ...options(), schema: null })).schema, null)
  const blocked = options(); blocked.options[0].available = false; blocked.options[0].reason_code = 'TARGET_ALREADY_BOUND'
  assert.equal(validateMappingOptions(envelope(blocked)).options[0].available, false)
  const invented = options(); invented.options[0].requiredness = { condition: 'invented' }
  assert.throws(() => validateMappingOptions(envelope(invented)), HttpError)
  assert.throws(() => validateMappingOptions(envelope({ ...options(), duplicate_mapping_allowed: true })), HttpError)
  const compact = options(); delete compact.schemas
  for (const key of ['aliases', 'conditional_requirements', 'input_sources', 'allowed_shared_scopes']) delete compact.options[0][key]
  const defaults = validateMappingOptions(envelope(compact))
  assert.deepEqual(defaults.schemas, [])
  assert.deepEqual(defaults.options[0].input_sources, ['excel'])
  assert.deepEqual(defaults.options[0].allowed_shared_scopes, [])
})

test('M04 target writes use only target_field and quoted mapping CAS, never import CAS', async (t) => {
  session(t)
  fetchWith(t, async (url, init) => {
    assert.equal(url, `https://qa.invalid/api/v1/imports/${IMPORT}/mappings/${MAPPING}`)
    assert.equal(init.method, 'PATCH'); assert.equal(init.headers.get('If-Match'), '"mapping opaque"')
    assert.equal(init.headers.get('Idempotency-Key'), KEY); assert.equal(init.headers.get('X-CSRF-Token'), 'session-csrf')
    assert.deepEqual(JSON.parse(init.body), { target_field: 'on_hand' })
    return respond(envelope(updated()))
  })
  assert.equal((await source().confirm(IMPORT, MAPPING, { key: KEY, mappingRevision: 'mapping opaque', targetField: 'on_hand' })).approval_required, true)
})

test('M04 typed resolutions preserve false/zero/null and classification IGNORE acknowledgment', async (t) => {
  session(t)
  const payloads = [
    { kind: 'source_context', source_system_key: 'pos.synthetic', report_type: 'daily', evidence_reference: 'input review' },
    { kind: 'identity_binding', canonical_id: id(18) },
    { kind: 'declared_conversion', from_unit: 'g', to_unit: 'kg', factor: { numerator: '1', denominator: '1000' }, evidence_reference: 'declared' },
    { kind: 'ignored_optional_field', evidence_reference: 'unused optional column' },
    { kind: 'new_entity_proposal', entity: 'supplier', source_business_key: 'SOURCE-SUPPLIER', metadata: { name: 'Supplier example', active: true }, evidence_reference: 'Reviewed supplier identity' },
    { kind: 'sheet_type', sheet_type: null, ignored: true, acknowledgment: true, reason: 'Whole sheet deliberately excluded' },
    { kind: 'shared_value', target_field: 'reason', scope: 'IMPORT_VALUE', value: 'Observed count', evidence_reference: 'review' },
  ]
  let expected
  fetchWith(t, async (_url, init) => { assert.deepEqual(JSON.parse(init.body), { resolution: expected }); return respond(envelope(updated())) })
  for (const payload of payloads) { expected = payload; await source().resolve(IMPORT, MAPPING, { key: KEY, mappingRevision: 'mapping opaque', resolution: payload }) }
  for (const value of [0, false, null]) {
    expected = { kind: 'shared_value', target_field: 'on_hand', scope: 'PROFILE_CONSTANT', value, evidence_reference: 'explicit scalar' }
    await source().resolve(IMPORT, MAPPING, { key: KEY, mappingRevision: 'mapping opaque', resolution: expected })
  }
})

test('invalid resolution cross-fields and commit confirmation sets fail before writes', async (t) => {
  session(t)
  let calls = 0
  fetchWith(t, async () => { calls++; throw new Error('must not fetch') })
  const data = source(), intent = { key: KEY, mappingRevision: 'mapping opaque' }
  for (const resolution of [
    { kind: 'sheet_type', sheet_type: null, ignored: true, acknowledgment: false, reason: 'Intentional exclude' },
    { kind: 'shared_value', target_field: 'on_hand', scope: 'IMPORT_VALUE', value: 0, evidence_reference: 'explicit zero', replace_source_column_index: 0, acknowledgment: false },
    { kind: 'declared_conversion', from_unit: 'g', to_unit: 'kg', factor: { numerator: '0', denominator: '1000' }, evidence_reference: 'invalid zero factor' },
    { kind: 'new_entity_proposal', entity: 'ingredient', source_business_key: 'SOURCE-KEY', metadata: { name: 'Supplier-shaped', active: true }, evidence_reference: 'wrong entity metadata' },
  ]) await assert.rejects(data.resolve(IMPORT, MAPPING, { ...intent, resolution }))
  const commit = { key: KEY, importRevision: 'import opaque', previewId: PREVIEW, previewDigest: digest, reason: 'Reviewed', resolutions: [] }
  await assert.rejects(data.commit(IMPORT, { ...commit, supplierChanges: [{ action_id: id(22), reason: 'A' }, { action_id: id(22), reason: 'B' }] }))
  await assert.rejects(data.commit(IMPORT, { ...commit, resolutions: [{ row_id: id(23), action: 'confirm_disjoint_merge',
    report_business_key: 'REPORT', evidence_reference: 'Evidence', reason: 'Reviewed', disjoint_assertion: null }] }))
  await assert.rejects(data.commit(IMPORT, { ...commit, supplierChanges: Array.from({ length: 100 }, (_, index) => ({ action_id: id(100 + index), reason: 'a'.repeat(1000) })) }))
  assert.equal(calls, 0)
})

test('N5 activation uses lifecycle CAS and explicit expected active version nullable', async (t) => {
  session(t)
  const PROFILE = id(19)
  const decision = { decision: 'approve_activate', proposal_revision: 'proposal-v1', expected_active_version: null, reason: 'Full profile reviewed' }
  fetchWith(t, async (url, init) => {
    assert.equal(url, `https://qa.invalid/api/v1/stores/${STORE}/mapping-profiles/${PROFILE}/decisions`)
    assert.equal(init.headers.get('If-Match'), '"lifecycle-v1"')
    assert.deepEqual(JSON.parse(init.body), decision)
    return respond(envelope({ profile_id: PROFILE, approved_version: 'active-v1', active_version: 'active-v1',
      lifecycle_revision: 'lifecycle-v2', decision_id: id(20), decided_at: at, audit_id: id(21) }))
  })
  assert.equal((await source().decideProfile(STORE, PROFILE, { key: KEY, lifecycleRevision: 'lifecycle-v1', decision })).active_version, 'active-v1')
})

test('mutations refuse missing CSRF and unsafe IDs/revision headers before fetch', async (t) => {
  let calls = 0
  fetchWith(t, async () => { calls++; throw new Error('must not fetch') })
  const data = source()
  await assert.rejects(data.preview(IMPORT, { key: KEY, importRevision: 'v1', mappingRevision: 'm1' }), CsrfTokenUnavailableError)
  await assert.rejects(data.preview(IMPORT, { key: 'fake-key', importRevision: 'v1', mappingRevision: 'm1' }))
  await assert.rejects(data.confirm(IMPORT, MAPPING, { key: KEY, mappingRevision: 'v1\r\nInjected: bad', targetField: 'on_hand' }))
  await assert.rejects(data.readPreview(IMPORT, { previewId: 'not-canonical' }))
  await assert.rejects(data.queue(IMPORT, { status: 'invented' }))
  assert.equal(calls, 0)
})

test('I05 preview, synchronous confirm_review and commit have distinct bodies and receipts', async (t) => {
  session(t)
  let phase = 'preview'
  fetchWith(t, async (url, init) => {
    assert.equal(url, `https://qa.invalid/api/v1/imports/${IMPORT}/process`)
    const body = JSON.parse(init.body); assert.equal(body.phase, phase)
    if (phase === 'preview') assert.deepEqual(body, { phase: 'preview', mapping_revision: 'mapping opaque' })
    if (phase === 'confirm_review') {
      assert.deepEqual(body, { phase: 'confirm_review', preview_id: PREVIEW, preview_digest: digest,
        mapping_revision: 'mapping opaque', confirm: true, reason: 'Đã review' })
      return respond(envelope({ phase, import_revision: 'reviewed import revision', confirmation: confirmation(), canonical_commit_supported: true }))
    }
    if (phase === 'commit') {
      assert.deepEqual(body, { phase: 'commit', preview_id: PREVIEW, preview_digest: digest, confirm: true,
        reason: 'Đã kiểm tra', resolutions: [], supplier_changes: [{ action_id: id(22), reason: 'Term reviewed' }] })
      assert.equal(init.headers.get('If-Match'), '"reviewed import revision"')
    }
    return respond(envelope(process(phase), { poll_after_ms: 2000 }), 202)
  })
  assert.equal((await source().preview(IMPORT, { key: KEY, importRevision: 'import opaque', mappingRevision: 'mapping opaque' })).phase, 'preview')
  phase = 'confirm_review'
  const review = await source().confirmReview(IMPORT, { key: KEY, importRevision: 'import opaque', mappingRevision: 'mapping opaque',
    previewId: PREVIEW, previewDigest: digest, reason: 'Đã review' })
  assert.equal(review.phase, 'confirm_review'); assert.equal(review.confirmation.preview_id, PREVIEW)
  phase = 'commit'
  const accepted = await source().commit(IMPORT, { key: KEY, importRevision: review.import_revision, previewId: PREVIEW,
    previewDigest: digest, reason: 'Đã kiểm tra', resolutions: [], supplierChanges: [{ action_id: id(22), reason: 'Term reviewed' }] })
  assert.equal(accepted.commit_id, id(13)); assert.equal(accepted.status, 'committing')
  const missing = process('commit'); delete missing.commit_id
  assert.throws(() => validateProcessReceipt(envelope(missing), IMPORT, 'commit'), HttpError)
})

test('I04 reads pinned preview and configurations, exact rows and offset timestamps', async (t) => {
  fetchWith(t, async (url) => {
    const params = new URL(url).searchParams
    assert.equal(params.get('preview_id'), PREVIEW); assert.equal(params.get('rows_cursor'), 'next rows')
    assert.equal(params.get('classification'), 'CHANGED'); assert.equal(params.get('rows_limit'), null)
    assert.ok(params.get('include')?.includes('configurations'))
    return respond(envelope(previewRead()))
  })
  const result = await source().readPreview(IMPORT, { previewId: PREVIEW, rowsCursor: 'next rows', classification: 'CHANGED' })
  assert.equal(result.preview.rows[0].after.on_hand, '10')
  assert.equal(result.preview.stale, false)
  assert.deepEqual(result.unsupportedFields, [])
  const switched = previewRead(); switched.preview.summary.preview_id = id(99)
  assert.throws(() => validatePreviewBundle(envelope(switched), IMPORT, PREVIEW), HttpError)
  const malformed = previewRead(); malformed.preview.rows[0].after.on_hand = 10
  assert.throws(() => validatePreviewBundle(envelope(malformed), IMPORT, PREVIEW), HttpError)
})

test('J01 failed HTTP200 is terminal diagnostics; polling hints are not success', async (t) => {
  fetchWith(t, async () => respond(envelope({ ...job(), status: 'failed', stage: 'failed', completed_at: at,
    error: { code: 'VALIDATION_FAILED', message: 'Rejected', details: { approval_request_allowed: false, source_locations: [], blockers: [] } } }, { poll_after_ms: 0 })))
  const failed = await source().job(JOB)
  assert.equal(failed.status, 'failed'); assert.equal(failed.result, null)
  assert.throws(() => validateImportJob(envelope(job(), { poll_after_ms: 0 }), JOB), HttpError)
  assert.throws(() => validateImportJob(envelope({ ...job(), progress: 2 }, { poll_after_ms: 2000 }), JOB), HttpError)
})

test('I06 retained receipt distinguishes null impacts, exact counts, readiness omission and audit IDs', async (t) => {
  fetchWith(t, async () => respond(envelope(completion())))
  const result = await source().completion(IMPORT)
  assert.equal(result.updated_resources.inventory.affected_ingredient_count, null)
  assert.equal(result.summary.no_op_count, 1); assert.equal(result.summary.counts.UNCHANGED, 1)
  assert.equal(result.readiness.omitted_actions[0].reason, 'NOT_AUTHORIZED')
  const missing = completion(); delete missing.readiness
  assert.throws(() => validateImportCompletion(envelope(missing), IMPORT), HttpError)
  const partial = completion(); partial.summary.errors = 1
  assert.throws(() => validateImportCompletion(envelope(partial), IMPORT), HttpError)
})

test('API errors never fall back to mock; aborted reads never fetch', async (t) => {
  assert.throws(() => createImportFlowDataSource({ dataSource: 'mock', apiBaseUrl: '' }))
  let calls = 0, mockCalls = 0
  const mockSource = { async summary() { mockCalls++; return summary() } }
  fetchWith(t, async () => { calls++; return respond({ data: null, meta, error: { code: 'PERMISSION_DENIED', message: 'Forbidden', details: {} } }, 403) })
  const api = createImportFlowDataSource({ dataSource: 'api', apiBaseUrl: 'https://qa.invalid', mockSource })
  await assert.rejects(api.summary(IMPORT), (error) => error instanceof HttpError && error.status === 403)
  const controller = new AbortController(); controller.abort()
  await assert.rejects(api.summary(IMPORT, controller.signal), (error) => error.name === 'AbortError')
  assert.equal(calls, 1); assert.equal(mockCalls, 0)
})
