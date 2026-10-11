import type { PlanningContext, PlanningQuantity, PlanningRequest, PlanningStrategy } from './planning.types'
import { comparePlanningDecimal, isPlanningMoney, shiftPlanningDate, validatePlanningRequest } from './planning.validation'
export { isPlanningDate, shiftPlanningDate } from './planning.validation'

export const planningStrategyLabels: Record<PlanningStrategy, string> = {
  lean: 'Tiết kiệm', balanced: 'Cân bằng', protected: 'An toàn',
}

export function formatPlanningDate(value: string | null | undefined): string {
  return value ? value.split('-').reverse().join('/') : 'Chưa biết'
}

export function formatPlanningDecimal(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'Chưa biết'
  const [integer, fraction = ''] = value.split('.')
  const trimmed = fraction.replace(/0+$/, '')
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${trimmed ? `,${trimmed}` : ''}`
}

export function formatPlanningQuantity(value: PlanningQuantity | null | undefined, unit = ''): string {
  return value ? `${formatPlanningDecimal(value.decimal_view)}${unit ? ` ${unit}` : ''}` : 'Chưa biết'
}

export function formatPlanningMoney(value: PlanningQuantity | string | null | undefined, currency: string): string {
  if (value === null || value === undefined) return 'Chưa biết'
  return `${formatPlanningDecimal(typeof value === 'string' ? value : value.decimal_view)} ${currency}`
}

export function parsePlanningBudget(input: string): string | null {
  const text = input.trim()
  const grouped = /^(?:[1-9]\d{0,2})(?:,\d{3})+(?:\.\d+)?$/.test(text) ? text.replaceAll(',', '') : text
  // Decimal text remains exact, including zero. Commas are thousands separators.
  return isPlanningMoney(grouped) ? grouped : null
}

export function buildPlanningSetupRequest(context: PlanningContext, cutoffDate: string, budgetInput: string): PlanningRequest | null {
  const start = shiftPlanningDate(cutoffDate, 1)
  const defaults = context.default_requirements
  const version = context.default_requirements_version
  if (!start || !shiftPlanningDate(start, 6) || !defaults || !version || !context.budget_ceiling) return null
  if (!budgetInput.trim()) {
    if (!context.requirements_modes.some((mode) => mode.mode === 'default' && mode.availability === 'available')) return null
    return { requirements_mode: 'default', forecast_start_date: start, default_requirements_version: version }
  }
  const budget = parsePlanningBudget(budgetInput)
  if (budget === null || comparePlanningDecimal(budget, context.budget_ceiling.amount) > 0 ||
    !context.requirements_modes.some((mode) => mode.mode === 'custom' && mode.availability === 'available')) return null
  const request: PlanningRequest = { requirements_mode: 'custom', forecast_start_date: start, default_requirements_version: version,
    requirements: { paths: defaults.paths.map((path) => ({ path: path.path, min_fill_rate_percent: path.min_fill_rate_percent,
      product_overrides: path.product_overrides.map((item) => ({ ...item })) })), budget_limit: budget } }
  try { return validatePlanningRequest(request) } catch { return null }
}

export function defaultPlanningCutoff(context: PlanningContext): string {
  return context.defaults.cutoff_date ?? (context.defaults.forecast_start_date ? shiftPlanningDate(context.defaults.forecast_start_date, -1) : null) ?? ''
}
