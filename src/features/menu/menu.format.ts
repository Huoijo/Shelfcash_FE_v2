import type { ProductRow, ProductStatus } from './menu.types'

export const productStatusLabels: Record<ProductStatus, string> = { active: 'Đang bán', paused: 'Tạm ngưng' }

export function isMenuBusinessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function formatMenuDate(value: string | null): string {
  return value === null ? 'Không giới hạn' : value.split('-').reverse().join('/')
}

export function formatMenuTimestamp(value: string | null, timezone: string): string {
  if (value === null) return 'Chưa xác định'
  try {
    const display = new Intl.DateTimeFormat('vi-VN', {
      timeZone: timezone, day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).format(new Date(value))
    return `${display} (${timezone})`
  } catch {
    // Explicit UTC fallback if this browser cannot format the supplied Store zone.
    return `${value.slice(0, 10).split('-').reverse().join('/')} ${value.slice(11, 19)} UTC`
  }
}

export function formatMenuDecimal(value: string): string {
  const [integer, fraction = ''] = value.split('.')
  const trimmed = fraction.replace(/0+$/, '')
  // Presentation only: never parse business decimals as floats or convert units.
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${trimmed ? `,${trimmed}` : ''}`
}

export function formatMenuMoney(value: string | null, currency: string): string {
  return value === null ? 'Chưa biết' : `${formatMenuDecimal(value)} ${currency}`
}

export function ingredientCountLabel(row: Pick<ProductRow, 'ingredient_count' | 'ingredient_count_availability'>): string {
  if (row.ingredient_count_availability === 'forbidden') return 'Không có quyền xem'
  if (row.ingredient_count_availability === 'missing_recipe') return 'Chưa có công thức'
  return `${row.ingredient_count} nguyên liệu`
}
