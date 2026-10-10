import { HttpError, isRecord } from '../../shared/http/httpClient'
import { isBusinessDate, inventoryStatusLabels, movementLabels } from './inventory.format'
import type { InventoryDetailResponse, InventoryLotsResponse, InventoryMovementsResponse, InventoryResponse } from './inventory.types'

const text = (value: unknown) => typeof value === 'string' && value.length > 0
const nullableText = (value: unknown) => value === null || typeof value === 'string'
const version = (value: unknown) => typeof value === 'string' && value.length >= 1 && value.length <= 128
const count = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0
const nullableCount = (value: unknown) => value === null || count(value)
const uuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
const quantity = (value: unknown) => typeof value === 'string' && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)
const signedQuantity = (value: unknown) => typeof value === 'string' && /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value) && !/^-0(?:\.0+)?$/.test(value)
const money = (value: unknown) => quantity(value) && /^(0|[1-9][0-9]{0,17})(\.[0-9]{1,18})?$/.test(String(value))
const nullableDate = (value: unknown) => value === null || isBusinessDate(value)
const timestamp = (value: unknown) => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z$/.test(value) && isBusinessDate(value.slice(0, 10))
const cursor = (value: unknown) => value === null || text(value)
const oneOf = (value: unknown, choices: readonly string[]) => typeof value === 'string' && choices.includes(value)

function invalid(): never {
  throw new HttpError('protocol', 'Dữ liệu Kho không đúng contract V01–V04 hoặc không cùng snapshot. Vui lòng tải lại Kho.')
}

function envelope(value: unknown, snapshot?: string): value is { data: Record<string, unknown>; meta: Record<string, unknown>; error: null } {
  return isRecord(value) && value.error === null && isRecord(value.data) && isRecord(value.meta) &&
    text(value.meta.request_id) && isBusinessDate(value.meta.as_of_date) &&
    (value.meta.updated_at === null || timestamp(value.meta.updated_at)) &&
    version(value.meta.snapshot_id) && version(value.meta.data_version) &&
    (snapshot === undefined || value.meta.snapshot_id === snapshot)
}

function page(value: unknown, itemCount: number): boolean {
  return isRecord(value) && count(value.limit) && Number(value.limit) >= 1 && Number(value.limit) <= 100 &&
    itemCount <= Number(value.limit) && cursor(value.next_cursor) && nullableCount(value.total_count)
}

const unique = (items: unknown[], key: string) => new Set(items.map((item) => isRecord(item) ? item[key] : undefined)).size === items.length

function stock(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.low_stock_assessment)) return false
  const assessment = value.low_stock_assessment
  return uuid(value.ingredient_id) && text(value.name) && nullableText(value.sku) && typeof value.ingredient_active === 'boolean' &&
    text(value.unit) && quantity(value.on_hand_quantity) && (value.usable_quantity === null || quantity(value.usable_quantity)) &&
    quantity(value.usable_known_quantity) && quantity(value.expired_quantity) &&
    ((value.usable_availability === 'known' && value.usable_quantity !== null) ||
      (value.usable_availability === 'unknown' && value.usable_quantity === null)) &&
    oneOf(value.stock_completeness, ['CONFIRMED', 'UNKNOWN']) && count(value.lot_count) && count(value.positive_lot_count) &&
    nullableDate(value.nearest_expiry) && typeof value.status === 'string' && Object.hasOwn(inventoryStatusLabels, value.status) &&
    Array.isArray(value.status_reasons) && value.status_reasons.every((reason) => isRecord(reason) && text(reason.code) &&
      text(reason.message) && isRecord(reason.details)) &&
    oneOf(assessment.status, ['low', 'ok', 'unknown']) &&
    (assessment.threshold === null || quantity(assessment.threshold)) &&
    (assessment.version === null || version(assessment.version)) && count(value.near_expiry_lot_count)
}

function lot(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.cost)) return false
  const cost = value.cost
  return uuid(value.lot_id) && nullableText(value.batch_code) && quantity(value.quantity) && text(value.unit) &&
    (value.supplier_id === null || uuid(value.supplier_id)) && nullableDate(value.received_date) && nullableDate(value.expiry_date) &&
    typeof value.status === 'string' && value.status !== 'low_stock' && Object.hasOwn(inventoryStatusLabels, value.status) &&
    typeof value.use_first === 'boolean' && value.location === null && value.location_availability === 'unsupported' &&
    timestamp(value.updated_at) && version(value.version) && oneOf(value.origin, ['OPENING_STOCK', 'ACTUAL_RECEIPT', 'UNKNOWN']) &&
    text(cost.currency) && ((cost.availability === 'known' && money(cost.unit_cost)) ||
      (oneOf(cost.availability, ['unknown', 'forbidden']) && cost.unit_cost === null))
}

function movement(value: unknown): boolean {
  if (!isRecord(value)) return false
  return uuid(value.movement_id) && uuid(value.lot_id) && nullableText(value.batch_code) && typeof value.kind === 'string' &&
    Object.hasOwn(movementLabels, value.kind) && signedQuantity(value.quantity_delta) && text(value.unit) &&
    timestamp(value.occurred_at) && timestamp(value.recorded_at) && (value.actor_user_id === null || uuid(value.actor_user_id)) &&
    nullableText(value.reason) && (value.reference === null || (isRecord(value.reference) && text(value.reference.type) && text(value.reference.id))) &&
    oneOf(value.origin, ['OPENING_STOCK', 'ACTUAL_RECEIPT', 'IMPORT_COUNT', 'UNKNOWN'])
}

export function validateInventory(value: unknown): InventoryResponse {
  if (!envelope(value) || !isRecord(value.data.summary) || !Array.isArray(value.data.items) ||
    !value.data.items.every(stock) || !Array.isArray(value.data.missing_ingredient_ids) || !value.data.missing_ingredient_ids.every(uuid) ||
    !unique(value.data.items, 'ingredient_id') || !page(value.meta.pagination, value.data.items.length)) return invalid()
  const summary = value.data.summary
  if (!['ingredient_count', 'positive_lot_count', 'near_expiry_lot_count', 'near_expiry_ingredient_count', 'expired_lot_count',
    'unknown_assessment_ingredient_count'].every((key) => count(summary[key])) || !nullableCount(summary.low_stock_ingredient_count)) return invalid()
  return value as unknown as InventoryResponse
}

export function validateInventoryIngredient(value: unknown, ingredientId: string, snapshotId: string): InventoryDetailResponse {
  if (!envelope(value, snapshotId) || !stock(value.data) || value.data.ingredient_id !== ingredientId ||
    !Array.isArray(value.data.lots) || !value.data.lots.every((item) => lot(item) && isRecord(item) && item.unit === value.data.unit) ||
    !unique(value.data.lots, 'lot_id') || !isRecord(value.data.lots_page) ||
    !cursor(value.data.lots_page.next_cursor) || !nullableCount(value.data.lots_page.total_count) || !version(value.data.threshold_version)) return invalid()
  return value as unknown as InventoryDetailResponse
}

export function validateInventoryLots(value: unknown, ingredientId: string, snapshotId: string): InventoryLotsResponse {
  if (!envelope(value, snapshotId) || !uuid(value.data.ingredient_id) || value.data.ingredient_id !== ingredientId || !Array.isArray(value.data.items) ||
    !value.data.items.every(lot) || !unique(value.data.items, 'lot_id') || !page(value.meta.pagination, value.data.items.length)) return invalid()
  return value as unknown as InventoryLotsResponse
}

export function validateInventoryMovements(value: unknown, ingredientId: string, snapshotId: string): InventoryMovementsResponse {
  if (!envelope(value, snapshotId) || !uuid(value.data.ingredient_id) || value.data.ingredient_id !== ingredientId || !Array.isArray(value.data.items) ||
    !value.data.items.every(movement) || !unique(value.data.items, 'movement_id') || !page(value.meta.pagination, value.data.items.length)) return invalid()
  return value as unknown as InventoryMovementsResponse
}
