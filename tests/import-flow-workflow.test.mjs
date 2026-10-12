import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HttpError } from '../src/shared/http/httpClient'
import { createMockImportDataSource, mockImportStoreId } from '../src/features/import-data/importData.fixtures'
import { ImportBatchWorkflow } from '../src/features/import-data/importData.workflow'
import { createMockImportFlowDataSource } from '../src/features/import-data/importFlow.fixtures'
import { ImportFlowWorkflow } from '../src/features/import-data/importFlow.workflow'
import { matchesImportWire } from '../src/features/import-data/importFlow.wire'

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const wireOnly = (value) => Array.isArray(value) ? value.map(wireOnly) : value && typeof value === 'object' ?
  Object.fromEntries(Object.entries(value).filter(([key]) => !['unsupportedFields', 'poll_after_ms'].includes(key)).map(([key, item]) => [key, wireOnly(item)])) : value

async function workspace(options = {}, wrap = (source) => source, hooks = {}) {
  const mock = createMockImportDataSource({ continuation: true })
  const upload = new ImportBatchWorkflow(mock, mockImportStoreId)
  upload.setDataDate('2026-10-11')
  upload.setFiles([new File(['lot,on_hand\nLOT-EXAMPLE,10'], 'synthetic.csv', { type: 'text/csv' })])
  await upload.upload()
  await upload.prepareAnalysis()
  upload.acknowledgeRejected(true)
  await upload.analyze()
  assert.equal(upload.getSnapshot().batch.status, 'review_required')
  const source = wrap(createMockImportFlowDataSource(mock, options))
  const controller = new ImportFlowWorkflow(source, { currentPermissions: () => ['import.commit', 'inventory.count.correct', 'mapping.propose'], refreshBatch: async () => {
    await upload.refresh()
    const state = upload.getSnapshot()
    if (!state.fresh || state.error) throw new Error(state.error ?? 'Batch not fresh')
    return state.batch
  }, ...hooks })
  controller.setBatch(upload.getSnapshot().batch)
  await controller.refresh()
  return { controller, source, mock, upload }
}

async function prepared(work) {
  await work.controller.startPreview()
  assert.equal(work.controller.getSnapshot().completion, null)
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().job.status, 'running')
  assert.equal(work.controller.getSnapshot().job.progress, null)
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().job.status, 'completed')
  assert.ok(work.controller.getSnapshot().preview)
  await work.controller.loadMorePreview()
  work.controller.setReviewReason('Đã đọc đầy đủ preview và các binding trong ví dụ thử nghiệm.')
  work.controller.acknowledgeReview(true)
  if (work.controller.getSnapshot().canConfirmReview) await work.controller.confirmReview()
  work.controller.setCommitReason('Đối chiếu kiểm kê tổng hợp ví dụ thử nghiệm.')
  work.controller.acknowledgeCommit(true)
}

test('continuation uses original per-instance batch; 202 and running jobs never create completion', async () => {
  const work = await workspace()
  assert.equal(work.controller.getSnapshot().summary.can_preview, true)
  work.controller.setTab('result')
  assert.equal(work.controller.getSnapshot().tab, 'mapping')
  await prepared(work)
  const preview = work.controller.getSnapshot().preview
  assert.equal(preview.preview.rows.length, 2)
  assert.equal(work.controller.getSnapshot().canCommit, true)
  await work.controller.commit()
  assert.equal(work.upload.getSnapshot().batch.status, 'committing')
  assert.equal(work.controller.getSnapshot().completion, null)
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().completion, null)
  await work.controller.pollJob()
  assert.equal(work.upload.getSnapshot().batch.status, 'completed')
  assert.equal(work.controller.getSnapshot().completion.outcome, 'committed')
  assert.equal(work.controller.getSnapshot().tab, 'result')
  assert.equal(work.controller.getSnapshot().completion.updated_resources.inventory.changed_record_count, 2)
  assert.equal(work.controller.getSnapshot().pollAfterMs, null)
  work.controller.setTab('result')
  assert.equal(work.controller.getSnapshot().tab, 'result')
})

test('filtered empty issue pages do not resolve import-wide progress or grant review/preview', async () => {
  const work = await workspace({ ownerRequired: true })
  await work.controller.setFilter('ambiguous', false)
  const state = work.controller.getSnapshot()
  assert.equal(state.queue.items.length, 0)
  assert.equal(state.queue.counts.unresolved, 1)
  assert.equal(state.summary.progress.unresolved, 1)
  assert.equal(state.summary.can_preview, false)
  assert.equal(state.reviewOnly, false)
  work.controller.setTab('review')
  assert.equal(work.controller.getSnapshot().tab, 'mapping')
  await work.controller.startPreview()
  assert.match(work.controller.getSnapshot().error, /Owner/)
  assert.equal(work.controller.getSnapshot().job, null)
})

test('successful pairs can be explicitly edited but fork a proposal and never activate it', async () => {
  let writes = 0
  const work = await workspace({}, (source) => ({ ...source, confirm: async (...args) => { writes++; return source.confirm(...args) } }))
  await work.controller.setFilter('auto_mapped', false)
  const row = work.controller.getSnapshot().queue.items[0]
  assert.equal(row.status, 'auto_mapped')
  await work.controller.loadOptions(row.mapping_id)
  await work.controller.confirmMapping(row.mapping_id, 'on_hand')
  assert.equal(writes, 1)
  assert.equal(work.controller.getSnapshot().summary.can_preview, false)
  assert.equal(work.controller.getSnapshot().summary.profile_proposals.length, 1)
})

test('mapping response loss retains key/revision/body; replay never means Owner activation', async () => {
  const intents = []
  let revision = 'mapping-original'
  let first = true
  const work = await workspace({ ownerRequired: true }, (source) => ({
    ...source,
    summary: async (...args) => ({ ...await source.summary(...args), mapping_revision: revision }),
    queue: async (...args) => {
      const result = await source.queue(...args)
      return { ...result, items: result.items.map((row) => ({ ...row, unsupportedFields: [] })) }
    },
    options: async (...args) => ({ ...await source.options(...args), mapping_revision: revision }),
    confirm: async (_importId, mappingId, intent) => {
      intents.push(structuredClone(intent))
      revision = 'mapping-accepted'
      if (first) { first = false; throw new HttpError('transport', 'lost response') }
      return { mapping_id: mappingId, status: 'resolved',
        mapping_revision: revision, progress: { total_fields: 3, unresolved: 0, completed_fields: 3 }, sheets: [],
        proposal_revision: 'proposal-new', approval_required: true, unsupportedFields: [] }
    },
  }))
  const mappingId = work.controller.getSnapshot().queue.items[0].mapping_id
  await work.controller.loadOptions(mappingId)
  await work.controller.confirmMapping(mappingId, 'on_hand')
  assert.equal(work.controller.getSnapshot().retryOperation, 'mapping')
  assert.equal(work.controller.getSnapshot().summary.mapping_revision, 'mapping-accepted')
  await work.controller.retry()
  assert.deepEqual(intents[1], intents[0])
  assert.equal(intents[0].mappingRevision, 'mapping-original')
  assert.equal(work.controller.getSnapshot().retryOperation, null)
  assert.match(work.controller.getSnapshot().notice, /Owner/)
  assert.equal(work.controller.getSnapshot().summary.can_preview, false)
})

test('mapping CAS conflicts refresh authority, clear retry and do not activate proposals', async () => {
  let revision = 'before-conflict'
  const work = await workspace({ ownerRequired: true }, (source) => ({
    ...source,
    summary: async (...args) => ({ ...await source.summary(...args), mapping_revision: revision }),
    queue: async (...args) => { const result = await source.queue(...args); return { ...result, items: result.items.map((row) => ({ ...row, unsupportedFields: [] })) } },
    options: async (...args) => ({ ...await source.options(...args), mapping_revision: revision }),
    confirm: async () => { revision = 'after-conflict'; throw new HttpError('contract', 'conflict', 412, { code: 'MAPPING_REVISION_CONFLICT', message: 'conflict', details: {} }) },
  }))
  const mappingId = work.controller.getSnapshot().queue.items[0].mapping_id
  await work.controller.loadOptions(mappingId)
  await work.controller.confirmMapping(mappingId, 'on_hand')
  assert.equal(work.controller.getSnapshot().retryOperation, null)
  assert.equal(work.controller.getSnapshot().summary.mapping_revision, 'after-conflict')
  assert.equal(work.controller.getSnapshot().options.mapping_revision, 'after-conflict')
  assert.equal(work.controller.getSnapshot().summary.can_preview, false)
})

test('uncertain commit retains the exact original intent even after canonical revision changes', async () => {
  const intents = []
  let first = true
  const work = await workspace({}, (source) => ({ ...source, commit: async (importId, intent) => {
    intents.push(structuredClone(intent))
    const result = await source.commit(importId, intent)
    if (first) { first = false; throw new HttpError('contract', 'temporarily unavailable', 503,
      { code: 'SERVICE_UNAVAILABLE', message: 'temporarily unavailable', details: {} }) }
    return result
  } }))
  await prepared(work)
  await work.controller.commit()
  assert.equal(work.controller.getSnapshot().retryOperation, 'commit')
  assert.notEqual(work.controller.getSnapshot().batch.import_revision, intents[0].importRevision)
  work.controller.setCommitReason('must not replace retained intent')
  await work.controller.retry()
  assert.equal(work.controller.getSnapshot().retryOperation, null)
  assert.deepEqual(intents[1], intents[0])
  assert.equal(intents[0].resolutions.length, 0)
  await work.controller.pollJob()
  await work.controller.pollJob()
  assert.ok(work.controller.getSnapshot().completion)
})

test('preview pages pin preview ID/digest; a changed page invalidates acknowledgment and blocks commit', async () => {
  const queries = []
  const work = await workspace({}, (source) => ({ ...source, readPreview: async (importId, query) => {
    queries.push(structuredClone(query))
    const result = await source.readPreview(importId, query)
    if (query.rowsCursor) result.preview.summary.digest = `sha256:${'e'.repeat(64)}`
    return result
  } }))
  await work.controller.startPreview()
  await work.controller.pollJob()
  await work.controller.pollJob()
  work.controller.acknowledgeCommit(true)
  await work.controller.loadMorePreview()
  assert.equal(queries[1].previewId, queries[0].previewId)
  assert.ok(queries[1].rowsCursor)
  assert.equal(work.controller.getSnapshot().previewStale, true)
  assert.equal(work.controller.getSnapshot().commitAcknowledged, false)
  assert.equal(work.controller.getSnapshot().canCommit, false)
})

test('failed J01/200 is terminal diagnostic, never I06 success', async () => {
  let completionReads = 0
  let jobReads = 0
  const work = await workspace({}, (source) => ({ ...source,
    job: async (jobId) => { jobReads++; const job = await source.job(jobId); return { ...job, status: 'failed', stage: 'failed',
      result: null, error: { code: 'DATA_VALIDATION_FAILED', message: 'Synthetic failure', details: {} }, completed_at: '2026-10-11T01:00:01Z', poll_after_ms: 0 } },
    completion: async (...args) => { completionReads++; return source.completion(...args) },
  }))
  await work.controller.startPreview()
  await work.controller.pollJob()
  await work.controller.pollJob()
  assert.equal(jobReads, 1)
  assert.equal(completionReads, 0)
  assert.equal(work.controller.getSnapshot().completion, null)
  assert.equal(work.controller.getSnapshot().pollAfterMs, null)
  assert.match(work.controller.getSnapshot().error, /DATA_VALIDATION_FAILED/)
})

test('terminal job follow-up read failures can reconcile without rerunning mutation or polling terminal J01', async () => {
  let completionReads = 0
  let jobReads = 0
  let commitWrites = 0
  const work = await workspace({}, (source) => ({ ...source,
    job: async (...args) => { jobReads++; return source.job(...args) },
    commit: async (...args) => { commitWrites++; return source.commit(...args) },
    completion: async (...args) => { completionReads++; if (completionReads === 1) throw new HttpError('transport', 'receipt read lost'); return source.completion(...args) },
  }))
  await prepared(work)
  await work.controller.commit()
  await work.controller.pollJob()
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().job.status, 'completed')
  assert.equal(work.controller.getSnapshot().completion, null)
  assert.equal(work.controller.getSnapshot().retryOperation, null)
  const reads = jobReads
  await work.controller.refresh()
  assert.equal(jobReads, reads)
  assert.equal(commitWrites, 1)
  assert.ok(work.controller.getSnapshot().completion)
})

test('foreign or superseded workspace responses cannot populate a new active batch', async () => {
  let release
  let delay = false
  const work = await workspace({}, (source) => ({ ...source, summary: async (...args) => {
    const value = await source.summary(...args)
    if (delay) await new Promise((resolve) => { release = resolve })
    return value
  } }))
  delay = true
  const pending = work.controller.refresh()
  while (!release) await new Promise((resolve) => setTimeout(resolve, 0))
  work.controller.setBatch(null)
  release()
  await pending
  assert.equal(work.controller.getSnapshot().batch, null)
  assert.equal(work.controller.getSnapshot().summary, null)
  assert.equal(work.controller.getSnapshot().busy, false)
})

test('unsupported preview diagnostics remain visibly blocked without a commit request', async () => {
  let writes = 0
  const work = await workspace({}, (source) => ({ ...source,
    readPreview: async (...args) => { const result = await source.readPreview(...args); result.unsupportedFields = ['supplier-actions.DTO'];
      result.preview.summary.groups[0].canonical_domain = 'supplier'; return result },
    commit: async (...args) => { writes++; return source.commit(...args) },
  }))
  await prepared(work)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  assert.match(work.controller.getSnapshot().commitBlockers.join(' '), /chưa được hỗ trợ/)
  await work.controller.commit()
  assert.equal(writes, 0)
})

test('completion displays retained no_changes counters and readiness without deriving success from row counts', async () => {
  const work = await workspace({}, (source) => ({ ...source, completion: async (...args) => {
    const receipt = await source.completion(...args)
    return { ...receipt, outcome: 'no_changes', summary: { ...receipt.summary, CHANGED: 0, UNCHANGED: 2 },
      updated_resources: { inventory: { updated: false, affected_ingredient_count: 0, changed_record_count: 0 },
        menu: { updated: false, affected_product_count: 0, changed_record_count: 0 }, sales: { updated: false, added_record_count: 0 },
        catalog: { created_product_count: 0, created_ingredient_count: 0 } } }
  } }))
  await prepared(work)
  await work.controller.commit()
  await work.controller.pollJob()
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().completion.outcome, 'no_changes')
  assert.equal(work.controller.getSnapshot().completion.updated_resources.inventory.updated, false)
  assert.equal(work.controller.getSnapshot().completion.updated_resources.inventory.changed_record_count, 0)
  assert.deepEqual(work.controller.getSnapshot().completion.readiness.evaluated_actions, ['inventory'])
})

test('terminal analyze can retry mapping reads after I04 has cleared active_job_id without repolling J01', async () => {
  let summaryReads = 0
  let jobReads = 0
  let failRead = false
  const jobId = id(95)
  const work = await workspace({}, (source) => ({ ...source,
    summary: async (...args) => { summaryReads++; if (failRead) { failRead = false; throw new HttpError('transport', 'mapping read failed') } return source.summary(...args) },
    job: async () => { jobReads++; const batch = work.upload.getSnapshot().batch; return {
      job_id: jobId, operation: 'import_analyze', status: 'completed', stage: 'completed', progress: 1,
      created_at: '2026-10-11T01:00:00Z', started_at: '2026-10-11T01:00:00Z', completed_at: '2026-10-11T01:00:01Z',
      context: { import_id: batch.import_id, store_id: batch.store_id }, result: { resource_type: 'import_analysis', resource_id: batch.import_id, analysis_id: id(96) },
      error: null, poll_after_ms: 0, unsupportedFields: [],
    } },
  }))
  work.controller.setBatch({ ...work.upload.getSnapshot().batch, active_job_id: jobId })
  failRead = true
  await work.controller.pollJob()
  assert.match(work.controller.getSnapshot().error, /mapping read failed/)
  assert.equal(work.controller.getSnapshot().batch.active_job_id, null)
  const reads = summaryReads
  await work.controller.refresh()
  assert.equal(summaryReads, reads + 2)
  assert.equal(jobReads, 1)
  assert.equal(work.controller.getSnapshot().error, null)
})

test('a new canonical proposal revision refreshes mapping rather than reopening a finished historical preview job', async () => {
  let summaryReads = 0
  const work = await workspace({}, (source) => ({ ...source,
    summary: async (...args) => { summaryReads++; return source.summary(...args) },
  }))
  await prepared(work)
  const batch = work.upload.getSnapshot().batch
  work.mock.advanceContinuation(batch.import_id, { status: 'review_required', import_revision: 'new-proposal-revision', allowed_actions: ['mapping.read', 'mapping.propose', 'preview'] })
  await work.upload.refresh()
  work.controller.setBatch(work.upload.getSnapshot().batch)
  assert.equal(work.controller.getSnapshot().previewStale, true)
  assert.equal(work.controller.getSnapshot().commitAcknowledged, false)
  const reads = summaryReads
  await work.controller.refresh()
  assert.equal(summaryReads, reads + 2)
  assert.equal(work.controller.getSnapshot().job, null)
  assert.equal(work.controller.getSnapshot().error, null)
})

test('an incomplete final preview page cannot enable commit even when next_cursor is null', async () => {
  const work = await workspace({}, (source) => ({ ...source, readPreview: async (...args) => {
    const result = await source.readPreview(...args)
    result.preview.rows_page.next_cursor = null
    return result
  } }))
  await prepared(work)
  assert.equal(work.controller.getSnapshot().preview.preview.rows.length, 1)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  assert.match(work.controller.getSnapshot().commitBlockers.join(' '), /Số dòng/)
})

test('a server-authorized analysis retry replaces the terminal job and resumes polling without unsealing sources', async () => {
  const failedId = id(97)
  const retryId = id(98)
  const polled = []
  const work = await workspace({}, (source) => ({ ...source, job: async (jobId) => {
    polled.push(jobId)
    const batch = work.upload.getSnapshot().batch
    return { job_id: jobId, operation: 'import_analyze', status: jobId === failedId ? 'failed' : 'running',
      stage: jobId === failedId ? 'failed' : 'parsing', progress: jobId === failedId ? null : 0.25,
      created_at: '2026-10-11T01:00:00Z', started_at: '2026-10-11T01:00:00Z',
      completed_at: jobId === failedId ? '2026-10-11T01:00:01Z' : null,
      context: { import_id: batch.import_id, store_id: batch.store_id }, result: null,
      error: jobId === failedId ? { code: 'ANALYSIS_FAILED', message: 'Synthetic first-attempt failure', details: {} } : null,
      poll_after_ms: jobId === failedId ? 0 : 3000, unsupportedFields: [] }
  } }))
  const batch = work.upload.getSnapshot().batch
  work.controller.setBatch({ ...batch, status: 'failed', active_job_id: failedId, allowed_actions: ['analyze'] })
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().job.status, 'failed')
  assert.equal(work.controller.getSnapshot().pollAfterMs, null)
  work.controller.setBatch({ ...batch, status: 'analyzing', active_job_id: retryId,
    import_revision: 'explicit-retry-revision', allowed_actions: [], poll_after_ms: 3000 })
  assert.equal(work.controller.getSnapshot().job, null)
  assert.equal(work.controller.getSnapshot().pollAfterMs, 3000)
  assert.equal(work.controller.getSnapshot().error, null)
  await work.controller.pollJob()
  assert.deepEqual(polled, [failedId, retryId])
  assert.equal(work.controller.getSnapshot().job.status, 'running')
  assert.equal(work.controller.getSnapshot().job.progress, 0.25)
  assert.equal(work.controller.getSnapshot().batch.source_set.sealed, true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
})

test('I04 previews from a different Store cannot establish preview or commit authority', async () => {
  const work = await workspace({}, (source) => ({ ...source, readPreview: async (...args) => ({
    ...await source.readPreview(...args), store_id: id(99),
  }) }))
  await work.controller.startPreview()
  await work.controller.pollJob()
  await work.controller.pollJob()
  assert.equal(work.controller.getSnapshot().preview, null)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  assert.match(work.controller.getSnapshot().error, /không khớp/)
})

test('full preview review is a separate synchronous step and required before commit', async () => {
  let reviews = 0, commits = 0
  const work = await workspace({}, (source) => ({ ...source,
    confirmReview: async (...args) => { reviews++; return source.confirmReview(...args) },
    commit: async (...args) => { commits++; return source.commit(...args) },
  }))
  await work.controller.startPreview(); await work.controller.pollJob(); await work.controller.pollJob()
  work.controller.setReviewReason('Full source review'); work.controller.acknowledgeReview(true)
  assert.equal(work.controller.getSnapshot().canConfirmReview, false)
  await work.controller.loadMorePreview()
  assert.equal(work.controller.getSnapshot().reviewAcknowledged, false)
  work.controller.setReviewReason('Full source review'); work.controller.acknowledgeReview(true)
  assert.equal(work.controller.getSnapshot().preview.preview.summary.can_commit, false)
  assert.equal(work.controller.getSnapshot().canConfirmReview, true)
  work.controller.setCommitReason('Observed count correction'); work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  await work.controller.commit()
  assert.equal(commits, 0)
  await work.controller.confirmReview()
  assert.equal(reviews, 1)
  assert.equal(work.controller.getSnapshot().completion, null)
  assert.equal(work.controller.getSnapshot().preview.confirmation_usable, true)
  assert.equal(work.controller.getSnapshot().commitAcknowledged, false)
  work.controller.setCommitReason('Observed count correction'); work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, true)
})

test('lost confirm_review response replays exact original pins/key/CAS despite import revision change', async () => {
  const intents = []; let loseResponse = true
  const work = await workspace({}, (source) => ({ ...source, confirmReview: async (importId, intent) => {
    intents.push(structuredClone(intent))
    const result = await source.confirmReview(importId, intent)
    if (loseResponse) { loseResponse = false; throw new HttpError('transport', 'Lost review acknowledgment') }
    return result
  } }))
  await work.controller.startPreview(); await work.controller.pollJob(); await work.controller.pollJob()
  await work.controller.loadMorePreview()
  work.controller.setReviewReason('Reviewed original pinned preview'); work.controller.acknowledgeReview(true)
  await work.controller.confirmReview()
  assert.equal(work.controller.getSnapshot().retryOperation, 'review')
  assert.notEqual(work.controller.getSnapshot().batch.import_revision, intents[0].importRevision)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  work.controller.setReviewReason('Must not change retained request')
  await work.controller.retry()
  assert.deepEqual(intents[1], intents[0])
  assert.equal(work.controller.getSnapshot().retryOperation, null)
  assert.equal(work.controller.getSnapshot().preview.confirmation_usable, true)
  assert.equal(work.controller.getSnapshot().completion, null)
})

test('review authorization uses current import.commit and required_actions, not can_commit guess', async () => {
  let reviewWrites = 0
  const work = await workspace({}, (source) => ({ ...source,
    confirmReview: async (...args) => { reviewWrites++; return source.confirmReview(...args) },
  }), { currentPermissions: () => ['import.commit'] })
  await work.controller.startPreview(); await work.controller.pollJob(); await work.controller.pollJob()
  await work.controller.loadMorePreview()
  work.controller.setReviewReason('Read full preview'); work.controller.acknowledgeReview(true)
  assert.equal(work.controller.getSnapshot().canConfirmReview, false)
  assert.match(work.controller.getSnapshot().reviewBlockers.join(' '), /required_actions/)
  await work.controller.confirmReview()
  assert.equal(reviewWrites, 0)
})

test('Owner activation requires exact full proposal and lifecycle then refreshes mapping and import state', async () => {
  let decisions = 0
  const work = await workspace({ ownerRequired: true }, (source) => ({ ...source,
    decideProfile: async (...args) => { decisions++; return source.decideProfile(...args) },
  }), { canDecideProfile: () => true })
  const mappingId = work.controller.getSnapshot().queue.items[0].mapping_id
  await work.controller.loadOptions(mappingId)
  await work.controller.confirmMapping(mappingId, 'on_hand')
  assert.equal(work.controller.getSnapshot().summary.progress.unresolved, 0)
  assert.equal(work.controller.getSnapshot().summary.can_preview, false)
  assert.equal(work.controller.getSnapshot().queue.items[0].status, 'resolved')
  const proposal = work.controller.getSnapshot().summary.profile_proposals[0]
  const decision = { decision: 'approve_activate', proposal_revision: proposal.proposal_revision,
    expected_active_version: proposal.active_version, reason: 'Owner reviewed complete full specification' }
  await work.controller.decideProfile(proposal.profile_id, 'stale lifecycle', decision)
  assert.equal(decisions, 0)
  await work.controller.decideProfile(proposal.profile_id, proposal.lifecycle_revision, decision)
  assert.equal(decisions, 1)
  assert.equal(work.controller.getSnapshot().summary.can_preview, true)
  assert.equal(work.controller.getSnapshot().batch.allowed_actions.includes('preview'), true)
  assert.equal(work.controller.getSnapshot().completion, null)
})

test('mapping cursor invalidation discards old pages and explicit refresh starts from first page', async () => {
  const cursors = []
  const work = await workspace({ ownerRequired: true }, (source) => ({ ...source,
    queue: async (importId, query, signal) => {
      cursors.push(query.cursor ?? null)
      if (query.cursor) throw new HttpError('contract', 'Invalid signed page', 422, { code: 'INVALID_CURSOR', message: 'Invalid signed page', details: {} })
      const result = await source.queue(importId, query, signal)
      return { ...result, pagination: { ...result.pagination, next_cursor: 'signed-cursor', total_count: 2 } }
    },
  }))
  await work.controller.loadMoreMappings()
  assert.equal(work.controller.getSnapshot().queue, null)
  assert.match(work.controller.getSnapshot().error, /INVALID_CURSOR/)
  await work.controller.refresh()
  assert.equal(cursors.at(-1), null)
  assert.equal(work.controller.getSnapshot().queue.items.length, 1)
  assert.equal(work.controller.getSnapshot().canCommit, false)
})

test('fresh continuation controller re-enters retained preview and confirmation without write/reopen', async () => {
  const work = await workspace()
  await prepared(work)
  let writes = 0
  const restored = new ImportFlowWorkflow({ ...work.source,
    preview: async (...args) => { writes++; return work.source.preview(...args) },
    confirmReview: async (...args) => { writes++; return work.source.confirmReview(...args) },
    commit: async (...args) => { writes++; return work.source.commit(...args) },
  }, { currentPermissions: () => ['import.commit', 'inventory.count.correct'], refreshBatch: async () => {
    await work.upload.refresh(); return work.upload.getSnapshot().batch
  } })
  restored.setBatch(work.upload.getSnapshot().batch)
  await restored.refresh()
  assert.equal(writes, 0)
  assert.equal(restored.getSnapshot().preview.review_confirmation.preview_id, work.controller.getSnapshot().preview.preview.summary.preview_id)
  assert.equal(restored.getSnapshot().preview.confirmation_usable, true)
  assert.equal(restored.getSnapshot().canCommit, false)
  await restored.loadMorePreview()
  restored.setCommitReason('Explicit re-entry review'); restored.acknowledgeCommit(true)
  assert.equal(restored.getSnapshot().canCommit, true)
})

test('synthetic DEV fixture adheres to published current wire at every lifecycle boundary', async () => {
  const work = await workspace()
  const current = work.controller.getSnapshot()
  assert.equal(matchesImportWire('MappingSummary', wireOnly(current.summary)), true)
  assert.equal(matchesImportWire('MappingList', wireOnly({ items: current.queue.items, counts: current.queue.counts })), true)
  assert.equal(matchesImportWire('FieldOptions', wireOnly(current.options)), true)
  await prepared(work)
  const review = work.controller.getSnapshot().preview
  assert.equal(matchesImportWire('PreviewPage', wireOnly(review.preview)), true)
  assert.equal(matchesImportWire('ReviewConfirmation', wireOnly(review.review_confirmation)), true)
  await work.controller.commit()
  await work.controller.pollJob(); await work.controller.pollJob()
  assert.equal(matchesImportWire('JobView', wireOnly(work.controller.getSnapshot().job)), true)
  assert.equal(matchesImportWire('ImportCompletion', wireOnly(work.controller.getSnapshot().completion)), true)
})

test('blocked validation_status alone prevents review even when blocker array is empty', async () => {
  let reviewWrites = 0
  const work = await workspace({}, (source) => ({ ...source,
    readPreview: async (...args) => { const result = await source.readPreview(...args); result.preview.summary.validation_status = 'blocked'; return result },
    confirmReview: async (...args) => { reviewWrites++; return source.confirmReview(...args) },
  }))
  await prepared(work)
  assert.equal(work.controller.getSnapshot().canConfirmReview, false)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  assert.equal(reviewWrites, 0)
})

test('explicit current grants deny mapping writes despite stale allowed_actions', async () => {
  let writes = 0
  const work = await workspace({ ownerRequired: true }, (source) => ({ ...source,
    confirm: async (...args) => { writes++; return source.confirm(...args) },
  }))
  work.controller.setAuthorization(false, ['import.commit', 'inventory.count.correct'])
  const mappingId = work.controller.getSnapshot().queue.items[0].mapping_id
  await work.controller.loadOptions(mappingId)
  await work.controller.confirmMapping(mappingId, 'on_hand')
  assert.equal(writes, 0)
  assert.match(work.controller.getSnapshot().error, /quyền/)
})

test('fresh controller re-entry during active preview job reads mapping context before retained preview', async () => {
  const work = await workspace()
  await work.controller.startPreview()
  const reads = []
  const restored = new ImportFlowWorkflow({ ...work.source,
    summary: async (...args) => { reads.push('summary'); return work.source.summary(...args) },
    readPreview: async (...args) => { reads.push('preview'); return work.source.readPreview(...args) },
  }, { currentPermissions: () => ['import.commit', 'inventory.count.correct'], refreshBatch: async () => {
    await work.upload.refresh(); return work.upload.getSnapshot().batch
  } })
  restored.setBatch(work.upload.getSnapshot().batch)
  await restored.pollJob(); await restored.pollJob()
  assert.ok(restored.getSnapshot().summary)
  assert.ok(restored.getSnapshot().queue)
  assert.ok(restored.getSnapshot().options)
  assert.ok(restored.getSnapshot().preview)
  assert.ok(reads.indexOf('summary') < reads.indexOf('preview'))
})

test('mixed sales and supplier review requires exact distinct confirmation row sets', async () => {
  // Controller guard scenario only: canonical domain writers are not executed here.
  const work = await workspace({}, (source) => ({ ...source, readPreview: async (...args) => {
    const result = await source.readPreview(...args)
    result.preview.rows = result.preview.rows.map((row) => ({ ...row, before: null, after: null,
      canonical_domain: row.source_location.row_number === 2 ? 'sales' : 'supplier_terms',
      proposed_action: row.source_location.row_number === 2 ? 'REPLACE_DAILY_TOTAL' : 'AMEND_TERM_PERIOD' }))
    return result
  } }))
  await prepared(work)
  const rows = work.controller.getSnapshot().preview.preview.rows
  const sales = rows.find((row) => row.canonical_domain === 'sales'), supplier = rows.find((row) => row.canonical_domain === 'supplier_terms')
  assert.equal(work.controller.getSnapshot().canCommit, false)
  const resolution = { row_id: sales.row_id, action: 'replace_daily_total', report_business_key: 'REPORT-EXAMPLE',
    evidence_reference: 'Reviewed replacement', reason: 'Replace exact daily report', disjoint_assertion: null }
  work.controller.setResolutions([resolution])
  work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  work.controller.setSupplierChanges([{ action_id: sales.row_id, reason: 'Wrong row identity' }])
  work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  work.controller.setSupplierChanges([{ action_id: supplier.row_id, reason: 'Reviewed exact term amendment' }])
  work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, true)
  work.controller.setSupplierChanges([{ action_id: supplier.row_id, reason: 'Reviewed' }, { action_id: id(999), reason: 'Extraneous' }])
  work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
  work.controller.setSupplierChanges([{ action_id: supplier.row_id, reason: 'Reviewed' }])
  work.controller.setResolutions([resolution, resolution])
  work.controller.acknowledgeCommit(true)
  assert.equal(work.controller.getSnapshot().canCommit, false)
})

test('configuration projections on different page pins invalidate review and are not merged', async () => {
  const work = await workspace({}, (source) => ({ ...source, readPreview: async (importId, query) => {
    const result = await source.readPreview(importId, query)
    result.configurations = { suppliers: [], terms: [], fees: [], declarations: [], blocked_row_ids: [], analysis_rows: [],
      basis: 'preview', stale: false, preview_id: result.preview.summary.preview_id,
      preview_digest: query.rowsCursor ? `sha256:${'f'.repeat(64)}` : result.preview.summary.digest,
      rows_page: result.preview.rows_page }
    return result
  } }))
  await work.controller.startPreview(); await work.controller.pollJob(); await work.controller.pollJob()
  work.controller.acknowledgeReview(true)
  await work.controller.loadMorePreview()
  assert.equal(work.controller.getSnapshot().previewStale, true)
  assert.equal(work.controller.getSnapshot().reviewAcknowledged, false)
  assert.equal(work.controller.getSnapshot().canConfirmReview, false)
  assert.match(work.controller.getSnapshot().error, /preview pin/)
})

test('visible column options are fetched per row, cached, and can confirm without an extra load action', async () => {
  const reads = []
  let writes = 0
  const work = await workspace({ ownerRequired: true }, source => ({ ...source,
    options: async (...args) => { reads.push(args[2]); return source.options(...args) },
    confirm: async (...args) => { writes++; return source.confirm(...args) },
  }))
  const row = work.controller.getSnapshot().queue.items[0]
  await work.controller.loadVisibleOptions()
  const descriptor = work.controller.getSnapshot().mappingOptions[row.mapping_id]
  assert.equal(descriptor.schema_context_id, row.sheet_id)
  assert.equal(descriptor.mapping_revision, work.controller.getSnapshot().summary.mapping_revision)
  const count = reads.length
  await work.controller.loadVisibleOptions()
  assert.equal(reads.length, count)
  await work.controller.confirmMapping(row.mapping_id, 'on_hand')
  assert.equal(writes, 1)
  assert.deepEqual(work.controller.getSnapshot().mappingOptions, {})
})

test('visible column options with a stale revision never populate selectors or permit confirmation', async () => {
  let writes = 0
  const work = await workspace({ ownerRequired: true }, source => ({ ...source,
    options: async (...args) => ({ ...await source.options(...args), ...(args[2] ? { mapping_revision: 'stale' } : {}) }),
    confirm: async (...args) => { writes++; return source.confirm(...args) },
  }))
  const row = work.controller.getSnapshot().queue.items[0]
  await work.controller.loadVisibleOptions()
  assert.deepEqual(work.controller.getSnapshot().mappingOptions, {})
  assert.match(work.controller.getSnapshot().error, /thay đổi/)
  await work.controller.confirmMapping(row.mapping_id, 'on_hand')
  assert.equal(writes, 0)
})
