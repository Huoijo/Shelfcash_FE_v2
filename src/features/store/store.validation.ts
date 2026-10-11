import { HttpError, isRecord } from '../../shared/http/httpClient'
import type { StoreContext, StoreList, StoreSummary } from './store.types'

const uuid = (value: unknown): value is string => typeof value === 'string' &&
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
const version = (value: unknown): value is string => typeof value === 'string' && value.length >= 1 && value.length <= 128
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0

function invalid(surface: string, value?: unknown): never {
  const requestId = isRecord(value) && isRecord(value.meta) && text(value.meta.request_id) ? value.meta.request_id : undefined
  throw new HttpError('protocol', `Phản hồi ${surface} không đúng contract Store V1.`, undefined, undefined, requestId)
}

function storeSummary(value: unknown): value is StoreSummary {
  if (!isRecord(value) || !uuid(value.store_id) || !text(value.name) || !text(value.timezone) ||
    typeof value.currency !== 'string' || !/^[A-Z]{3}$/.test(value.currency) ||
    (value.role !== 'OWNER' && value.role !== 'STAFF') || !uuid(value.membership_id) ||
    !version(value.authorization_version)) return false
  try { new Intl.DateTimeFormat('en', { timeZone: value.timezone }) } catch { return false }
  return true
}

function envelope(value: unknown, surface: string) {
  if (!isRecord(value) || value.error !== null || !isRecord(value.data) ||
    !isRecord(value.meta) || !text(value.meta.request_id)) return invalid(surface, value)
  return { data: value.data, meta: value.meta }
}

function businessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z$/.test(value) ||
    value.startsWith('0000-')) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 19) === value.slice(0, 19)
}

export function validateStoreList(value: unknown): StoreList {
  const { data, meta } = envelope(value, 'T01')
  const page = meta.pagination
  if (!Array.isArray(data.items) || !data.items.every(storeSummary) ||
    new Set(data.items.map((item) => item.store_id)).size !== data.items.length ||
    !isRecord(page) || !count(page.limit) || page.limit < 1 || page.limit > 100 ||
    !(page.next_cursor === null || text(page.next_cursor)) || !(page.total_count === null || count(page.total_count)) ||
    data.items.length > page.limit || (typeof page.total_count === 'number' && data.items.length > page.total_count)) return invalid('T01', value)
  return { items: data.items, pagination: page } as StoreList
}

export function validateStoreContext(value: unknown, storeId: string): StoreContext {
  const { data } = envelope(value, 'T02')
  if (!storeSummary(data) || !isRecord(data)) return invalid('T02', value)
  // Validate the full membership instead of inferring Owner privileges locally.
  const context = data as unknown as Record<string, unknown>
  if (data.store_id !== storeId || context.active !== true || !timestamp(context.server_now) ||
    !businessDate(context.as_of_date) || !isRecord(context.membership) ||
    context.membership.membership_id !== data.membership_id || context.membership.role !== data.role ||
    context.membership.authorization_version !== data.authorization_version ||
    !Array.isArray(context.membership.effective_permissions) || !context.membership.effective_permissions.every(text) ||
    new Set(context.membership.effective_permissions).size !== context.membership.effective_permissions.length ||
    !version(context.permission_catalog_version)) return invalid('T02', value)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: data.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(context.server_now))
  const localDate = ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)?.value.padStart(type === 'year' ? 4 : 2, '0')).join('-')
  if (localDate !== context.as_of_date) return invalid('T02', value)
  return context as StoreContext
}
