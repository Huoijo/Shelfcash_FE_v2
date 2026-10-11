import { createContext, useContext } from 'react'
import type { StoreContext } from './store.types'

export type StoreState =
  | { status: 'loading' }
  | { status: 'ready'; store: StoreContext }
  | { status: 'mock_preview' }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string }
export type StoreValue = { state: StoreState; currentStoreId: string | null; timezone: string | null; retry: () => void }
export const CurrentStore = createContext<StoreValue | null>(null)

export function useCurrentStore(): StoreValue {
  const value = useContext(CurrentStore)
  if (!value) throw new Error('StoreProvider is required.')
  return value
}
