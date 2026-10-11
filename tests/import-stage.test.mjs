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
