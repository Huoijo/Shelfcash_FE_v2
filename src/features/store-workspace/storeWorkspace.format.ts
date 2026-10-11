import { formatPlanningDecimal, parsePlanningBudget } from '../decision-planning/planning.format'
import type { Invitation, PermissionDescriptor } from './storeWorkspace.types'

// Reviewed action keys, never the six illustrative grouped permissions in the prototype.
export const storePermissionLabels: Record<string, { label: string; group: string }> = {
  'ingredient.read': { label: 'Xem nguyên liệu', group: 'Menu & nguyên liệu' },
  'ingredient.create': { label: 'Tạo nguyên liệu', group: 'Menu & nguyên liệu' },
  'menu.read': { label: 'Xem Menu', group: 'Menu & nguyên liệu' },
  'product.create': { label: 'Tạo món', group: 'Menu & nguyên liệu' },
  'recipe.read': { label: 'Xem công thức', group: 'Menu & nguyên liệu' },
  'recipe.create_version': { label: 'Tạo phiên bản công thức', group: 'Menu & nguyên liệu' },
  'recipe.manage_effectivity': { label: 'Quản lý thời gian hiệu lực công thức', group: 'Menu & nguyên liệu' },
  'inventory.read': { label: 'Xem tồn kho', group: 'Kho' },
  'inventory.receive': { label: 'Ghi nhận nhập kho', group: 'Kho' },
  'inventory.count.correct': { label: 'Điều chỉnh kiểm kê', group: 'Kho' },
  'procurement.cost.read': { label: 'Xem chi phí mua hàng', group: 'Chi phí & ngân sách' },
  'sales.read': { label: 'Xem doanh số', group: 'Bán hàng' },
  'sales.record': { label: 'Ghi nhận doanh số', group: 'Bán hàng' },
  'sales.correct': { label: 'Điều chỉnh doanh số', group: 'Bán hàng' },
  'sales.merge': { label: 'Hợp nhất dữ liệu doanh số', group: 'Bán hàng' },
  'supplier.read': { label: 'Xem nhà cung cấp', group: 'Nhà cung cấp' },
  'supplier.create': { label: 'Tạo nhà cung cấp', group: 'Nhà cung cấp' },
  'supplier.terms.create': { label: 'Tạo điều khoản cung cấp', group: 'Nhà cung cấp' },
  'supplier.terms.correct': { label: 'Điều chỉnh điều khoản cung cấp', group: 'Nhà cung cấp' },
  'supplier.fees.manage': { label: 'Quản lý phí nhà cung cấp', group: 'Nhà cung cấp' },
  'import.create': { label: 'Tạo lô nhập dữ liệu', group: 'Nhập dữ liệu' },
  'import.upload': { label: 'Tải tệp nhập dữ liệu', group: 'Nhập dữ liệu' },
  'import.read': { label: 'Xem lô nhập dữ liệu', group: 'Nhập dữ liệu' },
  'import.analyze': { label: 'Phân tích tệp nhập', group: 'Nhập dữ liệu' },
  'import.preview': { label: 'Xem trước thay đổi nhập', group: 'Nhập dữ liệu' },
  'import.commit': { label: 'Ghi dữ liệu đã review', group: 'Nhập dữ liệu' },
  'mapping.read': { label: 'Xem ánh xạ dữ liệu', group: 'Nhập dữ liệu' },
  'mapping.propose': { label: 'Đề xuất ánh xạ dữ liệu', group: 'Nhập dữ liệu' },
  'planning.context.read': { label: 'Xem điều kiện lập kế hoạch', group: 'Kế hoạch nhập' },
  'planning.run': { label: 'Chạy kế hoạch nhập', group: 'Kế hoạch nhập' },
  'planning.result.read': { label: 'Xem kết quả kế hoạch', group: 'Kế hoạch nhập' },
  'planning.requirements.read': { label: 'Xem yêu cầu lập kế hoạch', group: 'Kế hoạch nhập' },
  'planning.requirements.create': { label: 'Tạo yêu cầu lập kế hoạch', group: 'Kế hoạch nhập' },
  'planning.requirements.manage': { label: 'Quản lý yêu cầu đã lưu', group: 'Kế hoạch nhập' },
  'planning.export': { label: 'Xuất kế hoạch', group: 'Kế hoạch nhập' },
  'budget.read': { label: 'Xem ngân sách', group: 'Chi phí & ngân sách' },
  'budget.update': { label: 'Thay đổi trần ngân sách', group: 'Chi phí & ngân sách' },
}

export const storeWeekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'] as const

export function storePermissionLabel(key: string): string {
  return storePermissionLabels[key]?.label ?? 'Quyền chưa có nhãn được xác nhận'
}

export function storePermissionGroup(key: string): string {
  return storePermissionLabels[key]?.group ?? 'Quyền chưa nhận diện'
}

export function isKnownStorePermission(key: string): boolean {
  return Object.hasOwn(storePermissionLabels, key)
}

export function sortedStoreGrants(grants: readonly string[]): string[] {
  return [...new Set(grants)].sort()
}

export function sameStoreGrants(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify(sortedStoreGrants(left)) === JSON.stringify(sortedStoreGrants(right))
}

export function missingStorePrerequisites(grants: readonly string[], catalog: readonly PermissionDescriptor[]): string[] {
  const selected = new Set(grants)
  return sortedStoreGrants(catalog.filter((descriptor) => selected.has(descriptor.key))
    .flatMap((descriptor) => descriptor.required_with.filter((key) => !selected.has(key))))
}

export function formatStoreBudget(amount: string | null | undefined, currency: string): string {
  return amount === null || amount === undefined ? 'Chưa được thiết lập' : `${formatPlanningDecimal(amount)} ${currency}`
}

export const parseStoreBudget = parsePlanningBudget

export function canonicalStoreEmail(input: string): string | null {
  const email = input.trim().toLowerCase()
  return email.length > 0 && email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function validStoreReason(reason: string): boolean {
  return reason.trim().length > 0 && [...reason].length <= 1000
}

export function storeInvitationStatus(status: Invitation['status']): string {
  return { pending: 'Đang chờ chấp nhận', accepted: 'Đã chấp nhận', revoked: 'Đã thu hồi', expired: 'Đã hết hạn' }[status]
}

export function storeDeliveryStatus(status: Invitation['delivery_status']): string {
  return { queued: 'Đang chờ gửi email', delivered: 'Email đã được chuyển giao', failed: 'Gửi email thất bại' }[status]
}

export function formatStoreTimestamp(value: string | null): string {
  // Explicit UTC avoids using the browser timezone as Store truth.
  if (!value) return 'Chưa có'
  return `${value.replace('T', ' ').replace(/Z$/, '')} UTC`
}

export function storeDialogFocusIndex(current: number, count: number, backwards: boolean): number | null {
  if (count <= 0) return null
  if (backwards && current <= 0) return count - 1
  if (!backwards && (current < 0 || current >= count - 1)) return 0
  return null
}
