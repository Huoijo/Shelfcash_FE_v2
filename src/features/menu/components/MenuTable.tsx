import { formatMenuMoney, ingredientCountLabel, productStatusLabels } from '../menu.format'
import type { MenuResponse } from '../menu.types'

export function MenuTable({ response, selectedId, onSelect, filtered, onClearFilters }: {
  response: MenuResponse
  selectedId: string | null
  onSelect: (id: string, origin: HTMLElement) => void
  filtered: boolean
  onClearFilters: () => void
}) {
  return <section className="menu-table-panel" aria-label="Món trong menu">
    <div className="menu-table-scroll" tabIndex={0} role="region" aria-label="Bảng menu, có thể cuộn ngang">
      <table>
        <caption className="menu-sr-only">Món, giá bán cho một đơn vị bán, số nguyên liệu trong công thức hiệu lực tại ngày đọc và trạng thái</caption>
        <colgroup><col className="menu-col-name" /><col className="menu-col-price" /><col className="menu-col-recipe" /><col className="menu-col-status" /></colgroup>
        <thead><tr><th scope="col">Món</th><th scope="col">Giá bán</th><th scope="col">Công thức</th><th scope="col">Trạng thái</th></tr></thead>
        <tbody>{response.data.items.map((product) => <tr key={product.product_id}
          className={selectedId === product.product_id ? 'menu-row-selected' : ''}
          onClick={(event) => {
            const origin = event.currentTarget.querySelector('button')
            if (origin) onSelect(product.product_id, origin)
          }}>
          <th scope="row"><button type="button" onClick={(event) => { event.stopPropagation(); onSelect(product.product_id, event.currentTarget) }}
            aria-controls={selectedId === product.product_id ? 'menu-detail' : undefined}
            aria-expanded={selectedId === product.product_id}>{product.name}</button></th>
          <td className="menu-price">{formatMenuMoney(product.selling_price, product.currency)}</td>
          <td>{ingredientCountLabel(product)}</td>
          <td><span className={`menu-status menu-status--${product.status}`}>{productStatusLabels[product.status]}</span></td>
        </tr>)}</tbody>
      </table>
      {response.data.items.length === 0 && <div className="menu-empty" role="status">
        <span>{filtered ? 'Không tìm thấy món phù hợp' : 'Không có món trên trang này'}</span>
        {filtered && <button type="button" onClick={onClearFilters}>Xóa bộ lọc</button>}
      </div>}
    </div>
    <footer className="menu-table-footer">{response.data.items.length} món trên trang</footer>
  </section>
}
