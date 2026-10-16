import { useEffect, useRef, useState } from 'react'
import { capabilitiesApi, capabilityError, useCapabilityQuery } from '../backend-capabilities/capabilities.react'
import type { WireExportSummary } from '../backend-capabilities/capabilities.wire'
import { useCurrentStore } from '../store/store.context'
import { HttpError } from '../../shared/http/httpClient'
import { FlowDialog } from '../../shared/flow/FlowDialog'

export function RetainedExports({runId,onAccessDenied}:{runId:string;onAccessDenied?:()=>void}) {
 const {state}=useCurrentStore(),timezone=state.status==='ready'||state.status==='mock_preview'?state.store.timezone:'UTC'
 const [open,setOpen]=useState(false)
 return <><button onClick={()=>setOpen(true)}>Bản xuất đã có</button>{open&&<Discovery timezone={timezone} runId={runId} onAccessDenied={onAccessDenied} onClose={()=>setOpen(false)}/>}</>
}
function Discovery({runId,timezone,onClose,onAccessDenied}:{runId:string;timezone:string;onClose:()=>void;onAccessDenied?:()=>void}) {
 const [cursor,setCursor]=useState<string>(),[snapshot,setSnapshot]=useState<string>(),[pages,setPages]=useState<WireExportSummary[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 const [denied,setDenied]=useState(false)
 const controller=useRef<AbortController|null>(null)
 useEffect(()=>()=>controller.current?.abort(),[])
 const query=useCapabilityQuery('EX01',{path:{plan_id:runId},query:{limit:20,...(cursor?{cursor}:{}),...(snapshot?{snapshot_id:snapshot}:{})}},true,snapshot?{snapshotId:snapshot}:{})
 const queryDenied=query.error instanceof HttpError&&[401,403,404].includes(query.error.status??0)
 useEffect(()=>{if(queryDenied)onAccessDenied?.()},[queryDenied,onAccessDenied])
 const rows=denied||queryDenied||query.error?[]:[...pages,...(query.result?.data.items??[])],duplicate=new Set(rows.map(r=>r.export_id)).size!==rows.length
 const restart=()=>{setDenied(false);setCursor(undefined);setSnapshot(undefined);setPages([]);query.retry()}
 async function download(row:WireExportSummary){if(busy||denied||queryDenied)return;setBusy(true);setMessage('');const c=new AbortController();controller.current=c;try{const blob=await capabilitiesApi.exports.downloadRetained(row,{signal:c.signal});if(c.signal.aborted)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ShelfCash-${row.export_id}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Đã tải và kiểm tra PDF.')}catch(e){if(!c.signal.aborted){setMessage(capabilityError(e));if(e instanceof HttpError&&[401,403,404].includes(e.status??0)){setDenied(true);setPages([]);onAccessDenied?.()}}}finally{if(!c.signal.aborted)setBusy(false)}}
 const status={queued:'Đang chờ',running:'Đang tạo',completed:'Hoàn tất',failed:'Tạo thất bại'},availability={pending:'Chưa sẵn sàng',available:'Có thể tải',missing:'Không còn artifact',unverifiable:'Chưa xác minh được',failed:'Không khả dụng'}
 return <FlowDialog title="Bản xuất đã có" subtitle="Các bản xuất đã lưu của kế hoạch" onClose={onClose} closeDisabled={busy} footer={<><button disabled={busy} onClick={onClose}>Đóng</button><button disabled={query.loading||busy} onClick={restart}>Đọc lại bản xuất</button></>}><p>Tải bản xuất đã có không tạo bản xuất mới.</p>{query.loading&&<p role="status">Đang tải danh sách bản xuất…</p>}{!!query.error&&<p role="alert">{capabilityError(query.error)}</p>}{duplicate?<p role="alert">Danh sách đã thay đổi. Đọc lại từ trang đầu.</p>:rows.map(row=><article className="sc-flow-section" key={row.export_id}><h3>PDF · {status[row.status]}</h3><p>{new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:timezone}).format(new Date(row.created_at))}</p><p>{availability[row.artifact_availability]}</p>{row.error_code&&<p>{row.error_code}</p>}<button disabled={busy||row.artifact_availability!=='available'||!row.allowed_actions.includes('download')} onClick={()=>void download(row)}>Tải bản PDF đã có</button></article>)}{!query.loading&&!query.error&&!rows.length&&<p>Chưa có bản xuất được lưu cho kế hoạch này.</p>}{!denied&&!query.error&&query.result?.meta.pagination.next_cursor&&!duplicate&&<button disabled={query.loading||busy} onClick={()=>{setPages(rows);setSnapshot(query.result!.meta.snapshot_id);setCursor(query.result!.meta.pagination.next_cursor!)}}>Xem thêm bản xuất</button>}{message&&<p role="status">{message}</p>}<p>Bản không khả dụng cần kiểm tra lại trạng thái. Không tự tạo bản thay thế và không suy đoán thời hạn lưu.</p></FlowDialog>
}
