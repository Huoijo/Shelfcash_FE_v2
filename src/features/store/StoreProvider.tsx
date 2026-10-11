import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { config } from '../../app/config'
import { useAuth } from '../auth/auth.context'
import { SessionFeedback } from '../auth/AuthGuard'
import { SessionActions } from '../auth/SessionActions'
import { createStoreDataSource } from './store.data'
import { createMockStoreDataSource, MOCK_STORE_IDS } from './store.fixtures'
import { CurrentStore, useCurrentStore } from './store.context'
import { StoreWorkflow, type StoreOwner } from './store.workflow'

// Only shared request scope lives here, never business data or permanent session Store.
export function StoreProvider({ children }: { children: ReactNode }) {
  const { state: auth } = useAuth()
  const owner: StoreOwner = auth.status === 'authenticated' ? auth.context
    : auth.status === 'mock_preview' && config.mockPreview ? 'mock' : null
  const [workflow] = useState(() => new StoreWorkflow(
    config.mockPreview ? createMockStoreDataSource() : createStoreDataSource(config.apiBaseUrl),
    config.mockPreview ? { mockDefaultStoreId: MOCK_STORE_IDS.first } : {},
  ))
  const snapshot = useSyncExternalStore(workflow.subscribe, workflow.getSnapshot, workflow.getSnapshot)
  useEffect(() => {
    void workflow.activate(owner)
    return () => workflow.cancel()
  }, [owner, workflow])

  // Hide every old actor's Store synchronously, before the owner-change effect.
  const owned = snapshot.owner === owner
  const state = owned ? snapshot.state : owner ? { status: 'loading' as const }
    : { status: 'unavailable' as const, message: 'Chưa có phiên đăng nhập hợp lệ.' }
  const store = state.status === 'ready' || state.status === 'mock_preview' ? state.store : null
  const pagination = owned ? snapshot.pagination : null
  return <CurrentStore.Provider value={{
    state, currentStoreId: store?.store_id ?? null, timezone: store?.timezone ?? null,
    accessibleStores: owned ? snapshot.accessibleStores : [], pagination,
    hasMore: Boolean(pagination?.next_cursor), listBusy: owned ? snapshot.listBusy : false,
    listError: owned ? snapshot.listError : null, retry: workflow.retry,
    loadMore: workflow.loadMore, selectStore: workflow.selectStore, refresh: workflow.refresh,
    registerChangeGuard: workflow.registerChangeGuard,
  }}>{children}</CurrentStore.Provider>
}

export function StoreGate({ children }: { children: ReactNode }) {
  const { state, retry } = useCurrentStore()
  const { refresh } = useAuth()
  if (state.status === 'mock_preview' && state.store.store_id !== MOCK_STORE_IDS.first) return <div>
    <SessionFeedback title="Chưa có dữ liệu minh họa cho cửa hàng B" message="DEV/QA chỉ minh họa chuyển Store và quyền Staff tại Cửa hàng. Không hiển thị dữ liệu fixture của cửa hàng A dưới cửa hàng B." />
    <Link to="/store">Mở Cửa hàng để chọn lại</Link>
  </div>
  if (state.status === 'ready' || state.status === 'mock_preview') return children
  if (state.status === 'loading') return <SessionFeedback title="Đang tải cửa hàng và quyền truy cập…" />
  if (state.status === 'selecting' || state.status === 'empty') return <div>
    <SessionFeedback title={state.status === 'empty' ? 'Chưa có cửa hàng' : 'Chọn cửa hàng'} message={state.message} />
    <Link to="/store">Mở Cửa hàng</Link>
  </div>
  return <div>
    <SessionFeedback title="Chưa mở được cửa hàng" message={state.message} onRetry={state.status === 'error' ? retry : () => { void refresh() }} />
    <div className="store-session-actions"><SessionActions /></div>
  </div>
}
