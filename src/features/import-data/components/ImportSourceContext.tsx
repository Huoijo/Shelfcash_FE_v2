import {useId,useMemo,useState} from 'react'
import type {ImportFlowState,ImportFlowWorkflow} from '../importFlow.workflow'
import type {MappingIssue} from '../importFlow.types'
import {ResolverForm} from '../importResolverForm.context'
import {SourceContextEditor} from './ImportResolutionEditor'
import {ImportActionBar} from './ImportActionBar'
import {ImportMutationStatus} from './ImportMutationStatus'
import {importMessage} from '../importPresentation'

/** Full-page Analyze context, sharing the typed M04 editor with the resolver. */
export function ImportSourceContext({state,flow,issue,canPropose,onContinue}:{state:ImportFlowState;flow:ImportFlowWorkflow;issue:MappingIssue;canPropose:boolean;onContinue:()=>void}) {
  const id=useId(),[valid,setValid]=useState(false),form=useMemo(()=>({id,valid:setValid}),[id,setValid])
  const busy=state.busy,locked=busy||!!state.retryOperation||!canPropose
  const sheet=state.summary?.sheets.find(sheet=>sheet.sheet_id===issue.sheet_id)
  const file=state.summary?.files.find(file=>file.file_id===sheet?.file_id)
  return <section className="input-panel input-source-context" aria-busy={busy}>
    <header className="input-section-title"><small>Bước 2/6 · Phân tích</small><h2>Cần xác nhận nguồn dữ liệu</h2><p>Đề xuất nguồn dựa trên bằng chứng trong nội dung export, không dựa vào tên file một cách đơn lẻ.</p></header>
    <section className="input-context-evidence"><span>File / Sheet</span><strong>{file?.filename??'File nguồn'} · {sheet?.name??'Sheet nguồn'}</strong><div className="input-samples">{sheet?.headers.map((header,i)=><span key={i}>{header}</span>)}</div></section>
    {state.error&&<p className="input-status" role="alert">{importMessage(state.fault?.code??'',state.error)}</p>}
    <ImportMutationStatus state={state} onCheck={()=>{void flow.checkPendingState()}}/>
    <ResolverForm value={form}><SourceContextEditor issue={issue} disabled={locked} onResolve={resolution=>{void flow.resolveMapping(issue.mapping_id,resolution)}}/></ResolverForm>
    {!canPropose&&<p className="input-status">Bạn vẫn có thể xem bằng chứng; cần quyền chỉnh sửa để xác nhận nguồn.</p>}
    <ImportActionBar back={!busy&&!state.retryOperation?onContinue:undefined} backLabel="Kiểm tra cách hiểu"><button type="submit" form={id} className="input-primary" disabled={locked||!valid}>Xác nhận nguồn</button></ImportActionBar>
  </section>
}
