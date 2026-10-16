import { useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AuthContextValue } from '../../auth/auth.context'
import { CurrentStore } from '../../store/store.context'
import { capabilitiesApi } from '../../backend-capabilities/capabilities.react'
import { createIndexedDbRecoveryJournal } from '../../backend-capabilities/recovery.journal'
import { config } from '../../../app/config'
import { PlanningAssistant } from '../planning.assistant'
import { assistantRights, type PlanningAuthority } from '../planning.intent'
import type { PlanningRun } from '../planning.types'
import { PlanningAssistantDrawer } from './PlanningAssistantDrawer'

export function PlanningAssistantWorkspace({ run, optionId, onRefreshContext, onAccessDenied, children }: {
  run: PlanningRun; optionId: string | null; onRefreshContext: () => Promise<PlanningRun>; onAccessDenied?: () => void
  children: (entry: ReactNode, why: ReactNode) => ReactNode
}) {
  const auth = useContext(AuthContextValue), store = useContext(CurrentStore)
  const session = auth?.state.status === 'authenticated' ? auth.state.context : null
  const scope = session && store?.currentStoreId ? { actor_user_id: session.user.user_id, store_id: store.currentStoreId, sessionIdentity: session.session.absolute_expires_at } : null
  const authority: PlanningAuthority | null = scope && store?.state.status === 'ready' && scope.store_id === run.store_id ? { scope, permissions: store.state.store.membership.effective_permissions } : null
  const authorized = !!authority && assistantRights.every(p => authority.permissions.includes(p)) && !config.mockPreview
  const latest = useRef(authority); latest.current = authority
  const key = JSON.stringify([scope, run.run_id, run.response_version, optionId])
  const [open, setOpen] = useState(false), [question, setQuestion] = useState('')
  const [contextStatus, setContextStatus] = useState<'current' | 'refreshing' | 'restored'>('current'), [revision, setRevision] = useState(0)
  const owner = useMemo(() => scope && !config.mockPreview ? new PlanningAssistant(capabilitiesApi, createIndexedDbRecoveryJournal(), run.run_id, run.response_version, scope, () => latest.current) : null,
    // The complete identity/version pin creates a fresh owner; journals remain intact.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, revision])
  const lease = useRef<object | null>(null), activeOwner = useRef(owner); activeOwner.current = owner
  useEffect(() => {
    if (!owner) return
    const token = {}; lease.current = token
    void owner.restore().catch(() => {})
    return () => { queueMicrotask(() => { if (activeOwner.current !== owner || lease.current === token) owner.dispose() }) }
  }, [owner])
  const permissionsKey = authority?.permissions.join('|')
  useEffect(() => { owner?.revalidateAuthority() }, [owner, authorized, permissionsKey])
  // Render subscriptions include journal restoring/blocked/unknown, not only the shared phase.
  const emptySubscribe = () => () => {}, empty = () => null
  const state = useSyncExternalStore(owner?.subscribe ?? emptySubscribe, owner?.getSnapshot ?? empty)
  useEffect(() => { if (state?.phase === 'permission') onAccessDenied?.() }, [state?.phase, onAccessDenied])
  const chatIntent = useSyncExternalStore(owner?.chatIntent.subscribe ?? emptySubscribe, owner?.chatIntent.getSnapshot ?? empty)
  const summaryIntent = useSyncExternalStore(owner?.summaryIntent.subscribe ?? emptySubscribe, owner?.summaryIntent.getSnapshot ?? empty)
  const entry = useRef<HTMLButtonElement>(null), opener = useRef<HTMLElement | null>(null), mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const close = () => { setOpen(false); requestAnimationFrame(() => (opener.current?.isConnected ? opener.current : entry.current)?.focus()) }
  const reveal = (target: HTMLElement, draft?: string) => { opener.current = target; if (draft) setQuestion(draft); setOpen(true) }
  const perform = (task: () => Promise<unknown>) => { void task().catch(() => { /* typed state owns errors and uncertainty */ }) }
  const refresh = async () => {
    if (contextStatus === 'refreshing' || !authorized) return
    setContextStatus('refreshing')
    try {
      const fresh = await onRefreshContext()
      if (!mounted.current || fresh.run_id !== run.run_id || fresh.store_id !== run.store_id || !latest.current || !assistantRights.every(p => latest.current!.permissions.includes(p))) return
      setRevision(n => n + 1); setContextStatus('restored')
    } catch { if (mounted.current) setContextStatus('current') }
  }
  const locked = !!state?.requestPending || chatIntent?.status === 'unknown' || summaryIntent?.status === 'unknown'
  const guard = store?.registerChangeGuard
  useEffect(() => guard?.(() => !locked), [guard, locked])
  // No synthetic mutations in mock preview. Existing parked behavior stays scoped to that mode.
  const action = <button ref={entry} type="button" className="sc-copilot-entry" aria-expanded={open} disabled={!owner} onClick={e => reveal(e.currentTarget)}><span className="sc-copilot-mark" aria-hidden="true">✦</span> Hỏi ShelfCash</button>
  const why = <button type="button" className="sc-copilot-contextual-inline" disabled={!owner || !authorized || locked || chatIntent?.status === 'restoring' || summaryIntent?.status === 'restoring' || state?.phase === 'stale'} onClick={e => { const q = 'Cho tôi xem bằng chứng'; reveal(e.currentTarget, q); if (owner) perform(() => owner.ask(q, optionId ? { option_id: optionId } : {})) }}>Vì sao?</button>
  return <div className={`sc-copilot-workspace${open ? ' is-open' : ''}`}>{children(action, why)}
    {open && owner && state && chatIntent && summaryIntent && <PlanningAssistantDrawer key={key + revision} run={run} optionId={optionId} state={state} chatIntent={chatIntent} summaryIntent={summaryIntent} authorized={authorized} contextStatus={contextStatus} question={question}
      onAsk={q => { setQuestion(q); perform(() => owner.ask(q, optionId ? { option_id: optionId } : {})) }} onCandidate={(kind, id) => perform(() => owner.selectCandidate(kind, id))}
      onGenerate={presentation => perform(async () => { owner.setPresentation({ ...presentation, option_id: optionId }); await owner.generateSummary() })}
      onReadSummary={() => perform(owner.refreshSummary)} onRecoverSummary={() => perform(summaryIntent.receiptIds?.generation_id ? owner.refreshSummary : owner.replaySummary)}
      onRefreshContext={() => { void refresh() }} onClose={close} onNavigate={close}/>}</div>
}
