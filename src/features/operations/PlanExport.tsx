import { useEffect,useRef,useState } from 'react'
import { Link,useSearchParams } from 'react-router'
import { useCurrentStore } from '../store/store.context'
import type { PlanningRun } from '../decision-planning/planning.types'
import { planningStrategyLabels } from '../decision-planning/planning.format'
import type { WireExportEnvelope,WireExportRequest,WireImportEnvelope_JobView_,WireExportJobResult } from './operations.wire'
import { operationsSource } from './operations.source'
import { useOperation } from './useOperation'
import { FlowDialog,FlowState } from '../../shared/flow/FlowDialog'
import { HttpError } from '../../shared/http/httpClient'
import './Operations.css'
export function PlanExport({run,optionId}:{run:PlanningRun;optionId:string|null}){
  const {state}=useCurrentStore();if(state.status!=='ready'&&state.status!=='mock_preview')return null
  if(!['planning.export','planning.result.read','budget.read','procurement.cost.read'].every(p=>state.store.membership.effective_permissions.includes(p)))return <button type="button" disabled title="Quyền hiện tại chưa cho phép xuất PDF">Xuất PDF</button>
  return <Export key={run.run_id+state.store.authorization_version} run={run} optionId={optionId}/>
}
function Export({run,optionId}:{run:PlanningRun;optionId:string|null}){
  const [open,setOpen]=useState(false),[params,setParams]=useSearchParams(),[choice,setChoice]=useState(optionId??'')
  const write=useOperation<WireExportRequest,WireExportEnvelope>()
  const downloadController=useRef<AbortController|null>(null)
  useEffect(()=>()=>downloadController.current?.abort(),[])
  const [polls,setPolls]=useState(0),[check,setCheck]=useState(0),[downloading,setDownloading]=useState(false),[downloaded,setDownloaded]=useState(false)
  const [read,setRead]=useState<{key:string;job?:WireImportEnvelope_JobView_['data'];error?:unknown}>({key:''}),[downloadError,setDownloadError]=useState<unknown>(null)
  const exportId=write.result?.data.export_id??params.get('export_id'),jobId=write.result?.data.job_id??params.get('export_job_id'),key=JSON.stringify([run.run_id,exportId,jobId])
  const current=read.key===key?read:undefined,job=current?.job
  // A retained candidate can be exported for reference even when it is not eligible.
  const exportOptions=run.status==='completed'?(run.result?.options.filter(o=>run.result?.strategies.some(s=>s.option_id===o.option_id&&s.selection_kind!=='NONE'))??[]):[]
  const selectedId=choice||run.result?.winner_option_id,exportable=!!exportOptions.some(o=>o.option_id===selectedId)
  const capturedOption=write.result?.data.option_id??(job?.result&&'option_id' in job.result?job.result.option_id:null)
  const captured=!!exportId||!!jobId,missingLocator=!!exportId!==!!jobId
  const displayedOption=run.result?.options.find(o=>o.option_id===(captured?capturedOption:selectedId))
  const failure=downloadError??current?.error??write.failure
  const httpFailure=failure instanceof HttpError?failure:null,forbidden=httpFailure?.status===401||httpFailure?.status===403
  const resourceGone=httpFailure?.status===404||httpFailure?.status===410
  const artifactUnavailable=httpFailure?.status===503&&httpFailure.problem?.code==='EXPORT_ARTIFACT_UNAVAILABLE'
  const unavailable=resourceGone||artifactUnavailable
  const errorMessage=failure instanceof Error?failure.message:failure?String(failure):''
  function optionName(id:string|null|undefined){if(!id)return 'Phương án đề xuất đã lưu';const labels=run.result?.strategies.filter(s=>s.option_id===id).map(s=>planningStrategyLabels[s.strategy]);return labels?.length?labels.join(' / '):id}
  useEffect(()=>{if(!write.result)return;const p=new URLSearchParams(params);if(p.get('export_id')===write.result.data.export_id&&p.get('export_job_id')===write.result.data.job_id)return;p.set('export_id',write.result.data.export_id);p.set('export_job_id',write.result.data.job_id);setParams(p,{replace:true})},[write.result,params,setParams])
  useEffect(()=>{if(!exportId||!jobId)return;const c=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined
    operationsSource.exportJob(run.store_id,run.run_id,exportId,jobId,c.signal).then(r=>{if(c.signal.aborted)return
      if(r.data.status==='completed'&&r.data.result&&'option_id' in r.data.result&&write.result&&r.data.result.option_id!==write.result.data.option_id)throw Error('Kết quả export sai phương án đã yêu cầu.')
      setRead({key,job:r.data})
      if(['queued','running'].includes(r.data.status)&&polls<60)timer=setTimeout(()=>{setPolls(n=>n+1);setCheck(n=>n+1)},r.meta.poll_after_ms??2000)
    }).catch(error=>{if(!c.signal.aborted)setRead({key,error})});return()=>{c.abort();clearTimeout(timer)}
  },[exportId,jobId,run.store_id,run.run_id,key,check,polls,write.result])
  async function download(){if(!exportId||job?.status!=='completed'||downloading||forbidden||resourceGone)return
    const c=new AbortController();downloadController.current=c;setDownloading(true);setDownloadError(null);setDownloaded(false)
    try{const evidence=job.result&&'download_url' in job.result?job.result as WireExportJobResult:undefined;const blob=await operationsSource.download(run.run_id,exportId,evidence,c.signal);if(c.signal.aborted)return
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ShelfCash-${run.run_id}-${exportId}.pdf`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloaded(true)
    }catch(error){if(!c.signal.aborted)setDownloadError(error)}finally{if(!c.signal.aborted)setDownloading(false)}
  }
  function newExport(){if(!write.reset())return;const p=new URLSearchParams(params);p.delete('export_id');p.delete('export_job_id');setParams(p,{replace:true});setRead({key:''});setDownloadError(null);setDownloaded(false);setPolls(0)}
  const active=job&&['queued','running'].includes(job.status)
  const title=missingLocator?'Không thể khôi phục bản xuất cũ':forbidden?'Không còn quyền tải PDF':unavailable?'Bản PDF không còn khả dụng':downloading?'Đang tải PDF':downloaded?'Tải PDF thành công':downloadError?'Không thể tải PDF':current?.error?'Không thể kiểm tra trạng thái xuất':job?.status==='failed'?'Không thể tạo PDF':job?.status==='completed'?'PDF đã sẵn sàng':active&&polls>=60?'Xuất file đang mất nhiều thời gian hơn bình thường':job?.status==='running'?'Đang tạo PDF':captured?'Yêu cầu xuất đã được tạo':'Xuất kế hoạch PDF'
  return <span className="sc-operations sc-pdf-action"><button type="button" onClick={()=>{if(!captured&&!write.uncertain)setChoice(optionId??'');setOpen(true)}}>{captured?'Tiếp tục xuất PDF':'Xuất PDF'}</button>{open&&<FlowDialog title={title} subtitle="Kế hoạch nhập · kết quả đã lưu" onClose={()=>{if(!write.busy&&!downloading)setOpen(false)}} closeDisabled={write.busy||downloading} footer={<><button type="button" disabled={write.busy||downloading} onClick={()=>setOpen(false)}>Đóng</button>{!captured&&!forbidden&&<button type="button" className="sc-flow-primary" disabled={!exportable||write.busy} onClick={()=>{if(write.uncertain){void write.retry();return}void write.send({format:'pdf',locale:'vi',option_id:choice||null},undefined,(i,s)=>operationsSource.exportPlan(run.run_id,i,s))}}>{write.busy?'Đang tạo tác vụ…':write.uncertain?'Thử lại cùng yêu cầu':'Xác nhận xuất PDF'}</button>}{captured&&!missingLocator&&!forbidden&&!unavailable&&<button type="button" disabled={downloading} onClick={()=>setCheck(n=>n+1)}>Kiểm tra tác vụ</button>}{job?.status==='completed'&&!forbidden&&!resourceGone&&<button type="button" className="sc-flow-primary" disabled={downloading} onClick={()=>void download()}>{downloading?'Đang tải…':artifactUnavailable?'Thử tải lại artifact':downloadError?'Thử lại tải':'Tải PDF'}</button>}{captured&&(missingLocator||unavailable||job?.status==='failed')&&!forbidden&&exportable&&<button type="button" onClick={newExport}>Tạo export mới</button>}</>}>
    <dl className="sc-flow-facts"><div><dt>Khoảng dự báo</dt><dd>{run.request.forecast_start_date} · 7 ngày</dd></div><div><dt>Run</dt><dd>{run.run_id}</dd></div><div><dt>Phương án</dt><dd>{optionName(captured?capturedOption:selectedId)}</dd></div>{exportId&&<div><dt>Mã export</dt><dd>{exportId}</dd></div>}</dl>
    {!captured&&<><label>Phương án sẽ xuất<select disabled={write.locked} value={choice} onChange={e=>setChoice(e.target.value)}><option value="" disabled={!exportOptions.some(o=>o.option_id===run.result?.winner_option_id)}>Phương án đề xuất đã lưu</option>{exportOptions.map(o=><option key={o.option_id} value={o.option_id}>{optionName(o.option_id)}{o.eligible?'':' · Tham khảo, không khuyến nghị'}</option>)}</select></label><p>Chọn phương án để xuất không thay đổi winner của Run.</p><section className="sc-flow-section"><h3>PDF sẽ bao gồm</h3><ul><li>Tổng quan phương án đã lưu</li><li>Nguyên liệu và số lượng đề xuất</li><li>Chi phí, cảnh báo và ràng buộc chính</li><li>Lý do lựa chọn phương án</li></ul></section>{!exportable&&<p>{exportOptions.length?'Chọn một phương án tham khảo để xuất.':'Không có candidate đã lưu để xuất PDF.'}</p>}<p>Mở cửa sổ chưa tạo tác vụ. Chỉ xác nhận xuất mới gửi yêu cầu.</p></>}
    {displayedOption&&!displayedOption.eligible&&<div className="sc-flow-notice" role="alert"><strong>Phương án tham khảo — không được khuyến nghị</strong><p>Phương án này không đáp ứng điều kiện khuyến nghị. PDF giữ trạng thái và lý do đã lưu; xuất file không đổi winner hoặc xác nhận đặt hàng.</p>{displayedOption.rejection_reasons.length>0&&<ul>{displayedOption.rejection_reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>}</div>}
    {artifactUnavailable&&<p>Artifact hiện không đọc được hoặc chưa xác minh được tính toàn vẹn. Có thể thử tải lại cùng bản; tạo export mới cần xác nhận riêng và không bảo đảm khôi phục được.</p>}
    {missingLocator&&<FlowState title="Không còn đủ thông tin để mở bản xuất trước"><p>Không quét hoặc tạo export mới để tìm artifact cũ. Có thể chủ động tạo một export mới nếu Run vẫn đủ điều kiện.</p></FlowState>}
    {active&&<FlowState title={polls>=60?'Tự động kiểm tra đã tạm dừng':job.status==='queued'?'Đang chờ xuất PDF…':'Đang dựng PDF…'}><p>Export gốc vẫn tiếp tục trên server. Kiểm tra lại dùng cùng locator.</p></FlowState>}
    {job?.status==='completed'&&!downloadError&&!downloading&&!downloaded&&<FlowState title="PDF sẵn sàng"><p>Artifact đã sẵn sàng để tải và kiểm tra.</p></FlowState>}
    {downloaded&&<FlowState title="Đã tải và kiểm tra PDF"><p>File được tải từ artifact đã xác nhận. Run và tồn kho không thay đổi.</p></FlowState>}
    {job?.error&&<FlowState title="Tạo PDF không thành công" error><p>{job.error.message}</p></FlowState>}
    {errorMessage&&<FlowState title={forbidden?'Quyền truy cập đã thay đổi':unavailable?'Artifact không còn khả dụng':downloadError?'Chỉ thử tải artifact lại':'Chưa xác nhận được trạng thái'} error><p>{errorMessage}</p><p>{downloadError&&!unavailable?'Export đã sẵn sàng. Không tạo job mới khi chỉ lỗi tải file.':'Giữ nguyên Run và locator hiện có.'}</p>{forbidden&&<Link to="/store">Kiểm tra quyền cửa hàng</Link>}</FlowState>}
    {write.uncertain&&<FlowState title="Chưa biết tác vụ đã được tạo hay chưa"><p>Thử lại giữ nguyên phương án, body và key. Không tạo export thay thế.</p></FlowState>}
    <p>Xuất PDF không đặt hàng hoặc thay đổi tồn kho.</p>
  </FlowDialog>}</span>
}
