// CONTROLLED ONLY: actual production drawer/workspace, existing fixtures, native IndexedDB.
// No app/BE server. Known documents/API replies only; unexpected requests abort AND fail.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { chromium, devices } from 'playwright'
const root=process.cwd().replaceAll('\\','/'), output=path.resolve(root,process.argv[2]??'docs/testing/planning-021/assistant-implementation')
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'shelfcash-pl01-controlled-'))
const origin='https://pl01-controlled.invalid', cases=[], screenshots=[], unexpected=[], errors=[], writes=[]
let context,page,replies=[],held=[],contextReads=0
const responses=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/planning-assistant-responses.json'),'utf8'))
const chat=responses.answer.data, summary=responses.summary.data
const envelope=data=>({data,meta:{request_id:'controlled-pl01'},error:null})
const routeReply=async(route,reply)=>{
 if(reply.hold){held.push({route,reply});return}
 if(reply.abort)return route.abort('failed')
 return route.fulfill({status:reply.status??200,json:reply.json??envelope(reply.data)})
}
const release=async()=>{for(let i=0;!held.length&&i<300;i++)await new Promise(r=>setTimeout(r,10));assert.ok(held.length,'expected intercepted pending request');for(const x of held.splice(0))await routeReply(x.route,{...x.reply,hold:false})}
function plan(...items){assert.equal(replies.length,0,'previous planned HTTP not consumed');replies.push(...items)}
const post=(data,opts={})=>({method:'POST',suffix:'/assistant/messages',data,...opts})
const create=(data,opts={})=>({method:'POST',suffix:'/assistant/summary',data,...opts})
const read=data=>({method:'GET',suffix:'/assistant/summary/'+data.generation_id,data})
const record=(id,name,extra={})=>cases.push({id,name,status:'PASS',boundary:'CONTROLLED_PRODUCTION_COMPONENT',...extra})
async function shot(name,narrow=false){
 if(narrow)await page.setViewportSize(devices['iPhone 13'].viewport)
 const file=name+(narrow?'-narrow':'-desktop')+'.png';await page.screenshot({path:path.join(output,file)});screenshots.push(file)
 const geom=await page.locator('.sc-copilot-drawer').evaluate(el=>({width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}))
 assert.equal(geom.overflow,false);assert.equal(geom.width,narrow?390:460);assert.equal(geom.right,geom.viewport)
 if(narrow)await page.setViewportSize({width:1440,height:1000})
}
try {
 await fs.mkdir(output,{recursive:true});await fs.symlink(path.join(root,'node_modules'),path.join(temp,'node_modules'),process.platform==='win32'?'junction':'dir')
 const src=path.join(root,'src').replaceAll('\\','/'),fixtures=path.join(root,'tests/fixtures/planning-assistant-preparation').replaceAll('\\','/')
 await fs.writeFile(path.join(temp,'entry.tsx'),`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{MemoryRouter}from'react-router';
import{PlanningAssistantDrawer}from'${src}/features/decision-planning/components/PlanningAssistantDrawer';
import{PlanningAssistantWorkspace}from'${src}/features/decision-planning/components/PlanningAssistantWorkspace';
import{PlanningResults}from'${src}/features/decision-planning/components/PlanningResults';
import{AuthContextValue}from'${src}/features/auth/auth.context';import{CurrentStore}from'${src}/features/store/store.context';
import{mockStoreContext}from'${src}/features/store/store.fixtures';import{planningRunFixture}from'${src}/features/decision-planning/planning.fixtures';
import{fixtureCatalog,qa,summaryFixture,clarificationFixture}from'${fixtures}';import responses from'${root}/tests/fixtures/planning-assistant-responses.json';
import{configureHttpSession}from'${src}/shared/http/httpClient';import{createIndexedDbRecoveryJournal,prepareRecoveryRecord}from'${src}/features/backend-capabilities/recovery.journal';
configureHttpSession({getCsrfToken:()=> 'controlled-fresh-csrf',onUnauthenticated:()=>{}});
window.qaJournal=createIndexedDbRecoveryJournal();window.qaEvents=[];
const mode=new URLSearchParams(location.search).get('case')??'runtime',scopeMode=new URLSearchParams(location.search).get('scope')??'chat';
const initial=planningRunFixture();const sf=summaryFixture('completed');
initial.run_id=scopeMode==='summary'?responses.summary.data.run_id:qa.run;initial.store_id=scopeMode==='summary'?sf.authority.scope.store_id:qa.store;initial.response_version=new URLSearchParams(location.search).get('version')??(scopeMode==='summary'?sf.harness.currentEvidenceVersion:qa.version);
const scope={actor_user_id:qa.actor,store_id:initial.store_id,sessionIdentity:'controlled-session'};
window.qaSeed=async(kind)=>{let record;if(kind==='chat')record=structuredClone(fixtureCatalog.UNCERTAIN_AFTER_RELOAD.records[0]);else record=await prepareRecoveryRecord('AS01',{path:{plan_id:initial.run_id},key:qa.key,body:{option_id:null,locale:'vi',detail_level:'simple',expected_evidence_version:initial.response_version}},scope);await window.qaJournal.reserve(record);await window.qaJournal.update(record.id,'unknown');};
window.qaSummary=responses.summary.data;window.qaInitialRun=initial;window.qaClarification=kind=>clarificationFixture(kind).application.chat;
window.qaReset=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('shelfcash-intent-journal-v1');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.length){db.close();resolve();return}const tx=db.transaction([...db.objectStoreNames],'readwrite');for(const name of db.objectStoreNames)tx.objectStore(name).clear();tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}});
function App(){const[denied,setDenied]=useState(false);const[run,setRun]=useState(initial),[storeId,setStoreId]=useState(initial.store_id),[permissions,setPermissions]=useState(['planning.result.read','budget.read','procurement.cost.read']),[actor,setActor]=useState(qa.actor),[session,setSession]=useState('controlled-session');window.qaRevoke=(right)=>setPermissions(p=>right?p.filter(x=>x!==right):[]);window.qaActor=()=>setActor('00000000-0000-4000-8000-000000000099');window.qaSession=()=>setSession('controlled-new-session');window.qaStore=()=>setStoreId('00000000-0000-4000-8000-000000000099');
 const store=mockStoreContext();store.store_id=storeId;store.membership.effective_permissions=permissions;if(new URLSearchParams(location.search).get('role')==='staff')store.membership.role='STAFF';
 const auth={state:{status:'authenticated',context:{user:{user_id:actor},session:{absolute_expires_at:session}}}};
 const fixture=mode==='UNAVAILABLE_KNOWN'?{...fixtureCatalog.UNAVAILABLE,chatIntent:{status:'idle'}}:mode==='SUMMARY_REQUEST_PENDING'?{...summaryFixture('initial'),application:{...summaryFixture('initial').application,phase:'sending',requestPending:true},summaryIntent:{status:'pending'}}:mode==='SUMMARY_RECOVERED_PREVIOUS_CONTEXT'?{...sf,application:{...sf.application,summaryContext:'previous'},harness:{...sf.harness,currentEvidenceVersion:'controlled-current/2'}}:fixtureCatalog[mode];
 const onEvent=(name,...args)=>window.qaEvents.push({name,args});
 const body=fixture? <div className="sc-copilot-workspace"><PlanningAssistantDrawer run={{...initial,run_id:fixture.application.summary?.run_id??fixture.records[0]?.resource_ids.plan_id??(mode.startsWith('SUMMARY')?responses.summary.data.run_id:initial.run_id),store_id:fixture.authority.scope.store_id,response_version:fixture.harness.currentEvidenceVersion}} state={{...fixture.application,requestPending:fixture.chatIntent.status==='pending'||fixture.summaryIntent.status==='pending'}} chatIntent={fixture.chatIntent} summaryIntent={fixture.summaryIntent} authorized={fixture.authority.permissions.length>0} contextStatus={fixture.harness.contextRead==='pending'?'refreshing':fixture.harness.contextRead==='validated'?'restored':'current'} question={qa.originalQuestion} onAsk={q=>onEvent('ask',q)} onCandidate={(...args)=>onEvent('candidate',...args)} onGenerate={p=>onEvent('generate',p)} onReadSummary={()=>onEvent('read')} onRecoverSummary={()=>onEvent('recover')} onRefreshContext={()=>onEvent('refresh')} onClose={()=>onEvent('close')} onNavigate={()=>onEvent('navigate')}/></div>:
 <PlanningAssistantWorkspace onAccessDenied={()=>setDenied(true)} key={actor+session+storeId} run={run} optionId={null} onRefreshContext={async()=>{const res=await fetch('/controlled-c03');const fresh=(await res.json()).data;setRun(fresh);return fresh}}>{(entry,why)=>!denied&&permissions.length===3?<PlanningResults run={run} assistantAction={entry} assistantWhy={why} busy={false} detailBusy={false} selectedOptionId={null} onSelectOption={()=>{}} onLoadIngredients={()=>{}} onMoreIngredients={()=>{}} onSelectIngredient={()=>{}} onLoadReasons={()=>{}} onNewPlan={()=>{}}/>:null}</PlanningAssistantWorkspace>;
 return <AuthContextValue.Provider value={auth}><CurrentStore.Provider value={{state:{status:'ready',store},currentStoreId:store.store_id,registerChangeGuard:()=>()=>{}}}><MemoryRouter>{body}</MemoryRouter></CurrentStore.Provider></AuthContextValue.Provider>};
createRoot(document.getElementById('root')).render(<App/>);`)
 await build({root:temp,configFile:false,logLevel:'error',define:{'import.meta.env.VITE_DATA_SOURCE':JSON.stringify('api'),'import.meta.env.VITE_API_BASE_URL':JSON.stringify(origin),'import.meta.env.DEV':'false','import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'api',VITE_API_BASE_URL:origin,DEV:false}),'process.env.NODE_ENV':JSON.stringify('production')},build:{lib:{entry:path.join(temp,'entry.tsx'),formats:['iife'],name:'PlanningAssistantControlled',cssFileName:'style',fileName:()=> 'bundle.js'},outDir:path.join(temp,'out'),minify:false}})
 const js=await fs.readFile(path.join(temp,'out/bundle.js'),'utf8');let css='';for(const f of await fs.readdir(path.join(temp,'out')))if(f.endsWith('.css'))css+=await fs.readFile(path.join(temp,'out',f),'utf8')
 const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#f6f6f6;font-family:Arial} ${css}</style><div id="root"></div><script>${js.replaceAll('</script>','<\\/script>')}</script></html>`
 context=await chromium.launchPersistentContext(path.join(temp,'profile'),{headless:true,...(process.env.SHELFCASH_CHROMIUM_PATH?{executablePath:process.env.SHELFCASH_CHROMIUM_PATH}:{}),viewport:{width:1440,height:1000},serviceWorkers:'block'})
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.origin===origin&&url.pathname==='/test'&&req.method()==='GET')return route.fulfill({contentType:'text/html',body:html})
  const reply=replies[0]
  if(url.origin===origin&&reply&&req.method()===reply.method&&url.pathname.endsWith(reply.suffix)){
   replies.shift();if(req.method()==='POST')writes.push({path:url.pathname,key:req.headers()['idempotency-key'],csrf:req.headers()['x-csrf-token'],body:req.postDataJSON()});if(url.pathname==='/controlled-c03')contextReads++
   return routeReply(route,reply)
  }
  unexpected.push({method:req.method(),url:req.url()});return route.abort()
 })
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(6000)
 const visit=async(name,scope='chat')=>{await page.goto(origin+'/test?case='+name+'&scope='+scope);await page.getByRole('dialog').waitFor()}
 const matrix=[
 ['P01','NORMAL_FIRST_OPEN','Bạn muốn hiểu gì về kế hoạch này?'],['P02','NORMAL_ANSWER',chat.answer],['P03','LOADING','ShelfCash đang xem kế hoạch này…'],
 ['P04','PERMISSION_DENIED','Không thể hiển thị thông tin này với quyền hiện tại.'],['P05','UNAVAILABLE','Không thể trả lời lúc này.'],
 ['P06','CLARIFICATION_INGREDIENT','Cần làm rõ một chi tiết'],['P07','CLARIFICATION_SIMILAR_INGREDIENTS','Cần làm rõ một chi tiết'],['P08','CLARIFICATION_OPTION','Cần làm rõ một chi tiết'],['P09','CLARIFICATION_PRODUCT','Cần làm rõ một chi tiết'],['P10','QUERY_UNSUPPORTED','ShelfCash chưa hỗ trợ câu hỏi này trong Planning hiện tại.'],
 ['P11','CONTEXT_STALE','Ngữ cảnh giải thích này đã cũ.'],['P12','CONTEXT_REFRESHING','ShelfCash đang đọc lại bằng chứng Planning hiện tại…'],['P13','CONTEXT_RESTORED','Đã thiết lập lại ngữ cảnh hiện tại.'],['P14','CONTEXT_RESTORED_UNRESOLVED','Ngữ cảnh mới không giải quyết lượt hỏi cũ.'],
 ['P15','UNCERTAIN_AFTER_RELOAD','Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.'],['P16','UNCERTAIN_BLOCKED_CONTINUATION','Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.'],['P17','UNCERTAIN_NEW_QUESTION_BLOCKED','Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.'],['P18','NEW_QUESTION_AFTER_KNOWN_TERMINAL','Lượt trước đã có kết quả xác định.'],
 ['P19','SUMMARY_INITIAL','TÓM TẮT PLANNING RUN'],['P20','SUMMARY_RUNNING','Tóm tắt vẫn đang được tạo'],['P21','SUMMARY_COMPLETED','TÓM TẮT ĐÃ TẠO'],['P22','SUMMARY_FAILED','Lần tạo tóm tắt này đã kết thúc không thành công.'],['P23','SUMMARY_SAFE_RECOVERY','Cần khôi phục lần tạo hiện có trước.'],['P24','SUMMARY_NEW_GENERATION','Cấu hình một bản tóm tắt mới'],
 ['P25','SUMMARY_VI_SIMPLE','Tiếng Việt · Simple'],['P26','SUMMARY_VI_TECHNICAL','Tiếng Việt · Technical'],['P27','SUMMARY_EN_SIMPLE','English · Simple'],['P28','SUMMARY_EN_TECHNICAL','English · Technical'],
 ['P29','LOADING_RETAINED_ANSWER','CÂU TRẢ LỜI TRƯỚC · ĐÃ BIẾT'],['P30','PERMISSION_DENIED_UNCERTAIN','Một lượt trước vẫn chưa có kết quả xác định.'],['P31','SUMMARY_REQUEST_PENDING','Đang gửi yêu cầu tạo tóm tắt'],['P32','SUMMARY_RECOVERED_PREVIOUS_CONTEXT','RETAINED SUMMARY · NGỮ CẢNH TRƯỚC']]
 const capture=new Set(['NORMAL_ANSWER','CLARIFICATION_SIMILAR_INGREDIENTS','CONTEXT_STALE','UNCERTAIN_AFTER_RELOAD','PERMISSION_DENIED_UNCERTAIN','SUMMARY_RUNNING','SUMMARY_SAFE_RECOVERY','SUMMARY_RECOVERED_PREVIOUS_CONTEXT','SUMMARY_COMPLETED','SUMMARY_FAILED'])
 for(const [id,name,text]of matrix){
  const before=writes.length;await visit(name)
  if(name==='SUMMARY_INITIAL')await page.getByRole('tab',{name:'Tóm tắt',exact:true}).click()
  if(name==='SUMMARY_NEW_GENERATION')await page.getByRole('button',{name:'Cấu hình bản tóm tắt mới',exact:true}).click()
  await page.getByText(text,{exact:false}).first().waitFor()
  assert.equal(await page.locator('.sc-copilot-prototype').count(),0)
  if(name.startsWith('CLARIFICATION_')){
   const radios=page.getByRole('radio');assert.ok(await radios.count()>1);assert.equal(await page.getByRole('button',{name:'Tiếp tục câu hỏi này'}).isDisabled(),true)
   assert.equal(await page.locator('[role="radio"][aria-checked="true"]').count(),0)
   await radios.first().focus();await page.keyboard.press('ArrowDown');assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('role')),'radio')
   await page.getByRole('button',{name:'Tiếp tục câu hỏi này'}).click();const events=await page.evaluate(()=>window.qaEvents);assert.equal(events.at(-1).name,'candidate')
   if(name==='CLARIFICATION_OPTION'){assert.match(await radios.first().innerText(),/qa-option-A/);assert.doesNotMatch(await radios.first().innerText(),/An toàn|Được chọn|winner|rank/)}
  }
  if(['P14','P15','P16','P17','P30'].includes(id)){
   assert.equal(await page.getByRole('button',{name:/^(Retry|Continue|Resume|Thử lại|Tiếp tục|Đặt câu hỏi mới|Bắt đầu câu hỏi mới|Tạo tóm tắt)/}).count(),0)
   assert.equal(await page.getByRole('textbox').count(),0);assert.equal(await page.getByText(chat.answer,{exact:true}).count(),0)
  }
  if(name==='SUMMARY_SAFE_RECOVERY'){assert.equal(await page.getByRole('button',{name:'Khôi phục lần tạo này',exact:true}).count(),1);assert.equal(await page.getByRole('button',{name:/Tạo.*mới/}).count(),0)}
  if(name.startsWith('PERMISSION'))assert.equal(await page.getByText(chat.answer,{exact:true}).count(),0)
  if(capture.has(name)){await shot(name.toLowerCase());await shot(name.toLowerCase(),true)}
  assert.equal(writes.length,before);record(id,name,{evidence:'Actual production render + fixture-bound interaction; no API dispatch claimed'})
 }
 // Runtime uses actual Workspace/owner/typed API/journal; no fixture-driven production state.
 const runtime=async(scope='chat',role='owner')=>{await page.goto(origin+'/test?case=runtime&scope='+scope+'&role='+role);await page.evaluate(()=>window.qaReset());await page.reload();await page.getByRole('button',{name:'Hỏi ShelfCash',exact:true}).waitFor()}
 const open=async()=>{await page.getByRole('button',{name:'Hỏi ShelfCash',exact:true}).click();await page.getByRole('dialog').waitFor()}
 const ask=async(q)=>{await page.getByRole('textbox',{name:'Hỏi thêm về Planning Run này'}).fill(q);await page.getByRole('button',{name:'Gửi câu hỏi'}).click()}
 await runtime();await open();plan(post(chat,{hold:true}));await ask('QA first explicit turn');await page.getByRole('status').waitFor();assert.equal(await page.getByRole('button',{name:'Gửi câu hỏi'}).isDisabled(),true);await release();await page.getByText(chat.answer,{exact:true}).waitFor()
 await shot('runtime-answer');plan(post(chat,{hold:true}));await ask('QA next explicit turn');await page.getByText('CÂU TRẢ LỜI TRƯỚC · ĐÃ BIẾT',{exact:true}).waitFor();await release();await page.getByText('LƯỢT MỚI ĐANG CHỜ',{exact:true}).waitFor({state:'detached'})
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>document.activeElement?.textContent?.includes('Hỏi ShelfCash'));assert.equal(await page.getByRole('button',{name:'Hỏi ShelfCash',exact:true}).evaluate(el=>el===document.activeElement),true);record('R01','real Chat first/next turn + retained answer + Escape/focus return')
 // Every clarification choice dispatches through actual AS03 with original question and returned ID.
 for(const kind of ['ingredient','similar-ingredients','option','product','unsupported']){
  await runtime();await open();const clarification=await page.evaluate(kind=>window.qaClarification(kind),kind)
  plan(post(clarification));await ask(clarification.clarification.original_question);await page.getByText('CÂU HỎI BAN ĐẦU',{exact:true}).waitFor()
  if(kind==='unsupported'){await page.getByRole('button',{name:'Đặt câu hỏi mới',exact:true}).click();await page.getByRole('textbox').waitFor();record('R02-'+kind,'real unsupported response → explicit new-question composer');continue}
  const n=writes.length;await page.getByRole('radio').nth(1).click();assert.equal(writes.length,n);const continued=structuredClone(chat);if(kind==='option'){continued.option_id=clarification.clarification.option_candidates[1].option_id;continued.context.option_id=continued.option_id}if(kind==='product')continued.context.product_id=clarification.clarification.product_candidates[1].product_id;plan(post(continued));await page.getByRole('button',{name:'Tiếp tục câu hỏi này'}).click();await page.getByText(chat.answer,{exact:true}).waitFor()
  const a=writes.at(-2),b=writes.at(-1);assert.equal(b.body.question,clarification.clarification.original_question);assert.notEqual(a.key,b.key)
  if(kind==='product'){assert.equal(b.body.context.product_id,clarification.clarification.product_candidates[1].product_id);assert.equal(Object.hasOwn(b.body,'product_id'),false)}
  else if(kind==='option')assert.equal(b.body.option_id,'qa-option-B');else assert.equal(b.body.ingredient_id,clarification.clarification.candidates[1].ingredient_id)
  record('R02-'+kind,'real explicit candidate preserves question and matching identity')
 }
 // Native metadata-only Chat survives reload/close; no automatic or replacement POST.
 await runtime();await open();plan(post(null,{abort:true}));await ask('QA unknown original');await page.getByText('Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.',{exact:true}).waitFor();const n=writes.length
 await page.reload();await open();await page.getByText('Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.',{exact:true}).waitFor();assert.equal(writes.length,n)
 const stored=await page.evaluate(()=>window.qaJournal.list('00000000-0000-4000-8000-000000000001',window.qaInitialRun.store_id));const unknown=stored.find(r=>r.operation_id==='AS03'&&r.state==='unknown');assert.ok(unknown);assert.equal(Object.hasOwn(unknown,'replay_input'),false)
 await page.getByRole('button',{name:'Đóng cửa sổ',exact:true}).click();await open();await page.getByText('Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước.',{exact:true}).waitFor();assert.equal(writes.length,n);record('R03','native IndexedDB AS03 metadata-only reload/close remains blocked')
 // Context reread is external, leaves original unknown intact.
 await runtime();await open();plan(post(null,{status:409,json:{data:null,meta:{request_id:'qa-stale'},error:{code:'EVIDENCE_VERSION_CONFLICT',message:'QA stale',details:{}}}}));await ask('QA stale original');await page.getByText('Ngữ cảnh giải thích này đã cũ.',{exact:true}).waitFor()
 plan({method:'GET',suffix:'/controlled-c03',hold:true,data:await page.evaluate(()=>({...window.qaInitialRun,response_version:'controlled-fresh/2'}))})
 await page.getByRole('button',{name:'Đọc lại dữ liệu Planning hiện tại'}).click();await page.getByText('ShelfCash đang đọc lại bằng chứng Planning hiện tại…',{exact:false}).waitFor();await release();await page.getByText('Ngữ cảnh mới không giải quyết lượt hỏi cũ.',{exact:true}).waitFor();assert.equal(contextReads,1);record('R04','real stale→external context refresh→fresh facts + unresolved Chat blocked')
 // Terminal/new Summary all 4 presentations, distinct keys, original receipt preserved.
 for(const locale of ['vi','en'])for(const detail of ['simple','technical']){
  await runtime('summary');await open();await page.getByRole('tab',{name:'Tóm tắt',exact:true}).click();const first=structuredClone(summary);first.generation_id=crypto.randomUUID();plan(create(first,{hold:true}));await page.getByRole('button',{name:'Tạo tóm tắt',exact:true}).click();await page.getByText('Đang gửi yêu cầu tạo tóm tắt',{exact:true}).waitFor();await release();await page.getByText('TÓM TẮT ĐÃ TẠO',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Cấu hình bản tóm tắt mới',exact:true}).click();await page.getByLabel('Ngôn ngữ',{exact:true}).selectOption(locale);await page.getByLabel('Chế độ',{exact:true}).selectOption(detail)
  const next=structuredClone(summary);next.generation_id=crypto.randomUUID();next.result.locale=locale;next.result.detail_level=detail;plan(create(next));await page.getByRole('button',{name:'Tạo bản tóm tắt mới',exact:true}).click();await page.getByText('TÓM TẮT ĐÃ TẠO',{exact:true}).waitFor()
  const a=writes.at(-2),b=writes.at(-1);assert.notEqual(a.key,b.key);assert.equal(b.body.locale,locale);assert.equal(b.body.detail_level,detail);record('R05-'+locale+'-'+detail,'B01 terminal→deliberate Summary new configuration/new key')
  // Use a fresh isolated journal between independent test scenarios only; never product recovery.
  await page.evaluate(()=>window.qaReset())
 }

 // A retained-running generation is inspected with AS02, never another POST.
 await runtime('summary');await open();await page.getByRole('tab',{name:'Tóm tắt',exact:true}).click()
 const running={...structuredClone(summary),status:'running',result:null,finished_at:null,error_code:null}
 plan(create(running));await page.getByRole('button',{name:'Tạo tóm tắt',exact:true}).click();await page.getByText('Tóm tắt vẫn đang được tạo',{exact:true}).waitFor();const postsBeforeRead=writes.length
 plan(read(summary));await page.getByRole('button',{name:'Đọc trạng thái hiện tại',exact:true}).click();await page.getByText('TÓM TẮT ĐÃ TẠO',{exact:true}).waitFor();assert.equal(writes.length,postsBeforeRead);record('R06','retained running→AS02 completed, zero polling POST')
 // Lost AS01 ACK, native reload under fresh C03, exact original replay, previous-context gate.
 await runtime('summary');await open();await page.getByRole('tab',{name:'Tóm tắt',exact:true}).click();plan(create(null,{abort:true}));await page.getByRole('button',{name:'Tạo tóm tắt',exact:true}).click();await page.getByText('Cần khôi phục lần tạo hiện có trước.',{exact:true}).waitFor();const original=writes.at(-1)
 assert.equal(await page.getByRole('button',{name:/Tạo.*mới/}).count(),0)
 await page.goto(origin+'/test?case=runtime&scope=summary&version=controlled-current-summary%2F2');await open();await page.getByText('Cần khôi phục lần tạo hiện có trước.',{exact:true}).waitFor()
 plan(create(summary));await page.getByRole('button',{name:'Khôi phục lần tạo này',exact:true}).click();await page.getByText('RETAINED SUMMARY · NGỮ CẢNH TRƯỚC',{exact:true}).waitFor();assert.deepEqual(writes.at(-1),original)
 await shot('runtime-previous-context');await shot('runtime-previous-context',true);record('R07','B02 native reload exact old-key/body AS01 replay displays previous context')
 const beforeRetainedReload=writes.length;await page.reload();await open();await page.getByText('Cần khôi phục lần tạo hiện có trước.',{exact:true}).waitFor();plan(read(summary));await page.getByRole('button',{name:'Khôi phục lần tạo này',exact:true}).click();await page.getByText('RETAINED SUMMARY · NGỮ CẢNH TRƯỚC',{exact:true}).waitFor();assert.equal(writes.length,beforeRetainedReload);record('R08','restored retained locator→AS02 old evidence read, no POST and B02 preserved')
 await page.getByRole('button',{name:'Tạo tóm tắt cho ngữ cảnh hiện tại',exact:true}).click();const current=structuredClone(summary);current.generation_id=crypto.randomUUID();current.result.identity.aggregate_digest='controlled-current-summary/2';plan(create(current));await page.getByRole('button',{name:'Tạo bản tóm tắt mới',exact:true}).click();await page.getByText('TÓM TẮT ĐÃ TẠO',{exact:true}).waitFor();assert.notEqual(writes.at(-1).key,original.key);assert.equal(writes.at(-1).body.expected_evidence_version,'controlled-current-summary/2');record('R09','previous terminal Summary→deliberate current-context generation/new key')
 // Each grant is authoritative even with an Owner label; late responses never return protected facts.
 for(const right of ['planning.result.read','budget.read','procurement.cost.read']){
  await runtime();await open();plan(post(chat));await ask('QA before revocation');await page.getByText(chat.answer,{exact:true}).waitFor();plan(post(chat,{hold:true}));await ask('QA pending during revocation');await page.getByText('LƯỢT MỚI ĐANG CHỜ',{exact:true}).waitFor()
  for(let i=0;!held.length&&i<300;i++)await new Promise(r=>setTimeout(r,10));await page.evaluate(right=>window.qaRevoke(right),right);await page.getByText('Không thể hiển thị nội dung Assistant với quyền hiện tại.',{exact:true}).waitFor();await release();await page.getByText('Một lượt trước vẫn chưa có kết quả xác định.',{exact:true}).waitFor()
  assert.equal(await page.getByText(chat.answer,{exact:true}).count(),0);assert.equal(await page.getByRole('textbox').count(),0);assert.equal(await page.getByRole('dialog').getByText(chat.run_id,{exact:false}).count(),0);record('R10-'+right,'revocation+pending/late response redacts protected DOM and retains uncertainty')
 }
 // Staff with the actual grants has the same UI and typed API capability.
 await runtime('chat','staff');await open();plan(post(chat));await ask('QA authorized Staff');await page.getByText(chat.answer,{exact:true}).waitFor();record('R11','Staff with all actual grants can ask; role label is not authority')
 // Same React composition, one owner and drawer for the contextual entry.
 await runtime();plan(post(chat));await page.getByRole('button',{name:'Vì sao?',exact:true}).click();await page.getByText(chat.answer,{exact:true}).waitFor();assert.equal(writes.at(-1).body.question,'Cho tôi xem bằng chứng');assert.equal(await page.getByRole('dialog').count(),1);record('R12','contextual Vì sao opens same production drawer and sends scoped canonical question')
 // Actor/session changes unmount the old owner; a late response cannot reappear.
 for(const change of ['qaActor','qaSession','qaStore']){
  await runtime();await open();plan(post(chat,{hold:true}));await ask('QA old identity pending');await page.getByRole('status').waitFor();for(let i=0;!held.length&&i<300;i++)await new Promise(r=>setTimeout(r,10));await page.evaluate(change=>window[change](),change);await page.getByRole('dialog').waitFor({state:'detached'});await release();if(change==='qaStore')await page.getByRole('button',{name:'Hỏi ShelfCash',exact:true}).waitFor({state:'detached'});else await open();assert.equal(await page.getByText(chat.answer,{exact:true}).count(),0);record('R13-'+change,'identity change disposes old owner and fences delayed answer')
 }

 await runtime();await open();assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Đóng Hỏi ShelfCash')
 const askTab=page.getByRole('tab',{name:'Hỏi',exact:true}),summaryTab=page.getByRole('tab',{name:'Tóm tắt',exact:true});await askTab.focus();await page.keyboard.press('ArrowRight');assert.equal(await summaryTab.getAttribute('aria-selected'),'true');assert.equal(await summaryTab.evaluate(el=>el===document.activeElement),true)
 await page.keyboard.press('ArrowLeft');assert.equal(await askTab.getAttribute('aria-selected'),'true');await page.getByRole('button',{name:'Đóng Hỏi ShelfCash',exact:true}).focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('textbox',{name:'Hỏi thêm về Planning Run này'}).evaluate(el=>el===document.activeElement),true)
 assert.equal(await page.getByRole('button',{name:'Gửi câu hỏi',exact:true}).isDisabled(),true);await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});record('R14','keyboard close focus, tab arrows/selection, focus wrap, named input, disabled send')

 await runtime();await open();plan(post(null,{status:409,json:{data:null,meta:{request_id:'qa-known-terminal'},error:{code:'GENERATION_FAILED',message:'QA authoritative terminal',details:{}}}}));await ask('QA terminal original');await page.getByText('Lượt trước đã có kết quả xác định.',{exact:true}).waitFor();const terminalKey=writes.at(-1).key;plan(post(chat));await ask('QA deliberate new question');await page.getByText(chat.answer,{exact:true}).waitFor();assert.notEqual(writes.at(-1).key,terminalKey);record('R15','known AS03 GENERATION_FAILED→explicit different question/new key')
 for(const status of [401,403,404]){
  await runtime();await open();plan(post(chat));await ask('QA before fresh denial');await page.getByText(chat.answer,{exact:true}).waitFor();plan(post(null,{status,json:{data:null,meta:{request_id:'qa-denial'},error:{code:status===401?'UNAUTHENTICATED':status===403?'PERMISSION_DENIED':'RESOURCE_NOT_FOUND',message:'QA fresh denial',details:{}}}}));await ask('QA denied operation');await page.getByText('Một lượt trước vẫn chưa có kết quả xác định.',{exact:true}).waitFor();assert.equal(await page.getByText(chat.answer,{exact:true}).count(),0);assert.equal(await page.getByRole('textbox').count(),0);record('R16-'+status,'fresh HTTP denial removes protected facts without rollback/new-intent assumption')
 }
 await visit('UNAVAILABLE_KNOWN');await page.getByRole('button',{name:'Về câu hỏi Planning',exact:true}).click();await page.getByRole('heading',{name:'Bạn muốn hiểu gì về kế hoạch này?',exact:true}).waitFor();record('R17','known unavailable/local failure returns to question surface without reclassifying unknown')
 assert.equal(replies.length,0);assert.equal(held.length,0);assert.equal(unexpected.length,0);assert.equal(errors.length,0)
 await fs.rm(path.join(output,'BROWSER_FAILURE.json'),{force:true})
 await fs.writeFile(path.join(output,'BROWSER_VERIFICATION.json'),JSON.stringify({status:'PASS',kind:'CONTROLLED_PRODUCTION_COMPONENT_BROWSER',canonical:{project:'458079658328604672',component:'458423352311304192',revision:'461952561365278720'},platform:process.platform,architecture:process.arch,pid:process.pid,browser:context.browser()?.version(),viewports:{desktop:{width:1440,height:1000,zoom:'100%'},narrow:devices['iPhone 13'].viewport},cases,screenshots,writes:writes.map(({body,...w})=>({...w,locale:body.locale,detail_level:body.detail_level})),contextReads,unexpected,errors,liveBE:'NOT RUN',provider:'NOT RUN',realMutations:0},null,2)+'\n')
 console.log(JSON.stringify({status:'PASS',cases:cases.length,screenshots:screenshots.length,writes:writes.length,unexpected}))
} catch(error) {await fs.writeFile(path.join(output,'BROWSER_FAILURE.json'),JSON.stringify({error:String(error),cases,unexpected,errors,body:await page?.locator('body').innerText().catch(()=>null)},null,2));throw error}
finally {await context?.close();await fs.rm(temp,{recursive:true,force:true})}
