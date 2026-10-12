import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlanningSetup } from '../src/features/decision-planning/components/PlanningSetup'
import { PlanningResults } from '../src/features/decision-planning/components/PlanningResults'
import { PlanningEngineReasons, PlanningIngredientPanel, PlanningOptionFacts, PlanningPurchases } from '../src/features/decision-planning/components/PlanningEvidence'
import { buildPlanningSetupRequest, defaultPlanningCutoff, formatPlanningDecimal, formatPlanningMoney, parsePlanningBudget, shiftPlanningDate } from '../src/features/decision-planning/planning.format'
import { PLANNING_FIXTURE_IDS, planningContextFixture, planningFailedPartialFixture, planningIngredientFixture, planningIngredientsFixture,
  planningNoWinnerFixture, planningOptionFixture, planningReadinessFixture, planningReasonsFixture, planningRunFixture } from '../src/features/decision-planning/planning.fixtures'

const noop = () => {}
const render = (component, props) => renderToStaticMarkup(createElement(component, props))
const setup = (overrides = {}) => render(PlanningSetup, { context: planningContextFixture(), busy: false, canCreate: true,
  onCreate: noop, onAssessDate: noop, readiness: planningReadinessFixture(), readinessDate: '2026-10-11', ...overrides })
const results = (overrides = {}) => render(PlanningResults, { run: planningRunFixture(), selectedOptionId: null, busy: false, detailBusy: false,
  onSelectOption: noop, onLoadIngredients: noop, onMoreIngredients: noop, onSelectIngredient: noop, onLoadReasons: noop, onNewPlan: noop, ...overrides })

test('setup preserves labeled MagicPath concepts, only actual seven-day horizon and explicit unsupported controls', () => {
  const html = setup()
  for (const label of ['Dữ liệu tính đến ngày', 'Lập kế hoạch cho', 'Ngân sách nhập hàng', 'Ưu tiên', 'Tiết kiệm', 'Cân bằng', 'An toàn', 'Tính cả đơn hàng đang chờ', 'Cài đặt nâng cao', 'Tạo kế hoạch nhập hàng']) assert.ok(html.includes(label), label)
  assert.match(html, /type="date"[^>]*value="2026-10-10"/)
  assert.match(html, /<option value="7" selected="">7 ngày/)
  assert.equal((html.match(/type="radio"[^>]*disabled=""/g) ?? []).length, 3)
  assert.doesNotMatch(html, /type="radio"[^>]*checked=""|type="checkbox"[^>]*checked=""/)
  assert.match(html, /Chưa hỗ trợ chọn thủ công/)
  assert.match(html, /Các tùy chọn nâng cao chưa khả dụng/)
  assert.doesNotMatch(html, /value="14"|value="30"/)
})

test('setup create gate requires matching selected-date R01 and respects in-flight/current-right fences', () => {
  assert.doesNotMatch(setup(), /type="submit"[^>]*disabled=""/)
  for (const props of [{ readiness: null }, { readinessDate: '2026-10-12' }, { canCreate: false }, { busy: true }, { readinessBusy: true },
    { context: planningContextFixture({ capabilities: { winner_selection: false, saved_requirements: false } }) }]) {
    assert.match(setup(props), /type="submit"[^>]*disabled=""/)
  }
  const blocked = planningReadinessFixture()
  blocked.actions[0] = { ...blocked.actions[0], can_execute: false, availability: 'blocked', blockers: [{ code: 'INSUFFICIENT_HISTORY', source: 'sales', scope: 'STORE', entity_id: null, affected_dates: [], details: {} }] }
  const html = setup({ readiness: blocked })
  assert.match(html, /INSUFFICIENT_HISTORY/)
  assert.match(html, /type="submit"[^>]*disabled=""/)
})

test('setup does not treat latest sales date as an authoritative cutoff default', () => {
  const context = planningContextFixture({ defaults: { cutoff_date: null, forecast_start_date: null }, latest_business_date: '2026-10-10' })
  assert.equal(defaultPlanningCutoff(context), '')
  assert.match(setup({ context }), /type="submit"[^>]*disabled=""/)
})

test('budget input preserves zero/grouped text and exact 18+18 decimal bounds, no exponent/coercion', () => {
  assert.equal(parsePlanningBudget('0'), '0')
  assert.equal(parsePlanningBudget('50,000,000'), '50000000')
  assert.equal(parsePlanningBudget('9007199254740993.000000000000000001'), '9007199254740993.000000000000000001')
  for (const text of ['', '-1', '1e6', '50,00', '0,000', '1000000000000000000', '0.0000000000000000001']) assert.equal(parsePlanningBudget(text), null, text)
  assert.equal(formatPlanningDecimal('9007199254740993.000000000000000001'), '9.007.199.254.740.993,000000000000000001')
  assert.equal(formatPlanningMoney(null, 'VND'), 'Chưa biết')
  assert.equal(formatPlanningMoney('0', 'VND'), '0 VND')
})

test('setup request maps calendar cutoff and copies full resolved requirements for budget-only custom intent', () => {
  const context = planningContextFixture()
  const inherited = buildPlanningSetupRequest(context, '2026-10-10', '')
  assert.deepEqual(inherited, { requirements_mode: 'default', forecast_start_date: '2026-10-11', default_requirements_version: 'synthetic-default/1' })
  const zero = buildPlanningSetupRequest(context, '2026-10-10', '0')
  assert.equal(zero.requirements.budget_limit, '0')
  assert.deepEqual(zero.requirements.paths, context.default_requirements.paths)
  assert.notEqual(zero.requirements.paths, context.default_requirements.paths)
  for (const absent of ['strategy', 'include_open_purchase_orders', 'horizon_days', 'engine_mode', 'scenario_count', 'random_seed']) assert.equal(Object.hasOwn(zero, absent), false, absent)
  assert.equal(buildPlanningSetupRequest(context, '2026-02-30', ''), null)
  assert.equal(buildPlanningSetupRequest(context, '9999-12-30', ''), null)
  assert.equal(buildPlanningSetupRequest(context, '2026-10-10', '1000001'), null)
  const unavailable = planningContextFixture({ requirements_modes: [{ mode: 'default', availability: 'available', reason_codes: [] }, { mode: 'custom', availability: 'unavailable', reason_codes: [] }] })
  assert.equal(buildPlanningSetupRequest(unavailable, '2026-10-10', '0'), null)
  assert.equal(shiftPlanningDate('2026-12-31', 1), '2027-01-01')
  assert.equal(shiftPlanningDate('2028-02-28', 1), '2028-02-29')
})

test('result overview renders retained exact winner cost, unknown aggregate KPIs and honest disabled actions', () => {
  const html = results()
  assert.match(html, /7\.000 VND/)
  assert.match(html, /Chưa có tổng nguyên liệu toàn kế hoạch|chưa có tổng nguyên liệu toàn kế hoạch/)
  assert.match(html, /Không có tỷ lệ tổng/)
  assert.match(html, /không phải thứ tự ưu tiên/)
  assert.match(html, /disabled=""[^>]*>Hỏi AI/)
  assert.match(html, /disabled=""[^>]*>Tạo Draft PO/)
  assert.match(html, /disabled=""[^>]*>Kịch bản giả định/)
  assert.doesNotMatch(html, /AI tóm tắt|100% ngân sách|Nguy cơ thiếu.*\d+%/)
})

test('completed no-winner is a business result and does not fabricate a zero-cost procurement plan', () => {
  const html = results({ run: planningNoWinnerFixture() })
  assert.match(html, /Đã hoàn tất — chưa có phương án đủ điều kiện/)
  assert.match(html, /Không tạo kế hoạch mua giả/)
  assert.match(html, /Chưa biết/)
  assert.doesNotMatch(html, /<strong>0 VND<|7\.000 VND|Chạy kế hoạch thất bại/)
})

test('failed partial run remains failed even when retained partial result includes a winner', () => {
  const html = results({ run: planningFailedPartialFixture() })
  assert.match(html, /Chạy kế hoạch thất bại/)
  assert.match(html, /không phải khuyến nghị đã hoàn tất/)
  assert.match(html, /ENGINE_SOURCE_ERROR/)
  assert.match(html, /7\.000 VND/)
  assert.match(html, /Phương án một phần đã lưu; lần chạy thất bại/)
  assert.match(html, /Dữ liệu mua hàng một phần/)
})

test('inspection selection cannot replace original recommendation overview', () => {
  const run = planningRunFixture()
  run.result.options.push(planningOptionFixture({ option_id: 'inspection-only', costs: { ...run.result.options[0].costs, total: { numerator: '100', denominator: '1', decimal_view: '100' } } }))
  const html = results({ run, selectedOptionId: 'inspection-only' })
  assert.match(html, /7\.000 VND/)
  assert.doesNotMatch(html, />100 VND</)
})

test('purchases preserve supplier/term/ingredient UUIDs, exact decimals and absent pack size without inferred names', () => {
  const option = planningOptionFixture()
  option.purchases[0].quantity = { numerator: '9007199254740993', denominator: '1', decimal_view: '9007199254740993' }
  const html = render(PlanningPurchases, { option, currency: 'VND', nameFor: (id) => id, onInspect: noop })
  for (const id of [PLANNING_FIXTURE_IDS.ingredient, PLANNING_FIXTURE_IDS.supplier, PLANNING_FIXTURE_IDS.term]) assert.ok(html.includes(id), id)
  assert.match(html, /9\.007\.199\.254\.740\.993 l/)
  assert.match(html, /Kích thước pack chưa được cung cấp/)
  assert.match(html, /11\/10\/2026/)
  assert.doesNotMatch(html, /PACK_SIZE_ROUNDING|Nhà cung cấp A|Ngày đặt/)
  assert.match(render(PlanningPurchases, { option: planningOptionFixture({ purchases: [] }), currency: 'VND', nameFor: (id) => id, onInspect: noop }), /danh sách mua trống/)
})

test('ingredient daily evidence is distinct LOW/BASE/HIGH, nullable unavailable is not zero, names are captured only', () => {
  const html = render(PlanningIngredientPanel, { ingredient: planningIngredientFixture(), currency: 'VND' })
  assert.match(html, /Sữa tươi — ví dụ QA/)
  assert.match(html, /không phải P25 \/ P50 \/ P75/)
  for (const path of ['LOW', 'BASE', 'HIGH']) assert.match(html, new RegExp(`>${path}<`))
  assert.match(html, /không phải tổng của cả kỳ/)
  assert.match(html, /CONFIRMED_EMPTY/)
  const missing = render(PlanningIngredientPanel, { ingredient: planningIngredientFixture({ display_name: null, name_availability: 'not_captured', daily_balances: null,
    captured_stock: { captured_at: '2026-10-11T01:00:00Z', lots: [], scope_declaration: 'UNKNOWN', provenance: null } }), currency: 'VND' })
  assert.match(missing, /Chưa có bằng chứng tính theo ngày/)
  assert.match(missing, /không suy ra tồn bằng 0/)
  assert.match(missing, /Không được chụp; dùng UUID/)
})

test('option service facts keep per-product/per-path rates and nullable fee classification separate', () => {
  const option = planningOptionFixture()
  option.product_services[0].service = null
  option.costs.delivery_fees = null
  option.costs.fee_classification = 'PAYABLE_FEE_TYPE_NOT_CAPTURED'
  const html = render(PlanningOptionFacts, { option, run: planningRunFixture() })
  assert.match(html, /không phải tổng toàn kế hoạch/)
  assert.match(html, /Chưa đánh giá/)
  assert.match(html, /PAYABLE_FEE_TYPE_NOT_CAPTURED/)
  assert.match(html, /Chưa biết/)
})

test('engine reason projection is explicitly not AI, escapes evidence and never renders provider/raw response fields', () => {
  const reasons = planningReasonsFixture()
  reasons.warnings = [{ code: 'PACK_SIZE_ROUNDING', message: '<script>unsafe()</script>' }]
  const html = render(PlanningEngineReasons, { reasons })
  assert.match(html, /Lý do từ engine · không phải phản hồi AI/)
  assert.match(html, /WINNER_FOUND/)
  assert.match(html, /CAPTURED_FINITE_DOMAIN_ONLY/)
  assert.match(html, /&lt;script&gt;unsafe\(\)&lt;\/script&gt;/)
  assert.doesNotMatch(html, /<script>|raw_response|provider|bắt buộc theo pack/)
})

test('result tab roles and internal table scroll regions remain accessible in SSR', () => {
  const html = results({ ingredients: planningIngredientsFixture() })
  assert.match(html, /role="tablist" aria-label="Kế hoạch nhập"/)
  assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*tabindex="0"/)
  assert.match(html, /role="tabpanel"/)
  assert.match(html, /tabindex="0" role="region" aria-label="Các dòng mua hàng, có thể cuộn ngang"/)
  assert.match(html, /<th scope="col">/)
})

test('strategy comparison displays only returned strategies and allows same canonical basket without invented differences', () => {
  const run = planningRunFixture()
  const html = results({ run, initialTab: 'strategies' })
  for (const label of ['Tiết kiệm', 'Cân bằng', 'An toàn']) assert.ok(html.includes(label), label)
  assert.equal((html.match(/<dd>7\.000 VND<\/dd>/g) ?? []).length, 5) // Three shared-basket cards plus actual purchase and total costs.
  assert.match(html, /Nhiều chiến lược có thể trỏ cùng một phương án/)
  assert.doesNotMatch(html, /Ưu điểm|Đánh đổi|Nguy cơ thiếu|-10%|\+20%/)
  run.result.strategies = [run.result.strategies[0]]
  const one = results({ run, initialTab: 'strategies' })
  assert.match(one, /<h2>Tiết kiệm<\/h2>/)
  assert.doesNotMatch(one, /<h2>Cân bằng<\/h2>|<h2>An toàn<\/h2>/)
})

test('ingredient navigator shows loaded count versus nullable server total, captured names and explicit option inspection', () => {
  const html = results({ initialTab: 'ingredients', selectedOptionId: PLANNING_FIXTURE_IDS.option,
    ingredients: planningIngredientsFixture(), ingredient: planningIngredientFixture(), ingredientsTotal: null, hasMoreIngredients: true })
  assert.match(html, /Đã đọc 1 · Tổng chưa biết/)
  assert.match(html, /khuyến nghị gốc không đổi/)
  assert.match(html, /Đọc thêm nguyên liệu/)
  assert.match(html, /Sữa tươi — ví dụ QA/)
})
