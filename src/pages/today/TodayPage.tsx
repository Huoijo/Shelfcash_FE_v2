import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { config } from '../../app/config'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { useCurrentStore } from '../../features/store/store.context'
import { getInventory } from '../../features/inventory/inventory.data'
import { formatInventoryDate, inventoryStatusLabels } from '../../features/inventory/inventory.format'
import type { InventoryResponse } from '../../features/inventory/inventory.types'
import './TodayPage.css'

type AttentionState = { key: string } & ({ status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; response: InventoryResponse })

// MagicPath 458632053018234880 / 458637450923900928.
// Show recorded inventory facts only; planning readiness is checked on its own route.
export function TodayPage() {
  const { currentStoreId, state: storeState } = useCurrentStore()
  const store = storeState.status === 'ready' || storeState.status === 'mock_preview' ? storeState.store : null
  const canRead = !!store?.membership.effective_permissions.includes('inventory.read')
  const [retry, setRetry] = useState(0)
  const key = JSON.stringify([currentStoreId, canRead, retry])
  const [state, setState] = useState<AttentionState>({ status: 'loading', key })
  useEffect(() => {
    if (!canRead) return
    const controller = new AbortController()
    getInventory({ status: ['low_stock', 'near_expiry', 'expired', 'empty'], sort: 'nearest_expiry', limit: 6 }, controller.signal, currentStoreId)
      .then((response) => { if (!controller.signal.aborted) setState({ status: 'ready', key, response }) })
      .catch((error: unknown) => { if (!controller.signal.aborted) setState({ status: 'error', key, message: error instanceof Error ? error.message : 'Không tải được dữ liệu tồn kho.' }) })
    return () => controller.abort()
  }, [key, currentStoreId, canRead])
  const current = state.key === key ? state : { status: 'loading' as const, key }
  const response = canRead && current.status === 'ready' ? current.response : null
  return <div className="today-page">
    <AppShellHeader><span className="today-location">Hôm nay</span></AppShellHeader>
    <main className="today-content">
      <header className="today-heading"><h1>Hôm nay</h1><div>{store && <time dateTime={store.as_of_date}>{formatInventoryDate(store.as_of_date)}</time>}<button type="button" disabled title="Hỏi AI chưa khả dụng">Hỏi AI về hôm nay</button></div></header>
      {config.mockPreview && <p className="today-source" role="note">Minh họa · Dữ liệu mẫu, không phản ánh hoạt động thực tế.</p>}
      <nav className="today-progress" aria-label="Quy trình vận hành"><Link to="/imports"><span aria-hidden="true">○</span> Cập nhật dữ liệu</Link><span aria-hidden="true">→</span><Link to="/inventory">Kiểm tra tồn kho</Link><span aria-hidden="true">→</span><Link to="/forecast/planning">Lập kế hoạch nhập</Link></nav>
      <div className="today-grid">
        <section className="today-attention" aria-labelledby="today-attention-title"><header><h2 id="today-attention-title">Cần chú ý hôm nay</h2>{response && <span>{response.meta.pagination.total_count === null ? 'Tồn kho cần xem' : <><strong>{response.meta.pagination.total_count}</strong> nguyên liệu cần xem</>}</span>}</header>
          {!canRead && <div className="today-feedback">Bạn chưa có quyền xem tồn kho của cửa hàng này.</div>}
          {canRead && current.status === 'loading' && <div className="today-feedback" role="status">Đang kiểm tra tồn kho…</div>}
          {canRead && current.status === 'error' && <div className="today-feedback" role="alert"><p>{current.message}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></div>}
          {response && <><ul>{response.data.items.map((item) => <li key={item.ingredient_id}><Link to={`/inventory?ingredient=${encodeURIComponent(item.ingredient_id)}`}><span className="today-dot" aria-hidden="true" /><div><strong>{item.name}</strong><span className="today-badge">{inventoryStatusLabels[item.status]}</span><small>{item.nearest_expiry ? `Hạn gần nhất ${formatInventoryDate(item.nearest_expiry)}` : 'Xem chi tiết tồn kho và lô hàng'}</small></div><span className="today-row-action">Xem <span aria-hidden="true">→</span></span></Link></li>)}</ul>
            {!response.data.items.length && <div className="today-feedback"><strong>Chưa có cảnh báo tồn kho trong nhóm đã kiểm tra.</strong><p>Theo dõi thêm số liệu và mức độ đầy đủ tại Kho.</p></div>}
            <footer><span>Dữ liệu ngày {formatInventoryDate(response.meta.as_of_date)} · {response.data.items.length} mục đang hiển thị</span><Link to="/inventory">Xem kho <span aria-hidden="true">→</span></Link></footer></>}
        </section>
        <section className="today-plan" aria-labelledby="today-plan-title"><header><h2 id="today-plan-title">Kế hoạch nhập hàng</h2></header><div className="today-plan__body"><span>Bước tiếp theo</span><h3>Chuẩn bị cho<br />những ngày tới.</h3><p>Kiểm tra dữ liệu, chọn ngày và ngân sách để tạo kế hoạch phù hợp với cửa hàng.</p><p className="today-plan__note">Điều kiện và kết quả được kiểm tra khi mở kế hoạch.</p><Link className="today-primary" to="/forecast/planning">Mở kế hoạch nhập <span aria-hidden="true">→</span></Link></div></section>
      </div>
      {response && <section className="today-stock" aria-labelledby="today-stock-title"><header><h2 id="today-stock-title">Tổng quan tồn kho</h2><Link to="/inventory">Xem chi tiết <span aria-hidden="true">→</span></Link></header><dl><div><dt>Nguyên liệu</dt><dd>{response.data.summary.ingredient_count}</dd></div><div><dt>Lô hàng còn tồn</dt><dd>{response.data.summary.positive_lot_count}</dd></div><div><dt>Lô gần hạn</dt><dd>{response.data.summary.near_expiry_lot_count}</dd></div><div><dt>Nguyên liệu sắp hết</dt><dd>{response.data.summary.low_stock_ingredient_count ?? 'Chưa biết'}</dd></div></dl></section>}
    </main>
  </div>
}
