import { fieldLabel } from '../../shared/flow/fieldLabels'
import { previewDomainLabels } from './components/preview.labels'

export const schemaLabel = (value: string | null | undefined) => value ? previewDomainLabels[value] ?? 'Dữ liệu đã chọn' : 'Chưa chọn loại dữ liệu'
export const sourceLabel = (value: string) => ({ kiotviet: 'KiotViet', sapo: 'Sapo', 'mock.synthetic': 'Nguồn cửa hàng' })[value.toLowerCase()] ?? 'Nguồn đã khai báo'
export const reportLabel = (value: string) => ({ daily_sales: 'Daily Sales', daily_total: 'Bán hàng theo ngày' })[value] ?? schemaLabel(value)
export const businessField = (value: string) => fieldLabel(value.split('.').at(-1) ?? value)
export const displayStoreName = (value: string) => value.replace(/\s*·\s*DEV\/QA\s*$/i, '')
export const sourceScopeLabel = (scope: { source_system_key: string; report_type: string }) => `${sourceLabel(scope.source_system_key)} · ${reportLabel(scope.report_type)}`

const messages: Record<string, string> = {
  SOURCE_CONTEXT_REQUIRED: 'Cần xác nhận nguồn dữ liệu.', SOURCE_CONTEXT_CONFLICT: 'Nguồn báo cáo cần được xác nhận lại.', SOURCE_IDENTITY_CONFLICT: 'Nguồn báo cáo chưa thống nhất.',
  PROFILE_MATCH_AMBIGUOUS: 'Có nhiều cách đọc phù hợp. Cần làm rõ nguồn báo cáo.', PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT: 'Cấu trúc hoặc cách đọc dữ liệu đã thay đổi.',
  OWNER_MAPPING_APPROVAL_REQUIRED: 'Cần Owner duyệt cách đọc dữ liệu.', MAPPING_VERSION_RETIRED: 'Cách đọc dữ liệu đã ngừng sử dụng.',
  RECIPE_SOURCE_SCOPE_AMBIGUOUS: 'Công thức của cùng món và phiên bản xuất hiện trên nhiều sheet. Cần xác định lại phạm vi nguồn.',
  SALES_COVERAGE_INCOMPLETE: 'Sales coverage chưa đủ', INVENTORY_COMPLETENESS_REQUIRED: 'Inventory completeness chưa đạt',
  SUPPLIER_COST_MISSING: 'Supplier cost còn thiếu', DEFAULT_CONFIG_UNAVAILABLE: 'Chưa có cấu hình lập kế hoạch mặc định.',
  INVALID_ROW: 'Có dữ liệu nguồn cần xử lý.',
}
export function importMessage(code: string, message?: string): string {
  return messages[code] ?? (message && !/[A-Z]{2,}_[A-Z_]+|mock\.|sha256:|DTO|job_id|import_id|schema\/|read-set/.test(message) ? message : 'Có thông tin cần kiểm tra trước khi tiếp tục.')
}
