import { HttpError, requestJson } from '../../shared/http/httpClient'
import type { PlanningDataSource, PlanningDataSourceOptions, PlanningRequest, PlanningRun } from './planning.types'
import {
  isPlanningDate, isPlanningUuid, shiftPlanningDate, validatePlanningAccepted,
  validatePlanningContext, validatePlanningIngredient, validatePlanningIngredients,
  validatePlanningReadiness, validatePlanningReasons, validatePlanningRequest, validatePlanningRun,
} from './planning.validation'

function requireId(value: string, label: string): void {
  if (!isPlanningUuid(value)) throw new Error(`${label} phải là UUID canonical của máy chủ.`)
}

function option(value: string | undefined): void {
  if (value !== undefined && (!value.trim() || [...value].length > 128)) throw new Error('Option ID cần token nguyên gốc không rỗng, tối đa 128 ký tự.')
}

/** Numeric-equivalent decimal spellings compare exactly, without changing original intent. */
export function samePlanningRequest(left: PlanningRequest, right: PlanningRequest): boolean {
  const canonical = (value: unknown, key = ''): unknown => {
    if (typeof value === 'string' && ['budget_limit', 'min_fill_rate_percent'].includes(key)) return value.includes('.') ? value.replace(/0+$/, '').replace(/\.$/, '') : value
    if (Array.isArray(value)) return value.map((item) => canonical(item))
    if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([field, item]) => [field, canonical(item, field)]))
    return value
  }
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right))
}

/** Never falls back to fixtures after an API failure. Mock mode requires explicit injection. */
export function createPlanningDataSource(options: PlanningDataSourceOptions): PlanningDataSource {
  if (options.dataSource === 'mock') {
    if (!options.mockSource) throw new Error('Nguồn mock Planning cần được truyền tường minh; không có fallback API → mock.')
    return options.mockSource
  }
  if (options.dataSource !== 'api') throw new Error('Nguồn Planning phải là api hoặc mock.')
  const get = (path: string, signal?: AbortSignal, timeoutMs = 15_000) => requestJson<unknown>(options.apiBaseUrl, path, { signal, timeoutMs })
  const storePath = (storeId: string) => { requireId(storeId, 'Store'); return `/api/v1/stores/${storeId}` }
  const runPath = (runId: string) => { requireId(runId, 'Run'); return `/api/v1/procurement-plans/${runId}` }
  const accepted = new Map<string, { storeId: string; request: PlanningRequest }>()
  const retained = new Map<string, { storeId: string; responseVersion: string; hasResult: boolean; digest?: string | null }>()

  function retain(data: PlanningRun): void {
    const previous = retained.get(data.run_id)
    retained.set(data.run_id, {
      storeId: data.store_id, responseVersion: data.response_version, hasResult: data.result !== null,
      ...(previous?.storeId === data.store_id && previous.responseVersion === data.response_version ? { digest: previous.digest } : {}),
    })
  }

  async function ensureRetained(storeId: string, runId: string, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted()
    requireId(storeId, 'Store'); requireId(runId, 'Run')
    if (retained.get(runId)?.storeId !== storeId) {
      const response = validatePlanningRun(await get(runPath(runId), signal, 30_000), storeId, runId)
      signal?.throwIfAborted()
      retain(response.data)
    }
  }

  function pinDigest(runId: string, digest: string | null): void {
    const basis = retained.get(runId)
    if (!basis || basis.hasResult !== (digest !== null) || (basis.digest !== undefined && basis.digest !== digest)) {
      throw new HttpError('protocol', 'Các trang kết quả không cùng retained aggregate của Run. Đọc lại kế hoạch trước khi tiếp tục.')
    }
    basis.digest = digest
  }

  return {
    async context(storeId, signal) {
      return validatePlanningContext(await get(`${storePath(storeId)}/planning-context`, signal), storeId)
    },
    async readiness(storeId, forecastStartDate, signal) {
      const endpoint = storePath(storeId)
      if (!isPlanningDate(forecastStartDate) || shiftPlanningDate(forecastStartDate, -1) === null || shiftPlanningDate(forecastStartDate, 6) === null) throw new Error('Ngày bắt đầu hoặc khoảng kế hoạch không hợp lệ.')
      const query = new URLSearchParams({ actions: 'planning', forecast_start_date: forecastStartDate })
      return validatePlanningReadiness(await get(`${endpoint}/readiness?${query}`, signal), storeId, forecastStartDate)
    },
    async create(storeId, intent, signal) {
      const endpoint = storePath(storeId)
      requireId(intent.key, 'Idempotency-Key')
      const request = structuredClone(validatePlanningRequest(intent.request))
      const response = validatePlanningAccepted(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/procurement-plans`, {
        method: 'POST', signal, headers: { 'Idempotency-Key': intent.key }, body: request,
      }))
      signal?.throwIfAborted()
      accepted.set(response.data.run_id, { storeId, request })
      return response
    },
    async read(storeId, runId, signal) {
      requireId(storeId, 'Store')
      const response = validatePlanningRun(await get(runPath(runId), signal, 30_000), storeId, runId)
      signal?.throwIfAborted()
      const intent = accepted.get(runId)
      if (intent && (intent.storeId !== storeId || !samePlanningRequest(intent.request, response.data.request))) throw new HttpError('protocol', 'Run đã lưu không khớp Store hoặc ý định tạo kế hoạch vừa được nhận.')
      retain(response.data)
      return response
    },
    async ingredients(storeId, runId, query, signal) {
      await ensureRetained(storeId, runId, signal)
      option(query.optionId)
      if (query.cursor !== undefined && (!query.cursor.trim() || query.cursor.length > 4096)) throw new Error('Cursor cần không rỗng và tối đa 4096 ký tự.')
      const params = new URLSearchParams()
      if (query.optionId !== undefined) params.set('option_id', query.optionId)
      if (query.cursor !== undefined) params.set('cursor', query.cursor)
      const response = validatePlanningIngredients(await get(`${runPath(runId)}/ingredients${params.size ? `?${params}` : ''}`, signal), runId, query.optionId)
      signal?.throwIfAborted()
      pinDigest(runId, response.data.result_digest)
      return response
    },
    async ingredient(storeId, runId, ingredientId, optionId, signal) {
      await ensureRetained(storeId, runId, signal)
      requireId(ingredientId, 'Ingredient'); option(optionId)
      const query = optionId === undefined ? '' : `?${new URLSearchParams({ option_id: optionId })}`
      const response = validatePlanningIngredient(await get(`${runPath(runId)}/ingredients/${ingredientId}${query}`, signal), runId, ingredientId, optionId)
      signal?.throwIfAborted()
      pinDigest(runId, response.data.result_digest)
      return response
    },
    async reasons(storeId, runId, optionId, signal) {
      await ensureRetained(storeId, runId, signal)
      option(optionId)
      const query = optionId === undefined ? '' : `?${new URLSearchParams({ option_id: optionId })}`
      const response = validatePlanningReasons(await get(`${runPath(runId)}/explanation${query}`, signal), runId, optionId)
      signal?.throwIfAborted()
      pinDigest(runId, response.data.result_digest)
      return response
    },
  }
}
