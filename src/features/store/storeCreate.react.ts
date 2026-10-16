import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/auth.context'
import { createAuthDataSource } from '../auth/auth.data'
import { useCurrentStore } from './store.context'
import { config } from '../../app/config'
import { HttpError, requestJson } from '../../shared/http/httpClient'
import { capabilityOperations, capabilitySchemas } from '../backend-capabilities/capabilities.wire'
import { matchesCapabilitySchema } from '../backend-capabilities/capabilities.validation'
import type { CapabilityOutput } from '../backend-capabilities/capabilities.data'
import { lockStoreCreate, readStoreCreate, reserveStoreCreate, settleStoreCreate } from './storeCreate.journal'
import type { StoreCreateIntent, StoreCreateRecord } from './storeCreate.journal'

type State = { status: 'loading' | 'idle' | 'pending' | 'unknown' | 'failed' | 'rejected' | 'succeeded'; intent?: StoreCreateRecord; error?: unknown; result?: CapabilityOutput<'T03'> }
const source = createAuthDataSource(config.apiBaseUrl)
// T03 only. Other mutation controllers remain memory-only.
export function useStoreCreationMutation() {
  const auth = useAuth(), { registerChangeGuard } = useCurrentStore()
  const actor = auth.state.status === 'authenticated' ? auth.state.context.user.user_id : null
  const currentActor = useRef(actor)
  useLayoutEffect(() => { currentActor.current = actor; return () => { currentActor.current = null } }, [actor])
  const [snapshot, setSnapshot] = useState<{ actor: string | null; state: State }>({ actor: null, state: { status: 'loading' } })
  const working = useRef(false), channel = useRef<BroadcastChannel | null>(null)
  const state: State = snapshot.actor === actor ? snapshot.state : { status: 'loading' }
  const update = useCallback((owner: string, next: State) => { if (currentActor.current === owner) setSnapshot({ actor: owner, state: next }) }, [])
  const restore = useCallback(async () => {
    if (!actor || working.current || config.mockPreview) return
    try {
      if (!navigator.locks) throw new Error('Không lưu được yêu cầu an toàn: trình duyệt chưa hỗ trợ phối hợp giữa các tab.')
      const record = await readStoreCreate(actor)
      if (record && record.state !== 'rejected') {
        setSnapshot(old => currentActor.current !== actor ? old : old.actor === actor && old.state.status === 'succeeded' && old.state.intent?.input.key === record.input.key ? old : { actor, state: { status: 'unknown', intent: record } })
      } else update(actor, { status: 'idle' })
    } catch (error) { update(actor, { status: 'failed', error }) }
  }, [actor, update])
  useEffect(() => {
    void restore()
    const onFocus = () => { void restore() }
    window.addEventListener('focus', onFocus)
    const signal = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('shelfcash:T03')
    channel.current = signal
    if (signal) signal.onmessage = event => { if (event.data === actor) void restore() }
    return () => { window.removeEventListener('focus', onFocus); signal?.close(); if (channel.current === signal) channel.current = null }
  }, [actor, restore])
  const execute = async (input?: StoreCreateIntent) => {
    if (!actor || currentActor.current !== actor || working.current || config.mockPreview) return
    working.current = true
    update(actor, { ...state, status: 'pending', error: undefined })
    let record: StoreCreateRecord | undefined, dispatched = false
    const replay = !input
    try {
      await lockStoreCreate(actor, async () => {
        const existing = await readStoreCreate(actor)
        if (input && existing && existing.state !== 'rejected') throw new Error('Yêu cầu trước chưa được đối soát; không gửi ý định mới.')
        record = input ? await reserveStoreCreate(actor, input) : existing ?? undefined
        if (!record || record.state === 'rejected') throw new Error('Không có yêu cầu đã lưu để kiểm tra.')
        channel.current?.postMessage(actor)
        // Fresh A03 + its CSRF binds the subsequent POST to the current cookie session.
        const session = await source.readSession()
        if (currentActor.current !== actor || session.user.user_id !== actor) {
          void auth.refresh()
          throw new Error('Tài khoản hoặc phiên đăng nhập đã thay đổi. Chưa gửi lại yêu cầu.')
        }
        const intent = record
        dispatched = true
        const response = await requestJson(config.apiBaseUrl, '/api/v1/stores', {
          method: 'POST', body: intent.input.body, headers: { 'Idempotency-Key': intent.input.key },
          getCsrfToken: () => session.session.csrf_token, expectedStatuses: [201],
        })
        if (!matchesCapabilitySchema(capabilityOperations.T03.response, response, capabilitySchemas)) throw new Error('Chưa xác nhận được biên nhận tạo cửa hàng.')
        const result = response as CapabilityOutput<'T03'>
        if (result.data.role !== 'OWNER' || ['name','timezone','currency'].some(k => result.data[k as keyof typeof result.data] !== intent.input.body[k as keyof typeof intent.input.body])) throw new Error('Biên nhận không khớp yêu cầu tạo cửa hàng.')
        await settleStoreCreate(intent, 'confirmed', result.data.store_id)
        update(actor, { status: 'succeeded', intent, result })
      })
    } catch (error) {
      if (record && dispatched) {
        const rejected = !replay && error instanceof HttpError && error.kind === 'contract' && error.status !== undefined && error.status >= 400 && error.status < 500 && ![408,499].includes(error.status)
        try { await settleStoreCreate(record, rejected ? 'rejected' : 'unknown') } catch { /* Durable pending slot remains a fence when settlement fails. */ }
      }
      try {
        const retained = await readStoreCreate(actor)
        update(actor, retained && retained.state !== 'rejected' ? { status: 'unknown', intent: retained, error } : { status: retained?.state === 'rejected' ? 'rejected' : 'failed', error })
      } catch { update(actor, { status: 'failed', error }) }
    } finally { working.current = false; channel.current?.postMessage(actor) }
  }
  const busy = state.status === 'loading' || state.status === 'pending', uncertain = state.status === 'unknown'
  // Failed storage/coordination stays closed; reload may re-establish storage availability.
  const locked = busy || uncertain || state.status === 'failed'
  useEffect(() => registerChangeGuard(() => !locked), [registerChangeGuard, locked])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (busy || uncertain) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn)
  }, [busy, uncertain])
  return { busy, uncertain, locked, result: state.result, error: state.error, intent: state.intent?.input,
    send: (input: StoreCreateIntent) => execute(input), replay: () => execute() }
}
