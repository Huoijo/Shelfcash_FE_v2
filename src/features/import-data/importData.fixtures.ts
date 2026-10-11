import { HttpError } from '../../shared/http/httpClient'
import { importFileLimits } from './importData.files'
import type {
  AnalyzeIntent, ImportAnalyzeResult, ImportBatch, ImportDataSource, ImportDraft,
  ImportFileView, ImportUploadResult, ImportWarning,
} from './importData.types'
import {
  validateImportAnalyze, validateImportBatch, validateImportDraft,
  validateImportUpload, validateImportUploadRejected,
} from './importData.validation'

export const mockImportStoreId = 'f17e0000-0000-4000-8000-000000000000'
const mockTimestamp = '2026-10-10T01:00:00Z'
const emptySourceDigest = 'sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'

type MockRecord = {
  batch: ImportBatch
  rawByClient: Map<string, { digest: string; filename: string }>
}
type MockReceipt = { fingerprint: string; value: unknown; rejected: boolean }

function mockEnvelope(data: unknown, pollAfter: number | null = null) {
  return {
    data, error: null,
    meta: { request_id: 'mock-import-ui-fixture', warnings: [], pagination: null, poll_after_ms: pollAfter },
  }
}

function mockFailure(status: number, code: string): never {
  throw new HttpError('contract', code, status, {
    code, message: code, details: { approval_request_allowed: false },
  })
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && new Set(a).size === a.length && new Set(b).size === b.length &&
    a.every((id) => b.includes(id))
}

async function contentDigest(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

function normalizeFilename(filename: string): string {
  return filename.replace(/\\/g, '/').split('/').at(-1)!.slice(0, 255)
}

/** Explicit UI/QA fixture adapter; no storage, timers, HTTP simulation or canonical writers.
 * State is isolated to this adapter instance and disappears on browser refresh.
 * Admission examples exercise receipts/quota only; they do not parse or validate business data.
 */
export function createMockImportDataSource(): ImportDataSource {
  let nextIdentity = 1
  let nextRevision = 1
  const batches = new Map<string, MockRecord>()
  const receipts = new Map<string, MockReceipt>()
  const identity = () => `f17e0000-0000-4000-8000-${String(nextIdentity++).padStart(12, '0')}`
  const revision = (kind: string) => `mock-${kind}-${nextRevision++}`

  function batchRecord(importId: string): MockRecord {
    const record = batches.get(importId)
    if (!record) return mockFailure(404, 'RESOURCE_NOT_FOUND')
    return record
  }

  function replay(scope: string, fingerprint: string): MockReceipt | undefined {
    const receipt = receipts.get(scope)
    if (receipt && receipt.fingerprint !== fingerprint) return mockFailure(409, 'IDEMPOTENCY_KEY_REUSED')
    return receipt
  }

  function uploadReceipt(receipt: MockReceipt, importId: string, intent: Parameters<ImportDataSource['upload']>[1]): ImportUploadResult {
    if (!receipt.rejected) return validateImportUpload(structuredClone(receipt.value), importId, intent)
    return validateImportUploadRejected(new HttpError('contract', 'UPLOAD_REJECTED', 422, {
      code: 'UPLOAD_REJECTED', message: 'Tất cả file trong lần tải này bị từ chối.',
      details: structuredClone(receipt.value) as Record<string, unknown>,
    }), importId, intent)
  }

  return {
    async createDraft(storeId, intent) {
      const scope = `draft:${storeId}:${intent.key}`
      const fingerprint = JSON.stringify({ data_date: intent.dataDate })
      const old = replay(scope, fingerprint)
      if (old) return validateImportDraft(structuredClone(old.value), storeId, intent.dataDate)
      const importId = identity()
      const draft: ImportDraft = {
        import_id: importId, display_number: `IMP-${importId}`, store_id: storeId,
        data_date: intent.dataDate, status: 'draft', import_revision: revision('revision'),
        created_at: mockTimestamp, imported_at: null, file_count: 0, file_set_version: revision('set'),
      }
      const batch: ImportBatch = {
        ...draft, quota: {
          accepted_file_count: 0, accepted_total_bytes: 0,
          remaining_file_slots: importFileLimits.count, remaining_bytes: importFileLimits.totalBytes,
        },
        source_set: { version: draft.file_set_version, sealed: false, accepted_file_ids: [], digest: emptySourceDigest },
        files: [], files_page: { limit: 50, next_cursor: null, total_count: 0 },
        active_job_id: null, allowed_actions: ['upload'], preview: null,
        completion_available: false, configurations: null, review_confirmation: null,
        confirmation_usable: false, poll_after_ms: null,
      }
      batches.set(importId, { batch, rawByClient: new Map() })
      const value = mockEnvelope(draft)
      receipts.set(scope, { fingerprint, value, rejected: false })
      return validateImportDraft(value, storeId, intent.dataDate)
    },

    async upload(importId, intent) {
      const record = batchRecord(importId)
      // Ordered byte fingerprint makes identical-intent replay explicit even after seal.
      const inputs = []
      for (const item of intent.items) {
        const bytes = await item.file.arrayBuffer()
        const first = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 8192))
        const extension = /\.xlsx$/i.test(item.file.name) ? 'xlsx' : /\.csv$/i.test(item.file.name) ? 'csv' : 'unknown'
        const zip = first[0] === 0x50 && first[1] === 0x4b
        const type = (extension === 'xlsx' && zip) || (extension === 'csv' && !zip && !first.includes(0)) ? extension : 'unknown'
        inputs.push({ item, digest: await contentDigest(bytes), size: bytes.byteLength, type, filename: normalizeFilename(item.file.name) })
      }
      const scope = `upload:${importId}:${intent.key}`
      const fingerprint = JSON.stringify(inputs.map(({ item, digest, size }) => [item.clientFileId, item.file.name, size, digest]))
      const old = replay(scope, fingerprint)
      if (old) return uploadReceipt(old, importId, intent)
      if (record.batch.source_set.sealed) return mockFailure(409, 'IMPORT_STATE_CONFLICT')
      if (inputs.reduce((bytes, input) => bytes + input.size, 0) > importFileLimits.totalBytes) {
        return mockFailure(413, 'RESOURCE_LIMIT_EXCEEDED')
      }
      // Request-level identity conflicts reject the whole fixture call before changes.
      for (const input of inputs) {
        const prior = record.rawByClient.get(input.item.clientFileId)
        if (prior && (prior.digest !== input.digest || prior.filename !== input.filename)) {
          return mockFailure(409, 'CLIENT_FILE_ID_CONFLICT')
        }
      }
      const warnings: ImportWarning[] = []
      const items: ImportFileView[] = []
      for (const input of inputs) {
        const prior = record.batch.files.find((file) => file.client_file_id === input.item.clientFileId)
        if (prior) { items.push(prior); continue }
        const quota = record.batch.quota
        const errorCode = input.size > importFileLimits.perFileBytes || quota.remaining_file_slots === 0 || input.size > quota.remaining_bytes
          ? 'RESOURCE_LIMIT_EXCEEDED' : input.type === 'unknown' ? 'INVALID_FILE_TYPE' : input.size === 0 ? 'EMPTY_FILE' : null
        const accepted = errorCode === null
        if (accepted && [...batches.values()].some(({ rawByClient, batch }) => batch.store_id === record.batch.store_id &&
          batch.files.some((file) => file.upload_status === 'uploaded' && rawByClient.get(file.client_file_id)?.digest === input.digest))) {
          warnings.push({ code: 'DUPLICATE_CONTENT', message: 'Bytes trùng nguồn đã nhận; đây vẫn là file logic riêng.', details: { client_file_id: input.item.clientFileId } })
        }
        const file: ImportFileView = {
          client_file_id: input.item.clientFileId, file_id: accepted ? identity() : null,
          filename: input.filename, type: input.type as ImportFileView['type'], size_bytes: input.size,
          content_digest: accepted ? input.digest : null, upload_status: accepted ? 'uploaded' : 'rejected',
          error: errorCode ? { code: errorCode, message: errorCode, approval_request_allowed: false } : null,
          parse_status: 'not_started',
        }
        record.batch.files.push(file)
        record.rawByClient.set(input.item.clientFileId, { digest: input.digest, filename: input.filename })
        items.push(file)
        if (accepted) {
          quota.accepted_file_count++
          quota.accepted_total_bytes += input.size
          quota.remaining_file_slots--
          quota.remaining_bytes -= input.size
          record.batch.source_set.accepted_file_ids.push(file.file_id!)
          record.batch.imported_at ??= mockTimestamp
        }
      }
      record.batch.import_revision = revision('revision')
      record.batch.file_set_version = revision('set')
      record.batch.source_set.version = record.batch.file_set_version
      record.batch.source_set.digest = await contentDigest(new TextEncoder().encode(JSON.stringify(
        record.batch.files.filter((file) => file.upload_status === 'uploaded').map((file) => [file.file_id, file.content_digest]),
      )).buffer)
      record.batch.file_count = record.batch.quota.accepted_file_count
      record.batch.status = record.batch.file_count ? 'uploaded' : 'draft'
      record.batch.allowed_actions = record.batch.file_count ? ['upload', 'analyze'] : ['upload']
      const rejected = items.every((item) => item.upload_status === 'rejected')
      const data = {
        import_id: importId, import_revision: record.batch.import_revision,
        file_set_version: record.batch.file_set_version, items, warnings,
      }
      const value = rejected ? {
        items, import_revision: data.import_revision, file_set_version: data.file_set_version,
        approval_request_allowed: false,
      } : mockEnvelope(data)
      const receipt = { fingerprint, value: structuredClone(value), rejected }
      receipts.set(scope, receipt)
      return uploadReceipt(receipt, importId, intent)
    },

    async read(importId, cursor) {
      const batch = batchRecord(importId).batch
      const prefix = `mock-files:${batch.file_set_version}:`
      let offset = 0
      if (cursor !== undefined) {
        if (!cursor.startsWith(prefix) || !/^\d+$/.test(cursor.slice(prefix.length))) return mockFailure(409, 'CURSOR_STALE')
        offset = Number(cursor.slice(prefix.length))
        if (!Number.isSafeInteger(offset) || offset <= 0 || offset >= batch.files.length || offset % 50 !== 0) {
          return mockFailure(422, 'INVALID_CURSOR')
        }
      }
      return validateImportBatch(mockEnvelope({
        ...structuredClone(batch), files: structuredClone(batch.files.slice(offset, offset + 50)),
        files_page: {
          limit: 50, next_cursor: offset + 50 < batch.files.length ? `${prefix}${offset + 50}` : null,
          total_count: batch.files.length,
        },
      }, batch.poll_after_ms), importId)
    },

    async analyze(importId, intent: AnalyzeIntent) {
      const batch = batchRecord(importId).batch
      const fingerprint = JSON.stringify(intent)
      const scope = `analyze:${importId}:${intent.key}`
      const old = replay(scope, fingerprint)
      if (old) return validateImportAnalyze(structuredClone(old.value), importId)
      if (intent.importRevision !== batch.import_revision) return mockFailure(412, 'IMPORT_REVISION_CONFLICT')
      if (intent.fileSetVersion !== batch.file_set_version ||
        !sameSet(intent.acceptedFileIds, batch.source_set.accepted_file_ids) ||
        !sameSet(intent.rejectedClientFileIds, batch.files.filter((file) => file.upload_status === 'rejected').map((file) => file.client_file_id))) {
        return mockFailure(422, 'INVALID_IMPORT_CONFIGURATION')
      }
      if (!batch.file_count) return mockFailure(409, 'NO_UPLOADED_FILES')
      if (!batch.allowed_actions.includes('analyze')) return mockFailure(409, 'IMPORT_STATE_CONFLICT')
      batch.source_set.sealed = true
      batch.status = 'analyzing'
      batch.import_revision = revision('revision')
      batch.active_job_id = identity()
      batch.allowed_actions = []
      const result: ImportAnalyzeResult = {
        import_id: importId, analysis_id: identity(), job_id: batch.active_job_id,
        status: 'analyzing', import_revision: batch.import_revision,
        file_set_version: batch.file_set_version, poll_after_ms: null,
      }
      const value = mockEnvelope(result)
      receipts.set(scope, { fingerprint, value: structuredClone(value), rejected: false })
      // Fixed UI fixture ends at accepted analysis; it does not run a fake worker.
      return validateImportAnalyze(value, importId)
    },
  }
}
