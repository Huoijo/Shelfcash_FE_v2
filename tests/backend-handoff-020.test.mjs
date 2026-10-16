import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createBackendCapabilitiesApi } from '../src/features/backend-capabilities/capabilities.data'
import { createCapabilityMutationState } from '../src/features/backend-capabilities/capabilities.state'
import { prepareRecoveryRecord } from '../src/features/backend-capabilities/recovery.journal'
import { createCapabilityRecoveryService } from '../src/features/backend-capabilities/recovery.service'
import { recoveryRules } from '../src/features/backend-capabilities/recovery.policy'
import { configureHttpSession } from '../src/shared/http/httpClient'
const source='BE_answer/16_10_afternoon/shelfcash_FE_handoff_d5cfbfb59de7'
const examples=JSON.parse(readFileSync(`${source}/docs/handoff/examples.json`,'utf8')).examples
const id='00000000-0000-4000-8000-000000000001', key='00000000-0000-4000-8000-000000000002', other='00000000-0000-4000-8000-000000000003'
const scope={actor_user_id:id,store_id:id,sessionIdentity:'current-session-only'}
const api=createBackendCapabilitiesApi('https://controlled.invalid')
const input=e=>({path:{plan_id:e.response.data.run_id},...(e.method==='POST'?{key,body:structuredClone(e.body)}:{path:{plan_id:e.response.data.run_id,generation_id:e.response.data.generation_id}})})
function stub(t,handler){t.mock.method(globalThis,'fetch',handler);const release=configureHttpSession({getCsrfToken:()=>'fresh-csrf',onUnauthenticated:()=>{}});t.after(release)}
const response=x=>new Response(JSON.stringify(x),{status:200,headers:{'Content-Type':'application/json'}})
const draft=(k=key)=>({path:{store_id:id},key:k,body:{data_date:'2026-10-16'}})
function memoryJournal(){
 const rows=new Map(), events=[]
 return {rows,events,
  async reserve(record){events.push('reserve');if([...rows.values()].some(r=>r.id===record.id||(r.scope===record.scope&&['pending','unknown'].includes(r.state))))throw Error('Unresolved conflict');rows.set(record.id,structuredClone(record))},
  async update(id,state){events.push(state);assert.ok(rows.has(id));rows.get(id).state=state},
  async list(actor,store){return structuredClone([...rows.values()].filter(r=>r.actor_user_id===actor&&r.store_id===store))},
 }
}

for(const [index,e] of examples.entries())if(e.operation_id.startsWith('AS'))test(`020 supplied Assistant example ${index}: exact request, diagnostics, references and context survive`,async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(e.response)})
 const result=await api.call(e.operation_id,input(e))
 assert.deepEqual(result,e.response);assert.match(sent.u,/\/assistant\//)
 assert.equal(sent.o.headers.get('X-CSRF-Token'),e.method==='POST'?'fresh-csrf':null)
 if(e.body)assert.deepEqual(JSON.parse(sent.o.body),e.body)
})
test('020 AS01 rejects wrong version/run and AS02 rejects wrong generation/Store pin',async t=>{
 const e=examples[0];let out=structuredClone(e.response);stub(t,async()=>response(out))
 out.data.result.identity.aggregate_digest='wrong';await assert.rejects(api.assistant.createSummary(input(e)),e=>e.kind==='protocol')
 out=structuredClone(e.response);out.data.run_id=other;await assert.rejects(api.assistant.createSummary(input(e)),e=>e.kind==='protocol')
 out=structuredClone(e.response);await assert.rejects(api.assistant.readSummary({...input(examples[1]),path:{...input(examples[1]).path,generation_id:other}}),e=>e.kind==='protocol')
 await assert.rejects(api.assistant.readSummary(input(examples[1]),{assistantPin:{store_id:other,evidence_version:e.body.expected_evidence_version}}),e=>e.kind==='protocol')
})
test('020 AS02 running/failed are retained reads with no generation or J01 side effect',async t=>{
 const e=examples[1],calls=[];let status='running';stub(t,async(u,o)=>{calls.push({u,o});return response({...e.response,data:{...e.response.data,status,result:null,finished_at:null,error_code:status==='failed'?'INTERRUPTED':null}})})
 for(const next of ['running','failed']){status=next;assert.equal((await api.assistant.readSummary(input(e))).data.status,next)}
 assert.equal(calls.length,2);assert.ok(calls.every(c=>c.o.method==='GET'&&!c.u.includes('/jobs/')))
})
test('020 chat fixed comparison tuple and run/version context validated before dispatch',async t=>{
 let calls=0;stub(t,async()=>{calls++;return response(examples[2].response)})
 const base=input(examples[2]),ctx={run_id:base.path.plan_id,evidence_version:base.body.expected_evidence_version}
 for(const context of [{...ctx,comparison_pair:['one']},{...ctx,comparison_pair:['one','two','three']},{...ctx,comparison_pair:['one',1]},{...ctx,run_id:other},{...ctx,evidence_version:'stale'}])await assert.rejects(api.assistant.sendMessage({...base,body:{...base.body,context}}))
 assert.equal(calls,0)
})
test('020 chat rejects changed response context and preserves generation-claim 409 as unknown',async t=>{
 let out=structuredClone(examples[2].response);out.data.context={run_id:other,evidence_version:out.data.evidence_version}
 stub(t,async()=>response(out));await assert.rejects(api.assistant.sendMessage(input(examples[2])),e=>e.kind==='protocol')
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({data:null,meta:{request_id:'controlled'},error:{code:'CLAIM_UNKNOWN',message:'Claim unknown',details:{}}}),{status:409,headers:{'Content-Type':'application/json'}}))
 const state=createCapabilityMutationState(api,'AS03');await assert.rejects(state.send(input(examples[2])));assert.equal(state.getState().status,'unknown');await assert.rejects(state.send({...input(examples[2]),key:other}),/Competing/)
})
test('020 projected policy preserves all supplied operation/phase modes and allowlists',()=>{
 const policy=JSON.parse(readFileSync('contracts/020/recovery_journal.json','utf8'))
 assert.deepEqual(recoveryRules,policy.operations.map(o=>({operation:o.operation_id,phase:o.phase,mode:o.journal.mode,fields:o.journal.allowed_body_fields,conditions:o.journal.conditions})))
})
test('020 journal defaults deny auth/proofs and excludes files/invitations',async()=>{
 assert.equal(await prepareRecoveryRecord('A01',{body:{email:'example@test.invalid',password:'private'}},scope),null)
 const invitation={path:{invitation_id:id},key,revision:'invitation/1',body:{token:'private-proof',reason:'private'}}
 assert.equal(await prepareRecoveryRecord('IN01',invitation,scope),null)
})
test('020 AS03 journal retains metadata/hash, never question/history/pending original question',async()=>{
 const record=await prepareRecoveryRecord('AS03',input(examples[2]),scope)
 assert.ok(record);assert.equal(record.replay_input,undefined)
 const serialized=JSON.stringify(record);assert.ok(!serialized.includes('question'));assert.ok(!serialized.includes('history'));assert.ok(!serialized.includes('current-session-only'));assert.match(record.payload_sha256,/^[0-9a-f]{64}$/)
})
test('020 journal preserves exact safe body, CAS and omitted/null distinctions without filling defaults',async()=>{
 const args={path:{import_id:id},key,revision:'import/1',body:{phase:'commit',preview_id:id,preview_digest:'preview/1',confirm:true,resolutions:[]}}
 const absent=await prepareRecoveryRecord('I05',args,scope),nil=await prepareRecoveryRecord('I05',{...args,body:{...args.body,reason:null}},scope)
 assert.deepEqual(absent.replay_input,args);assert.deepEqual(absent.original_cas,{revision:'import/1'});assert.notEqual(absent.payload_sha256,nil.payload_sha256)
 for(const extra of [{reason:'source evidence'},{supplier_changes:[{action_id:id,reason:'private'}]},{history_corrections:[{row_id:id,expected_version:'v1',reason:'private'}]}]){
  const record=await prepareRecoveryRecord('I05',{...args,body:{...args.body,...extra}},scope);assert.equal(record.replay_input,undefined);assert.ok(!JSON.stringify(record).includes('private'))
 }
})
test('020 planning only journals default/saved bodies; custom requirements remain metadata-only',async()=>{
 const base={path:{store_id:id},key,body:{requirements_mode:'default',forecast_start_date:'2026-10-16',default_requirements_version:'requirements/1'}}
 assert.deepEqual((await prepareRecoveryRecord('C02',base,scope)).replay_input,base)
 const custom={...base,body:{requirements_mode:'custom',forecast_start_date:'2026-10-16',requirements:{paths:[{path:'BASE',min_fill_rate_percent:'95'}],budget_limit:'100000'}}}
 const record=await prepareRecoveryRecord('C02',custom,scope)
 assert.equal(record.replay_input,undefined);assert.ok(!JSON.stringify(record).includes('budget_limit'))
})
test('020 journal refuses wrong Store and dual budget CAS',async()=>{
 await assert.rejects(prepareRecoveryRecord('I01',draft(),{...scope,actor_user_id:'unreviewed text'}),/identifiers/)
 await assert.rejects(prepareRecoveryRecord('I01',draft(),{...scope,store_id:other}),/Store/)
 await assert.rejects(prepareRecoveryRecord('N4',{path:{store_id:id},key,revision:'budget/1',ifNoneMatch:'*',body:{amount:0}},scope))
})
test('020 durable write precedes dispatch; storage failure prevents API call',async()=>{
 const journal=memoryJournal();let calls=0
 const backend={async call(){calls++;journal.events.push('dispatch');return {receipt:'controlled'}}}
 const service=createCapabilityRecoveryService(backend,journal,()=>scope)
 await service.send('I01',draft());assert.deepEqual(journal.events,['reserve','dispatch','confirmed']);assert.equal(calls,1)
 const unavailable={...journal,async reserve(){throw Error('disk unavailable')}}
 await assert.rejects(createCapabilityRecoveryService(backend,unavailable,()=>scope).send('I01',draft(other)),/disk/);assert.equal(calls,1)
})
test('020 reload restore is read-only; exact replay retains original body/key and uses current session',async()=>{
 const journal=memoryJournal();let session=scope,calls=0,sent=[]
 const backend={async call(op,args){calls++;sent.push(structuredClone(args));if(calls===1)throw Error('ACK lost');return {receipt:'controlled'}}}
 const before=createCapabilityRecoveryService(backend,journal,()=>session)
 await assert.rejects(before.send('I01',draft()),/ACK lost/)
 session={...scope,sessionIdentity:'new-current-session'}
 const after=createCapabilityRecoveryService(backend,journal,()=>session),rows=await after.restore()
 assert.equal(calls,1);assert.equal(rows[0].state,'unknown');await assert.rejects(after.send('I01',draft(other)),/Unresolved/);assert.equal(calls,1)
 await after.replay(rows[0].id);assert.deepEqual(sent,[draft(),draft()]);assert.deepEqual(await after.restore(),[])
})
test('020 denied replay, metadata-only intent and unrelated actor cannot settle/replay original uncertainty',async()=>{
 const journal=memoryJournal();let current=scope,calls=0
 const backend={async call(){calls++;throw Error('403 replay denied')}}
 const service=createCapabilityRecoveryService(backend,journal,()=>current)
 await assert.rejects(service.send('AS03',input(examples[2])));const [chat]=await service.restore();await assert.rejects(service.replay(chat.id),/full reviewed/);assert.equal(calls,1)
 await assert.rejects(service.send('I01',draft()));const record=(await service.restore()).find(r=>r.operation_id==='I01');await assert.rejects(service.replay(record.id));assert.equal(journal.rows.get(record.id).state,'unknown')
 current={...scope,actor_user_id:other};assert.deepEqual(await service.restore(),[]);await assert.rejects(service.replay(record.id));assert.equal(calls,3)
})
test('020 session change during durable reservation blocks dispatch without claiming cross-tab no-effect',async()=>{
 const journal=memoryJournal();let current=scope,calls=0
 const reserve=journal.reserve;journal.reserve=async record=>{await reserve(record);current={...scope,sessionIdentity:'changed'}}
 const service=createCapabilityRecoveryService({async call(){calls++}},journal,()=>current)
 await assert.rejects(service.send('I01',draft()),/session changed/);assert.equal(calls,0);assert.equal([...journal.rows.values()][0].state,'pending')
})
test('020 tampered stored body/hash/CAS cannot become an exact replay',async()=>{
 const journal=memoryJournal();let calls=0
 const service=createCapabilityRecoveryService({async call(){calls++;throw Error('unknown')}},journal,()=>scope)
 await assert.rejects(service.send('I01',draft()));const record=[...journal.rows.values()][0];record.replay_input.body.data_date='2026-10-17'
 await assert.rejects(service.replay(record.id),/integrity/);assert.equal(calls,1)
})
test('020 durable acknowledgement failure preserves unresolved evidence and blocks a new key',async()=>{
 const journal=memoryJournal();let calls=0
 journal.update=async()=>{throw Error('disk write failed after ACK')}
 const service=createCapabilityRecoveryService({async call(){calls++;return {receipt:'controlled'}}},journal,()=>scope)
 await assert.rejects(service.send('I01',draft()),/after ACK/)
 assert.equal((await service.restore())[0].state,'unknown')
 await assert.rejects(service.send('I01',draft(other)),/Unresolved/);assert.equal(calls,1)
})
test('020 Store/resource scope ignores caller property ordering; logout restores nothing without session',async()=>{
 const a={path:{store_id:id,product_id:other},key,revision:'recipe/1',body:{phase:'commit',change_id:id,preview_digest:'digest',confirm:true,acknowledged_warning_codes:[]}}
 const b={...a,path:{product_id:other,store_id:id}}
 assert.equal((await prepareRecoveryRecord('N21',a,scope)).scope,(await prepareRecoveryRecord('N21',b,scope)).scope)
 const service=createCapabilityRecoveryService({},memoryJournal(),()=>null)
 await assert.rejects(service.restore(),/authenticated/)
})
