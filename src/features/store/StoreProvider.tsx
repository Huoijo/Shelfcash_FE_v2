import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { config } from '../../app/config'
import { useAuth } from '../auth/auth.context'
import { SessionFeedback } from '../auth/AuthGuard'
import { SessionActions } from '../auth/SessionActions'
import { mockImportStoreId } from '../import-data/importData.fixtures'
import { createStoreDataSource } from './store.data'
import { CurrentStore, useCurrentStore, type StoreState } from './store.context'
import type { AuthContext } from '../auth/auth.types'
const source = createStoreDataSource(config.apiBaseUrl)

// Only shared request scope lives here, never business data or permanent session Store.
export function StoreProvider({ children }: { children: ReactNode }) {
  const { state: auth } = useAuth()
  const [attempt, setAttempt] = useState(0)
  const [resolved, setResolved] = useState<{ owner: AuthContext; attempt: number; state: StoreState } | null>(null)
  const owner = auth.status === 'authenticated' ? auth.context : null

  useEffect(() => {
    if (!owner || owner.accessible_store_count !== 1 || !owner.default_store_id) return
    const controller = new AbortController()
    source.read(owner.default_store_id, controller.signal).then((store) => {
      if (!controller.signal.aborted) setResolved({ owner, attempt, state: { status: 'ready', store } })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResolved({ owner, attempt, state: {
        status: 'error', message: error instanceof Error ? error.message : 'Không đọc được cửa hàng hoặc quyền hiện hành.',
      } })
    })
    return () => controller.abort()
  }, [owner, attempt])

  let state: StoreState
  if (auth.status === 'mock_preview') state = { status: 'mock_preview' }
  else if (!owner) state = { status: 'unavailable', message: 'Chưa có phiên đăng nhập hợp lệ.' }
  else if (owner.accessible_store_count === 0) state = { status: 'unavailable', message: 'Tài khoản chưa có cửa hàng đang hoạt động. Liên hệ hỗ trợ ShelfCash.' }
  else if (owner.accessible_store_count > 1) state = { status: 'unavailable', message: 'Tài khoản có nhiều cửa hàng. Màn hình chọn cửa hàng chưa được triển khai; chưa gửi yêu cầu nghiệp vụ.' }
  else state = resolved?.owner === owner && resolved.attempt === attempt ? resolved.state : { status: 'loading' }

  const currentStoreId = state.status === 'ready' ? state.store.store_id : state.status === 'mock_preview' ? mockImportStoreId : null
  const timezone = state.status === 'ready' ? state.store.timezone : null
  return <CurrentStore.Provider value={{ state, currentStoreId, timezone, retry: () => setAttempt((value) => value + 1) }}>{children}</CurrentStore.Provider>
}

export function StoreGate({ children }: { children: ReactNode }) {
  const { state, retry } = useCurrentStore()
  const { refresh } = useAuth()
  if (state.status === 'ready' || state.status === 'mock_preview') return children
  if (state.status === 'loading') return <SessionFeedback title="Đang tải cửa hàng và quyền truy cập…" />

  return <div>
    <SessionFeedback title="Chưa mở được cửa hàng" message={state.message} onRetry={state.status === 'error' ? retry : () => { void refresh() }} />
    <div className="store-session-actions">
      <SessionActions />
    </div>
  </div>
}
