import './frozen-policy.test.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createBackendCapabilitiesApi, CapabilityInputError } from '../src/features/backend-capabilities/capabilities.data'
import { createCapabilityReadState, createCapabilityMutationState } from '../src/features/backend-capabilities/capabilities.state'
import { capabilityOperations } from '../src/features/backend-capabilities/capabilities.wire'
import { configureHttpSession } from '../src/shared/http/httpClient'

const BASE='https://controlled.invalid', id='00000000-0000-4000-8000-000000000001', other='00000000-0000-4000-8000-000000000002', key='00000000-0000-4000-8000-000000000003', at='2026-10-16T01:00:00Z'
const api=createBackendCapabilitiesApi(BASE)
const envelope=(data,meta={request_id:'controlled'})=>({data,meta,error:null})
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})
const fixture=name=>JSON.parse(readFileSync(`shelfcash_FE_handoff_869eaec9/examples/${name}.json`,'utf8'))
const page=(items=[],extra={})=>envelope({items},{request_id:'controlled',pagination:{limit:20,next_cursor:null,total_count:items.length},snapshot_id:'snap/1',observed_at:at,...extra})
const problem=(status,code='TEST_DENIED')=>response({data:null,meta:{request_id:'controlled'},error:{code,message:'Controlled rejection',details:{}}},status)
function stub(t,handler){t.mock.method(globalThis,'fetch',handler);const release=configureHttpSession({getCsrfToken:()=>'controlled-csrf',onUnauthenticated:()=>{}});t.after(release)}
const submission=()=>({submission_id:id,store_id:id,profile_id:id,import_id:id,sheet_id:id,file_id:id,submitted_by_user_id:id,submitted_at:at,reason:'Explicit submission',version:'submission/1',state:'submitted',proposal_revision:'proposal/1',mapping_revision:'mapping/1',import_revision:'import/1',file_set_version:'files/1',lifecycle_revision_at_submission:'lifecycle/1',spec_digest:'spec/1',expected_active_version:null,review_eligibility:{eligible:true,reason_codes:[]},current_profile:{lifecycle_revision:'lifecycle/1',active_version:null,reviewed_version_retired:false},decision:null,allowed_actions:['withdraw']})
const permission=()=>({request_id:id,store_id:id,requester_membership_id:id,requester_user_id:id,requested_permissions:['supplier.read'],grants_at_submission:[],current_grants:[],approved_permissions:[],actually_added_permissions:[],permission_catalog_version:'catalog/1',grants_version_at_submission:'grants/1',current_grants_version:'grants/1',version:'request/1',state:'pending',reason:'Reader needed',created_at:at,updated_at:at,decision:null,allowed_actions:['cancel']})
const mq=()=>({path:{import_id:id},key,revision:'import/1',body:{action:'submit',reason:'Review this profile',profile_id:id,proposal_revision:'proposal/1',mapping_revision:'mapping/1'}})

test('all published operations have callable typed services with exact method/path/status inventories',()=>{
 const spec=JSON.parse(readFileSync('contracts/016/openapi.main.json','utf8'))
 const ids=[]
 for(const [path,verbs]of Object.entries(spec.paths))for(const [method,op]of Object.entries(verbs))if(op.operationId){ids.push(op.operationId);const def=capabilityOperations[op.operationId];assert.equal(def.path,path);assert.equal(def.method,method.toUpperCase());assert.deepEqual(def.statuses,Object.keys(op.responses).filter(s=>s.startsWith('2')).map(Number));assert.equal(typeof api.operations[op.operationId],'function')}
 assert.equal(ids.length,73);assert.deepEqual(Object.keys(capabilityOperations).sort(),ids.sort())
})
test('client construction and state construction perform no requests',t=>{
 let calls=0;stub(t,async()=>{calls++;throw Error('Unexpected I/O')});const a=createBackendCapabilitiesApi(BASE)
 createCapabilityReadState(a,'NF01');createCapabilityMutationState(a,'A02');assert.equal(calls,0)
 assert.throws(()=>createBackendCapabilitiesApi('https://user:password@host.invalid'))
})
test('A02/A06/A07 public mail acceptance carries no session CSRF and never auto-logs in or creates Store',async t=>{
 const calls=[];stub(t,async(u,o)=>{calls.push({u,o});return response(fixture('a02-email-accepted'),202)})
 await api.auth.register({body:fixture('a02-register-request')});await api.auth.requestVerification({body:{email:'qa@example.invalid'}});await api.auth.requestPasswordReset({body:{email:'qa@example.invalid'}})
 assert.equal(calls.length,3);for(const {o}of calls){assert.equal(o.credentials,'include');assert.equal(o.headers.get('X-CSRF-Token'),null);assert.equal(o.headers.get('Idempotency-Key'),null);assert.equal(o.referrerPolicy,'no-referrer')}
})
test('A05 and N7 remain distinct public token purposes; password preserved exactly, no automatic retry',async t=>{
 const calls=[];stub(t,async(u,o)=>{calls.push({u,o});return response(fixture('handoff-a05-response'))})
 const body={token:'synthetic-proof',password:'🔑'.repeat(12)}
 await api.auth.completeVerification({body});await api.auth.completeCredentials({body})
 assert.match(calls[0].u,/email-verifications\/complete$/);assert.match(calls[1].u,/credentials\/complete$/);assert.equal(JSON.parse(calls[0].o.body).password,body.password);assert.equal(calls[0].o.headers.get('X-CSRF-Token'),null)
 await assert.rejects(api.auth.completeVerification({body:{...body,password:'short'}}),CapabilityInputError);assert.equal(calls.length,2)
})
test('T03 accepts documented non-UUID ASCII key, explicit fields and only returns a Store receipt',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(fixture('t03-create-store-response'),201)})
 const body=fixture('t03-create-store-request'),r=await api.stores.create({key:'create-store:run-1',body})
 assert.equal(sent.u,BASE+'/api/v1/stores');assert.equal(sent.o.headers.get('Idempotency-Key'),'create-store:run-1');assert.equal(sent.o.headers.get('X-CSRF-Token'),'controlled-csrf');assert.deepEqual(JSON.parse(sent.o.body),body);assert.equal(r.data.role,'OWNER')
 await assert.rejects(api.stores.create({key:'bad key',body}),CapabilityInputError)
})
test('IN01 decline uses current session, proof in body and exact invitation CAS without acceptance side effects',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(fixture('handoff-in01-response'))})
 const invitation=fixture('handoff-in01-response').data.invitation_id
 await api.invitations.decline({path:{invitation_id:invitation},key,revision:'invitation-1',body:{token:'synthetic-proof',reason:'Decline for test'}})
 assert.match(sent.u,/\/decline$/);assert.equal(sent.o.headers.get('If-Match'),'"invitation-1"');assert.equal(sent.o.headers.get('X-CSRF-Token'),'controlled-csrf');assert.equal(sent.o.headers.get('X-Invitation-Token'),null)
})
test('MQ01 submits exactly one pinned profile and withdrawal uses submission fence; no approval/commit',async t=>{
 const sent=[];stub(t,async(u,o)=>{sent.push({u,o});return response(envelope(submission()),201)})
 await api.mapping.submitOrWithdraw(mq());await api.mapping.submitOrWithdraw({path:{import_id:id},key,revision:'import/2',body:{action:'withdraw',submission_id:id,expected_submission_version:'submission/1',reason:'Withdraw'}})
 assert.equal(sent.length,2);assert.match(sent[0].u,/\/mapping-submissions$/);assert.equal(sent[0].o.headers.get('If-Match'),'"import/1"');assert.deepEqual(JSON.parse(sent[0].o.body),mq().body);assert.equal(JSON.parse(sent[1].o.body).expected_submission_version,'submission/1')
})
test('MQ02 preserves scoped filters, counters and cursor; rejects cross-Store rows and repeating cursor',async t=>{
 let sent,out=page([submission()]);stub(t,async(u,o)=>{sent={u,o};return response(out)})
 const args={path:{store_id:id},query:{state:'submitted',import_id:id,file_id:id,limit:20,cursor:'signed+/='}}
 await api.mapping.list(args);assert.equal(new URL(sent.u).searchParams.get('cursor'),'signed+/=');assert.equal(sent.o.headers.get('X-CSRF-Token'),null)
 out=page([{...submission(),store_id:other}]);await assert.rejects(api.mapping.list(args),e=>e.kind==='protocol')
 out=page([submission()]);out.meta.pagination.next_cursor=args.query.cursor;await assert.rejects(api.mapping.list(args),e=>e.kind==='protocol')
})
test('MQ03 keeps captured spec/evidence and rejects changed submission pins or non-advancing evidence pages',async t=>{
 let sent,out=envelope({submission:submission(),source:{file_id:id,filename:'source.csv',sheet_id:id,sheet_name:'Sheet',source_system_key:'test',report_type:'sales',schema_signature:'shape/1',evidence_references:['source/1']},spec:{scope:{source_system_key:'test',report_type:'sales'},schema:'sales',structure:{sheet_roles:[],header_rules:[],schema_signature:'shape/1'},field_bindings:[],source_provenance:{declared_by:id,evidence_references:['source/1']}},warnings:[],missing_fields:[],evidence:{cells:[],next_cursor:null,total_count:0}})
 stub(t,async(u,o)=>{sent={u,o};return response(out)})
 const args={path:{store_id:id,submission_id:id},query:{evidence_limit:20,evidence_cursor:'signed-evidence+/='}},pin={submission_id:id,version:'submission/1',spec_digest:'spec/1'}
 const actual=await api.mapping.read(args,{submissionPin:pin});assert.equal(actual.data.spec.schema,'sales');assert.equal(new URL(sent.u).searchParams.get('evidence_cursor'),args.query.evidence_cursor)
 out.data.submission.version='submission/2';await assert.rejects(api.mapping.read(args,{submissionPin:pin}),e=>e.kind==='protocol')
 out.data.submission.version='submission/1';out.data.evidence.next_cursor=args.query.evidence_cursor;await assert.rejects(api.mapping.read(args),e=>e.kind==='protocol')
})
test('N5 request_changes carries lifecycle CAS plus explicit submission ID/version and remains separate from commit',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(envelope({profile_id:id,approved_version:null,active_version:null,lifecycle_revision:'life/2',decision_id:id,decided_at:at,audit_id:id,submission:{...submission(),state:'changes_requested'},notification_delivery:{status:'not_required',event_id:null}}))})
 const body={decision:'request_changes',proposal_revision:'proposal/1',reason:'Correct this field',submission_id:id,expected_submission_version:'submission/1'}
 const result=await api.mapping.decide({path:{store_id:id,profile_id:id},key,revision:'life/1',body});assert.equal(result.data.submission.state,'changes_requested')
 assert.match(sent.u,/\/decisions$/);assert.equal(sent.o.headers.get('If-Match'),'"life/1"');assert.deepEqual(JSON.parse(sent.o.body),body)
 await assert.rejects(api.mapping.decide({path:{store_id:id,profile_id:id},key,revision:'life/1',body:{...body,expected_submission_version:undefined}}),CapabilityInputError)
 t.mock.method(globalThis,'fetch',async()=>problem(403,'OWNER_REQUIRED'));await assert.rejects(api.mapping.decide({path:{store_id:id,profile_id:id},key,revision:'life/1',body}),e=>e.problem.code==='OWNER_REQUIRED')
})
test('NF01/NF02 bind snapshots and current count scope; NF03 accepts read/unread CAS without navigation',async t=>{
 const sent=[];let out=page([],{snapshot_id:'snap/1',observed_at:at});stub(t,async(u,o)=>{sent.push({u,o});return response(out)})
 await api.notifications.list({query:{unread:'true',store_id:id,limit:20}})
 out=envelope({unread_count:0,scope:'store',store_id:id},{request_id:'controlled',snapshot_id:'snap/1',observed_at:at});await api.notifications.count({query:{store_id:id,snapshot_id:'snap/1'}})
 out.meta.snapshot_id='snap/2';await assert.rejects(api.notifications.count({query:{store_id:id,snapshot_id:'snap/1'}}),e=>e.kind==='protocol')
 out=envelope({notification_id:id,read_at:at,version:'read/2'});await api.notifications.setRead({path:{notification_id:id},key,revision:'read/1',body:{read:true}})
 assert.equal(sent.at(-1).o.headers.get('If-Match'),'"read/1"');assert.deepEqual(JSON.parse(sent.at(-1).o.body),{read:true})
 out.data.read_at=null;await api.notifications.setRead({path:{notification_id:id},key,revision:'read/2',body:{read:false}})
 await assert.rejects(api.notifications.setRead({path:{notification_id:id},key,revision:'read/2',body:{read:true}}),e=>e.kind==='protocol')
 await assert.rejects(api.notifications.list({query:{unread:'yes'}}),CapabilityInputError)
})
test('PR01/02/03/04 preserve permission catalog/grants/request CAS and do not update session grants',async t=>{
 const sent=[];let out=envelope(permission());stub(t,async(u,o)=>{sent.push({u,o});return response(out, sent.length===1?201:200)})
 const body={reason:'Need reader',requested_permissions:['supplier.read'],permission_catalog_version:'catalog/1',expected_grants_version:'grants/1'}
 await api.permissions.submit({path:{store_id:id},key,body});assert.deepEqual(JSON.parse(sent[0].o.body),body)
 out=page([permission()]);out.data.permission_catalog_version='catalog/1';out.data.permission_catalog=[];await api.permissions.list({path:{store_id:id},query:{state:'pending'}})
 out=envelope(permission());await api.permissions.read({path:{store_id:id,request_id:id}})
 t.mock.method(globalThis,'fetch',async(u,o)=>{sent.push({u,o});return problem(412,'STALE_REQUEST')})
 await assert.rejects(api.permissions.act({path:{store_id:id,request_id:id},key,revision:'request/1',body:{action:'cancel',reason:'Withdraw'}}),e=>e.status===412)
 assert.equal(sent.at(-1).o.headers.get('If-Match'),'"request/1"')
 await assert.rejects(api.permissions.submit({path:{store_id:id},key,body:{...body,requested_permissions:['supplier.read','supplier.read']}}),CapabilityInputError)
})
test('EX01 retains explicit filters/snapshot and never downloads an arbitrary server URL',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return response(page([],{snapshot_id:'snap/1',observed_at:at}))})
 await api.exports.list({path:{plan_id:id},query:{option_id:'option+/=',status:'completed',snapshot_id:'snap/1'}},{snapshotId:'snap/1'})
 const u=new URL(sent.u);assert.equal(u.pathname,`/api/v1/procurement-plans/${id}/exports`);assert.equal(u.searchParams.get('option_id'),'option+/=')
 await assert.rejects(api.exports.list({path:{plan_id:id}},{snapshotId:'different'}),e=>e.kind==='protocol')
})
test('D01 is an explicit section reader, preserves unavailable/null sections and enables no Today UI',async t=>{
 let sent;const out=envelope({store_id:id,sections:{inventory:null,permissions:null}},{request_id:'controlled',snapshot_id:'today/1',observed_at:at,as_of_date:'2026-10-16',timezone:'Asia/Ho_Chi_Minh'})
 stub(t,async(u,o)=>{sent={u,o};return response(out)})
 const result=await api.operations.D01({path:{store_id:id},query:{section:'inventory',limit:5,snapshot_id:'today/1'}})
 assert.equal(result.data.sections.inventory,null);assert.equal(Object.hasOwn(result.data.sections,'planning'),false);assert.equal(new URL(sent.u).searchParams.get('section'),'inventory');assert.equal(sent.o.method,'GET')
 await assert.rejects(api.operations.D01({path:{store_id:id},query:{limit:21}}),CapabilityInputError)
})
test('retained export download verifies bytes/hash and ignores untrusted download_url',async t=>{
 const bytes='%PDF-1.4\ncontrolled retained artifact',digest=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(bytes))).toString('hex')
 const receipt={export_id:other,run_id:id,job_id:id,option_id:'option/1',created_by_user_id:id,created_at:at,status:'completed',result_digest:'result/1',render_version:'render/1',version:'export/1',artifact_availability:'available',completed_at:at,error_code:null,download_url:'https://untrusted.invalid/file',sha256:digest,byte_count:new TextEncoder().encode(bytes).length,allowed_actions:['download']}
 let url;stub(t,async(u)=>{url=u;return new Response(bytes,{headers:{'Content-Type':'application/pdf'}})})
 assert.equal(await (await api.exports.downloadRetained(receipt)).text(),bytes);assert.equal(url,BASE+`/api/v1/procurement-plans/${id}/exports/${other}`)
 await assert.rejects(api.exports.downloadRetained({...receipt,sha256:'0'.repeat(64)}),e=>e.kind==='protocol')
 await assert.rejects(api.exports.downloadRetained({...receipt,artifact_availability:'unverifiable'}),CapabilityInputError)
})
test('JSON, raw health, 204 logout and PDF modes validate the documented success status and payload',async t=>{
 let calls=0;stub(t,async()=>{calls++;return response({status:'ok',service:'test'})});assert.equal((await api.operations.health_health_get({})).status,'ok')
 t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:204}));assert.equal(await api.operations.A04({}),undefined)
 t.mock.method(globalThis,'fetch',async()=>new Response('%PDF-1.4\ncontrolled',{headers:{'Content-Type':'application/pdf'}}));const pdf=await api.exports.download({path:{plan_id:id,export_id:other}});assert.equal((await pdf.text()).slice(0,5),'%PDF-')
 t.mock.method(globalThis,'fetch',async()=>response(envelope({}),201));await assert.rejects(api.notifications.count({}),e=>e.kind==='protocol'&&e.status===201)
 t.mock.method(globalThis,'fetch',async()=>response({status:'ok',service:'test',unexpected:true}));await assert.rejects(api.operations.health_health_get({}),e=>e.kind==='protocol');assert.equal(calls,1)
})
test('I02 uploads named bytes and one explicit client ID per file without JSON/boundary rewriting',async t=>{
 let sent;stub(t,async(u,o)=>{sent={u,o};return problem(422,'CONTROLLED_FILE_REJECTED')})
 const file=new File(['a,b\n1,2'],'nguồn.csv',{type:'text/csv'}),args={path:{import_id:id},key,body:{files:[file],client_file_ids:[other]}}
 await assert.rejects(api.operations.I02(args),e=>e.problem.code==='CONTROLLED_FILE_REJECTED')
 assert.equal(sent.o.headers.get('Content-Type'),null);assert.equal(sent.o.body.get('files').name,'nguồn.csv');assert.equal(await sent.o.body.get('files').text(),'a,b\n1,2');assert.deepEqual(sent.o.body.getAll('client_file_ids'),[other])
 await assert.rejects(api.operations.I02({...args,body:{...args.body,client_file_ids:[]}}),CapabilityInputError)
})
test('N4 explicit create/update preconditions cannot be omitted or combined',async t=>{
 const sent=[];stub(t,async(u,o)=>{sent.push(o);return problem(409,'CONTROLLED_CONFLICT')})
 const body={amount:'0'}
 for(const precondition of [{ifNoneMatch:'*'},{revision:'budget/1'}])await assert.rejects(api.operations.N4({path:{store_id:id},key,body,...precondition}),e=>e.status===409)
 assert.equal(sent[0].headers.get('If-None-Match'),'*');assert.equal(sent[0].headers.get('If-Match'),null);assert.equal(sent[1].headers.get('If-Match'),'"budget/1"')
 for(const precondition of [{},{revision:'budget/1',ifNoneMatch:'*'}])await assert.rejects(api.operations.N4({path:{store_id:id},key,body,...precondition}),CapabilityInputError)
})
test('supplied planning helpers preserve exact custom request and known zero without changing default scope',async t=>{
 const calls=[];stub(t,async(u,o)=>{calls.push({u,o});return problem(403,'CONTROLLED_NO_RIGHTS')})
 const body=fixture('c02-custom-request')
 await assert.rejects(api.planning.contextForRequest(id,body));await assert.rejects(api.planning.readinessForRequest(id,body))
 for(const {u,o}of calls){assert.deepEqual(JSON.parse(new URL(u).searchParams.get('planning_request')),body);assert.equal(o.body,undefined)}
 assert.equal(new URL(calls[1].u).searchParams.get('actions'),'planning')
})
test('preflight rejects unknown properties, bad enum/UUID/cursor and unsafe revision before network',async t=>{
 let calls=0;stub(t,async()=>{calls++;return problem(422)})
 for(const args of [{path:{store_id:'not-uuid'}},{path:{store_id:id},query:{limit:0}},{path:{store_id:id},query:{cursor:''}},{path:{store_id:id},query:{state:'invented'}},{path:{store_id:id},query:{hidden:true}}])await assert.rejects(api.mapping.list(args),CapabilityInputError)
 for(const revision of ['x"y','x\ny','🔒'])await assert.rejects(api.mapping.submitOrWithdraw({...mq(),revision}),CapabilityInputError)
 await assert.rejects(api.auth.register({body:{email:'x@y.invalid',display_name:'x',password:'not allowed'}}),CapabilityInputError);assert.equal(calls,0)
})
test('reads cannot clear a newer session on stale 401; protected writes require current CSRF',async t=>{
 let expired=0,calls=0;const release=configureHttpSession({getCsrfToken:()=>null,onUnauthenticated:()=>expired++});t.after(release)
 t.mock.method(globalThis,'fetch',async()=>{calls++;return problem(401,'UNAUTHENTICATED')})
 await assert.rejects(api.mapping.submitOrWithdraw(mq()),e=>e.code==='CSRF_TOKEN_UNAVAILABLE');assert.equal(calls,0)
 await assert.rejects(api.notifications.count({}),e=>e.status===401);assert.equal(expired,1)
 const c=new AbortController();c.abort();await assert.rejects(api.notifications.count({},{signal:c.signal}));assert.equal(calls,1)
})
test('mutation state locks lost ACK and replays immutable original key/body/CAS only by explicit request',async t=>{
 const sent=[];let fail=true;stub(t,async(u,o)=>{sent.push({u,o});if(fail)throw new TypeError('Lost ACK');return response(envelope(submission()),201)})
 const state=createCapabilityMutationState(api,'MQ01'),args=mq()
 await assert.rejects(state.send(args));assert.equal(state.getState().status,'unknown');args.body.reason='Changed after send';args.revision='new/revision'
 await assert.rejects(state.send(args));fail=false;await state.replayExact();assert.equal(state.getState().status,'succeeded');assert.equal(sent.length,2);assert.equal(sent[0].o.body,sent[1].o.body);assert.equal(sent[1].o.headers.get('If-Match'),'"import/1"');assert.equal(sent[1].o.headers.get('Idempotency-Key'),key)
 await assert.rejects(state.replayExact());assert.equal(sent.length,2)
})
test('public email unknown and upload unknown cannot replay; dispose forgets intent without claiming rollback',async t=>{
 stub(t,async()=>{throw new TypeError('Lost ACK')})
 const email=createCapabilityMutationState(api,'A02');await assert.rejects(email.send({body:{email:'qa@example.invalid',display_name:'QA'}}));await assert.rejects(email.replayExact());assert.equal(email.getState().status,'unknown')
 const upload=createCapabilityMutationState(api,'I02');await assert.rejects(upload.send({path:{import_id:id},key,body:{files:[new File(['a'],'a.csv')],client_file_ids:[other]}}));await assert.rejects(upload.replayExact())
 upload.dispose();assert.equal(upload.getState().status,'disposed');await assert.rejects(upload.replayExact())
})
test('mutation state keeps uncertain 5xx/protocol outcomes and distinguishes certain rejection without auto retry',async t=>{
 let out=problem(412,'STALE_MAPPING');stub(t,async()=>out)
 const state=createCapabilityMutationState(api,'MQ01');await assert.rejects(state.send(mq()));assert.equal(state.getState().status,'rejected');assert.equal(state.getState().error.problem.code,'STALE_MAPPING')
 out=problem(503,'UNAVAILABLE');await assert.rejects(state.send(mq()));assert.equal(state.getState().status,'unknown')
 const second=createCapabilityMutationState(api,'MQ01');out=response(envelope({...submission(),import_id:other}),201);await assert.rejects(second.send(mq()));assert.equal(second.getState().status,'unknown')
 const gateway=createCapabilityMutationState(api,'MQ01');out=new Response('<html>gateway</html>',{status:400});await assert.rejects(gateway.send(mq()));assert.equal(gateway.getState().status,'unknown')
})
test('scoped read state ignores out-of-order responses and clears data on scope teardown',async t=>{
 const resolvers=[];stub(t,()=>new Promise(resolve=>resolvers.push(resolve)))
 const state=createCapabilityReadState(api,'NF02')
 const first=state.load({},'actorA/sessionA'),rejected=assert.rejects(first)
 const second=state.load({query:{store_id:id}},'actorB/sessionB/store1')
 resolvers[1](response(envelope({unread_count:2,scope:'store',store_id:id},{request_id:'controlled',snapshot_id:'snap/2',observed_at:at})));await second
 resolvers[0](response(envelope({unread_count:7,scope:'accessible',store_id:null},{request_id:'controlled',snapshot_id:'snap/1',observed_at:at})));await rejected
 assert.equal(state.getState().scope,'actorB/sessionB/store1');assert.equal(state.getState().result.data.unread_count,2);state.clear();assert.equal(state.getState().status,'idle')
})

// Published synthetic BE examples are independent fixtures, not live execution evidence.
const indexed=JSON.parse(readFileSync('shelfcash_FE_handoff_869eaec9/examples/index.json','utf8'))
for(const item of indexed.filter(x=>x.direction==='response'&&x.http_status>=200&&x.http_status<300))test(`published main fixture survives strict service boundary: ${item.file}`,async t=>{
 const output=JSON.parse(readFileSync('shelfcash_FE_handoff_869eaec9/'+item.file,'utf8')),def=capabilityOperations[item.operation_id]
 stub(t,async()=>response(output,item.http_status))
 const args={},path={}
 for(const name of Object.keys(def.request.properties.path.properties))path[name]=output.data?.[name]??(name==='plan_id'?output.data?.run_id:undefined)??output.data?.items?.[0]?.[name]??id
 if(Object.keys(path).length)args.path=path
 if(def.key)args.key=key;if(def.cas)args.revision='fixture/1'
 if(item.operation_id==='A01')args.body=fixture('a01-login-request')
 if(item.operation_id==='A02')args.body=fixture('a02-register-request')
 if(item.operation_id==='A05')args.body={token:'synthetic-proof',password:'long-test-password'}
 if(item.operation_id==='T03')args.body=fixture('t03-create-store-request')
 if(item.operation_id==='C02')args.body=fixture('c02-default-request')
 if(item.operation_id==='NF03')args.body={read:true}
 if(item.operation_id==='N19')args.body={token:'synthetic-proof',accept:true}
 if(item.operation_id==='IN01')args.body={token:'synthetic-proof',reason:'Explicit decline'}
 const actual=await api.call(item.operation_id,args);assert.deepEqual(actual,output)
})

test('a denied exact replay preserves original unknown outcome and original mutation fence', async t => {
 const calls=[]; let attempt=0
 stub(t,async(u,o)=>{calls.push(o);if(++attempt===1)throw new TypeError('Lost ACK');if(attempt===2)return problem(403,'PERMISSION_DENIED');return response(envelope(submission()),201)})
 const state=createCapabilityMutationState(api,'MQ01'), changes=[]
 const unsubscribe=state.subscribe(()=>changes.push(state.getState().status))
 await assert.rejects(state.send(mq())); await assert.rejects(state.replayExact())
 assert.equal(state.getState().status,'unknown');await assert.rejects(state.send({...mq(),key:other}))
 await state.replayExact();assert.equal(state.getState().status,'succeeded')
 assert.equal(calls.length,3);for(const call of calls){assert.equal(call.body,calls[0].body);assert.equal(call.headers.get('Idempotency-Key'),key)}
 assert.deepEqual(changes,['pending','unknown','pending','unknown','pending','succeeded']);unsubscribe()
})
test('documented email delivery configuration failure is retryable only as an explicit new request',async t=>{
 let calls=0;stub(t,async()=>{calls++;return problem(503,'EMAIL_DELIVERY_UNAVAILABLE')})
 for(const op of ['A02','A06','A07']){
  const state=createCapabilityMutationState(api,op),body=op==='A02'?{email:'qa@example.invalid',display_name:'QA'}:{email:'qa@example.invalid'}
  await assert.rejects(state.send({body}));assert.equal(state.getState().status,'rejected');await assert.rejects(state.replayExact());await assert.rejects(state.send({body}))
 }
 assert.equal(calls,6)
})

test('decline unknown requires matching N18 read before exact replay and terminal readback retires the writer',async t=>{
 let calls=0;stub(t,async()=>{calls++;throw Error('Lost ACK')})
 const state=createCapabilityMutationState(api,'IN01'),input={path:{invitation_id:id},key,revision:'invite/1',body:{token:'controlled-proof',reason:'Explicit decline'}}
 await assert.rejects(state.send(input));await assert.rejects(state.replayExact(),/Read the invitation/);assert.equal(calls,1)
 const offer={data:{invitation:{invitation_id:id,status:'pending',declined_at:null},can_decline:true}}
 assert.throws(()=>state.observeDecline({data:{...offer.data,invitation:{...offer.data.invitation,invitation_id:other}}}),/does not match/)
 state.observeDecline(offer);await assert.rejects(state.replayExact());assert.equal(calls,2)
 await assert.rejects(state.replayExact(),/Read the invitation/)
 state.observeDecline({data:{...offer.data,can_decline:false,invitation:{...offer.data.invitation,status:'declined',declined_at:at}}});assert.equal(state.getState().status,'reconciled');await assert.rejects(state.replayExact());assert.equal(calls,2)
})
