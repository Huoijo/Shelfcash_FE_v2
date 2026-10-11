import type { Pagination } from '../../shared/http/http.types'

export type StoreRole = 'OWNER' | 'STAFF'
export type StoreSummary = {
  store_id: string
  name: string
  timezone: string
  currency: string
  role: StoreRole
  membership_id: string
  authorization_version: string
}
export type StoreContext = StoreSummary & {
  active: true
  server_now: string
  as_of_date: string
  membership: {
    membership_id: string
    role: StoreRole
    authorization_version: string
    effective_permissions: string[]
  }
  permission_catalog_version: string
}
export type StoreList = { items: StoreSummary[]; pagination: Pagination }
export type StoreDataSource = {
  list(signal?: AbortSignal, cursor?: string): Promise<StoreList>
  read(storeId: string, signal?: AbortSignal): Promise<StoreContext>
}
