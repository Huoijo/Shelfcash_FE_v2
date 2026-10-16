import { businessField, reportLabel, sourceLabel } from '../importPresentation'

const labels: Record<string, string> = {
  current:'Giá trị hiện tại',proposed:'Giá trị đề xuất',source:'Nguồn dữ liệu',evidence:'Bằng chứng',provenance:'Nguồn gốc',entity_refs:'Bản ghi bị ảnh hưởng',missing_stockout:'Ý nghĩa khi thiếu hết hàng',stockout_aliases:'Alias hết hàng',pack_cost_basis:'Cơ sở tính giá',
  before_quantity: 'Tồn hệ thống', after_quantity: 'Kiểm kê', quantity_delta: 'Điều chỉnh', movement_type: 'Thao tác', observed_at: 'Thời điểm kiểm kê', minimum_order_packs: 'Số pack tối thiểu', price_basis: 'Cơ sở giá', moq_basis: 'Cơ sở MOQ', source_price: 'Giá nguồn', fee_coverage: 'Thông tin phí', scope: 'Nguồn', source_system_key: 'Hệ thống nguồn', report_type: 'Loại báo cáo', structure: 'Cấu trúc', sheet_roles: 'Loại sheet', header_rules: 'Quy tắc tiêu đề',
  field_bindings: 'Cách hiểu cột', source_header: 'Cột nguồn', source_column_index: 'Vị trí cột', target_field: 'Trường dữ liệu', requiredness: 'Yêu cầu', ignored: 'Bỏ qua',
  identity_rules: 'Liên kết đối tượng', source_token: 'Giá trị nguồn', canonical_id: 'Đối tượng đã chọn', entity: 'Loại đối tượng', reference_state: 'Trạng thái đối tượng',
  entity_proposals: 'Đối tượng mới', metadata: 'Thông tin đối tượng', source_business_key: 'Mã trong nguồn', aliases: 'Tên gọi tương ứng', normalizations: 'Chuẩn hóa', conversions: 'Quy đổi đơn vị',
  shared_field_bindings: 'Giá trị dùng chung', sales_semantics: 'Dữ liệu bán hàng', inventory_semantics: 'Dữ liệu kiểm kê', source_provenance: 'Bằng chứng nguồn',
  evidence_references: 'Tham chiếu chứng từ', evidence_reference: 'Tham chiếu chứng từ', verification: 'Xác nhận nguồn', owner_reviewed: 'Owner đã kiểm tra',
  planned_arrival_expiry_rule: 'Quy tắc hạn sử dụng', term_period_amendments: 'Điều chỉnh thời hạn cung cấp', fee_period_amendments: 'Điều chỉnh thời hạn phí',
  value: 'Giá trị', factor: 'Hệ số quy đổi', numerator: 'Tử số', denominator: 'Mẫu số', from_unit: 'Đơn vị nguồn', to_unit: 'Đơn vị đích', recipe_quantity_basis: 'Recipe basis',
}
const technical = new Set(['schema', 'schema_version', 'schema_signature', 'version', 'content_digest', 'declared_by', 'resolved_by', 'reserved_canonical_id','confidence'])
const values: Record<string, string> = { PER_SOURCE_UNIT:'Theo đơn vị nguồn',quantity_only:'Chỉ có số lượng bán',not_provided:'Nguồn không cung cấp',CORRECT_HISTORY_RECORD:'Sửa bản ghi lịch sử', COUNT_CORRECTION: 'Đối chiếu kiểm kê', OPENING_STOCK: 'Tồn đầu kỳ', IMPORT_COUNT: 'Kiểm kê', PER_PACK: 'Theo pack', PER_QUANTITY: 'Theo lượng', PACKS: 'Số pack', PHYSICAL_QUANTITY: 'Lượng vật lý', UNKNOWN: 'Chưa xác định', COMPLETE: 'Đầy đủ', PER_SERVING: 'Theo khẩu phần', WHOLE_BATCH: 'Theo cả batch', PROFILE_CONSTANT: 'Tái sử dụng trong profile', IMPORT_VALUE: 'Chỉ lần nhập này', daily_total: 'Tổng theo ngày', disjoint_contribution: 'Nguồn bán hàng không giao nhau', lot_stock_count: 'Kiểm kê theo lô', USER_DECLARED: 'Người dùng xác nhận', MANUAL: 'Đã xác nhận thủ công', RULE: 'Quy tắc đọc dữ liệu', REUSED: 'Dùng cách đọc đã duyệt', product: 'Món', ingredient: 'Nguyên liệu', supplier: 'Nhà cung cấp', existing: 'Đã có trong cửa hàng', reserved: 'Đề xuất mới', required: 'Bắt buộc', optional: 'Không bắt buộc' }

/** Complete business facts remain reviewable; transport pins/diagnostics belong to Debug. */
export function ImportBusinessFacts({ value, field }: { value: unknown; field?: string }) {
  if (value == null) return <span>Chưa được cung cấp</span>
  if (Array.isArray(value)) return value.length ? <div>{value.map((item, i) => <div className="input-business-row" key={i}><ImportBusinessFacts value={item} field={field} /></div>)}</div> : <span>Không có</span>
  if (typeof value === 'object') return <dl className="import-flow__spec">{Object.entries(value).filter(([key]) => !technical.has(key)).map(([key, item]) => <div key={key}><dt>{labels[key] ?? businessField(key)}</dt><dd><ImportBusinessFacts value={item} field={key} /></dd></div>)}</dl>
  if (typeof value === 'boolean') return <span>{value ? 'Có' : 'Không'}</span>
  const text = String(value)
  if (field && /(?:^id$|_id$)/.test(field)) return <span>Đã liên kết với danh mục</span>
  return <span>{field === 'source_system_key' ? sourceLabel(text) : field === 'report_type' ? reportLabel(text) : field === 'target_field' ? businessField(text) : values[text] ?? text}</span>
}
