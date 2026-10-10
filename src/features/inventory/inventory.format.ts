import type { InventoryMovement, InventoryStatus } from './inventory.types'

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  stable: 'Ổn định', watch: 'Theo dõi', near_expiry: 'Gần hạn',
  low_stock: 'Sắp hết', empty: 'Hết tồn dùng được', expired: 'Hết hạn',
}
export const movementLabels: Record<InventoryMovement['kind'], string> = {
  receipt: 'Nhận hàng', usage: 'Sử dụng', waste: 'Hao hụt', expired: 'Hết hạn',
  count_correction: 'Điều chỉnh kiểm kê', manual_adjustment: 'Điều chỉnh thủ công',
}

export function isBusinessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function formatQuantity(value: string | null, unit: string): string {
  if (value === null) return 'Chưa biết'
  const [integer, fraction = ''] = value.split('.')
  const trimmed = fraction.replace(/0+$/, '')
  // String-only presentation: no floating point, precision loss or unit conversion.
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped}${trimmed ? `,${trimmed}` : ''}${unit ? ` ${unit}` : ''}`
}

export function formatInventoryDate(value: string | null): string {
  return value === null ? 'Chưa xác định' : value.split('-').reverse().join('/')
}

export function formatInventoryTimestamp(value: string | null): string {
  if (value === null) return 'Chưa xác định'
  // V01 meta does not supply a Store timezone. Label UTC; never use browser time.
  return `${value.slice(0, 10).split('-').reverse().join('/')} ${value.slice(11, 19)} UTC`
}

export function expiryLabel(expiry: string | null, asOf: string): string {
  if (expiry === null) return 'Chưa xác định hạn dùng'
  const days = (Date.parse(`${expiry}T00:00:00Z`) - Date.parse(`${asOf}T00:00:00Z`)) / 86_400_000
  if (days < 0) return `Đã hết hạn ${-days} ngày`
  if (days === 0) return 'Đến ngày hết hạn hôm nay'
  return `Còn ${days} ngày`
}
