import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createImportDataSource } from '../src/features/import-data/importData.data'
import { ImportBatchWorkflow } from '../src/features/import-data/importData.workflow'
import { mockImportStoreId } from '../src/features/import-data/importData.fixtures'
import { HttpError } from '../src/shared/http/httpClient'
import { validateImportFiles } from '../src/features/import-data/importData.files'
import { validateImportBatch, validateImportDraft, validateImportUpload } from '../src/features/import-data/importData.validation'

const id = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`
const STORE = id(1)
const IMPORT = id(2)
const SOURCE = id(3)
const CLIENT = id(4)
const KEY = id(5)
const LIMIT = 100 * 1024 ** 2
const digest = `sha256:${'a'.repeat(64)}`
const meta = { request_id: 'qa-request', warnings: [], pagination: null, poll_after_ms: null }
const envelope = (data) => ({ data, meta, error: null })
const problem = (code, details = {}) => ({ data: null, meta, error: { code, message: code, details } })
const csv = (name = 'source.csv', bytes = 'a,b\n1,2\n') => new File([bytes], name, { type: 'text/csv' })
const uploaded = (overrides = {}) => ({
  client_file_id: CLIENT, file_id: SOURCE, filename: 'source.csv', type: 'csv',
  size_bytes: 8, content_digest: digest, upload_status: 'uploaded', error: null,
  ...overrides,
})
const rejected = (overrides = {}) => ({
  client_file_id: id(6), file_id: null, filename: 'bad.csv', type: 'unknown',
  size_bytes: 7, content_digest: null, upload_status: 'rejected',
  error: { code: 'INVALID_FILE_TYPE', message: 'INVALID_FILE_TYPE', approval_request_allowed: false },
  ...overrides,
})
const draft = () => ({
  import_id: IMPORT, display_number: 'IMP-QA', store_id: STORE, data_date: '2026-10-10',
  status: 'draft', import_revision: 'draft opaque', file_set_version: 'sources opaque',
  created_at: '2026-10-10T01:00:00Z', imported_at: null, file_count: 0,
})
const read = (overrides = {}) => ({
  ...draft(),
  active_job_id: null,
  files: [],
  files_page: { limit: 50, next_cursor: null, total_count: 0 },
  source_set: { version: 'sources opaque', sealed: false, accepted_file_ids: [], digest },
  allowed_actions: ['upload'], preview: null, completion_available: false,
  configurations: null, review_confirmation: null, confirmation_usable: false,
  quota: { accepted_file_count: 0, accepted_total_bytes: 0, remaining_file_slots: 20, remaining_bytes: LIMIT },
  ...overrides,
})
const acceptedRead = (overrides = {}) => read({
  status: 'uploaded', import_revision: 'uploaded opaque', file_set_version: 'upload evidence opaque',
  imported_at: '2026-10-10T01:01:00Z', file_count: 1,
  files: [{ ...uploaded(), parse_status: 'not_started' }],
  files_page: { limit: 50, next_cursor: null, total_count: 1 },
  source_set: { version: 'upload evidence opaque', sealed: false, accepted_file_ids: [SOURCE], digest },
  allowed_actions: ['upload', 'analyze'],
  quota: { accepted_file_count: 1, accepted_total_bytes: 8, remaining_file_slots: 19, remaining_bytes: LIMIT - 8 },
  ...overrides,
})
const uploadResult = (items = [uploaded()]) => ({
  import_id: IMPORT, import_revision: 'upload response opaque',
  file_set_version: 'upload receipt opaque', items, warnings: [],
})
const api = (options = {}) => createImportDataSource({
  dataSource: 'api', apiBaseUrl: 'https://qa.invalid', getCsrfToken: () => 'qa-session-owned-token', ...options,
})

function stubFetch(t, handler) {
  const original = globalThis.fetch
  globalThis.fetch = handler
  t.after(() => { globalThis.fetch = original })
}

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
})

test('current input Notice needs no invented details and accepts aware timestamps', () => {
  const notice = { code: 'DUPLICATE_CONTENT', severity: 'WARNING', message: 'Nguồn trùng bytes.',
    field: null, entity: null, impact: null, source_location: null }
  const current = { ...draft(), created_at: '2026-10-10T08:00:00+07:00' }
  assert.equal(validateImportDraft({ data: current, meta: { ...meta, warnings: [notice] }, error: null }, STORE, current.data_date).created_at, current.created_at)
  const intent = { key: KEY, items: [{ clientFileId: CLIENT, file: csv() }] }
  const result = validateImportUpload(envelope({ ...uploadResult(), warnings: [notice] }), IMPORT, intent)
  assert.deepEqual(result.warnings, [notice])
  assert.equal(validateImportBatch({ data: read(), meta: { ...meta, warnings: [{ ...notice, severity: 'ERROR' }] }, error: null }, IMPORT).import_id, IMPORT)
  assert.throws(() => validateImportDraft({ data: { ...current, created_at: '2026-10-10T08:00:00' }, meta, error: null }, STORE, current.data_date), HttpError)
  assert.throws(() => validateImportUpload(envelope({ ...uploadResult(), warnings: [{ ...notice, severity: 'INFO' }] }), IMPORT, intent), HttpError)
  const compactUpload = uploadResult(); delete compactUpload.warnings
  assert.deepEqual(validateImportUpload(envelope(compactUpload), IMPORT, intent).warnings, [])
  const compactBatch = read()
  for (const key of ['completion_available', 'configurations', 'review_confirmation', 'confirmation_usable']) delete compactBatch[key]
  const currentBatch = validateImportBatch(envelope(compactBatch), IMPORT)
  assert.equal(currentBatch.confirmation_usable, false)
  assert.equal(currentBatch.completion_available, false)
  assert.equal(currentBatch.review_confirmation, null)
  assert.throws(() => validateImportBatch(envelope({ ...compactBatch, confirmation_usable: null }), IMPORT), HttpError)
})

test('resume hydrates retained authorized state and all file pages without mutations', async () => {
  const first = acceptedRead({ source_set: { version: 'upload evidence opaque', sealed: true, accepted_file_ids: [SOURCE], digest },
    status: 'review_required', allowed_actions: ['mapping.read'], files_page: { limit: 1, next_cursor: 'next-page', total_count: 2 } })
  const second = { ...first, files: [{ ...rejected(), parse_status: 'failed' }], files_page: { limit: 1, next_cursor: null, total_count: 2 } }
  const reads = []
  let writes = 0
  const source = { async read(importId, cursor) { reads.push([importId, cursor]); return cursor ? second : first },
    async createDraft() { writes++ }, async upload() { writes++ }, async analyze() { writes++ } }
  const workflow = new ImportBatchWorkflow(source, STORE)
  await workflow.resume(IMPORT)
  const state = workflow.getSnapshot()
  assert.deepEqual(reads, [[IMPORT, undefined], [IMPORT, 'next-page']])
  assert.equal(writes, 0)
  assert.equal(state.draft.import_id, IMPORT)
  assert.equal(state.serverFiles.length, 2)
  assert.equal(state.sealedLocked, true)
  assert.equal(state.fresh, true)
  assert.equal(state.dataDate, first.data_date)
})

test('resume rejects foreign Store and mixed revision pages without hydrating local truth', async () => {
  const foreign = new ImportBatchWorkflow({ async read() { return acceptedRead({ store_id: id(99) }) } }, STORE)
  await foreign.resume(IMPORT)
  assert.equal(foreign.getSnapshot().batch, null)
  assert.match(foreign.getSnapshot().error, /cửa hàng/)
  let reads = 0
  const changed = new ImportBatchWorkflow({ async read() { reads++; return acceptedRead({
    import_revision: reads === 1 ? 'before' : 'after', files_page: { limit: 1, next_cursor: reads === 1 ? 'next' : null, total_count: 2 },
  }) } }, STORE)
  await changed.resume(IMPORT)
  assert.equal(changed.getSnapshot().draft, null)
  assert.equal(changed.getSnapshot().fresh, false)
  assert.match(changed.getSnapshot().error, /thay đổi/)
})

test('I01 is explicit and sends only date with cookie, CSRF and retained UUID key', async (t) => {
  const calls = []
  stubFetch(t, async (url, options) => {
    calls.push({ url, options })
    return jsonResponse(envelope(draft()), 201)
  })
  const source = api()
  assert.equal(calls.length, 0)
  const result = await source.createDraft(STORE, { key: KEY, dataDate: '2026-10-10' })
  assert.equal(result.import_id, IMPORT)
  assert.equal(calls.length, 1)
  const { url, options } = calls[0]
  assert.equal(url, `https://qa.invalid/api/v1/stores/${STORE}/imports`)
  assert.equal(options.method, 'POST')
  assert.equal(options.credentials, 'include')
  assert.equal(options.cache, 'no-store')
  assert.deepEqual(JSON.parse(options.body), { data_date: '2026-10-10' })
  const headers = new Headers(options.headers)
  assert.equal(headers.get('Idempotency-Key'), KEY)
  assert.equal(headers.get('X-CSRF-Token'), 'qa-session-owned-token')
  assert.equal(headers.get('Authorization'), null)
})

test('authenticated mutations refuse a missing real CSRF source before fetch', async (t) => {
  let calls = 0
  stubFetch(t, async () => { calls += 1; throw new Error('unexpected network') })
  const source = api({ getCsrfToken: undefined })
  await assert.rejects(source.createDraft(STORE, { key: KEY, dataDate: '2026-10-10' }))
  await assert.rejects(source.upload(IMPORT, { key: KEY, items: [{ clientFileId: CLIENT, file: csv() }] }))
  await assert.rejects(source.analyze(IMPORT, {
    key: KEY, importRevision: 'opaque', fileSetVersion: 'opaque', acceptedFileIds: [SOURCE], rejectedClientFileIds: [],
  }))
  assert.equal(calls, 0)
})

test('missing Store scope and invalid intent identifiers never send mutations', async (t) => {
  let calls = 0
  stubFetch(t, async () => { calls += 1; throw new Error('unexpected network') })
  const source = api()
  await assert.rejects(source.createDraft('', { key: KEY, dataDate: '2026-10-10' }))
  await assert.rejects(source.createDraft(STORE, { key: 'file-name-is-not-a-key', dataDate: '2026-10-10' }))
  await assert.rejects(source.createDraft(STORE, { key: KEY, dataDate: '2026-02-30' }))
  await assert.rejects(source.upload(IMPORT, { key: KEY, items: [
    { clientFileId: CLIENT, file: csv() }, { clientFileId: CLIENT, file: csv('next.csv') },
  ] }))
  await assert.rejects(source.upload(IMPORT, { key: KEY, items: Array.from({ length: 21 }, (_, index) => ({
    clientFileId: id(100 + index), file: csv(),
  })) }))
  for (const importRevision of ['quoted"token', 'token\r\nInjected: bad', 'non-header-😀']) {
    await assert.rejects(source.analyze(IMPORT, { key: KEY, importRevision, fileSetVersion: 'source',
      acceptedFileIds: [SOURCE], rejectedClientFileIds: [] }))
  }
  assert.equal(calls, 0)
})

test('I02 retains exact multipart pairs and retry identity without JSON or CAS headers', async (t) => {
  const calls = []
  stubFetch(t, async (url, options) => {
    calls.push({ url, options })
    return jsonResponse(envelope(uploadResult([uploaded(), uploaded({ client_file_id: id(7), file_id: id(8), filename: 'next.csv' })])))
  })
  const source = api()
  const intent = { key: KEY, items: [{ clientFileId: CLIENT, file: csv() }, { clientFileId: id(7), file: csv('next.csv') }] }
  await source.upload(IMPORT, intent)
  await source.upload(IMPORT, intent)
  assert.equal(calls.length, 2)
  for (const { url, options } of calls) {
    assert.equal(url, `https://qa.invalid/api/v1/imports/${IMPORT}/files`)
    assert.ok(options.body instanceof FormData)
    assert.deepEqual([...new Set([...options.body.keys()])].sort(), ['client_file_ids[]', 'files[]'])
    assert.deepEqual(options.body.getAll('client_file_ids[]'), [CLIENT, id(7)])
    assert.deepEqual(options.body.getAll('files[]').map((file) => file.name), ['source.csv', 'next.csv'])
    assert.deepEqual(await Promise.all(options.body.getAll('files[]').map((file) => file.text())), ['a,b\n1,2\n', 'a,b\n1,2\n'])
    const headers = new Headers(options.headers)
    assert.equal(headers.get('Idempotency-Key'), KEY)
    assert.equal(headers.get('Content-Type'), null)
    assert.equal(headers.get('If-Match'), null)
    assert.equal(options.credentials, 'include')
  }
})

test('I02 accepts every ordered partial result rather than treating HTTP200 as all accepted', async (t) => {
  stubFetch(t, async () => jsonResponse(envelope(uploadResult([uploaded(), rejected(), uploaded({ client_file_id: id(7), file_id: id(8) })]))))
  const result = await api().upload(IMPORT, { key: KEY, items: [
    { clientFileId: CLIENT, file: csv() }, { clientFileId: id(6), file: csv('bad.csv') }, { clientFileId: id(7), file: csv('next.csv') },
  ] })
  assert.deepEqual(result.items.map((item) => item.upload_status), ['uploaded', 'rejected', 'uploaded'])
  assert.equal(result.items[1].error.code, 'INVALID_FILE_TYPE')
})

test('all-rejected422 becomes committed receipts, unlike request-level422', async (t) => {
  let response = problem('UPLOAD_REJECTED', {
    items: [rejected({ client_file_id: CLIENT })], import_revision: 'rejected revision',
    file_set_version: 'rejected evidence', approval_request_allowed: false,
  })
  stubFetch(t, async () => jsonResponse(response, 422))
  const source = api()
  const intent = { key: KEY, items: [{ clientFileId: CLIENT, file: csv('bad.csv') }] }
  const result = await source.upload(IMPORT, intent)
  assert.equal(result.allRejected, true)
  assert.equal(result.items[0].upload_status, 'rejected')
  assert.equal(result.import_revision, 'rejected revision')
  assert.equal(result.file_set_version, 'rejected evidence')
  response = problem('INVALID_IMPORT_CONFIGURATION', { reason: 'pairing mismatch' })
  await assert.rejects(source.upload(IMPORT, intent), (error) => error instanceof HttpError &&
    error.status === 422 && error.problem?.code === 'INVALID_IMPORT_CONFIGURATION')
  response = problem('UPLOAD_REJECTED', { items: null, approval_request_allowed: false })
  await assert.rejects(source.upload(IMPORT, intent), (error) => error instanceof HttpError && error.kind === 'protocol')
})

test('malformed success, reordered receipts and lost responses never become successful uploads', async (t) => {
  let mode = 'bad-json'
  stubFetch(t, async () => {
    if (mode === 'bad-json') return new Response('not JSON', { status: 200 })
    if (mode === 'lost') throw new TypeError('connection lost')
    return jsonResponse(envelope(uploadResult([uploaded({ client_file_id: id(90) })])))
  })
  const intent = { key: KEY, items: [{ clientFileId: CLIENT, file: csv() }] }
  const source = api()
  await assert.rejects(source.upload(IMPORT, intent), (error) => error instanceof HttpError && error.kind === 'protocol')
  mode = 'wrong-client'
  await assert.rejects(source.upload(IMPORT, intent), (error) => error instanceof HttpError && error.kind === 'protocol')
  mode = 'lost'
  await assert.rejects(source.upload(IMPORT, intent), (error) => error instanceof HttpError && error.kind === 'transport')
})

test('I04 retains whole-batch quota even when page contains only rejected receipts', async (t) => {
  const current = acceptedRead({
    files: [{ ...rejected(), parse_status: 'not_started' }],
    files_page: { limit: 50, next_cursor: 'opaque cursor/with+symbols', total_count: 2 },
  })
  const calls = []
  stubFetch(t, async (url, options) => { calls.push({ url, options }); return jsonResponse(envelope(current)) })
  const source = api({ getCsrfToken: undefined })
  const result = await source.read(IMPORT)
  assert.deepEqual(result.quota, current.quota)
  assert.deepEqual(result.source_set.accepted_file_ids, [SOURCE])
  assert.equal(result.files[0].upload_status, 'rejected')
  await source.read(IMPORT, current.files_page.next_cursor)
  const first = new URL(calls[0].url)
  const next = new URL(calls[1].url)
  assert.equal(first.searchParams.has('files_limit'), false)
  assert.equal(first.searchParams.has('files_cursor'), false)
  assert.equal(next.searchParams.get('files_cursor'), current.files_page.next_cursor)
  assert.equal(next.searchParams.has('files_limit'), false)
  assert.equal(calls[0].options.method ?? 'GET', 'GET')
})

test('I04 runtime validation rejects missing metadata and contradictory full-batch counters', async (t) => {
  let payload = read()
  stubFetch(t, async () => jsonResponse(envelope(payload)))
  const source = api()
  const bad = [
    () => { delete payload.quota },
    () => { payload.quota.accepted_total_bytes = '0' },
    () => { payload.quota.remaining_bytes = -1 },
    () => { payload.quota.accepted_file_count = 21 },
    () => { payload.quota.remaining_file_slots = 19 },
    () => { payload.source_set.version = 'different' },
    () => { payload.source_set.accepted_file_ids = [SOURCE] },
    () => { payload.source_set.digest = 'invented digest' },
    () => { payload.allowed_actions = ['upload', 42] },
    () => { payload.files_page.next_cursor = 42 },
    () => { payload.import_revision = '' },
    () => { payload.import_revision = 'x'.repeat(129) },
    () => { payload.data_date = '0000-01-01' },
    () => { payload.created_at = '2026-02-30T01:00:00Z' },
    () => { payload.files = [{ ...rejected(), parse_status: 'parsed', error: null }] },
    () => { payload.files = [{ ...rejected(), type: ['unknown'], parse_status: 'not_started' }] },
    () => { payload.files = [{ ...rejected(), parse_status: ['not_started'] }] },
  ]
  for (const mutate of bad) {
    payload = read()
    mutate()
    await assert.rejects(source.read(IMPORT), (error) => error instanceof HttpError && error.kind === 'protocol')
  }
})

test('I03 uses full canonical source and rejected IDs with quoted opaque If-Match', async (t) => {
  const calls = []
  stubFetch(t, async (url, options) => {
    calls.push({ url, options })
    return jsonResponse(envelope({ import_id: IMPORT, analysis_id: id(9), job_id: id(10), status: 'analyzing' }), 202)
  })
  await api().analyze(IMPORT, {
    key: KEY, importRevision: 'opaque revision with spaces', fileSetVersion: 'opaque source version',
    acceptedFileIds: [SOURCE, id(8)], rejectedClientFileIds: [id(6), id(7)],
  })
  assert.equal(calls[0].url, `https://qa.invalid/api/v1/imports/${IMPORT}/analyze`)
  assert.equal(new Headers(calls[0].options.headers).get('If-Match'), '"opaque revision with spaces"')
  assert.equal(new Headers(calls[0].options.headers).get('Idempotency-Key'), KEY)
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    file_set_version: 'opaque source version', accepted_file_ids: [SOURCE, id(8)],
    acknowledged_rejected_client_file_ids: [id(6), id(7)],
  })
})

test('HTTP failures remain explicit and API mode never falls back to fixture success', async (t) => {
  let status = 401
  let code = 'UNAUTHENTICATED'
  stubFetch(t, async () => jsonResponse(problem(code, { approval_request_allowed: false }), status))
  const source = api()
  for ([status, code] of [[401, 'UNAUTHENTICATED'], [403, 'PERMISSION_DENIED'], [404, 'RESOURCE_NOT_FOUND'],
    [409, 'IMPORT_STATE_CONFLICT'], [412, 'IMPORT_REVISION_CONFLICT'], [413, 'RESOURCE_LIMIT_EXCEEDED'],
    [422, 'INVALID_IMPORT_CONFIGURATION'], [428, 'PRECONDITION_REQUIRED'], [503, 'SERVICE_UNAVAILABLE']]) {
    await assert.rejects(source.read(IMPORT), (error) => error instanceof HttpError && error.status === status && error.problem?.code === code)
  }
})

test('local extension, per-file and prospective request limits remain preliminary', () => {
  assert.ok(validateImportFiles([csv('source.exe')]))
  assert.ok(validateImportFiles([new File([new Uint8Array(20 * 1024 ** 2 + 1)], 'large.csv')]))
  assert.ok(validateImportFiles(Array.from({ length: 21 }, () => csv())))
  assert.equal(validateImportFiles([csv()]), null)
})

// Workflow scenarios use a controlled source, not a claimed backend runtime.
function workflowFixture() {
  const fixture = { current: read(), calls: { drafts: [], uploads: [], reads: [], analyses: [] } }
  const uploadReceipts = new Map()
  const source = {
    async createDraft(storeId, intent) {
      fixture.calls.drafts.push({ storeId, intent })
      return draft()
    },
    async upload(importId, intent) {
      fixture.calls.uploads.push({ importId, intent })
      if (uploadReceipts.has(intent.key)) return uploadReceipts.get(intent.key)
      const items = intent.items.map((item, index) => uploaded({
        client_file_id: item.clientFileId, file_id: id(100 + fixture.current.file_count + index),
        filename: item.file.name, size_bytes: item.file.size,
      }))
      const allFiles = [...fixture.current.files, ...items.map((item) => ({ ...item, parse_status: 'not_started' }))]
      const acceptedIds = [...fixture.current.source_set.accepted_file_ids, ...items.map((item) => item.file_id)]
      const bytes = fixture.current.quota.accepted_total_bytes + items.reduce((total, item) => total + item.size_bytes, 0)
      const version = `evidence-${fixture.calls.uploads.length}`
      fixture.current = acceptedRead({
        file_count: acceptedIds.length, files: allFiles,
        import_revision: `revision-${fixture.calls.uploads.length}`, file_set_version: version,
        files_page: { limit: 50, next_cursor: null, total_count: allFiles.length },
        source_set: { version, sealed: false, accepted_file_ids: acceptedIds, digest },
        quota: { accepted_file_count: acceptedIds.length, accepted_total_bytes: bytes,
          remaining_file_slots: 20 - acceptedIds.length, remaining_bytes: LIMIT - bytes },
      })
      const result = { import_id: importId, import_revision: fixture.current.import_revision,
        file_set_version: version, items, warnings: [], allRejected: false }
      uploadReceipts.set(intent.key, result)
      return result
    },
    async read(importId, cursor) {
      fixture.calls.reads.push({ importId, cursor })
      return structuredClone(fixture.current)
    },
    async analyze(importId, intent) {
      fixture.calls.analyses.push({ importId, intent })
      fixture.current = { ...fixture.current, status: 'analyzing', active_job_id: id(10),
        source_set: { ...fixture.current.source_set, sealed: true }, allowed_actions: [] }
      return { import_id: importId, analysis_id: id(9), job_id: id(10), status: 'analyzing', poll_after_ms: 2000 }
    },
  }
  fixture.source = source
  fixture.workflow = new ImportBatchWorkflow(source, STORE)
  fixture.workflow.setDataDate('2026-10-10')
  return fixture
}

test('workflow accumulates multiple explicit I02 calls in one batch and preserves server evidence', async () => {
  const { workflow, calls } = workflowFixture()
  const first = csv()
  workflow.setFiles([first])
  assert.equal(calls.drafts.length, 0)
  workflow.setFiles([])
  assert.equal(workflow.getSnapshot().files.length, 0)
  workflow.setFiles([first])
  await workflow.upload()
  let state = workflow.getSnapshot()
  assert.equal(calls.drafts.length, 1)
  assert.equal(calls.reads.length, 2)
  assert.equal(state.files.length, 0)
  assert.equal(state.receipts.length, 1)
  assert.equal(state.batch.quota.accepted_file_count, 1)
  assert.equal(state.batch.quota.accepted_total_bytes, first.size)
  workflow.setDataDate('2026-10-11')
  assert.equal(workflow.getSnapshot().dataDate, '2026-10-10')
  workflow.setFiles([csv('next.csv')])
  await workflow.upload()
  state = workflow.getSnapshot()
  assert.equal(calls.drafts.length, 1)
  assert.deepEqual(calls.uploads.map((call) => call.importId), [IMPORT, IMPORT])
  assert.notEqual(calls.uploads[0].intent.key, calls.uploads[1].intent.key)
  assert.notEqual(calls.uploads[0].intent.items[0].clientFileId, calls.uploads[1].intent.items[0].clientFileId)
  assert.equal(state.batch.quota.accepted_file_count, 2)
  assert.equal(state.batch.quota.remaining_file_slots, 18)
  workflow.setFiles([])
  assert.equal(workflow.getSnapshot().serverFiles.length, 2)
  assert.equal(workflow.getSnapshot().receipts.length, 2)
})

test('workflow missing Store and known draft failure cannot fabricate a batch', async () => {
  const fixture = workflowFixture()
  const missing = new ImportBatchWorkflow(fixture.source, null)
  missing.setFiles([csv()])
  missing.setDataDate('2026-10-10')
  await missing.upload()
  assert.equal(fixture.calls.drafts.length, 0)
  assert.equal(missing.getSnapshot().draft, null)
  assert.match(missing.getSnapshot().error, /cửa hàng/)
  fixture.source.createDraft = async () => { throw new HttpError('contract', 'denied', 403, problem('PERMISSION_DENIED').error) }
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().draft, null)
  assert.equal(fixture.workflow.getSnapshot().retryOperation, null)
  assert.equal(fixture.workflow.getSnapshot().files.length, 1)
})

test('lost upload response retains exact intent while canonical reconciliation prevents accidental new identity', async () => {
  const fixture = workflowFixture()
  const original = fixture.source.upload
  let lost = true
  fixture.source.upload = async (...args) => {
    const result = await original(...args)
    if (lost) { lost = false; throw new HttpError('transport', 'response lost') }
    return result
  }
  const file = csv()
  fixture.workflow.setFiles([file])
  await fixture.workflow.upload()
  const uncertain = fixture.workflow.getSnapshot()
  assert.equal(uncertain.retryOperation, 'upload')
  assert.equal(uncertain.batch.quota.accepted_file_count, 1)
  assert.equal(uncertain.files[0], file)
  fixture.workflow.setFiles([csv('different.csv')])
  fixture.workflow.startNewDraft()
  const retainedReads = fixture.calls.reads.length
  await fixture.workflow.resume(id(999))
  assert.equal(fixture.calls.reads.length, retainedReads)
  assert.equal(fixture.workflow.getSnapshot().draft.import_id, IMPORT)
  assert.equal(fixture.workflow.getSnapshot().retryOperation, 'upload')
  await fixture.workflow.upload()
  assert.equal(fixture.calls.uploads.length, 1)
  assert.equal(fixture.workflow.getSnapshot().files[0], file)
  await fixture.workflow.retry()
  assert.equal(fixture.calls.uploads.length, 2)
  assert.equal(fixture.calls.uploads[0].intent, fixture.calls.uploads[1].intent)
  assert.equal(fixture.calls.uploads[0].intent.items[0].file, file)
  assert.equal(fixture.workflow.getSnapshot().batch.quota.accepted_file_count, 1)
  assert.equal(fixture.workflow.getSnapshot().retryOperation, null)
  assert.equal(fixture.workflow.getSnapshot().files.length, 0)
})

test('an unreadable HTTP422 upload receipt remains uncertain and retains the exact retry intent', async () => {
  const fixture = workflowFixture()
  const original = fixture.source.upload
  let unreadable = true
  fixture.source.upload = async (...args) => {
    const result = await original(...args)
    if (unreadable) { unreadable = false; throw new HttpError('http', 'gateway returned an unreadable body', 422) }
    return result
  }
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().retryOperation, 'upload')
  assert.equal(fixture.workflow.getSnapshot().batch.quota.accepted_file_count, 1)
  await fixture.workflow.retry()
  assert.equal(fixture.calls.uploads[0].intent, fixture.calls.uploads[1].intent)
  assert.equal(fixture.workflow.getSnapshot().batch.quota.accepted_file_count, 1)
})

test('I04 reads from a different Store or date cannot establish upload authority', async () => {
  for (const mismatch of [{ store_id: id(999) }, { data_date: '2026-10-11' }]) {
    const fixture = workflowFixture()
    fixture.current = { ...fixture.current, ...mismatch }
    fixture.workflow.setFiles([csv()])
    await fixture.workflow.upload()
    assert.equal(fixture.calls.uploads.length, 0)
    assert.equal(fixture.workflow.getSnapshot().fresh, false)
    assert.equal(fixture.workflow.getSnapshot().batch, null)
    assert.equal(fixture.workflow.getSnapshot().retryOperation, null)
    assert.match(fixture.workflow.getSnapshot().error, /cửa hàng|ngày/)
  }
})

test('lost I01 response reuses draft identity and waits for explicit upload after reconciliation', async () => {
  const fixture = workflowFixture()
  const original = fixture.source.createDraft
  let lost = true
  fixture.source.createDraft = async (...args) => {
    const result = await original(...args)
    if (lost) { lost = false; throw new HttpError('transport', 'response lost') }
    return result
  }
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().retryOperation, 'draft')
  assert.equal(fixture.calls.uploads.length, 0)
  await fixture.workflow.retry()
  assert.equal(fixture.calls.drafts[0].intent, fixture.calls.drafts[1].intent)
  assert.equal(fixture.workflow.getSnapshot().draft.import_id, IMPORT)
  assert.equal(fixture.calls.uploads.length, 0)
  await fixture.workflow.upload()
  assert.equal(fixture.calls.drafts.length, 2)
  assert.equal(fixture.calls.uploads.length, 1)
})

test('known upload receipt followed by read failure never offers mutation retry', async () => {
  const fixture = workflowFixture()
  const original = fixture.source.read
  let count = 0
  fixture.source.read = async (...args) => {
    count += 1
    if (count === 2) throw new HttpError('transport', 'read lost')
    return original(...args)
  }
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().retryOperation, null)
  assert.equal(fixture.workflow.getSnapshot().fresh, false)
  assert.equal(fixture.workflow.getSnapshot().receipts.length, 1)
  assert.equal(fixture.workflow.getSnapshot().files.length, 0)
  await fixture.workflow.retry()
  await fixture.workflow.refresh()
  assert.equal(fixture.calls.uploads.length, 1)
  assert.equal(fixture.workflow.getSnapshot().batch.quota.accepted_file_count, 1)
})

test('committed all-rejected result preserves receipts and refreshes quota without accepted bytes', async () => {
  const fixture = workflowFixture()
  fixture.source.upload = async (importId, intent) => {
    fixture.calls.uploads.push({ importId, intent })
    const items = intent.items.map((item) => rejected({ client_file_id: item.clientFileId, filename: item.file.name }))
    fixture.current = read({
      import_revision: 'rejected new revision', file_set_version: 'rejected new evidence',
      source_set: { version: 'rejected new evidence', sealed: false, accepted_file_ids: [], digest },
      files: items.map((item) => ({ ...item, parse_status: 'not_started' })),
      files_page: { limit: 50, next_cursor: null, total_count: items.length },
    })
    return { import_id: importId, import_revision: fixture.current.import_revision,
      file_set_version: fixture.current.file_set_version, items, warnings: [], allRejected: true }
  }
  fixture.workflow.setFiles([csv('bad.csv')])
  await fixture.workflow.upload()
  const state = fixture.workflow.getSnapshot()
  assert.equal(state.receipts.length, 1)
  assert.equal(state.receipts[0].upload_status, 'rejected')
  assert.equal(state.batch.import_revision, 'rejected new revision')
  assert.equal(state.batch.quota.accepted_file_count, 0)
  assert.equal(state.batch.quota.accepted_total_bytes, 0)
  assert.equal(state.batch.quota.remaining_file_slots, 20)
  assert.equal(state.files.length, 0)
  assert.equal(state.retryOperation, null)
})

test('remaining quota stays advisory and ordered partial server admission becomes the canonical outcome', async () => {
  const fixture = workflowFixture()
  const existing = Array.from({ length: 19 }, (_, index) => ({
    ...uploaded({ client_file_id: id(700 + index), file_id: id(800 + index) }), parse_status: 'not_started',
  }))
  fixture.current = acceptedRead({
    file_count: 19, files: existing, files_page: { limit: 50, next_cursor: null, total_count: 19 },
    source_set: { version: 'upload evidence opaque', sealed: false, accepted_file_ids: existing.map((file) => file.file_id), digest },
    quota: { accepted_file_count: 19, accepted_total_bytes: 152, remaining_file_slots: 1, remaining_bytes: LIMIT - 152 },
  })
  const original = fixture.source.upload
  fixture.source.upload = async (importId, intent) => {
    const accepted = await original(importId, { ...intent, items: intent.items.slice(0, 1) })
    const item = rejected({ client_file_id: intent.items[1].clientFileId, filename: intent.items[1].file.name,
      size_bytes: intent.items[1].file.size,
      error: { code: 'RESOURCE_LIMIT_EXCEEDED', message: 'RESOURCE_LIMIT_EXCEEDED', approval_request_allowed: false } })
    fixture.current.files.push({ ...item, parse_status: 'not_started' })
    fixture.current.files_page.total_count += 1
    return { ...accepted, items: [...accepted.items, item] }
  }
  fixture.workflow.setFiles([csv(), csv('second.csv')])
  await fixture.workflow.upload()
  const state = fixture.workflow.getSnapshot()
  assert.deepEqual(state.receipts.map((item) => item.upload_status), ['uploaded', 'rejected'])
  assert.equal(state.batch.quota.accepted_file_count, 20)
  assert.equal(state.batch.quota.accepted_total_bytes, 160)
  assert.equal(state.batch.quota.remaining_file_slots, 0)
  assert.equal(state.batch.quota.remaining_bytes, LIMIT - 160)
  assert.equal(state.files.length, 0)
  assert.equal(state.error, null)
})

function addRejectedPages(fixture) {
  const a = { ...rejected({ client_file_id: id(60) }), parse_status: 'not_started' }
  const b = { ...rejected({ client_file_id: id(61) }), parse_status: 'not_started' }
  fixture.current = { ...fixture.current, files: [...fixture.current.files, a],
    files_page: { limit: 50, next_cursor: 'second receipts page', total_count: 3 } }
  fixture.source.read = async (importId, cursor) => {
    fixture.calls.reads.push({ importId, cursor })
    return structuredClone(cursor ? { ...fixture.current, files: [b],
      files_page: { limit: 50, next_cursor: null, total_count: 3 } } : fixture.current)
  }
  return [a.client_file_id, b.client_file_id]
}

test('I03 preparation reads full coherent pages and requires explicit rejected acknowledgment', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  const rejectedIds = addRejectedPages(fixture)
  await fixture.workflow.prepareAnalysis()
  let state = fixture.workflow.getSnapshot()
  assert.deepEqual(state.preparation.acceptedFileIds, fixture.current.source_set.accepted_file_ids)
  assert.deepEqual(state.preparation.rejectedClientFileIds, rejectedIds)
  assert.equal(state.serverFiles.length, 3)
  assert.equal(state.batch.quota.accepted_file_count, 1)
  await fixture.workflow.analyze()
  assert.equal(fixture.calls.analyses.length, 0)
  fixture.workflow.acknowledgeRejected(true)
  await fixture.workflow.analyze()
  const intent = fixture.calls.analyses[0].intent
  assert.equal(intent.importRevision, fixture.current.import_revision)
  assert.equal(intent.fileSetVersion, fixture.current.file_set_version)
  assert.deepEqual(intent.rejectedClientFileIds, rejectedIds)
  assert.deepEqual(intent.acceptedFileIds, fixture.current.source_set.accepted_file_ids)
  state = fixture.workflow.getSnapshot()
  assert.equal(state.sealedLocked, true)
  fixture.workflow.setFiles([csv('late.csv')])
  await fixture.workflow.upload()
  assert.equal(fixture.calls.uploads.length, 1)
  assert.equal(fixture.workflow.getSnapshot().files.length, 0)
})

test('page version rollover discards old receipts and requires new analysis preparation', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  addRejectedPages(fixture)
  const original = fixture.source.read
  fixture.source.read = async (...args) => {
    const page = await original(...args)
    return args[1] ? { ...page, import_revision: 'newer revision', file_set_version: 'newer evidence',
      source_set: { ...page.source_set, version: 'newer evidence' } } : page
  }
  await fixture.workflow.prepareAnalysis()
  assert.equal(fixture.workflow.getSnapshot().preparation, null)
  assert.equal(fixture.workflow.getSnapshot().serverFiles.length, 2)
  assert.match(fixture.workflow.getSnapshot().error, /thay đổi/)
  fixture.workflow.acknowledgeRejected(true)
  await fixture.workflow.analyze()
  assert.equal(fixture.calls.analyses.length, 0)
  await fixture.workflow.loadMore()
  assert.equal(fixture.workflow.getSnapshot().serverFiles.length, 2)
  assert.equal(fixture.workflow.getSnapshot().nextCursor, 'second receipts page')
})

test('I03 revision412 refreshes canonical state and never retries stale input automatically', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  await fixture.workflow.prepareAnalysis()
  fixture.workflow.acknowledgeRejected(true)
  fixture.source.analyze = async (importId, intent) => {
    fixture.calls.analyses.push({ importId, intent })
    fixture.current = { ...fixture.current, import_revision: 'concurrent revision',
      file_set_version: 'concurrent evidence', source_set: { ...fixture.current.source_set, version: 'concurrent evidence' } }
    throw new HttpError('contract', 'revision changed', 412, problem('IMPORT_REVISION_CONFLICT').error)
  }
  await fixture.workflow.analyze()
  let state = fixture.workflow.getSnapshot()
  assert.equal(state.retryOperation, null)
  assert.equal(state.preparation, null)
  assert.equal(state.batch.import_revision, 'concurrent revision')
  assert.equal(state.sealedLocked, false)
  await fixture.workflow.retry()
  assert.equal(fixture.calls.analyses.length, 1)
  await fixture.workflow.prepareAnalysis()
  state = fixture.workflow.getSnapshot()
  assert.equal(state.preparation.importRevision, 'concurrent revision')
  assert.equal(state.preparation.acknowledged, false)
})

test('accepted I03 locks upload immediately even if the subsequent authoritative read fails', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  await fixture.workflow.prepareAnalysis()
  fixture.workflow.acknowledgeRejected(true)
  fixture.source.read = async () => { throw new HttpError('transport', 'analysis read failed') }
  await fixture.workflow.analyze()
  const state = fixture.workflow.getSnapshot()
  assert.equal(state.analysis.status, 'analyzing')
  assert.equal(state.sealedLocked, true)
  assert.equal(state.fresh, false)
  assert.equal(state.retryOperation, null)
  fixture.workflow.setFiles([csv('late.csv')])
  await fixture.workflow.upload()
  assert.equal(fixture.calls.uploads.length, 1)
})

test('failed analysis keeps source sealed while server-authorized analyze retry remains possible', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  await fixture.workflow.prepareAnalysis()
  fixture.workflow.acknowledgeRejected(true)
  await fixture.workflow.analyze()
  fixture.current = { ...fixture.current, status: 'failed', allowed_actions: ['analyze'] }
  await fixture.workflow.refresh()
  fixture.workflow.setFiles([csv('late.csv')])
  await fixture.workflow.upload()
  assert.equal(fixture.calls.uploads.length, 1)
  assert.equal(fixture.workflow.getSnapshot().sealedLocked, true)
  await fixture.workflow.prepareAnalysis()
  assert.ok(fixture.workflow.getSnapshot().preparation)
  fixture.workflow.acknowledgeRejected(true)
  await fixture.workflow.analyze()
  assert.equal(fixture.calls.analyses.length, 2)
})

test('uncertain I03 retry retains its original CAS, source set and request key after seal', async () => {
  const fixture = workflowFixture()
  fixture.workflow.setFiles([csv()])
  await fixture.workflow.upload()
  await fixture.workflow.prepareAnalysis()
  fixture.workflow.acknowledgeRejected(true)
  const original = fixture.source.analyze
  let lost = true
  fixture.source.analyze = async (...args) => {
    const result = await original(...args)
    if (lost) { lost = false; throw new HttpError('contract', 'uncertain persistence', 503, problem('SERVICE_UNAVAILABLE').error) }
    return result
  }
  await fixture.workflow.analyze()
  assert.equal(fixture.workflow.getSnapshot().retryOperation, 'analyze')
  assert.equal(fixture.workflow.getSnapshot().sealedLocked, true)
  await fixture.workflow.retry()
  assert.equal(fixture.calls.analyses.length, 2)
  assert.equal(fixture.calls.analyses[0].intent, fixture.calls.analyses[1].intent)
  assert.equal(fixture.workflow.getSnapshot().retryOperation, null)
  assert.equal(fixture.workflow.getSnapshot().sealedLocked, true)
})

test('busy upload guards duplicate clicks and local intent changes', async () => {
  const fixture = workflowFixture()
  const original = fixture.source.createDraft
  let release
  const blocked = new Promise((resolve) => { release = resolve })
  fixture.source.createDraft = async (...args) => { await blocked; return original(...args) }
  const file = csv()
  fixture.workflow.setFiles([file])
  const running = fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().busy, true)
  fixture.workflow.setFiles([csv('second.csv')])
  fixture.workflow.setDataDate('2026-10-11')
  await fixture.workflow.upload()
  assert.equal(fixture.workflow.getSnapshot().files[0], file)
  assert.equal(fixture.workflow.getSnapshot().dataDate, '2026-10-10')
  release()
  await running
  assert.equal(fixture.calls.drafts.length, 1)
  assert.equal(fixture.calls.uploads.length, 1)
})

test('explicit mock adapter exercises multicall 8 + 7 + 6 ordered admission at 20 accepted files', async (t) => {
  stubFetch(t, async () => { throw new Error('mock must never fetch') })
  const source = createImportDataSource({ dataSource: 'mock', apiBaseUrl: 'https://unused.invalid' })
  const batch = await source.createDraft(mockImportStoreId, { key: KEY, dataDate: '2026-10-10' })
  let nextClient = 200
  let final
  for (const count of [8, 7, 6]) {
    final = await source.upload(batch.import_id, {
      key: id(nextClient++), items: Array.from({ length: count }, () => ({ clientFileId: id(nextClient++), file: csv() })),
    })
  }
  assert.deepEqual(final.items.map((item) => item.upload_status), ['uploaded', 'uploaded', 'uploaded', 'uploaded', 'uploaded', 'rejected'])
  assert.equal(final.items.at(-1).error.code, 'RESOURCE_LIMIT_EXCEEDED')
  const current = await source.read(batch.import_id)
  assert.equal(current.quota.accepted_file_count, 20)
  assert.equal(current.quota.accepted_total_bytes, 20 * csv().size)
  assert.equal(current.quota.remaining_file_slots, 0)
  assert.equal(current.source_set.accepted_file_ids.length, 20)
  assert.equal(current.files.length, 21)
  assert.ok(final.warnings.some((warning) => warning.code === 'DUPLICATE_CONTENT'))
})

test('explicit mock adapter exercises 99 MiB plus two 1 MiB files without charging rejected bytes', async () => {
  const source = createImportDataSource({ dataSource: 'mock', apiBaseUrl: 'https://unused.invalid' })
  const batch = await source.createDraft(mockImportStoreId, { key: KEY, dataDate: '2026-10-10' })
  const megabytes = (size, name) => new File([new Uint8Array(size * 1024 ** 2).fill(65)], name)
  const twenty = megabytes(20, 'twenty.csv')
  await source.upload(batch.import_id, { key: id(300), items: [
    ...Array.from({ length: 4 }, (_, index) => ({ clientFileId: id(301 + index), file: twenty })),
    { clientFileId: id(305), file: megabytes(19, 'nineteen.csv') },
  ] })
  const one = megabytes(1, 'one.csv')
  const result = await source.upload(batch.import_id, { key: id(306), items: [
    { clientFileId: id(307), file: one }, { clientFileId: id(308), file: one },
  ] })
  assert.deepEqual(result.items.map((item) => item.upload_status), ['uploaded', 'rejected'])
  assert.equal(result.items[1].error.code, 'RESOURCE_LIMIT_EXCEEDED')
  const current = await source.read(batch.import_id)
  assert.equal(current.quota.accepted_total_bytes, LIMIT)
  assert.equal(current.quota.remaining_bytes, 0)
  assert.equal(current.quota.accepted_file_count, 6)
  const same = await source.upload(batch.import_id, { key: id(306), items: [
    { clientFileId: id(307), file: one }, { clientFileId: id(308), file: one },
  ] })
  assert.equal(same.import_revision, result.import_revision)
  assert.equal((await source.read(batch.import_id)).quota.accepted_file_count, 6)
})

test('explicit mock adapter retains 60 rejected receipts across pages and seals only a fully acknowledged source set', async () => {
  const source = createImportDataSource({ dataSource: 'mock', apiBaseUrl: 'https://unused.invalid' })
  const batch = await source.createDraft(mockImportStoreId, { key: KEY, dataDate: '2026-10-10' })
  const firstIntent = { key: id(400), items: [{ clientFileId: id(401), file: csv() }] }
  const accepted = await source.upload(batch.import_id, firstIntent)
  const rejectedIds = []
  for (let call = 0; call < 3; call += 1) {
    const items = Array.from({ length: 20 }, (_, index) => ({
      clientFileId: id(410 + call * 20 + index), file: csv('bad.exe'),
    }))
    rejectedIds.push(...items.map((item) => item.clientFileId))
    const result = await source.upload(batch.import_id, { key: id(500 + call), items })
    assert.equal(result.allRejected, true)
  }
  const first = await source.read(batch.import_id)
  assert.equal(first.files.length, 50)
  assert.equal(first.files_page.total_count, 61)
  assert.equal(first.quota.accepted_file_count, 1)
  const second = await source.read(batch.import_id, first.files_page.next_cursor)
  assert.equal(second.files.length, 11)
  assert.deepEqual(second.quota, first.quota)
  assert.equal(second.file_set_version, first.file_set_version)
  const intent = { key: id(503), importRevision: first.import_revision, fileSetVersion: first.file_set_version,
    acceptedFileIds: first.source_set.accepted_file_ids, rejectedClientFileIds: rejectedIds }
  await assert.rejects(source.analyze(batch.import_id, { ...intent, rejectedClientFileIds: rejectedIds.slice(1) }),
    (error) => error.status === 422 && error.problem.code === 'INVALID_IMPORT_CONFIGURATION')
  await source.analyze(batch.import_id, intent)
  const sealed = await source.read(batch.import_id)
  assert.equal(sealed.source_set.sealed, true)
  assert.equal(sealed.allowed_actions.includes('upload'), false)
  // Original receipt replay is valid after seal; a new upload intent is refused.
  const replayed = await source.upload(batch.import_id, firstIntent)
  assert.equal(replayed.import_revision, accepted.import_revision)
  await assert.rejects(source.upload(batch.import_id, { key: id(504), items: [{ clientFileId: id(505), file: csv() }] }),
    (error) => error.status === 409)
  assert.equal((await source.read(batch.import_id)).quota.accepted_file_count, 1)
})
