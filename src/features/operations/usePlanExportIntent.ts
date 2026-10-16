import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContextValue } from '../auth/auth.context'
import { CurrentStore } from '../store/store.context'
import { config } from '../../app/config'
import { capabilitiesApi } from '../backend-capabilities/capabilities.react'
import { createIndexedDbRecoveryJournal } from '../backend-capabilities/recovery.journal'
import { PlanningIntentController } from '../decision-planning/planning.intent'
import type { PlanningAuthority } from '../decision-planning/planning.intent'
import type { WireExportRequest } from './operations.wire'

// Lazy journal factory; no browser storage or network access in mock/SSR rendering.
export function usePlanExportIntent(runId: string) {
  const auth = useContext(AuthContextValue), store = useContext(CurrentStore)
  const authenticated = auth?.state.status === 'authenticated' ? auth.state.context : null
  const scope = authenticated && store?.currentStoreId ? {
    actor_user_id: authenticated.user.user_id, store_id: store.currentStoreId,
    // Stable non-secret session lifetime fence; fresh cookie/CSRF stays in centralized HTTP.
    sessionIdentity: authenticated.session.absolute_expires_at,
  } : null
  const authority: PlanningAuthority | null = scope && store?.state.status === 'ready'
    ? { scope, permissions: store.state.store.membership.effective_permissions } : null
  const latest = useRef(authority); latest.current = authority
  const scopeKey = JSON.stringify(scope)
  const controller = useMemo(() => {
    if (config.mockPreview || !scope) return null
    return new PlanningIntentController(capabilitiesApi, createIndexedDbRecoveryJournal(), 'N10', runId, scope, () => latest.current)
    // scopeKey includes the entire non-secret identity fence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, scopeKey])
  const [, render] = useState(0), [inputError, setInputError] = useState<unknown>(null)
  useEffect(() => {
    latest.current = authority
    if (!controller) return
    const unsubscribe = controller.subscribe(() => render(n => n + 1))
    void controller.restore()
    return () => { latest.current = null; unsubscribe() }
    // Authorization is synchronously refreshed on every render; identity creates a new controller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller])
  const state = controller?.getSnapshot()
  const busy = !config.mockPreview && (!state || state.status === 'pending' || state.status === 'restoring')
  const uncertain = state?.status === 'unknown'
  const blocked = state?.status === 'blocked'
  const registerChangeGuard = store?.registerChangeGuard
  useEffect(() => registerChangeGuard?.(() => !busy && !uncertain), [registerChangeGuard, busy, uncertain])
  const perform = async (task: () => Promise<unknown>) => {
    setInputError(null)
    try { await task() } catch (error) { setInputError(error) }
  }
  return {
    busy, uncertain, locked: busy || uncertain || blocked, result: state?.result ?? null, receiptIds: state?.receiptIds, originalBody: controller?.getOriginalInput()?.body,
    failure: inputError ?? state?.error ?? null,
    send: (body: WireExportRequest) => perform(async () => {
      if (!controller) throw new Error('Cần phiên đăng nhập và cửa hàng hiện hành.')
      return controller.send({ path: { plan_id: runId }, body, key: crypto.randomUUID() })
    }),
    retry: () => perform(async () => { if (!controller) throw new Error('Không có intent cần khôi phục.'); return controller.replay() }),
    reset: () => { setInputError(null); return controller?.reset() ?? false },
  }
}
