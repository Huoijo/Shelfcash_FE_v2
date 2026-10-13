import test from 'node:test'
import assert from 'node:assert/strict'
import {createMockOperationsSource} from '../src/features/operations/operations.fixtures'
import {getInventory,getInventoryIngredient,getInventoryLots,getInventoryMovements} from '../src/features/inventory/inventory.data'
import {mockInventory} from '../src/features/mock/mockRepository'
import {mockPlanningSource,mockRuns} from '../src/features/mock/mockSources'
import {PLANNING_FIXTURE_IDS} from '../src/features/decision-planning/planning.fixtures'
const s=PLANNING_FIXTURE_IDS.store,b='f17e0000-0000-4000-8000-000000000002',api=createMockOperationsSource(),signal=()=>new AbortController().signal
const env=()=>mockInventory(s)
test('mock receipt → new snapshot/detail/lots/movements, same identity/key replay does not double count; Store B isolated',async()=>{
 const before=await getInventory({},signal(),s),row=before.data.items.find(i=>i.ingredient_id==='10000000-0000-0000-0000-000000000001')
 const request={origin:'ACTUAL_RECEIPT',receipt_identity:{source_system_key:'qa-receipt',source_record_id:'row-1'},ingredient_id:row.ingredient_id,supplier_id:null,lot_code:'QA-LOT',quantity:'2.125',unit:row.unit,received_date:'2026-10-10',expiry_date:'2026-11-01',unit_cost:null,currency:'VND',observed_at:'2026-10-10T01:00:00Z',reason:'QA actual receipt',expected_inventory_version:before.meta.data_version}
 const intent={key:crypto.randomUUID(),request};const result=await api.receive(s,intent)
 const next=await getInventory({},signal(),s);assert.notEqual(next.meta.snapshot_id,before.meta.snapshot_id)
 const detail=await getInventoryIngredient(row.ingredient_id,next.meta.snapshot_id,signal(),s),lots=await getInventoryLots(row.ingredient_id,{snapshot_id:next.meta.snapshot_id},signal(),s),moves=await getInventoryMovements(row.ingredient_id,{snapshot_id:next.meta.snapshot_id},signal(),s)
 assert.equal(detail.data.on_hand_quantity,'17.625');assert.ok(lots.data.items.some(i=>i.lot_id===result.data.lot.lot_id));assert.ok(moves.data.items.some(i=>i.movement_id===result.data.movement.movement_id))
 await api.receive(s,intent);await api.receive(s,{...intent,key:crypto.randomUUID()});assert.equal((await getInventoryIngredient(row.ingredient_id,next.meta.snapshot_id,signal(),s)).data.on_hand_quantity,'17.625')
 await assert.rejects(api.receive(s,{key:crypto.randomUUID(),request:{...request,quantity:'3'}}),e=>e.problem.code==='RECEIPT_IDENTITY_CONFLICT')
 assert.equal((await getInventory({},signal(),b)).data.items.length,0);await assert.rejects(getInventoryIngredient(row.ingredient_id,before.meta.snapshot_id,signal(),s),e=>e.problem.code==='SNAPSHOT_NOT_AVAILABLE')
})
test('mock threshold clear differs from zero and stale CAS cannot overwrite',async()=>{
 const state=env(),row=state.items[1],version=row.low_stock_assessment.version
 await api.threshold(s,row.ingredient_id,{key:crypto.randomUUID(),version,request:{minimum_usable_quantity:'0',unit:row.unit,reason:'Zero threshold'}})
 let fresh=await getInventoryIngredient(row.ingredient_id,state.meta.snapshot_id,signal(),s);assert.equal(fresh.data.low_stock_assessment.threshold,'0');assert.equal(fresh.data.low_stock_assessment.status,'ok')
 await assert.rejects(api.threshold(s,row.ingredient_id,{key:crypto.randomUUID(),version,request:{minimum_usable_quantity:'100',unit:row.unit,reason:'Stale'}}),e=>e.status===412)
 await api.threshold(s,row.ingredient_id,{key:crypto.randomUUID(),version:fresh.data.threshold_version,request:{minimum_usable_quantity:null,unit:row.unit,reason:'Clear'}})
 fresh=await getInventoryIngredient(row.ingredient_id,state.meta.snapshot_id,signal(),s);assert.equal(fresh.data.low_stock_assessment.threshold,null);assert.equal(fresh.data.low_stock_assessment.status,'unknown')
})
test('mock planning create → retained read → shared history; historical clone stays immutable',async()=>{
 const context=await mockPlanningSource.context(s);const body={forecast_start_date:context.data.defaults.forecast_start_date,requirements_mode:'default',default_requirements_version:context.data.default_requirements_version}
 const receipt=await mockPlanningSource.create(s,{key:crypto.randomUUID(),request:body});const run=await mockPlanningSource.read(s,receipt.data.run_id)
 const history=await api.history(s);assert.ok(history.data.items.some(i=>i.run_id===run.data.run_id));const old=structuredClone(mockRuns.get(run.data.run_id));history.data.items[0].status='failed';assert.deepEqual(mockRuns.get(run.data.run_id),old)
})
test('mock requirements save/read/replace/archive retain exact zero and version',async()=>{
 const r=await api.saveRequirements(s,{key:crypto.randomUUID(),request:{name:'QA saved',requirements:{budget_limit:'0',paths:[{path:'BASE',min_fill_rate_percent:'0',product_overrides:[]}]}}});const id=r.data.saved_requirement_id
 const read=await api.saved(s,id);assert.equal(read.data.requirements.budget_limit,'0');assert.deepEqual(read.data.requirements.paths[0].product_overrides,[])
 await api.saveRequirements(s,{key:crypto.randomUUID(),version:read.data.version,request:{state:'archived'}},id);assert.equal((await api.saved(s,id)).data.state,'archived')
 await assert.rejects(api.saveRequirements(s,{key:crypto.randomUUID(),version:read.data.version,request:{state:'archived'}},id),e=>e.status===412)
})
test('mock recipe preview does not write; commit → timeline and retained change; old timeline immutable',async()=>{
 const p='00000000-0000-0000-0000-000000000011',t=await api.timeline(s,p),current=t.data.items[0]
 const request={phase:'preview',new_recipes:[{client_reference:'next',yield_quantity:'2',yield_unit:'cup',process_loss_rate:'0.02',ingredients:[{ingredient_id:current.content.ingredients[0].ingredient_id,quantity:'300',unit:current.content.ingredients[0].unit}]}],operations:[{kind:'SET_PERIOD',recipe_ref:{recipe_id:current.content.recipe_id},effective_from:current.assignment.effective_from,effective_to:'2026-10-10'},{kind:'SET_PERIOD',recipe_ref:{new_recipe_reference:'next'},effective_from:'2026-10-11',effective_to:null}],reason:'QA future recipe'}
 const pvw=await api.changeRecipe(s,p,{key:crypto.randomUUID(),version:t.data.schedule_version,request});assert.equal(pvw.data.can_commit,true);assert.equal((await api.timeline(s,p)).data.items.length,1)
 const result=await api.changeRecipe(s,p,{key:crypto.randomUUID(),version:t.data.schedule_version,request:{phase:'commit',change_id:pvw.data.change_id,preview_digest:pvw.data.preview_digest,confirm:true,acknowledged_warning_codes:[]}})
 assert.equal((await api.timeline(s,p)).data.items.length,2);assert.equal((await api.change(s,p,result.data.change_id)).data.status,'committed');assert.equal(t.data.items.length,1)
})
test('mock overlapping calendar returns blocked preview, not successful receipt',async()=>{
 const p='00000000-0000-0000-0000-000000000015',t=await api.timeline(s,p),line=t.data.items[0].content.ingredients[0]
 const r=await api.changeRecipe(s,p,{key:crypto.randomUUID(),version:t.data.schedule_version,request:{phase:'preview',new_recipes:[{client_reference:'overlap',yield_quantity:'1',yield_unit:'cup',process_loss_rate:'0',ingredients:[{ingredient_id:line.ingredient_id,quantity:'250',unit:line.unit}]}],operations:[{kind:'SET_PERIOD',recipe_ref:{new_recipe_reference:'overlap'},effective_from:'2026-10-11',effective_to:null}],reason:'QA overlap'}})
 assert.equal(r.data.can_commit,false);assert.equal(r.data.status,'blocked')
})
test('shared saved requirements discovery, exact cap capture and immutable saved Run basis',async()=>{
 const capBefore=(await mockPlanningSource.context(s)).data.budget_ceiling
 const created=await api.saveRequirements(s,{key:crypto.randomUUID(),request:{name:'009 shared requirements',requirements:{budget_limit:'0',paths:[{path:'BASE',min_fill_rate_percent:'97',product_overrides:[]}]}}})
 const id=created.data.saved_requirement_id
 assert.ok((await mockPlanningSource.context(s)).data.saved_requirements.some(r=>r.saved_requirement_id===id))
 const accepted=await mockPlanningSource.create(s,{key:crypto.randomUUID(),request:{requirements_mode:'saved',saved_requirement_id:id,forecast_start_date:'2026-10-11'}})
 const captured=(await mockPlanningSource.read(s,accepted.data.run_id)).data.configuration
 assert.equal(captured.saved_reference.version,created.data.version)
 assert.equal(captured.effective_requirements.paths[0].min_fill_rate_percent,'97')
 assert.equal(captured.budget.limit,'0');assert.equal(captured.budget.ceiling_version,capBefore.version)
 await api.saveRequirements(s,{key:crypto.randomUUID(),version:created.data.version,request:{state:'archived'}},id)
 assert.equal((await mockPlanningSource.context(s)).data.saved_requirements.some(r=>r.saved_requirement_id===id),false)
 assert.deepEqual((await mockPlanningSource.read(s,accepted.data.run_id)).data.configuration,captured)
 await assert.rejects(mockPlanningSource.create(s,{key:crypto.randomUUID(),request:{requirements_mode:'saved',saved_requirement_id:id,forecast_start_date:'2026-10-11'}}),e=>e.status===404)
})
