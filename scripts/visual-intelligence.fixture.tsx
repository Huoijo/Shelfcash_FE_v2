// Isolated controlled host for actual production components. No production routes.
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { PlanningSetup } from '../src/features/decision-planning/components/PlanningSetup'
import { PlanningResults } from '../src/features/decision-planning/components/PlanningResults'
import { planningContextFixture, planningReadinessFixture, planningRunFixture, planningNoWinnerFixture, planningIngredientFixture, planningIngredientsFixture, planningFailedPartialFixture } from '../src/features/decision-planning/planning.fixtures'
import { buildPlanningSetupRequest } from '../src/features/decision-planning/planning.format'
import '../src/index.css'
import { TodayPage } from '../src/pages/today/TodayPage'
import { CurrentStore, type StoreValue } from '../src/features/store/store.context'
import { mockStoreContext } from '../src/features/store/store.fixtures'
import { InventoryDetail } from '../src/features/inventory/components/InventoryDetail'
import { inventoryFixtureItems,inventoryFixtureLots,inventoryFixtureMeta,inventoryFixtureMovements } from '../src/features/inventory/inventory.fixtures'
import '../src/pages/inventory/InventoryPage.css'
import { ImportReadiness } from '../src/features/import-data/components/ImportReadiness'
import { ImportResolveOverview } from '../src/features/import-data/components/ImportResolveOverview'
import { createImportPlaygroundSession } from '../src/shared/debug/importPlayground.session'
import { ImportCalendar } from '../src/features/import-history/components/ImportCalendar'
import { calendarFixture } from '../src/features/import-history/importHistory.fixtures'
import '../src/pages/imports/ImportPage.css'
import '../src/pages/import-history/ImportHistoryPage.css'
import { MenuDetail } from '../src/features/menu/components/MenuDetail'
import { menuFixtureProducts,menuFixtureMeta,menuProductFixture } from '../src/features/menu/menu.fixtures'
import '../src/pages/menu/MenuPage.css'
let importSession:Awaited<ReturnType<typeof createImportPlaygroundSession>>|undefined
const store=mockStoreContext()
const storeValue:StoreValue={state:{status:'ready',store},currentStoreId:store.store_id,timezone:store.timezone,accessibleStores:[],pagination:null,hasMore:false,listBusy:false,listError:null,retry:()=>{},loadMore:async()=>{},selectStore:async()=>false,refresh:async()=>{},registerChangeGuard:()=>()=>{}}
let root:Root|undefined
const noop=()=>{}
export async function renderVi(scenario:string){
  root?.unmount();root=createRoot(document.getElementById('root')!)
  importSession?.dispose();importSession=undefined
  let node
  const responses:Record<string,unknown>={}
  if(scenario.startsWith('menu-')){
    const product=structuredClone(menuFixtureProducts[scenario==='menu-mixed'?1:scenario==='menu-no-recipe'?3:scenario==='menu-empty'?4:scenario==='menu-direct'?5:0])
    if(scenario==='menu-duplicate'&&product.recipe)product.recipe.ingredients.push({...product.recipe.ingredients[0],recipe_line_id:'00000000-0000-0000-0000-000000000999'})
    if(scenario==='menu-zero'&&product.recipe)product.recipe.ingredients.forEach(line=>line.quantity='0')
    responses[`/api/v1/stores/${store.store_id}/products/${product.product_id}`]=menuProductFixture(product)
    node=<MenuDetail productId={product.product_id} listMeta={menuFixtureMeta} onClose={noop} onInvalidList={()=>{throw Error('Unexpected menu version mismatch')}}/>
  }else if(scenario.startsWith('mapping-')){
    importSession=await createImportPlaygroundSession({role:scenario.includes('staff')?'STAFF':'OWNER',scenario:'resolve-complete',condition:'sufficient',generation:1})
    const summary=structuredClone(importSession.getSnapshot().flowState.summary)!
    if(scenario!=='mapping-unknown')summary.counters={batch:{total:10,by_status:{auto_mapped:4,resolved:2,needs_confirmation:2,ambiguous:1,unmatched:1},by_origin:{}},filtered:{total:0,by_status:{},by_origin:{}}}
    else summary.counters=null
    node=<main className="import-page"><div className="import-flow" style={{padding:24}}><ImportResolveOverview summary={summary} queue={null} busy={false} lastSaved={null} onOpen={noop}/></div></main>
  }else if(scenario.startsWith('readiness-')){
    const readiness=planningReadinessFixture()
    if(scenario==='readiness-warning')readiness.actions.find(a=>a.action==='planning')!.warnings=[{code:'CONTROLLED_SOURCE_WARNING',source:'inventory',scope:'STORE',entity_id:null,affected_dates:[],details:{}}]
    node=<main className="import-page"><ImportReadiness preview={scenario==='readiness-permission'?undefined:readiness}/></main>
  }else if(scenario.startsWith('history-')){
    const data=structuredClone(calendarFixture.data)
    if(scenario==='history-empty'){data.days=[];data.matched_import_count=0}
    if(scenario==='history-unknown'){data.matched_import_count=null;data.days[0].import_count=null}
    const loadState=scenario==='history-loading'?'loading':scenario==='history-error'?'error':scenario==='history-permission'?'permission':undefined
    node=<main className="history-page"><ImportCalendar month="2026-10" selectedDate="2026-10-02" data={loadState?undefined:data} loadState={loadState} dateLink={date=>`?date=${date}`}/></main>
  }else if(scenario.startsWith('inventory-')){
    const item=structuredClone(inventoryFixtureItems[scenario==='inventory-empty'?4:scenario==='inventory-expired'?3:scenario==='inventory-unknown'?6:0])
    const lots=structuredClone(inventoryFixtureLots[item.ingredient_id]??[])
    const partial=scenario==='inventory-partial'
    const base=`/api/v1/stores/${store.store_id}/inventory/${item.ingredient_id}`
    responses[base]={data:{...item,lots:partial?lots.slice(0,2):lots,lots_page:{next_cursor:partial?'controlled-next':null,total_count:lots.length},threshold_version:item.low_stock_assessment.version??'unconfigured'},meta:inventoryFixtureMeta,error:null}
    responses[`${base}/movements`]={data:{ingredient_id:item.ingredient_id,items:inventoryFixtureMovements[item.ingredient_id]??[]},meta:{...inventoryFixtureMeta,pagination:{limit:50,next_cursor:null,total_count:(inventoryFixtureMovements[item.ingredient_id]??[]).length}},error:null}
    node=<InventoryDetail ingredientId={item.ingredient_id} snapshot={inventoryFixtureMeta} onClose={noop} onInvalidSnapshot={()=>{throw Error('Unexpected snapshot mismatch')}}/>
  }else if(scenario.startsWith('today-')){
    node=<TodayPage/>
  }else if(scenario.startsWith('setup-')){
    const context=planningContextFixture(scenario==='setup-no-ceiling'?{budget_ceiling:null}:{})
    if(scenario==='setup-zero'&&context.budget_ceiling)context.budget_ceiling.amount='0'
    const readiness=planningReadinessFixture(),request=buildPlanningSetupRequest(context,'2026-10-10','')
    if(scenario==='setup-blocked')Object.assign(readiness.actions[0],{availability:'blocked',can_execute:false})
    node=<PlanningSetup context={context} busy={false} canCreate={scenario!=='setup-permission'} permissions={scenario==='setup-permission'?[]:undefined} onCreate={noop} onAssessDate={noop} readiness={readiness} readinessBusy={scenario==='setup-loading'} readinessError={scenario==='setup-error'?'Controlled error':null} readinessDate="2026-10-11" readinessRequestKey={request?JSON.stringify(request):null}/>
  }else{
    const run=scenario==='result-no-winner'?planningNoWinnerFixture():scenario==='result-partial'?planningFailedPartialFixture():planningRunFixture()
    const ingredient=planningIngredientFixture()
    if(scenario==='ingredient-no-series')ingredient.daily_balances=null
    if(scenario==='ingredient-gaps'&&ingredient.daily_balances){ingredient.daily_balances=ingredient.daily_balances.filter(row=>row.day!=='2026-10-13');ingredient.evidence_availability='partial'}
    if(scenario==='ingredient-isolated'&&ingredient.daily_balances){ingredient.daily_balances=ingredient.daily_balances.filter(row=>row.day==='2026-10-14'&&row.path==='BASE');ingredient.evidence_availability='partial'}
    const ingredients=scenario.startsWith('ingredient-')
    node=<PlanningResults run={run} ingredients={planningIngredientsFixture()} ingredient={ingredients?ingredient:null} selectedOptionId={null} busy={false} detailBusy={false} historical={scenario==='result-historical'} initialTab={ingredients?'ingredients':scenario==='result-strategies'?'strategies':'overview'} onSelectOption={noop} onLoadIngredients={noop} onMoreIngredients={noop} onSelectIngredient={noop} onLoadReasons={noop} onNewPlan={noop}/>
  }
  Object.assign(window,{viResponses:responses})
  const provider=scenario==='readiness-permission'?{...storeValue,state:{status:'ready' as const,store:{...store,membership:{...store.membership,effective_permissions:[]}}}}:storeValue
  root.render(<MemoryRouter><CurrentStore.Provider value={provider}>{node}</CurrentStore.Provider></MemoryRouter>)
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
}
Object.assign(window,{renderVi})
