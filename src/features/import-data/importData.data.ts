import { HttpError, requestJson, requestMultipart } from '../../shared/http/httpClient'
import { createMockImportDataSource } from './importData.fixtures'
import { importFileLimits } from './importData.files'
import type {
  AnalyzeIntent, DraftIntent, ImportDataSource, ImportDataSourceOptions, UploadIntent,
} from './importData.types'
import {
  isImportBusinessDate, isImportUuid, isImportVersion, validateImportAnalyze,
  validateImportBatch, validateImportDraft, validateImportUpload, validateImportUploadRejected,
} from './importData.validation'

export class ImportDependencyError extends Error {
  readonly code: 'STORE_REQUIRED'

  constructor(code: ImportDependencyError['code'], message: string) {
    super(message)
    this.name = 'ImportDependencyError'
    this.code = code
  }
}

function requireId(value: string, label: string): void {
  if (!isImportUuid(value)) throw new Error(`${label} phải là UUID canonical của máy chủ.`)
}

function requireKey(key: string): void {
  if (!isImportUuid(key)) throw new Error('Idempotency-Key phải là UUID canonical và giữ nguyên khi thử lại.')
}

function validateDraftIntent(storeId: string, intent: DraftIntent): void {
  if (!storeId) {
    throw new ImportDependencyError('STORE_REQUIRED', 'Chưa có Store để tạo lô nhập. Cần Store hợp lệ từ phiên làm việc.')
  }
  requireId(storeId, 'Store')
  requireKey(intent.key)
  if (!isImportBusinessDate(intent.dataDate)) throw new Error('Ngày dữ liệu chưa hợp lệ.')
}

function validateUploadIntent(importId: string, intent: UploadIntent): void {
  requireId(importId, 'Lô nhập')
  requireKey(intent.key)
  if (!Array.isArray(intent.items) || intent.items.length < 1 || intent.items.length > importFileLimits.count ||
    new Set(intent.items.map((item) => item.clientFileId)).size !== intent.items.length ||
    !intent.items.every((item) => isImportUuid(item.clientFileId) && item.file instanceof File)) {
    throw new Error('Mỗi lần tải lên cần 1–20 file, mỗi file có client_file_id UUID riêng.')
  }
  // Extension/size UX checks belong to local selection. They must not reinterpret
  // committed per-item server admission or turn a partial outcome into a rollback.
}

function validateAnalyzeIntent(importId: string, intent: AnalyzeIntent): void {
  requireId(importId, 'Lô nhập')
  requireKey(intent.key)
  if (!isImportVersion(intent.importRevision) || !isImportVersion(intent.fileSetVersion) ||
    !Array.isArray(intent.acceptedFileIds) || !intent.acceptedFileIds.length ||
    !intent.acceptedFileIds.every(isImportUuid) || new Set(intent.acceptedFileIds).size !== intent.acceptedFileIds.length ||
    !Array.isArray(intent.rejectedClientFileIds) || !intent.rejectedClientFileIds.every(isImportUuid) ||
    new Set(intent.rejectedClientFileIds).size !== intent.rejectedClientFileIds.length) {
    throw new Error('Phân tích cần phiên bản hiện tại và toàn bộ ID nguồn đã nhận, cùng xác nhận file bị từ chối.')
  }
}

/** One adapter per mounted Import workspace. API never falls back to fixtures. */
export function createImportDataSource(options: ImportDataSourceOptions): ImportDataSource {
  if (options.dataSource === 'mock') {
    const mock = createMockImportDataSource()
    return {
      async createDraft(storeId, intent) { validateDraftIntent(storeId, intent); return mock.createDraft(storeId, intent) },
      async upload(importId, intent) { validateUploadIntent(importId, intent); return mock.upload(importId, intent) },
      async read(importId, cursor) { requireId(importId, 'Lô nhập'); return mock.read(importId, cursor) },
      async analyze(importId, intent) { validateAnalyzeIntent(importId, intent); return mock.analyze(importId, intent) },
    }
  }
  if (options.dataSource !== 'api') throw new Error('Nguồn Import phải là mock hoặc api.')

  return {
    async createDraft(storeId, intent) {
      validateDraftIntent(storeId, intent)
      const response = await requestJson<unknown>(options.apiBaseUrl,
        `/api/v1/stores/${storeId}/imports`, {
          method: 'POST', headers: { 'Idempotency-Key': intent.key }, body: { data_date: intent.dataDate },
          getCsrfToken: options.getCsrfToken,
        })
      return validateImportDraft(response, storeId, intent.dataDate)
    },
    async upload(importId, intent) {
      validateUploadIntent(importId, intent)
      const body = new FormData()
      for (const item of intent.items) {
        body.append('files[]', item.file, item.file.name)
        body.append('client_file_ids[]', item.clientFileId)
      }
      const headers = { 'Idempotency-Key': intent.key }
      try {
        const response = await requestMultipart<unknown>(options.apiBaseUrl,
          `/api/v1/imports/${importId}/files`, { method: 'POST', body, headers, timeoutMs: 120_000, getCsrfToken: options.getCsrfToken })
        return validateImportUpload(response, importId, intent)
      } catch (error) {
        if (error instanceof HttpError && error.status === 422 && error.problem?.code === 'UPLOAD_REJECTED') {
          return validateImportUploadRejected(error, importId, intent)
        }
        throw error
      }
    },
    async read(importId, cursor) {
      requireId(importId, 'Lô nhập')
      const query = new URLSearchParams()
      if (cursor !== undefined) {
        if (!cursor) throw new Error('Con trỏ phân trang Import không được rỗng.')
        query.set('files_cursor', cursor)
      }
      // Do not set files_limit: production uses the server default, not a QA page size.
      const suffix = query.size ? `?${query}` : ''
      const response = await requestJson<unknown>(options.apiBaseUrl, `/api/v1/imports/${importId}${suffix}`)
      return validateImportBatch(response, importId)
    },
    async analyze(importId, intent) {
      validateAnalyzeIntent(importId, intent)
      const response = await requestJson<unknown>(options.apiBaseUrl, `/api/v1/imports/${importId}/analyze`, {
        method: 'POST', headers: { 'Idempotency-Key': intent.key, 'If-Match': `"${intent.importRevision}"` },
        getCsrfToken: options.getCsrfToken,
        body: {
          file_set_version: intent.fileSetVersion,
          accepted_file_ids: intent.acceptedFileIds,
          acknowledged_rejected_client_file_ids: intent.rejectedClientFileIds,
        },
      })
      return validateImportAnalyze(response, importId)
    },
  }
}
