import { useEffect, useId, useRef, useState } from 'react'
import { HttpError } from '../../../shared/http/httpClient'
import { useCurrentStore } from '../../store/store.context'
import { getInventoryIngredient, getInventoryLots, getInventoryMovements } from '../inventory.data'
import { expiryLabel, formatInventoryDate, formatInventoryTimestamp, formatQuantity, inventoryStatusLabels, movementLabels } from '../inventory.format'
import type { InventoryDetailResponse, InventoryLot, InventoryMeta, InventoryMovementsResponse } from '../inventory.types'

type DetailProps = {
  ingredientId: string
  snapshot: InventoryMeta
  onClose: () => void
  onInvalidSnapshot: (error: Error) => void
}
type Load<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; response: T }
const asError = (error: unknown) => error instanceof Error ? error : new Error('Không tải được chi tiết tồn kho.')
const expiredSnapshot = (error: Error) => error instanceof HttpError && error.problem?.code === 'SNAPSHOT_NOT_AVAILABLE'

function sameSnapshot(meta: InventoryMeta, expected: InventoryMeta): boolean {
  return meta.snapshot_id === expected.snapshot_id && meta.data_version === expected.data_version && meta.as_of_date === expected.as_of_date
}

function snapshotError(): Error {
  return new HttpError('protocol', 'Phản hồi không cùng ảnh tồn kho/ngày/phiên bản. Vui lòng tải lại toàn bộ kho; không thể ghép các tập dữ liệu này.')
}

function DetailError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return <div className="inventory-error" role="alert"><p>{error.message}</p>
    {error instanceof HttpError && error.problem && <p>Mã lỗi: {error.problem.code}</p>}
    <button type="button" onClick={onRetry}>Thử lại</button></div>
}

function LotCard({ lot, asOfDate }: { lot: InventoryLot; asOfDate: string }) {
  const { timezone } = useCurrentStore()
  return <article className="inventory-lot-card">
    <header><h3>Lô {lot.batch_code ?? 'chưa có mã'}</h3><span className="inventory-status">{inventoryStatusLabels[lot.status]}</span></header>
    {lot.use_first && <p className="inventory-lot-priority">Ưu tiên sử dụng trước · theo máy chủ</p>}
    <strong className="inventory-lot-quantity">{formatQuantity(lot.quantity, lot.unit)}</strong>
    <div className="inventory-lot-expiry"><span>Hạn dùng: {formatInventoryDate(lot.expiry_date)}</span><span>{expiryLabel(lot.expiry_date, asOfDate)}</span></div>
    <details className="inventory-lot-metadata"><summary>Thông tin lô</summary><dl>
      <div><dt>Định danh lô</dt><dd>{lot.lot_id}</dd></div>
      <div><dt>Ngày nhận</dt><dd>{formatInventoryDate(lot.received_date)}</dd></div>
      <div><dt>Nhà cung cấp</dt><dd>{lot.supplier_id ?? 'Chưa biết'}</dd></div>
      <div><dt>Vị trí</dt><dd>Chưa được hỗ trợ</dd></div>
      <div><dt>Cập nhật</dt><dd>{formatInventoryTimestamp(lot.updated_at, timezone)}</dd></div>
      <div><dt>Nguồn lô</dt><dd>{lot.origin === 'OPENING_STOCK' ? 'Tồn ban đầu' : lot.origin === 'ACTUAL_RECEIPT' ? 'Hàng thực nhận' : 'Chưa biết'}</dd></div>
    </dl></details>
  </article>
}

function InventoryMovements({ ingredientId, snapshot, onInvalidSnapshot, unit }: Omit<DetailProps, 'onClose'> & { unit: string }) {
  const { currentStoreId, timezone } = useCurrentStore()
  const [state, setState] = useState<Load<InventoryMovementsResponse>>({ status: 'loading' })
  const [retry, setRetry] = useState(0)
  const [more, setMore] = useState<{ busy: boolean; error: Error | null }>({ busy: false, error: null })
  const continuation = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getInventoryMovements(ingredientId, { snapshot_id: snapshot.snapshot_id }, controller.signal, currentStoreId).then((response) => {
      if (controller.signal.aborted) return
      if (!sameSnapshot(response.meta, snapshot)) { onInvalidSnapshot(snapshotError()); return }
      if (response.data.items.some((item) => item.unit !== unit)) throw new HttpError('protocol', 'Đơn vị biến động không khớp đơn vị nguyên liệu.')
      setState({ status: 'success', response })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      const error = asError(cause)
      if (expiredSnapshot(error)) onInvalidSnapshot(error)
      else setState({ status: 'error', error })
    })
    return () => controller.abort()
  }, [ingredientId, snapshot, onInvalidSnapshot, retry, unit, currentStoreId])

  useEffect(() => () => continuation.current?.abort(), [])

  async function loadMore() {
    if (state.status !== 'success' || !state.response.meta.pagination.next_cursor || more.busy) return
    const controller = new AbortController()
    continuation.current = controller
    setMore({ busy: true, error: null })
    try {
      const response = await getInventoryMovements(ingredientId, { snapshot_id: snapshot.snapshot_id, cursor: state.response.meta.pagination.next_cursor }, controller.signal, currentStoreId)
      if (controller.signal.aborted) return
      if (!sameSnapshot(response.meta, snapshot)) { onInvalidSnapshot(snapshotError()); return }
      if (response.data.items.some((item) => item.unit !== unit)) throw new HttpError('protocol', 'Đơn vị biến động không khớp đơn vị nguyên liệu.')
      const ids = new Set(state.response.data.items.map((item) => item.movement_id))
      if (response.data.items.some((item) => ids.has(item.movement_id))) throw new HttpError('protocol', 'Trang biến động bị lặp bản ghi. Vui lòng tải lại thay vì ghép dữ liệu.')
      setState({ status: 'success', response: { ...response, data: { ...response.data, items: [...state.response.data.items, ...response.data.items] } } })
      setMore({ busy: false, error: null })
    } catch (cause) {
      if (controller.signal.aborted) return
      const error = asError(cause)
      if (expiredSnapshot(error)) onInvalidSnapshot(error)
      else setMore({ busy: false, error })
    }
  }

  return <section className="inventory-movements" aria-label="Biến động tồn kho">
    <h3>Gần đây</h3><p className="inventory-detail-note">Lịch sử tồn kho, không phải lịch sử nhập file. Các bản ghi gần đây không thay thế số dư hiện tại.</p>
    {state.status === 'loading' && <p className="inventory-feedback" role="status">Đang tải biến động…</p>}
    {state.status === 'error' && <DetailError error={state.error} onRetry={() => { setState({ status: 'loading' }); setRetry((value) => value + 1) }} />}
    {state.status === 'success' && <>
      {state.response.data.items.length === 0 && <p className="inventory-detail-empty" role="status">Chưa có biến động được ghi nhận.</p>}
      <ul>{state.response.data.items.map((movement) => <li className="inventory-movement-row" key={movement.movement_id}>
        <div><time dateTime={movement.occurred_at}>{formatInventoryTimestamp(movement.occurred_at, timezone)}</time>
          <strong>{movement.quantity_delta.startsWith('-') ? '−' : /^0(?:\.0+)?$/.test(movement.quantity_delta) ? '' : '+'}{formatQuantity(movement.quantity_delta.replace(/^-/, ''), movement.unit)}</strong>
          <span>{movementLabels[movement.kind]}</span></div>
        <details><summary>Thông tin biến động</summary><dl>
          <div><dt>Lô</dt><dd>{movement.batch_code ?? 'Chưa có mã'} · {movement.lot_id}</dd></div>
          <div><dt>Ghi nhận lúc</dt><dd>{formatInventoryTimestamp(movement.recorded_at, timezone)}</dd></div>
          <div><dt>Người thực hiện (ID)</dt><dd>{movement.actor_user_id ?? 'Chưa biết'}</dd></div>
          <div><dt>Lý do</dt><dd>{movement.reason ?? 'Chưa biết'}</dd></div>
          <div><dt>Nguồn</dt><dd>{movement.origin}</dd></div>
          <div><dt>Tham chiếu</dt><dd>{movement.reference ? `${movement.reference.type} · ${movement.reference.id}` : 'Chưa biết'}</dd></div>
        </dl></details>
      </li>)}</ul>
      {more.error && <DetailError error={more.error} onRetry={loadMore} />}
      {state.response.meta.pagination.next_cursor && <button className="inventory-load-more" type="button" disabled={more.busy} onClick={loadMore}>{more.busy ? 'Đang tải…' : 'Xem thêm biến động'}</button>}
    </>}
  </section>
}

export function InventoryDetail({ ingredientId, snapshot, onClose, onInvalidSnapshot }: DetailProps) {
  const { currentStoreId } = useCurrentStore()
  const prefix = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const continuation = useRef<AbortController | null>(null)
  const [view, setView] = useState<'lots' | 'movements'>('lots')
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState<Load<InventoryDetailResponse>>({ status: 'loading' })
  const [lots, setLots] = useState<{ items: InventoryLot[]; cursor: string | null }>({ items: [], cursor: null })
  const [more, setMore] = useState<{ busy: boolean; error: Error | null }>({ busy: false, error: null })

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    return () => continuation.current?.abort()
  }, [])

  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [onClose])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [view])

  useEffect(() => {
    const controller = new AbortController()
    getInventoryIngredient(ingredientId, snapshot.snapshot_id, controller.signal, currentStoreId).then((response) => {
      if (controller.signal.aborted) return
      if (!sameSnapshot(response.meta, snapshot)) { onInvalidSnapshot(snapshotError()); return }
      setLots({ items: response.data.lots, cursor: response.data.lots_page.next_cursor })
      setState({ status: 'success', response })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      const error = asError(cause)
      if (expiredSnapshot(error)) onInvalidSnapshot(error)
      else setState({ status: 'error', error })
    })
    return () => controller.abort()
  }, [ingredientId, snapshot, retry, onInvalidSnapshot, currentStoreId])

  async function loadMoreLots() {
    if (!lots.cursor || more.busy) return
    const controller = new AbortController()
    continuation.current = controller
    setMore({ busy: true, error: null })
    try {
      const response = await getInventoryLots(ingredientId, { snapshot_id: snapshot.snapshot_id, cursor: lots.cursor }, controller.signal, currentStoreId)
      if (controller.signal.aborted) return
      if (!sameSnapshot(response.meta, snapshot)) { onInvalidSnapshot(snapshotError()); return }
      if (state.status !== 'success' || response.data.items.some((lot) => lot.unit !== state.response.data.unit)) throw new HttpError('protocol', 'Đơn vị lô không khớp đơn vị nguyên liệu.')
      const ids = new Set(lots.items.map((lot) => lot.lot_id))
      if (response.data.items.some((lot) => ids.has(lot.lot_id))) throw new HttpError('protocol', 'Trang lô bị lặp bản ghi. Vui lòng tải lại thay vì ghép dữ liệu.')
      setLots({ items: [...lots.items, ...response.data.items], cursor: response.meta.pagination.next_cursor })
      setMore({ busy: false, error: null })
    } catch (cause) {
      if (controller.signal.aborted) return
      const error = asError(cause)
      if (expiredSnapshot(error)) onInvalidSnapshot(error)
      else setMore({ busy: false, error })
    }
  }

  const info = state.status === 'success' ? state.response.data : null

  return <aside id="inventory-detail" className="inventory-detail" aria-labelledby={`${prefix}-title`}>
    <header className="inventory-detail-header"><div><h2 id={`${prefix}-title`}>{info?.name ?? 'Chi tiết nguyên liệu'}</h2>
      {info && <span className="inventory-status">{inventoryStatusLabels[info.status]}</span>}</div>
      <button ref={closeRef} type="button" className="inventory-close" aria-label="Đóng chi tiết nguyên liệu" onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </header>
    {info && <>
      <div className="inventory-detail-total"><span>Tồn ghi nhận: <strong>{formatQuantity(info.on_hand_quantity, info.unit)}</strong></span><span>{info.lot_count} lô hàng</span></div>
      <div className="inventory-detail-tabs" role="tablist" aria-label={`Chi tiết ${info.name}`}>
        {(['lots', 'movements'] as const).map((tab, index) => <button type="button" role="tab" key={tab} id={`${prefix}-tab-${tab}`}
          aria-controls={`${prefix}-panel`} aria-selected={view === tab} tabIndex={view === tab ? 0 : -1} onClick={() => setView(tab)}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index
            setView(next === 0 ? 'lots' : 'movements')
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
          }}>{tab === 'lots' ? 'Lô hàng' : 'Biến động'}</button>)}
      </div>
    </>}
    <div ref={scrollRef} id={`${prefix}-panel`} className="inventory-detail-scroll" role={info ? 'tabpanel' : 'region'}
      aria-labelledby={info ? `${prefix}-tab-${view}` : `${prefix}-title`} tabIndex={0}>
      {state.status === 'loading' && <p className="inventory-feedback" role="status">Đang tải chi tiết…</p>}
      {state.status === 'error' && <DetailError error={state.error} onRetry={() => { setState({ status: 'loading' }); setRetry((value) => value + 1) }} />}
      {info && view === 'lots' && <>
        <dl className="inventory-assessment">
          <div><dt>Dùng được</dt><dd>{formatQuantity(info.usable_quantity, info.unit)}</dd></div>
          {info.usable_availability === 'unknown' && <div><dt>Phần dùng được đã biết</dt><dd>{formatQuantity(info.usable_known_quantity, info.unit)}</dd></div>}
          <div><dt>Đã hết hạn (vẫn tồn vật lý)</dt><dd>{formatQuantity(info.expired_quantity, info.unit)}</dd></div>
          <div><dt>Phạm vi kiểm kê</dt><dd>{info.stock_completeness === 'CONFIRMED' ? 'Đã xác nhận' : 'Chưa xác nhận đủ tồn thực tế'}</dd></div>
          <div><dt>Ngưỡng sắp hết</dt><dd>{formatQuantity(info.low_stock_assessment.threshold, info.unit)}</dd></div>
          <div><dt>Đánh giá ngưỡng</dt><dd>{info.low_stock_assessment.status === 'unknown' ? 'Chưa đủ dữ liệu' : info.low_stock_assessment.status === 'low' ? 'Chạm ngưỡng' : 'Trên ngưỡng'}</dd></div>
        </dl>
        {info.status_reasons.map((reason, index) => <p className="inventory-detail-note" key={`${reason.code}-${index}`}>{reason.message}</p>)}
        <section className="inventory-lots" aria-label="Các lô hàng">
          {lots.items.map((lot) => <LotCard key={lot.lot_id} lot={lot} asOfDate={snapshot.as_of_date} />)}
          {lots.items.length === 0 && <p className="inventory-detail-empty" role="status">Chưa có lô được ghi nhận; không tự xác nhận tồn thực tế bằng 0.</p>}
          {more.error && <DetailError error={more.error} onRetry={loadMoreLots} />}
          {lots.cursor && <button className="inventory-load-more" type="button" disabled={more.busy} onClick={loadMoreLots}>{more.busy ? 'Đang tải…' : 'Xem thêm lô hàng'}</button>}
        </section>
      </>}
      {info && view === 'movements' && <InventoryMovements ingredientId={ingredientId} snapshot={snapshot} unit={info.unit} onInvalidSnapshot={onInvalidSnapshot} />}
    </div>
    <footer className="inventory-detail-actions">
      <button type="button" disabled title="AI chưa có contract được duyệt và tích hợp">Hỏi AI về tồn kho</button>
      <button type="button" disabled title="Workspace dự báo chưa triển khai">Xem dự báo</button>
    </footer>
  </aside>
}
