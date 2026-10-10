import { formatInventoryDate, formatQuantity, inventoryStatusLabels } from '../inventory.format'
import type { InventoryResponse } from '../inventory.types'

export function InventoryTable({ response, selectedId, onSelect, filtered, onClearFilters }: {
  response: InventoryResponse
  selectedId: string | null
  onSelect: (id: string, origin: HTMLElement) => void
  filtered: boolean
  onClearFilters: () => void
}) {
  return (
    <section className="inventory-table-panel" aria-label="Nguyên liệu trong kho">
      <div className="inventory-table-scroll" tabIndex={0} role="region" aria-label="Bảng tồn kho, có thể cuộn ngang">
        <table>
          <caption className="inventory-sr-only">Tồn vật lý đã ghi nhận, số lô và hạn gần nhất. Tồn ghi nhận không chứng minh đã kiểm kê đủ kho.</caption>
          <colgroup><col className="inventory-col-name" /><col className="inventory-col-quantity" /><col className="inventory-col-lots" /><col className="inventory-col-expiry" /><col className="inventory-col-status" /></colgroup>
          <thead><tr><th scope="col">Nguyên liệu</th><th scope="col">Hiện có</th><th scope="col">Số lô</th><th scope="col">Hạn gần nhất</th><th scope="col">Trạng thái</th></tr></thead>
          <tbody>{response.data.items.map((item) => <tr key={item.ingredient_id} className={selectedId === item.ingredient_id ? 'inventory-row-selected' : ''}
            onClick={(event) => onSelect(item.ingredient_id, event.currentTarget.querySelector('button')!)}>
            <th scope="row"><button type="button" onClick={(event) => { event.stopPropagation(); onSelect(item.ingredient_id, event.currentTarget) }}
              aria-controls={selectedId === item.ingredient_id ? 'inventory-detail' : undefined} aria-expanded={selectedId === item.ingredient_id}>{item.name}</button>
              {!item.ingredient_active && <span className="inventory-row-note">Ngừng hoạt động</span>}</th>
            <td className="inventory-current-quantity">{formatQuantity(item.on_hand_quantity, item.unit)}
              {item.stock_completeness === 'UNKNOWN' && <span className="inventory-row-note">Chưa xác nhận đủ tồn thực tế</span>}</td>
            <td>{item.lot_count}</td><td>{formatInventoryDate(item.nearest_expiry)}</td>
            <td><span className={`inventory-status inventory-status--${item.status}`}>{inventoryStatusLabels[item.status]}</span></td>
          </tr>)}</tbody>
        </table>
        {response.data.items.length === 0 && <div className="inventory-empty" role="status">
          <span>{filtered ? 'Không tìm thấy nguyên liệu phù hợp' : 'Chưa có dữ liệu nguyên liệu trong kho'}</span>
          <p>Không có bản ghi không đồng nghĩa tồn thực tế bằng 0.</p>
          {filtered && <button type="button" onClick={onClearFilters}>Xóa bộ lọc</button>}
        </div>}
      </div>
      <footer className="inventory-table-footer">Hiện có = tồn vật lý đã ghi nhận, gồm cả lô hết hạn. Xem chi tiết để biết lượng dùng được.</footer>
    </section>
  )
}
