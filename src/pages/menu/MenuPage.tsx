import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MenuDetail } from '../../features/menu/components/MenuDetail'
import { MenuTable } from '../../features/menu/components/MenuTable'
import { getMenu, menuSource } from '../../features/menu/menu.data'
import { formatMenuDate, formatMenuTimestamp } from '../../features/menu/menu.format'
import type { MenuMeta, MenuResponse, ProductStatus } from '../../features/menu/menu.types'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { HttpError } from '../../shared/http/httpClient'
import './MenuPage.css'

const filters: { value: ProductStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' }, { value: 'active', label: 'Đang bán' }, { value: 'paused', label: 'Tạm ngưng' },
]
type LoadState =
  | { status: 'loading'; key: string }
  | { status: 'success'; key: string; response: MenuResponse }
  | { status: 'error'; key: string; error: Error }

export function MenuPage() {
  const [search, setSearch] = useSearchParams()
  const [retry, setRetry] = useState(0)
  const originRef = useRef<HTMLElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const previousRead = useRef<{ query: string; meta: MenuMeta } | null>(null)
  const q = search.get('q')?.trim() || undefined
  const status = filters.find((item) => item.value === search.get('status'))?.value || undefined
  const cursor = search.get('cursor') || undefined
  const productId = search.get('product') || null
  const query = JSON.stringify([q, status])
  const key = JSON.stringify([q, status, cursor, retry])
  const [state, setState] = useState<LoadState>({ status: 'loading', key })

  useEffect(() => {
    const controller = new AbortController()
    getMenu({ q, status, cursor, sort: 'name' }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        const previous = previousRead.current
        // The server owns opaque cursor validation. Never display a continuation
        // as the same read set when its catalog version or Store date changed.
        if (cursor && previous?.query === query &&
          (previous.meta.data_version !== response.meta.data_version || previous.meta.as_of_date !== response.meta.as_of_date ||
            previous.meta.timezone !== response.meta.timezone)) {
          throw new HttpError('protocol', 'Dữ liệu Menu đã thay đổi giữa các trang. Vui lòng tải lại Menu từ trang đầu.')
        }
        previousRead.current = { query, meta: response.meta }
        setState({ status: 'success', key, response })
      }).catch((cause: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', key,
          error: cause instanceof Error ? cause : new Error('Không tải được Menu.') })
      })
    return () => controller.abort()
  }, [key, q, status, cursor, query])

  const current: LoadState = state.key === key ? state : { status: 'loading', key }
  const invalidateList = useCallback((error: Error) => setState({ status: 'error', key, error }), [key])
  const response = current.status === 'success' ? current.response : null

  function update(changes: Record<string, string | null>, replace = false) {
    const params = new URLSearchParams(search)
    Object.entries(changes).forEach(([name, value]) => value ? params.set(name, value) : params.delete(name))
    setSearch(params, { replace })
  }

  function refresh() {
    update({ cursor: null, product: null })
    setRetry((value) => value + 1)
  }

  function selectProduct(id: string, origin: HTMLElement) {
    originRef.current = origin
    update({ product: id })
  }

  function closeDetail() {
    update({ product: null })
    requestAnimationFrame(() => {
      const origin = originRef.current
      if (origin?.isConnected) origin.focus({ preventScroll: true })
      else headingRef.current?.focus({ preventScroll: true })
    })
  }

  return <div className="menu-page">
    <AppShellHeader><span className="menu-location">Menu</span></AppShellHeader>
    <div className="menu-workspace" data-panel-open={Boolean(response && productId)}>
      <main className="menu-content" aria-labelledby="menu-title">
        <header className="menu-heading">
          <h1 id="menu-title" ref={headingRef} tabIndex={-1}>Menu</h1>
          {response && <span>Cập nhật: {formatMenuTimestamp(response.meta.updated_at, response.meta.timezone)}</span>}
        </header>
        <p className="menu-source">{menuSource.label}{response && ` · Ngày đọc: ${formatMenuDate(response.meta.as_of_date)}`}</p>
        {response && <section className="menu-summary" aria-label="Tóm tắt menu toàn cửa hàng">
          <span><strong>{response.data.summary.product_count}</strong> món</span><i aria-hidden="true" />
          <span><strong>{response.data.summary.active_count}</strong> đang bán</span><i aria-hidden="true" />
          <span><strong>{response.data.summary.paused_count}</strong> tạm ngưng</span>
        </section>}
        <div className="menu-toolbar">
          <div className="menu-filters" role="group" aria-label="Lọc trạng thái món">
            {filters.map((item) => <button type="button" key={item.value} aria-pressed={(status ?? '') === item.value}
              onClick={() => update({ status: item.value, cursor: null, product: null })}>{item.label}</button>)}
          </div>
          <label className="menu-search">
            <span className="menu-sr-only">Tìm món theo tên</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.3" /><path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.3" /></svg>
            <input type="search" maxLength={200} placeholder="Tìm món..." value={search.get('q') ?? ''}
              onChange={(event) => update({ q: event.target.value, cursor: null, product: null }, true)} />
          </label>
        </div>
        {current.status === 'loading' && <p className="menu-feedback" role="status">Đang tải Menu…</p>}
        {current.status === 'error' && <div className="menu-error" role="alert">
          <h2>Không tải được Menu</h2><p>{current.error.message}</p>
          {current.error instanceof HttpError && current.error.problem && <p>Mã lỗi: {current.error.problem.code}</p>}
          <button type="button" onClick={refresh}>Tải lại Menu</button>
        </div>}
        {response && (response.data.summary.product_count === 0 ?
          <section className="menu-no-data" aria-labelledby="menu-empty-title">
            <h2 id="menu-empty-title">Chưa có dữ liệu menu</h2>
            <Link to="/imports" className="menu-primary">Nhập dữ liệu</Link>
          </section> : <>
            <MenuTable response={response} selectedId={productId} onSelect={selectProduct} filtered={Boolean(q || status)}
              onClearFilters={() => update({ q: null, status: null, cursor: null, product: null })} />
            <nav className="menu-pagination" aria-label="Phân trang món">
              <span>{response.meta.pagination.total_count} kết quả</span>
              <div>{cursor && <button type="button" onClick={() => update({ cursor: null, product: null })}>Trang đầu</button>}
                {response.meta.pagination.next_cursor && <button type="button"
                  onClick={() => update({ cursor: response.meta.pagination.next_cursor, product: null })}>Trang tiếp →</button>}</div>
            </nav>
          </>)}
      </main>
      {response && productId && <MenuDetail key={`${productId}:${response.meta.data_version}:${response.meta.as_of_date}`}
        productId={productId} listMeta={response.meta} listedProduct={response.data.items.find((item) => item.product_id === productId)}
        onClose={closeDetail} onInvalidList={invalidateList} />}
    </div>
  </div>
}
