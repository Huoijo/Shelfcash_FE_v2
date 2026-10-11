import { Link } from 'react-router'
import type { ImportCompletion } from '../importFlow.types'
import { Evidence } from './ImportMapping'

const knownCount = (value: number | null | undefined) => value == null ? 'Chưa biết' : value.toLocaleString('vi-VN')

export function ImportResult({ completion }: { completion: ImportCompletion }) {
  const resources = completion.updated_resources
  return <>
    <h2>{completion.outcome === 'no_changes' ? 'Hoàn tất — không có thay đổi' : 'Đã hoàn tất Import'}</h2>
    <p>Biên nhận nguyên tử từ máy chủ · {completion.status === 'completed_with_warnings' ? 'Có cảnh báo cần xem' : 'Đã hoàn tất'}</p>
    <p className="import-flow__muted">Commit: {completion.commit_id} · {completion.completed_at}</p>
    <dl className="import-flow__summary" aria-label="Tóm tắt biên nhận Import">
      <div><dt>File</dt><dd>{completion.summary.files}</dd></div><div><dt>Sheet</dt><dd>{completion.summary.sheets}</dd></div>
      <div><dt>Dòng</dt><dd>{completion.summary.rows}</dd></div><div><dt>Trường đã ghép</dt><dd>{completion.summary.mapped_fields}</dd></div>
      <div><dt>Lỗi</dt><dd>{completion.summary.errors}</dd></div><div><dt>Cảnh báo</dt><dd>{completion.summary.warnings}</dd></div>
    </dl>
    <div className="import-flow__impacts">
      <section className="import-flow__card"><h3>Kho</h3><p>{resources.inventory.updated ? 'Đã cập nhật' : 'Không cập nhật'}</p><p>{knownCount(resources.inventory.affected_ingredient_count)} nguyên liệu bị ảnh hưởng</p><Link to="/inventory">Xem Kho hiện tại</Link></section>
      <section className="import-flow__card"><h3>Menu</h3><p>{resources.menu.updated ? 'Đã cập nhật' : 'Không cập nhật'}</p><p>{knownCount(resources.menu.affected_product_count)} món bị ảnh hưởng</p><Link to="/menu">Xem Menu hiện tại</Link></section>
      <section className="import-flow__card"><h3>Bán hàng / Catalog</h3><p>{resources.sales.updated ? 'Đã cập nhật bán hàng' : 'Không cập nhật bán hàng'}</p><p>{knownCount(resources.sales.added_record_count)} bản ghi bán hàng mới</p><p>{resources.catalog.created_product_count} món mới · {resources.catalog.created_ingredient_count} nguyên liệu mới</p></section>
    </div>
    <section className="import-flow__card" aria-labelledby="import-readiness-title">
      <h3 id="import-readiness-title">Khả năng tiếp tục tại thời điểm hoàn tất</h3>
      <p className="import-flow__muted">Đánh giá lưu cùng biên nhận lúc {completion.readiness.evaluated_at}; không phải kết quả tính lại hiện tại.</p>
      {completion.readiness.actions.map((action) => <div key={action.action}>
        <p><strong>{action.action}</strong> · {action.availability === 'ready' ? 'Sẵn sàng theo máy chủ' : action.availability === 'blocked' ? 'Bị chặn' : 'Chưa biết'}</p>
        <p className="import-flow__muted">Dữ liệu: {action.data_status} · Thực thi: {action.execution_status} · {action.result_assessment}</p>
        {!!action.blockers.length && <Evidence value={action.blockers} label="Lý do chặn" />}{!!action.warnings.length && <Evidence value={action.warnings} label="Cảnh báo" />}
      </div>)}
      <button type="button" disabled title="Màn hình Dự đoán chưa được triển khai">Dự đoán — chưa khả dụng</button>
    </section>
    <Evidence value={{ summary: completion.summary, mapping_bindings: completion.mapping_bindings, effective_plan_digest: completion.effective_plan_digest, audit_reference: completion.audit_reference, omitted_actions: completion.readiness.omitted_actions }} label="Chi tiết biên nhận và audit" />
    <p><Link to="/imports/history">Xem lịch sử nhập</Link></p>
  </>
}
