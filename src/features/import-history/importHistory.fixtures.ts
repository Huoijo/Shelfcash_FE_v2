import type { ApiFailure } from '../../shared/http/http.types'
import type { CalendarResponse, HistoryResponse, ImportCategory, ImportHistoryRow } from './importHistory.types'

// Synthetic examples of the retained H01/H02 schemas (IMP v1 §§3/4/11).
// No accounts, permissions, files, uploads, commits or server are created.
export const fixtureInitialDate = '2026-10-02'
export const fixtureTimezone = 'Asia/Ho_Chi_Minh'

export const historyRows: ImportHistoryRow[] = [
  { import_id: '00000000-0000-4000-8000-000000000245', display_number: '0245', data_date: '2026-10-02', imported_at: '2026-10-02T15:30:00Z', file_count: 1, status: 'blocked' },
  { import_id: '00000000-0000-4000-8000-000000000244', display_number: '0244', data_date: '2026-10-02', imported_at: '2026-10-02T12:10:00Z', file_count: null, status: 'analyzing' },
  { import_id: '00000000-0000-4000-8000-000000000243', display_number: '0243', data_date: '2026-09-30', imported_at: '2026-10-02T10:06:00Z', file_count: 1, status: 'failed' },
  { import_id: '00000000-0000-4000-8000-000000000242', display_number: '0242', data_date: '2026-10-02', imported_at: '2026-10-02T07:18:00Z', file_count: 2, status: 'completed_with_warnings' },
  { import_id: '00000000-0000-4000-8000-000000000241', display_number: '0241', data_date: '2026-10-01', imported_at: '2026-10-02T02:42:00Z', file_count: 4, status: 'completed' },
  // UTC date differs from the Store-local upload date (01/10 at 01:15).
  { import_id: '00000000-0000-4000-8000-000000000240', display_number: '0240', data_date: '2026-09-30', imported_at: '2026-09-30T18:15:00Z', file_count: 1, status: 'completed' },
  { import_id: '00000000-0000-4000-8000-000000000246', display_number: '0246', data_date: '2026-10-05', imported_at: '2026-10-05T03:00:00Z', file_count: 1, status: 'completed' },
]

// Mock filter index, NOT additional H02 response fields. H02 has no file list;
// file inspection would require I04, outside this milestone.
export const fixtureFiles: Record<string, { category: ImportCategory; filename: string }[]> = {
  '0245': [{ category: 'recipes', filename: 'cong_thuc.xlsx' }],
  '0244': [{ category: 'supplier', filename: 'bang_gia_ncc.xlsx' }],
  '0243': [{ category: 'sales', filename: 'doanh_so_cu.csv' }],
  '0242': [{ category: 'sales', filename: 'doanh_so.xlsx' }, { category: 'inventory', filename: 'kiem_ke.xlsx' }],
  '0241': [{ category: 'sales', filename: 'doanh_so.csv' }, { category: 'inventory', filename: 'ton_kho.xlsx' }, { category: 'recipes', filename: 'cong_thuc.xlsx' }, { category: 'supplier', filename: 'nha_cung_cap.xlsx' }],
  '0240': [{ category: 'inventory', filename: 'kiem_ke_cuoi_thang.csv' }],
  '0246': [{ category: 'sales', filename: 'doanh_so_05_10.xlsx' }],
}

export const calendarFixture: CalendarResponse = {
  data: {
    month: '2026-10', timezone: fixtureTimezone, grouped_by: 'imported_at',
    matched_import_count: 7, unfiltered_import_count: 7,
    days: [{ date: '2026-10-01', import_count: 1 }, { date: '2026-10-02', import_count: 5 }, { date: '2026-10-05', import_count: 1 }],
  },
  meta: { request_id: 'fixture-calendar', warnings: [] }, error: null,
}
export const historyFixture: HistoryResponse = {
  data: { items: historyRows.slice(0, 3) },
  meta: {
    request_id: 'fixture-history', warnings: [], unfiltered_date_count: 5,
    pagination: { limit: 3, next_cursor: 'fixture-page-3', total_count: null },
  }, error: null,
}
export const emptyHistoryFixture: HistoryResponse = {
  data: { items: [] },
  meta: {
    request_id: 'fixture-empty', warnings: [], unfiltered_date_count: 0,
    pagination: { limit: 3, next_cursor: null, total_count: 0 },
  }, error: null,
}
export const historyErrorFixture: ApiFailure = {
  data: null, meta: {},
  error: { code: 'INVALID_CURSOR', message: 'Trang dữ liệu không còn hợp lệ. Vui lòng quay lại trang đầu.', details: {} },
}
