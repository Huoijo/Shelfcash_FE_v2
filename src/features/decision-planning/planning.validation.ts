import { HttpError, isRecord } from '../../shared/http/httpClient'
import type {
  PlanningAcceptedResponse, PlanningContextResponse, PlanningIngredientResponse,
  PlanningIngredientsResponse, PlanningReadinessResponse, PlanningReasonsResponse, PlanningRequest, PlanningRunResponse,
} from './planning.types'
import { matchesPlanningWire } from './planning.wire'

const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const unique = (values: string[]) => new Set(values).size === values.length
const owns = (value: object, key: string) => Object.hasOwn(value, key)

export const isPlanningUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)

export function isPlanningDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const parsed = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

/** Calendar-only arithmetic; never interpret a Store business DATE in browser timezone. */
export function shiftPlanningDate(value: string, days: number): string | null {
  if (!isPlanningDate(value) || !Number.isSafeInteger(days)) return null
  const parsed = new Date(value + 'T00:00:00Z')
  parsed.setUTCDate(parsed.getUTCDate() + days)
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCFullYear() < 1 || parsed.getUTCFullYear() > 9999) return null
  return parsed.toISOString().slice(0, 10)
}

export function comparePlanningDecimal(left: string, right: string): number {
  const [a, af = ''] = left.split('.')
  const [b, bf = ''] = right.split('.')
  if (a.length !== b.length) return a.length < b.length ? -1 : 1
  if (a !== b) return a < b ? -1 : 1
  const length = Math.max(af.length, bf.length)
  const x = af.padEnd(length, '0'), y = bf.padEnd(length, '0')
  return x === y ? 0 : x < y ? -1 : 1
}

export const isPlanningMoney = (value: unknown): value is string => typeof value === 'string' && /^(0|[1-9][0-9]{0,17})(\.[0-9]{1,18})?$/.test(value)
export const isPlanningPercent = (value: unknown): value is string => typeof value === 'string' && /^(0|[1-9][0-9]{0,2})(\.[0-9]{1,32})?$/.test(value) && comparePlanningDecimal(value, '100') <= 0

function invalid(surface: string, value?: unknown): never {
  const requestId = isRecord(value) && isRecord(value.meta) && nonempty(value.meta.request_id) ? value.meta.request_id : undefined
  throw new HttpError('protocol', `Phản hồi ${surface} không đúng contract Planning. Chưa xác nhận kết quả thao tác.`, undefined, undefined, requestId)
}

function envelope<T>(schema: string, value: unknown, surface: string): T {
  if (!matchesPlanningWire(schema, value)) return invalid(surface, value)
  if (isRecord(value) && isRecord(value.meta) && owns(value.meta, 'request_id') && !nonempty(value.meta.request_id)) return invalid(surface, value)
  // Check fraction/range invariants without rounding or using display views as arithmetic truth.
  if (!validFractions(value)) return invalid(surface, value)
  return value as T
}

function validFractions(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(validFractions)
  if (!isRecord(value)) return true
  if (owns(value, 'numerator') && owns(value, 'denominator')) {
    if (typeof value.numerator !== 'string' || typeof value.denominator !== 'string' ||
      !/^(0|[1-9][0-9]*)$/.test(value.numerator) || !/^[1-9][0-9]*$/.test(value.denominator) ||
      value.numerator.length > 1000 || value.denominator.length > 1000) return false
    let a = BigInt(value.numerator), b = BigInt(value.denominator)
    while (b !== 0n) { const remainder = a % b; a = b; b = remainder }
    if (a !== 1n) return false
    if (owns(value, 'percent_view') && (typeof value.percent_view !== 'string' ||
      !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value.percent_view) || comparePlanningDecimal(value.percent_view, '100') > 0 ||
      BigInt(value.numerator) > BigInt(value.denominator))) return false
  }
  return Object.values(value).every(validFractions)
}

function storedRequirements(value: { budget_limit: string | null; paths: { path: string; min_fill_rate_percent: string; product_overrides: { product_id: string; min_fill_rate_percent: string }[] }[] }): boolean {
  return (value.budget_limit === null || isPlanningMoney(value.budget_limit)) && unique(value.paths.map((path) => path.path)) &&
    value.paths.every((path) => isPlanningPercent(path.min_fill_rate_percent) && unique(path.product_overrides.map((item) => item.product_id)) && path.product_overrides.every((item) => isPlanningPercent(item.min_fill_rate_percent)))
}

/** Preserves original field presence, exact decimal strings and explicit [] for idempotency. */
export function validatePlanningRequest(value: unknown): PlanningRequest {
  if (!matchesPlanningWire('PlanningRequest-Input', value) || !isRecord(value)) throw new Error('Thiết lập không đúng request Planning hiện hành.')
  const request = value as PlanningRequest
  if (shiftPlanningDate(request.forecast_start_date, -1) === null || shiftPlanningDate(request.forecast_start_date, 6) === null) throw new Error('Khoảng lập kế hoạch 7 ngày vượt giới hạn ngày hợp lệ.')
  if (request.requirements_mode === 'default') {
    if (!nonempty(request.default_requirements_version) || owns(request, 'requirements') || owns(request, 'saved_requirement_id')) throw new Error('Chế độ mặc định cần đúng phiên bản và không nhận requirements hoặc saved ID.')
  } else if (request.requirements_mode === 'saved') {
    if (!isPlanningUuid(request.saved_requirement_id) || owns(request, 'requirements')) throw new Error('Chế độ đã lưu cần UUID bộ yêu cầu; không nhận requirements.')
  } else {
    if (!request.requirements || owns(request, 'saved_requirement_id')) throw new Error('Chế độ tùy chỉnh cần requirements và không nhận saved ID.')
    const requirements = request.requirements
    if (requirements.budget_limit !== undefined && requirements.budget_limit !== null && !isPlanningMoney(requirements.budget_limit)) throw new Error('Ngân sách phải là decimal string chính xác, tối đa 18 chữ số nguyên và 18 chữ số lẻ; 0 hợp lệ.')
    if (!unique(requirements.paths.map((path) => path.path))) throw new Error('Các đường nhu cầu phải duy nhất.')
    for (const path of requirements.paths) {
      if (owns(path, 'min_fill_rate_percent') && !isPlanningPercent(path.min_fill_rate_percent)) throw new Error('Mức phục vụ phải là decimal string 0..100, tối đa 32 chữ số lẻ; null không hợp lệ.')
      if (owns(path, 'product_overrides') && (!Array.isArray(path.product_overrides) || !unique(path.product_overrides.map((item) => item.product_id)) || path.product_overrides.some((item) => !isPlanningPercent(item.min_fill_rate_percent)))) throw new Error('Ngoại lệ Product phải là danh sách duy nhất với mức phục vụ hợp lệ; [] là chủ động không ngoại lệ.')
      if ((!owns(path, 'min_fill_rate_percent') || !owns(path, 'product_overrides')) && !nonempty(request.default_requirements_version)) throw new Error('Kế thừa mức phục vụ hoặc ngoại lệ cần default_requirements_version.')
    }
  }
  if (new TextEncoder().encode(JSON.stringify(request)).byteLength > 65536) throw new Error('Request Planning vượt giới hạn 65.536 byte.')
  return request
}

export function validatePlanningContext(value: unknown, storeId: string): PlanningContextResponse {
  const response = envelope<PlanningContextResponse>('Envelope_Context_', value, 'C01')
  const { data } = response
  if (data.store_id !== storeId || !nonempty(data.currency) || !nonempty(data.timezone) ||
    data.readiness.can_generate !== (data.readiness.status === 'ready') ||
    !unique(data.products.map((product) => product.product_id)) || !unique(data.requirements_modes.map((mode) => mode.mode)) ||
    data.requirements_modes.length !== 3 || (data.saved_requirements !== null && !unique(data.saved_requirements.map((saved) => saved.saved_requirement_id))) ||
    (data.budget_ceiling !== null && (!isPlanningMoney(data.budget_ceiling.amount) || data.budget_ceiling.currency !== data.currency)) ||
    (data.default_requirements !== null && !storedRequirements(data.default_requirements)) ||
    data.saved_requirements?.some((saved) => !storedRequirements(saved.requirements))) return invalid('C01', value)
  try { new Intl.DateTimeFormat('vi', { timeZone: data.timezone }) } catch { return invalid('C01 timezone', value) }
  if (data.readiness.scope_estimate && (!count(data.readiness.scope_estimate.menu_product_count) || !count(data.readiness.scope_estimate.estimated_computable_product_count) || data.readiness.scope_estimate.estimated_computable_product_count > data.readiness.scope_estimate.menu_product_count)) return invalid('C01 scope', value)
  return { ...response, data: { ...data,
    defaults: { ...data.defaults, requirements_mode: data.defaults.requirements_mode ?? 'default', horizon_days: data.defaults.horizon_days ?? 7 },
    supported_horizon_days: data.supported_horizon_days ?? [7], supported_strategies: data.supported_strategies ?? ['lean', 'balanced', 'protected'], supported_paths: data.supported_paths ?? ['LOW', 'BASE', 'HIGH'],
    capabilities: { ...data.capabilities, include_open_purchase_orders: false, scenario_based_planning: false },
  } }
}

export function validatePlanningAccepted(value: unknown): PlanningAcceptedResponse {
  const response = envelope<PlanningAcceptedResponse>('PlanningEnvelope_Accepted_', value, 'C02')
  const terminal = ['completed', 'failed'].includes(response.data.status)
  if (response.meta.poll_after_ms !== (terminal ? 0 : 2000)) return invalid('C02 polling', value)
  return response
}

export function validatePlanningReadiness(value: unknown, storeId: string, forecastStartDate: string, request?: PlanningRequest): PlanningReadinessResponse {
  const response = envelope<PlanningReadinessResponse>('Envelope_Readiness_', value, 'R01 planning')
  const { data } = response
  if (request && (data.planning_assessment?.input_scope !== "SUPPLIED_REQUEST" || data.planning_assessment.requirements_mode !== request.requirements_mode)) return invalid("R01 supplied request assessment", value)
  if (!request && data.planning_assessment && data.planning_assessment.input_scope !== "DEFAULT_CONFIGURATION") return invalid("R01 default assessment", value)
  if (data.store_id !== storeId || data.evaluated_forecast_start_date !== forecastStartDate || data.cutoff_date !== shiftPlanningDate(forecastStartDate, -1) ||
    data.actions.length !== 1 || data.actions[0].action !== 'planning' || data.actions.some((action) => action.can_execute !== (action.availability === 'ready') ||
      (action.can_execute && (action.data_status !== 'valid' || action.execution_status !== 'available' || action.blockers.length > 0)))) return invalid('R01 planning scope/date', value)
  return { ...response, data: { ...data, actions: data.actions.map((action) => ({ ...action, result_assessment: action.result_assessment ?? 'NOT_ASSESSED' })) } }
}

export function validatePlanningRun(value: unknown, storeId: string, runId: string): PlanningRunResponse {
  const response = envelope<PlanningRunResponse>('PlanningEnvelope_RunView_', value, 'C03')
  const { data, meta } = response
  const terminal = ['completed', 'failed'].includes(data.status)
  if (data.store_id !== storeId || data.run_id !== runId || meta.poll_after_ms !== (terminal ? 0 : 2000) ||
    data.configuration.requirements_mode !== data.request.requirements_mode || !storedRequirements(data.configuration.effective_requirements) ||
    !isPlanningMoney(data.configuration.budget.limit) || !isPlanningMoney(data.configuration.budget.ceiling_at_acceptance) ||
    comparePlanningDecimal(data.configuration.budget.limit, data.configuration.budget.ceiling_at_acceptance) > 0 ||
    (!terminal && (data.outcome !== null || data.finished_at !== null || data.result !== null)) ||
    (terminal && (data.finished_at === null || data.outcome === null)) ||
    (data.status === 'queued' && data.started_at !== null) ||
    (data.status === 'failed' && data.outcome !== 'execution_error') ||
    (data.status === 'completed' && data.outcome === 'execution_error')) return invalid('C03 identity/lifecycle', value)
  try { validatePlanningRequest(data.request) } catch { return invalid('C03 request', value) }
  if (data.forecast && (data.forecast.start_date !== data.request.forecast_start_date || data.forecast.end_date !== shiftPlanningDate(data.request.forecast_start_date, 6))) return invalid('C03 forecast linkage', value)
  if (data.operational_basis && data.operational_basis.planning_start_date !== data.request.forecast_start_date) return invalid('C03 operational basis', value)
  if (data.execution && Object.entries(data.execution).some(([key, item]) => key.endsWith('_ms') && !count(item))) return invalid('C03 execution', value)
  if (data.scope) {
    const scope = data.scope
    if (!count(scope.menu_count) || !count(scope.computed_count) || scope.menu_count !== scope.menu_products.length || scope.computed_count !== scope.computed_product_ids.length ||
      !unique(scope.menu_products.map((product) => product.product_id)) || !unique(scope.computed_product_ids) ||
      scope.computed_product_ids.some((id) => !scope.menu_products.some((product) => product.product_id === id)) ||
      scope.excluded_products.some((excluded) => scope.computed_product_ids.includes(excluded.product_id))) return invalid('C03 scope', value)
  }
  if (data.result) {
    const result = data.result
    if (!unique(result.options.map((option) => option.option_id)) || !unique(result.strategies.map((strategy) => strategy.strategy)) ||
      result.strategies.some((strategy) => strategy.construction_path !== ({ lean: 'LOW', balanced: 'BASE', protected: 'HIGH' } as const)[strategy.strategy] || (strategy.option_id !== null && !result.options.some((option) => option.option_id === strategy.option_id))) ||
      result.options.some((option) => option.costs.currency !== data.configuration.budget.currency || !unique(option.source_strategies) || option.source_strategies.some((strategy) => !result.strategies.some((source) => source.strategy === strategy && source.option_id === option.option_id))) ||
      (result.winner_option_id !== null && (!result.options.some((option) => option.option_id === result.winner_option_id && option.eligible && option.not_selected_reason === null) || result.winner_reason !== 'WINNER_FOUND')) ||
      (result.winner_option_id === null && result.winner_reason === 'WINNER_FOUND') ||
      (data.outcome === 'recommendation_available' && result.winner_option_id === null) ||
      (['no_eligible_candidate', 'no_computable_products', 'computation_blocked'].includes(data.outcome ?? '') && result.winner_option_id !== null)) return invalid('C03 result links', value)
    for (const option of result.options) {
      if (!unique(option.product_services.map((service) => `${service.product_id}:${service.path}`)) || !unique(option.ingredient_balances.map((balance) => `${balance.ingredient_id}:${balance.path}`)) ||
        option.product_services.some((service) => (service.requested.numerator === '0') !== (service.service === null)) ||
        (option.costs.fee_classification === 'PAYABLE_FEE_TYPE_NOT_CAPTURED' && option.costs.delivery_fees !== null)) return invalid('C03 option', value)
    }
  } else if (data.status === 'completed') return invalid('C03 completed result', value)
  return { ...response, data: { ...data, configuration: { ...data.configuration, policy_version: data.configuration.policy_version ?? 'procurement_api_policy/1' } } }
}

function selection(selected: string | null, status: 'winner' | 'explicit' | 'not_selected', optionId?: string): boolean {
  return (status === 'not_selected') === (selected === null) && (optionId === undefined || (selected === optionId && status === 'explicit'))
}

export function validatePlanningIngredients(value: unknown, runId: string, optionId?: string): PlanningIngredientsResponse {
  const response = envelope<PlanningIngredientsResponse>('InspectionEnvelope_IngredientNavigator_', value, 'C04')
  const { data, meta } = response
  const page = meta.pagination
  if (data.run_id !== runId || meta.run_id !== runId || data.result_digest !== meta.result_digest || !selection(data.selected_option_id, data.selection_status, optionId) ||
    !page || !count(page.limit) || page.limit < 1 || page.limit > 100 || data.items.length > page.limit ||
    (page.total_count !== null && (!count(page.total_count) || page.total_count < data.items.length)) ||
    (page.next_cursor !== null && (!nonempty(page.next_cursor) || page.next_cursor.length > 4096)) ||
    !unique(data.items.map((row) => row.ingredient_id)) || data.items.some((row) => (row.purchase_line_count !== null && !count(row.purchase_line_count)) ||
      (row.name_availability === 'not_captured' && row.display_name !== null) || ((row.purchase_quantity === null) !== (row.purchase_line_count === null)))) return invalid('C04 identity/page', value)
  return response
}

export function validatePlanningIngredient(value: unknown, runId: string, ingredientId: string, optionId?: string): PlanningIngredientResponse {
  const response = envelope<PlanningIngredientResponse>('InspectionEnvelope_IngredientDetail_', value, 'C05')
  const { data, meta } = response
  if (data.run_id !== runId || meta.run_id !== runId || data.ingredient_id !== ingredientId || data.result_digest !== meta.result_digest || !selection(data.selected_option_id, data.selection_status, optionId) ||
    (data.name_availability === 'not_captured' && data.display_name !== null) ||
    !unique(data.captured_stock.lots.map((lot) => lot.lot_id)) || !unique(data.related_products.map((product) => product.product_id)) ||
    data.purchases?.some((purchase) => purchase.ingredient_id !== ingredientId || purchase.unit !== data.unit) ||
    data.daily_balances?.some((row) => row.unit !== data.unit) ||
    (data.daily_balances !== null && !unique(data.daily_balances.map((row) => `${row.path}:${row.day}`))) ||
    data.captured_stock.lots.some((lot) => lot.unit !== data.unit || (lot.unit_cost !== null && !isPlanningMoney(lot.unit_cost)) || (lot.cost_availability === 'unknown' && lot.unit_cost !== null))) return invalid('C05 identity/facts', value)
  return response
}

export function validatePlanningReasons(value: unknown, runId: string, optionId?: string): PlanningReasonsResponse {
  const response = envelope<PlanningReasonsResponse>('ExplanationEnvelope', value, 'C08')
  const { data } = response
  if (data.run_id !== runId || !unique(data.options.map((option) => option.option_id)) ||
    (optionId !== undefined && (data.options.length !== 1 || data.options[0].option_id !== optionId)) ||
    data.options.some((option) => !unique(option.source_strategies) || option.evidence.some((source) => source.option_id !== option.option_id || !option.source_strategies.includes(source.strategy))) ||
    (data.availability === 'unavailable' && data.evidence_availability === 'known' && data.options.length > 0)) return invalid('C08 identity/evidence', value)
  return response
}
