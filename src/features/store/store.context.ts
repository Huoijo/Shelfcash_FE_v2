import { createContext, useContext } from 'react'
import type { Pagination } from '../../shared/http/http.types'
import type { StoreContext, StoreSummary } from './store.types'

export type StoreState =
  | { status: 'loading' }
  | { status: 'ready'; store: StoreContext }
  | { status: 'mock_preview'; store: StoreContext }
  | { status: 'selecting'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string }
export type StoreChangeGuard = () => boolean | Promise<boolean>
export type StoreValue = {
  state: StoreState
  currentStoreId: string | null
  timezone: string | null
  accessibleStores: StoreSummary[]
  pagination: Pagination | null
  hasMore: boolean
  listBusy: boolean
  listError: string | null
  retry: () => void
  loadMore: () => Promise<void>
  selectStore: (storeId: string) => Promise<boolean>
  refresh: () => Promise<void>
  registerChangeGuard: (guard: StoreChangeGuard) => () => void
}
export const CurrentStore = createContext<StoreValue | null>(null)

export function useCurrentStore(): StoreValue {
  const value = useContext(CurrentStore)
  if (!value) throw new Error('StoreProvider is required.')
  return value
}
