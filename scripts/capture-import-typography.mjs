// Same isolated component-build boundary as capture-visual-convergence.mjs.
// Hydrated actual production components; no server or live HTTP. Fresh evidence only.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.resolve(root, process.argv[2])
if (!output.startsWith(path.join(root,'docs','testing') + path.sep)) throw Error('Evidence must stay under docs/testing')
await fs.mkdir(output,{recursive:true})
const baseline=process.argv.includes('--baseline')
const apiSubmission=process.argv.includes('--api-submission')
const dataSource=apiSubmission?'api':'mock'
// These CSS files were clean at orientation; HEAD equals their starting worktree.
const baselineFiles=['src/features/import-data/components/ImportFlow.css','src/features/import-data/components/ImportResolve.css','src/features/import-data/components/ImportPreviewExplorer.css','src/pages/imports/ImportPage.css']
const baselinePlugin={name:'captured-clean-css-baseline',enforce:'pre',load(id){const relative=path.relative(root,id).replaceAll('\\','/');if(baseline&&baselineFiles.includes(relative))return execFileSync('git',['show',`b318e90888ba60c7c1c226e05855d1a1989f74a3:${relative}`],{cwd:root,encoding:'utf8'})}}
const result = await build({root,configFile:false,plugins:[baselinePlugin,react()],logLevel:'error',define:{'process.env.NODE_ENV':JSON.stringify('production'),'import.meta.env.DEV':'true','import.meta.env.PROD':'false','import.meta.env.VITE_DATA_SOURCE':JSON.stringify(dataSource),'import.meta.env.VITE_API_BASE_URL':JSON.stringify('http://localhost'),'import.meta.env':JSON.stringify({DEV:true,PROD:false,VITE_DATA_SOURCE:dataSource})},build:{write:false,minify:false,lib:{entry:path.join(root,'scripts/import-typography.fixture.tsx'),formats:['iife'],name:'ImportTypography'}}})
const assets = (Array.isArray(result)?result:[result]).flatMap(r=>r.output)
const code = assets.filter(a=>a.type==='chunk').map(a=>a.code).join('\n')
const css = assets.filter(a=>a.type==='asset'&&a.fileName.endsWith('.css')).map(a=>a.source).join('\n')
const browser = await chromium.launch({headless:true,...(process.env.SHELFCASH_CHROMIUM_PATH?{executablePath:process.env.SHELFCASH_CHROMIUM_PATH}:{})})
const networkAttempts = [], states=[], interactions=[], intercepted=[]
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'})
  const errors=[]
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.message)})
  const html='<!doctype html><html lang="vi"><meta charset="utf-8"><style>'+css+'\n@media(min-width:951px){#root{margin-left:240px}}\n</style><body><div id="root"></div></body></html>'
  let activeScenario=''
  await page.route('**/*',route=>{
    if(route.request().url()==='http://localhost/__controlled_import_typography__')return route.fulfill({contentType:'text/html',body:html})
    if(apiSubmission&&route.request().method()==='GET'){
      const id='00000000-0000-4000-8000-000000000041',staff='00000000-0000-4000-8000-000000000042',store='00000000-0000-4000-8000-000000000021',at='2026-10-12T03:00:00Z'
      const actor=activeScenario==='submission-own'?'00000000-0000-4000-8000-000000000001':staff
      const pathname=new URL(route.request().url()).pathname
      const envelope=data=>({data,meta:{request_id:'controlled-typography',pagination:{limit:50,next_cursor:null,total_count:1}},error:null})
      let data
      if(pathname===`/api/v1/stores/${store}/mapping-submissions/${id}`)data={submission:{submission_id:id,store_id:store,profile_id:id,import_id:id,sheet_id:id,file_id:id,submitted_by_user_id:actor,submitted_at:at,reason:'Staff reviewed source',version:'submission/1',state:'submitted',proposal_revision:'proposal/1',mapping_revision:'mapping/1',import_revision:'import/1',file_set_version:'files/1',lifecycle_revision_at_submission:'lifecycle/1',spec_digest:'spec/1',expected_active_version:null,review_eligibility:{eligible:true,reason_codes:[]},current_profile:{lifecycle_revision:'lifecycle/1',active_version:null,reviewed_version_retired:false},decision:null,allowed_actions:['approve_activate','request_changes','reject']},source:{file_id:id,filename:'source.csv',sheet_id:id,sheet_name:'Sheet',source_system_key:'test',report_type:'sales',schema_signature:'shape/1',evidence_references:['source/1']},spec:{scope:{source_system_key:'test',report_type:'sales'},schema:'sales',structure:{sheet_roles:[],header_rules:[],schema_signature:'shape/1'},field_bindings:[],source_provenance:{declared_by:staff,evidence_references:['source/1']}},warnings:[],missing_fields:[],evidence:{cells:[],next_cursor:null,total_count:0}}
      if(pathname===`/api/v1/stores/${store}/memberships`)data={permission_catalog:[],items:[{membership_id:id,user:{user_id:staff,email:'staff@example.invalid',display_name:'Real Staff'},role:'STAFF',active:true,grants:[],version:'grants/1',updated_at:at}]}
      if(data){intercepted.push(pathname);return route.fulfill({contentType:'application/json',json:envelope(data)})}
    }
    networkAttempts.push(route.request().url());return route.abort()
  })
  await page.goto('http://localhost/__controlled_import_typography__')
  await page.addScriptTag({content:code})
  for(const width of [1440,390]) for(const role of apiSubmission?['OWNER']:['OWNER','STAFF']) {
    const scenarios=apiSubmission?['submission-staff','submission-own']:['file-ready','analyze-source','source-evidence','resolve-complete','resolve-manual','resolve-identity','resolve-declaration','resolve-unit','resolve-permission','preview-warnings','review-awaiting','commit-optional','commit-review','commit-permission','commit-uncertain','complete-ready','complete-blocked','history-calendar','profile-reusable','domain-history',...(role==='OWNER'?['profile-review','profile-dirty']:['resolve-changed','resolve-waiting'])]
    for(const scenario of scenarios) {
      await page.setViewportSize({width,height:1000})
      activeScenario=scenario
      await page.evaluate(async({role,scenario})=>window.renderImport(role,scenario),{role,scenario})
      if(apiSubmission){
        await page.getByRole('heading',{name:'source.csv · Sheet'}).waitFor()
        if(scenario==='submission-staff'){
          await page.getByRole('button',{name:'Yêu cầu chỉnh sửa',exact:true}).click()
          await page.getByLabel('Lý do quyết định').fill('Clarify unit evidence')
          await page.getByRole('checkbox').check()
          if(await page.getByRole('button',{name:'Xác nhận',exact:true}).isDisabled())throw Error('Valid Staff request changes must be enabled')
        } else if(await page.getByRole('button',{name:'Yêu cầu chỉnh sửa',exact:true}).count())throw Error('Owner self proposal must not offer request changes')
      }
      await page.waitForTimeout(35)
      const file=`${role.toLowerCase()}-${scenario}-${width}.png`
      // Each run has a new directory; reject overwriting prior evidence.
      try {await fs.access(path.join(output,file));throw Error('Capture already exists: '+file)} catch(e) {if(e.code!=='ENOENT')throw e}
      const screenshotScenarios=new Set(['resolve-manual','source-evidence','profile-review','profile-reusable','preview-warnings','review-awaiting','commit-optional','commit-review','commit-uncertain','complete-blocked','history-calendar','domain-history','submission-staff','submission-own'])
      if(screenshotScenarios.has(scenario))await page.screenshot({path:path.join(output,file),fullPage:true})
      const metrics=await page.evaluate(()=>{
        const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'
        const leaf=[...document.querySelectorAll('#root *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))
        const undersized=leaf.filter(e=>parseFloat(getComputedStyle(e).fontSize)<10&&!e.closest('[aria-hidden=true]')).map(e=>({selector:e.className||e.tagName,text:e.textContent.slice(0,80),size:getComputedStyle(e).fontSize}))
        const controls=[...document.querySelectorAll('button,input:not([type=checkbox]):not([type=radio]),select,textarea')].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({text:e.textContent.slice(0,60),size:getComputedStyle(e).fontSize}))
        const semanticFloors=[
          ['.input-context-evidence,.input-context-evidence p,.input-resolver-help,.input-status,.input-status p,.input-review-receipt,.import-flow__profile-comparison>section,.input-domain-grid p,.input-domain-review>p,.import-flow__check,.input-decision-ack',12],
          ['.input-profile-rule-group small,.input-card-result span,.input-resolver-meta span,.input-summary-strip span,.input-source dt,.import-flow__spec dt,th',11],
          ['.input-samples>span,.input-source dd,.input-resolver-scope-summary strong,.input-binding-preview strong,td',12],
        ]
        const semanticViolations=semanticFloors.flatMap(([selector,min])=>[...document.querySelectorAll(selector)].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)<min).map(e=>({selector:e.className||e.tagName,text:e.textContent.slice(0,60),size:getComputedStyle(e).fontSize,min})))
        const stepperTextOverflow=[...document.querySelectorAll('.input-steps li > div')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({text:e.textContent,width:e.clientWidth,scrollWidth:e.scrollWidth}))
        const clipped=leaf.filter(e=>!e.closest('.sr-only')&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&['hidden','clip'].includes(getComputedStyle(e).overflowX)).map(e=>({selector:e.className||e.tagName,text:e.textContent.slice(0,60)}))
        return {documentOverflow:document.documentElement.scrollWidth>innerWidth,undersized,controls,semanticViolations,stepperTextOverflow,clipped,roles:[...document.querySelectorAll('.input-context-evidence,.input-resolver-help,.input-steps small,.input-profile-rule-group small,.input-profile-rule-group .import-flow__profile-comparison>section,.input-status')].filter(visible).map(e=>({selector:e.className||e.tagName,size:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight})),stepperHeight:document.querySelector('.input-steps')?.clientHeight}
      })
      states.push({role,scenario,width,file:screenshotScenarios.has(scenario)?file:null,metrics})
      const captureInteraction=async(name,action)=>{
        await action()
        await page.waitForTimeout(35)
        const interactionFile=`${role.toLowerCase()}-${name}-${width}.png`
        await page.screenshot({path:path.join(output,interactionFile),fullPage:true})
        const checks=await page.evaluate(()=>{
          const dialog=document.querySelector('dialog[open]')
          if(!dialog)throw Error('Expected the real production dialog')
          const body=dialog.querySelector('.sc-flow-dialog-body'),footer=dialog.querySelector('.sc-flow-dialog-footer')
          // A sticky footer overlays the scrolling body's initial rect by design.
          // Check that the end of its content is reachable above actions at scroll end.
          dialog.scrollTop=dialog.scrollHeight
          body.scrollTop=body.scrollHeight
          const rect=body.getBoundingClientRect(),foot=footer?.getBoundingClientRect()
          const undersized=[...dialog.querySelectorAll('button,input:not([type=checkbox]),select,textarea')].filter(e=>e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.tagName)
          return {dialogWidth:dialog.getBoundingClientRect().width,documentOverflow:document.documentElement.scrollWidth>innerWidth,footerCollision:!!foot&&rect.bottom>foot.top+1,undersized}
        })
        interactions.push({role,scenario,name,width,file:interactionFile,checks})
        await page.keyboard.press('Escape')
      }
      if(scenario==='profile-review'||scenario==='profile-reusable')await captureInteraction(scenario+'-evidence',()=>page.getByRole('button',{name:'Xem bằng chứng →',exact:true}).first().click())
      if(scenario==='preview-warnings')await captureInteraction('preview-row-evidence',()=>page.getByRole('button',{name:'Chi tiết',exact:true}).first().click())
      if(scenario==='domain-history'){
        await captureInteraction('sales-before-after',()=>page.getByRole('button',{name:/Sheet nguồn/}).first().click())
        await captureInteraction('supplier-before-after',()=>page.getByRole('button',{name:/Sheet nguồn/}).last().click())
        await captureInteraction('history-correction',()=>page.getByRole('button',{name:'Chi tiết bản sửa',exact:true}).click())
      }
      if(scenario==='resolve-identity'){
        await page.getByPlaceholder('Tìm theo tên').fill('Sữa tươi')
        await page.getByRole('button',{name:/Sữa tươi.*ING-014/}).waitFor()
        await page.screenshot({path:path.join(output,`${role.toLowerCase()}-identity-results-${width}.png`),fullPage:true})
      }
    }
  }
  const receipt={kind:'CONTROLLED_HYDRATED_PRODUCTION_COMPONENTS',baseline,apiSubmission,zoom:1,viewports:[1440,390],browser:browser.version(),font:'Locally available Inter or system fallback; remote requests blocked',intercepted,interactions,networkAttempts,errors,states}
  await fs.writeFile(path.join(output,'capture.json'),JSON.stringify(receipt,null,2)+'\n')
  if(!baseline&&(errors.length||networkAttempts.length||states.some(s=>s.metrics.documentOverflow||s.metrics.undersized.length||s.metrics.controls.length||s.metrics.semanticViolations.length||s.metrics.stepperTextOverflow.length||s.metrics.clipped.length)||interactions.some(s=>s.checks.documentOverflow||s.checks.footerCollision||s.checks.undersized.length)))process.exitCode=1
  console.log(JSON.stringify({states:states.length,errors,networkAttempts,documentOverflow:states.filter(s=>s.metrics.documentOverflow).map(s=>[s.role,s.scenario,s.width]),undersized:states.reduce((n,s)=>n+s.metrics.undersized.length,0),controls:states.reduce((n,s)=>n+s.metrics.controls.length,0),clipped:states.reduce((n,s)=>n+s.metrics.clipped.length,0)}))
} finally {await browser.close()}
