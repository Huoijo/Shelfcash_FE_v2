import { mockInventory, mockSummary } from '../mock/mockRepository'
import { config } from '../../app/config'
import { HttpError, requestJson } from '../../shared/http/httpClient'
import type { InventoryDetailResponse, InventoryEvidenceRequest, InventoryLotsResponse, InventoryMovementsResponse, InventoryRequest, InventoryResponse } from './inventory.types'
import { validateInventory, validateInventoryIngredient, validateInventoryLots, validateInventoryMovements } from './inventory.validation'

export const inventorySource = { label: config.dataSource === 'mock' ? 'Dữ liệu minh họa · Kho 10/10/2026' : 'Dữ liệu từ máy chủ' }

function inventoryPath(storeId: string | null, suffix: string, params: Record<string, unknown>): string {
  if (!storeId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(storeId)) throw new Error('Chưa có Store hợp lệ từ phiên làm việc để đọc Kho.')
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)))
    else if (value !== undefined && value !== '') query.set(key, String(value))
  })
  return `/api/v1/stores/${storeId}/inventory${suffix}${query.size ? `?${query}` : ''}`
}

function waitForFixture(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, 300)
    signal.addEventListener('abort', abort, { once: true })
  })
}

function fixtureError(code: string, message: string, status: number): never {
  throw new HttpError('contract', message, status, { code, message, details: {} })
}

function assertSnapshot(snapshot: string, storeId: string | null): void {
  if (snapshot !== mockInventory(storeId).meta.snapshot_id) fixtureError('SNAPSHOT_NOT_AVAILABLE', 'Snapshot không còn khả dụng. Vui lòng tải lại Kho.', 409)
}

function assertIngredientId(ingredientId: string): void {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(ingredientId)) {
    const message = 'Mã nguyên liệu không hợp lệ. Vui lòng chọn lại nguyên liệu từ danh sách Kho.'
    throw new HttpError('contract', message, 422, { code: 'VALIDATION_ERROR', message, details: {} })
  }
}

function fixtureIngredient(ingredientId: string, storeId: string | null) {
  const item = mockInventory(storeId).items.find((row) => row.ingredient_id === ingredientId)
  if (!item) fixtureError('RESOURCE_NOT_FOUND', 'Không tìm thấy nguyên liệu trong dữ liệu minh họa.', 404)
  return item
}

function fixturePage<T>(items: T[], params: { cursor?: string; limit?: number }, binding: string) {
  const limit = params.limit ?? 50
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) fixtureError('INVALID_FILTER', 'Giới hạn trang phải từ 1 đến 100.', 422)
  const token = (offset: number) => `fixture-inventory:${encodeURIComponent(binding)}:${limit}:${offset}`
  const offset = params.cursor ? Array.from({ length: Math.ceil(items.length / limit) }, (_, i) => i * limit)
    .find((index) => token(index) === params.cursor) : 0
  if (offset === undefined) fixtureError('INVALID_CURSOR', 'Cursor không khớp bộ lọc, nguyên liệu hoặc snapshot.', 422)
  return {
    items: items.slice(offset, offset + limit),
    pagination: { limit, next_cursor: offset + limit < items.length ? token(offset + limit) : null, total_count: items.length },
  }
}

const normalized = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

export async function getInventory(params: InventoryRequest, signal: AbortSignal, storeId: string | null): Promise<InventoryResponse> {
  if (config.dataSource === 'api') {
    return validateInventory(await requestJson<unknown>(config.apiBaseUrl, inventoryPath(storeId, '', params), { signal }))
  }
  await waitForFixture(signal)
  const { items: inventoryFixtureItems, meta: inventoryFixtureMeta } = mockInventory(storeId)
  const inventoryFixtureSnapshot = inventoryFixtureMeta.snapshot_id
  const inventoryFixtureSummary = mockSummary(inventoryFixtureItems)
  const q = normalized(params.q ?? '')
  const items = inventoryFixtureItems.filter((row) => (!q || normalized(`${row.name} ${row.sku ?? ''}`).includes(q)) &&
    (!params.status?.length || params.status.includes(row.status)) &&
    (!params.ingredient_id?.length || params.ingredient_id.includes(row.ingredient_id)))
    .sort((a, b) => {
      if (params.sort === 'nearest_expiry') return (a.nearest_expiry ?? '9999-12-31').localeCompare(b.nearest_expiry ?? '9999-12-31') || a.ingredient_id.localeCompare(b.ingredient_id)
      const order = a.name.localeCompare(b.name, 'vi')
      return (params.sort === '-name' ? -order : order) || a.ingredient_id.localeCompare(b.ingredient_id)
    })
  const binding = JSON.stringify([inventoryFixtureSnapshot, q, [...(params.status ?? [])].sort(), [...(params.ingredient_id ?? [])].sort(), params.sort ?? 'name'])
  const result = fixturePage(items, params, binding)
  return {
    data: {
      summary: inventoryFixtureSummary, items: result.items,
      missing_ingredient_ids: (params.ingredient_id ?? []).filter((id) => !inventoryFixtureItems.some((row) => row.ingredient_id === id)),
    },
    meta: { ...inventoryFixtureMeta, pagination: result.pagination }, error: null,
  }
}

export async function getInventoryIngredient(ingredientId: string, snapshotId: string, signal: AbortSignal, storeId: string | null): Promise<InventoryDetailResponse> {
  assertIngredientId(ingredientId)
  if (config.dataSource === 'api') {
    const value = await requestJson<unknown>(config.apiBaseUrl, inventoryPath(storeId, `/${ingredientId}`, { snapshot_id: snapshotId }), { signal })
    return validateInventoryIngredient(value, ingredientId, snapshotId)
  }
  await waitForFixture(signal)
  const { lots: inventoryFixtureLots, meta: inventoryFixtureMeta } = mockInventory(storeId)
  assertSnapshot(snapshotId, storeId)
  const ingredient = fixtureIngredient(ingredientId, storeId)
  const result = fixturePage(inventoryFixtureLots[ingredientId] ?? [], {}, `${snapshotId}:${ingredientId}:lots`)
  return {
    data: { ...ingredient, lots: result.items, lots_page: { next_cursor: result.pagination.next_cursor, total_count: result.pagination.total_count },
      threshold_version: ingredient.low_stock_assessment.version ?? `fixture-unconfigured-${ingredientId}` },
    meta: inventoryFixtureMeta, error: null,
  }
}

export async function getInventoryLots(ingredientId: string, params: InventoryEvidenceRequest, signal: AbortSignal, storeId: string | null): Promise<InventoryLotsResponse> {
  assertIngredientId(ingredientId)
  if (config.dataSource === 'api') {
    const value = await requestJson<unknown>(config.apiBaseUrl, inventoryPath(storeId, `/${ingredientId}/lots`, params), { signal })
    return validateInventoryLots(value, ingredientId, params.snapshot_id)
  }
  await waitForFixture(signal)
  const { lots: inventoryFixtureLots, meta: inventoryFixtureMeta } = mockInventory(storeId)
  assertSnapshot(params.snapshot_id, storeId)
  fixtureIngredient(ingredientId, storeId)
  const result = fixturePage(inventoryFixtureLots[ingredientId] ?? [], params, `${params.snapshot_id}:${ingredientId}:lots`)
  return { data: { ingredient_id: ingredientId, items: result.items }, meta: { ...inventoryFixtureMeta, pagination: result.pagination }, error: null }
}

export async function getInventoryMovements(ingredientId: string, params: InventoryEvidenceRequest, signal: AbortSignal, storeId: string | null): Promise<InventoryMovementsResponse> {
  assertIngredientId(ingredientId)
  if (config.dataSource === 'api') {
    const value = await requestJson<unknown>(config.apiBaseUrl, inventoryPath(storeId, `/${ingredientId}/movements`, { ...params, sort: '-occurred_at' }), { signal })
    return validateInventoryMovements(value, ingredientId, params.snapshot_id)
  }
  await waitForFixture(signal)
  const { movements: inventoryFixtureMovements, meta: inventoryFixtureMeta } = mockInventory(storeId)
  assertSnapshot(params.snapshot_id, storeId)
  fixtureIngredient(ingredientId, storeId)
  const result = fixturePage(inventoryFixtureMovements[ingredientId] ?? [], params, `${params.snapshot_id}:${ingredientId}:movements`)
  return { data: { ingredient_id: ingredientId, items: result.items }, meta: { ...inventoryFixtureMeta, pagination: result.pagination }, error: null }
}
