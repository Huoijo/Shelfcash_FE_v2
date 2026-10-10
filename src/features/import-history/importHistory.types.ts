import type { ApiSuccess, Pagination } from '../../shared/http/http.types'

// Authority: IMPORT_MAPPING v1 §§3/4/9/11 and handoff §6.
// H01/H02 field definitions are retained from the linked FE0 §5; V1 overrides
// resource IDs (UUID), timestamps (UTC), lifecycle and in_progress filtering.
export type BusinessDate = string
export type Timestamp = string
export type ImportCategory = 'sales' | 'inventory' | 'recipes' | 'supplier'
export type ImportStatus =
  | 'uploaded' | 'analyzing' | 'review_required' | 'ready_for_preview'
  | 'previewing' | 'preview_ready' | 'blocked' | 'committing'
  | 'completed' | 'completed_with_warnings' | 'failed'
// Draft has no imported_at and is excluded from H01/H02.
export type HistoryStatusFilter =
  | 'in_progress' | 'completed' | 'completed_with_warnings' | 'failed'

export type HistoryFilters = {
  category?: ImportCategory
  status?: HistoryStatusFilter
  q?: string
}
export type CalendarRequest = HistoryFilters & { month: string }
export type HistoryRequest = HistoryFilters & {
  import_date: BusinessDate
  limit?: number
  cursor?: string
  sort?: '-imported_at'
}

export type ImportHistoryRow = {
  import_id: string
  display_number: string
  data_date: BusinessDate
  imported_at: Timestamp
  file_count: number | null
  status: ImportStatus
}
export type ImportCalendar = {
  month: string
  timezone: string
  grouped_by: 'imported_at'
  matched_import_count: number | null
  unfiltered_import_count: number | null
  days: { date: BusinessDate; import_count: number | null }[]
}
export type ImportWarning = {
  code: string
  message: string
  details: Record<string, unknown>
  severity: 'WARNING'
  field: unknown
  entity: unknown
  impact: unknown
}
export type HistoryMeta = { request_id: string; warnings: ImportWarning[] }
export type CalendarResponse = ApiSuccess<ImportCalendar, HistoryMeta>
export type HistoryResponse = ApiSuccess<
  { items: ImportHistoryRow[] },
  HistoryMeta & { pagination: Pagination; unfiltered_date_count: number | null }
>
