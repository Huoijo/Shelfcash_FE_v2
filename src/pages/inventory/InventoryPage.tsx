import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { InventoryDetail } from '../../features/inventory/components/InventoryDetail'
import { InventoryTable } from '../../features/inventory/components/InventoryTable'
import { getInventory, inventorySource } from '../../features/inventory/inventory.data'
import { formatInventoryDate, formatInventoryTimestamp } from '../../features/inventory/inventory.format'
import type { InventoryResponse, InventoryStatus } from '../../features/inventory/inventory.types'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { HttpError } from '../../shared/http/httpClient'
import { useCurrentStore } from '../../features/store/store.context'
import './InventoryPage.css'

const filters: { value: InventoryStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' }, { value: 'low_stock', label: 'Sắp hết' },
  { value: 'near_expiry', label: 'Gần hạn' }, { value: 'stable', label: 'Ổn định' },
]
type LoadState =
  | { status: 'loading'; key: string }
  | { status: 'success'; key: string; response: InventoryResponse }
  | { status: 'error'; key: string; error: Error }

export function InventoryPage() {
  const { currentStoreId, timezone } = useCurrentStore()
  const [search, setSearch] = useSearchParams()
  const [retry, setRetry] = useState(0)
  const originRef = useRef<HTMLElement | null>(null)
  const q = search.get('q')?.trim() || undefined
  const status = filters.find((item) => item.value === search.get('status'))?.value || undefined
  const cursor = search.get('cursor') || undefined
  const ingredientId = search.get('ingredient') || null
  const key = JSON.stringify([currentStoreId, q, status, cursor, retry])
  const [state, setState] = useState<LoadState>({ status: 'loading', key })

  useEffect(() => {
    const controller = new AbortController()
    getInventory({ q, status: status ? [status] : undefined, cursor, sort: 'name' }, controller.signal, currentStoreId)
      .then((response) => {
        if (!controller.signal.aborted) setState({ status: 'success', key, response })
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', key, error: error instanceof Error ? error : new Error('Không tải được tồn kho.') })
      })
    return () => controller.abort()
  }, [key, q, status, cursor, currentStoreId])

  const current: LoadState = state.key === key ? state : { status: 'loading', key }
  const invalidateSnapshot = useCallback((error: Error) => {
    // Never leave a stale table visible after a detail/page reports an invalid snapshot.
    setState({ status: 'error', key, error })
  }, [key])

  function update(changes: Record<string, string | null>, replace = false) {
    const params = new URLSearchParams(search)
    Object.entries(changes).forEach(([name, value]) => value ? params.set(name, value) : params.delete(name))
    setSearch(params, { replace })
  }

  function refresh() {
    update({ cursor: null, ingredient: null })
    setRetry((value) => value + 1)
  }

  function selectIngredient(id: string, origin: HTMLElement) {
    originRef.current = origin
    update({ ingredient: id })
  }

  function closeDetail() {
    update({ ingredient: null })
    requestAnimationFrame(() => originRef.current?.isConnected && originRef.current.focus({ preventScroll: true }))
  }

  const response = current.status === 'success' ? current.response : null

  return (
    <div className="inventory-page">
      <AppShellHeader><span className="inventory-location">Kho</span></AppShellHeader>
      <div className="inventory-workspace" data-panel-open={Boolean(response && ingredientId)}>
        <main className="inventory-content" aria-labelledby="inventory-title">
          <header className="inventory-heading">
            <h1 id="inventory-title">Kho</h1>
            <span>{response ? `Cập nhật: ${formatInventoryTimestamp(response.meta.updated_at, timezone)}` : 'Tồn kho hiện tại'}</span>
          </header>
          <p className="inventory-source">{inventorySource.label}{response && ` · Ngày tồn: ${formatInventoryDate(response.meta.as_of_date)}`}</p>
          {response && <section className="inventory-summary" aria-label="Tóm tắt tồn kho toàn cửa hàng">
            <span><strong>{response.data.summary.ingredient_count}</strong> nguyên liệu</span><i aria-hidden="true" />
            <span><strong>{response.data.summary.positive_lot_count}</strong> lô còn tồn</span><i aria-hidden="true" />
            <span><strong>{response.data.summary.near_expiry_lot_count}</strong> lô gần hạn</span>
          </section>}
          <div className="inventory-toolbar">
            <div className="inventory-filters" role="group" aria-label="Lọc trạng thái tồn kho">
              {filters.map((item) => <button type="button" key={item.value} aria-pressed={(status ?? '') === item.value}
                onClick={() => update({ status: item.value, cursor: null, ingredient: null })}>{item.label}</button>)}
            </div>
            <label className="inventory-search">
              <span className="inventory-sr-only">Tìm nguyên liệu theo tên hoặc SKU</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.3" /><path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.3" /></svg>
              <input type="search" maxLength={200} placeholder="Tìm nguyên liệu" value={search.get('q') ?? ''}
                onChange={(event) => update({ q: event.target.value, cursor: null, ingredient: null }, true)} />
            </label>
          </div>
          {current.status === 'loading' && <p className="inventory-feedback" role="status">Đang tải tồn kho…</p>}
          {current.status === 'error' && <div className="inventory-error" role="alert">
            <h2>Không tải được tồn kho</h2><p>{current.error.message}</p>
            {current.error instanceof HttpError && current.error.problem && <p>Mã lỗi: {current.error.problem.code}</p>}
            <button type="button" onClick={refresh}>Tải lại kho</button>
          </div>}
          {response && <>
            <InventoryTable response={response} selectedId={ingredientId} onSelect={selectIngredient}
              filtered={Boolean(q || status)} onClearFilters={() => update({ q: null, status: null, cursor: null, ingredient: null })} />
            <nav className="inventory-pagination" aria-label="Phân trang nguyên liệu">
              <span>{response.data.items.length} nguyên liệu trên trang · {response.meta.pagination.total_count === null ? 'Chưa biết tổng kết quả' : `${response.meta.pagination.total_count} kết quả`}</span>
              <div>{cursor && <button type="button" onClick={() => update({ cursor: null, ingredient: null })}>Trang đầu</button>}
                {response.meta.pagination.next_cursor && <button type="button" onClick={() => update({ cursor: response.meta.pagination.next_cursor, ingredient: null })}>Trang tiếp →</button>}</div>
            </nav>
            {response.data.missing_ingredient_ids.length > 0 && <p className="inventory-feedback">Không có dữ liệu cho nguyên liệu: {response.data.missing_ingredient_ids.join(', ')}. Không thể coi đây là tồn bằng 0.</p>}
          </>}
        </main>
        {response && ingredientId && <InventoryDetail key={`${ingredientId}:${response.meta.snapshot_id}`} ingredientId={ingredientId}
          snapshot={response.meta} onClose={closeDetail} onInvalidSnapshot={invalidateSnapshot} />}
      </div>
    </div>
  )
}
