import type { PreviewBundle, PreviewRow, SalesResolution, SupplierConfirmation, HistoryCorrection } from './importFlow.types'

export const salesDecisionRows = (bundle: PreviewBundle) => bundle.preview.rows.filter(row => row.confirmation_required && ['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES'].includes(row.proposed_action))
export const supplierDecisionRows = (bundle: PreviewBundle) => bundle.preview.rows.filter(row => row.confirmation_required && ['supplier_terms', 'payable_fees'].includes(row.canonical_domain ?? row.after?.domain ?? row.before?.domain ?? ''))
export function validSalesDecision(row: PreviewRow, value?: SalesResolution) {
  return !!value && value.row_id === row.row_id && (row.proposed_action === 'REPLACE_DAILY_TOTAL'
    ? value.action === 'replace_daily_total' && value.disjoint_assertion !== true
    : value.action === 'confirm_disjoint_merge' && value.disjoint_assertion === true) &&
    !!value.report_business_key.trim() && !!value.evidence_reference.trim() && !!value.reason.trim()
}
/** Decisions are staged for I05 commit, never represented as separately persisted domain writes. */
export const historyDecisionRows = (bundle: PreviewBundle) => bundle.preview.rows.filter(row => row.proposed_action === 'CORRECT_HISTORY_RECORD')
export function validHistoryDecision(row: PreviewRow, value?: HistoryCorrection) { return !!value && row.confirmation_required && !!row.expected_version && value.row_id === row.row_id && value.expected_version === row.expected_version && !!value.reason.trim() }
export function importDomainBlockers(bundle: PreviewBundle | null, sales: SalesResolution[] = [], suppliers: SupplierConfirmation[] = [], history: HistoryCorrection[] = []): string[] {
  if (!bundle) return []
  const blockers: string[] = []
  const requiredSales = salesDecisionRows(bundle), requiredSuppliers = supplierDecisionRows(bundle)
  if (sales.length !== requiredSales.length || new Set(sales.map(item => item.row_id)).size !== sales.length ||
    requiredSales.some(row => !validSalesDecision(row, sales.find(item => item.row_id === row.row_id)))) blockers.push('Còn quyết định Sales cần xác nhận trước khi Review.')
  if (suppliers.length !== requiredSuppliers.length || new Set(suppliers.map(item => item.action_id)).size !== suppliers.length ||
    requiredSuppliers.some(row => !suppliers.some(item => item.action_id === row.row_id && !!item.reason.trim()))) blockers.push('Còn thay đổi điều khoản/phí nhà cung cấp cần xác nhận trước khi Review.')
  const requiredHistory = historyDecisionRows(bundle)
  if (history.length !== requiredHistory.length || new Set(history.map(v => v.row_id)).size !== history.length || requiredHistory.some(row => !validHistoryDecision(row, history.find(v => v.row_id === row.row_id)))) blockers.push('Còn bản sửa dữ liệu lịch sử cần xác nhận trước khi Review.')
  return blockers
}
