import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ImportLocatorVisit, importLocatorMismatch } from '../src/features/import-data/importFlow.locator'
import { ImportBatchWorkflow } from '../src/features/import-data/importData.workflow'
import { HttpError } from '../src/shared/http/httpClient'

const id = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`
const A = id(1), B = id(2), C = id(3)

test('failed A→B hydration keeps URL B mismatched with retained A and suppresses automatic repeat', () => {
  const visits = new ImportLocatorVisit()
  assert.equal(visits.claim('/imports', A, A, false), false)
  assert.equal(importLocatorMismatch(A, A), false)
  assert.equal(visits.claim('/imports', B, A, false), true)
  // A failed authorized read must not turn retained A into URL B business state.
  assert.equal(importLocatorMismatch(B, A), true)
  assert.equal(visits.claim('/imports', B, A, false), false)
  assert.equal(importLocatorMismatch(B, undefined), true)
})

test('automatic attempt is suppressed only for the same continuous pathname/locator visit', () => {
  const visits = new ImportLocatorVisit()
  assert.equal(visits.claim('/imports', A, undefined, false), true)
  assert.equal(visits.claim('/imports', A, undefined, false), false)
  assert.equal(visits.claim('/imports/history', A, undefined, false), false)
  assert.equal(visits.claim('/imports', A, undefined, false), true)
  assert.equal(visits.claim('/imports', null, undefined, false), false)
  assert.equal(visits.claim('/imports', A, undefined, false), true)
})

test('new-draft suppression followed by URL removal/new B and History A permits resuming A', () => {
  const visits = new ImportLocatorVisit()
  assert.equal(visits.claim('/imports', A, A, false), false)
  visits.suppress('/imports', A)
  // The render before URL removal must not immediately reopen the previous batch.
  assert.equal(visits.claim('/imports', A, undefined, false), false)
  assert.equal(visits.claim('/imports', null, undefined, false), false)
  // I01 publishes known B as a locator; this is not a server resume instruction.
  assert.equal(visits.claim('/imports', B, B, false), false)
  assert.equal(visits.claim('/imports/history', null, B, false), false)
  assert.equal(visits.claim('/imports', A, B, false), true)
  assert.equal(importLocatorMismatch(A, B), true)
})

test('B→C navigation while busy waits, then claims current C rather than repeating old B', () => {
  const visits = new ImportLocatorVisit()
  assert.equal(visits.claim('/imports', B, A, false), true)
  assert.equal(visits.claim('/imports', C, A, true), false)
  assert.equal(visits.claim('/imports', C, B, true), false)
  // B may finish hydration after navigation, but C remains the requested locator.
  assert.equal(importLocatorMismatch(C, B), true)
  assert.equal(visits.claim('/imports', C, B, false), true)
  assert.equal(visits.claim('/imports', C, B, false), false)
  assert.equal(importLocatorMismatch(C, C), false)
})

test('known I01 draft locator never triggers auto-resume or replaces selected files/intent', async () => {
  const visits = new ImportLocatorVisit()
  const selectedFile = new File(['a,b\n1,2'], 'local.csv', { type: 'text/csv' })
  const creates = []; let reads = 0, uploads = 0
  const workflow = new ImportBatchWorkflow({
    async createDraft(storeId, intent) {
      creates.push(intent)
      return { import_id: B, display_number: 'IMP-SYNTHETIC', store_id: storeId, data_date: intent.dataDate,
        status: 'draft', import_revision: 'draft-v1', created_at: '2026-10-11T01:00:00Z', imported_at: null,
        file_count: 0, file_set_version: 'files-v1' }
    },
    async read() { reads++; throw new HttpError('transport', 'I04 unavailable after accepted I01') },
    async upload() { uploads++; throw new Error('must not upload without fresh I04') },
    async analyze() { throw new Error('must not analyze') },
  }, id(5))
  workflow.setDataDate('2026-10-11'); workflow.setFiles([selectedFile]); await workflow.upload()
  const retained = workflow.getSnapshot(), originalFiles = retained.files
  const readsBeforeLocator = reads
  assert.equal(retained.draft.import_id, B)
  if (visits.claim('/imports', B, retained.draft.import_id, retained.busy)) await workflow.resume(B)
  assert.ok(readsBeforeLocator >= 1)
  assert.equal(reads, readsBeforeLocator)
  assert.equal(creates.length, 1)
  assert.equal(uploads, 0)
  assert.equal(workflow.getSnapshot().files, originalFiles)
  assert.equal(workflow.getSnapshot().files[0], selectedFile)
  // Until the I04 read succeeds the loaded-batch mismatch remains guarded.
  assert.equal(importLocatorMismatch(B, undefined), true)
})

test('absent locators never mismatch and busy visits do not consume a future attempt', () => {
  const visits = new ImportLocatorVisit()
  assert.equal(importLocatorMismatch(null, A), false)
  assert.equal(importLocatorMismatch(null, undefined), false)
  assert.equal(visits.claim('/imports', null, undefined, false), false)
  assert.equal(visits.claim('/imports', C, undefined, true), false)
  assert.equal(visits.claim('/imports', C, undefined, false), true)
})
