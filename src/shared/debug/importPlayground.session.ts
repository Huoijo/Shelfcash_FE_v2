import { ImportBatchWorkflow } from '../../features/import-data/importData.workflow'
import { ImportFlowWorkflow, type ImportFlowState } from '../../features/import-data/importFlow.workflow'
import { createMockImportDataSource, mockImportStoreId } from '../../features/import-data/importData.fixtures'
import { createMockImportFlowDataSource } from '../../features/import-data/importFlow.fixtures'
import { planningReadinessFixture } from '../../features/decision-planning/planning.fixtures'
import type { PlanningReadiness } from '../../features/decision-planning/planning.types'
import type { MappingIssue, ImportFlowDataSource } from '../../features/import-data/importFlow.types'
import type { DevOwnerReviewGateway, OwnerReviewState } from '../../features/import-data/importExperience'
import type { ImportSelection } from '../../pages/imports/ImportWorkspace'
import { HttpError } from '../http/httpClient'
import { previewScenario } from './importPlayground.catalog'
import type { PreviewRequest } from './importPlayground.store'

const grants = ['mapping.read', 'mapping.propose', 'import.create', 'import.upload', 'import.analyze', 'import.preview', 'import.commit', 'inventory.count.correct', 'planning.context.read']
function problem(code: string, message: string, status = 422) { return new HttpError('contract', message, status, {code,message,details:{}}) }
const clone = <T,>(value: T): T => structuredClone(value)

/** A disposable mock world. It never receives an API client, live store ID or live workflow.
 * Seed normal phases with public workflow actions. Edge projections are presentation-only;
 * the first user action clears them and continues against this world's mock workflows.
 */
export async function createImportPlaygroundSession(request: PreviewRequest) {
  if (!import.meta.env.DEV) throw new Error('Development preview only')
  const scenario = previewScenario(request.role, request.scenario), id = scenario.id
  const ownerRequired = scenario.screen === 'profile' && id !== 'profile-approved' || scenario.screen === 'resolve' && (request.role === 'OWNER' || /resolve-(changed|submit|waiting|rejected)/.test(id)) || id === 'analyze-none'
  const batches = createMockImportDataSource({continuation:true})
  const workflow = new ImportBatchWorkflow(batches, mockImportStoreId)
  const mock = createMockImportFlowDataSource(batches, {ownerRequired,pageSize:50})
  let commitError: 'failed' | 'uncertain' | null = null
  const source: ImportFlowDataSource = {...mock, async commit(importId,intent) {
    const error = commitError; commitError = null
    if(error === 'failed') throw problem('COMMIT_FAILED','Không thể nhập dữ liệu. Vui lòng kiểm tra và thử lại.')
    const receipt = await mock.commit(importId,intent)
    if(error === 'uncertain') throw new HttpError('transport','Chưa nhận được xác nhận kết quả.')
    return receipt
  }}
  const flow = new ImportFlowWorkflow(source,{refreshBatch:async()=>{await workflow.refresh();return workflow.getSnapshot().batch}})
  flow.setAuthorization(true,grants)
  workflow.setDataDate('2026-10-10')
  const file = new File(['ingredient,on_hand,unit\nSữa tươi,10,l\nCà phê,8,kg\n'],'kiem-ke.csv',{type:'text/csv'})
  if(id !== 'file-empty') workflow.setFiles([id === 'file-unsupported' ? new File(['unsupported'],'bao-cao.pdf',{type:'application/pdf'}) : file])
  if(scenario.screen !== 'upload') {
    await workflow.process()
    flow.setBatch(workflow.getSnapshot().batch)
    await flow.refresh()
    const mapping = flow.getSnapshot().queue?.items[0]
    if(ownerRequired && mapping && id !== 'resolve-manual'){await flow.loadOptions(mapping.mapping_id);await flow.confirmMapping(mapping.mapping_id,'on_hand')}
    if(scenario.editor) await flow.setFilter('all',false)
    if(scenario.screen === 'profile') flow.setTab('profile')
    if(['preview','review','commit','complete'].includes(scenario.screen)) {
      await flow.startPreview();await flow.pollJob();await flow.pollJob()
      if(['review','commit','complete'].includes(scenario.screen)) {
        flow.setTab('review');flow.setReviewReason('Đã kiểm tra toàn bộ dữ liệu');flow.acknowledgeReview(true);await flow.confirmReview()
        flow.setCommitReason('Đối chiếu kiểm kê');flow.acknowledgeCommit(true)
      }
      if(['commit','complete'].includes(scenario.screen) || id === 'commit-failed') {
        commitError = id === 'commit-failed' ? 'failed' : id === 'commit-uncertain' ? 'uncertain' : null
        await flow.commit()
        if(scenario.screen === 'complete') {await flow.pollJob();await flow.pollJob()}
      }
    }
    if(workflow.getSnapshot().error || flow.getSnapshot().error && !['commit-failed','commit-uncertain'].includes(id) || !flow.getSnapshot().summary || ['preview','review','commit','complete'].includes(scenario.screen) && !flow.getSnapshot().preview) {
      flow.dispose();throw new Error('Không chuẩn bị được mock preview: '+(workflow.getSnapshot().error ?? flow.getSnapshot().error ?? id))
    }
  }
  const permission = id === 'resolve-permission' || id === 'commit-permission'
  flow.setAuthorization(request.role === 'OWNER',permission ? ['mapping.read'] : grants)
  let projected = true
  let approval: OwnerReviewState = id === 'resolve-waiting' ? {status:'waiting',proposalRevision:'preview-proposal'} : id === 'resolve-rejected' ? {status:'rejected',proposalRevision:'preview-proposal',reason:'Kiểm tra lại cách nhận diện nguyên liệu trước khi gửi lại.'} : id === 'resolve-approved' ? {status:'approved',proposalRevision:'preview-proposal'} : {status:'idle'}
  const ownerReview: DevOwnerReviewGateway = {
    async read(importId) { return projected && approval.status !== 'idle' ? approval : mock.ownerReview.read(importId) },
    async submit(importId,revision) { projected=false;approval={status:'idle'};return mock.ownerReview.submit(importId,revision) },
  }
  const readiness: PlanningReadiness = planningReadinessFixture()
  if(id === 'complete-blocked' || request.condition === 'missing') {
    readiness.actions[0] = {...readiness.actions[0],availability:'blocked',can_execute:false,data_status:'incomplete',blockers:[
      {code:'SUPPLIER_COST_MISSING',source:'supplier',scope:'STORE',entity_id:null,affected_dates:[],details:{}},
      {code:'INVENTORY_COMPLETENESS_REQUIRED',source:'inventory',scope:'STORE',entity_id:null,affected_dates:[],details:{}},
      {code:'DECLARATION_REQUIRED',source:'constraints',scope:'STORE',entity_id:null,affected_dates:[],details:{}},
    ]}
  }
  if(id === 'complete-warnings') readiness.actions[0].warnings = [{code:'SALES_COVERAGE_INCOMPLETE',source:'sales',scope:'STORE',entity_id:null,affected_dates:[],details:{}}]
  let cache: ImportSelection
  const listeners = new Set<()=>void>()
  const notify = () => { cache=selection();listeners.forEach(listener=>listener()) }
  const userMethods = new Set(['setTab','setFiles','setDataDate','process','retry','refresh','startNewDraft','confirmMapping','resolveMapping','decideProfile','startPreview','confirmReview','commit','setReviewReason','acknowledgeReview','setCommitReason','acknowledgeCommit','setResolutions','setSupplierChanges'])
  // Bind all functions to their original world. No monkey patching of live instances.
  function actions<T extends object>(target:T):T {
    const bound = new Map<PropertyKey,unknown>()
    return new Proxy(target,{get(object,key){
      const value=Reflect.get(object,key)
      if(typeof value!=='function')return value
      if(!bound.has(key))bound.set(key,(...args:unknown[])=>{
        if(userMethods.has(String(key))){projected=false;approval={status:'idle'};notify()}
        return Reflect.apply(value,object,args)
      })
      return bound.get(key)
    }})
  }
  const batchActions=actions(workflow),flowActions=actions(flow)
  function selection():ImportSelection {
    const state=cloneBatch(),flowState=projected ? projectFlow(clone(flow.getSnapshot())) : flow.getSnapshot()
    return {state,flowState,workflow:batchActions,flow:flowActions,role:request.role,canDecideProfile:request.role==='OWNER',canProposeMapping:!permission,
      ...(request.role==='STAFF'?{devOwnerReview:ownerReview}:{}),
      startNewDraft:()=>{projected=false;workflow.startNewDraft()},
      preview: {scenario: id,screen:projected?scenario.screen:undefined,editor:projected?scenario.editor:undefined,submit:projected?scenario.submit:undefined,readiness},
    }
  }
  function cloneBatch() {
    const state={...workflow.getSnapshot()}
    if(!projected)return state
    if(id==='file-failed')state.error='Không thể tải file. Vui lòng thử lại.'
    if(id==='file-conflict')state.error='File đã tồn tại hoặc xung đột với file đang chọn. Kiểm tra lại file nguồn.'
    if(state.batch) {
      state.batch=clone(state.batch)
      if(id==='analyze-running')Object.assign(state.batch,{status:'analyzing',active_job_id:'preview-analysis-job',allowed_actions:[]})
      if(id==='analyze-failed')Object.assign(state.batch,{status:'failed',allowed_actions:['analyze']})
      if(id==='complete-warnings')state.batch.status='completed_with_warnings'
    }
    return state
  }
  function projectFlow(state:ImportFlowState):ImportFlowState {
    state.batch=cloneBatch().batch
    state.pollAfterMs=null
    const summary=state.summary
    if(summary) {
      const codes:Record<string,string>={'analyze-source':'SOURCE_CONTEXT_REQUIRED','analyze-ambiguous':'PROFILE_MATCH_AMBIGUOUS','analyze-drift':'PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT','analyze-retired':'MAPPING_VERSION_RETIRED'}
      if(id==='analyze-running'){summary.can_preview=false;summary.binding_refs=[];summary.approved_profiles=[]}
      const code=codes[id]
      if(code) {summary.can_preview=false;summary.blockers=[{code,message:code,severity:'ERROR'}]}
      if(id==='analyze-source'){summary.approved_profiles=[];summary.approved_contexts=[];summary.binding_refs=[];summary.profile_proposals=[]}
      if(id==='analyze-provider')summary.sheets[0].suggestion_diagnostic={status:'unavailable',model:'preview-provider',failure_code:'PROVIDER_UNAVAILABLE',failure_stage:'transport'}
      if(request.condition==='missing'){summary.can_preview=false;summary.progress={total_fields:4,completed_fields:3,unresolved:1};summary.blockers.push({code:'DECLARATION_REQUIRED',message:'Cần bổ sung khai báo dữ liệu.',severity:'ERROR'})}
      if(request.condition==='ambiguous'){summary.can_preview=false;summary.approved_profiles=[];summary.binding_refs=[];summary.blockers.push({code:'PROFILE_MATCH_AMBIGUOUS',message:'Có nhiều cách đọc phù hợp.',severity:'ERROR'},{code:'SOURCE_CONTEXT_REQUIRED',message:'Cần xác nhận nguồn báo cáo.',severity:'ERROR'})}
      if(scenario.editor) {
        summary.progress={total_fields:4,completed_fields:3,unresolved:1};summary.can_preview=false
        // The descriptor is a synthetic QA issue, not an inferred runtime candidate.
        const original=state.queue?.items[0]
        if(original){
          const issue:MappingIssue={...original,status:id==='resolve-ambiguous'?'ambiguous':'unmatched',target_field:null,
            issue_type:scenario.editor==='identity'?'identity':scenario.editor==='units'?'conversion':scenario.editor==='facts'?'schema_blocker':'column',
            code:scenario.editor==='facts'?'DECLARATION_REQUIRED':id==='resolve-ambiguous'?'IDENTITY_AMBIGUOUS':'VALUE_UNRESOLVED',
            source_header:scenario.editor==='units'?'ml':scenario.editor==='identity'?'Sữa tươi':'on_hand',samples:scenario.editor==='units'?['1000','l']:['Sữa tươi'],
          }
          state.queue!.items=[issue];state.queue!.counts=summary.progress
        }
      }
      if(id==='profile-dirty' && summary.profile_proposals[0]?.spec){summary.profile_proposals[0].spec.field_bindings[0].source_header='Số lượng thực đếm';summary.profile_proposals[0].spec.field_bindings[0].evidence_reference='Đã chỉnh cách đọc phiếu kiểm kê'}
    }
    if(scenario.editor==='facts')for(const option of Object.values(state.mappingOptions)){option.options[0].input_sources=['excel','shared_value'];option.options[0].allowed_shared_scopes=['IMPORT_VALUE','PROFILE_CONSTANT']}
    if(state.preview) {
      const preview=state.preview.preview
      if(id==='preview-warnings'){preview.summary.warnings=[{code:'SOURCE_WARNING',message:'Một số lô chưa có hạn dùng.',severity:'WARNING'}];preview.rows[0].warnings=[{code:'EXPIRY_UNKNOWN',message:'Chưa xác định hạn dùng.',severity:'WARNING'}]}
      if(id==='preview-blocked'||request.condition==='invalid'){preview.summary.validation_status='blocked';preview.summary.blockers=[{code:'INVALID_ROW',message:'Đơn vị nguồn chưa được xác nhận.',severity:'ERROR'}];preview.rows[0].classification='INVALID';preview.rows[0].blockers=preview.summary.blockers}
      if(id==='preview-stale'||id==='commit-stale'){preview.stale=true;state.previewStale=true}
    }
    const faults:Record<string,{kind:'permission'|'profile'|'system'|'conflict';message:string}>= {
      'resolve-permission':{kind:'permission',message:'Bạn không có quyền sửa cách hiểu dữ liệu.'},'commit-permission':{kind:'permission',message:'Quyền nhập dữ liệu đã thay đổi.'},
      'profile-failed':{kind:'system',message:'Không thể duyệt cách đọc dữ liệu.'},'profile-conflict':{kind:'conflict',message:'Profile đã thay đổi trong lúc xem.'},
      'profile-rejected':{kind:'conflict',message:'Owner đã từ chối đề xuất. Cần chỉnh lại cách hiểu.'},'profile-retired':{kind:'profile',message:'Profile đã ngừng sử dụng.'},'commit-retired':{kind:'profile',message:'Profile đã ngừng sử dụng trước khi nhập.'},
    }
    if(faults[id]){state.error=faults[id].message;state.fault={kind:faults[id].kind,code:id==='profile-rejected'?'PROFILE_REJECTED':null}}
    if(id==='commit-permission'||id==='commit-retired'){state.canCommit=false;state.canConfirmReview=false;state.commitBlockers=[state.error!];state.reviewBlockers=[state.error!]}
    if(id==='profile-rejected' && summary){summary.can_preview=false;summary.blockers=[{code:'OWNER_MAPPING_APPROVAL_REQUIRED',message:'Đề xuất đã bị từ chối. Cần chỉnh lại cách hiểu.',severity:'ERROR'}]}
    if(id==='complete-warnings'&&state.completion){state.completion.status='completed_with_warnings';state.completion.summary.warnings=1}
    return state
  }
  cache=selection()
  const cleanups=[workflow.subscribe(notify),flow.subscribe(notify)]
  return {getSnapshot:()=>cache,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}},
    // Poll only after an actual product action. Selected Processing remains inspectable.
    async poll(){await flow.pollJob()},
    get interactive(){return !projected},
    dispose(){cleanups.forEach(stop=>stop());flow.dispose();listeners.clear()},
  }
}
export type ImportPlaygroundSession = Awaited<ReturnType<typeof createImportPlaygroundSession>>
