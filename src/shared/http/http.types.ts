export type ApiError = {
  code: string
  message: string
  details: Record<string, unknown>
}

export type ApiSuccess<T, M = Record<string, unknown>> = {
  data: T
  meta: M
  error: null
}

export type ApiFailure = {
  data: null
  meta: Record<string, unknown>
  error: ApiError
}

export type ApiResponse<T, M = Record<string, unknown>> = ApiSuccess<T, M> | ApiFailure

export type Pagination = {
  limit: number
  next_cursor: string | null
  total_count: number | null
}
