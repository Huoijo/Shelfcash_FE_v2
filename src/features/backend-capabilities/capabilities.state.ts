import { CsrfTokenUnavailableError, HttpError } from '../../shared/http/httpClient'
import { CapabilityInputError, captureCapabilityInput } from './capabilities.data'
import type { CapabilityApi, CapabilityCallOptions, CapabilityInput, CapabilityOutput } from './capabilities.data'
import { capabilityOperations } from './capabilities.wire'
import type { CapabilityReadOperation, CapabilityWriteOperation } from './capabilities.wire'

export type ReadState<T> = { status: 'idle' } | { status: 'loading'; scope: string } | { status: 'ready'; scope: string; result: T } | { status: 'failed'; scope: string; error: unknown }
export type MutationState<T> = { status: 'idle' | 'pending' | 'disposed' | 'reconciled' } | { status: 'succeeded'; result: T } | { status: 'rejected' | 'unknown'; error: unknown }

/** One scoped resource. Scope must include actor/session identity and Store where applicable. */
export function createCapabilityReadState<K extends CapabilityReadOperation>(api: CapabilityApi, operation: K) {
  if (capabilityOperations[operation].method !== 'GET') throw new Error('Read state requires a read operation.')
  let current: ReadState<CapabilityOutput<K>> = { status: 'idle' }
  let controller: AbortController | undefined, generation = 0
  return {
    getState: (): ReadState<CapabilityOutput<K>> => current.status === 'ready' ? { ...current, result: structuredClone(current.result) } : { ...current },
    clear() { generation++; controller?.abort(); controller = undefined; current = { status: 'idle' } },
    async load(input: CapabilityInput<K>, scope: string, options: Omit<CapabilityCallOptions, 'signal'> = {}) {
      if (!scope.trim()) throw new Error('A nonempty actor/session/resource scope is required.')
      const captured = captureCapabilityInput(operation, input), fence = structuredClone(options)
      const run = ++generation
      controller?.abort(); controller = new AbortController()
      const signal = controller.signal
      current = { status: 'loading', scope }
      try {
        const result = await api.call(operation, captured, { ...fence, signal })
        if (generation !== run || signal.aborted) throw new DOMException('Resource scope changed.', 'AbortError')
        current = { status: 'ready', scope, result: structuredClone(result) }
        return result
      } catch (error) {
        if (generation === run && !signal.aborted) current = { status: 'failed', scope, error }
        throw error
      }
    },
  }
}

function definitelyRejected(error: unknown, operation: CapabilityWriteOperation): boolean {
  if (['A02', 'A06', 'A07'].includes(operation) && error instanceof HttpError && error.kind === 'contract' && error.problem?.code === 'EMAIL_DELIVERY_UNAVAILABLE' && error.status === 503) return true
  return error instanceof CapabilityInputError || error instanceof CsrfTokenUnavailableError ||
    (error instanceof HttpError && error.kind === 'contract' && error.status !== undefined && error.status >= 400 && error.status < 500 && ![408, 499].includes(error.status))
}

/** Memory-only, one logical intent. No optimistic domain changes, auto retry, polling or persistence. */
export function createCapabilityMutationState<K extends CapabilityWriteOperation>(api: CapabilityApi, operation: K) {
  const definition = capabilityOperations[operation]
  if (definition.method === 'GET') throw new Error('Mutation state requires a write operation.')
  let current: MutationState<CapabilityOutput<K>> = { status: 'idle' }
  let captured: CapabilityInput<K> | undefined, disposed = false, declineReadPending = false
  const listeners = new Set<() => void>()
  const notify = () => { for (const listener of listeners) listener() }
  async function execute(): Promise<CapabilityOutput<K>> {
    const wasUnknown = current.status === 'unknown'
    current = { status: 'pending' }; notify()
    try {
      const result = await api.call(operation, captured!)
      if (!disposed) { current = { status: 'succeeded', result: structuredClone(result) }; captured = undefined; notify() }
      return result
    } catch (error) {
      if (!disposed) {
        // A replay denial (e.g. revoked rights) does not disprove the original unknown write.
        const rejected = !wasUnknown && definitelyRejected(error, operation)
        current = { status: rejected ? 'rejected' : 'unknown', error }
        if (rejected) captured = undefined
        notify()
      }
      throw error
    }
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    getState: (): MutationState<CapabilityOutput<K>> => current.status === 'succeeded' ? { ...current, result: structuredClone(current.result) } : { ...current },
    async send(input: CapabilityInput<K>) {
      if (disposed || current.status === 'pending' || current.status === 'unknown') throw new Error('Competing intent is blocked until the current outcome is known.')
      declineReadPending = false
      captured = captureCapabilityInput(operation, input)
      return execute()
    },
    async replayExact() {
      // Upload recovery remains readback-only. Public email/credential operations have no replay key.
      if (disposed || current.status !== 'unknown' || !captured || !definition.key || operation === 'I02') throw new Error('This operation/outcome does not support exact replay here; use its authoritative recovery reader.')
      if (operation === 'IN01' && !declineReadPending) throw new Error('Read the invitation before replaying decline.')
      declineReadPending = false
      return execute()
    },
    observeDecline(offer: CapabilityOutput<'N18'>) {
      if (operation !== 'IN01' || current.status !== 'unknown' || !captured || !('path' in captured) || !captured.path || !('invitation_id' in captured.path) || captured.path.invitation_id !== offer.data.invitation.invitation_id) throw new Error('Invitation readback does not match the unresolved decline.')
      const invitation = offer.data.invitation
      declineReadPending = invitation.status === 'pending' && offer.data.can_decline
      if (invitation.status === 'declined' && invitation.declined_at) { captured = undefined; current = {status:'reconciled'}; notify() }
    },
    dispose() {
      // Do not cancel a write or imply it did not apply. Forget secret intent on session/Store teardown.
      disposed = true; captured = undefined; current = { status: 'disposed' }; notify(); listeners.clear()
    },
  }
}
