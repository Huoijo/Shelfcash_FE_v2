import type { ReactNode } from 'react'
import type { PlanningIngredient, PlanningNotification, PlanningOption, PlanningReasons, PlanningRun } from '../planning.types'
import { formatPlanningDate, formatPlanningDecimal, formatPlanningMoney, formatPlanningQuantity, planningStrategyLabels } from '../planning.format'
import { PlanningIngredientVisual } from './PlanningVisualIntelligence'

export function PlanningNotifications({ title, items, action }: { title: string; items: PlanningNotification[]; action?: ReactNode }) {
  if (items.length === 0) return null
  return <section className="sc-proc-notifications" aria-label={title}><h3>{title}</h3><ul className="sc-proc-short-bullets">
    {items.map((item, index) => <li key={`${item.code}-${index}`}><span>{item.message}</span> <code>{item.code}</code>
      {item.details?.entity_id && <small> · {item.details.entity_id}</small>}
    </li>)}
  </ul>{action}</section>
}

export function PlanningPurchases({ option, currency, nameFor, onInspect }: {
  option: PlanningOption | undefined
  currency: string
  nameFor: (id: string) => string
  onInspect: (id: string) => void
}) {
  if (!option) return <p className="sc-proc-empty-state">Không có phương án được chọn. Không thể suy ra kế hoạch mua hàng.</p>
  return <div className="planning-table-scroll" tabIndex={0} role="region" aria-label="Các dòng mua hàng, có thể cuộn ngang">
    <table className="planning-table"><caption>Các dòng mua hàng của phương án · không phải thứ tự ưu tiên</caption>
      <thead><tr><th scope="col">Nguyên liệu / nhà cung cấp</th><th scope="col">Số lượng</th><th scope="col">Pack</th><th scope="col">Ngày đến / hết hạn</th><th scope="col">Chi phí mua</th></tr></thead>
      <tbody>{option.purchases.map((purchase, index) => <tr key={`${purchase.supplier_term_id}-${purchase.ingredient_id}-${purchase.arrival_date}-${index}`}>
        <th scope="row"><button type="button" className="sc-proc-text-action planning-identity" onClick={() => onInspect(purchase.ingredient_id)}>{nameFor(purchase.ingredient_id)}</button>
          <small>Nguyên liệu: {purchase.ingredient_id}</small><small>Nhà cung cấp: {purchase.supplier_id}</small><small>Điều khoản: {purchase.supplier_term_id}</small>
        </th>
        <td><span title={`${purchase.quantity.numerator}/${purchase.quantity.denominator}`}>{formatPlanningQuantity(purchase.quantity, purchase.unit)}</span></td>
        <td>{purchase.packs}<small>Kích thước pack chưa được cung cấp</small></td>
        <td>{formatPlanningDate(purchase.arrival_date)}<small>Hết hạn: {formatPlanningDate(purchase.expiry_date)}</small></td>
        <td>{formatPlanningMoney(purchase.purchase_outlay, currency)}<small>{purchase.payable_fee_components.length} thành phần phí được lưu</small></td>
      </tr>)}</tbody>
    </table>{option.purchases.length === 0 && <p className="sc-proc-empty-state">Phương án có danh sách mua trống; không tự tạo dòng mua.</p>}
  </div>
}

export function PlanningOptionFacts({ option, run }: { option: PlanningOption; run: PlanningRun }) {
  return <div className="sc-proc-strategies">
    <dl className="sc-proc-ingredient-metadata"><div><dt>Phương án</dt><dd>{option.option_id}</dd></div>
      <div><dt>Đủ điều kiện xét chọn</dt><dd>{option.eligible ? 'Có' : 'Không'}</dd></div>
      <div><dt>Chi phí mua</dt><dd>{formatPlanningMoney(option.costs.purchase, option.costs.currency)}</dd></div>
      <div><dt>Phí phải trả</dt><dd>{formatPlanningMoney(option.costs.payable_fees, option.costs.currency)}</dd></div>
      <div><dt>Phí giao hàng</dt><dd>{formatPlanningMoney(option.costs.delivery_fees, option.costs.currency)} · {option.costs.fee_classification}</dd></div>
      <div><dt>Tổng chi phí</dt><dd>{formatPlanningMoney(option.costs.total, option.costs.currency)}</dd></div>
    </dl>
    <div className="planning-table-scroll" tabIndex={0} role="region" aria-label="Mức đáp ứng từng món và đường nhu cầu">
      <table className="planning-table"><caption>Mức đáp ứng theo món và đường nhu cầu · không phải tổng toàn kế hoạch</caption>
        <thead><tr><th scope="col">Món</th><th scope="col">Đường</th><th scope="col">Nhu cầu</th><th scope="col">Đáp ứng</th><th scope="col">Thiếu bán</th><th scope="col">Tỷ lệ</th></tr></thead>
        <tbody>{option.product_services.map((service) => <tr key={`${service.product_id}-${service.path}`}>
          <th scope="row">{run.scope?.menu_products.find((product) => product.product_id === service.product_id)?.name ?? service.product_id}<small>{service.product_id}</small></th>
          <td>{service.path}</td><td>{formatPlanningQuantity(service.requested, service.unit)}</td><td>{formatPlanningQuantity(service.fulfilled, service.unit)}</td><td>{formatPlanningQuantity(service.lost_sales, service.unit)}</td>
          <td>{service.service === null ? 'Chưa đánh giá' : `${formatPlanningDecimal(service.service.percent_view)}%`}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="planning-table-scroll" tabIndex={0} role="region" aria-label="Đối chiếu yêu cầu phục vụ">
      <table className="planning-table"><caption>Đối chiếu yêu cầu phục vụ đã lưu</caption><thead><tr><th scope="col">Món</th><th scope="col">Đường</th><th scope="col">Mục tiêu</th><th scope="col">Kết quả</th><th scope="col">Thiếu</th></tr></thead>
        <tbody>{option.requirements_assessment.map((assessment) => <tr key={`${assessment.product_id}-${assessment.path}`}><th scope="row">{assessment.product_id}</th><td>{assessment.path}</td><td>{formatPlanningDecimal(assessment.target_percent)}%</td><td>{assessment.status}</td><td>{formatPlanningQuantity(assessment.shortfall)}</td></tr>)}</tbody>
      </table>
    </div>
    {(option.not_selected_reason || option.rejection_reasons.length > 0) && <p className="sc-planning-note">Mã xét chọn (không phải diễn giải nhân quả): {[option.not_selected_reason, ...option.rejection_reasons].filter(Boolean).join(' · ')}</p>}
    <PlanningNotifications title="Vấn đề của phương án" items={option.issues} />
  </div>
}

export function PlanningIngredientPanel({ ingredient, currency, start }: { ingredient: PlanningIngredient; currency: string; start?:string }) {
  return <article className="sc-proc-ingredient-detail">
    <header className="sc-proc-ingredient-detail-header"><div><h2>{ingredient.name_availability === 'captured' && ingredient.display_name !== null ? ingredient.display_name : ingredient.ingredient_id}</h2><p className="sc-planning-note">{ingredient.ingredient_id} · {ingredient.unit}</p></div></header>
    <div className="sc-proc-ingredient-detail-scroll">
      <PlanningIngredientVisual ingredient={ingredient} start={start??ingredient.daily_balances?.[0]?.day??''}/>
      <dl className="sc-proc-ingredient-metadata"><div><dt>Tên nguyên liệu</dt><dd>{ingredient.name_availability === 'captured' ? 'Đã chụp cùng lần chạy' : 'Không được chụp; dùng UUID'}</dd></div>
        <div><dt>Phạm vi tồn chụp</dt><dd>{ingredient.captured_stock.scope_declaration}</dd></div><div><dt>Bằng chứng</dt><dd>{ingredient.evidence_availability}</dd></div><div><dt>Phương án đang xem</dt><dd>{ingredient.selected_option_id ?? 'Chưa chọn'}</dd></div></dl>
      <section className="sc-proc-chart-panel"><h3>Nhu cầu và tồn từng ngày</h3><p className="sc-planning-note">LOW / BASE / HIGH là các đường tính của máy chủ, không phải P25 / P50 / P75. Giá trị từng ngày không phải tổng của cả kỳ.</p>
        {ingredient.daily_balances === null ? <p>Chưa có bằng chứng tính theo ngày.</p> : <div className="planning-table-scroll" tabIndex={0} role="region" aria-label="Nhu cầu và tồn theo ngày, có thể cuộn ngang">
          <table className="planning-table"><caption>Giá trị từng ngày giữ nguyên từ lần chạy</caption><thead><tr><th scope="col">Ngày</th><th scope="col">Đường</th><th scope="col">Nhu cầu</th><th scope="col">Có sẵn</th><th scope="col">Thiếu</th><th scope="col">Nhập đến</th><th scope="col">Tiêu thụ</th><th scope="col">Hết hạn</th><th scope="col">Hao hụt khác</th><th scope="col">Cuối ngày</th></tr></thead>
            <tbody>{ingredient.daily_balances.map((day) => <tr key={`${day.path}-${day.day}`}><th scope="row">{formatPlanningDate(day.day)}</th><td>{day.path}</td><td>{formatPlanningQuantity(day.requested, day.unit)}</td><td>{formatPlanningQuantity(day.available, day.unit)}</td><td>{formatPlanningQuantity(day.shortage, day.unit)}</td><td>{formatPlanningQuantity(day.incoming_quantity, day.unit)}</td><td>{formatPlanningQuantity(day.consumed, day.unit)}</td><td>{formatPlanningQuantity(day.expired, day.unit)}</td><td>{formatPlanningQuantity(day.other_waste, day.unit)}</td><td>{formatPlanningQuantity(day.ending, day.unit)}</td></tr>)}</tbody>
          </table>
        </div>}
      </section>
      <details className="sc-proc-disclosure"><summary>Các lô tồn đã chụp ({ingredient.captured_stock.lots.length})</summary>
        {ingredient.captured_stock.scope_declaration === 'CONFIRMED_EMPTY' && <p>Xác nhận không có lô tồn trong snapshot.</p>}
        {ingredient.captured_stock.scope_declaration === 'UNKNOWN' && <p>Phạm vi tồn chưa biết; không suy ra tồn bằng 0.</p>}
        <ul className="sc-proc-short-bullets">{ingredient.captured_stock.lots.map((lot) => <li key={lot.lot_id}><span>{lot.lot_id}: {formatPlanningQuantity(lot.quantity, lot.unit)}</span> · Hết hạn {formatPlanningDate(lot.expiry_date)} · Giá đơn vị {lot.cost_availability === 'known' ? formatPlanningMoney(lot.unit_cost, currency) : 'Chưa biết'}</li>)}</ul>
      </details>
      <details className="sc-proc-disclosure"><summary>Quan hệ món / công thức ({ingredient.related_products.length})</summary><ul className="sc-proc-short-bullets">{ingredient.related_products.map((product) => <li key={product.product_id}>{product.product_id} · {product.selling_unit} · Công thức: {product.recipe_ids.join(', ') || 'Chưa có'} · Ngày: {product.affected_dates.map(formatPlanningDate).join(', ')}</li>)}</ul></details>
      <PlanningNotifications title="Vấn đề của nguyên liệu" items={ingredient.issues} />
    </div>
  </article>
}

export function PlanningEngineReasons({ reasons }: { reasons: PlanningReasons }) {
  return <section className="sc-proc-ai-summary" aria-label="Lý do từ engine, không phải AI">
    <h2>Lý do từ engine · không phải phản hồi AI</h2><p className="sc-planning-note">Bằng chứng: {reasons.evidence_availability} · Khả dụng: {reasons.availability}. Các mã dưới đây là dữ liệu xét chọn, không tự chuyển thành lời giải thích nhân quả.</p>
    <p className="sc-planning-note">Mã chọn: <code>{reasons.winner.reason_code}</code> · Phương án: {reasons.winner.option_id ?? 'Không có'}</p>
    <PlanningNotifications title="Chặn từ engine" items={reasons.blockers} /><PlanningNotifications title="Cảnh báo từ engine" items={reasons.warnings} />
    {reasons.exclusions.length > 0 && <details className="sc-proc-disclosure"><summary>Món bị loại khỏi phạm vi tính</summary><ul className="sc-proc-short-bullets">{reasons.exclusions.map((item) => <li key={item.product_id}>{item.product_id} · Mã: {item.reason_codes.join(' · ')} · Ngày: {item.affected_dates.map(formatPlanningDate).join(', ') || 'Không có'}</li>)}</ul></details>}
    {reasons.options.map((option) => <details key={option.option_id} className="sc-proc-disclosure"><summary>Phương án {option.option_id} · {option.eligible ? 'đủ điều kiện' : 'không đủ điều kiện'}</summary>
      <p>Mã: {[option.not_selected_reason, ...option.rejection_reasons].filter(Boolean).join(' · ') || 'Không có'}</p>
      {option.evidence.map((evidence) => <section key={evidence.strategy} className="planning-engine-evidence"><h3>{planningStrategyLabels[evidence.strategy]} · {evidence.construction_path}</h3>
        <p>Thực thi: {evidence.execution} · Kết thúc: <code>{evidence.termination}</code> · Tìm kiếm đầy đủ: {evidence.search_complete ? 'Có' : 'Không'}</p>
        <p>Bằng chứng: {evidence.proof} · Phạm vi: {evidence.proof_scope} · Khả thi yêu cầu: {evidence.customer_feasibility}</p>
        <h4>Thiếu so với yêu cầu khách hàng</h4><ul className="sc-proc-short-bullets">{evidence.customer_gaps.map((gap) => <li key={`${gap.product_id}-${gap.path}`}>Món {gap.product_id} · {gap.path} · Mục tiêu {formatPlanningDecimal(gap.target_percent)}% · Thiếu {formatPlanningQuantity(gap.shortfall, gap.unit)}</li>)}</ul>
        <h4>Thiếu so với đường xây dựng</h4><ul className="sc-proc-short-bullets">{evidence.construction_gaps.map((gap) => <li key={`${gap.product_id}-${gap.path}`}>Món {gap.product_id} · {gap.path} · Mục tiêu {formatPlanningDecimal(gap.target_percent)}% · Thiếu {formatPlanningQuantity(gap.shortfall, gap.unit)}</li>)}</ul>
      </section>)}
    </details>)}
  </section>
}
