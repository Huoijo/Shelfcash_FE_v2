import type { IngredientStock, InventoryLot, InventoryMeta, InventoryMovement, InventoryResponse, InventorySummary } from './inventory.types'

// Synthetic, fixed read examples only. No receipt/adjustment writer or ledger engine.
export const inventoryFixtureDate = '2026-10-10'
export const inventoryFixtureSnapshot = 'fixture-inventory-snapshot-20261010'
export const inventoryFixtureMeta: InventoryMeta = {
  request_id: 'fixture-inventory-read', as_of_date: inventoryFixtureDate,
  updated_at: '2026-10-10T02:15:00Z', snapshot_id: inventoryFixtureSnapshot,
  data_version: 'fixture-inventory-data-1',
}

const ingredientId = (index: number) => `10000000-0000-0000-0000-${String(index).padStart(12, '0')}`
const lotId = (index: number) => `20000000-0000-0000-0000-${String(index).padStart(12, '0')}`

function ingredient(index: number, name: string, unit: string, quantity: string, overrides: Partial<IngredientStock> = {}): IngredientStock {
  return {
    ingredient_id: ingredientId(index), name, sku: `DEMO-${String(index).padStart(3, '0')}`, ingredient_active: true, unit,
    on_hand_quantity: quantity, usable_quantity: quantity, usable_known_quantity: quantity, usable_availability: 'known',
    expired_quantity: '0', stock_completeness: 'CONFIRMED', lot_count: 1, positive_lot_count: 1,
    nearest_expiry: '2026-11-20', status: 'stable', status_reasons: [],
    low_stock_assessment: { status: 'ok', threshold: '1', version: `fixture-threshold-${index}` }, near_expiry_lot_count: 0,
    ...overrides,
  }
}

export const inventoryFixtureItems: IngredientStock[] = [
  ingredient(1, 'Sữa tươi minh họa', 'l', '15.500', { lot_count: 7, positive_lot_count: 6, nearest_expiry: '2026-10-25' }),
  ingredient(2, 'Cà phê hạt minh họa', 'kg', '2.250', {
    status: 'low_stock', low_stock_assessment: { status: 'low', threshold: '3', version: 'fixture-threshold-2' },
  }),
  ingredient(3, 'Bơ lạt minh họa', 'kg', '3.500', {
    lot_count: 2, positive_lot_count: 2, nearest_expiry: '2026-10-10', status: 'near_expiry', near_expiry_lot_count: 2,
    status_reasons: [{ code: 'NEAR_EXPIRY', message: 'Có lô còn dùng được đến ngày hạn, trong phạm vi 7 ngày.', details: {} }],
  }),
  ingredient(4, 'Kem tươi minh họa', 'l', '4', {
    usable_quantity: '0', usable_known_quantity: '0', expired_quantity: '4', nearest_expiry: null, status: 'expired',
    low_stock_assessment: { status: 'low', threshold: '1', version: 'fixture-threshold-4' },
    status_reasons: [{ code: 'EXPIRED_STOCK', message: 'Tồn vật lý đã ghi nhận còn nguyên; không còn phần dùng được.', details: {} }],
  }),
  ingredient(5, 'Muối minh họa', 'kg', '0', {
    lot_count: 0, positive_lot_count: 0, nearest_expiry: null, status: 'empty',
    low_stock_assessment: { status: 'low', threshold: '0', version: 'fixture-threshold-5' },
  }),
  ingredient(6, 'Đường cát minh họa', 'kg', '50', {
    status: 'watch', low_stock_assessment: { status: 'unknown', threshold: null, version: null },
    status_reasons: [{ code: 'THRESHOLD_UNKNOWN', message: 'Chưa có ngưỡng sắp hết được khai báo.', details: {} }],
  }),
  ingredient(7, 'Nước cốt dừa minh họa', 'l', '3', {
    usable_quantity: null, usable_known_quantity: '0', usable_availability: 'unknown', nearest_expiry: null, status: 'watch',
    low_stock_assessment: { status: 'unknown', threshold: '1', version: 'fixture-threshold-7' },
    status_reasons: [{ code: 'REQUIRED_EXPIRY_MISSING', message: 'Lô theo dõi hạn dùng thiếu ngày hết hạn.', details: {} }],
  }),
  ingredient(8, 'Si-rô minh họa', 'ml', '12345.750'),
  ingredient(9, 'Bột mì minh họa', 'kg', '0', {
    lot_count: 0, positive_lot_count: 0, stock_completeness: 'UNKNOWN', nearest_expiry: null, status: 'watch',
    low_stock_assessment: { status: 'unknown', threshold: null, version: null },
    status_reasons: [{ code: 'STOCK_SCOPE_UNKNOWN', message: 'Chưa có lô ghi nhận; chưa xác nhận toàn bộ tồn thực tế.', details: {} }],
  }),
  ingredient(10, 'Trà đen minh họa', 'kg', '8', { ingredient_active: false }),
]

function lot(index: number, quantity: string, unit: string, overrides: Partial<InventoryLot> = {}): InventoryLot {
  return {
    lot_id: lotId(index), batch_code: `DEMO-LOT-${String(index).padStart(3, '0')}`, quantity, unit,
    supplier_id: null, received_date: '2026-10-01', expiry_date: '2026-11-20', status: 'stable', use_first: true,
    location: null, location_availability: 'unsupported', updated_at: '2026-10-10T02:15:00Z',
    version: `fixture-lot-${index}-v1`, origin: 'ACTUAL_RECEIPT',
    cost: { availability: 'unknown', unit_cost: null, currency: 'VND' }, ...overrides,
  }
}

export const inventoryFixtureLots: Record<string, InventoryLot[]> = {
  [ingredientId(1)]: [
    lot(15, '0', 'l', { batch_code: null, expiry_date: '2026-10-05', status: 'empty', use_first: false, origin: 'UNKNOWN' }),
    lot(1, '2.500', 'l', { expiry_date: '2026-10-25', cost: { availability: 'known', unit_cost: '32000.00', currency: 'VND' } }),
    lot(2, '3', 'l', { expiry_date: '2026-10-26', use_first: false }),
    lot(3, '1', 'l', { expiry_date: '2026-10-27', use_first: false, cost: { availability: 'forbidden', unit_cost: null, currency: 'VND' } }),
    lot(4, '2', 'l', { expiry_date: '2026-10-28', use_first: false }),
    lot(5, '4', 'l', { expiry_date: '2026-10-29', use_first: false }),
    lot(6, '3', 'l', { expiry_date: '2026-10-30', use_first: false }),
  ],
  [ingredientId(2)]: [lot(7, '2.250', 'kg')],
  [ingredientId(3)]: [lot(8, '2', 'kg', { expiry_date: '2026-10-10', status: 'near_expiry' }),
    lot(9, '1.500', 'kg', { expiry_date: '2026-10-17', status: 'near_expiry', use_first: false })],
  [ingredientId(4)]: [lot(10, '4', 'l', { expiry_date: '2026-10-09', status: 'expired', use_first: false })],
  [ingredientId(5)]: [],
  [ingredientId(6)]: [lot(11, '50', 'kg')],
  [ingredientId(7)]: [lot(12, '3', 'l', { expiry_date: null, received_date: null, status: 'watch', use_first: false, batch_code: null, origin: 'UNKNOWN' })],
  [ingredientId(8)]: [lot(13, '12345.750', 'ml', { cost: { availability: 'known', unit_cost: '0', currency: 'VND' } })],
  [ingredientId(9)]: [],
  [ingredientId(10)]: [lot(14, '8', 'kg', { origin: 'OPENING_STOCK', cost: { availability: 'forbidden', unit_cost: null, currency: 'VND' } })],
}

function movement(index: number, kind: InventoryMovement['kind'], delta: string, day: string, overrides: Partial<InventoryMovement> = {}): InventoryMovement {
  return {
    movement_id: `30000000-0000-0000-0000-${String(index).padStart(12, '0')}`, lot_id: lotId(1), batch_code: 'DEMO-LOT-001',
    kind, quantity_delta: delta, unit: 'l', occurred_at: `${day}T02:00:00Z`, recorded_at: `${day}T02:15:00Z`,
    actor_user_id: null, reason: null, reference: null, origin: 'UNKNOWN', ...overrides,
  }
}

export const inventoryFixtureMovements: Record<string, InventoryMovement[]> = {
  [ingredientId(1)]: [
    movement(1, 'usage', '-0.500', '2026-10-10'),
    movement(2, 'manual_adjustment', '-0.250', '2026-10-09', { reason: 'Ví dụ điều chỉnh có căn cứ.' }),
    movement(3, 'count_correction', '0.250', '2026-10-08', { origin: 'IMPORT_COUNT', reason: 'Ví dụ chênh lệch kiểm kê lô đã định danh.' }),
    movement(4, 'waste', '-0.100', '2026-10-07', { reason: 'Ví dụ hao hụt được ghi nhận.' }),
    movement(5, 'expired', '-0.100', '2026-10-06', { lot_id: lotId(15), batch_code: null, reason: 'Ví dụ movement hết hạn đã được ghi nhận, không sinh bởi GET.' }),
    movement(6, 'receipt', '2.500', '2026-10-01', { origin: 'ACTUAL_RECEIPT', reference: { type: 'ACTUAL_RECEIPT', id: '40000000-0000-0000-0000-000000000001' } }),
    movement(7, 'count_correction', '1', '2026-09-30', { lot_id: lotId(2), batch_code: 'DEMO-LOT-002', origin: 'OPENING_STOCK', reason: 'Ví dụ số dư mở đầu của lô có thật.' }),
  ],
}

export const inventoryFixtureSummary: InventorySummary = {
  ingredient_count: 10, positive_lot_count: 14, near_expiry_lot_count: 2, near_expiry_ingredient_count: 1,
  expired_lot_count: 1, low_stock_ingredient_count: null, unknown_assessment_ingredient_count: 3,
}

export const emptyInventoryFixture: InventoryResponse = {
  data: {
    summary: { ingredient_count: 0, positive_lot_count: 0, near_expiry_lot_count: 0, near_expiry_ingredient_count: 0,
      expired_lot_count: 0, low_stock_ingredient_count: 0, unknown_assessment_ingredient_count: 0 },
    items: [], missing_ingredient_ids: [],
  },
  meta: { ...inventoryFixtureMeta, pagination: { limit: 50, next_cursor: null, total_count: 0 } }, error: null,
}
