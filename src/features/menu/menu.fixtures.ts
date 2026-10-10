import type { MenuDetailResponse, MenuMeta, MenuProduct, MenuRecipe, MenuResponse, ProductRow, RecipeIngredient } from './menu.types'

// Synthetic UI examples only. No mutable backend, recipe calendar or saved state.
const id = (value: number) => `00000000-0000-0000-0000-${String(value).padStart(12, '0')}`
export const menuFixtureMeta: MenuMeta = {
  request_id: 'fixture-menu-read', observed_at: '2026-10-10T03:00:00Z', as_of_date: '2026-10-10',
  timezone: 'Asia/Ho_Chi_Minh', updated_at: '2026-10-09T07:30:00Z', data_version: 'fixture-catalog-2026-10-10-v1', warnings: [],
}

function line(value: number, ingredientId: number, name: string, quantity: string, unit: string, active = true): RecipeIngredient {
  return { recipe_line_id: id(value), ingredient_id: id(ingredientId), ingredient_name: name, ingredient_sku: null,
    ingredient_active: active, expiry_tracking: unit === 'ml', base_unit: unit, quantity, unit }
}

function recipe(value: number, version: number, from: string, to: string | null, yieldQuantity: string, loss: string, ingredients: RecipeIngredient[]): MenuRecipe {
  return { recipe_id: id(value), version, effective_from: from, effective_to: to,
    yield_quantity: yieldQuantity, yield_unit: 'cup', process_loss_rate: loss, ingredients }
}

const coffeeRecipe = recipe(201, 1, '2026-10-01', '2026-10-10', '1.000', '0', [
  line(301, 101, 'Cà phê rang xay', '20.000', 'g'), line(302, 103, 'Sữa đặc', '30.00', 'g'), line(303, 106, 'Đá viên', '100', 'g'),
])
const matchaRecipe = recipe(202, 3, '2026-10-05', null, '2', '0.020', [
  line(304, 102, 'Sữa tươi', '360', 'ml'), line(305, 104, 'Bột matcha', '8.050', 'g'), line(306, 106, 'Đá viên', '200', 'g'),
])
const peachRecipe = recipe(203, 2, '2026-10-10', '2026-12-31', '10', '0.100', [
  line(307, 105, 'Trà đen', '50', 'g'), line(308, 107, 'Đào ngâm', '300', 'g', false), line(309, 108, 'Si-rô đào', '200', 'ml'),
])
const emptyRecipe = recipe(204, 1, '2026-09-01', null, '1', '0', [])
const sodaRecipe = recipe(205, 4, '2026-10-01', null, '1', '0', [line(310, 109, 'Soda', '250', 'ml')])

export const menuFixtureProducts: MenuProduct[] = [
  { product_id: id(10), sku: 'CF-SUA', name: 'Cà phê sữa', selling_unit: 'cup', selling_price: '42000', currency: 'VND', status: 'active', recipe: coffeeRecipe },
  { product_id: id(11), sku: 'MATCHA-01', name: 'Matcha Latte', selling_unit: 'cup', selling_price: '49000', currency: 'VND', status: 'active', recipe: matchaRecipe },
  { product_id: id(12), sku: 'TRA-DAO', name: 'Trà đào', selling_unit: 'cup', selling_price: '39000', currency: 'VND', status: 'active', recipe: peachRecipe },
  { product_id: id(13), sku: null, name: 'Cà phê đen', selling_unit: 'cup', selling_price: null, currency: 'VND', status: 'paused', recipe: null },
  { product_id: id(14), sku: null, name: 'Nước ấm', selling_unit: 'cup', selling_price: '0', currency: 'VND', status: 'paused', recipe: emptyRecipe },
  { product_id: id(15), sku: 'SODA-01', name: 'Soda', selling_unit: 'cup', selling_price: null, currency: 'VND', status: 'active', recipe: sodaRecipe },
]

export const menuFixtureItems: ProductRow[] = menuFixtureProducts.map(({ recipe: currentRecipe, ...product }) => ({
  ...product, ingredient_count: currentRecipe === null ? null : currentRecipe.ingredients.length,
  ingredient_count_availability: currentRecipe === null ? 'missing_recipe' : 'available',
}))
export const menuFixtureSummary = {
  product_count: menuFixtureItems.length,
  active_count: menuFixtureItems.filter((item) => item.status === 'active').length,
  paused_count: menuFixtureItems.filter((item) => item.status === 'paused').length,
}
export const emptyMenuFixture: MenuResponse = {
  data: { summary: { product_count: 0, active_count: 0, paused_count: 0 }, items: [] },
  meta: { ...menuFixtureMeta, pagination: { limit: 50, next_cursor: null, total_count: 0 } }, error: null,
}

export function menuProductFixture(product: MenuProduct): MenuDetailResponse {
  const warnings = product.recipe === null
    ? [{ code: 'RECIPE_NOT_AVAILABLE', message: 'Không có công thức hiệu lực tại ngày đọc.', details: { impact: 'Không có công thức hiệu lực tại ngày đọc' } }]
    : product.recipe.ingredients.length === 0
      ? [{ code: 'EMPTY_RECIPE', message: 'Công thức hiện hành chưa có nguyên liệu.', details: {} }]
      : []
  return { data: product, meta: { ...menuFixtureMeta, warnings }, error: null }
}
