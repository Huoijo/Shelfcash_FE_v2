import { mockStoreContext } from '../store/store.fixtures'
import { comparePlanningDecimal } from '../decision-planning/planning.validation'
import { HttpError } from '../../shared/http/httpClient'
import { mockAdd,mockInventory,mockScenario,mockSummary,touchMockInventory } from '../mock/mockRepository'
import { mockRuns, mockSavedRequirements } from '../mock/mockSources'
import { menuFixtureProducts } from '../menu/menu.fixtures'
import { checked, validateRecipePreview, type OperationsSource } from './operations.data'
import type * as W from './operations.wire'
const at='2026-10-10T03:00:00Z'
const envelope=<T,>(data:T)=>({data:structuredClone(data),meta:{request_id:'mock-operations'},error:null})
const page=<T,>(items:T[])=>({...envelope({items}),meta:{request_id:'mock-operations',pagination:{limit:50,next_cursor:null,total_count:items.length}}})
function fail(code:string,status=409):never{throw new HttpError('contract',`DEV: ${code}`,status,{code,message:code,details:{}})}
/** Shared fake backend state; only synthetic seed data, reset on reload. */
export function createMockOperationsSource():OperationsSource {
  const receipts=new Map<string,{fingerprint:string;value:unknown}>()
  const identities=new Map<string,{body:string;value:W.WireEnvelope_StockReceiptResult_}>()
  const saved=mockSavedRequirements
  const timelines=new Map<string,W.WireTimeline>()
  const changes=new Map<string,W.WireChangeRead>()
  function mutation<T>(scope:string,intent:unknown & {key:string},run:()=>T):T {
    if(mockScenario==='revision-conflict')fail('DEV_REVISION_CONFLICT',412)
    const k=scope+intent.key, fingerprint=JSON.stringify(intent),old=receipts.get(k)
    if(old){if(old.fingerprint!==fingerprint)fail('IDEMPOTENCY_KEY_REUSED');return structuredClone(old.value) as T}
    const value=run();receipts.set(k,{fingerprint,value:structuredClone(value)});return value
  }
  function timeline(s:string,p:string):W.WireTimeline {
    mockInventory(s)
    const key=s+p
    if(!timelines.has(key)) {
      const product=menuFixtureProducts.find(i=>i.product_id===p);if(!product)fail('PRODUCT_NOT_FOUND',404)
      const r=product.recipe
      timelines.set(key,{store_id:s,product_id:p,as_of_date:'2026-10-10',schedule_version:'mock-calendar/1',catalog_version:'mock-catalog/1',minimum_change_date:'2026-10-11',items:r?[{state:'in_effect',assignment:{effective_from:r.effective_from,effective_to:r.effective_to},content:{recipe_id:r.recipe_id,version:r.version,yield_quantity:r.yield_quantity,yield_unit:r.yield_unit,process_loss_rate:r.process_loss_rate,ingredients:r.ingredients.map(i=>({recipe_line_id:i.recipe_line_id,ingredient_id:i.ingredient_id,quantity:i.quantity,unit:i.unit}))}}]:[]})
    }
    return timelines.get(key)!
  }
  return {
    async completeCredentials(){fail('CREDENTIAL_SETUP_API_ONLY',422)},
    async offer(){fail('INVITATION_RECIPIENT_API_ONLY',422)},
    async accept(){fail('INVITATION_RECIPIENT_API_ONLY',422)},
    async permissionEvents(s){mockInventory(s);return page([])},
    async invitationEvents(s){mockInventory(s);return page([])},
    async history(s,q={}) {
      mockInventory(s)
      const rows=[...mockRuns.values()].filter(r=>r.store_id===s&&(!q.status||r.status===q.status)&&(!q.forecast_start_from||r.request.forecast_start_date>=q.forecast_start_from)&&(!q.forecast_start_to||r.request.forecast_start_date<=q.forecast_start_to)).map(r=>({run_id:r.run_id,store_id:s,status:r.status,accepted_at:r.accepted_at,started_at:r.started_at,completed_at:r.finished_at,forecast_start_date:r.request.forecast_start_date,forecast_end_date:new Date(Date.parse(r.request.forecast_start_date)+6*86400000).toISOString().slice(0,10),requirements_mode:r.request.requirements_mode,created_by:{user_id:'d1000000-0000-4000-8000-000000000001',display_name:'DEV Owner'},winner_option_id:r.result?.winner_option_id??null,outcome:r.outcome,error_code:r.errors[0]?.code??null,result_schema_version:r.result ? 'planning-result/1' : null,result_digest:r.result?'synthetic-result-digest/1':null,record_version:r.response_version,captured_budget:r.configuration.budget.limit===null?{availability:"unavailable",limit:null,currency:null}:{availability:"available",limit:r.configuration.budget.limit,currency:r.configuration.budget.currency}}))
      return checked<W.WireRunHistoryEnvelope>('RunHistoryEnvelope',{...page(rows),meta:{...page(rows).meta,snapshot_id:'mock-history/1',timezone:'Asia/Ho_Chi_Minh',applied_filters:{created_by_user_id:null,created_date_from:null,created_date_to:null}}})
    },
    async exportPlan(){fail('PDF_WORKER_API_ONLY',422)},async exportJob(){fail('PDF_WORKER_API_ONLY',422)},async download(){fail('PDF_WORKER_API_ONLY',422)},
    async saved(s,id){mockInventory(s);const v=saved.get(s+id);if(!v)fail('REQUIREMENTS_NOT_FOUND',404);return envelope(v)},
    async saveRequirements(s,i,id){mockInventory(s);return mutation(s+'requirements',i,()=>{
      const body=i.request,old=id?saved.get(s+id):null
      if(id&&(!old||old.version!==i.version))fail('REQUIREMENTS_REVISION_CONFLICT',412)
      if(old?.state==='archived')fail('REQUIREMENTS_ARCHIVED',409)
      const resourceId=id??crypto.randomUUID()
      const data:W.WireSavedDetail='state' in body&&body.state==='archived'?{...old!,state:'archived',version:crypto.randomUUID()}:{saved_requirement_id:resourceId,store_id:s,name:('name' in body?body.name:''),version:crypto.randomUUID(),state:'active',created_at:old?.created_at??at,updated_at:at,created_by_user_id:'d1000000-0000-4000-8000-000000000001',updated_by_user_id:'d1000000-0000-4000-8000-000000000001',requirements:'requirements' in body?{budget_limit:body.requirements.budget_limit??null,paths:body.requirements.paths.map(p=>({path:p.path,min_fill_rate_percent:p.min_fill_rate_percent??'95',product_overrides:p.product_overrides??[]}))}:old!.requirements,default_reference:null,validation:{status:'valid',reason_codes:[]},warnings:[]}
      saved.set(s+resourceId,data);return checked<W.WireEnvelope_SavedDetail_>('Envelope_SavedDetail_',envelope(data))
    })},
    async receive(s,i){if(!mockStoreContext(s).membership.effective_permissions.includes('inventory.receive'))fail('PERMISSION_DENIED',403);const state=mockInventory(s);return mutation(s+'receipt',i,()=>{
      const b=i.request,identity=s+JSON.stringify(b.receipt_identity),prior=identities.get(identity);if(prior){if(prior.body!==JSON.stringify(b))fail('RECEIPT_IDENTITY_CONFLICT');return structuredClone(prior.value)}const row=state.items.find(r=>r.ingredient_id===b.ingredient_id);if(!row)fail('INGREDIENT_NOT_FOUND',404)
      if(state.meta.data_version!==b.expected_inventory_version)fail('INVENTORY_VERSION_CONFLICT')
      if(!/[1-9]/.test(b.quantity)||row.unit!==b.unit)fail('VALIDATION_ERROR',422)
      const lotId=crypto.randomUUID(),receiptId=crypto.randomUUID()
      const lot={lot_id:lotId,batch_code:b.lot_code,quantity:b.quantity,unit:b.unit,supplier_id:b.supplier_id,received_date:b.received_date,expiry_date:b.expiry_date,status:'stable' as const,use_first:false,location:null,location_availability:'unsupported' as const,updated_at:at,version:'mock-lot/1',origin:b.origin,cost:{availability:b.unit_cost===null?'unknown' as const:'known' as const,unit_cost:b.unit_cost,currency:b.currency}}
      const movement={movement_id:crypto.randomUUID(),lot_id:lotId,batch_code:b.lot_code,kind:b.origin==='OPENING_STOCK'?'count_correction' as const:'receipt' as const,quantity_delta:b.quantity,unit:b.unit,occurred_at:b.observed_at,recorded_at:at,actor_user_id:null,reason:b.reason,reference:{type:b.origin,id:receiptId},origin:b.origin}
      state.lots[b.ingredient_id]??=[];state.movements[b.ingredient_id]??=[]
      state.lots[b.ingredient_id].push(lot);state.movements[b.ingredient_id].unshift(movement)
      row.on_hand_quantity=mockAdd(row.on_hand_quantity,b.quantity);row.usable_known_quantity=mockAdd(row.usable_known_quantity,b.quantity);if(row.usable_quantity!==null)row.usable_quantity=mockAdd(row.usable_quantity,b.quantity);row.lot_count++;row.positive_lot_count++;if(row.low_stock_assessment.threshold!==null&&row.usable_quantity!==null){row.low_stock_assessment.status=comparePlanningDecimal(row.usable_quantity,row.low_stock_assessment.threshold)<=0?'low':'ok';if(!['expired','near_expiry'].includes(row.status))row.status=row.low_stock_assessment.status==='low'?'low_stock':'stable'}
      touchMockInventory(state);mockSummary(state.items)
      const value=checked<W.WireEnvelope_StockReceiptResult_>('Envelope_StockReceiptResult_',envelope({receipt_id:receiptId,origin:b.origin,lot,movement,inventory_version:state.meta.data_version,audit_reference:crypto.randomUUID(),warnings:[]}));identities.set(identity,{body:JSON.stringify(b),value:structuredClone(value)});return value
    })},
    async threshold(s,id,i){if(mockStoreContext(s).role!=='OWNER')fail('PERMISSION_DENIED',403);const state=mockInventory(s);return mutation(s+'threshold'+id,i,()=>{
      const row=state.items.find(r=>r.ingredient_id===id);if(!row)fail('INGREDIENT_NOT_FOUND',404)
      if((row.low_stock_assessment.version??`fixture-unconfigured-${id}`)!==i.version)fail('THRESHOLD_REVISION_CONFLICT',412)
      const version=crypto.randomUUID();row.low_stock_assessment={threshold:i.request.minimum_usable_quantity,version,status:i.request.minimum_usable_quantity===null||row.usable_quantity===null?'unknown':comparePlanningDecimal(row.usable_quantity,i.request.minimum_usable_quantity)<=0?'low':'ok'};if(!['expired','near_expiry','empty'].includes(row.status))row.status=row.low_stock_assessment.status==='low'?'low_stock':row.low_stock_assessment.status==='unknown'?'watch':'stable';touchMockInventory(state)
      return envelope({ingredient_id:id,minimum_usable_quantity:i.request.minimum_usable_quantity,unit:row.unit,version,updated_at:at,updated_by:'d1000000-0000-4000-8000-000000000001'})
    })},
    async timeline(s,p){return checked<W.WireEnvelope_Timeline_>('Envelope_Timeline_',pageTimeline(timeline(s,p)))},
    async change(s,p,id){const v=changes.get(s+p+id);if(!v)fail('CHANGE_NOT_FOUND',404);return envelope(v)},
    async changeRecipe(s,p,i){return mutation(s+p+'recipe',i,()=>{
      const t=timeline(s,p);if(t.schedule_version!==i.version)fail('RECIPE_SCHEDULE_REVISION_CONFLICT',412)
      if(i.request.phase==='preview') {
        const b=i.request;validateRecipePreview(b);const after=structuredClone(t.items),newContents:W.WireContent[]=b.new_recipes.map((r,index)=>({recipe_id:crypto.randomUUID(),version:Math.max(0,...t.items.map(v=>v.content.version))+index+1,yield_quantity:r.yield_quantity,yield_unit:r.yield_unit,process_loss_rate:r.process_loss_rate,ingredients:r.ingredients.map(l=>({...l,recipe_line_id:crypto.randomUUID()}))}))
        for(const op of b.operations){const ref=op.recipe_ref;const content='recipe_id' in ref?t.items.find(v=>v.content.recipe_id===ref.recipe_id)?.content:newContents[b.new_recipes.findIndex(r=>r.client_reference===ref.new_recipe_reference)]
          if(!content)fail('INVALID_RECIPE_REFERENCE',422)
          const index=after.findIndex(v=>v.content.recipe_id===content.recipe_id)
          const item:W.WireScheduleItem={content,assignment:op.kind==='WITHDRAW_FUTURE'?null:{effective_from:op.effective_from,effective_to:op.effective_to},state:op.kind==='WITHDRAW_FUTURE'?'unassigned':'scheduled'}
          if(index>=0)after[index]=item;else after.push(item)
        }
        const assigned=after.filter(v=>v.assignment).sort((a,b)=>a.assignment!.effective_from.localeCompare(b.assignment!.effective_from))
        const blockers:W.WirePreview['blockers']=[]
        if(assigned.some((v,index)=>v.assignment!.effective_to!==null&&v.assignment!.effective_to!<v.assignment!.effective_from || index>0&&(assigned[index-1].assignment!.effective_to===null||assigned[index-1].assignment!.effective_to!>=v.assignment!.effective_from)))blockers.push({code:'RECIPE_OVERLAP',message:'Lịch bị chồng hoặc khoảng ngày không hợp lệ.',details:{entity:'product',entity_id:p,field:'assignment'}})
        for(const op of b.operations){if(op.kind==='WITHDRAW_FUTURE'){const old=t.items.find(v=>'recipe_id' in op.recipe_ref&&v.content.recipe_id===op.recipe_ref.recipe_id);if(old?.assignment&&old.assignment.effective_from<=t.as_of_date)blockers.push({code:'HISTORY_IMMUTABLE',message:'Không rút công thức đã áp dụng.',details:{entity:'product',entity_id:p,field:'assignment'}})}else if('new_recipe_reference' in op.recipe_ref&&op.effective_from<t.minimum_change_date)blockers.push({code:'RECIPE_DATE_POLICY_CHANGED',message:'Công thức mới phải từ ngày cửa hàng kế tiếp.',details:{entity:'product',entity_id:p,field:'assignment'}})}
        for(const item of after)item.state=!item.assignment?'unassigned':item.assignment.effective_from>t.as_of_date?'scheduled':item.assignment.effective_to&&item.assignment.effective_to<t.as_of_date?'past':'in_effect'
        const preview:W.WirePreview={change_id:crypto.randomUUID(),status:blockers.length?'blocked':'preview_ready',preview_digest:crypto.randomUUID(),store_id:s,product_id:p,evaluated_at:at,as_of_date:t.as_of_date,minimum_change_date:t.minimum_change_date,schedule_version:t.schedule_version,catalog_version:t.catalog_version,before:structuredClone(t.items),after,changed_ranges:[],new_contents:newContents,required_permissions:['recipe.manage_effectivity'],blockers,warnings:[],required_warning_acknowledgements:[],can_commit:!blockers.length}
        changes.set(s+p+preview.change_id,{change_id:preview.change_id,status:preview.status,preview,receipt:null,audit:null});return envelope(preview)
      }
      const b=i.request,c=changes.get(s+p+b.change_id);if(!c||!c.preview.can_commit||c.preview.preview_digest!==b.preview_digest)fail('PREVIEW_STALE')
      t.items=structuredClone(c.preview.after);const before=t.schedule_version;t.schedule_version=crypto.randomUUID()
      const receipt:W.WireReceipt={change_id:c.change_id,status:'committed',preview_digest:c.preview.preview_digest,store_id:s,product_id:p,committed_at:at,schedule_version_before:before,schedule_version_after:t.schedule_version,created_recipe_ids:c.preview.new_contents.map(r=>r.recipe_id),affected_recipe_ids:[],audit_reference:crypto.randomUUID(),changed:true,updated_resources:{menu:true,recipes:true,inventory:false,sales:false,forecast:false,retained_runs:false},warnings:[]}
      c.receipt=receipt;c.status='committed';return envelope(receipt)
    })},
  }
}
function pageTimeline(data:W.WireTimeline){return {...envelope(data),meta:{request_id:'mock-timeline',pagination:{limit:50,next_cursor:null,total_count:data.items.length}}}}
