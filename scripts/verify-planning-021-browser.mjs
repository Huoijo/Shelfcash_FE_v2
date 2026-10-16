// CONTROLLED_COMPONENT_BROWSER only: isolated synthetic providers, intercepted HTTP,
// real IndexedDB/reload/restart. No application server, live BE, accounts or workers.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {build} from 'vite'
import {chromium} from 'playwright'
const root=process.cwd(),output=path.resolve(root,process.argv[2]??'docs/testing/planning-021'),temp=await fs.mkdtemp(path.join(os.tmpdir(),'shelfcash-021-browser-'))
const origin='https://planning-021.invalid',ids={actor:'00000000-0000-4000-8000-000000000001',export:'00000000-0000-4000-8000-000000000004',job:'00000000-0000-4000-8000-000000000005',run:'d0900000-0000-4000-8000-000000000001',store:'f17e0000-0000-4000-8000-000000000000',option:'synthetic-basket/1'}
const at='2026-10-17T01:00:00Z',pdf=Buffer.from('%PDF-1.4\n% SYNTHETIC TRANSPORT FIXTURE ONLY\n%%EOF\n'),sha=createHash('sha256').update(pdf).digest('hex')
const env=(data,meta={})=>({data,meta:{request_id:'controlled-021',...meta},error:null})
const receipt=env({export_id:ids.export,run_id:ids.run,option_id:ids.option,status:'queued',job_id:ids.job,result_digest:'fixture-digest',render_version:'planning-pdf/3'},{poll_after_ms:2000})
const downloadUrl=`/api/v1/procurement-plans/${ids.run}/exports/${ids.export}`
const artifact={resource_type:'planning_pdf_export',resource_id:ids.export,run_id:ids.run,option_id:ids.option,download_url:downloadUrl,sha256:sha,byte_count:pdf.length,media_type:'application/pdf'}
const row={export_id:ids.export,run_id:ids.run,job_id:ids.job,option_id:ids.option,created_by_user_id:ids.actor,created_at:at,status:'completed',result_digest:'fixture-digest',render_version:'planning-pdf/3',version:'fixture-export/1',artifact_availability:'available',completed_at:at,error_code:null,download_url:downloadUrl,sha256:sha,byte_count:pdf.length,media_type:'application/pdf',allowed_actions:['download']}
let context,page,stage='running',deny=false,denyDiscoveryNext=false,postCount=0,downloadCount=0,unhandled=[],writes=[],pageErrors=[]
const cases=[]
const record=name=>cases.push({name,status:'PASS',evidence:'CONTROLLED_COMPONENT_BROWSER / INTERCEPTED_HTTP / NATIVE_INDEXEDDB'})
try{
 await fs.mkdir(output,{recursive:true});await fs.symlink(path.join(root,'node_modules'),path.join(temp,'node_modules'),'dir')
 const src=path.join(root,'src')
 await fs.writeFile(path.join(temp,'entry.tsx'),`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{MemoryRouter}from'react-router';
import{PlanExport}from'${src}/features/operations/PlanExport';import{AuthContextValue}from'${src}/features/auth/auth.context';import{CurrentStore}from'${src}/features/store/store.context';
import{mockStoreContext}from'${src}/features/store/store.fixtures';import{planningRunFixture}from'${src}/features/decision-planning/planning.fixtures';
import{configureHttpSession}from'${src}/shared/http/httpClient';import{createIndexedDbRecoveryJournal}from'${src}/features/backend-capabilities/recovery.journal';
configureHttpSession({getCsrfToken:()=> 'controlled-fresh-csrf',onUnauthenticated:()=>{}});
window.qaJournal=createIndexedDbRecoveryJournal();
const auth={state:{status:'authenticated',context:{user:{user_id:'${ids.actor}'},session:{absolute_expires_at:'2027-01-02T00:00:00Z'}}}};
function App(){const[denied,setDenied]=useState(false);const store=mockStoreContext();const role=new URLSearchParams(window.location.search).get('role');if(role==='staff')store.membership.effective_permissions=['menu.read','ingredient.read','inventory.read'];if(role==='foreign')store.store_id='00000000-0000-4000-8000-000000000099';return <AuthContextValue.Provider value={auth}><CurrentStore.Provider value={{state:{status:'ready',store},currentStoreId:store.store_id,registerChangeGuard:()=>()=>{}}}><MemoryRouter><div style={{padding:32,fontFamily:'Arial'}}><h1>CONTROLLED COMPONENT · Synthetic Planning PDF</h1>{denied?<p role="alert">Protected component removed after fresh denial</p>:<PlanExport run={planningRunFixture()} optionId={null} onAccessDenied={()=>setDenied(true)}/>}</div></MemoryRouter></CurrentStore.Provider></AuthContextValue.Provider>};createRoot(document.getElementById('root')).render(<App/>);`)
 await build({root:temp,configFile:false,logLevel:'error',define:{'import.meta.env.VITE_DATA_SOURCE':JSON.stringify('api'),'import.meta.env.VITE_API_BASE_URL':JSON.stringify(origin),'import.meta.env.DEV':'false','import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'api',VITE_API_BASE_URL:origin,DEV:false}),'process.env.NODE_ENV':JSON.stringify('production')},build:{lib:{entry:path.join(temp,'entry.tsx'),formats:['iife'],name:'Planning021',cssFileName:'style',fileName:()=> 'bundle.js'},outDir:path.join(temp,'out'),minify:false}})
 const js=await fs.readFile(path.join(temp,'out/bundle.js'),'utf8'),files=await fs.readdir(path.join(temp,'out'));let css='';for(const f of files.filter(f=>f.endsWith('.css')))css+=await fs.readFile(path.join(temp,'out',f),'utf8')
 const html=`<!doctype html><meta charset="utf-8"><style>${css}</style><div id="root"></div><script>${js.replaceAll('</script>','<\\/script>')}</script>`
 const start=async()=>{
  context=await chromium.launchPersistentContext(path.join(temp,'profile'),{headless:true,viewport:{width:1440,height:1000},acceptDownloads:true})
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url())
   if(url.origin===origin&&url.pathname==='/test')return route.fulfill({status:200,contentType:'text/html',body:html})
   if(url.origin!==origin){unhandled.push(req.url());return route.abort()}
   if(req.method()==='POST'&&url.pathname.endsWith('/exports')){postCount++;writes.push({key:req.headers()['idempotency-key'],body:req.postDataJSON(),csrf:req.headers()['x-csrf-token']});if(postCount===1)return route.abort('failed');return route.fulfill({status:202,json:receipt})}
   if(url.pathname===`/api/v1/jobs/${ids.job}`)return route.fulfill({json:env({job_id:ids.job,operation:'planning_pdf_export',status:stage,stage:stage==='completed'?'completed':'rendering',progress:stage==='completed'?1:null,created_at:at,started_at:at,completed_at:stage==='completed'?at:null,context:{store_id:ids.store,run_id:ids.run,export_id:ids.export},result:stage==='completed'?artifact:null,error:null},{poll_after_ms:2000})})
   if(url.pathname.endsWith('/exports')&&req.method()==='GET'){if(denyDiscoveryNext&&url.searchParams.has('cursor'))return route.fulfill({status:403,json:{data:null,meta:{request_id:'denied'},error:{code:'PERMISSION_DENIED',message:'Controlled denied',details:{}}}});return route.fulfill({json:env({items:[row]},{snapshot_id:'fixture-snapshot',observed_at:at,pagination:{limit:20,next_cursor:denyDiscoveryNext?'fixture-page2':null,total_count:denyDiscoveryNext?2:1}})})}
   if(url.pathname===downloadUrl){downloadCount++;if(deny)return route.fulfill({status:403,json:{data:null,meta:{request_id:'denied'},error:{code:'PERMISSION_DENIED',message:'Controlled denied',details:{}}}});return route.fulfill({contentType:'application/pdf',body:pdf,headers:{'content-length':String(pdf.length),'etag':`"${sha}"`,'content-disposition':'attachment; filename="synthetic.pdf"'}})}
   unhandled.push(req.url());return route.abort()
  })
  page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));await page.goto(`${origin}/test`);if(pageErrors.length)throw Error(pageErrors.join('; '))
 }
 await start()
 await page.getByRole('button',{name:'Xuất PDF',exact:true}).click()
 await page.getByRole('button',{name:'Xác nhận xuất PDF',exact:true}).click()
 await page.getByRole('heading',{name:'Chưa biết tác vụ đã được tạo hay chưa',exact:true}).waitFor()
 assert.equal(postCount,1);assert.ok(writes[0].key);assert.equal(writes[0].csrf,'controlled-fresh-csrf')
 await page.screenshot({path:path.join(output,'pdf-uncertain.png')});record('lost response retains unknown intent and disables replacement')
 await page.reload();await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();await page.getByRole('heading',{name:'Chưa biết tác vụ đã được tạo hay chưa',exact:true}).waitFor();assert.equal(postCount,1);record('native IndexedDB intent survives reload without automatic POST')
 const rows=await page.evaluate(async({actor,store})=>window.qaJournal.list(actor,store),ids);assert.equal(rows.length,1);assert.equal(rows[0].state,'unknown');assert.equal(rows[0].replay_input.key,writes[0].key)
 await context.close();await start();await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();await page.getByRole('heading',{name:'Chưa biết tác vụ đã được tạo hay chưa',exact:true}).waitFor();assert.equal(postCount,1);record('native IndexedDB intent survives isolated browser restart')
 await page.getByRole('button',{name:'Thử lại cùng yêu cầu',exact:true}).click()
 await page.getByRole('heading',{name:'Đang tạo PDF',exact:true}).waitFor();assert.equal(postCount,2);assert.deepEqual(writes[0],writes[1]);await page.screenshot({path:path.join(output,'pdf-processing.png')});record('explicit same-key/body replay accepts planning-pdf/3 then J01 processing')
 stage='completed';await page.getByRole('button',{name:'Kiểm tra tác vụ',exact:true}).click();await page.getByRole('heading',{name:'PDF đã sẵn sàng',exact:true}).waitFor();await page.screenshot({path:path.join(output,'pdf-completed.png')})
 const file=page.waitForEvent('download');await page.getByRole('button',{name:'Tải PDF',exact:true}).click();await file;await page.getByRole('heading',{name:'Tải PDF thành công',exact:true}).waitFor();assert.equal(postCount,2);record('J01 completed -> N11 verified synthetic PDF download; no new POST')
 await page.getByRole('button',{name:'Đóng',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Tiếp tục xuất PDF',exact:true}).waitFor();record('acknowledged receipt IDs restore after URL-free reload without new POST');await page.getByRole('button',{name:'Bản xuất đã có',exact:true}).click();await page.getByRole('button',{name:'Tải bản PDF đã có',exact:true}).waitFor();assert.equal(postCount,2);await page.screenshot({path:path.join(output,'retained-discovery.png')});record('EX01 rediscovery survives leaving/reload; allowed download action')
 const retainedFile=page.waitForEvent('download');await page.getByRole('button',{name:'Tải bản PDF đã có',exact:true}).click();await retainedFile;await page.getByRole('status').filter({hasText:'Đã tải và kiểm tra PDF.'}).waitFor();record('EX01 retained receipt -> N11 checksum-verified rediscovered download')
 deny=true;await page.getByRole('button',{name:'Tải bản PDF đã có',exact:true}).click();await page.getByRole('alert').filter({hasText:'Protected component removed'}).waitFor();assert.equal(await page.getByRole('button',{name:'Tải bản PDF đã có',exact:true}).count(),0);assert.equal(postCount,2);record('fresh N11 403 removes protected export component and accumulated rows')
 denyDiscoveryNext=true;await page.reload();await page.getByRole('button',{name:'Bản xuất đã có',exact:true}).click();await page.getByRole('button',{name:'Xem thêm bản xuất',exact:true}).click();await page.getByRole('alert').filter({hasText:'Protected component removed'}).waitFor();assert.equal(await page.getByRole('button',{name:'Tải bản PDF đã có',exact:true}).count(),0);record('fresh EX01 pagination 403 hides accumulated protected export rows')
 await page.goto(`${origin}/test?role=staff`);assert.equal(await page.getByRole('button',{name:'Xuất PDF',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Bản xuất đã có',exact:true}).count(),0);record('synthetic read-only Staff cannot open export generation/discovery')
 await page.goto(`${origin}/test?role=foreign`);assert.equal(await page.getByRole('button',{name:'Xuất PDF',exact:true}).count(),0);record('foreign Store context cannot mount another Store Run export actions')
 assert.equal(unhandled.length,0);assert.equal(pageErrors.length,0)
 const evidence={kind:'CONTROLLED_COMPONENT_BROWSER',status:'PASS',platform:process.platform,architecture:process.arch,browser:context.browser()?.version()??'Chromium persistent context',network:'ALL_INTERCEPTED; 0 live requests',liveBE:'NOT_RUN',fullAppE2E:'NOT_RUN',assistantProductUI:'NOT_RUN / DESIGN_GAPS',provider:'NOT_RUN',cases,postCount,downloadCount,unhandled,pageErrors,screenshots:['pdf-uncertain.png','pdf-processing.png','pdf-completed.png','retained-discovery.png']}
 await fs.writeFile(path.join(output,'BROWSER_VERIFICATION.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({status:'PASS',cases:cases.length,postCount,downloadCount,unhandled}))
}catch(error){console.error(JSON.stringify({pageErrors,unhandled,body:await page?.locator('body').innerText().catch(()=> 'unavailable')}));throw error}finally{await context?.close();await fs.rm(temp,{recursive:true,force:true})}
