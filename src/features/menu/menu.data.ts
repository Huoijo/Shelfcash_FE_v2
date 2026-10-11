import { config } from '../../app/config'
import { HttpError, requestJson } from '../../shared/http/httpClient'
import { menuFixtureItems, menuFixtureMeta, menuFixtureProducts, menuFixtureSummary, menuProductFixture } from './menu.fixtures'
import type { MenuDetailResponse, MenuRequest, MenuResponse } from './menu.types'
import { validateMenu, validateMenuProduct } from './menu.validation'

export const menuSource = { label: config.dataSource === 'mock' ? 'Dữ liệu minh họa · Menu 10/10/2026' : 'Dữ liệu từ máy chủ' }

function menuPath(storeId: string | null, suffix: string, params?: MenuRequest): string {
  if (!storeId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(storeId)) throw new Error('Chưa có Store hợp lệ từ phiên làm việc để đọc Menu.')
  const query = new URLSearchParams()
  if (params) {
    // P01 allowlist only; undefined limit stays absent so the backend owns its default.
    const allowed = { q: params.q, status: params.status, limit: params.limit, cursor: params.cursor, sort: params.sort }
    Object.entries(allowed).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)) })
  }
  return `/api/v1/stores/${storeId}/products${suffix}${query.size ? `?${query}` : ''}`
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

const normalized = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase()

// Exact decimal ordering for fixture presentation. Never turn prices into floats.
function comparePrice(left: string, right: string): number {
  const [leftInteger, leftFraction = ''] = left.split('.')
  const [rightInteger, rightFraction = ''] = right.split('.')
  if (leftInteger.length !== rightInteger.length) return leftInteger.length < rightInteger.length ? -1 : 1
  if (leftInteger !== rightInteger) return leftInteger < rightInteger ? -1 : 1
  const scale = Math.max(leftFraction.length, rightFraction.length)
  const a = leftFraction.padEnd(scale, '0')
  const b = rightFraction.padEnd(scale, '0')
  return a === b ? 0 : a < b ? -1 : 1
}

export async function getMenu(params: MenuRequest, signal: AbortSignal, storeId: string | null): Promise<MenuResponse> {
  if (config.dataSource === 'api') {
    return validateMenu(await requestJson<unknown>(config.apiBaseUrl, menuPath(storeId, '', params), { signal }))
  }
  await waitForFixture(signal)
  const limit = params.limit ?? 50
  const trimmed = params.q?.trim()
  const sort = params.sort ?? 'name'
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
    (trimmed !== undefined && (trimmed.length < 1 || trimmed.length > 200)) ||
    (params.status !== undefined && !['active', 'paused'].includes(params.status)) ||
    !['name', '-name', 'selling_price', '-selling_price'].includes(sort)) {
    fixtureError('INVALID_FILTER', 'Bộ lọc Menu không hợp lệ.', 422)
  }
  const q = normalized(trimmed ?? '')
  // Search is product NAME only. Filter the full fixture set BEFORE taking a page.
  const items = menuFixtureItems.filter((row) => (!q || normalized(row.name).includes(q)) && (!params.status || row.status === params.status))
    .sort((a, b) => {
      let order: number
      if (sort === 'selling_price' || sort === '-selling_price') {
        if (a.selling_price === null || b.selling_price === null) {
          return a.selling_price === b.selling_price ? a.product_id.localeCompare(b.product_id) : a.selling_price === null ? 1 : -1
        }
        order = comparePrice(a.selling_price, b.selling_price) * (sort === '-selling_price' ? -1 : 1)
      } else order = a.name.localeCompare(b.name, 'vi') * (sort === '-name' ? -1 : 1)
      return order || a.product_id.localeCompare(b.product_id)
    })
  const binding = JSON.stringify([storeId ?? 'fixture-store', menuFixtureMeta.data_version, menuFixtureMeta.as_of_date, q, params.status ?? '', sort])
  const token = (offset: number) => `fixture-menu:${encodeURIComponent(binding)}:${limit}:${offset}`
  const offset = params.cursor ? Array.from({ length: Math.ceil(items.length / limit) }, (_, index) => index * limit)
    .find((index) => token(index) === params.cursor) : 0
  if (offset === undefined) fixtureError('INVALID_CURSOR', 'Cursor không khớp Store, bộ lọc, thứ tự hoặc phiên dữ liệu Menu.', 422)
  return validateMenu({
    data: { summary: menuFixtureSummary, items: items.slice(offset, offset + limit) },
    meta: { ...menuFixtureMeta, pagination: { limit, next_cursor: offset + limit < items.length ? token(offset + limit) : null, total_count: items.length } }, error: null,
  })
}

export async function getMenuProduct(productId: string, signal: AbortSignal, storeId: string | null): Promise<MenuDetailResponse> {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(productId)) {
    const message = 'Mã món không hợp lệ. Vui lòng chọn lại món từ Menu.'
    throw new HttpError('contract', message, 422, { code: 'INVALID_RESOURCE_ID', message, details: {} })
  }
  if (config.dataSource === 'api') {
    // P02 has no query/body: never send snapshot_id, arbitrary dates or recipe versions.
    return validateMenuProduct(await requestJson<unknown>(config.apiBaseUrl, menuPath(storeId, `/${productId}`), { signal }), productId)
  }
  await waitForFixture(signal)
  const product = menuFixtureProducts.find((row) => row.product_id === productId)
  if (!product) fixtureError('RESOURCE_NOT_FOUND', 'Không tìm thấy món trong dữ liệu minh họa.', 404)
  return validateMenuProduct(menuProductFixture(product), productId)
}
