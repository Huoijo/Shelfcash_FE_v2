import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePanelMotion } from '../../../shared/motion/usePanelMotion'
import { HttpError } from '../../../shared/http/httpClient'
import { useCurrentStore } from '../../store/store.context'
import { getMenuProduct } from '../menu.data'
import { formatMenuDate, formatMenuDecimal, formatMenuMoney, productStatusLabels } from '../menu.format'
import type { MenuDetailResponse, MenuMeta, MenuProduct, MenuRecipe, ProductRow } from '../menu.types'

type DetailProps = {
  productId: string
  listMeta: MenuMeta
  listedProduct?: ProductRow
  onClose: () => void
  onInvalidList: (error: Error) => void
}
type DetailState = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; response: MenuDetailResponse }

function sameRead(meta: MenuMeta, expected: MenuMeta): boolean {
  return meta.data_version === expected.data_version && meta.as_of_date === expected.as_of_date && meta.timezone === expected.timezone
}

function reconciles(product: MenuProduct, row: ProductRow): boolean {
  if (product.product_id !== row.product_id || product.name !== row.name || product.sku !== row.sku ||
    product.selling_unit !== row.selling_unit || product.selling_price !== row.selling_price ||
    product.currency !== row.currency || product.status !== row.status) return false
  if (row.ingredient_count_availability === 'available') return product.recipe !== null && product.recipe.ingredients.length === row.ingredient_count
  if (row.ingredient_count_availability === 'missing_recipe') return product.recipe === null
  // A forbidden count is unknown, not zero or evidence that no recipe exists.
  return true
}

function RecipeTable({ recipe, asOfDate }: { recipe: MenuRecipe | null; asOfDate: string }) {
  const noteId = useId()
  if (!recipe) return <section className="menu-recipe" aria-label="Công thức">
    <h3>Định lượng nguyên liệu</h3><p className="menu-recipe-empty" role="status">Chưa có công thức hiệu lực tại ngày đọc {formatMenuDate(asOfDate)}.</p>
  </section>
  const yieldLabel = `${formatMenuDecimal(recipe.yield_quantity)} ${recipe.yield_unit}`
  const singleYield = /^1(?:\.0+)?$/.test(recipe.yield_quantity)
  const hasLoss = !/^0(?:\.0+)?$/.test(recipe.process_loss_rate)
  return <section className="menu-recipe" aria-label="Công thức hiệu lực tại ngày đọc">
    <h3>Định lượng nguyên liệu</h3>
    <p id={noteId} className="menu-recipe-note">Định lượng cho toàn mẻ {yieldLabel}.{!singleYield && ' Không phải định lượng cho một đơn vị bán.'}</p>
    <div className="menu-recipe-scroll" tabIndex={0} role="region" aria-label="Bảng định lượng nguyên liệu, có thể cuộn ngang">
      <table aria-describedby={noteId}>
        <caption className="menu-sr-only">Định lượng nguyên liệu cho toàn mẻ {yieldLabel}</caption>
        <colgroup><col className="menu-recipe-col-name" /><col className="menu-recipe-col-quantity" /><col className="menu-recipe-col-unit" /></colgroup>
        <thead><tr><th scope="col">Nguyên liệu</th><th scope="col">Định lượng</th><th scope="col">Đơn vị</th></tr></thead>
        <tbody>{recipe.ingredients.map((ingredient) => <tr key={ingredient.recipe_line_id}>
          <th scope="row">{ingredient.ingredient_name}{!ingredient.ingredient_active && <span className="menu-row-note">Nguyên liệu ngừng hoạt động</span>}</th>
          <td>{formatMenuDecimal(ingredient.quantity)}</td><td>{ingredient.unit}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {recipe.ingredients.length === 0 && <p className="menu-recipe-empty" role="status">Công thức có hiệu lực nhưng chưa có dòng nguyên liệu; chưa đủ dữ liệu BOM.</p>}
    <div className="menu-recipe-meta">
      <span>Công thức hiện tại</span><span>Hiệu lực từ {formatMenuDate(recipe.effective_from)}</span>
      {recipe.effective_to !== null && <span>Đến hết {formatMenuDate(recipe.effective_to)}</span>}
      {hasLoss && <span>Tỷ lệ hao hụt toàn mẻ: {formatMenuDecimal(recipe.process_loss_rate)} (không phải %)</span>}
    </div>
  </section>
}

export function MenuDetail({ productId, listMeta, listedProduct, onClose, onInvalidList }: DetailProps) {
  const { scope, close } = usePanelMotion<HTMLElement>()
  const requestClose = useCallback(() => close(onClose), [close, onClose])
  const { currentStoreId } = useCurrentStore()
  const prefix = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [retry, setRetry] = useState(0)

  useEffect(() => { closeRef.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); requestClose() } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [requestClose])

  useEffect(() => {
    const controller = new AbortController()
    getMenuProduct(productId, controller.signal, currentStoreId).then((response) => {
      if (controller.signal.aborted) return
      if (!sameRead(response.meta, listMeta) || (listedProduct && !reconciles(response.data, listedProduct))) {
        onInvalidList(new HttpError('protocol', 'Danh sách món và chi tiết không cùng phiên bản/ngày đọc hoặc không khớp dữ liệu. Vui lòng tải lại toàn bộ Menu; không thể ghép các dữ liệu này.'))
        return
      }
      setState({ status: 'success', response })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      const error = cause instanceof Error ? cause : new Error('Không tải được chi tiết món.')
      if (error instanceof HttpError && error.problem?.code === 'LIST_VERSION_CHANGED') onInvalidList(error)
      else setState({ status: 'error', error })
    })
    return () => controller.abort()
  }, [productId, listMeta, listedProduct, onInvalidList, retry, currentStoreId])

  const info = state.status === 'success' ? state.response.data : null
  return <aside ref={scope} id="menu-detail" className="menu-detail" aria-labelledby={`${prefix}-title`}>
    <header className="menu-detail-header"><h2 id={`${prefix}-title`} title={info?.name ?? listedProduct?.name}>{info?.name ?? listedProduct?.name ?? 'Chi tiết món'}</h2>
      <button ref={closeRef} type="button" className="menu-close" aria-label="Đóng chi tiết món" onClick={requestClose}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </header>
    {info && <dl className="menu-product-facts">
      <div><dt>Giá bán</dt><dd>{formatMenuMoney(info.selling_price, info.currency)}<span className="menu-row-note">cho 1 {info.selling_unit}</span></dd></div>
      <div><dt>Trạng thái</dt><dd><span className={`menu-status menu-status--${info.status}`}>{productStatusLabels[info.status]}</span></dd></div>
      <div><dt>Thành phẩm</dt><dd>{info.recipe ? `${formatMenuDecimal(info.recipe.yield_quantity)} ${info.recipe.yield_unit}` : 'Chưa có công thức'}</dd></div>
    </dl>}
    <div className="menu-detail-scroll" tabIndex={0} role="region" aria-label="Chi tiết công thức món">
      {state.status === 'loading' && <p className="menu-feedback" role="status">Đang tải chi tiết món…</p>}
      {state.status === 'error' && <div className="menu-error" role="alert"><p>{state.error.message}</p>
        {state.error instanceof HttpError && state.error.problem && <p>Mã lỗi: {state.error.problem.code}</p>}
        <button type="button" onClick={() => { setState({ status: 'loading' }); setRetry((value) => value + 1) }}>Thử lại</button>
      </div>}
      {state.status === 'success' && <>
        {state.response.meta.warnings.length > 0 && <div className="menu-detail-warnings" role="status">{state.response.meta.warnings.map((warning, index) => <p key={`${warning.code}-${index}`}>{warning.message}</p>)}</div>}
        <RecipeTable recipe={state.response.data.recipe} asOfDate={state.response.meta.as_of_date} />
      </>}
    </div>
    <footer className="menu-detail-actions">
      <button className="menu-text-action" type="button" disabled title="Chưa tích hợp điều hướng Kho theo ingredient_id; không mở toàn bộ Kho thay cho nguyên liệu của công thức.">Xem tồn kho nguyên liệu</button>
      <button className="menu-ai-entry" type="button" disabled title="AI cho Menu chưa có contract được duyệt và tích hợp.">Hỏi AI về món này</button>
    </footer>
  </aside>
}
