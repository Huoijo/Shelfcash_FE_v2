import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createOperationsApi,checked} from '../src/features/operations/operations.data'
import {configureHttpSession,HttpError,requestPdf} from '../src/shared/http/httpClient'
import {Mutation} from '../src/features/operations/mutation'
import {captureProof,forgetProof} from '../src/features/auth/invitationProof'
import {authenticatedReturnPath} from '../src/features/auth/auth.navigation'
const BASE='https://controlled.invalid',s='f17e0000-0000-4000-8000-000000000000',p='00000000-0000-0000-0000-000000000011',id='00000000-0000-4000-8000-000000000023',key='00000000-0000-4000-8000-000000000024',at='2026-10-12T01:00:00Z'
const api=createOperationsApi(BASE),env=data=>({data,meta:{request_id:'controlled'},error:null}),response=data=>new Response(JSON.stringify(data),{status:200})
const schemaFixture=name=>JSON.parse(readFileSync(`api-contract-v2/docs/features/examples/s410/${name}.json`,'utf8'))
function stub(t,handler){t.mock.method(globalThis,'fetch',handler);const release=configureHttpSession({getCsrfToken:()=>'controlled-csrf',onUnauthenticated:()=>{}});t.after(release)}
const saved=()=>({saved_requirement_id:id,store_id:s,name:'Bộ đã lưu',version:'req/2',state:'active',created_at:at,updated_at:at,created_by_user_id:id,updated_by_user_id:id,requirements:{budget_limit:null,paths:[{path:'BASE',min_fill_rate_percent:'95',product_overrides:[]}]},default_reference:null,validation:{status:'valid',reason_codes:[]},warnings:[]})
const timeline=()=>({store_id:s,product_id:p,as_of_date:'2026-10-12',schedule_version:'schedule/1',catalog_version:'catalog/1',items:[],minimum_change_date:'2026-10-13'})
const preview=()=>({change_id:id,status:'preview_ready',preview_digest:'digest/1',store_id:s,product_id:p,as_of_date:'2026-10-12',schedule_version:'schedule/1',catalog_version:'catalog/1',minimum_change_date:'2026-10-13',evaluated_at:at,before:[],after:[],changed_ranges:[],new_contents:[],required_permissions:['recipe.manage_effectivity'],blockers:[],warnings:[],required_warning_acknowledgements:[],can_commit:true})
const recipeBody={phase:'preview',new_recipes:[],operations:[{kind:'WITHDRAW_FUTURE',recipe_ref:{recipe_id:id}}],reason:'Rút lịch'}

test('N7 uses public cookie transport without CSRF; preserves Unicode password',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(env({completed_at:at,next_action:'login'}))})
 const password='🔑'.repeat(12);await api.completeCredentials({token:'synthetic-proof',password})
 assert.equal(sent.u,BASE+'/api/v1/auth/credentials/complete');assert.equal(sent.o.credentials,'include');assert.equal(sent.o.referrerPolicy,'no-referrer');assert.equal(sent.o.headers.get('X-CSRF-Token'),null);assert.equal(JSON.parse(sent.o.body).password,password)
 await assert.rejects(api.completeCredentials({token:'x',password:'short'}));
})
test('fragment proof scrubbed before use; survives internal login in memory; no open redirect',()=>{
 forgetProof();let scrubbed=false;assert.equal(captureProof(id,'#token=synthetic',()=>{scrubbed=true}),'synthetic');assert.equal(scrubbed,true)
 assert.equal(captureProof(id,'',()=>{}),'synthetic');assert.equal(captureProof(p,'',()=>{}),null);forgetProof();assert.equal(captureProof(id,'',()=>{}),null)
 assert.equal(authenticatedReturnPath('/invitations/'+id),'/invitations/'+id);assert.equal(authenticatedReturnPath('//evil.invalid'),'/imports');assert.equal(authenticatedReturnPath('/invitations/'+id+'#token=secret'),'/imports')
})
test('N18 proof is header only and wrong invitation response fails closed',async t=>{
 const offer={invitation:{invitation_id:id,store:{store_id:s,name:'QA'},target_email:'qa@example.invalid',offered_grants:[],permission_catalog_version:'permissions-v2',permission_descriptors:[],version:'offer/1',status:'pending',issued_at:at,expires_at:'2026-10-19T01:00:00Z'},can_accept:true,reason_codes:[]}
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(env(offer))});await api.offer(id,'synthetic-proof');assert.equal(sent.o.headers.get('X-Invitation-Token'),'synthetic-proof');assert.equal(sent.u.includes('synthetic-proof'),false)
 offer.invitation.invitation_id=p;await assert.rejects(api.offer(id,'synthetic-proof'),e=>e.kind==='protocol')
})
test('N19 accepts true only with original CAS/idempotency and checks receipt locator',async t=>{
 let sent;const receipt={invitation_id:id,invitation_version_at_acceptance:'offer/1',store_id:s,membership_id:p,accepted_grants:[],authorization_version_at_acceptance:'auth/2',accepted_at:at,event_id:key}
 stub(t,async(u,o)=>{sent={u,o};return response(env(receipt))});const intent={key,version:'offer/1',request:{token:'synthetic',accept:true}}
 await api.accept(id,intent);assert.equal(sent.o.headers.get('If-Match'),'"offer/1"');assert.equal(sent.o.headers.get('Idempotency-Key'),key);assert.equal(sent.o.headers.get('X-CSRF-Token'),'controlled-csrf');assert.deepEqual(JSON.parse(sent.o.body),intent.request)
 await assert.rejects(api.accept(id,{...intent,request:{token:'synthetic',accept:false}}));receipt.invitation_id=p;await assert.rejects(api.accept(id,intent),e=>e.kind==='protocol')
})
test('N14 and N16 events keep view/pagination and reject wrong Store',async t=>{
 let url;const payload={...env({items:[]}),meta:{request_id:'qa',pagination:{limit:50,next_cursor:null,total_count:0}}};stub(t,async(u)=>{url=u;return response(payload)})
 await api.permissionEvents(s,'opaque cursor');assert.equal(new URL(url).searchParams.get('cursor'),'opaque cursor')
 await api.invitationEvents(s,id);assert.equal(new URL(url).searchParams.get('invitation_id'),id);assert.equal(new URL(url).searchParams.get('view'),'events');assert.equal(url.includes('permission-events'),false)
})
test('N9 uses supported filters, preserves signed cursor, rejects wrong Store/invalid dates',async t=>{
 const payload=schemaFixture('n9_response');let url;stub(t,async(u)=>{url=u;return response(payload)})
 const store=payload.data.items[0].store_id;const r=await api.history(store,{status:'queued',forecast_start_from:'2026-10-10',cursor:'signed/opaque+'});assert.equal(r.meta.pagination.total_count,3);assert.equal(new URL(url).searchParams.get('cursor'),'signed/opaque+');assert.equal(new URL(url).searchParams.get('sort'),'-accepted_at')
 await assert.rejects(api.history(s),e=>e.kind==='protocol');await assert.rejects(api.history(store,{forecast_start_from:'2026-02-30'}))
})
test('N1/N2/N3 wire preserve null, zero, [] and CAS; fresh read after write',async t=>{
 const data=saved(),sent=[];stub(t,async(u,o)=>{sent.push({u,o});return response(env(data))})
 const request={name:'Bộ đã lưu',requirements:{budget_limit:'0',paths:[{path:'BASE',min_fill_rate_percent:'0',product_overrides:[]}]}}
 await api.saveRequirements(s,{key,request});await api.saved(s,id);await api.saveRequirements(s,{key,version:'req/2',request:{...request,state:'active'}},id);await api.saveRequirements(s,{key,version:'req/2',request:{state:'archived'}},id)
 assert.deepEqual(sent.map(r=>r.o.method??'GET'),['POST','GET','PUT','PUT']);assert.equal(JSON.parse(sent[0].o.body).requirements.budget_limit,'0');assert.deepEqual(JSON.parse(sent[0].o.body).requirements.paths[0].product_overrides,[]);assert.equal(sent[2].o.headers.get('If-Match'),'"req/2"');assert.deepEqual(JSON.parse(sent[3].o.body),{state:'archived'})
 data.store_id=p;await assert.rejects(api.saved(s,id),e=>e.kind==='protocol')
})
test('N8 carries null clear vs zero and original threshold version',async t=>{
 let sent;const data={ingredient_id:id,minimum_usable_quantity:null,unit:'l',version:'threshold/2',updated_at:at,updated_by:p};stub(t,async(u,o)=>{sent=o;return response(env(data))})
 await api.threshold(s,id,{key,version:'unconfigured/1',request:{minimum_usable_quantity:null,unit:'l',reason:'Xóa ngưỡng'}});assert.equal(sent.headers.get('If-Match'),'"unconfigured/1"');assert.equal(JSON.parse(sent.body).minimum_usable_quantity,null)
 await assert.rejects(api.threshold(s,id,{key,version:'unconfigured/1',request:{minimum_usable_quantity:'0',unit:'l',reason:'Ngưỡng 0'}}),e=>e.kind==='protocol')
})
test('N20/N21/N22 carry both phase keys/CAS and verify retained scope',async t=>{
 const sent=[];let out=env(preview());stub(t,async(u,o)=>{sent.push({u,o});return response(out)})
 await api.changeRecipe(s,p,{key,version:'schedule/1',request:recipeBody});assert.equal(sent[0].o.headers.get('If-Match'),'"schedule/1"')
 out={...env(timeline()),meta:{request_id:'qa',pagination:{limit:50,next_cursor:null,total_count:0}}};await api.timeline(s,p);assert.equal(new URL(sent[1].u).searchParams.get('status'),'past,in_effect,scheduled,unassigned')
 out=env({change_id:id,status:'preview_ready',preview:preview(),receipt:null,audit:null});await api.change(s,p,id);out.data.preview.store_id=p;await assert.rejects(api.change(s,p,id),e=>e.kind==='protocol')
})
test('N21 blocked preview is not commit and invalid positive/loss constraints fail locally',async t=>{
 const data={...preview(),status:'blocked',can_commit:false,blockers:[{code:'OVERLAP',message:'Overlap',details:{entity:'product',entity_id:p,field:'assignment'}}]};stub(t,async()=>response(env(data)))
 const r=await api.changeRecipe(s,p,{key,version:'schedule/1',request:recipeBody});assert.equal(r.data.can_commit,false)
 await assert.rejects(api.changeRecipe(s,p,{key,version:'schedule/1',request:{...recipeBody,new_recipes:[{client_reference:'next',yield_quantity:'0',yield_unit:'cup',process_loss_rate:'1',ingredients:[{ingredient_id:id,quantity:'1',unit:'l'}]}]}}))
})
test('N10/N11/J01 use retained export locator and PDF job context, never JSON download',async t=>{
 const exp=schemaFixture('n10_response'),job=schemaFixture('j01_pdf_response');let sent;stub(t,async(u,o)=>{sent={u,o};return response(exp)})
 await api.exportPlan(exp.data.run_id,{key,request:{format:'pdf',locale:'vi',option_id:null}});assert.deepEqual(JSON.parse(sent.o.body),{format:'pdf',locale:'vi',option_id:null});assert.equal(sent.o.headers.get('Idempotency-Key'),key)
 t.mock.method(globalThis,'fetch',async()=>response(job));await api.exportJob(job.data.context.store_id,exp.data.run_id,exp.data.export_id,exp.data.job_id)
 await assert.rejects(api.exportJob(s,exp.data.run_id,exp.data.export_id,exp.data.job_id),e=>e.kind==='protocol')
})
test('PDF validates content type, bytes, receipt size/hash and cookie/no-referrer',async t=>{
 const bytes='%PDF-1.4\ncontrolled PDF bytes';let sent;stub(t,async(u,o)=>{sent={u,o};return new Response(bytes,{headers:{'Content-Type':'application/pdf'}})})
 const blob=await api.download(id,p);assert.equal(await blob.text(),bytes);assert.equal(sent.o.credentials,'include');assert.equal(sent.o.headers.get('Accept'),'application/pdf');assert.equal(sent.o.referrerPolicy,'no-referrer')
 const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(bytes))).toString('hex')
 await api.download(id,p,{run_id:id,resource_id:p,byte_count:blob.size,sha256:hash});await assert.rejects(api.download(id,p,{run_id:id,resource_id:p,byte_count:blob.size,sha256:'0'.repeat(64)}),e=>e.kind==='protocol')
 t.mock.method(globalThis,'fetch',async()=>new Response('{}',{headers:{'Content-Type':'application/json'}}));await assert.rejects(api.download(id,p),e=>e.kind==='protocol')
 t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:204}));await assert.rejects(api.download(id,p),e=>e.kind==='protocol')
 t.mock.method(globalThis,'fetch',async()=>new Response('not pdf!',{headers:{'Content-Type':'application/pdf'}}));await assert.rejects(api.download(id,p),e=>e.kind==='protocol')
})
for(const status of [401,403,409,412,422,503])test(`protected read/download HTTP ${status} stays API error without fallback`,async t=>{
 const failure={data:null,meta:{request_id:'qa'},error:{code:'CONTROLLED_ERROR',message:'Controlled',details:{}}};stub(t,async()=>new Response(JSON.stringify(failure),{status}))
 await assert.rejects(api.history(s),e=>e instanceof HttpError&&e.status===status);await assert.rejects(api.download(id,p),e=>e instanceof HttpError&&e.status===status)
})
test('PDF 401 invalidates current session and malformed successful JSON never succeeds',async t=>{
 let expired=0;stub(t,async()=>new Response(JSON.stringify({data:null,meta:{request_id:'qa'},error:{code:'SESSION_EXPIRED',message:'expired',details:{}}}),{status:401}));const release=configureHttpSession({getCsrfToken:()=>'token',onUnauthenticated:()=>expired++});t.after(release)
 await assert.rejects(requestPdf(BASE,'/download'));assert.equal(expired,1);assert.throws(()=>checked('Envelope_SavedDetail_',{}),e=>e.kind==='protocol')
})
test('ambiguous mutation retries exact key/body/version; confirmed receipt then failed read does not replay write',async()=>{
 const m=new Mutation(),seen=[];const action=async i=>{seen.push(i);if(seen.length===1)throw new HttpError('transport','lost response');return {ok:true}}
 await assert.rejects(m.send({amount:'0'},'v1',action));assert.equal(m.uncertain,true)
 await m.send({amount:'999'},'v2',action);assert.deepEqual(seen[0],seen[1]);assert.equal(m.uncertain,false);assert.equal(m.intent,null)
})
test('known conflict ends original intent; uncertain then conflict preserves uncertainty',async()=>{
 const m=new Mutation();await assert.rejects(m.send({},'v1',async()=>{throw new HttpError('contract','conflict',412)}));assert.equal(m.intent,null)
 await assert.rejects(m.send({},'v1',async()=>{throw new HttpError('transport','lost')}));const original=structuredClone(m.intent)
 await assert.rejects(m.send({},'v2',async()=>{throw new HttpError('contract','conflict',412)}));assert.equal(m.uncertain,true);assert.deepEqual(m.intent,original)
})
test('N16 cannot request events without invitation identity or accept another invitation payload',async t=>{
 let calls=0
 stub(t,async()=>{calls++;return response({...env({items:[{event_id:key,invitation_id:p,store_id:s,actor_user_id:null,occurred_at:at,kind:'CREATED',reason:null,before_version:null,after_version:'v1',before_offered_grants:null,after_offered_grants:[],recipient_user_id:null}]}),meta:{request_id:'qa',pagination:{limit:50,next_cursor:null,total_count:1}}})})
 await assert.rejects(api.invitationEvents(s,''));assert.equal(calls,0)
 await assert.rejects(api.invitationEvents(s,id),e=>e.kind==='protocol');assert.equal(calls,1)
})
test('credential and invitation proofs remain independent in memory and scrub both fragments',()=>{
 forgetProof();let scrubbed=0
 assert.equal(captureProof(id,'#token=invitation-proof',()=>scrubbed++),'invitation-proof')
 assert.equal(captureProof('credentials','#token=credential-proof',()=>scrubbed++),'credential-proof')
 forgetProof('credentials')
 assert.equal(captureProof(id,'',()=>{}),'invitation-proof')
 assert.equal(captureProof('credentials','',()=>{}),null)
 assert.equal(scrubbed,2);forgetProof()
})
