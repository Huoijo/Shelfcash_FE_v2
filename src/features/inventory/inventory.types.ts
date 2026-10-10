import type { ApiSuccess, Pagination } from '../../shared/http/http.types'

// Inventory V1 §§2–3; decimal quantities and opaque versions remain strings.
export type InventoryStatus = 'stable' | 'watch' | 'near_expiry' | 'low_stock' | 'empty' | 'expired'
export type LotStatus = Exclude<InventoryStatus, 'low_stock'>
export type InventoryNotification = { code: string; message: string; details: Record<string, unknown> }
export type IngredientStock = {
  ingredient_id: string
  name: string
  sku: string | null
  ingredient_active: boolean
  unit: string
  on_hand_quantity: string
  usable_quantity: string | null
  usable_known_quantity: string
  usable_availability: 'known' | 'unknown'
  expired_quantity: string
  stock_completeness: 'CONFIRMED' | 'UNKNOWN'
  lot_count: number
  positive_lot_count: number
  nearest_expiry: string | null
  status: InventoryStatus
  status_reasons: InventoryNotification[]
  low_stock_assessment: { status: 'low' | 'ok' | 'unknown'; threshold: string | null; version: string | null }
  near_expiry_lot_count: number
}
export type InventorySummary = {
  ingredient_count: number
  positive_lot_count: number
  near_expiry_lot_count: number
  near_expiry_ingredient_count: number
  expired_lot_count: number
  low_stock_ingredient_count: number | null
  unknown_assessment_ingredient_count: number
}
export type InventoryLot = {
  lot_id: string
  batch_code: string | null
  quantity: string
  unit: string
  supplier_id: string | null
  received_date: string | null
  expiry_date: string | null
  status: LotStatus
  use_first: boolean
  location: null
  location_availability: 'unsupported'
  updated_at: string
  version: string
  origin: 'OPENING_STOCK' | 'ACTUAL_RECEIPT' | 'UNKNOWN'
  cost: { availability: 'known' | 'unknown' | 'forbidden'; unit_cost: string | null; currency: string }
}
export type InventoryMovement = {
  movement_id: string
  lot_id: string
  batch_code: string | null
  kind: 'receipt' | 'usage' | 'waste' | 'expired' | 'count_correction' | 'manual_adjustment'
  quantity_delta: string
  unit: string
  occurred_at: string
  recorded_at: string
  actor_user_id: string | null
  reason: string | null
  reference: { type: string; id: string } | null
  origin: 'OPENING_STOCK' | 'ACTUAL_RECEIPT' | 'IMPORT_COUNT' | 'UNKNOWN'
}
export type InventoryMeta = {
  request_id: string
  as_of_date: string
  updated_at: string | null
  snapshot_id: string
  data_version: string
}
export type InventoryRequest = {
  q?: string
  status?: InventoryStatus[]
  ingredient_id?: string[]
  cursor?: string
  limit?: number
  sort?: 'name' | '-name' | 'nearest_expiry'
}
export type InventoryEvidenceRequest = { snapshot_id: string; cursor?: string; limit?: number }
export type InventoryResponse = ApiSuccess<
  { summary: InventorySummary; items: IngredientStock[]; missing_ingredient_ids: string[] },
  InventoryMeta & { pagination: Pagination }
>
export type InventoryDetailResponse = ApiSuccess<
  IngredientStock & { lots: InventoryLot[]; lots_page: { next_cursor: string | null; total_count: number | null }; threshold_version: string },
  InventoryMeta
>
export type InventoryLotsResponse = ApiSuccess<
  { ingredient_id: string; items: InventoryLot[] }, InventoryMeta & { pagination: Pagination }
>
export type InventoryMovementsResponse = ApiSuccess<
  { ingredient_id: string; items: InventoryMovement[] }, InventoryMeta & { pagination: Pagination }
>
