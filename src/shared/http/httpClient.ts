import type { ApiError, ApiSuccess } from './http.types'

export class HttpError extends Error {
  readonly kind: 'transport' | 'http' | 'contract' | 'protocol'
  readonly status?: number
  readonly problem?: ApiError
  readonly requestId?: string

  constructor(
    kind: HttpError['kind'], message: string, status?: number, problem?: ApiError, requestId?: string,
  ) {
    super(message)
    this.name = 'HttpError'
    this.kind = kind
    this.status = status
    this.problem = problem
    this.requestId = requestId
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type HttpSessionHooks = {
  getCsrfToken: () => string | null
  onUnauthenticated: () => void
}
let sessionHooks: HttpSessionHooks | null = null

// One session owner supplies current memory-only CSRF and handles protected 401s.
export function configureHttpSession(hooks: HttpSessionHooks): () => void {
  sessionHooks = hooks
  return () => { if (sessionHooks === hooks) sessionHooks = null }
}

export type HttpRequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  timeoutMs?: number
  auth?: 'public' | 'protected'
  // Explicit dependency injection for boundary tests; product features use sessionHooks.
  getCsrfToken?: () => string | null | undefined | Promise<string | null | undefined>
}
type JsonRequest = HttpRequestOptions & { body?: unknown }
type MultipartRequest = HttpRequestOptions & { body: FormData }

export class CsrfTokenUnavailableError extends Error {
  readonly code = 'CSRF_TOKEN_UNAVAILABLE'

  constructor() {
    super('Chưa có CSRF token từ phiên đăng nhập. Đọc lại phiên trước khi gửi thay đổi lên máy chủ.')
    this.name = 'CsrfTokenUnavailableError'
  }
}

// Cookie transport and authenticated mutation CSRF are shared session concerns.
export async function requestJson<T, M = Record<string, unknown>>(
  baseUrl: string, path: string, options: JsonRequest = {},
): Promise<ApiSuccess<T, M>> {
  const { body, ...init } = options
  const headers = new Headers(options.headers)
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  return requestEnvelope(baseUrl, path, { ...init, headers }, body === undefined ? undefined : JSON.stringify(body))
}

export async function requestMultipart<T, M = Record<string, unknown>>(
  baseUrl: string, path: string, options: MultipartRequest,
): Promise<ApiSuccess<T, M>> {
  const { body, ...init } = options
  const headers = new Headers(options.headers)
  // The browser must supply the boundary that matches the encoded FormData.
  headers.delete('Content-Type')
  return requestEnvelope(baseUrl, path, { ...init, headers }, body)
}

export async function requestNoContent(
  baseUrl: string, path: string, options: HttpRequestOptions = {},
): Promise<void> {
  await requestResponse(baseUrl, path, options, undefined, true)
}

/** Authenticated downloads share cookie, timeout and session-expiry handling with JSON reads. */
export async function requestPdf(baseUrl: string, path: string, options: HttpRequestOptions = {}): Promise<Blob> {
  return await requestResponse(baseUrl, path, options, undefined, 'pdf') as Blob
}

async function requestEnvelope<T, M>(
  baseUrl: string, path: string, options: HttpRequestOptions, body?: BodyInit,
): Promise<ApiSuccess<T, M>> {
  return await requestResponse(baseUrl, path, options, body, false) as ApiSuccess<T, M>
}

async function requestResponse(
  baseUrl: string, path: string, options: HttpRequestOptions, body: BodyInit | undefined, noContent: boolean | 'pdf',
): Promise<unknown> {
  const { signal, timeoutMs = 15_000, auth = 'protected', getCsrfToken, ...init } = options
  signal?.throwIfAborted()
  const headers = new Headers(options.headers)
  headers.set('Accept', noContent === 'pdf' ? 'application/pdf' : 'application/json')
  const capturedHooks = auth === 'protected' ? sessionHooks : null
  const capturedToken = capturedHooks?.getCsrfToken() ?? null
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes((init.method ?? 'GET').toUpperCase())
  if (auth === 'protected' && mutation) {
    const token = getCsrfToken ? await getCsrfToken() : capturedToken
    if (typeof token !== 'string' || !token.trim() || /[\r\n]/.test(token)) throw new CsrfTokenUnavailableError()
    headers.set('X-CSRF-Token', token)
  } else {
    // Public login has no session token requirement; reads do not send mutation CSRF.
    headers.delete('X-CSRF-Token')
  }
  signal?.throwIfAborted()
  const timeout = AbortSignal.timeout(timeoutMs)
  let response: Response
  let payload: unknown
  let requestId: string | undefined

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init, headers, credentials: 'include', cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      body,
    })
    requestId = response.headers.get('X-Request-Id') || undefined
    // A stale/aborted read must not clear a newer session or rotated CSRF context.
    if (response.status === 401 && auth === 'protected' && capturedHooks &&
      sessionHooks === capturedHooks && !signal?.aborted && !timeout.aborted &&
      capturedHooks.getCsrfToken() === capturedToken) capturedHooks.onUnauthenticated()
    if (noContent === true && response.status === 204) return
    if (noContent === 'pdf' && response.ok) {
      if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf') {
        throw new HttpError('protocol', 'Máy chủ chưa trả về PDF hợp lệ.', response.status, undefined, requestId)
      }
      const blob = await response.blob()
      if (blob.size < 8 || await blob.slice(0, 5).text() !== '%PDF-') {
        throw new HttpError('protocol', 'Nội dung PDF bị thiếu hoặc hỏng.', response.status, undefined, requestId)
      }
      return blob
    }
    const text = await response.text()
    try { payload = JSON.parse(text) } catch {
      throw new HttpError(
        response.ok ? 'protocol' : 'http',
        'Máy chủ chưa trả về phản hồi JSON hợp lệ.', response.status, undefined, requestId,
      )
    }
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof HttpError) throw error
    throw new HttpError('transport', timeout.aborted
      ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
      : 'Không kết nối được máy chủ. Kiểm tra kết nối rồi thử lại.')
  }

  if (isRecord(payload) && isRecord(payload.meta) && typeof payload.meta.request_id === 'string' &&
    payload.meta.request_id.length > 0) requestId = payload.meta.request_id

  if (isRecord(payload) && payload.data === null && isRecord(payload.error) &&
    typeof payload.error.code === 'string' && typeof payload.error.message === 'string' &&
    isRecord(payload.error.details) && isRecord(payload.meta)) {
    throw new HttpError('contract', payload.error.message, response.status, payload.error as ApiError, requestId)
  }
  if (!response.ok) {
    throw new HttpError('http', `Yêu cầu không thành công (HTTP ${response.status}).`, response.status, undefined, requestId)
  }
  if (noContent) throw new HttpError('protocol', 'Đăng xuất cần phản hồi HTTP 204 không có nội dung.', response.status, undefined, requestId)
  if (!isRecord(payload) || payload.error !== null || !isRecord(payload.meta) ||
    !('data' in payload) || payload.data === null) {
    throw new HttpError('protocol', 'Phản hồi không đúng cấu trúc data/meta/error.', response.status, undefined, requestId)
  }
  // The feature validates its own data shape; generics alone do not validate JSON.
  return payload
}
