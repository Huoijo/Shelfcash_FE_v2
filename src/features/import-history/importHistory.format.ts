import type { ImportStatus } from './importHistory.types'

export const statusLabels: Record<ImportStatus, string> = {
  uploaded: 'Đã tải lên', analyzing: 'Đang phân tích', review_required: 'Cần kiểm tra',
  ready_for_preview: 'Sẵn sàng xem trước', previewing: 'Đang tạo bản xem trước',
  preview_ready: 'Đã có bản xem trước', blocked: 'Cần xử lý', committing: 'Đang ghi dữ liệu',
  completed: 'Thành công', completed_with_warnings: 'Có cảnh báo', failed: 'Thất bại',
}

export function isBusinessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function formatDate(value: string): string {
  // Business DATE is not an instant; keep it independent of browser timezone.
  return value.split('-').reverse().join('/')
}

export function storeDate(timestamp: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(timestamp))
  return ['year', 'month', 'day'].map((part) => parts.find((p) => p.type === part)?.value).join('-')
}

export function formatTimestamp(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: timezone, dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(value))
}

export function shiftMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + offset)
  return date.toISOString().slice(0, 7)
}

export function calendarCells(month: string): (string | null)[] {
  const first = new Date(`${month}-01T00:00:00Z`)
  const start = (first.getUTCDay() + 6) % 7
  const last = new Date(first)
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  const count = last.getUTCDate()
  return Array.from({ length: Math.ceil((start + count) / 7) * 7 }, (_, index) => {
    const day = index - start + 1
    return day > 0 && day <= count ? `${month}-${String(day).padStart(2, '0')}` : null
  })
}
