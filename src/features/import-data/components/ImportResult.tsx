import { DebugContent, DebugValue } from '../../../shared/debug/DevelopmentTools'
import { ImportReadiness } from './ImportReadiness'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { uiTransition } from '../../../shared/motion/motion'
import type { ImportCompletion } from '../importFlow.types'

const knownCount = (value: number | null | undefined) => value == null ? 'Chưa biết' : value.toLocaleString('vi-VN')

export function ImportResult({ completion, readinessPreview }: { completion: ImportCompletion; readinessPreview?: import('../../decision-planning/planning.types').PlanningReadiness }) {
  const reducedMotion = useReducedMotion()
  const resources = completion.updated_resources
  const metrics = [[completion.summary.rows, 'dòng đã xử lý'], [completion.summary.inserted_record_count, 'mới'], [completion.summary.changed_record_count, 'cập nhật'], [completion.summary.no_op_count, 'không đổi']] as const
  return <div className="import-result">
    <section className="import-result__summary" aria-labelledby="import-result-title">
      <header><h2 id="import-result-title"><motion.span className="import-result__check" aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, transform: 'scale(0.85)' }} animate={{ opacity: 1, transform: 'scale(1)' }}
        transition={reducedMotion ? { duration: 0 } : uiTransition}>✓</motion.span>{completion.outcome === 'no_changes' ? 'Hoàn tất — không có thay đổi' : 'Dữ liệu đã được cập nhật'}</h2>
        <span>Ngày dữ liệu: {completion.readiness.as_of_date.split('-').reverse().join('/')}</span></header>
      <dl>{metrics.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{knownCount(value)}</dd></div>)}</dl>
      {completion.status === 'completed_with_warnings' && <p role="status">Hoàn tất với {completion.summary.warnings} cảnh báo. Xem chi tiết biên nhận bên dưới.</p>}
    </section>
    <div className="import-flow__impacts">
      <section className="import-result__impact"><h3>Kho</h3><p><strong>{knownCount(resources.inventory.affected_ingredient_count)}</strong> nguyên liệu bị ảnh hưởng</p><Link to="/inventory">Xem kho</Link><small>{resources.inventory.updated ? 'Đã cập nhật' : 'Không cập nhật'}</small></section>
      <section className="import-result__impact"><h3>Menu</h3><p><strong>{knownCount(resources.menu.affected_product_count)}</strong> món bị ảnh hưởng</p><Link to="/menu">Xem menu</Link><small>{resources.menu.updated ? 'Đã cập nhật' : 'Không cập nhật'}</small></section>
      <section className="import-result__impact"><h3>Bán hàng</h3><p><strong>{knownCount(resources.sales.added_record_count)}</strong> bản ghi mới</p><small>{resources.sales.updated ? 'Đã cập nhật bán hàng' : 'Không cập nhật bán hàng'}</small></section>
    </div>
    <ImportReadiness preview={readinessPreview} />
    <DebugContent><details className="import-result__details"><summary>Xem chi tiết biên nhận</summary>
      <p>Đã hoàn tất Import · {completion.completed_at}</p><p>{completion.summary.rows} dòng · {completion.summary.warnings} cảnh báo</p>
      <p>{resources.catalog.created_product_count} món mới · {resources.catalog.created_ingredient_count} nguyên liệu mới</p>
      <p>Khả năng tiếp tục tại thời điểm hoàn tất · {completion.readiness.evaluated_at}</p>
      {completion.readiness.actions.map((action) => <div key={action.action}>
        <p><strong>{({ inventory: 'Kho', menu: 'Menu', import: 'Nhập dữ liệu' })[action.action]}</strong> · {action.availability === 'ready' ? 'Sẵn sàng theo máy chủ' : action.availability === 'blocked' ? 'Bị chặn' : 'Chưa biết'}</p>
        {!!action.blockers.length && <DebugValue value={action.blockers} label="Lý do chặn" />}{!!action.warnings.length && <DebugValue value={action.warnings} label="Cảnh báo" />}
      </div>)}
      <DebugValue value={{ commit_id: completion.commit_id, summary: completion.summary, readiness: completion.readiness, mapping_bindings: completion.mapping_bindings, effective_plan_digest: completion.effective_plan_digest, audit_reference: completion.audit_reference }} label="Thông tin đối soát" />
    </details></DebugContent>
  </div>
}
