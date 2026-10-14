import test from 'node:test'
import assert from 'node:assert/strict'
import { importStage } from '../src/features/import-data/importFlow.stage.ts'

test('Import lifecycle projection uses canonical status, not selected tab or visible queue length', () => {
  const state = { draft: {}, batch: null, busy: false, sealedLocked: false }
  const stages = {
    draft: 'DRAFT', uploaded: 'UPLOAD_REVIEW', analyzing: 'ANALYZING', review_required: 'MAPPING',
    ready_for_preview: 'MAPPING_COMPLETE', blocked: 'BLOCKED', previewing: 'PREVIEWING', preview_ready: 'PREVIEW_READY',
    committing: 'COMMITTING', completed: 'COMPLETED', completed_with_warnings: 'COMPLETED', failed: 'FAILED',
  }
  for (const [status, expected] of Object.entries(stages)) {
    assert.equal(importStage({ ...state, batch: { status }, tab: 'result', items: [] }), expected)
  }
  assert.equal(importStage({ ...state, draft: null }), 'LOCAL_SELECTION')
  assert.equal(importStage({ ...state, draft: null, busy: true }), 'UPLOADING')
  assert.equal(importStage({ ...state, batch: { status: 'previewing' }, busy: true, sealedLocked: true }), 'PREVIEWING')
})

import { importScreen, experienceStep, importFault, previewCanContinue } from '../src/features/import-data/importExperience'
import { HttpError } from '../src/shared/http/httpClient'

test('012 role projection keeps Analyze checkpoint and separates approval, commit and completion', () => {
  const batch = { sealedLocked: true, batch: { import_id: 'retained', status: 'review_required' } }
  const flow = { tab: 'mapping', completion: null, job: null, retryOperation: null }
  assert.equal(importScreen(batch, flow, null), 'analyze')
  assert.equal(importScreen(batch, flow, 'retained'), 'resolve')
  assert.equal(importScreen(batch, { ...flow, tab: 'profile' }, 'retained'), 'profile')
  assert.equal(experienceStep('OWNER', 'preview'), 5)
  assert.equal(experienceStep('STAFF', 'preview'), 4)
  assert.equal(importScreen(batch, { ...flow, retryOperation: 'commit' }, 'retained'), 'commit')
  assert.equal(importScreen(batch, { ...flow, completion: {} }, 'retained'), 'complete')
  assert.equal(importScreen({ ...batch, batch: { ...batch.batch, completion_available: true } }, flow, null), 'complete')
})

test('012 warnings may continue but blockers, stale, incomplete pages and unknown wire fields cannot enter Review', () => {
  const flow = { previewStale: false, batch: { status: 'preview_ready', active_job_id: null }, preview: { unsupportedFields: [], preview: {
    stale: false, rows: [{ unsupportedFields: [] }], rows_page: { next_cursor: null, total_count: 1 },
    summary: { validation_status: 'valid', blockers: [], warnings: [{ code: 'NON_BLOCKING' }] },
  } } }
  assert.equal(previewCanContinue(flow), true)
  assert.equal(previewCanContinue({ ...flow, previewStale: true }), false)
  for (const mutate of [p => p.stale = true, p => p.summary.blockers = [{}], p => p.summary.validation_status = 'blocked', p => p.rows_page.next_cursor = 'more', p => p.rows_page.total_count = 2, p => p.rows[0].unsupportedFields = ['new-field']]) {
    const changed = structuredClone(flow); mutate(changed.preview.preview)
    assert.equal(previewCanContinue(changed), false)
  }
})

test('012 permission, retired profile, stale preview, CAS conflict and system errors remain distinct', () => {
  for (const [status, code, kind] of [[403, 'WRITE_REVOKED', 'permission'], [409, 'PROFILE_RETIRED', 'profile'], [409, 'PREVIEW_STALE', 'stale'], [412, 'PROFILE_REVISION_CONFLICT', 'conflict'], [503, 'WORKER_FAILURE', 'system']]) {
    assert.equal(importFault(new HttpError('contract', code, status, { code, message: code, details: {} })).kind, kind)
  }
})

import { analyzeAssessment } from '../src/features/import-data/importExperience'
test('012 Analyze distinguishes source resolution, candidate ambiguity, drift, retirement and provider failure from a failed job', () => {
  const batch = { processing: false, batch: { status: 'review_required', active_job_id: null } }
  for (const [code, state] of [['SOURCE_CONTEXT_REQUIRED', 'source_required'], ['PROFILE_MATCH_AMBIGUOUS', 'profile_ambiguous'], ['PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT', 'profile_drift'], ['MAPPING_VERSION_RETIRED', 'profile_retired']]) {
    assert.equal(analyzeAssessment(batch, { summary: { blockers: [{ code }], binding_refs: [], sheets: [] } }), state)
  }
  const flow = { summary: { blockers: [], sheets: [{ suggestion_diagnostic: { status: 'unavailable' } }], binding_refs: [] } }
  assert.equal(analyzeAssessment(batch, flow), 'provider_unavailable')
  assert.equal(analyzeAssessment({ ...batch, batch: { status: 'failed' } }, flow), 'failed')
})
