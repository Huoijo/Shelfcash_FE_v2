import {useState} from 'react'
import type {PreviewBundle,PreviewRow,SalesResolution,SupplierConfirmation,HistoryCorrection} from '../importFlow.types'
import {importDomainBlockers,salesDecisionRows,supplierDecisionRows,validSalesDecision} from '../importDomainReview'
import {FlowDialog} from '../../../shared/flow/FlowDialog'
import {ImportBusinessFacts} from './ImportBusinessFacts'

type Props={bundle:PreviewBundle;resolutions:SalesResolution[];supplierChanges:SupplierConfirmation[];historyCorrections?:HistoryCorrection[];disabled:boolean;onResolutions:(values:SalesResolution[])=>void;onSupplierChanges:(values:SupplierConfirmation[])=>void}
export function ImportDomainReview(props:Props) {
  const [selected,setSelected]=useState<PreviewRow|null>(null)
  const sales=salesDecisionRows(props.bundle),suppliers=supplierDecisionRows(props.bundle)
  const blockers=importDomainBlockers(props.bundle,props.resolutions,props.supplierChanges,props.historyCorrections)
  if(!sales.length&&!suppliers.length)return null
  return <section className="input-domain-review"><header><div><small>Domain review</small><h3>Kiểm tra thay đổi cần chú ý</h3></div><span>{blockers.length?'Còn quyết định cần xác nhận':'Đã xác nhận cho lần nhập này'}</span></header><div className="input-domain-grid">{[{label:'Sales review',rows:sales,done:(row:PreviewRow)=>validSalesDecision(row,props.resolutions.find(v=>v.row_id===row.row_id))},{label:'Supplier terms',rows:suppliers,done:(row:PreviewRow)=>props.supplierChanges.some(v=>v.action_id===row.row_id&&!!v.reason.trim())}].map(group=><article key={group.label}><h4>{group.label}</h4><p>{group.rows.length} thay đổi · {group.rows.filter(row=>!group.done(row)).length} cần xác nhận</p>{group.rows.map(row=><button type="button" key={row.row_id} disabled={props.disabled} onClick={()=>setSelected(row)}>{'Sheet nguồn'} · dòng {row.source_location.row_number??'—'} · {group.done(row)?'Đã xác nhận':'Xem chi tiết →'}</button>)}</article>)}</div>{!!blockers.length&&<p role="status">Xác nhận các thay đổi này trước khi Review.</p>}
    {selected&&<DomainDecision key={selected.row_id} row={selected} props={props} onClose={()=>setSelected(null)}/>}
  </section>
}
function DomainDecision({row,props,onClose}:{row:PreviewRow;props:Props;onClose:()=>void}) {
  const sales=['REPLACE_DAILY_TOTAL','MERGE_DISJOINT_SALES'].includes(row.proposed_action),merge=row.proposed_action==='MERGE_DISJOINT_SALES'
  const existing=props.resolutions.find(v=>v.row_id===row.row_id),supplier=props.supplierChanges.find(v=>v.action_id===row.row_id)
  const [reason,setReason]=useState(existing?.reason??supplier?.reason??''),[key,setKey]=useState(existing?.report_business_key??''),[evidence,setEvidence]=useState(existing?.evidence_reference??''),[ack,setAck]=useState(!!existing||!!supplier)
  const valid=!!reason.trim()&&ack&&(!sales||!!key.trim()&&!!evidence.trim())&&!props.disabled&&!row.blockers.length
  const save=()=>{if(!valid)return;if(sales)props.onResolutions([...props.resolutions.filter(v=>v.row_id!==row.row_id),{row_id:row.row_id,action:merge?'confirm_disjoint_merge':'replace_daily_total',report_business_key:key.trim(),evidence_reference:evidence.trim(),reason:reason.trim(),disjoint_assertion:merge?true:null}]);else props.onSupplierChanges([...props.supplierChanges.filter(v=>v.action_id!==row.row_id),{action_id:row.row_id,reason:reason.trim()}]);onClose()}
  return <FlowDialog className="import-evidence import-domain-decision" eyebrow={sales?'Bán hàng · Sales review':'Supplier terms'} title={sales?merge?'Hai contribution riêng':'Bản sửa dữ liệu':'Supplier term change'} subtitle={`${'Sheet nguồn'} · dòng ${row.source_location.row_number??'—'}`} onClose={onClose} closeDisabled={props.disabled} footer={<><button type="button" disabled={props.disabled} onClick={onClose}>Hủy</button><button type="button" className="sc-flow-primary" disabled={!valid} onClick={save}>Xác nhận thay đổi</button></>}>
    <div className="import-flow__profile-comparison"><section><h3>Trước</h3><ImportBusinessFacts value={row.before}/></section><section><h3>Đề xuất</h3><ImportBusinessFacts value={row.after}/></section></div>
    <section className="input-resolver-section"><h3>Nguồn / Bằng chứng</h3><ImportBusinessFacts value={{source_location:row.source_location,changes:row.changes}}/></section>
    {!!row.blockers.length&&<p role="alert">Thay đổi còn bị chặn. Quay lại xử lý nguồn; xác nhận không sửa ngày hiệu lực hoặc cắt ngắn kỳ lịch sử.</p>}
    <fieldset disabled={props.disabled||!!row.blockers.length} className="import-flow__form"><legend>{sales?'Quan hệ nguồn do Preview xác định':'Xác nhận điều khoản/phí hiện tại'}</legend>
    {sales&&<><p>{merge?'Giữ cả hai nguồn chỉ khi có bằng chứng các contribution không giao nhau.':'Dữ liệu hiện tại thay thế contribution trước; không cộng trùng.'}</p><label>Report business key từ chứng từ nguồn<input value={key} maxLength={1000} onChange={event=>{setKey(event.target.value);setAck(false)}}/></label><label>Tham chiếu bằng chứng<input value={evidence} maxLength={1000} onChange={event=>{setEvidence(event.target.value);setAck(false)}}/></label></>}
    <label>Lý do xác nhận<textarea value={reason} maxLength={1000} onChange={event=>{setReason(event.target.value);setAck(false)}}/></label><label className="import-flow__check"><input type="checkbox" checked={ack} onChange={event=>setAck(event.target.checked)}/>{sales?merge?'Tôi xác nhận hai nguồn là các contribution riêng.':'Tôi xác nhận dữ liệu hiện tại thay thế contribution trước.':'Tôi xác nhận điều khoản/phí và ngày hiệu lực trong Preview.'}</label></fieldset>
    <p className="input-resolver-help">Xác nhận được giữ cho quyết định nhập này. Dữ liệu chỉ được ghi khi commit toàn bộ lô.</p>
  </FlowDialog>
}
