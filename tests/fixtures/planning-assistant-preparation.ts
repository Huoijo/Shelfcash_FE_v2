// Test-only portable state builders. No React, storage, clock/randomness or network I/O.
import responses from './planning-assistant-responses.json'
import type { AssistantState } from '../../src/features/decision-planning/planning.assistant'
import type { PlanningIntentState, PlanningAuthority } from '../../src/features/decision-planning/planning.intent'
import type { RecoveryRecord } from '../../src/features/backend-capabilities/recovery.journal'
import type { CapabilityInput, CapabilityOutput } from '../../src/features/backend-capabilities/capabilities.data'

export const qa = {
  actor: '00000000-0000-4000-8000-000000000001', store: '00000000-0000-4000-8000-000000000002',
  key: '00000000-0000-4000-8000-000000000003', at: '2026-10-17T00:00:00Z',
  run: responses.answer.data.run_id, version: responses.answer.data.evidence_version,
  originalQuestion: 'QA synthetic ambiguous question',
} as const
const clone = <T,>(value: T): T => structuredClone(value)
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`
export const qaPermissions = ['planning.result.read', 'budget.read', 'procurement.cost.read']
export const qaAuthority = (): PlanningAuthority => ({scope:{actor_user_id:qa.actor,store_id:qa.store,sessionIdentity:'qa-session-lifetime'},permissions:[...qaPermissions]})
export type PreparedAssistantFixture = {
  synthetic: true
  id: string
  application: AssistantState
  chatIntent: PlanningIntentState<'AS03'>
  summaryIntent: PlanningIntentState<'AS01'>
  authority: PlanningAuthority
  records: RecoveryRecord[]
  // Test orchestration descriptor, NOT a new application enum or implemented C03 refresh method.
  harness: { contextRead: 'not_requested' | 'pending' | 'validated'; currentEvidenceVersion: string; unresolvedOutcome: boolean; summaryPresentation?: Pick<CapabilityInput<'AS01'>['body'],'option_id'|'locale'|'detail_level'> }
}
function empty(id: string): PreparedAssistantFixture {
  return {synthetic:true,id,application:{phase:'idle',summary:null,chat:null,history:[],summaryPolls:0},chatIntent:{status:'idle'},summaryIntent:{status:'idle'},authority:qaAuthority(),records:[],harness:{contextRead:'not_requested',currentEvidenceVersion:qa.version,unresolvedOutcome:false}}
}
export function normalFixture(kind: 'first-open' | 'answer' | 'loading' | 'permission' | 'unavailable' = 'first-open') {
  const f=empty(`normal-${kind}`)
  if(kind==='answer'){f.application.phase='answer';f.application.chat=(clone(responses.answer) as CapabilityOutput<'AS03'>).data;f.chatIntent={status:'succeeded',result:clone(responses.answer) as CapabilityOutput<'AS03'>}}
  if(kind==='loading'){f.application.phase='sending';f.chatIntent={status:'pending'}}
  if(kind==='permission'){f.application.phase='permission';f.authority.permissions=[];f.chatIntent={status:'blocked'}}
  if(kind==='unavailable'){f.application.phase='error';f.chatIntent={status:'blocked'}}
  return f
}
export function clarificationFixture(kind: 'ingredient' | 'similar-ingredients' | 'option' | 'product' | 'unsupported') {
  const f=empty(`clarification-${kind}`),envelope=clone(responses.clarification) as CapabilityOutput<'AS03'>,chat=envelope.data
  chat.answer='QA synthetic clarification';chat.clarification={code:kind==='unsupported'?'QUERY_UNSUPPORTED':'ENTITY_AMBIGUOUS',question:'QA synthetic identity question',original_question:qa.originalQuestion,candidates:[],option_candidates:[],product_candidates:[]}
  if(kind==='ingredient'||kind==='similar-ingredients')chat.clarification.candidates=Array.from({length:kind==='ingredient'?2:5},(_,i)=>({ingredient_id:uuid(100+i),name:kind==='ingredient'?`QA Ingredient ${i+1}`:`QA Milk variant ${i+1}`}))
  if(kind==='option')chat.clarification.option_candidates=[{option_id:'qa-option-A',source_strategies:['lean']},{option_id:'qa-option-B',source_strategies:['balanced']},{option_id:'qa-option-C',source_strategies:['protected']}]
  if(kind==='product')chat.clarification.product_candidates=[{product_id:uuid(200),name:'QA Product A'},{product_id:uuid(201),name:'QA Product B'}]
  const candidateIds=kind==='product'?chat.clarification.product_candidates!.map(c=>c.product_id):chat.clarification.candidates.map(c=>c.ingredient_id)
  chat.context={run_id:qa.run,evidence_version:qa.version,option_id:null,ingredient_id:null,product_id:null,pending:kind==='option'||kind==='unsupported'?null:{original_question:qa.originalQuestion,candidate_ids:candidateIds,entity_kind:kind==='product'?'product':'ingredient'}}
  f.application.phase='clarification';f.application.chat=chat;f.chatIntent={status:'succeeded',result:envelope}
  return f
}
export function staleFixture(kind: 'detected' | 'refreshing' | 'restored', unresolved=false) {
  const f=empty(`context-${kind}${unresolved?'-unresolved':''}`)
  f.application.phase=kind==='restored'?(unresolved?'uncertain':'idle'):'stale'
  f.chatIntent={status:unresolved?'unknown':kind==='restored'?'idle':'blocked'}
  f.summaryIntent={status:kind==='restored'?'idle':'blocked'}
  f.harness={contextRead:kind==='refreshing'?'pending':kind==='restored'?'validated':'not_requested',currentEvidenceVersion:kind==='restored'?'qa-current-evidence/2':qa.version,unresolvedOutcome:unresolved}
  if(unresolved)f.records=[metadataOnlyChatRecord()]
  return f
}
export function metadataOnlyChatRecord(state: RecoveryRecord['state']='unknown'): RecoveryRecord {
  const resources={plan_id:qa.run},scope=JSON.stringify([qa.actor,qa.store,'AS03',resources])
  return {id:JSON.stringify([scope,qa.key]),scope,actor_user_id:qa.actor,store_id:qa.store,operation_id:'AS03',phase:null,method:'POST',path:'/api/v1/procurement-plans/{plan_id}/assistant/messages',resource_ids:resources,idempotency_key:qa.key,original_cas:{},created_at:qa.at,payload_sha256:'a'.repeat(64),state}
}
export function uncertainReloadFixture(kind: 'metadata-only' | 'blocked-continuation' | 'new-question-blocked' | 'known-terminal-new-question') {
  const f=empty(`uncertain-${kind}`),terminal=kind==='known-terminal-new-question'
  f.records=[metadataOnlyChatRecord(terminal?'rejected':'unknown')]
  f.application.phase=terminal?'idle':'uncertain';f.chatIntent=terminal?{status:'idle'}:{status:'unknown',recoveryId:f.records[0].id}
  f.harness.unresolvedOutcome=!terminal
  // The terminal variant is an independently seeded, authoritative prior terminal outcome.
  // It is NEVER a UI transition from a metadata-only unresolved record.
  return f
}
export function summaryFixture(kind: 'initial' | 'running' | 'completed' | 'failed' | 'recoverable' | 'new-generation', locale:'vi'|'en'='vi', detail:'simple'|'technical'='simple') {
  const f=empty(`summary-${kind}-${locale}-${detail}`),envelope=clone(responses.summary) as CapabilityOutput<'AS01'>,summary=envelope.data
  f.authority.scope.store_id=summary.result!.identity.store_id
  f.harness.currentEvidenceVersion=summary.result!.identity.aggregate_digest
  f.harness.summaryPresentation={option_id:null,locale,detail_level:detail}
  summary.result!.locale=locale;summary.result!.detail_level=detail
  if(kind==='initial')return f
  if(kind==='recoverable'){
    const input={path:{plan_id:summary.run_id},key:qa.key,body:{expected_evidence_version:f.harness.currentEvidenceVersion,option_id:null,locale,detail_level:detail}}
    const resources={plan_id:summary.run_id},scope=JSON.stringify([qa.actor,f.authority.scope.store_id,'AS01',resources])
    // Hash is a marker in the detached rendering fixture; real replay fixtures use prepareRecoveryRecord.
    const r:RecoveryRecord={...metadataOnlyChatRecord(),id:JSON.stringify([scope,qa.key]),scope,store_id:f.authority.scope.store_id,operation_id:'AS01',resource_ids:resources,path:'/api/v1/procurement-plans/{plan_id}/assistant/summary',replay_input:input}
    f.records=[r];f.application.phase='uncertain';f.summaryIntent={status:'unknown',recoveryId:r.id};f.harness.unresolvedOutcome=true;return f
  }
  if(kind==='running'||kind==='failed'){summary.status=kind;summary.result=null;summary.finished_at=kind==='failed'?qa.at:null;summary.error_code=kind==='failed'?'PROCESS_INTERRUPTED':null}
  f.application.summary=summary;f.application.phase=kind==='running'?'sending':kind==='failed'?'error':'answer'
  f.summaryIntent={status:'succeeded',result:envelope,receiptIds:{generation_id:summary.generation_id}}
  return f
}
export const fixtureCatalog: Record<string,PreparedAssistantFixture>={
  NORMAL_FIRST_OPEN:normalFixture(),NORMAL_ANSWER:normalFixture('answer'),LOADING:normalFixture('loading'),PERMISSION_DENIED:normalFixture('permission'),UNAVAILABLE:normalFixture('unavailable'),
  CLARIFICATION_INGREDIENT:clarificationFixture('ingredient'),CLARIFICATION_SIMILAR_INGREDIENTS:clarificationFixture('similar-ingredients'),CLARIFICATION_OPTION:clarificationFixture('option'),CLARIFICATION_PRODUCT:clarificationFixture('product'),QUERY_UNSUPPORTED:clarificationFixture('unsupported'),
  CONTEXT_STALE:staleFixture('detected'),CONTEXT_REFRESHING:staleFixture('refreshing'),CONTEXT_RESTORED:staleFixture('restored'),CONTEXT_RESTORED_UNRESOLVED:staleFixture('restored',true),
  UNCERTAIN_AFTER_RELOAD:uncertainReloadFixture('metadata-only'),UNCERTAIN_BLOCKED_CONTINUATION:uncertainReloadFixture('blocked-continuation'),NEW_QUESTION_AFTER_UNCERTAIN:uncertainReloadFixture('new-question-blocked'),NEW_QUESTION_AFTER_KNOWN_TERMINAL:uncertainReloadFixture('known-terminal-new-question'),
  SUMMARY_INITIAL:summaryFixture('initial'),SUMMARY_RUNNING:summaryFixture('running'),SUMMARY_COMPLETED:summaryFixture('completed'),SUMMARY_FAILED:summaryFixture('failed'),SUMMARY_SAFE_RECOVERY:summaryFixture('recoverable'),SUMMARY_NEW_GENERATION:summaryFixture('new-generation'),
  LOADING_RETAINED_ANSWER:{...normalFixture('answer'),id:'loading-retained-answer',application:{...normalFixture('answer').application,phase:'sending'},chatIntent:{status:'pending'}},
  PERMISSION_DENIED_UNCERTAIN:{...uncertainReloadFixture('metadata-only'),id:'permission-denied-uncertain',application:{...uncertainReloadFixture('metadata-only').application,phase:'permission'},authority:{...qaAuthority(),permissions:[]}},
  SUMMARY_VI_SIMPLE:summaryFixture('completed','vi','simple'),SUMMARY_VI_TECHNICAL:summaryFixture('completed','vi','technical'),SUMMARY_EN_SIMPLE:summaryFixture('completed','en','simple'),SUMMARY_EN_TECHNICAL:summaryFixture('completed','en','technical'),
}
