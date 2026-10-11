import { HttpError, isRecord } from '../../shared/http/httpClient'
import type { AuthContext } from './auth.types'

const uuid = (value: unknown): value is string => typeof value === 'string' &&
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
const version = (value: unknown): value is string => typeof value === 'string' && value.length >= 1 && value.length <= 128
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z$/.test(value) ||
    value.startsWith('0000-')) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 19) === value.slice(0, 19)
}

export function validateAuthContext(value: unknown): AuthContext {
  const fail = (): never => {
    const requestId = isRecord(value) && isRecord(value.meta) && text(value.meta.request_id) ? value.meta.request_id : undefined
    throw new HttpError('protocol', 'Phản hồi Auth/session không đúng contract V1.', undefined, undefined, requestId)
  }
  if (!isRecord(value) || value.error !== null || !isRecord(value.meta) || !text(value.meta.request_id) ||
    !isRecord(value.data)) return fail()
  const data = value.data
  if (!isRecord(data.user) || !isRecord(data.session) || !uuid(data.user.user_id) ||
    !text(data.user.display_name) || !text(data.user.email) || data.user.email.length > 320 ||
    data.user.email !== data.user.email.trim().toLowerCase() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.user.email) ||
    !timestamp(data.session.expires_at) || !timestamp(data.session.absolute_expires_at) ||
    Date.parse(data.session.expires_at) > Date.parse(data.session.absolute_expires_at) ||
    !text(data.session.csrf_token) || /[\r\n]/.test(data.session.csrf_token) ||
    !(data.default_store_id === null || uuid(data.default_store_id)) ||
    !Number.isSafeInteger(data.accessible_store_count) || Number(data.accessible_store_count) < 0 ||
    !version(data.authorization_version)) return fail()
  // The contract permits a default only for exactly one accessible Store.
  if ((data.accessible_store_count === 1) !== (data.default_store_id !== null)) return fail()
  return data as AuthContext
}
