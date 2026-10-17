// Existing Vite/Playwright isolated component boundary, hydrated with HTTP blocked.
import fs from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
const family=process.argv[2]??'planning',run=process.argv[3]??'01'
if(!/^[a-z0-9-]+$/.test(run))throw Error('Use a fresh capture run label')
const output=path.resolve(`docs/testing/visual-intelligence-20261017/${family}-${run}`)
await fs.mkdir(output,{recursive:true})
const result=await build({configFile:false,plugins:[react()],logLevel:'error',define:{'process.env.NODE_ENV':JSON.stringify('production'),'import.meta.env.DEV':'true','import.meta.env.PROD':'false','import.meta.env.VITE_DATA_SOURCE':JSON.stringify('api'),'import.meta.env.VITE_API_BASE_URL':JSON.stringify('https://vi-controlled.invalid'),'import.meta.env':JSON.stringify({DEV:true,PROD:false,VITE_DATA_SOURCE:'api'})},build:{write:false,minify:false,lib:{entry:path.resolve('scripts/visual-intelligence.fixture.tsx'),formats:['iife'],name:'VIControlled'}}})
const assets=(Array.isArray(result)?result:[result]).flatMap(r=>r.output),code=assets.filter(a=>a.type==='chunk').map(a=>a.code).join('\n'),css=assets.filter(a=>a.type==='asset'&&a.fileName.endsWith('.css')).map(a=>a.source).join('\n')
const browser=await chromium.launch({headless:true,...(process.env.SHELFCASH_CHROMIUM_PATH?{executablePath:process.env.SHELFCASH_CHROMIUM_PATH}:{})})
const errors=[],unexpected=[],cases=[]
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'})
  page.on('pageerror',e=>errors.push(e.message))
  const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><style>${css}\n@media(min-width:951px){#root{margin-left:240px}}\n</style><body><div id="root"></div></body></html>`
  let activeScenario=''
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url())
    if(url.href==='https://vi-controlled.invalid/')return route.fulfill({contentType:'text/html',body:html})
    const response=await page.evaluate(path=>window.viResponses?.[path],url.pathname)
    if(url.origin==='https://vi-controlled.invalid'&&route.request().method()==='GET'&&response&&activeScenario==='inventory-loading')return
    if(url.origin==='https://vi-controlled.invalid'&&route.request().method()==='GET'&&response&&['inventory-error','inventory-permission','menu-permission'].includes(activeScenario))return route.fulfill({status:activeScenario==='inventory-error'?503:403,json:{data:null,meta:{request_id:'controlled-denial'},error:{code:activeScenario==='inventory-error'?'TEMPORARILY_UNAVAILABLE':'PERMISSION_DENIED',message:'Controlled read failure',details:{}}}})
    if(url.origin==='https://vi-controlled.invalid'&&route.request().method()==='GET'&&response)return route.fulfill({json:response})
    if(url.origin==='https://vi-controlled.invalid'&&url.pathname.endsWith('/today')&&route.request().method()==='GET'){
      if(activeScenario==='today-loading')return
      if(activeScenario==='today-error'||activeScenario==='today-denial')return route.fulfill({status:activeScenario==='today-denial'?403:503,contentType:'application/json',body:JSON.stringify({data:null,meta:{request_id:'controlled'},error:{code:activeScenario==='today-denial'?'PERMISSION_DENIED':'TEMPORARILY_UNAVAILABLE',message:'Controlled error',details:{}}})})
      const section={availability:activeScenario==='today-permission'?'forbidden':'unknown',value:null,updated_at:null,completeness:'unknown',reason_codes:[],source:null}
      return route.fulfill({json:{data:{store_id:url.pathname.split('/')[4],sections:{inventory:section,planning:section,readiness:section}},meta:{request_id:'controlled',snapshot_id:'today/1',observed_at:'2026-10-10T03:00:00Z',as_of_date:'2026-10-10',timezone:'Asia/Ho_Chi_Minh'},error:null}})
    }
    unexpected.push(url.href);return route.abort()
  })
  await page.goto('https://vi-controlled.invalid/');await page.addScriptTag({content:code})
  const scenarios=family==='planning'?['setup-default','setup-no-ceiling','setup-zero','setup-permission','setup-loading','setup-error','setup-blocked','result-default','result-no-winner','result-partial','result-historical','result-strategies','ingredient-default','ingredient-gaps','ingredient-no-series']:family==='today'?['today-default','today-error','today-permission']:family==='inventory'?['inventory-default','inventory-partial','inventory-empty','inventory-expired','inventory-unknown','inventory-movements']:family==='input'?['mapping-owner','mapping-staff','mapping-unknown','readiness-default','readiness-warning','readiness-permission','history-default','history-empty','history-unknown','history-loading']:family==='menu'?['menu-default','menu-mixed','menu-no-recipe','menu-empty','menu-direct','menu-duplicate','menu-zero']:[]
  if(family==='today')scenarios.push('today-loading','today-denial')
  if(family==='planning')scenarios.push('ingredient-isolated')
  if(family==='input')scenarios.push('history-error','history-permission')
  if(family==='inventory')scenarios.push('inventory-loading','inventory-error','inventory-permission')
  if(family==='menu')scenarios.push('menu-permission')
  for(const width of [1440,390])for(const scenario of scenarios){
    await page.setViewportSize({width,height:1000})
    activeScenario=scenario
    await page.evaluate(s=>window.renderVi(s),scenario)
    await page.waitForTimeout(30)
    if(family==='today'&&scenario!=='today-loading')await page.locator('.sc-vi-state:not([data-state="loading"])').waitFor()
    if(family==='inventory'&&!['inventory-loading','inventory-error','inventory-permission'].includes(scenario)){
      await page.locator('.sc-inventory-vi').waitFor()
      if(scenario==='inventory-movements'){await page.getByRole('tab',{name:'Biến động',exact:true}).click();await page.locator('.sc-inventory-deltas').waitFor()}
    }
    if(scenario==='inventory-error'||scenario==='inventory-permission')await page.locator('.inventory-error').waitFor()
    if(family==='menu')await page.locator('.sc-menu-vi,.menu-error').first().waitFor()
    const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,charts:document.querySelectorAll('.sc-pvi-trajectory svg').length,text:document.body.innerText,belowFloor:[...document.querySelectorAll('[class^="sc-vi-"],[class^="sc-pvi-"],[class^="sc-inventory-"],[class^="sc-menu-vi"]')].flatMap(e=>[...e.querySelectorAll('*'),e]).filter(e=>e.getClientRects().length&&e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<11).map(e=>({className:e.className,size:getComputedStyle(e).fontSize})),vi:[...document.querySelectorAll('.sc-vi-state,.sc-vi-card,.sc-pvi-context')].map(e=>({className:e.className,width:e.getBoundingClientRect().width}))}))
    assert.equal(metrics.overflow,false,`${scenario} ${width} document overflow`)
    assert.deepEqual(metrics.belowFloor,[],`${scenario} ${width} VI typography floor`)
    if(scenario==='ingredient-no-series')assert.equal(metrics.charts,0)
    if(scenario==='setup-zero')assert.match(metrics.text,/mẫu số là 0/)
    if(scenario==='setup-no-ceiling')assert.match(metrics.text,/Không cấu hình/)
    if(scenario==='today-default')assert.match(metrics.text,/DATA CONTRACT REQUIRED/)
    if(scenario==='today-permission')assert.equal(await page.locator('.sc-vi-state').getAttribute('data-state'),'permission')
    if(scenario==='today-error')assert.equal(await page.locator('.sc-vi-state').getAttribute('data-state'),'error')
    if(scenario==='today-denial')assert.equal(await page.locator('.sc-vi-state').getAttribute('data-state'),'permission')
    if(scenario==='history-error'||scenario==='history-permission')assert.equal(await page.locator('.sc-vi-state').getAttribute('data-state'),scenario==='history-error'?'error':'permission')
    if(scenario==='ingredient-isolated'){
      assert.equal(await page.locator('.sc-pvi-demand-point').count(),1)
      assert.equal(await page.locator('.sc-pvi-ending-point').count(),1)
    }
    if(scenario==='today-loading')assert.equal(await page.locator('.sc-vi-state').getAttribute('data-state'),'loading')
    if(scenario==='inventory-loading'||scenario==='inventory-error'||scenario==='inventory-permission'||scenario==='menu-permission')assert.equal(await page.locator('.sc-inventory-vi,.sc-menu-vi').count(),0)
    if(scenario==='mapping-owner'||scenario==='mapping-staff')assert.match(metrics.text,/Ghép tự động/)
    if(scenario==='readiness-warning')assert.equal(await page.locator('.sc-vi-readiness li[data-state="attention"]').count(),1)
    if(scenario==='readiness-default')assert.equal(await page.locator('.sc-vi-readiness li[data-state="complete"]').count(),0)
    if(scenario==='readiness-permission')assert.equal(await page.locator('.sc-vi-readiness li[data-state="permission"]').count(),4)
    if(scenario==='history-default')assert.match(metrics.text,/7 lần nhập/)
    if(scenario==='menu-mixed')assert.equal(await page.locator('.sc-menu-vi-group').count(),2)
    if(scenario==='menu-duplicate'||scenario==='menu-zero'){
      assert.equal(await page.locator('.menu-error').count(),1)
      assert.equal(await page.locator('.sc-menu-vi').count(),0)
    }
    const file=`${scenario}-${width}.png`
    await fs.access(path.join(output,file)).then(()=>{throw Error('Capture exists')},e=>{if(e.code!=='ENOENT')throw e})
    await page.screenshot({path:path.join(output,file),fullPage:true})
    let detailFile=null
    let keyboardFile=null
    if(scenario==='ingredient-default'){
      const pathButton=page.getByRole('button',{name:'HIGH',exact:true})
      await pathButton.focus();await page.keyboard.press('Space')
      assert.equal(await pathButton.getAttribute('aria-pressed'),'true')
      const summary=page.locator('.sc-pvi-point-values summary').first()
      await summary.focus();await page.keyboard.press('Enter')
      assert.equal(await summary.evaluate(el=>el.parentElement.open),true)
      keyboardFile=`${scenario}-${width}-keyboard.png`
      await page.screenshot({path:path.join(output,keyboardFile),fullPage:true})
    }
    if(family==='inventory'&&await page.locator('.sc-inventory-vi,.sc-inventory-deltas').count()||family==='menu'&&await page.locator('.sc-menu-vi').count()){
      const target=family==='inventory'?(scenario==='inventory-movements'?'.sc-inventory-deltas':'.sc-inventory-vi'):'.sc-menu-vi'
      await page.locator(target).scrollIntoViewIfNeeded()
      detailFile=`${scenario}-${width}-detail.png`
      await page.screenshot({path:path.join(output,detailFile),fullPage:true})
    }
    cases.push({scenario,width,file,detailFile,keyboardFile,metrics})
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[])
  console.log(JSON.stringify({family,cases:cases.length,status:'PASS'}))
}finally{
  await fs.writeFile(path.join(output,'capture.json'),JSON.stringify({kind:'CONTROLLED_HYDRATED_PRODUCTION_COMPONENTS',browser:browser.version(),errors,unexpected,cases},null,2)+'\n');await browser.close()
}

