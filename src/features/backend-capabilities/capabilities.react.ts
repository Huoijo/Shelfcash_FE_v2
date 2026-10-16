import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { AuthContextValue } from '../auth/auth.context'
import { CurrentStore } from '../store/store.context'
import { config } from '../../app/config'
import { createBackendCapabilitiesApi } from './capabilities.data'
import type { CapabilityCallOptions, CapabilityInput, CapabilityOutput } from './capabilities.data'
import { createCapabilityMutationState } from './capabilities.state'
import type { CapabilityReadOperation, CapabilityWriteOperation } from './capabilities.wire'

export const capabilitiesApi = createBackendCapabilitiesApi(config.apiBaseUrl)
export const capabilityError = (error: unknown) => error instanceof Error ? error.message : 'Chưa thể hoàn tất yêu cầu. Vui lòng kiểm tra lại.'

export function useCapabilityQuery<K extends CapabilityReadOperation>(operation: K, input: CapabilityInput<K>, enabled = true, options: Omit<CapabilityCallOptions, 'signal'> = {}) {
  const key = JSON.stringify([operation, input, options]), [attempt, setAttempt] = useState(0)
  const [resource, setResource] = useState<{ key: string; attempt: number; result?: CapabilityOutput<K>; error?: unknown }>({ key: '', attempt: -1 })
  useEffect(() => {
    if (!enabled || config.mockPreview) return
    const controller = new AbortController()
    const [, captured, fence] = JSON.parse(key) as [K, CapabilityInput<K>, CapabilityCallOptions]
    void capabilitiesApi.call(operation, captured, { ...fence, signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setResource({ key, attempt, result })
    }).catch(error => { if (!controller.signal.aborted) setResource({ key, attempt, error }) })
    return () => controller.abort()
  }, [key, operation, attempt, enabled])
  const current = resource.key === key && resource.attempt === attempt ? resource : undefined
  return { result: current?.result, error: current?.error, loading: enabled && !config.mockPreview && !current, retry: () => setAttempt(a => a + 1) }
}

// Preserve unresolved intent across in-app route changes; secrets remain memory-only.
const retainedWrites = new Map<string, ReturnType<typeof createCapabilityMutationState<CapabilityWriteOperation>>>()
let retainedActor: string | null = null
function retainedMutation<K extends CapabilityWriteOperation>(operation: K, scope: string, actor: string) {
    if (retainedActor !== actor) { for (const write of retainedWrites.values()) write.dispose(); retainedWrites.clear(); retainedActor = actor }
    const previous = retainedWrites.get(scope)
    if (previous && ['idle', 'pending', 'unknown'].includes(previous.getState().status)) return previous as ReturnType<typeof createCapabilityMutationState<K>>
    const write = createCapabilityMutationState(capabilitiesApi, operation)
    retainedWrites.set(scope, write as ReturnType<typeof createCapabilityMutationState<CapabilityWriteOperation>>)
    return write
}
/** Scope the mounted caller by actor/Store/resource; no mutation retries or key creation occur implicitly. */
export function useCapabilityMutation<K extends CapabilityWriteOperation>(operation: K, resourceScope?: string) {
  const auth = useContext(AuthContextValue), store = useContext(CurrentStore), location = useLocation()
  const actor = auth?.state.status === 'authenticated' ? auth.state.context.user.user_id : 'public'
  const scope = JSON.stringify([actor, operation === 'NF03' ? null : store?.currentStoreId ?? null, operation, resourceScope ?? location.pathname])
  const controller = useMemo(() => {
    return retainedMutation(operation, scope, actor)
  }, [operation, scope, actor])
  const [, render] = useState(0), [inputError, setInputError] = useState<unknown>(null), mounted = useRef(true)
  useEffect(() => controller.subscribe(() => render(v => v + 1)), [controller])
  // Do not dispose a write during StrictMode's effect rehearsal or imply cancellation on unmount.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [controller])
  const perform = async (task: () => Promise<CapabilityOutput<K>>) => {
    if (config.mockPreview) { setInputError(new Error('Bản minh họa không gửi yêu cầu tới Backend.')); return }
    setInputError(null)
    try { const pending = task(); render(v => v + 1); const result = await pending; return mounted.current ? result : undefined }
    catch (error) { if (mounted.current) setInputError(error); return undefined }
    finally { if (mounted.current) render(v => v + 1) }
  }
  const state = controller.getState(), busy = state.status === 'pending', uncertain = state.status === 'unknown'
  const registerChangeGuard = store?.registerChangeGuard
  useEffect(() => registerChangeGuard?.(() => !busy && !uncertain), [registerChangeGuard, busy, uncertain])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (busy || uncertain) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy, uncertain])
  return { state, busy, uncertain, locked: busy || uncertain, error: inputError ?? (state.status === 'rejected' || state.status === 'unknown' ? state.error : null), result: state.status === 'succeeded' ? state.result : undefined,
    observeDecline: (offer: CapabilityOutput<'N18'>) => controller.observeDecline(offer),
    send: (input: CapabilityInput<K>) => perform(() => controller.send(input)), replay: () => perform(() => controller.replayExact()) }
}
