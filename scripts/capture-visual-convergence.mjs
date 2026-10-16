// Controlled component evidence only. No server, credentials, hydration or live API.
import fs from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { build } from 'vite'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.resolve(root, process.argv[2] ?? 'docs/testing/visual-fidelity/planning')
const beforeCss = process.argv[3]
const temp = await fs.mkdtemp(path.join(tmpdir(), 'shelfcash-visual-component-'))
let browser
try {
  await fs.symlink(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), 'dir')
  const src = path.join(root, 'src').replaceAll('\\', '/')
  await fs.writeFile(path.join(temp, 'entry.tsx'), `
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { PlanningSetup } from '${src}/features/decision-planning/components/PlanningSetup'
import { planningContextFixture, planningReadinessFixture } from '${src}/features/decision-planning/planning.fixtures'
import { buildPlanningSetupRequest } from '${src}/features/decision-planning/planning.format'
import { ImportFlow } from '${src}/features/import-data/components/ImportFlow'
import { ImportFlowWorkflow } from '${src}/features/import-data/importFlow.workflow'
import { PlanningHistoryPage } from '${src}/features/operations/PlanningHistoryPage'
import { CurrentStore } from '${src}/features/store/store.context'
const noop = () => {}
export function markup(state) {
  if (state.startsWith('import-')) {
    const workflow = new ImportFlowWorkflow({}, {refreshBatch:async()=>null})
    const value = {...workflow.getSnapshot(),batch:{import_id:'00000000-0000-4000-8000-000000000001',completion_available:true}}
    return renderToStaticMarkup(createElement(MemoryRouter,null,createElement('main',{className:'import-page'},createElement(ImportFlow,{
      state:value,workflow,role:state==='import-owner'?'OWNER':'STAFF',parentBusy:false,parentStale:false,canDecideProfile:state==='import-owner',canProposeMapping:true,
    }))))
  }
  if (state==='history-loading') return renderToStaticMarkup(createElement(MemoryRouter,null,createElement(CurrentStore.Provider,{value:{state:{status:'ready',store:{store_id:'00000000-0000-4000-8000-000000000001',authorization_version:'fixture-v1',timezone:'Asia/Ho_Chi_Minh',membership:{effective_permissions:['planning.result.read','budget.read','procurement.cost.read']}}}},},createElement(PlanningHistoryPage))))
  const context = planningContextFixture(state === 'missing-budget' ? { budget_ceiling: null } : {})
  const readiness = planningReadinessFixture()
  if (state === 'blocked') readiness.actions[0] = { ...readiness.actions[0], can_execute: false, availability: 'blocked', blockers: [{code:'INSUFFICIENT_HISTORY',source:'sales',scope:'STORE',entity_id:null,affected_dates:[],details:{}}] }
  return renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PlanningSetup,{
    context,busy:state==='busy',canCreate:state!=='permission',onCreate:noop,onAssessDate:noop,
    readiness:state==='readiness-error'?null:readiness,readinessBusy:state==='readiness-loading',readinessError:state==='readiness-error'?'Fixture: Không thể kiểm tra Readiness.':null,readinessDate:'2026-10-11',readinessRequestKey:JSON.stringify(buildPlanningSetupRequest(context,'2026-10-10','')),
  })))
}
`)
  await build({ root, configFile:false, logLevel:'error', ssr:{noExternal:['react','react-dom','react-router','motion','framer-motion','motion-dom','motion-utils']},
    define:{'import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'mock'})},
    build:{ssr:path.join(temp,'entry.tsx'),outDir:path.join(temp,'bundle'),emptyOutDir:true,minify:false,
      rollupOptions:{output:{entryFileNames:'capture.mjs'}}} })
  const { markup } = await import(pathToFileURL(path.join(temp,'bundle/capture.mjs')))
  const files = ['src/index.css','src/shared/flow/FlowDialog.css','src/features/operations/Operations.css','src/pages/imports/ImportPage.css','src/features/import-data/components/ImportFlow.css','src/features/import-data/components/ImportResolve.css','src/features/decision-planning/components/Planning.css']
  const styles = await Promise.all(files.map(f => fs.readFile(path.join(root,f),'utf8')))
  const accent = await fs.readFile(path.join(root,'src/shared/styles/BrandAccent.css'),'utf8')
  const css = async before => [...styles.slice(0,-1), before ? await fs.readFile(beforeCss,'utf8') : styles.at(-1)].join('\n').replace("@import './shared/styles/BrandAccent.css';",accent)
  await fs.mkdir(output,{recursive:true})
  browser = await chromium.launch({headless:true})
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1})
  const networkAttempts = []
  await page.route('**/*',route => { networkAttempts.push(route.request().url()); return route.abort() })
  const receipt = {kind:'CONTROLLED_STATIC_COMPONENT_RENDER',platform:process.platform,arch:process.arch,browser:browser.version(),viewport:{width:1440,height:1000,deviceScaleFactor:1},zoom:1,
    font:'Inter if locally installed; system fallback otherwise; no remote font fetch',notLive:true,hydrated:false,shell:'240px blank inset; component capture only',states:[],networkAttempts}
  for (const state of ['default','blocked','busy','permission','missing-budget','readiness-loading','readiness-error','advanced','mobile','import-owner','import-staff','history-loading']) {
    for (const stage of state==='default' && beforeCss ? ['before','after'] : ['after']) {
      await page.setViewportSize({width:state==='mobile'?390:1440,height:1000})
      await page.setContent('<!doctype html><html lang="vi"><meta charset="utf-8"><style>'+await css(stage==='before')+'</style><body><div style="margin-left:'+(state==='mobile'?0:240)+'px" data-controlled-component="true">'+markup(state)+'</div></body></html>')
      if (state==='advanced') await page.locator('details.sc-planning-advanced').evaluate(el=>{el.open=true})
      const directory = state.startsWith('import-') ? path.join(path.dirname(output),'import') : output
      await fs.mkdir(directory,{recursive:true})
      const file = path.join(directory,state+'-'+stage+'.png')
      await page.screenshot({path:file,fullPage:true})
      const metrics = await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
        sections:[...document.querySelectorAll('.sc-planning-numbered')].map(e=>({x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,padding:getComputedStyle(e).padding,headingSize:getComputedStyle(e.querySelector('h2')).fontSize})),
        ctaDisabled:document.querySelector('button[type=submit]')?.disabled??null,ctaBackground:document.querySelector('button[type=submit]')?getComputedStyle(document.querySelector('button[type=submit]')).backgroundColor:null}))
      receipt.states.push({state,stage,file:path.relative(root,file).replaceAll('\\','/'),metrics})
    }
  }
  await fs.writeFile(path.join(output,'capture.json'),JSON.stringify(receipt,null,2)+'\n')
  console.log(JSON.stringify(receipt))
} finally {
  if (browser) await browser.close()
  await fs.rm(temp,{recursive:true,force:true})
}
