import {useContext,useEffect,useRef,useState} from 'react'
import type {MappingIssue,MappingResolution,MappingSummary} from '../importFlow.types'
import {unresolvedIssue} from '../importResolve.presentation'
import {ImportEntitySearchContext,type ImportEntityCandidate,type ImportEntityKind} from '../importEntitySearch.context'
import {searchImportEntities} from '../importEntitySearch.data'
import {ResolverFormBody} from './ImportResolverForm'
import {ImportResolutionView} from '../importResolutionView.context'
import {IdentityEditor} from './ImportResolutionEditor'

function entityKind(issue:MappingIssue):ImportEntityKind|null {
  const target=(issue.target_field??issue.suggested_target_field)?.split('.').at(-1)
  if(target==='product_id')return 'product'
  if(target==='ingredient_id')return 'ingredient'
  if(target==='supplier_id')return 'supplier'
  if(target)return null
  return null
}
export function ImportIdentityResolver({issue,storeId,disabled,onResolve}:{issue:MappingIssue;summary:MappingSummary;storeId:string;disabled:boolean;onResolve:(value:MappingResolution)=>void}) {
  const kind=entityKind(issue)
  const injected=useContext(ImportEntitySearchContext),view=useContext(ImportResolutionView)
  const [query,setQuery]=useState(''),[cursor,setCursor]=useState<string|undefined>(),[retry,setRetry]=useState(0)
  const [result,setResult]=useState<{key:string;items:ImportEntityCandidate[];nextCursor:string|null;error?:string}|null>(null)
  const [selected,setSelected]=useState<ImportEntityCandidate|null>(null),[creating,setCreating]=useState(view.identityMode==='new')
  const snapshot=useRef<string|undefined>(undefined)
  const search=injected??searchImportEntities
  const key=JSON.stringify([storeId,kind,query,cursor,retry])
  useEffect(()=>{
    if(!kind||!query.trim())return
    const controller=new AbortController()
    const timer=setTimeout(()=>{void search({storeId,kind,q:query.trim(),cursor,snapshotId:cursor?snapshot.current:undefined,signal:controller.signal}).then(value=>{if(!controller.signal.aborted){snapshot.current=value.snapshotId;setResult({key,...value})}}).catch(error=>{if(!controller.signal.aborted)setResult({key,items:[],nextCursor:null,error:error instanceof Error?error.message:'Chưa đọc được danh mục.'})})},150)
    return()=>{clearTimeout(timer);controller.abort()}
  },[key,kind,query,cursor,search,storeId,injected])
  const current=result?.key===key?result:null
  const token=issue.source_header??issue.samples[0]??'Giá trị nguồn'
  if(creating)return <><p className="input-status">Đề xuất entity mới cần Owner review và commit. Lưu đề xuất chưa tạo đối tượng trong Store.</p><button type="button" disabled={disabled} onClick={()=>setCreating(false)}>Quay lại tìm đối tượng</button><IdentityEditor newOnly issue={issue} disabled={disabled} onResolve={onResolve}/></>
  return <ResolverFormBody valid={!!selected&&!disabled} onSubmit={()=>{if(selected)onResolve({kind:'identity_binding',canonical_id:selected.id})}}>
    <section className="input-resolver-section"><header><h3>Giá trị đang xử lý</h3><span>{kind??'Chưa xác định'}</span></header><div className="input-resolver-row"><strong>“{token}”</strong><span className="input-resolver-muted">{selected?'Đã chọn':unresolvedIssue(issue)?'Chưa xác định':'Đã xác định'}</span></div></section>
    <section className="input-resolver-section"><header><h3>Chọn entity</h3><span>Tìm trong Store</span></header>
      <label>Tìm {kind==='product'?'sản phẩm':kind==='ingredient'?'nguyên liệu':kind==='supplier'?'nhà cung cấp':'đối tượng'}<input value={query} maxLength={200} disabled={!kind} placeholder="Tìm theo tên" onChange={event=>{snapshot.current=undefined;setQuery(event.target.value);setCursor(undefined);setSelected(null)}}/></label>
      {!kind&&<p className="input-status">Chưa đọc được danh mục phù hợp. Các liên kết đã xác định vẫn được giữ.</p>}
      {query.trim()&&kind&&!current&&<p role="status">Đang tìm…</p>}
      {current?.error&&<div className="input-status" role="alert"><p>Chưa đọc được danh mục. Vui lòng thử lại.</p><button type="button" onClick={()=>{setSelected(null);setRetry(n=>n+1)}}>Thử lại</button></div>}
      {!!current?.items.length&&<div className="input-entity-results">{current.items.map(item=><button type="button" key={item.id} aria-pressed={selected?.id===item.id} disabled={disabled} onClick={()=>setSelected(item)}><span><strong>{item.name}</strong><small>{item.code??kind}</small></span><span>{selected?.id===item.id?'✓':'Chọn'}</span></button>)}</div>}
      {current&&!current.error&&!current.items.length&&<p className="input-status">Không tìm thấy đối tượng phù hợp.</p>}
      {issue.status==='ambiguous'&&<p className="input-status">Có nhiều entity phù hợp. Chọn rõ đối tượng dự định dùng.</p>}
      {selected&&<div className="input-binding-preview"><span>“{token}”</span><b>→</b><strong>{selected.name}{selected.code?` · ${selected.code}`:''}</strong></div>}
      {current?.nextCursor&&<button type="button" onClick={()=>{setCursor(current.nextCursor!);setSelected(null)}}>Xem thêm</button>}
      {cursor&&<button type="button" onClick={()=>{setCursor(undefined);setSelected(null)}}>Trang đầu</button>}
      {<button type="button" disabled={disabled} onClick={()=>setCreating(true)}>Không tìm thấy? Tạo đối tượng mới</button>}
    </section>
    {disabled&&<p className="input-status">Cần quyền để tạo binding mới. Bạn vẫn có thể xem các bindings đã xác định.</p>}
  </ResolverFormBody>
}
