import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { PlanningAssistant } from '../src/features/decision-planning/planning.assistant'
import { createBackendCapabilitiesApi } from '../src/features/backend-capabilities/capabilities.data'
import { capabilitySchemas } from '../src/features/backend-capabilities/capabilities.wire'
import { matchesCapabilitySchema } from '../src/features/backend-capabilities/capabilities.validation'
import { prepareRecoveryRecord } from '../src/features/backend-capabilities/recovery.journal'
import { fixtureCatalog,clarificationFixture,summaryFixture,metadataOnlyChatRecord,normalFixture,qa } from './fixtures/planning-assistant-preparation'
import responses from './fixtures/planning-assistant-responses.json'
import { memoryPreparationJournal,strictAssistantTransport,assertProtectedFactsCleared,assertMetadataOnly,assertOriginalTurnReplay,assertExplicitContinuation,assertSummaryMatchesCurrentEvidence } from './helpers/planning-assistant-preparation'
const api=createBackendCapabilitiesApi('https://assistant-preparation.invalid')
const envelope=data=>({data,meta:{request_id:'qa-preparation'},error:null})
const chatPath=`/api/v1/procurement-plans/${qa.run}/assistant/messages`
const post=(data,path=chatPath)=>({method:'POST',path,response:envelope(data)})
const schema=(name,value)=>matchesCapabilitySchema({$ref:`#/components/schemas/${name}`},value,capabilitySchemas)
function owner(f=normalFixture(),j=memoryPreparationJournal()){
 let current=structuredClone(f.authority)
 const run=f.application.summary?.run_id??f.records[0]?.resource_ids.plan_id??qa.run
 const flow=new PlanningAssistant(api,j,run,f.harness.currentEvidenceVersion,current.scope,()=>current)
 return {flow,j,setAuthority:value=>current=value,run}
}
test('PL01 copied envelopes remain exact hash-pinned synthetic handoff fixtures',()=>{
 const bytes=readFileSync(responses.provenance.source),source=JSON.parse(bytes)
 assert.equal(createHash('sha256').update(bytes).digest('hex'),responses.provenance.source_sha256)
 assert.deepEqual(responses.answer,source.integration_sequences[0].response)
 assert.deepEqual(responses.clarification,source.integration_sequences[1].response)
 assert.deepEqual(responses.summary,source.examples[7].response)
})
for(const [name,f]of Object.entries(fixtureCatalog))test(`PL01 portable fixture ${name} preserves wire shape and isolation`,()=>{
 assert.equal(f.synthetic,true)
 if(f.application.chat)assert.ok(schema('AssistantResponse',f.application.chat))
 if(f.application.summary)assert.ok(schema('SummaryView',f.application.summary))
 const original=structuredClone(f),copy=structuredClone(f);copy.application.history.push({role:'user',content:'QA only'})
 assert.deepEqual(f,original)
 if(f.records.some(r=>r.operation_id==='AS03'))f.records.filter(r=>r.operation_id==='AS03').forEach(assertMetadataOnly)
})
for(const kind of ['ingredient','similar-ingredients','option','product','unsupported'])test(`PL01 ${kind} clarification uses only explicit valid identity continuation`,async t=>{
 const f=clarificationFixture(kind),x=owner(f),chat=f.application.chat,answer=structuredClone(responses.answer.data)
 if(kind==='option'){answer.option_id=chat.clarification.option_candidates[0].option_id;answer.context={run_id:qa.run,evidence_version:qa.version,option_id:answer.option_id}}
 if(kind==='product')answer.context={run_id:qa.run,evidence_version:qa.version,product_id:chat.clarification.product_candidates[0].product_id}
 const calls=strictAssistantTransport(t,kind==='unsupported'?[post(chat)]:[post(chat),post(answer)])
 await x.flow.restore();await x.flow.ask(qa.originalQuestion);assert.equal(calls.length,1);assert.equal(x.flow.getSnapshot().phase,'clarification')
 assert.equal(x.flow.getSnapshot().chat.clarification.original_question,qa.originalQuestion)
 for(const k of ['ingredient','option','product'])await assert.rejects(async()=>x.flow.selectCandidate(k,qa.actor))
 assert.equal(calls.length,1)
 if(kind==='unsupported')return
 const type=kind==='similar-ingredients'?'ingredient':kind
 const id=type==='ingredient'?chat.clarification.candidates[0].ingredient_id:type==='option'?chat.clarification.option_candidates[0].option_id:chat.clarification.product_candidates[0].product_id
 await x.flow.selectCandidate(type,id);assertExplicitContinuation(calls[0],calls[1],chat.clarification,type,id)
})
test('PL01 stale owner clears facts, cannot reset itself, and C03 is not silently called',async t=>{
 const x=owner(),calls=strictAssistantTransport(t,[post(responses.answer.data)])
 await x.flow.restore();await x.flow.ask('QA known question');x.flow.setEvidenceVersion('qa-new-version')
 assert.equal(x.flow.getSnapshot().phase,'stale');assertProtectedFactsCleared(x.flow.getSnapshot())
 assert.throws(()=>x.flow.setPresentation({option_id:null,locale:'vi',detail_level:'simple'}))
 await assert.rejects(x.flow.ask('QA next'));assert.equal(calls.length,1)
})
test('PL01 metadata-only restored Chat blocks exact replay and deliberate replacement without dispatch',async t=>{
 const j=memoryPreparationJournal([metadataOnlyChatRecord()]),x=owner(normalFixture(),j),calls=strictAssistantTransport(t,[])
 await x.flow.restore();assert.equal(x.flow.getSnapshot().phase,'uncertain');assertProtectedFactsCleared(x.flow.getSnapshot())
 await assert.rejects(x.flow.replayChat(),/Original Chat body/);await assert.rejects(x.flow.ask('QA deliberately different question'))
 assert.equal(calls.length,0);assert.equal(x.flow.chatIntent.getSnapshot().status,'unknown');assertMetadataOnly([...j.rows.values()][0])
})
test('PL01 positive new-question path requires a known terminal outcome, not mere elapsed time/reload',async t=>{
 const x=owner(),calls=strictAssistantTransport(t,[{method:'POST',path:chatPath,reject:true},{method:'POST',path:chatPath,status:409,response:{data:null,meta:{request_id:'qa-terminal'},error:{code:'GENERATION_FAILED',message:'QA terminal generation',details:{}}}},post(responses.answer.data)])
 await x.flow.restore();await assert.rejects(x.flow.ask('QA original question'));await assert.rejects(x.flow.replayChat())
 assert.equal(x.flow.chatIntent.getSnapshot().status,'failed');assert.equal([...x.j.rows.values()][0].state,'rejected')
 await x.flow.ask('QA new intentional question');assertOriginalTurnReplay(calls[0],calls[1]);assert.notEqual(calls[2].key,calls[0].key)
})
for(const locale of ['vi','en'])for(const detail of ['simple','technical'])test(`PL01 initial Summary ${locale}/${detail} is schema-valid and uses the existing AS01 owner`,async t=>{
 const f=summaryFixture('completed',locale,detail),x=owner(f),path=`/api/v1/procurement-plans/${x.run}/assistant/summary`,calls=strictAssistantTransport(t,[post(f.application.summary,path)])
 await x.flow.restore();x.flow.setPresentation(f.harness.summaryPresentation);await x.flow.generateSummary()
 assert.equal(calls[0].body.locale,locale);assert.equal(calls[0].body.detail_level,detail)
 assert.equal(x.flow.getSnapshot().summary.result.answer,responses.summary.data.result.answer)
})
test('PL01 Summary safe replay rehydrates an exact full-body record; detached hash markers are not replay input',async t=>{
 const f=summaryFixture('recoverable'),input=f.records[0].replay_input
 const record=await prepareRecoveryRecord('AS01',input,f.authority.scope);record.created_at=qa.at
 const x=owner(f,memoryPreparationJournal([record])),path=`/api/v1/procurement-plans/${x.run}/assistant/summary`,calls=strictAssistantTransport(t,[post(responses.summary.data,path)])
 await x.flow.restore();await x.flow.replaySummary();assert.equal(calls[0].key,qa.key);assert.deepEqual(calls[0].body,input.body)
})
test('PL01 fresh denial still redacts facts for future browser assertions',async t=>{
 const x=owner();strictAssistantTransport(t,[post(responses.answer.data),{method:'POST',path:chatPath,status:403,response:{data:null,meta:{request_id:'qa-denied'},error:{code:'PERMISSION_DENIED',message:'QA denied',details:{}}}}])
 await x.flow.restore();await x.flow.ask('QA first');await assert.rejects(x.flow.ask('QA second'));assert.equal(x.flow.getSnapshot().phase,'permission');assertProtectedFactsCleared(x.flow.getSnapshot())
})
test('PL01 B01 characterization: presentation change after terminal Summary is currently blocked by retained locator',async t=>{
 const f=summaryFixture('completed'),x=owner(f),path=`/api/v1/procurement-plans/${x.run}/assistant/summary`,calls=strictAssistantTransport(t,[post(f.application.summary,path)])
 await x.flow.restore();await x.flow.generateSummary();x.flow.setPresentation({option_id:null,locale:'en',detail_level:'technical'})
 await assert.rejects(x.flow.generateSummary(),/Resolve the current generation/);assert.equal(calls.length,1)
 assert.equal(x.flow.summaryIntent.getSnapshot().status,'succeeded')
})
test('PL01 B02 characterization: restored old-version Summary replay can publish old evidence in a fresh owner',async t=>{
 const f=summaryFixture('recoverable'),record=await prepareRecoveryRecord('AS01',f.records[0].replay_input,f.authority.scope)
 f.harness.currentEvidenceVersion='qa-new-evidence-version'
 const x=owner(f,memoryPreparationJournal([record])),path=`/api/v1/procurement-plans/${x.run}/assistant/summary`
 strictAssistantTransport(t,[post(responses.summary.data,path)]);await x.flow.restore();await x.flow.replaySummary()
 assert.equal(x.flow.getSnapshot().phase,'answer');assert.notEqual(x.flow.getSnapshot().summary.result.identity.aggregate_digest,f.harness.currentEvidenceVersion)
 assert.throws(()=>assertSummaryMatchesCurrentEvidence(x.flow.getSnapshot().summary,f.harness.currentEvidenceVersion))
 // This records an existing integration hazard, not approval to bind old facts as current.
})
