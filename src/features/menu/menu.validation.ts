import { HttpError, isRecord } from '../../shared/http/httpClient'
import { isMenuBusinessDate } from './menu.format'
import type { MenuDetailResponse, MenuResponse } from './menu.types'

const text = (value: unknown) => typeof value === 'string' && value.length > 0
const nullableText = (value: unknown) => value === null || typeof value === 'string'
const uuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
const count = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0
const version = (value: unknown) => typeof value === 'string' && value.length >= 1 && value.length <= 128
const decimal = (value: unknown) => typeof value === 'string' && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)
const positiveQuantity = (value: unknown) => decimal(value) && /[1-9]/.test(String(value))
const lossRate = (value: unknown) => decimal(value) && /^0(?:\.[0-9]+)?$/.test(String(value))
const money = (value: unknown) => typeof value === 'string' && /^(0|[1-9][0-9]{0,17})(\.[0-9]{1,18})?$/.test(value)
const timestamp = (value: unknown) => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z$/.test(value) && isMenuBusinessDate(value.slice(0, 10))

function timezone(value: unknown): boolean {
  // Modern Intl also accepts numeric offsets; V1 requires an IANA Store zone.
  if (!text(value) || /^[+-]/.test(String(value))) return false
  try { new Intl.DateTimeFormat('vi', { timeZone: String(value) }); return true } catch { return false }
}

function invalid(): never {
  throw new HttpError('protocol', 'Dữ liệu Menu không đúng contract P01/P02. Vui lòng tải lại Menu.')
}

function envelope(value: unknown): value is { data: Record<string, unknown>; meta: Record<string, unknown>; error: null } {
  return isRecord(value) && value.error === null && isRecord(value.data) && isRecord(value.meta) &&
    text(value.meta.request_id) && timestamp(value.meta.observed_at) && isMenuBusinessDate(value.meta.as_of_date) &&
    timezone(value.meta.timezone) && (value.meta.updated_at === null || timestamp(value.meta.updated_at)) &&
    version(value.meta.data_version) && Array.isArray(value.meta.warnings) && value.meta.warnings.every((warning) =>
      isRecord(warning) && text(warning.code) && text(warning.message) && isRecord(warning.details))
}

function product(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && uuid(value.product_id) && nullableText(value.sku) && text(value.name) &&
    text(value.selling_unit) && (value.selling_price === null || money(value.selling_price)) && text(value.currency) &&
    (value.status === 'active' || value.status === 'paused')
}

function productRow(value: unknown): boolean {
  return product(value) && ((value.ingredient_count_availability === 'available' && count(value.ingredient_count)) ||
    ((value.ingredient_count_availability === 'missing_recipe' || value.ingredient_count_availability === 'forbidden') && value.ingredient_count === null))
}

function ingredient(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && uuid(value.recipe_line_id) && uuid(value.ingredient_id) && text(value.ingredient_name) &&
    nullableText(value.ingredient_sku) && typeof value.ingredient_active === 'boolean' && typeof value.expiry_tracking === 'boolean' &&
    text(value.base_unit) && positiveQuantity(value.quantity) && value.unit === value.base_unit
}

function recipe(value: unknown, sellingUnit: unknown, asOfDate: unknown): boolean {
  if (!isRecord(value) || !uuid(value.recipe_id) || !count(value.version) || Number(value.version) < 1 ||
    !isMenuBusinessDate(value.effective_from) || !(value.effective_to === null || isMenuBusinessDate(value.effective_to)) ||
    !positiveQuantity(value.yield_quantity) || value.yield_unit !== sellingUnit || !lossRate(value.process_loss_rate) ||
    !Array.isArray(value.ingredients) || !value.ingredients.every(ingredient)) return false
  // P02 is the server-selected recipe for the Store business date, not latest version.
  if (typeof asOfDate !== 'string' || value.effective_from > asOfDate ||
    (typeof value.effective_to === 'string' && value.effective_to < asOfDate)) return false
  const ids = value.ingredients.map((line) => line.ingredient_id as string)
  return new Set(value.ingredients.map((line) => line.recipe_line_id)).size === value.ingredients.length &&
    ids.every((id, index) => index === 0 || ids[index - 1] < id)
}

export function validateMenu(value: unknown): MenuResponse {
  if (!envelope(value) || !isRecord(value.data.summary) || !Array.isArray(value.data.items) ||
    !value.data.items.every(productRow) || !isRecord(value.meta.pagination)) return invalid()
  const summary = value.data.summary
  const page = value.meta.pagination
  if (!count(summary.product_count) || !count(summary.active_count) || !count(summary.paused_count) ||
    Number(summary.product_count) !== Number(summary.active_count) + Number(summary.paused_count) ||
    !count(page.limit) || Number(page.limit) < 1 || Number(page.limit) > 100 || value.data.items.length > Number(page.limit) ||
    !(page.next_cursor === null || text(page.next_cursor)) || !count(page.total_count) ||
    Number(page.total_count) < value.data.items.length || Number(page.total_count) > Number(summary.product_count) ||
    new Set(value.data.items.map((row) => row.product_id)).size !== value.data.items.length ||
    new Set(value.data.items.map((row) => row.currency)).size > 1) return invalid()
  return value as unknown as MenuResponse
}

export function validateMenuProduct(value: unknown, productId: string): MenuDetailResponse {
  if (!envelope(value) || !product(value.data) || value.data.product_id !== productId ||
    !(value.data.recipe === null || recipe(value.data.recipe, value.data.selling_unit, value.meta.as_of_date))) return invalid()
  return value as unknown as MenuDetailResponse
}
