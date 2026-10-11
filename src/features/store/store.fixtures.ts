import { mockImportStoreId } from '../import-data/importData.fixtures'
import { HttpError } from '../../shared/http/httpClient'
import type { StoreContext, StoreDataSource } from './store.types'

export const MOCK_STORE_IDS = { first: mockImportStoreId, second: 'f17e0000-0000-4000-8000-000000000002' } as const
const firstPermissions = [
  'ingredient.read', 'inventory.read', 'menu.read', 'mapping.propose', 'import.commit',
  'inventory.count.correct', 'sales.record', 'sales.correct', 'sales.merge', 'product.create',
  'ingredient.create', 'recipe.create_version', 'supplier.create', 'supplier.terms.create',
  'supplier.terms.correct', 'supplier.fees.manage', 'budget.read', 'budget.update', 'procurement.cost.read',
  'planning.context.read', 'planning.run', 'planning.result.read',
]
export function mockStoreContext(storeId: string = MOCK_STORE_IDS.first): StoreContext {
  const second = storeId === MOCK_STORE_IDS.second
  if (!second && storeId !== MOCK_STORE_IDS.first) throw new HttpError('contract', 'Cửa hàng không thuộc fixture DEV.', 404)
  const memberId = second ? 'f17e0000-0000-4000-8000-000000000012' : 'f17e0000-0000-4000-8000-000000000011'
  const role = second ? 'STAFF' : 'OWNER'
  return {
    store_id: storeId, name: second ? 'Cửa hàng B · DEV/QA' : 'Cửa hàng A · DEV/QA',
    timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role, membership_id: memberId,
    authorization_version: second ? 'mock-store-b-1' : 'mock-store-a-1', active: true,
    server_now: '2026-10-11T03:00:00Z', as_of_date: '2026-10-11',
    membership: { membership_id: memberId, role,
      authorization_version: second ? 'mock-store-b-1' : 'mock-store-a-1',
      effective_permissions: second ? ['ingredient.read', 'inventory.read', 'menu.read'] : [...firstPermissions] },
    permission_catalog_version: 'permissions-v2',
  }
}

/** Explicit local fixture, never called after an API error and never authenticates. */
export function createMockStoreDataSource(): StoreDataSource {
  return {
    async list(signal, cursor) {
      signal?.throwIfAborted()
      if (cursor !== undefined) throw new Error('Fixture DEV không có trang tiếp theo.')
      const items = [MOCK_STORE_IDS.first, MOCK_STORE_IDS.second].map((id) => {
        const { store_id, name, timezone, currency, role, membership_id, authorization_version } = mockStoreContext(id)
        return { store_id, name, timezone, currency, role, membership_id, authorization_version }
      })
      return { items, pagination: { limit: 50, next_cursor: null, total_count: 2 } }
    },
    async read(id, signal) { signal?.throwIfAborted(); return mockStoreContext(id) },
  }
}
