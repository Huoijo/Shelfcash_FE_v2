import { HttpError } from '../../shared/http/httpClient'
import type { CapabilityApi, CapabilityInput, CapabilityOutput } from '../backend-capabilities/capabilities.data'
import type { RecoveryJournal, RecoveryScope } from '../backend-capabilities/recovery.journal'
import { PlanningIntentController, assistantRights, planningAccessFailure } from './planning.intent'
import type { PlanningAuthority } from './planning.intent'

type Chat = CapabilityOutput<'AS03'>['data']
type Summary = CapabilityOutput<'AS02'>['data']
type History = CapabilityInput<'AS03'>['body']['history']
type Presentation = Pick<CapabilityInput<'AS01'>['body'], 'option_id' | 'locale' | 'detail_level'>
export type AssistantState = {
  phase: 'idle' | 'sending' | 'answer' | 'clarification' | 'stale' | 'permission' | 'error' | 'uncertain'
  summary: Summary | null
  chat: Chat | null
  history: History
  error?: unknown
  requestPending?: boolean
  summaryContext?: 'current' | 'previous'
  summaryPolls: number
}

/** Scoped application state for the canonical Planning Assistant.
 * No fake thread, business recomputation, automatic POST/replay or persisted text. */
export class PlanningAssistant {
  private state: AssistantState = { phase: 'idle', summary: null, chat: null, history: [], summaryPolls: 0 }
  private listeners = new Set<() => void>()
  private epoch = 0
  private busy = false
  private controller?: AbortController
  private presentation: Presentation = { option_id: null, locale: 'vi', detail_level: 'simple' }
  readonly summaryIntent: PlanningIntentController<'AS01'>
  readonly chatIntent: PlanningIntentController<'AS03'>
  private api: CapabilityApi
  private runId: string
  private evidenceVersion: string
  private scope: RecoveryScope
  private authority: () => PlanningAuthority | null
  constructor(api: CapabilityApi, journal: RecoveryJournal, runId: string,
    evidenceVersion: string, scope: RecoveryScope, authority: () => PlanningAuthority | null) {
    this.api = api; this.runId = runId; this.evidenceVersion = evidenceVersion
    this.scope = { ...scope }; this.authority = authority
    this.summaryIntent = new PlanningIntentController(api, journal, 'AS01', runId, scope, authority)
    this.chatIntent = new PlanningIntentController(api, journal, 'AS03', runId, scope, authority)
  }
  getSnapshot = () => this.state
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
  private publish(patch: Partial<AssistantState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(fn => fn()) }
  private authorize() {
    const now = this.authority()
    if (!now || ['actor_user_id', 'store_id', 'sessionIdentity'].some(k => now.scope[k as keyof RecoveryScope] !== this.scope[k as keyof RecoveryScope]) || !assistantRights.every(p => now.permissions.includes(p))) {
      this.invalidate('permission'); throw new Error('Planning authority changed.')
    }
  }
  restore = async () => {
    this.authorize()
    await Promise.all([this.summaryIntent.restore(), this.chatIntent.restore()])
    this.authorize()
    if ([this.summaryIntent, this.chatIntent].some(i => i.getSnapshot().status === 'unknown')) this.publish({ phase: 'uncertain' })
  }
  private invalidate(phase: 'permission' | 'stale', error?: unknown) {
    this.epoch++; this.controller?.abort()
    this.publish({ phase, summary: null, chat: null, history: [], requestPending: false, summaryContext: undefined, error })
    this.summaryIntent.redact(error); this.chatIntent.redact(error)
  }
  setEvidenceVersion = (version: string) => { if (version !== this.evidenceVersion) this.invalidate('stale') }
  /** Retained conversations cannot silently migrate to a new aggregate. Construct a fresh instance after reconciliation. */
  setPresentation = (presentation: Presentation) => {
    if (this.busy || ['uncertain', 'stale', 'permission'].includes(this.state.phase) || this.state.summary?.status === 'running') throw new Error('Resolve original intent before changing presentation.')
    this.presentation = structuredClone(presentation)
    // B01: presentation configures NEXT work; keep the immutable terminal receipt/result.
    this.publish({ chat: null, history: [], phase: this.state.summary ? this.state.phase : 'idle' })
  }
  private async action(task: (signal: AbortSignal) => Promise<void>) {
    if (this.busy || ['stale', 'permission'].includes(this.state.phase)) throw new Error('Assistant is blocked in the current context.')
    this.authorize(); this.busy = true
    const epoch = this.epoch
    this.controller = new AbortController()
    this.publish({ phase: 'sending', requestPending: true, error: undefined })
    try { await task(this.controller.signal); this.authorize() }
    catch (error) {
      // Authority can change while a response is in flight without an HTTP denial.
      try { this.authorize() } catch { throw error }
      if (planningAccessFailure(error)) this.invalidate('permission', error)
      else if (error instanceof HttpError && error.problem?.code === 'EVIDENCE_VERSION_CONFLICT') this.invalidate('stale', error)
      else if (epoch === this.epoch) this.publish({ phase: [this.summaryIntent, this.chatIntent].some(i => i.getSnapshot().status === 'unknown') ? 'uncertain' : 'error', error })
      throw error
    } finally { this.busy = false; if (epoch === this.epoch) this.publish({ requestPending: false }) }
  }
  revalidateAuthority = () => { try { this.authorize() } catch { /* invalidation already redacts */ } }
  private acceptSummary(summary: Summary, signal: AbortSignal, polls = 0) {
    this.authorize(); if (signal.aborted) throw new Error('Obsolete Assistant response.')
    // B02: valid retained evidence remains inspectable, explicitly separate from current C03.
    const identity = summary.result?.identity
    const previous = identity && (identity.aggregate_digest !== this.evidenceVersion || identity.run_id !== this.runId || identity.store_id !== this.scope.store_id)
    this.publish({ summary, summaryPolls: polls, summaryContext: previous ? 'previous' : 'current', phase: summary.status === 'failed' ? 'error' : summary.status === 'running' ? 'sending' : 'answer' })
  }
  private options(signal: AbortSignal) { return { signal, assistantPin: { store_id: this.scope.store_id!, evidence_version: this.evidenceVersion } } }
  generateSummary = () => this.action(async signal => {
    if (this.state.summary?.status === 'running' || (!this.state.summary && this.summaryIntent.getSnapshot().receiptIds?.generation_id) || this.chatIntent.getSnapshot().status === 'unknown') throw new Error('Resolve the current generation/turn first.')
    const response = await this.summaryIntent.send({ path: { plan_id: this.runId }, key: crypto.randomUUID(), body: { ...this.presentation, expected_evidence_version: this.evidenceVersion } }, this.options(signal))
    this.acceptSummary(response.data, signal)
  })
  pollSummary = () => this.readSummary(false)
  refreshSummary = () => this.readSummary(true)
  private readSummary = (manual: boolean) => this.action(async signal => {
    const summary = this.state.summary
    const generationId = summary?.generation_id ?? this.summaryIntent.getSnapshot().receiptIds?.generation_id
    if (!generationId || (summary && summary.status !== 'running') || (!manual && this.state.summaryPolls >= 60)) throw new Error('Summary polling is not available.')
    const response = await this.api.assistant.readSummary({ path: { plan_id: this.runId, generation_id: generationId } }, { ...this.options(signal), assistantPin: { store_id: this.scope.store_id!, evidence_version: this.summaryIntent.retainedEvidenceVersion() ?? this.evidenceVersion } })
    this.acceptSummary(response.data, signal, manual ? 0 : this.state.summaryPolls + 1)
  })
  replaySummary = () => this.action(async signal => {
    const response = await this.summaryIntent.replay(this.options(signal))
    this.acceptSummary(response.data, signal)
  })
  private acceptChat(response: CapabilityOutput<'AS03'>, question: string, signal: AbortSignal) {
    this.authorize()
    if (signal.aborted) throw new Error('Obsolete Assistant response.')
    const chat = response.data
    // Keep complete recent messages within both wire limits. Never truncate an answer into a new fact.
    const history = [...this.state.history, { role: 'user' as const, content: question }, { role: 'assistant' as const, content: chat.answer }]
      .filter(m => [...m.content].length > 0 && [...m.content].length <= 2000)
    while (history.length > 6 || history.reduce((n, m) => n + [...m.content].length, 0) > 4000) history.shift()
    this.publish({ chat, history, phase: chat.kind === 'clarification' ? 'clarification' : 'answer' })
  }
  ask = (question: string, selection: { ingredient_id?: string | null; option_id?: string | null; product_id?: string | null } = {}) => this.action(async signal => {
    if (this.summaryIntent.getSnapshot().status === 'unknown') throw new Error('Resolve Summary uncertainty first.')
    const previous = this.state.chat
    const context = previous?.context ? structuredClone(previous.context) : selection.product_id !== undefined ? { run_id: this.runId, evidence_version: this.evidenceVersion } as NonNullable<Chat['context']> : undefined
    if (context && Object.hasOwn(selection, 'product_id')) context.product_id = selection.product_id
    if (context && Object.hasOwn(selection, 'option_id')) context.option_id = selection.option_id
    if (context && Object.hasOwn(selection, 'ingredient_id')) context.ingredient_id = selection.ingredient_id
    const response = await this.chatIntent.send({ path: { plan_id: this.runId }, key: crypto.randomUUID(), body: {
      ...this.presentation, expected_evidence_version: this.evidenceVersion, question,
      option_id: selection.option_id !== undefined ? selection.option_id : this.presentation.option_id,
      // Context is a hint, not an explicit entity binding. Let BE resolve a new
      // named entity or pronoun; only an actual candidate choice binds the ID.
      ingredient_id: selection.ingredient_id !== undefined ? selection.ingredient_id : null,
      history: structuredClone(this.state.history), ...(context ? { context } : {}),
    } }, this.options(signal))
    this.acceptChat(response, question, signal)
  })
  selectCandidate = (kind: 'ingredient' | 'option' | 'product', id: string) => {
    const clarification = this.state.chat?.clarification
    if (this.state.phase !== 'clarification' || !clarification) throw new Error('No clarification is pending.')
    const candidates = kind === 'ingredient' ? clarification.candidates.map(c => c.ingredient_id)
      : kind === 'option' ? clarification.option_candidates?.map(c => c.option_id) : clarification.product_candidates?.map(c => c.product_id)
    if (!candidates?.includes(id)) throw new Error('Candidate is not part of this retained clarification.')
    return this.ask(clarification.original_question, { [`${kind}_id`]: id })
  }
  replayChat = () => this.action(async signal => {
    const response = await this.chatIntent.replay(this.options(signal))
    // Original request text is not exposed by the journal. Do not fabricate a user history row on replay.
    this.authorize(); if (signal.aborted) throw new Error('Obsolete Assistant response.'); this.publish({ chat: response.data, phase: response.data.kind === 'clarification' ? 'clarification' : 'answer' })
  })
  dispose = () => { this.epoch++; this.controller?.abort(); this.summaryIntent.dispose(); this.chatIntent.dispose(); this.publish({ phase: 'idle', summary: null, chat: null, history: [] }); this.listeners.clear() }
}
