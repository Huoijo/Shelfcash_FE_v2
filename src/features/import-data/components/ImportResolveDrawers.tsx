import {useContext,useEffect,useId,useMemo,useState} from 'react'
import type {MappingIssue,MappingOptions,MappingResolution,MappingSummary,MappingQueue} from '../importFlow.types'
import type {ImportRole,ResolutionGroup} from '../importExperience'
import {resolutionGroup} from '../importExperience'
import {resolveGroups,sheetSpec,unresolvedIssue} from '../importResolve.presentation'
import {businessField,importMessage} from '../importPresentation'
import {FlowDialog} from '../../../shared/flow/FlowDialog'
import {ResolverForm} from '../importResolverForm.context'
import {ResolverFormBody} from './ImportResolverForm'
import {ImportIdentityResolver} from './ImportIdentityResolver'
import {ImportResolutionEditor,SharedValueEditor} from './ImportResolutionEditor'
import {ImportResolutionView} from '../importResolutionView.context'
import {DebugValue} from '../../../shared/debug/DevelopmentTools'
import './ImportResolve.css'

type Props={
  group:ResolutionGroup;role:ImportRole;summary:MappingSummary;queue:MappingQueue|null;options:Record<string,MappingOptions>;sheetId:string|null;storeId:string;
  saving?:boolean;pending:boolean;onRetry:()=>void;onReload:()=>void;reviewOnly:boolean;onFilter:(unresolved:boolean)=>void;busy:boolean;locked:boolean;canPropose:boolean;error:string|null;onClose:()=>void;
  onSheet:(id:string)=>void;onLoadMore:()=>void;onConfirm:(id:string,target:string)=>Promise<boolean>;onResolve:(id:string,resolution:MappingResolution)=>Promise<boolean>
}
export function ImportResolveDrawer(props:Props) {
  const definition=resolveGroups.find(g=>g.id===props.group)!
  const items=props.queue?.items.filter(issue=>resolutionGroup(issue)===props.group)??[]
  const [picked,setPicked]=useState<string|null>(null),[valid,setValid]=useState(false),[proposal,setProposal]=useState(false)
  const selected=items.find(issue=>issue.mapping_id===picked)??items.find(unresolvedIssue)??items[0]
  const formId=useId(),footer=useMemo(()=>({id:formId,valid:setValid}),[formId,setValid])
  const sheet=props.summary.sheets.find(s=>s.sheet_id===props.sheetId),spec=sheetSpec(props.summary,props.sheetId)
  const view=useContext(ImportResolutionView)
  const filename=props.summary.files.find(f=>f.file_id===sheet?.file_id)?.filename
  const disabled=props.busy||props.locked||!props.canPropose
  const onConfirm=async(target:string)=>{if(selected&&await props.onConfirm(selected.mapping_id,target))props.onClose()}
  const onResolve=async(resolution:MappingResolution)=>{if(selected&&await props.onResolve(selected.mapping_id,resolution))props.onClose()}
  const options=selected?props.options[selected.mapping_id]??props.options[selected.sheet_id]:undefined
  const currentIndex=selected?items.findIndex(item=>item.mapping_id===selected.mapping_id):-1
  const localUnresolved=items.filter(unresolvedIssue).length
  const scopedCount=props.queue?`${props.queue.pagination.next_cursor?'≥ ':''}${localUnresolved}`:'—'
  const fileSheets=props.summary.sheets.filter(s=>s.file_id===sheet?.file_id)
  const saveLabel=props.role==='STAFF'&&proposal?'Lưu đề xuất':definition.save
  return <FlowDialog className="import-resolver" eyebrow="Kiểm tra cách hiểu" title={definition.title}
    subtitle={[filename,sheet?.name].filter(Boolean).join(' · ')}
    meta={<div className="input-resolver-meta"><span>Bước 3/6 · {definition.number}</span><span>{!props.canPropose?'Không đủ quyền':props.summary.progress.unresolved?'Cần xử lý':'Đã xử lý'}</span></div>}
    onClose={props.onClose} closeDisabled={props.busy||props.locked}
    footer={<><small>Save chỉ cập nhật phần đang xử lý; không chuyển bước.</small><div><button type="button" disabled={props.busy||props.locked} onClick={props.onClose}>Hủy</button><button type={props.pending?'button':'submit'} form={props.pending?undefined:formId} onClick={props.pending?props.onRetry:undefined} className="sc-flow-primary" disabled={props.pending?props.busy:disabled||!selected||!valid}>{props.saving?'Đang lưu…':props.pending?'Kiểm tra lại trạng thái':saveLabel}</button></div></>}>
    <section className="input-resolver-scope" aria-label="Phạm vi resolver">
      <div className="input-resolver-scope-selects"><label>File<select disabled={props.busy||props.locked} value={sheet?.file_id??''} onChange={event=>{const next=props.summary.sheets.find(s=>s.file_id===event.target.value);if(next){setPicked(null);setValid(false);props.onSheet(next.sheet_id)}}}>{props.summary.files.map(f=><option value={f.file_id??''} key={f.file_id??f.client_file_id}>{f.filename}</option>)}</select></label>
      <label>Sheet<select disabled={props.busy||props.locked} value={props.sheetId??''} onChange={event=>{setPicked(null);setValid(false);props.onSheet(event.target.value)}}>{fileSheets.map(s=><option value={s.sheet_id} key={s.sheet_id}>{s.name}</option>)}</select></label></div>
      <div className="input-resolver-scope-summary"><div><span>Sheet hiện tại · {definition.title}</span><strong>{scopedCount} cần xử lý</strong></div><div><span>Toàn bộ lần nhập</span><strong>{props.summary.progress.unresolved} cần xử lý</strong></div></div>
      <div className="input-resolver-scope-tools"><div role="group" aria-label="Lọc resolver">{[[true,'Cần xử lý'],[false,'Tất cả']].map(([value,label])=><button type="button" key={String(value)} disabled={props.busy||props.locked} aria-pressed={props.reviewOnly===value} onClick={()=>{setPicked(null);setValid(false);props.onFilter(value as boolean)}}>{label}</button>)}</div>
      {!!items.length&&<div className="input-resolver-itemnav"><button type="button" aria-label="Mục trước" disabled={props.busy||props.locked||currentIndex<=0} onClick={()=>{setPicked(items[currentIndex-1].mapping_id);setValid(false)}}>←</button><strong>Mục {currentIndex+1} / {items.length}{props.queue?.pagination.next_cursor?' đã tải':''}</strong><button type="button" aria-label="Mục tiếp theo" disabled={props.busy||props.locked||currentIndex>=items.length-1} onClick={()=>{setPicked(items[currentIndex+1].mapping_id);setValid(false)}}>→</button></div>}</div>
    </section>
    {props.saving&&<p className="input-status" role="status">Đang lưu thay đổi… Thông tin bạn vừa xác nhận vẫn được giữ.</p>}
    {props.error&&<p className="input-status" role="alert">{importMessage('',props.error)} {!props.pending&&<button type="button" disabled={props.busy} onClick={props.onReload}>Thử lại</button>}</p>}
    {props.group==='structure'&&spec?.field_bindings.some(binding=>binding.target_field||binding.ignored)&&<section className="input-resolver-section"><header><h3>Mapping hiện tại</h3></header><div className="input-resolver-list">{spec.field_bindings.filter(f=>f.target_field||f.ignored).map((binding,i)=><div className="input-resolver-row" key={i}><strong>{binding.source_header}</strong><span>{binding.ignored?'Bỏ qua':businessField(binding.target_field!)}</span></div>)}</div></section>}
    {props.group==='identity'&&!!spec?.identity_rules?.length&&<section className="input-resolver-section"><header><h3>Bindings đã xác định</h3></header>{spec.identity_rules.map((rule,i)=><div className="input-binding-preview" key={i}><span>{rule.source_token}</span><b>→</b><strong>Đã liên kết với Store</strong></div>)}</section>}
    {props.group==='facts'&&!!sheet?.import_values?.length&&<section className="input-resolver-section"><header><h3>Chỉ áp dụng cho lần nhập này</h3></header>{sheet.import_values.map(value=><div className="input-resolver-row" key={value.target_field}><span>{businessField(value.target_field)}</span><strong>{value.value===null?'Chưa xác định':typeof value.value==='boolean'?value.value?'Có':'Không':String(value.value)}</strong></div>)}</section>}
    {props.group==='units'&&!!spec?.conversions?.length&&<section className="input-resolver-section"><header><h3>Quy đổi đã xác định</h3></header>{spec.conversions.map((conversion,i)=><div className="input-unit-card" key={i}><strong>{conversion.from_unit} → {conversion.to_unit}</strong><span> {conversion.factor.numerator} / {conversion.factor.denominator}</span></div>)}</section>}
    {items.length>1&&<label>Mục đang xử lý<select value={selected?.mapping_id??''} disabled={props.busy||props.locked} onChange={event=>{setPicked(event.target.value);setValid(false)}}>{items.map(issue=><option key={issue.mapping_id} value={issue.mapping_id}>{issue.source_header??businessField(issue.target_field??'')} · {unresolvedIssue(issue)?'Cần xử lý':'Đã xác định'}</option>)}</select></label>}
    <ResolverForm value={footer}>{selected?<div key={selected.mapping_id}>
      {props.group==='structure'&&selected.issue_type==='column'?<MappingEditor onProposal={setProposal} issue={selected} options={options} summary={props.summary} disabled={disabled} onConfirm={onConfirm} onResolve={onResolve}/>:
      props.group==='identity'?<ImportIdentityResolver issue={selected} summary={props.summary} storeId={props.storeId} disabled={disabled} onResolve={value=>{void onResolve(value)}}/>:
      props.group==='facts'?options&&options.options.some(o=>o.input_sources?.includes('shared_value')&&o.allowed_shared_scopes?.length)?<ImportResolutionView value={{...view,sharedValueExpanded:true}}><SharedValueEditor issue={selected} options={{...options,options:options.options.filter(o=>o.requiredness==='required'||o.key===selected.target_field||o.key===selected.suggested_target_field)}} disabled={disabled} onResolve={value=>{void onResolve(value)}}/></ImportResolutionView>:<p className="input-status">Chưa có thông tin khai báo cần xử lý trong phạm vi đã đọc.</p>:
      <ImportResolutionEditor issue={selected} options={options} includeShared={false} disabled={disabled} onResolve={value=>{void onResolve(value)}}/>}
    </div>:<p className="input-resolver-help">{props.busy?'Đang tải dữ liệu của sheet…':props.error?'Không thể tải dữ liệu của sheet này.':props.queue?props.summary.progress.unresolved?'Sheet này đã được xử lý trong phạm vi đã đọc. Còn vấn đề ở phạm vi khác.':'Scope hiện tại đã hoàn tất.':'Chưa có dữ liệu của sheet.'}</p>}</ResolverForm>
    {props.queue?.pagination.next_cursor&&<button type="button" disabled={props.busy||props.locked} onClick={props.onLoadMore}>Tải thêm</button>}
    <DebugValue label="Resolver scope / descriptor" value={{group:props.group,sheet,selected,options,paging:props.queue?.pagination}}/>
  </FlowDialog>
}

function MappingEditor({issue,options,summary,disabled,onConfirm,onResolve,onProposal}:{onProposal:(value:boolean)=>void;issue:MappingIssue;options?:MappingOptions;summary:MappingSummary;disabled:boolean;onConfirm:(target:string)=>void;onResolve:(resolution:MappingResolution)=>void}) {
  const [draft,setDraft]=useState<string|null>(null),[reason,setReason]=useState(''),[ack,setAck]=useState(false)
  const suggested=issue.target_field??issue.suggested_target_field??''
  const target=draft??(options?.options.some(o=>o.key===suggested&&o.available&&o.support==='supported')?suggested:'')
  const option=options?.options.find(o=>o.key===target)
  const ignore=target==='IGNORE'
  useEffect(()=>onProposal(target!==issue.target_field),[target,issue.target_field,onProposal])
  const requiredIgnore=ignore&&options?.options.find(o=>o.key===suggested)?.requiredness==='required'
  const binding=sheetSpec(summary,issue.sheet_id)?.field_bindings??[]
  const duplicate=!ignore&&binding.some(b=>!b.ignored&&b.target_field===target&&(issue.source_location.source_column_index!=null?b.source_column_index!==issue.source_location.source_column_index:b.source_header!==issue.source_header))
  const valid=!disabled&&!!options&&!options.unsupportedFields.length&&!issue.unsupportedFields.length&&!duplicate&&!requiredIgnore&&(ignore?!!reason.trim()&&ack:!!option?.available&&option.support==='supported'&&!option.unsupportedFields.length&&(unresolvedIssue(issue)||target!==issue.target_field))
  return <ResolverFormBody valid={valid} onSubmit={()=>{if(ignore)onResolve({kind:'ignored_optional_field',evidence_reference:reason.trim()});else onConfirm(target)}}>
    <section className="input-resolver-section"><header><h3>Cần xác nhận</h3><span>{issue.status==='ambiguous'?'Có nhiều trường phù hợp':'Cột nguồn'}</span></header><div className="input-resolver-edit"><strong>{issue.source_header??'Cột nguồn'}</strong><div className="input-samples">{issue.samples.map((sample,i)=><span key={i}>{sample||'“”'}</span>)}</div>
      <label>ShelfCash hiểu là<select value={target} disabled={disabled||!options} onChange={event=>setDraft(event.target.value)}><option value="">Chọn trường…</option>{options?.options.map(field=><option key={field.key} value={field.key} disabled={!field.available||field.support!=='supported'}>{field.label||businessField(field.key)}</option>)}<option value="IGNORE">Bỏ qua</option></select></label>
      {duplicate&&<p className="input-status" role="alert">Target này đã được sử dụng. Chọn trường khác trước khi lưu.</p>}
      {requiredIgnore&&<p className="input-status" role="alert">Không thể bỏ qua dữ kiện bắt buộc.</p>}
      {ignore&&<div className="input-status"><strong>Cột này sẽ không được dùng trong lần nhập.</strong><label>Lý do<textarea value={reason} maxLength={1000} onChange={event=>setReason(event.target.value)}/></label><label className="import-flow__check"><input type="checkbox" checked={ack} onChange={event=>setAck(event.target.checked)}/>Tôi xác nhận cột này không chứa dữ kiện bắt buộc cần nhập.</label></div>}
    </div></section>
  </ResolverFormBody>
}
