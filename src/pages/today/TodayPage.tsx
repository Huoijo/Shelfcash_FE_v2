import { Link } from 'react-router'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { useCurrentStore } from '../../features/store/store.context'
import { capabilityError, useCapabilityQuery } from '../../features/backend-capabilities/capabilities.react'
import type { WireTodaySection_TodayTaskList_, WireTodayTask } from '../../features/backend-capabilities/capabilities.wire'
import { config } from '../../app/config'
import './TodayPage.css'

const availability = { available: 'Đã đọc dữ liệu hiện tại', empty: 'Không có mục trong phạm vi này', unknown: 'Chưa xác định', forbidden: 'Bạn chưa có quyền xem', unavailable: 'Hiện chưa khả dụng' }
function taskDestination(task: WireTodayTask, store: string) {
  if (task.type === 'import') return `/imports?import_id=${task.id}&store_id=${store}`
  if (task.type === 'mapping_submission') return `/imports/approvals?store_id=${store}&submission_id=${task.id}`
  return `/store?store_id=${store}&permission_request_id=${task.id}`
}
function Tasks({ label, section, store }: { label: string; section: WireTodaySection_TodayTaskList_ | null | undefined; store: string }) {
  const value = section?.availability === 'available' || section?.availability === 'empty' ? section.value : null
  return <><p className="sc-today-section-status"><strong>{label}</strong> · {section ? availability[section.availability] : 'Chưa được đánh giá'}{value && ` · ${value.total_count} mục`}{section?.completeness === 'partial' && ' · Phạm vi một phần'}</p>{value && <ul>{value.items.map(task => <li className="sc-today-attention-row" key={task.id}><span className="sc-today-attention-dot" /><div className="sc-today-attention-context"><strong>{label}</strong><span className="sc-today-attention-meta">{task.state}</span></div><Link className="sc-today-row-action" to={taskDestination(task, store)}>Mở →</Link></li>)}</ul>}</>
}
export function TodayPage() {
  const { currentStoreId } = useCurrentStore()
  const query = useCapabilityQuery('D01', { path: { store_id: currentStoreId ?? '' } }, !!currentStoreId)
  const result = query.result, sections = result?.data.sections
  const inventory = sections?.inventory, stock = inventory && ['available', 'empty'].includes(inventory.availability) ? inventory.value : null
  const planning = sections?.planning, run = planning?.availability === 'available' ? planning.value : null
  const readiness = sections?.readiness, assessment = readiness?.availability === 'available' ? readiness.value : null
  return <><AppShellHeader><span>Hôm nay</span></AppShellHeader><main className="sc-today-content" aria-label="Tổng quan hôm nay"><header className="sc-today-page-header"><h1>Hôm nay</h1><div className="sc-today-header-actions">{result && <time dateTime={result.meta.as_of_date}>{result.meta.as_of_date} · {result.meta.timezone}</time>}<button className="sc-today-ai-entry" disabled>Hỏi AI về hôm nay · Chưa hỗ trợ</button></div></header>
    {query.loading && <p role="status">Đang đọc tổng quan hiện tại…</p>}{!!query.error && <p role="alert">{capabilityError(query.error)} <button onClick={query.retry}>Thử lại</button></p>}{config.mockPreview && <p>Kết nối tài khoản để đọc tổng quan. Bản minh họa không tạo dữ liệu Hôm nay.</p>}
    <nav className="sc-today-readiness" aria-label="Readiness hiện tại"><ol><li><Link to="/imports">Dữ liệu · {readiness ? availability[readiness.availability] : 'Chưa được đánh giá'}</Link></li>{assessment?.actions.map(action => <li key={action.action} data-brand-success={action.can_execute}><Link to="/forecast/planning">{action.action === 'planning' ? 'Kế hoạch' : 'Dự đoán'} · {action.can_execute ? 'Sẵn sàng' : 'Chưa sẵn sàng'}</Link></li>)}</ol></nav>
    <div className="sc-today-primary"><section className="sc-today-attention-panel"><header><h2>Cần chú ý hôm nay</h2><button disabled={query.loading || config.mockPreview} onClick={query.retry}>Đọc lại</button></header>
      <p className="sc-today-section-status"><strong>Tồn kho</strong> · {inventory ? availability[inventory.availability] : 'Chưa được đánh giá'}{inventory?.completeness === 'partial' && ' · Phạm vi một phần'}</p>
      {stock && <><p className="sc-today-section-status">{stock.expired_lot_count} lô hết hạn · {stock.near_expiry_lot_count} lô gần hạn · {stock.low_stock_ingredient_count ?? 'Chưa biết số'} nguyên liệu sắp hết · {stock.unknown_assessment_ingredient_count} nguyên liệu chưa đánh giá đủ</p><ul>{stock.items.map(item => <li className="sc-today-attention-row" key={item.ingredient_id}><span className="sc-today-attention-dot" /><div className="sc-today-attention-context"><strong>Nguyên liệu cần kiểm tra</strong><span className="sc-today-attention-meta">{item.usable_quantity ?? 'Chưa xác định'} {item.unit}</span></div><Link className="sc-today-row-action" to={`/inventory?ingredient=${item.ingredient_id}`}>Xem kho →</Link></li>)}</ul>{stock.has_more && <p className="sc-today-section-status"><Link to="/inventory">Xem thêm tại Kho →</Link></p>}</>}
      <Tasks label="Lần nhập cần chú ý" section={sections?.imports} store={currentStoreId!} /><Tasks label="Đề xuất cách đọc" section={sections?.mapping} store={currentStoreId!} /><Tasks label="Yêu cầu quyền" section={sections?.permissions} store={currentStoreId!} />
    </section><section className="sc-today-decision-card"><header><h2>Quyết định đang chờ</h2></header><div className="sc-today-decision-body"><p>Chưa có dữ liệu xác định quyết định đang chờ. Run gần nhất không mặc nhiên là quyết định cần xác nhận.</p>{run ? <><h3>Kế hoạch gần nhất</h3><p>{run.status}{run.outcome ? ` · ${run.outcome}` : ''}</p><Link className="sc-today-primary-action" to={`/forecast/planning?plan_id=${run.run_id}&historical=1`}>Xem kế hoạch →</Link></> : <p>{planning ? availability[planning.availability] : 'Kế hoạch chưa được đánh giá'}</p>}</div></section></div>
    <section className="sc-today-outlook"><header><h2>Tổng quan 7 ngày tới</h2></header><p className="sc-today-outlook-empty">Chưa có dữ liệu tổng quan nhu cầu, rủi ro thiếu hàng và lịch nhận hàng cho 7 ngày tới.</p></section>
  </main></>
}
