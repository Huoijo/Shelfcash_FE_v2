import type { ApiSuccess, Pagination } from '../../shared/http/http.types'

// CAT §§4–7: Products, dated recipes and ingredient identities remain distinct.
export type ProductStatus = 'active' | 'paused'
export type ProductRow = {
  product_id: string
  sku: string | null
  name: string
  selling_unit: string
  selling_price: string | null
  currency: string
  status: ProductStatus
  ingredient_count: number | null
  ingredient_count_availability: 'available' | 'missing_recipe' | 'forbidden'
}
export type RecipeIngredient = {
  recipe_line_id: string
  ingredient_id: string
  ingredient_name: string
  ingredient_sku: string | null
  ingredient_active: boolean
  expiry_tracking: boolean
  base_unit: string
  quantity: string
  unit: string
}
export type MenuRecipe = {
  recipe_id: string
  version: number
  effective_from: string
  effective_to: string | null
  yield_quantity: string
  yield_unit: string
  process_loss_rate: string
  ingredients: RecipeIngredient[]
}
export type MenuProduct = Omit<ProductRow, 'ingredient_count' | 'ingredient_count_availability'> & { recipe: MenuRecipe | null }
export type MenuSummary = { product_count: number; active_count: number; paused_count: number }
export type MenuMeta = {
  request_id: string
  observed_at: string
  as_of_date: string
  timezone: string
  updated_at: string | null
  data_version: string
  warnings: { code: string; message: string; details: Record<string, unknown> }[]
}
export type MenuRequest = {
  q?: string
  status?: ProductStatus
  limit?: number
  cursor?: string
  sort?: 'name' | '-name' | 'selling_price' | '-selling_price'
}
export type MenuResponse = ApiSuccess<
  { summary: MenuSummary; items: ProductRow[] },
  MenuMeta & { pagination: Omit<Pagination, 'total_count'> & { total_count: number } }
>
export type MenuDetailResponse = ApiSuccess<MenuProduct, MenuMeta>
