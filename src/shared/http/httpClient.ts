import type { ApiError, ApiSuccess } from './http.types'

export class HttpError extends Error {
  readonly kind: 'transport' | 'http' | 'contract' | 'protocol'
  readonly status?: number
  readonly problem?: ApiError

  constructor(
    kind: HttpError['kind'], message: string, status?: number, problem?: ApiError,
  ) {
    super(message)
    this.name = 'HttpError'
    this.kind = kind
    this.status = status
    this.problem = problem
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type JsonRequest = Omit<RequestInit, 'body' | 'credentials'> & { body?: unknown }

// Only JSON endpoints. Logout's 204 and PDF downloads need their own boundary later.
// Headers are caller-supplied, including any future session-owned CSRF token.
export async function requestJson<T, M = Record<string, unknown>>(
  baseUrl: string, path: string, options: JsonRequest = {},
): Promise<ApiSuccess<T, M>> {
  const { body, signal, ...init } = options
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  const timeout = AbortSignal.timeout(15_000)
  let response: Response
  let payload: unknown

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init, headers, credentials: 'include', cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    try { payload = JSON.parse(text) } catch {
      throw new HttpError(
        response.ok ? 'protocol' : 'http',
        'Máy chủ chưa trả về phản hồi JSON hợp lệ.', response.status,
      )
    }
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof HttpError) throw error
    throw new HttpError('transport', timeout.aborted
      ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
      : 'Không kết nối được máy chủ. Kiểm tra kết nối rồi thử lại.')
  }

  if (isRecord(payload) && payload.data === null && isRecord(payload.error) &&
    typeof payload.error.code === 'string' && typeof payload.error.message === 'string' &&
    isRecord(payload.error.details) && isRecord(payload.meta)) {
    throw new HttpError('contract', payload.error.message, response.status, payload.error as ApiError)
  }
  if (!response.ok) {
    throw new HttpError('http', `Yêu cầu không thành công (HTTP ${response.status}).`, response.status)
  }
  if (!isRecord(payload) || payload.error !== null || !isRecord(payload.meta) ||
    !('data' in payload) || payload.data === null) {
    throw new HttpError('protocol', 'Phản hồi không đúng cấu trúc data/meta/error.', response.status)
  }
  // The feature validates its own data shape; generics alone do not validate JSON.
  return payload as ApiSuccess<T, M>
}
