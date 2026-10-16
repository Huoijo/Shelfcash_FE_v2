import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createBackendCapabilitiesApi, captureCapabilityInput} from '../src/features/backend-capabilities/capabilities.data'
import {configureHttpSession} from '../src/shared/http/httpClient'
import {PlanningAssistant} from '../src/features/decision-planning/planning.assistant'
import {PlanningIntentController} from '../src/features/decision-planning/planning.intent'
import {createOperationsApi} from '../src/features/operations/operations.data'
const pkg='BE_answer/17_10_earlymorning/shelfcash-fe-summary-pdf-chat-preview-a17d153'
const fixtures=JSON.parse(readFileSync(`${pkg}/docs/handoff/examples.json`,'utf8'))
const actor='00000000-0000-4000-8000-000000000001',store='00000000-0000-4000-8000-000000000002',key='00000000-0000-4000-8000-000000000003'
const scope={actor_user_id:actor,store_id:store,sessionIdentity:'non-secret-session'}
const permissions=['planning.result.read','budget.read','procurement.cost.read','planning.export']
const api=createBackendCapabilitiesApi('https://controlled.invalid')
const input=e=>({path:{plan_id:e.response.data.run_id},key,body:structuredClone(e.body)})
const ok=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}})
function transport(t,handler){t.mock.method(globalThis,'fetch',handler);t.after(configureHttpSession({getCsrfToken:()=>'current-csrf',onUnauthenticated:()=>{}}))}
function journal(){const rows=new Map(),events=[];return{rows,events,async reserve(r){events.push('reserve');if([...rows.values()].some(x=>x.id===r.id||(x.scope===r.scope&&['pending','unknown'].includes(x.state))))throw Error('conflict');rows.set(r.id,structuredClone(r))},async update(id,state,receiptIds){events.push(state);rows.get(id).state=state;if(receiptIds)rows.get(id).receipt_ids=structuredClone(receiptIds)},async list(a,s){return structuredClone([...rows.values()].filter(r=>r.actor_user_id===a&&r.store_id===s))}}}
function assistant(e=fixtures.integration_sequences[0]){const j=journal();let current={scope,permissions};const selectedScope={...scope,store_id:e.response.data.result?.identity.store_id??store};current={scope:selectedScope,permissions};const flow=new PlanningAssistant(api,j,e.response.data.run_id,e.body.expected_evidence_version,selectedScope,()=>current);return {flow,j,setAuthority:a=>current=a}}
for(const [i,e] of [...fixtures.examples,...fixtures.integration_sequences].entries())if(e.operation_id.startsWith('AS'))test(`021 supplied contract fixture ${i} preserves exact response and headers`,async t=>{
 transport(t,async(u,o)=>{if(e.method==='POST'){assert.deepEqual(JSON.parse(o.body),e.body);assert.equal(o.headers.get('Idempotency-Key'),key);assert.equal(o.headers.get('X-CSRF-Token'),'current-csrf')}return ok(e.response)})
 const request=e.method==='GET'?{path:{plan_id:e.response.data.run_id,generation_id:e.response.data.generation_id}}:input(e)
 assert.deepEqual(await api.call(e.operation_id,request),e.response)
})
test('021 all historical/new PDF renderer versions accepted by runtime operations adapter',async t=>{
 const e=fixtures.export_sequence.accept;let version='planning-pdf/1'
 transport(t,async()=>ok({...e.response,data:{...e.response.data,render_version:version}},202))
 const source=createOperationsApi('https://controlled.invalid')
 for(const v of ['planning-pdf/1','planning-pdf/2','planning-pdf/3']){version=v;assert.equal((await source.exportPlan(e.response.data.run_id,{key,request:e.body})).data.render_version,v)}
 version='planning-pdf/4';await assert.rejects(source.exportPlan(e.response.data.run_id,{key,request:e.body}))
})
test('021 history total/Unicode/body byte limits enforced before network',()=>{
 const e=fixtures.integration_sequences[0],base=input(e)
 assert.throws(()=>captureCapabilityInput('AS03',{...base,body:{...base.body,history:[{role:'user',content:'a'.repeat(2000)},{role:'assistant',content:'b'.repeat(2000)},{role:'user',content:'c'}]}}))
 assert.doesNotThrow(()=>captureCapabilityInput('AS03',{...base,body:{...base.body,history:[{role:'user',content:'😀'.repeat(2000)},{role:'assistant',content:'😀'.repeat(2000)}]}}))
 assert.throws(()=>captureCapabilityInput('AS03',{...base,body:{...base.body,question:'😀'.repeat(2000),history:[{role:'user',content:'😀'.repeat(2000)},{role:'assistant',content:'😀'.repeat(2000)}],context:{run_id:base.path.plan_id,evidence_version:base.body.expected_evidence_version,pending:{original_question:'😀'.repeat(2000),candidate_ids:Array(30).fill(actor)}}}}),/32 KiB/)
})
test('021 clarification selection uses original question/new key/returned context, fallback is usable',async t=>{
 const e=fixtures.integration_sequences[1],next=fixtures.integration_sequences[2],x=assistant(e),sent=[]
 transport(t,async(u,o)=>{sent.push({body:JSON.parse(o.body),key:o.headers.get('Idempotency-Key')});return ok(sent.length===1?e.response:next.response)})
 await x.flow.restore();await x.flow.ask(e.body.question)
 assert.equal(x.flow.getSnapshot().phase,'clarification');assert.equal(x.flow.getSnapshot().chat.source,'deterministic_clarification')
 await assert.rejects(async()=>x.flow.selectCandidate('ingredient',actor))
 await x.flow.selectCandidate('ingredient',e.response.data.clarification.candidates[0].ingredient_id)
 assert.equal(sent[1].body.question,e.response.data.clarification.original_question)
 assert.equal(sent[1].body.ingredient_id,e.response.data.clarification.candidates[0].ingredient_id)
 assert.notEqual(sent[0].key,sent[1].key)
 assert.equal(sent[1].body.context.run_id,e.response.data.run_id)
 assert.equal(x.flow.getSnapshot().phase,'answer');assert.equal(x.flow.getSnapshot().chat.answer,next.response.data.answer)
 assert.equal(x.flow.getSnapshot().chat.source,'deterministic_fallback')
 assert.ok([...x.j.rows.values()].every(r=>!r.replay_input&&!JSON.stringify(r).includes(e.body.question)))
})
test('021 recent history stays bounded; server context replaces previous topic',async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);let last
 transport(t,async(u,o)=>{last=JSON.parse(o.body);return ok(e.response)})
 await x.flow.restore();for(let i=0;i<10;i++)await x.flow.ask('Q'.repeat(1900))
 assert.ok(last.history.length<=6);assert.ok(last.history.reduce((n,m)=>n+[...m.content].length,0)<=4000)
 assert.deepEqual(last.context,e.response.data.context)
})
for(const status of [401,403,404])test(`021 fresh ${status} clears protected assistant/history, preserves unresolved intent`,async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);let deny=false
 transport(t,async()=>deny?ok({data:null,meta:{request_id:'denied'},error:{code:status===403?'PERMISSION_DENIED':status===401?'UNAUTHENTICATED':'RESOURCE_NOT_FOUND',message:'denied'}},status):ok(e.response))
 await x.flow.restore();await x.flow.ask(e.body.question);deny=true
 await assert.rejects(x.flow.ask('follow up'))
 assert.equal(x.flow.getSnapshot().phase,'permission');assert.equal(x.flow.getSnapshot().chat,null);assert.deepEqual(x.flow.getSnapshot().history,[])
 assert.ok([...x.j.rows.values()].some(r=>r.state==='unknown'))
})
test('021 stale evidence cannot be silently reused by presentation change',async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);transport(t,async()=>ok(e.response));await x.flow.restore();await x.flow.ask(e.body.question)
 x.flow.setEvidenceVersion('new-version');assert.equal(x.flow.getSnapshot().phase,'stale');assert.equal(x.flow.getSnapshot().chat,null)
 assert.throws(()=>x.flow.setPresentation({option_id:null,locale:'en',detail_level:'technical'}));await assert.rejects(x.flow.ask('again'))
})
test('021 summary running reads retained generation; failed and fallback do not alter Planning',async t=>{
 const e=fixtures.examples[7],x=assistant(e);let calls=0,failed=false
 transport(t,async(u,o)=>{calls++;if(o.method==='POST')return ok({...e.response,data:{...e.response.data,status:'running',result:null,finished_at:null}});assert.match(u,/assistant\/summary\//);return ok(failed?{...e.response,data:{...e.response.data,status:'failed',result:null,error_code:'PROCESS_INTERRUPTED'}}:e.response)})
 await x.flow.restore();await x.flow.generateSummary();assert.equal(x.flow.getSnapshot().summary.status,'running')
 await assert.rejects(x.flow.generateSummary());assert.equal(calls,1)
 await x.flow.pollSummary();assert.equal(x.flow.getSnapshot().summary.result.answer,e.response.data.result.answer)
 assert.equal(x.flow.getSnapshot().phase,'answer')
 await x.flow.generateSummary();failed=true;await x.flow.pollSummary();assert.equal(x.flow.getSnapshot().phase,'error')
})
for(const operation of ['N10','AS01'])test(`021 ${operation} lost response survives restore, replays same key/body and prevents competing work`,async t=>{
 const e=operation==='N10'?fixtures.export_sequence.accept:fixtures.examples[0],j=journal(),owner={scope,permissions},sent=[]
 transport(t,async(u,o)=>{sent.push({key:o.headers.get('Idempotency-Key'),body:o.body});assert.equal(j.events[0],'reserve');if(sent.length===1)throw Error('response lost');return ok(e.response,operation==='N10'?202:200)})
 const first=new PlanningIntentController(api,j,operation,e.response.data.run_id,scope,()=>owner);await first.restore();await assert.rejects(first.send(input(e)));first.dispose()
 const resumed=new PlanningIntentController(api,j,operation,e.response.data.run_id,scope,()=>owner);await resumed.restore();assert.equal(resumed.getSnapshot().status,'unknown');assert.equal(sent.length,1)
 await assert.rejects(resumed.send({...input(e),key:crypto.randomUUID()}));await resumed.replay();assert.deepEqual(sent[0],sent[1]);assert.equal(resumed.getSnapshot().status,'succeeded')
 assert.ok([...j.rows.values()].every(r=>r.state==='confirmed'))
})
test('021 Chat exact replay works in memory but restored metadata never fabricates request',async t=>{
 const e=fixtures.integration_sequences[0],j=journal(),owner={scope,permissions};let calls=0
 transport(t,async()=>{calls++;throw Error('lost ACK')})
 const first=new PlanningIntentController(api,j,'AS03',e.response.data.run_id,scope,()=>owner);await first.restore();await assert.rejects(first.send(input(e)));await assert.rejects(first.replay());assert.equal(calls,2);first.dispose()
 const next=new PlanningIntentController(api,j,'AS03',e.response.data.run_id,scope,()=>owner);await next.restore();await assert.rejects(next.replay(),/Original Chat body/);assert.equal(calls,2);assert.equal(next.getSnapshot().status,'unknown')
})
test('021 storage failure blocks dispatch; actor/Store/session/rights change cannot replay',async t=>{
 const e=fixtures.export_sequence.accept,j=journal();let owner={scope,permissions},calls=0
 transport(t,async()=>{calls++;throw Error('lost')})
 const noStorage={...j,async reserve(){throw Error('storage blocked')}}
 const blocked=new PlanningIntentController(api,noStorage,'N10',e.response.data.run_id,scope,()=>owner);await blocked.restore();await assert.rejects(blocked.send(input(e)));assert.equal(calls,0)
 const c=new PlanningIntentController(api,j,'N10',e.response.data.run_id,scope,()=>owner);await c.restore();await assert.rejects(c.send(input(e)))
 for(const replacement of [{scope:{...scope,actor_user_id:key},permissions},{scope:{...scope,store_id:key},permissions},{scope:{...scope,sessionIdentity:'other'},permissions},{scope,permissions:[]}]){owner=replacement;await assert.rejects(c.replay())}
 assert.equal(calls,1);assert.equal(c.getSnapshot().status,'unknown')
})
test('021 changed persisted body/hash is denied before replay',async t=>{
 const e=fixtures.export_sequence.accept,j=journal(),owner={scope,permissions};let calls=0
 transport(t,async()=>{calls++;throw Error('lost')})
 const c=new PlanningIntentController(api,j,'N10',e.response.data.run_id,scope,()=>owner);await c.restore();await assert.rejects(c.send(input(e)))
 for(const r of j.rows.values())r.replay_input.body.option_id='changed'
 const next=new PlanningIntentController(api,j,'N10',e.response.data.run_id,scope,()=>owner);await next.restore();await assert.rejects(next.replay(),/integrity/);assert.equal(calls,1);assert.equal(next.getSnapshot().status,'unknown')
})
test('021 acknowledged PDF locator is durable before UI publication, not only after URL effect',async t=>{
 const e=fixtures.export_sequence.accept,j=journal(),owner={scope,permissions}
 transport(t,async()=>ok(e.response,202))
 const c=new PlanningIntentController(api,j,'N10',e.response.data.run_id,scope,()=>owner);await c.restore();await c.send(input(e));c.dispose()
 const next=new PlanningIntentController(api,j,'N10',e.response.data.run_id,scope,()=>owner);await next.restore()
 assert.equal(next.getSnapshot().status,'succeeded');assert.equal(next.getSnapshot().receiptIds.export_id,e.response.data.export_id);assert.equal(next.getSnapshot().receiptIds.job_id,e.response.data.job_id)
 assert.equal(next.getSnapshot().result,undefined) // Never reconstruct business facts from stored metadata.
})
test('021 retained Summary acknowledgement restores locator and AS02 reads original generation',async t=>{
 const e=fixtures.examples[7],x=assistant(e),sent=[]
 transport(t,async(u,o)=>{sent.push(o.method);return ok(e.response)})
 await x.flow.restore();await x.flow.generateSummary();x.flow.dispose()
 const owner={...scope,store_id:e.response.data.result.identity.store_id}
 const next=new PlanningAssistant(api,x.j,e.response.data.run_id,e.body.expected_evidence_version,owner,()=>({scope:owner,permissions}));await next.restore();await assert.rejects(next.generateSummary());await next.pollSummary()
 assert.deepEqual(sent,['POST','GET']);assert.equal(next.getSnapshot().summary.generation_id,e.response.data.generation_id)
})
test('021 authority changing during an in-flight answer redacts prior protected content',async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);let release,calls=0
 transport(t,async()=>{calls++;if(calls===2)await new Promise(r=>release=r);return ok(e.response)})
 await x.flow.restore();await x.flow.ask('first')
 const pending=x.flow.ask('second');while(!release)await new Promise(r=>setTimeout(r,0))
 x.setAuthority({scope:{...scope,store_id:key},permissions});release();await assert.rejects(pending)
 assert.equal(x.flow.getSnapshot().phase,'permission');assert.equal(x.flow.getSnapshot().chat,null);assert.deepEqual(x.flow.getSnapshot().history,[])
})
test('021 English technical Summary preserves backend wording and distinct source',async t=>{
 const e=fixtures.examples[7],x=assistant(e);let captured
 const response=structuredClone(e.response);response.data.result.locale='en';response.data.result.detail_level='technical';response.data.result.answer='Backend-provided exact retained explanation.'
 transport(t,async(u,o)=>{captured=JSON.parse(o.body);return ok(response)})
 await x.flow.restore();x.flow.setPresentation({option_id:null,locale:'en',detail_level:'technical'});await x.flow.generateSummary()
 assert.equal(captured.locale,'en');assert.equal(captured.detail_level,'technical');assert.equal(x.flow.getSnapshot().summary.result.answer,response.data.result.answer)
})
test('021 stale HTTP conflict locks context and does not auto-create a replacement',async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);let calls=0
 transport(t,async()=>{calls++;return ok({data:null,meta:{request_id:'stale'},error:{code:'EVIDENCE_VERSION_CONFLICT',message:'stale',details:{}}},409)})
 await x.flow.restore();await assert.rejects(x.flow.ask('question'));assert.equal(x.flow.getSnapshot().phase,'stale');assert.equal(x.flow.getSnapshot().chat,null)
 await assert.rejects(x.flow.ask('again'));assert.equal(calls,1)
})
for(const code of ['GENERATION_IN_PROGRESS','GENERATION_FAILED'])test(`021 ${code} distinguishes live uncertainty from a terminal Chat generation`,async t=>{
 const e=fixtures.integration_sequences[0],x=assistant(e);let calls=0
 transport(t,async()=>{calls++;return ok({data:null,meta:{request_id:'claim'},error:{code,message:code,details:{}}},409)})
 await x.flow.restore();await assert.rejects(x.flow.ask('question'))
 assert.equal(x.flow.getSnapshot().phase,code==='GENERATION_FAILED'?'error':'uncertain')
 assert.equal(x.flow.chatIntent.getSnapshot().status,code==='GENERATION_FAILED'?'failed':'unknown')
 assert.equal([...x.j.rows.values()][0].state,code==='GENERATION_FAILED'?'rejected':'unknown')
 assert.equal(calls,1)
})
test('021 bounded Summary polling stops without inventing terminal failure; explicit refresh remains a GET',async t=>{
 const e=fixtures.examples[7],x=assistant(e);let posts=0,gets=0
 const running={...e.response,data:{...e.response.data,status:'running',result:null,finished_at:null}}
 transport(t,async(u,o)=>{if(o.method==='POST')posts++;else gets++;return ok(running)})
 await x.flow.restore();await x.flow.generateSummary();for(let i=0;i<60;i++)await x.flow.pollSummary()
 await assert.rejects(x.flow.pollSummary());assert.equal(gets,60);assert.equal(x.flow.getSnapshot().summary.status,'running')
 await x.flow.refreshSummary();assert.equal(gets,61);assert.equal(posts,1);assert.equal(x.flow.getSnapshot().summaryPolls,0)
})
test('021 follow-ups carry server context as hints without pinning top-level Ingredient across topic switches',async t=>{
 const chain=fixtures.integration_sequences.slice(2,5),x=assistant(chain[0]),sent=[];let index=0
 transport(t,async(u,o)=>{sent.push(JSON.parse(o.body));return ok(chain[index++].response)})
 await x.flow.restore();await x.flow.ask(chain[0].body.question,{ingredient_id:chain[0].body.ingredient_id})
 await x.flow.ask(chain[1].body.question);await x.flow.ask(chain[2].body.question)
 assert.equal(sent[1].ingredient_id,null);assert.equal(sent[2].ingredient_id,null)
 assert.deepEqual(sent[1].context,chain[0].response.data.context);assert.deepEqual(sent[2].context,chain[1].response.data.context)
 assert.equal(x.flow.getSnapshot().chat.ingredient_id,chain[2].response.data.ingredient_id)
})
