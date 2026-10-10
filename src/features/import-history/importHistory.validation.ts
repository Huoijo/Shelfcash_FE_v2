import { HttpError, isRecord } from '../../shared/http/httpClient'
import { isBusinessDate, statusLabels } from './importHistory.format'
import type { CalendarResponse, HistoryResponse } from './importHistory.types'

const count = (value: unknown) => value === null || (Number.isSafeInteger(value) && Number(value) >= 0)
const uuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
const timestamp = (value: unknown) => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value) && !Number.isNaN(Date.parse(value))

function validEnvelope(value: unknown): value is { data: Record<string, unknown>; meta: Record<string, unknown>; error: null } {
  return isRecord(value) && value.error === null && isRecord(value.data) && isRecord(value.meta) &&
    typeof value.meta.request_id === 'string' && Array.isArray(value.meta.warnings) &&
    value.meta.warnings.every((warning) => isRecord(warning) && typeof warning.code === 'string' &&
      typeof warning.message === 'string' && isRecord(warning.details) &&
      warning.severity === 'WARNING' && 'field' in warning && 'entity' in warning && 'impact' in warning)
}

function invalid(): never {
  throw new HttpError('protocol', 'Dữ liệu lịch sử không đúng contract H01/H02. Vui lòng thử lại hoặc liên hệ hỗ trợ.')
}

export function validateCalendar(value: unknown, month: string): CalendarResponse {
  if (!validEnvelope(value)) return invalid()
  const data = value.data
  if (data.month !== month || data.grouped_by !== 'imported_at' || typeof data.timezone !== 'string' ||
    !count(data.matched_import_count) || !count(data.unfiltered_import_count) || !Array.isArray(data.days) ||
    !data.days.every((day) => isRecord(day) && isBusinessDate(day.date) && day.date.startsWith(`${month}-`) && count(day.import_count))) return invalid()
  try { new Intl.DateTimeFormat('vi', { timeZone: data.timezone }) } catch { return invalid() }
  return value as unknown as CalendarResponse
}

export function validateHistory(value: unknown): HistoryResponse {
  if (!validEnvelope(value)) return invalid()
  const page = value.meta.pagination
  if (!Array.isArray(value.data.items) || !count(value.meta.unfiltered_date_count) || !isRecord(page) ||
    !Number.isSafeInteger(page.limit) || Number(page.limit) < 1 || Number(page.limit) > 100 ||
    !(page.next_cursor === null || (typeof page.next_cursor === 'string' && page.next_cursor.length > 0)) ||
    !count(page.total_count) || !value.data.items.every((row) =>
      isRecord(row) && uuid(row.import_id) && typeof row.display_number === 'string' &&
      isBusinessDate(row.data_date) && timestamp(row.imported_at) && count(row.file_count) &&
      typeof row.status === 'string' && Object.hasOwn(statusLabels, row.status),
    )) return invalid()
  return value as unknown as HistoryResponse
}
