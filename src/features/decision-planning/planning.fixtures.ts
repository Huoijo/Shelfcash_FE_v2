import { HttpError } from '../../shared/http/httpClient'
import { comparePlanningDecimal, isPlanningUuid, validatePlanningRequest } from './planning.validation'
import type {
  PlanningContext, PlanningDataSource, PlanningIngredient, PlanningIngredients, PlanningIntent,
  PlanningOption, PlanningQuantity, PlanningReasons, PlanningRun, PlanningStrategy,
} from './planning.types'

/** Synthetic deterministic DEV/QA data. No forecasting, optimizer, persistence or live evidence. */
export const PLANNING_FIXTURE_IDS = {
  store: 'f17e0000-0000-4000-8000-000000000000',
  run: 'd0900000-0000-4000-8000-000000000001',
  forecast: 'd0900000-0000-4000-8000-000000000002',
  product: 'd0900000-0000-4000-8000-000000000003',
  ingredient: 'd0900000-0000-4000-8000-000000000004',
  supplier: 'd0900000-0000-4000-8000-000000000005',
  term: 'd0900000-0000-4000-8000-000000000006',
  recipe: 'd0900000-0000-4000-8000-000000000007',
  saved: 'd0900000-0000-4000-8000-000000000008',
  option: 'synthetic-basket/1',
  digest: 'synthetic-result-digest/1',
  version: 'synthetic-run-version/3',
} as const
export const PLANNING_FIXTURE_PERMISSIONS = [
  'planning.context.read', 'planning.run', 'planning.result.read', 'budget.read', 'procurement.cost.read',
] as const
const ids = PLANNING_FIXTURE_IDS
const at = '2026-10-11T01:00:00Z'
const start = '2026-10-11'
const paths = ['LOW', 'BASE', 'HIGH'] as const
const strategies: PlanningStrategy[] = ['lean', 'balanced', 'protected']
const quantity = (value: string): PlanningQuantity => ({ numerator: value, denominator: '1', decimal_view: value })
const clone = <T,>(value: T): T => structuredClone(value)
const requirements = () => ({ budget_limit: null, paths: [{ path: 'BASE' as const, min_fill_rate_percent: '95', product_overrides: [] }] })
const notification = () => ({ code: 'SYNTHETIC_QA_FIXTURE', message: 'Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.' })
const pagination = (total: number) => ({ limit: 50, next_cursor: null, total_count: total })

export function planningContextFixture(overrides: Partial<PlanningContext> = {}): PlanningContext {
  return clone({
    store_id: ids.store, currency: 'VND', timezone: 'Asia/Ho_Chi_Minh', observed_at: at,
    context_version: 'synthetic-context/1', latest_business_date: '2026-10-10',
    defaults: { requirements_mode: 'default', horizon_days: 7, cutoff_date: '2026-10-10', forecast_start_date: start },
    supported_horizon_days: [7], supported_strategies: strategies, supported_paths: [...paths],
    default_requirements: requirements(), default_requirements_version: 'synthetic-default/1', default_requirements_updated_at: at,
    budget_ceiling: { amount: '1000000', currency: 'VND', version: 'synthetic-cap/1', updated_at: at },
    products: [{ product_id: ids.product, name: 'Sữa tươi — ví dụ QA', selling_unit: 'ly' }],
    custom_requirement_fields: [
      { field: 'requirements.paths[].path', type: 'path', required: true, nullable: false,
        constraints: { enum: [...paths], unique: true, max_items: 3 }, inheritance: 'none' },
      { field: 'requirements.paths[].min_fill_rate_percent', type: 'decimal_text', required: false, nullable: false,
        constraints: { minimum: '0', maximum: '100', max_fraction_digits: 32 }, inheritance: 'same_path_default' },
      { field: 'requirements.paths[].product_overrides', type: 'product_override_array', required: false, nullable: false,
        constraints: { max_items: 50, unique_product_id: true }, inheritance: 'same_path_default_replace' },
      { field: 'requirements.budget_limit', type: 'decimal_text', required: false, nullable: true,
        constraints: { minimum: '0', max_integer_digits: 18, max_fraction_digits: 18 }, inheritance: 'current_store_ceiling' },
    ],
    requirements_modes: ['default', 'custom', 'saved'].map((mode) => ({ mode: mode as 'default' | 'custom' | 'saved', availability: 'available', reason_codes: [] })),
    saved_requirements: [{ saved_requirement_id: ids.saved, name: 'Bộ yêu cầu ví dụ QA', updated_at: at,
      requirements: requirements(), validation: { status: 'valid', reason_codes: [] }, warnings: [] }],
    capabilities: { winner_selection: true, saved_requirements: true, include_open_purchase_orders: false, scenario_based_planning: false },
    readiness: { status: 'ready', can_generate: true, reason_codes: [], evaluated_forecast_start_date: start,
      scope_estimate: { menu_product_count: 1, estimated_computable_product_count: 1, excluded_products: [] }, history_watermark: '2026-10-10' },
    ...overrides,
  } satisfies PlanningContext)
}

/** R01 selected-date assessment; NOT_ASSESSED deliberately does not certify a winner. */
export function planningReadinessFixture(forecastStartDate = start) {
  const date = new Date(`${forecastStartDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return {
    store_id: ids.store, as_of_date: start, evaluated_at: at, data_version: 'synthetic-readiness/1',
    evaluated_forecast_start_date: forecastStartDate, cutoff_date: date.toISOString().slice(0, 10),
    actions: [{ action: 'planning' as const, availability: 'ready' as const, can_execute: true, data_status: 'valid' as const,
      execution_status: 'available' as const, blockers: [], warnings: [], result_assessment: 'NOT_ASSESSED' as const }],
    source_versions: { catalog: 'qa/1', recipes: 'qa/1', inventory: 'qa/1', sales: 'qa/1', suppliers: 'qa/1',
      fees: 'qa/1', declarations: 'qa/1', planning_config: 'qa/1', model_config: 'qa/1' },
    scope_estimate: { menu_product_count: 1, estimated_computable_product_count: 1, excluded_products: [] },
    history_watermark: '2026-10-10',
  }
}

export function planningOptionFixture(overrides: Partial<PlanningOption> = {}): PlanningOption {
  return clone({
    option_id: ids.option, source_strategies: strategies, eligible: true, rejection_reasons: [], not_selected_reason: null,
    costs: { currency: 'VND', purchase: quantity('7000'), payable_fees: quantity('0'), delivery_fees: quantity('0'),
      fee_classification: 'NONE', total: quantity('7000'), fee_components: [] },
    purchases: [{ supplier_term_id: ids.term, supplier_id: ids.supplier, ingredient_id: ids.ingredient, unit: 'l', packs: 7,
      quantity: quantity('7'), arrival_date: start, expiry_date: '2026-10-18', purchase_outlay: quantity('7000'), payable_fee_components: [] }],
    product_services: paths.map((path) => ({ product_id: ids.product, unit: 'ly', path, requested: quantity('7'),
      fulfilled: quantity('7'), lost_sales: quantity('0'), service: { numerator: '1', denominator: '1', percent_view: '100' } })),
    ingredient_balances: paths.map((path) => ({ ingredient_id: ids.ingredient, unit: 'l', path,
      consumed: quantity('7'), expired: quantity('0'), ending_usable: quantity('0') })),
    requirements_assessment: [{ product_id: ids.product, path: 'BASE', target_percent: '95', applied_source: 'common', status: 'PASS', shortfall: quantity('0') }],
    issues: [], ...overrides,
  } satisfies PlanningOption)
}

export function planningRunFixture(overrides: Partial<PlanningRun> = {}): PlanningRun {
  return clone({
    run_id: ids.run, store_id: ids.store, status: 'completed', outcome: 'recommendation_available', accepted_at: at,
    started_at: '2026-10-11T01:00:01Z', finished_at: '2026-10-11T01:00:02Z', response_version: ids.version,
    request: { requirements_mode: 'default', forecast_start_date: start, default_requirements_version: 'synthetic-default/1' },
    configuration: { requirements_mode: 'default', effective_requirements: requirements(),
      budget: { limit: '1000000', currency: 'VND', ceiling_at_acceptance: '1000000', ceiling_version: 'synthetic-cap/1' },
      default_version: 'synthetic-default/1', saved_reference: null, policy_version: 'procurement_api_policy/1' },
    operational_basis: { version: 'operational_basis/1', kind: 'CURRENT_CAPTURE', captured_at: at,
      timezone: 'Asia/Ho_Chi_Minh', local_capture_date: start, planning_start_date: start,
      assumptions: ['Dữ liệu ví dụ tổng hợp DEV/QA. Không đại diện dữ liệu cửa hàng thật.'] },
    forecast: { forecast_run_id: ids.forecast, input_digest: 'synthetic-forecast-input/1',
      model_type: 'historical_quantile_baseline', model_version: '1', artifact_identity: null,
      start_date: start, end_date: '2026-10-17', history_start_date: '2026-10-01', history_end_date: '2026-10-10',
      training_start_date: null, training_end_date: null, reused: false, quality_status: 'not_evaluated', warnings: [notification()] },
    scope: { menu_products: planningContextFixture().products, computed_product_ids: [ids.product], excluded_products: [],
      menu_count: 1, computed_count: 1, coverage_status: 'full' },
    execution: { engine_semantics_version: 'procurement/2', comparison_version: 'procurement_comparison/2',
      selector_version: 'procurement_selector/1', elapsed_ms: 2000, engine_elapsed_ms: 1500, engine_deadline_ms: 30000,
      engine_overrun_ms: 0, comparison_selector_elapsed_ms: 500, search_complete: false },
    result: { completeness: 'full', strategies: strategies.map((strategy, index) => ({
      strategy, construction_path: paths[index], option_id: ids.option, execution: 'INCOMPLETE', termination: 'SYNTHETIC_QA',
      customer_pass: true, construction_pass: true, selection_kind: 'TARGET', customer_feasibility: 'PASS_EXISTS',
      construction_feasibility: 'PASS_EXISTS', proof: 'UNPROVEN', proof_scope: 'CAPTURED_FINITE_DOMAIN_ONLY',
      domain_size: '9007199254740993', search_complete: false, customer_gaps: [], construction_gaps: [], diagnostic: null,
    })), options: [planningOptionFixture()], winner_option_id: ids.option, winner_reason: 'WINNER_FOUND', warnings: [notification()] },
    errors: [], ...overrides,
  } satisfies PlanningRun)
}

export function planningNoWinnerFixture(): PlanningRun {
  const run = planningRunFixture()
  return planningRunFixture({ outcome: 'no_eligible_candidate', result: { completeness: 'full', strategies: run.result!.strategies.map((strategy) => ({
    ...strategy, option_id: null, customer_pass: false, construction_pass: false, selection_kind: 'NONE',
    customer_feasibility: 'UNKNOWN', construction_feasibility: 'UNKNOWN',
  })), options: [],
    winner_option_id: null, winner_reason: 'NO_ELIGIBLE_CANDIDATE', warnings: [notification()] } })
}
export function planningFailedPartialFixture(): PlanningRun {
  const run = planningRunFixture()
  run.status = 'failed'; run.outcome = 'execution_error'; run.result!.completeness = 'partial'
  run.errors = [{ code: 'ENGINE_SOURCE_ERROR', message: 'Ví dụ một nguồn lỗi; giữ phương án từng được xác minh độc lập.' }]
  return run
}

export function planningIngredientsFixture(overrides: Partial<PlanningIngredients> = {}): PlanningIngredients {
  return clone({ run_id: ids.run, result_digest: ids.digest, selected_option_id: ids.option, selection_status: 'winner',
    items: [{ ingredient_id: ids.ingredient, unit: 'l', display_name: 'Sữa tươi — ví dụ QA', name_availability: 'captured',
      purchase_quantity: quantity('7'), purchase_line_count: 1, path_balances: planningOptionFixture().ingredient_balances,
      issues: [], detail_available: true }], ...overrides } satisfies PlanningIngredients)
}
export function planningIngredientFixture(overrides: Partial<PlanningIngredient> = {}): PlanningIngredient {
  return clone({ run_id: ids.run, result_digest: ids.digest, ingredient_id: ids.ingredient, unit: 'l',
    selected_option_id: ids.option, selection_status: 'winner', display_name: 'Sữa tươi — ví dụ QA', name_availability: 'captured',
    captured_stock: { captured_at: at, lots: [], scope_declaration: 'CONFIRMED_EMPTY', provenance: 'synthetic-QA-declaration' },
    purchases: planningOptionFixture().purchases,
    daily_balances: paths.flatMap((path) => Array.from({ length: 7 }, (_, day) => ({ path, day: `2026-10-${11 + day}`, unit: 'l',
      requested: quantity('1'), available: quantity(String(7 - day)), shortage: quantity('0'), consumed: quantity('1'),
      expired: quantity('0'), other_waste: quantity('0'), ending: quantity(String(6 - day)), incoming_quantity: quantity(day ? '0' : '7') }))),
    related_products: [{ product_id: ids.product, selling_unit: 'ly', ingredient_unit: 'l', recipe_ids: [ids.recipe],
      affected_dates: Array.from({ length: 7 }, (_, day) => `2026-10-${11 + day}`), fulfilled_contributions: null }],
    issues: [], evidence_availability: 'partial', ...overrides } satisfies PlanningIngredient)
}
export function planningReasonsFixture(overrides: Partial<PlanningReasons> = {}): PlanningReasons {
  const run = planningRunFixture()
  return clone({ run_id: ids.run, result_schema_version: 'procurement_comparison/2', result_digest: ids.digest,
    availability: 'available', outcome: run.outcome, winner: { option_id: ids.option, reason_code: 'WINNER_FOUND' }, exclusions: [],
    blockers: [], warnings: [notification()], options: [{ option_id: ids.option, eligible: true, rejection_reasons: [],
      not_selected_reason: null, source_strategies: strategies, evidence: run.result!.strategies }], evidence_availability: 'known',
    ...overrides } satisfies PlanningReasons)
}

function fail(status: number, code: string): never {
  throw new HttpError('contract', code, status, { code, message: code, details: {} })
}
const inspectedMeta = (run: PlanningRun, digest: string | null = ids.digest) => ({ request_id: 'synthetic-inspection',
  run_id: run.run_id, result_digest: digest, response_version: run.response_version })

/** Each call owns an isolated in-memory scenario; never used after an API error. */
export function createMockPlanningDataSource(): PlanningDataSource {
  const runs = new Map<string, { run: PlanningRun; reads: number }>()
  const receipts = new Map<string, { fingerprint: string; runId: string }>()
  let sequence = 10
  const checkStore = (storeId: string) => { if (storeId !== ids.store) fail(404, 'STORE_NOT_FOUND') }
  const find = (storeId: string, runId: string) => {
    checkStore(storeId)
    const retained = runs.get(runId)
    if (!retained) fail(404, 'RUN_NOT_FOUND')
    return retained
  }
  const inspect = (storeId: string, runId: string, optionId?: string) => {
    const { run } = find(storeId, runId)
    if (run.status === 'queued' || run.status === 'running') fail(409, 'RESULT_NOT_READY')
    if (optionId && !run.result?.options.some((option) => option.option_id === optionId)) fail(404, 'OPTION_NOT_FOUND')
    return run
  }
  return {
    async context(storeId, signal) { signal?.throwIfAborted(); checkStore(storeId)
      return { data: planningContextFixture(), meta: { request_id: 'synthetic-context' }, error: null } },
    async readiness(storeId, forecastStartDate, signal) { signal?.throwIfAborted(); checkStore(storeId)
      return { data: planningReadinessFixture(forecastStartDate), meta: { request_id: 'synthetic-readiness' }, error: null } },
    async create(storeId, intent: PlanningIntent, signal) {
      signal?.throwIfAborted(); checkStore(storeId)
      validatePlanningRequest(intent.request)
      if (!isPlanningUuid(intent.key)) fail(400, 'INVALID_REQUEST')
      if (intent.request.requirements?.budget_limit && comparePlanningDecimal(intent.request.requirements.budget_limit, '1000000') > 0) fail(422, 'INVALID_PLANNING_CONFIGURATION')
      const fingerprint = JSON.stringify(intent.request)
      let retained = receipts.get(intent.key)
      if (retained && retained.fingerprint !== fingerprint) fail(409, 'IDEMPOTENCY_KEY_REUSED')
      if (!retained) {
        const runId = `d0900000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`
        const run = planningRunFixture({ run_id: runId, request: clone(intent.request), status: 'queued', outcome: null,
          started_at: null, finished_at: null, operational_basis: null, forecast: null, scope: null, execution: null, result: null,
          response_version: 'synthetic-run-version/1' })
        run.configuration.requirements_mode = intent.request.requirements_mode
        if (intent.request.requirements_mode === 'custom') {
          run.configuration.effective_requirements = { budget_limit: intent.request.requirements?.budget_limit ?? null,
            paths: intent.request.requirements!.paths.map((path) => ({ path: path.path,
              min_fill_rate_percent: path.min_fill_rate_percent ?? '95', product_overrides: clone(path.product_overrides ?? []) })) }
          run.configuration.default_version = intent.request.default_requirements_version ?? null
        } else if (intent.request.requirements_mode === 'saved') {
          run.configuration.default_version = null
          run.configuration.saved_reference = { id: intent.request.saved_requirement_id!, version: 'synthetic-saved/1', updated_at: at }
        }
        run.configuration.budget.limit = run.configuration.effective_requirements.budget_limit ?? '1000000'
        runs.set(runId, { run, reads: 0 }); retained = { fingerprint, runId }; receipts.set(intent.key, retained)
      }
      const run = runs.get(retained.runId)!.run
      return { data: { run_id: run.run_id, status: run.status, accepted_at: run.accepted_at },
        meta: { warnings: [notification()], poll_after_ms: run.status === 'queued' || run.status === 'running' ? 2000 : 0 }, error: null }
    },
    async read(storeId, runId, signal) {
      signal?.throwIfAborted(); const retained = find(storeId, runId); retained.reads++
      if (retained.run.status === 'queued') {
        retained.run.status = 'running'; retained.run.started_at = at; retained.run.response_version = 'synthetic-run-version/2'
      } else if (retained.run.status === 'running') {
        const before = retained.run
        const completed = before.configuration.budget.limit === '0' ? planningNoWinnerFixture() : planningRunFixture()
        retained.run = { ...completed, run_id: before.run_id, request: before.request, configuration: before.configuration }
        const date = before.request.forecast_start_date
        const end = new Date(`${date}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + 6)
        retained.run.forecast = { ...retained.run.forecast!, start_date: date, end_date: end.toISOString().slice(0, 10) }
        retained.run.operational_basis!.planning_start_date = date
        for (const option of retained.run.result!.options) for (const purchase of option.purchases) {
          purchase.arrival_date = date; purchase.expiry_date = null
        }
        if (date !== start) {
          retained.run.operational_basis!.kind = 'HYPOTHETICAL_CURRENT_CAPTURE'
          retained.run.result!.warnings.push({ code: 'NONCURRENT_PLANNING_CURRENT_FACTS', message: 'Ví dụ dùng facts hiện tại cho ngày khác; không backtest lịch sử.' })
        }
      }
      return { data: clone(retained.run), meta: { warnings: [notification()],
        poll_after_ms: retained.run.status === 'queued' || retained.run.status === 'running' ? 2000 : 0 }, error: null }
    },
    async ingredients(storeId, runId, query, signal) {
      signal?.throwIfAborted(); const run = inspect(storeId, runId, query.optionId)
      if (query.cursor) fail(422, 'INVALID_CURSOR')
      const optionId = query.optionId ?? run.result?.winner_option_id ?? null
      const data = planningIngredientsFixture({ run_id: runId, selected_option_id: optionId,
        selection_status: query.optionId ? 'explicit' : optionId ? 'winner' : 'not_selected' })
      if (!optionId) data.items = data.items.map((item) => ({ ...item, purchase_quantity: null, purchase_line_count: null, path_balances: null }))
      return { data, meta: { ...inspectedMeta(run), pagination: pagination(data.items.length) }, error: null }
    },
    async ingredient(storeId, runId, ingredientId, optionId, signal) {
      signal?.throwIfAborted(); const run = inspect(storeId, runId, optionId)
      if (ingredientId !== ids.ingredient) fail(404, 'INGREDIENT_NOT_IN_RUN')
      const selected = optionId ?? run.result?.winner_option_id ?? null
      const data = planningIngredientFixture({ run_id: runId, selected_option_id: selected,
        selection_status: optionId ? 'explicit' : selected ? 'winner' : 'not_selected' })
      if (selected) {
        data.purchases = clone(run.result!.options.find((option) => option.option_id === selected)!.purchases)
        data.daily_balances = data.daily_balances!.map((row, index) => {
          const date = new Date(`${run.request.forecast_start_date}T00:00:00Z`)
          date.setUTCDate(date.getUTCDate() + index % 7)
          return { ...row, day: date.toISOString().slice(0, 10) }
        })
        data.related_products[0].affected_dates = data.daily_balances.slice(0, 7).map((row) => row.day)
      }
      if (!selected) { data.purchases = null; data.daily_balances = null; data.evidence_availability = 'not_evaluated' }
      return { data, meta: inspectedMeta(run), error: null }
    },
    async reasons(storeId, runId, optionId, signal) {
      signal?.throwIfAborted(); const run = inspect(storeId, runId, optionId)
      const data = planningReasonsFixture({ run_id: runId, outcome: run.outcome,
        winner: { option_id: run.result?.winner_option_id ?? null, reason_code: run.result?.winner_reason ?? 'NOT_EVALUATED' } })
      data.options = (run.result?.options ?? []).filter((option) => !optionId || option.option_id === optionId).map((option) => ({
        option_id: option.option_id, eligible: option.eligible, rejection_reasons: option.rejection_reasons,
        not_selected_reason: option.not_selected_reason, source_strategies: option.source_strategies,
        evidence: run.result!.strategies.filter((source) => source.option_id === option.option_id),
      }))
      if (!run.result?.options.length) { data.options = []; data.availability = 'partial' }
      return { data, meta: { request_id: 'synthetic-reasons' }, error: null }
    },
  }
}
