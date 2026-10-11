import { config } from '../../app/config'
import { HttpError, requestJson } from '../../shared/http/httpClient'
import {
  calendarFixture, emptyHistoryFixture, fixtureFiles, fixtureInitialDate,
  fixtureTimezone, historyErrorFixture, historyFixture, historyRows,
} from './importHistory.fixtures'
import { storeDate } from './importHistory.format'
import type { CalendarRequest, CalendarResponse, HistoryFilters, HistoryRequest, HistoryResponse, ImportHistoryRow } from './importHistory.types'
import { validateCalendar, validateHistory } from './importHistory.validation'

export const historySource = {
  // Initial browsing date, not a claim about the Store's current business date.
  initialDate: config.dataSource === 'mock' ? fixtureInitialDate : `${new Date().toISOString().slice(0, 7)}-01`,
  label: config.dataSource === 'mock' ? 'Dữ liệu minh họa · Tháng 10/2026' : 'Dữ liệu từ máy chủ',
}

function historyPath(storeId: string | null, suffix: string, params: CalendarRequest | HistoryRequest): string {
  if (!storeId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(storeId)) {
    throw new Error('Chưa có Store hợp lệ từ phiên làm việc để đọc lịch sử.')
  }
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  return `/api/v1/stores/${storeId}/imports${suffix}?${query}`
}

function waitForFixture(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, 400)
    signal.addEventListener('abort', abort, { once: true })
  })
}

// Select static examples only; no parsing, normalization, writes or domain engine.
function matches(row: ImportHistoryRow, filters: HistoryFilters): boolean {
  const terminal = ['completed', 'completed_with_warnings', 'failed'].includes(row.status)
  const statusMatches = !filters.status || (filters.status === 'in_progress' ? !terminal : row.status === filters.status)
  const fileMatches = fixtureFiles[row.display_number].some((file) =>
    (!filters.category || file.category === filters.category) &&
    (!filters.q || file.filename.toLowerCase().includes(filters.q.toLowerCase())),
  )
  return statusMatches && fileMatches
}

export async function getImportCalendar(params: CalendarRequest, signal: AbortSignal, storeId: string | null): Promise<CalendarResponse> {
  if (config.dataSource === 'api') {
    const response = await requestJson<unknown>(config.apiBaseUrl, historyPath(storeId, '/calendar', params), { signal })
    return validateCalendar(response, params.month)
  }
  await waitForFixture(signal)
  const monthRows = historyRows.filter((row) => storeDate(row.imported_at, fixtureTimezone).startsWith(params.month))
  const matched = monthRows.filter((row) => matches(row, params))
  const days = new Map<string, number>()
  matched.forEach((row) => {
    const date = storeDate(row.imported_at, fixtureTimezone)
    days.set(date, (days.get(date) ?? 0) + 1)
  })
  return {
    ...calendarFixture,
    data: {
      ...calendarFixture.data, month: params.month,
      matched_import_count: matched.length, unfiltered_import_count: monthRows.length,
      days: [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, import_count]) => ({ date, import_count })),
    },
  }
}

export async function getImportHistory(params: HistoryRequest, signal: AbortSignal, storeId: string | null): Promise<HistoryResponse> {
  if (config.dataSource === 'api') {
    const response = await requestJson<unknown>(config.apiBaseUrl, historyPath(storeId, '', params), { signal })
    return validateHistory(response)
  }
  await waitForFixture(signal)
  const limit = params.limit ?? 50
  const dayRows = historyRows.filter((row) => storeDate(row.imported_at, fixtureTimezone) === params.import_date)
  const matched = dayRows.filter((row) => matches(row, params)).sort((a, b) =>
    b.imported_at.localeCompare(a.imported_at) || a.import_id.localeCompare(b.import_id),
  )
  const pages = Array.from({ length: Math.ceil(matched.length / limit) }, (_, i) => `fixture-page-${i * limit}`)
  const offset = params.cursor ? pages.indexOf(params.cursor) * limit : 0
  if (offset < 0) throw new HttpError('contract', historyErrorFixture.error.message, 422, historyErrorFixture.error)
  return {
    ...(matched.length ? historyFixture : emptyHistoryFixture),
    data: { items: matched.slice(offset, offset + limit) },
    meta: {
      ...historyFixture.meta, unfiltered_date_count: dayRows.length,
      pagination: {
        limit, next_cursor: offset + limit < matched.length ? `fixture-page-${offset + limit}` : null,
        // Exercise unknown totals independently from known calendar aggregates.
        total_count: matched.length ? null : 0,
      },
    },
  }
}
