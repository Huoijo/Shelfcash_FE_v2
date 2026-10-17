import type {MappingSummary,MappingQueue} from '../importFlow.types'
import type {ResolutionGroup} from '../importExperience'
import {resolveOverview} from '../importResolve.presentation'
import { ImportMappingComposition } from './ImportVisualIntelligence'

export function ImportResolveOverview({summary,queue,busy,onOpen,lastSaved}:{summary:MappingSummary;queue:MappingQueue|null;busy:boolean;onOpen:(group:ResolutionGroup)=>void;lastSaved:ResolutionGroup|null}) {
  const groups=resolveOverview(summary,queue)
  return <>
    <ImportMappingComposition summary={summary}/>
    <div className="input-resolve-grid">{groups.map(group=><section className="input-resolve-card" key={group.id} data-resolve-group={group.id}>
      <header><span>{group.number}</span><div><h3>{group.title}</h3><p>{group.copy}</p></div></header>
      <div className="input-card-result"><span>{group.metric}</span><strong>{group.count??'—'}</strong><span>Trạng thái</span><strong>{group.status}</strong></div>
      <div className="input-card-status"><span className={group.pending?'attention':lastSaved===group.id?'saved':''}>{group.pending?'Cần xử lý':lastSaved===group.id?'Vừa cập nhật':group.complete?group.id==='units'?'Đã kiểm tra':'Sẵn sàng':'Cần xác nhận'}</span><button type="button" disabled={busy} onClick={()=>onOpen(group.id)}>{group.id==='structure'?'Chỉnh mapping':group.id==='identity'?group.pending?'Chọn entity':'Xem bindings':group.id==='facts'?'Xác nhận thông tin':'Kiểm tra đơn vị'}</button></div>
    </section>)}</div>
    <section className="input-summary-strip" aria-label="Tóm tắt cách hiểu">{groups.filter(g=>g.id!=='units').map(group=><div key={group.id}><span>{group.id==='identity'?'Identity bindings':group.metric}</span><strong>{group.count??'—'}</strong></div>)}<div><span>Chưa xử lý</span><strong>{summary.progress.unresolved}</strong></div></section>
  </>
}
