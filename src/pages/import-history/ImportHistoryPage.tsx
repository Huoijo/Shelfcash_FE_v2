import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ImportCalendar } from '../../features/import-history/components/ImportCalendar'
import { ImportHistoryList } from '../../features/import-history/components/ImportHistoryList'
import { getImportCalendar, getImportHistory, historySource } from '../../features/import-history/importHistory.data'
import { formatDate, isBusinessDate } from '../../features/import-history/importHistory.format'
import type { CalendarResponse, HistoryResponse } from '../../features/import-history/importHistory.types'
import type { HistoryStatusFilter, ImportCategory } from '../../features/import-history/importHistory.types'
import { HttpError } from '../../shared/http/httpClient'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { useCurrentStore } from '../../features/store/store.context'
import './ImportHistoryPage.css'

const categories: { value: ImportCategory; label: string }[] = [
  { value: 'sales', label: 'Doanh số' }, { value: 'inventory', label: 'Tồn kho' },
  { value: 'recipes', label: 'Công thức' }, { value: 'supplier', label: 'Nhà cung cấp' },
]
const statuses: { value: HistoryStatusFilter; label: string }[] = [
  { value: 'completed', label: 'Thành công' }, { value: 'completed_with_warnings', label: 'Có cảnh báo' },
  { value: 'failed', label: 'Thất bại' }, { value: 'in_progress', label: 'Đang xử lý / cần xử lý' },
]
type LoadState =
  | { status: 'loading'; key: string }
  | { status: 'success'; key: string; calendar: CalendarResponse; history: HistoryResponse }
  | { status: 'error'; key: string; error: Error }

export function ImportHistoryPage() {
  const { currentStoreId } = useCurrentStore()
  const [search, setSearch] = useSearchParams()
  const [retry, setRetry] = useState(0)
  const requestedMonth = search.get('month')
  const month = requestedMonth && isBusinessDate(`${requestedMonth}-01`) ? requestedMonth : historySource.initialDate.slice(0, 7)
  const requestedDate = search.get('date')
  const date = isBusinessDate(requestedDate) && requestedDate.startsWith(`${month}-`) ? requestedDate
    : month === historySource.initialDate.slice(0, 7) ? historySource.initialDate : `${month}-01`
  const category = categories.find((item) => item.value === search.get('category'))?.value
  const status = statuses.find((item) => item.value === search.get('status'))?.value
  const q = search.get('q')?.trim() || undefined
  const cursor = search.get('cursor') || undefined
  const key = JSON.stringify([currentStoreId, month, date, category, status, q, cursor, retry])
  const [state, setState] = useState<LoadState>({ status: 'loading', key })

  useEffect(() => {
    const controller = new AbortController()
    const filters = { category, status, q }
    Promise.all([
      getImportCalendar({ month, ...filters }, controller.signal, currentStoreId),
      getImportHistory({ import_date: date, sort: '-imported_at', cursor, ...filters }, controller.signal, currentStoreId),
    ]).then(([calendar, history]) => {
      if (!controller.signal.aborted) setState({ status: 'success', key, calendar, history })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ status: 'error', key, error: error instanceof Error ? error : new Error('Không tải được lịch sử nhập.') })
    })
    return () => controller.abort()
  }, [key, month, date, category, status, q, cursor, currentStoreId])

  // A previous query must never render beneath a new date/filter while its effect starts.
  const current: LoadState = state.key === key ? state : { status: 'loading', key }

  function makeLink(changes: Record<string, string | null>): string {
    const params = new URLSearchParams(search)
    params.set('month', month)
    params.set('date', date)
    Object.entries(changes).forEach(([name, value]) => value === null ? params.delete(name) : params.set(name, value))
    return `/imports/history?${params}`
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const params = new URLSearchParams(search)
    params.set('month', month)
    params.set('date', date)
    params.delete('cursor')
    for (const name of ['category', 'status', 'q']) {
      const value = String(fields.get(name) ?? '').trim()
      if (value) params.set(name, value)
      else params.delete(name)
    }
    setSearch(params)
  }

  function retryLoad() {
    // Stale cursors require a fresh first page, not an endless retry of the old cursor.
    const params = new URLSearchParams(search)
    params.delete('cursor')
    setSearch(params, { replace: true })
    setRetry((value) => value + 1)
  }

  return (
    <div className="history-page">
      <AppShellHeader>
        <nav aria-label="Đường dẫn trang"><Link to="/imports">Nhập dữ liệu</Link><span aria-hidden="true">/</span><span aria-current="page">Lịch sử nhập</span></nav>
      </AppShellHeader>
      <main className="history-main">
        <div className="history-heading"><h1>Lịch sử nhập</h1><p>{historySource.label}</p></div>
        <form className="history-filters" onSubmit={applyFilters} key={`${category}-${status}-${q}`}>
          <label>Loại file<select name="category" defaultValue={category ?? ''}>
            <option value="">Tất cả loại file</option>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select></label>
          <label>Trạng thái<select name="status" defaultValue={status ?? ''}>
            <option value="">Tất cả trạng thái</option>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select></label>
          <label className="history-filters__search">Tên file<div className="history-search-control"><input name="q" type="search" placeholder="Tìm theo tên file" defaultValue={q ?? ''} /><button type="submit" aria-label="Áp dụng bộ lọc" title="Áp dụng bộ lọc"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.3" /><path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.3" /></svg></button></div></label>
        </form>
        {current.status === 'loading' && <p className="history-feedback" role="status">Đang tải lịch sử nhập…</p>}
        {current.status === 'error' && <div className="history-error" role="alert">
          <div><h2>Không tải được lịch sử nhập</h2><p>{current.error.message}</p>
            {current.error instanceof HttpError && current.error.problem && <p className="history-error__code">Mã lỗi: {current.error.problem.code}</p>}
          </div><button type="button" onClick={retryLoad}>Thử lại</button>
        </div>}
        {current.status === 'success' && current.calendar.data.matched_import_count === 0 && <p className="history-feedback" role="status">
          {current.calendar.data.unfiltered_import_count === 0 ? 'Tháng này chưa có lần nhập dữ liệu nào.' : 'Không có lần nhập phù hợp với bộ lọc trong tháng này.'}
        </p>}
        {current.status === 'success' && [...current.calendar.meta.warnings, ...current.history.meta.warnings].map((warning, index) =>
          <p className="history-feedback" key={`${warning.code}-${index}`}>{warning.message}</p>)}
        <div className="history-content" aria-busy={current.status === 'loading'}>
          <ImportCalendar month={month} selectedDate={date} data={current.status === 'success' ? current.calendar.data : undefined}
            loadState={current.status==='loading'?'loading':current.status==='error'?(current.error instanceof HttpError&&current.error.status===403?'permission':'error'):'unavailable'}
            dateLink={(nextDate) => makeLink({ date: nextDate, month: nextDate.slice(0, 7), cursor: null })} />
          <section className="history-detail" aria-labelledby="history-date-title">
            <header className="history-detail__header">
              <h2 id="history-date-title">Ngày {formatDate(date)}</h2>
              <p>{current.status === 'success'
                ? current.history.meta.pagination.total_count === null ? 'Chưa có tổng số lần nhập' : `${current.history.meta.pagination.total_count} lần nhập dữ liệu`
                : 'Các lần nhập trong ngày đã chọn'}</p>
            </header>
            {current.status === 'loading' && <div className="history-placeholder" aria-hidden="true"><span /><span /><span /></div>}
            {current.status === 'error' && <p className="history-unavailable">Dữ liệu chưa tải được. Vui lòng thử lại.</p>}
            {current.status === 'success' && <ImportHistoryList response={current.history} timezone={current.calendar.data.timezone}
              nextLink={current.history.meta.pagination.next_cursor ? makeLink({ cursor: current.history.meta.pagination.next_cursor }) : null}
              firstLink={cursor ? makeLink({ cursor: null }) : null} />}
          </section>
        </div>
      </main>
    </div>
  )
}
