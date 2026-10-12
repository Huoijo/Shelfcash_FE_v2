import { Link } from 'react-router'
import type { ImportCompletion } from '../importFlow.types'
import { Evidence } from './ImportMapping'

const knownCount = (value: number | null | undefined) => value == null ? 'Chưa biết' : value.toLocaleString('vi-VN')

export function ImportResult({ completion }: { completion: ImportCompletion }) {
  const resources = completion.updated_resources
  const metrics = [[completion.summary.files, 'files'], [completion.summary.sheets, 'sheets'], [completion.summary.mapped_fields, 'trường đã ghép'], [completion.summary.errors, 'lỗi']] as const
  return <div className="import-result">
    <section className="import-result__summary" aria-labelledby="import-result-title">
      <header><h2 id="import-result-title"><span className="import-result__check" aria-hidden="true">✓</span>{completion.outcome === 'no_changes' ? 'Hoàn tất — không có thay đổi' : 'Dữ liệu đã được cập nhật'}</h2>
        <span>Ngày dữ liệu: {completion.readiness.as_of_date.split('-').reverse().join('/')}</span></header>
      <dl>{metrics.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{knownCount(value)}</dd></div>)}</dl>
      {completion.status === 'completed_with_warnings' && <p role="status">Hoàn tất với {completion.summary.warnings} cảnh báo. Xem chi tiết biên nhận bên dưới.</p>}
    </section>
    <h3 className="import-result__section-title">{completion.outcome === 'no_changes' ? 'Phạm vi dữ liệu' : 'Dữ liệu đã được cập nhật'}</h3>
    <div className="import-flow__impacts">
      <section className="import-result__impact"><h3>Kho</h3><p><strong>{knownCount(resources.inventory.affected_ingredient_count)}</strong> nguyên liệu bị ảnh hưởng</p><Link to="/inventory">Xem kho</Link><small>{resources.inventory.updated ? 'Đã cập nhật' : 'Không cập nhật'}</small></section>
      <section className="import-result__impact"><h3>Menu</h3><p><strong>{knownCount(resources.menu.affected_product_count)}</strong> món bị ảnh hưởng</p><Link to="/menu">Xem menu</Link><small>{resources.menu.updated ? 'Đã cập nhật' : 'Không cập nhật'}</small></section>
      <section className="import-result__impact"><h3>Bán hàng</h3><p><strong>{knownCount(resources.sales.added_record_count)}</strong> bản ghi mới</p><small>{resources.sales.updated ? 'Đã cập nhật bán hàng' : 'Không cập nhật bán hàng'}</small></section>
    </div>
    <section className="import-result__next" aria-labelledby="import-readiness-title"><div><p>Bước tiếp theo</p><h2 id="import-readiness-title">Dự đoán</h2><p>Kiểm tra dữ liệu và thiết lập kế hoạch nhập hàng.</p></div>
      <Link className="import-result__cta" to="/forecast/planning">Đi tới Dự đoán <span aria-hidden="true">→</span></Link>
    </section>
    <p className="import-flow__muted">Điều kiện lập kế hoạch sẽ được kiểm tra tại bước tiếp theo.</p>
    <details className="import-result__details"><summary>Xem chi tiết biên nhận</summary>
      <p>Đã hoàn tất Import · {completion.completed_at}</p><p>{completion.summary.rows} dòng · {completion.summary.warnings} cảnh báo</p>
      <p>{resources.catalog.created_product_count} món mới · {resources.catalog.created_ingredient_count} nguyên liệu mới</p>
      <p>Khả năng tiếp tục tại thời điểm hoàn tất · {completion.readiness.evaluated_at}</p>
      {completion.readiness.actions.map((action) => <div key={action.action}>
        <p><strong>{({ inventory: 'Kho', menu: 'Menu', import: 'Nhập dữ liệu' })[action.action]}</strong> · {action.availability === 'ready' ? 'Sẵn sàng theo máy chủ' : action.availability === 'blocked' ? 'Bị chặn' : 'Chưa biết'}</p>
        {!!action.blockers.length && <Evidence value={action.blockers} label="Lý do chặn" />}{!!action.warnings.length && <Evidence value={action.warnings} label="Cảnh báo" />}
      </div>)}
      <Evidence value={{ commit_id: completion.commit_id, summary: completion.summary, readiness: completion.readiness, mapping_bindings: completion.mapping_bindings, effective_plan_digest: completion.effective_plan_digest, audit_reference: completion.audit_reference }} label="Thông tin đối soát" />
    </details>
    <p className="import-result__history"><Link to="/imports/history">Xem lịch sử nhập <span aria-hidden="true">→</span></Link></p>
  </div>
}
