// Non-live SSR component evidence. No app server, hydration, credentials or API calls.
import fs from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { build } from 'vite'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ledger = JSON.parse(await fs.readFile(path.join(root,'docs/testing/visual-fidelity/COPY_PROVENANCE_FINAL.json'),'utf8'))
const output = path.join(root,'docs/testing/visual-fidelity/copy-closure')
const temp = await fs.mkdtemp(path.join(tmpdir(),'shelfcash-copy-capture-'))
const files = new Set(ledger.items.filter(i=>i.classification==='UNSUPPORTED_COPY'||i.replacement).map(i=>path.join(root,i.file)))
const before = file => execFileSync('git',['show',`${ledger.baseline}:${path.relative(root,file).replaceAll('\\','/')}`],{cwd:root,encoding:'utf8'})
const originalFetch = globalThis.fetch
globalThis.fetch = () => { throw Error('SSR evidence must not dispatch a network request') }
let browser
try {
  await fs.symlink(path.join(root,'node_modules'),path.join(temp,'node_modules'),'dir')
  const src = path.join(root,'src').replaceAll('\\','/')
  await fs.writeFile(path.join(temp,'entry.tsx'), `
import {createElement as h} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {ImportHistoryList} from '${src}/features/import-history/components/ImportHistoryList'
import {StoreOverview} from '${src}/features/store-workspace/components/StoreOverview'
import {StoreOperatingDefaults} from '${src}/features/store-workspace/components/StoreOperatingDefaults'
import {PermissionRequests} from '${src}/features/store-workspace/components/PermissionRequests'
import {StoreActivityPage} from '${src}/features/operations/StoreActivityPage'
import {StoreBootstrap} from '${src}/features/store/StoreBootstrap'
import {CurrentStore} from '${src}/features/store/store.context'
import {AuthContextValue} from '${src}/features/auth/auth.context'
import {UnderConstructionButton} from '${src}/shared/UnderConstruction'
import {planningContextFixture} from '${src}/features/decision-planning/planning.fixtures'
const noop=()=>{},done=async()=>{}
export function markup(state){
 const role=state==='permission-staff'?'STAFF':'OWNER'
 const store={store_id:'f17e0000-0000-4000-8000-000000000000',name:'Controlled Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role,membership_id:'f17e0000-0000-4000-8000-000000000001',authorization_version:'fixture-v1',active:true,server_now:'2026-10-17T00:00:00Z',as_of_date:'2026-10-17',membership:{membership_id:'f17e0000-0000-4000-8000-000000000001',role,authorization_version:'fixture-v1',effective_permissions:['menu.read','budget.read','budget.update','planning.context.read','procurement.cost.read']},permission_catalog_version:'permissions-v3'}
 const provider={state:{status:'ready',store},currentStoreId:store.store_id,timezone:store.timezone,accessibleStores:[],hasMore:false,listBusy:false,listError:null,pagination:null,refresh:done,retry:noop,loadMore:done,selectStore:done,registerChangeGuard:()=>noop}
 const auth={state:{status:'authenticated',context:{user:{user_id:'f17e0000-0000-4000-8000-000000000010',email:'fixture@example.test',display_name:'Controlled Actor'},session:{expires_at:'2099-01-01',absolute_expires_at:'2099-01-01',csrf_token:'fixture-only'},default_store_id:null,accessible_store_count:0,authorization_version:'fixture-v1'}},refresh:done,login:done,logout:done}
 let component
 if(state==='overview')component=h(StoreOverview,{store})
 else if(state==='defaults')component=h(StoreOperatingDefaults,{store,planningContext:planningContextFixture(),canUpdateBudget:true,busy:false,onSaveBudget:noop})
 else if(state==='bootstrap')component=h(StoreBootstrap)
 else if(state.startsWith('permission-'))component=h(PermissionRequests,{store})
 else if(state==='activity')component=h(StoreActivityPage)
 else if(state==='construction')component=h(UnderConstructionButton,{feature:'Hỏi AI'},'Hỏi AI')
 else component=h(ImportHistoryList,{response:{data:{items:[]},meta:{unfiltered_date_count:state==='history-empty'?0:3}},timezone:store.timezone,firstLink:null,nextLink:null})
 return renderToStaticMarkup(h(MemoryRouter,null,h(AuthContextValue.Provider,{value:auth},h(CurrentStore.Provider,{value:provider},component))))
}
`)
  const renderers = {}
  for (const stage of ['before','after']) {
    await build({root,configFile:false,logLevel:'error',ssr:{noExternal:true},
      plugins:[{name:'copy-baseline',load(id){if(stage==='before'&&files.has(id))return before(id)}}],
      define:{'import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'api',DEV:false})},
      build:{ssr:path.join(temp,'entry.tsx'),outDir:path.join(temp,stage),emptyOutDir:true,minify:false,rollupOptions:{output:{entryFileNames:'capture.mjs'}}}})
    renderers[stage]=(await import(pathToFileURL(path.join(temp,stage,'capture.mjs')))).markup
  }
  const cssFiles=['src/index.css','src/shared/flow/FlowDialog.css','src/features/operations/Operations.css','src/features/store-workspace/components/StoreWorkspace.css','src/features/store/StoreBootstrap.css','src/features/import-data/components/ImportHelp.css','src/pages/import-history/ImportHistoryPage.css','src/features/auth/LoginForm.css','src/pages/login/LoginPage.css']
  const accent=await fs.readFile(path.join(root,'src/shared/styles/BrandAccent.css'),'utf8')
  const styles={}
  for(const stage of ['before','after'])styles[stage]=(await Promise.all(cssFiles.map(f=>stage==='before'?before(path.join(root,f)):fs.readFile(path.join(root,f),'utf8')))).join('\n').replace("@import './shared/styles/BrandAccent.css';",accent)
  await fs.mkdir(output,{recursive:true})
  browser=await chromium.launch({headless:true})
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1})
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  const networkAttempts=[]
  await page.route('**/*',route=>{networkAttempts.push(route.request().url());return route.abort()})
  const evidence={kind:'CONTROLLED_COMPONENT_EVIDENCE',modes:['STATIC_SSR_AUTHENTICATED_COMPONENTS','LOCAL_CLIENT_MOUNT_PUBLIC_MARKETING'],baseline:ledger.baseline,browser:browser.version(),platform:process.platform,arch:process.arch,viewport:{width:1440,height:1000},zoom:1,hydrated:false,authenticatedClientInteraction:'NOT RUN',publicClientInteraction:'CONTROLLED_ONLY',liveBE:'NOT RUN',noLiveBackend:true,networkAttempts,pageErrors,captures:[]}
  for(const state of ['overview','defaults','bootstrap','permission-owner','permission-staff','activity','construction','history-empty','history-filtered'])for(const stage of ['before','after']){
    await page.setContent('<!doctype html><html lang="vi"><meta charset="utf-8"><style>'+styles[stage]+'</style><body><main style="margin-left:240px;padding:24px 48px" data-controlled-component>'+renderers[stage](state)+'</main></body></html>')
    if(state==='construction')await page.locator('dialog').evaluate(el=>el.showModal())
    const file=path.join(output,state+'-'+stage+'.png')
    await page.screenshot({path:file,fullPage:true})
    const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.textContent),emptyParagraphs:[...document.querySelectorAll('p')].filter(e=>!e.textContent.trim()).length}))
    evidence.captures.push({state,stage,file:path.relative(root,file).replaceAll('\\','/'),metrics})
  }
  // Exercise only the public marketing component in a fully local client bundle.
  // MemoryRouter and blocked network requests prevent backend/navigation traffic.
  await fs.writeFile(path.join(temp,'public.tsx'), `
import {createElement as h} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter} from 'react-router'
import {HomePage} from '${src}/pages/home/HomePage'
import '${src}/index.css'
createRoot(document.getElementById('root')).render(h(MemoryRouter,null,h(HomePage)))
`)
  for(const stage of ['before','after']){
    const directory=path.join(temp,'public-'+stage)
    await build({root,configFile:false,logLevel:'error',plugins:[{name:'public-copy-baseline',load(id){if(stage==='before'&&files.has(id))return before(id)}}],
      define:{'import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'api',DEV:false}),'process.env.NODE_ENV':JSON.stringify('production')},
      build:{outDir:directory,emptyOutDir:true,minify:false,lib:{entry:path.join(temp,'public.tsx'),name:'CopyCapture',formats:['iife'],fileName:()=> 'public.js'}}})
    const assets=await fs.readdir(directory)
    const css=(await Promise.all(assets.filter(f=>f.endsWith('.css')).map(f=>fs.readFile(path.join(directory,f),'utf8')))).join('\n')
    const js=await fs.readFile(path.join(directory,'public.js'),'utf8')
    await page.setContent('<!doctype html><html lang="vi"><meta charset="utf-8"><style>'+css+'</style><body><div id="root"></div></body></html>')
    await page.addScriptTag({content:js})
    for(const [state,label] of [['public-pricing','Giá bán'],['public-resources','Tài nguyên']]){
      try{await page.getByRole('link',{name:label,exact:true}).first().click({timeout:5000})}
      catch(error){throw Error('Public component capture failed: '+JSON.stringify({stage,state,pageErrors,body:(await page.locator('body').innerText()).slice(0,300)})+'; '+error.message)}
      await page.locator('.sc-route-notice').waitFor()
      const message=await page.locator('.sc-route-notice span').textContent()
      const file=path.join(output,state+'-'+stage+'.png')
      await page.screenshot({path:file,fullPage:true})
      evidence.captures.push({state,stage,file:path.relative(root,file).replaceAll('\\','/'),controlledPublicClient:true,message})
    }
  }
  if(networkAttempts.length)throw Error('Unexpected network attempt')
  if(pageErrors.length)throw Error('Unexpected component page error: '+pageErrors.join('; '))
  await fs.writeFile(path.join(output,'capture.json'),JSON.stringify(evidence,null,2)+'\n')
  console.log(JSON.stringify({captures:evidence.captures.length,networkAttempts:networkAttempts.length}))
}finally{
  globalThis.fetch=originalFetch
  if(browser)await browser.close()
  await fs.rm(temp,{recursive:true,force:true})
}
