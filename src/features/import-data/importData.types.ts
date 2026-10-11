import type { Pagination } from '../../shared/http/http.types'

// Contract V1 Import §§4/6/9.1/9.3/10 + accepted batch-mechanics supplement.
// Versions are opaque server values: never increment or infer accepted quota from them.
export type ImportBatchStatus =
  | 'draft' | 'uploaded' | 'analyzing' | 'review_required' | 'ready_for_preview'
  | 'previewing' | 'preview_ready' | 'blocked' | 'committing'
  | 'completed' | 'completed_with_warnings' | 'failed'

export type ImportWarning = {
  code: string
  message: string
  severity: 'WARNING' | 'ERROR'
  field?: string | null
  entity?: string | null
  impact?: string | null
  source_location?: Record<string, unknown> | null
}

export type ImportItemError = {
  code: string
  message: string
  approval_request_allowed: false
  details?: Record<string, unknown>
}

export type ImportFileReceipt = {
  client_file_id: string
  file_id: string | null
  filename: string
  type: 'csv' | 'xlsx' | 'unknown'
  size_bytes: number
  content_digest: string | null
  upload_status: 'uploaded' | 'rejected'
  error: ImportItemError | null
}

export type ImportFileView = ImportFileReceipt & {
  parse_status: 'not_started' | 'parsed' | 'failed'
}

export type ImportDraft = {
  import_id: string
  display_number: string
  store_id: string
  data_date: string
  status: ImportBatchStatus
  import_revision: string
  created_at: string
  imported_at: string | null
  file_count: number
  file_set_version: string
}

export type ImportQuota = {
  accepted_file_count: number
  accepted_total_bytes: number
  remaining_file_slots: number
  remaining_bytes: number
}

export type ImportSourceSet = {
  version: string
  sealed: boolean
  accepted_file_ids: string[]
  digest: string
}

export type ImportBatch = ImportDraft & {
  quota: ImportQuota
  active_job_id: string | null
  files: ImportFileView[]
  files_page: Pagination
  source_set: ImportSourceSet
  allowed_actions: string[]
  preview: Record<string, unknown> | null
  completion_available: boolean
  configurations: Record<string, unknown> | null
  review_confirmation: Record<string, unknown> | null
  confirmation_usable: boolean
  // Read envelope scheduling hint; it never grants an action or changes source state.
  poll_after_ms: number | null
}

export type DraftIntent = { key: string; dataDate: string }
export type UploadIntent = {
  key: string
  // Keep these File references, IDs and their order unchanged for a response-loss retry.
  items: { clientFileId: string; file: File }[]
}
export type AnalyzeIntent = {
  key: string
  importRevision: string
  fileSetVersion: string
  acceptedFileIds: string[]
  rejectedClientFileIds: string[]
}

export type ImportUploadResult = {
  import_id: string
  import_revision: string
  file_set_version: string
  items: ImportFileReceipt[]
  warnings: ImportWarning[]
  // Both 200 per-item results and committed UPLOAD_REJECTED/422 share this boundary.
  allRejected: boolean
}

export type ImportAnalyzeResult = {
  import_id: string
  analysis_id: string
  job_id: string
  status: 'analyzing'
  import_revision?: string
  file_set_version?: string
  poll_after_ms: number | null
}

export type ImportDataSource = {
  createDraft(storeId: string, intent: DraftIntent): Promise<ImportDraft>
  upload(importId: string, intent: UploadIntent): Promise<ImportUploadResult>
  read(importId: string, cursor?: string): Promise<ImportBatch>
  analyze(importId: string, intent: AnalyzeIntent): Promise<ImportAnalyzeResult>
}

export type ImportDataSourceOptions = {
  dataSource: 'mock' | 'api'
  apiBaseUrl: string
  getCsrfToken?: () => string | null | undefined | Promise<string | null | undefined>
}
