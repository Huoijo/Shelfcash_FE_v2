import { HttpError, isRecord } from '../../shared/http/httpClient'
import { importFileLimits } from './importData.files'
import type {
  ImportAnalyzeResult, ImportBatch, ImportDraft, ImportFileReceipt,
  ImportFileView, ImportUploadResult, ImportWarning, UploadIntent,
} from './importData.types'

const statuses = new Set([
  'draft', 'uploaded', 'analyzing', 'review_required', 'ready_for_preview',
  'previewing', 'preview_ready', 'blocked', 'committing', 'completed',
  'completed_with_warnings', 'failed',
])

export const isImportUuid = (value: unknown): value is string => typeof value === 'string' &&
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
export const isImportVersion = (value: unknown): value is string => typeof value === 'string' &&
  value.length > 0 && value.length <= 128
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const digest = (value: unknown): value is string => typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value)
const timestamp = (value: unknown): value is string => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?Z$/.test(value) &&
  isImportBusinessDate(value.slice(0, 10)) && !Number.isNaN(Date.parse(value))
const optionalRecord = (value: unknown) => value === null || isRecord(value)

export function isImportBusinessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !value.startsWith('0000-') && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function invalid(surface: string): never {
  throw new HttpError('protocol', `Phản hồi ${surface} không đúng contract Import. Vui lòng tải lại trạng thái lô.`)
}

function warning(value: unknown): value is ImportWarning {
  return isRecord(value) && text(value.code) && text(value.message) &&
    (value.severity === undefined || value.severity === 'WARNING') && isRecord(value.details)
}

function envelope(value: unknown, surface: string): {
  data: Record<string, unknown>
  meta: Record<string, unknown>
} {
  if (!isRecord(value) || value.error !== null || !isRecord(value.data) || !isRecord(value.meta) ||
    !text(value.meta.request_id) || !Array.isArray(value.meta.warnings) || !value.meta.warnings.every(warning) ||
    (value.meta.poll_after_ms !== undefined && value.meta.poll_after_ms !== null && !count(value.meta.poll_after_ms))) {
    return invalid(surface)
  }
  return { data: value.data, meta: value.meta }
}

function draftFields(value: Record<string, unknown>): boolean {
  return isImportUuid(value.import_id) && text(value.display_number) && isImportUuid(value.store_id) &&
    isImportBusinessDate(value.data_date) && typeof value.status === 'string' && statuses.has(value.status) &&
    isImportVersion(value.import_revision) && timestamp(value.created_at) &&
    (value.imported_at === null || timestamp(value.imported_at)) && count(value.file_count) &&
    value.file_count <= importFileLimits.count && isImportVersion(value.file_set_version)
}

function fileReceipt(value: unknown, isView = false): value is ImportFileReceipt {
  if (!isRecord(value) || !isImportUuid(value.client_file_id) || !text(value.filename) ||
    typeof value.type !== 'string' || !['csv', 'xlsx', 'unknown'].includes(value.type) || !count(value.size_bytes)) return false
  const itemError = value.error === null || (isRecord(value.error) && text(value.error.code) &&
    text(value.error.message) && value.error.approval_request_allowed === false &&
    (value.error.details === undefined || isRecord(value.error.details)))
  if (!itemError) return false
  if (value.upload_status === 'uploaded') {
    return isImportUuid(value.file_id) && digest(value.content_digest) && value.type !== 'unknown' &&
      value.size_bytes > 0 && value.size_bytes <= importFileLimits.perFileBytes && (isView || value.error === null)
  }
  return value.upload_status === 'rejected' && value.file_id === null && value.content_digest === null && value.error !== null
}

function fileView(value: unknown): value is ImportFileView {
  return isRecord(value) && typeof value.parse_status === 'string' && ['not_started', 'parsed', 'failed'].includes(value.parse_status) &&
    fileReceipt(value, true)
}

function uniqueIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isImportUuid) && new Set(value).size === value.length
}

function pagination(value: unknown): boolean {
  return isRecord(value) && count(value.limit) && value.limit >= 1 && value.limit <= 100 &&
    (value.next_cursor === null || text(value.next_cursor)) && (value.total_count === null || count(value.total_count))
}

export function validateImportDraft(value: unknown, storeId: string, dataDate: string): ImportDraft {
  const { data } = envelope(value, 'I01')
  if (!draftFields(data) || data.store_id !== storeId || data.data_date !== dataDate ||
    data.status !== 'draft' || data.file_count !== 0 || data.imported_at !== null) return invalid('I01')
  return data as ImportDraft
}

export function validateImportBatch(value: unknown, importId: string): ImportBatch {
  const { data, meta } = envelope(value, 'I04')
  if (!draftFields(data) || data.import_id !== importId || !isRecord(data.quota) ||
    !isRecord(data.source_set) || !Array.isArray(data.files) || !data.files.every(fileView) ||
    !pagination(data.files_page) || !(data.active_job_id === null || isImportUuid(data.active_job_id)) ||
    !Array.isArray(data.allowed_actions) || !data.allowed_actions.every(text) ||
    new Set(data.allowed_actions).size !== data.allowed_actions.length ||
    !optionalRecord(data.preview) || typeof data.completion_available !== 'boolean' ||
    !optionalRecord(data.configurations) || !optionalRecord(data.review_confirmation) ||
    typeof data.confirmation_usable !== 'boolean') return invalid('I04')
  const quota = data.quota
  const source = data.source_set
  if (!count(quota.accepted_file_count) || !count(quota.accepted_total_bytes) ||
    !count(quota.remaining_file_slots) || !count(quota.remaining_bytes) ||
    quota.accepted_file_count !== data.file_count ||
    quota.accepted_file_count + quota.remaining_file_slots !== importFileLimits.count ||
    quota.accepted_total_bytes + quota.remaining_bytes !== importFileLimits.totalBytes ||
    !isImportVersion(source.version) || source.version !== data.file_set_version ||
    typeof source.sealed !== 'boolean' || !uniqueIds(source.accepted_file_ids) ||
    source.accepted_file_ids.length !== quota.accepted_file_count || !digest(source.digest)) return invalid('I04')
  const clientIds = data.files.map((file) => file.client_file_id)
  const fileIds = data.files.filter((file) => file.upload_status === 'uploaded').map((file) => file.file_id)
  const acceptedIds = source.accepted_file_ids
  const page = data.files_page as Record<string, unknown>
  if (new Set(clientIds).size !== clientIds.length || new Set(fileIds).size !== fileIds.length ||
    fileIds.some((id) => id === null || !acceptedIds.includes(id)) ||
    data.files.length > Number(page.limit) ||
    (page.total_count !== null && (Number(page.total_count) < data.files.length || Number(page.total_count) < Number(data.file_count))) ||
    (source.sealed && data.allowed_actions.includes('upload'))) return invalid('I04')
  // Whole-batch metadata is checked for coherence, never computed from the visible page.
  return { ...data, poll_after_ms: meta.poll_after_ms ?? null } as ImportBatch
}

function uploadFields(
  value: Record<string, unknown>, importId: string, intent: UploadIntent, allRejected: boolean,
): ImportUploadResult {
  if (!isImportVersion(value.import_revision) || !isImportVersion(value.file_set_version) ||
    !Array.isArray(value.items) || value.items.length !== intent.items.length || !value.items.every((item) => fileReceipt(item)) ||
    !value.items.every((item, index) => item.client_file_id === intent.items[index].clientFileId) ||
    new Set(value.items.map((item) => item.client_file_id)).size !== value.items.length ||
    (allRejected ? value.items.some((item) => item.upload_status !== 'rejected') :
      !value.items.some((item) => item.upload_status === 'uploaded'))) return invalid('I02')
  const warnings = value.warnings === undefined ? [] : value.warnings
  if (!Array.isArray(warnings) || !warnings.every(warning)) return invalid('I02')
  return {
    import_id: importId, import_revision: value.import_revision,
    file_set_version: value.file_set_version, items: value.items, warnings, allRejected,
  }
}

export function validateImportUpload(value: unknown, importId: string, intent: UploadIntent): ImportUploadResult {
  const { data } = envelope(value, 'I02')
  if (data.import_id !== importId || !Array.isArray(data.warnings)) return invalid('I02')
  return uploadFields(data, importId, intent, false)
}

export function validateImportUploadRejected(error: HttpError, importId: string, intent: UploadIntent): ImportUploadResult {
  if (error.status !== 422 || error.problem?.code !== 'UPLOAD_REJECTED' ||
    !isRecord(error.problem.details) || error.problem.details.approval_request_allowed !== false) return invalid('I02 UPLOAD_REJECTED')
  // Error details have no import_id; bind the committed receipts to the requested route.
  return uploadFields(error.problem.details, importId, intent, true)
}

export function validateImportAnalyze(value: unknown, importId: string): ImportAnalyzeResult {
  const { data, meta } = envelope(value, 'I03')
  if (data.import_id !== importId || !isImportUuid(data.analysis_id) || !isImportUuid(data.job_id) ||
    data.status !== 'analyzing' ||
    (data.import_revision !== undefined && !isImportVersion(data.import_revision)) ||
    (data.file_set_version !== undefined && !isImportVersion(data.file_set_version))) return invalid('I03')
  return { ...data, poll_after_ms: meta.poll_after_ms ?? null } as ImportAnalyzeResult
}
