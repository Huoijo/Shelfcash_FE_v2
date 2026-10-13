import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useCurrentStore } from '../store/store.context'
import { getInventory,getInventoryIngredient,getInventoryLots,getInventoryMovements } from '../inventory/inventory.data'
import type { InventoryResponse,IngredientStock,InventoryMeta } from '../inventory/inventory.types'
import { operationsSource } from './operations.source'
import { IngredientPicker } from './IngredientPicker'
import { useOperation } from './useOperation'
import { FlowDialog,DiscardDialog,FlowState } from '../../shared/flow/FlowDialog'
import { HttpError } from '../../shared/http/httpClient'
import type { WireStockReceiptRequest,WireEnvelope_StockReceiptResult_,WireThresholdRequest,WireEnvelope_ThresholdResult_ } from './operations.wire'
import './Operations.css'
export function InventoryActions({response,onRefresh}:{response:InventoryResponse;onRefresh:()=>void}) {
  const {state}=useCurrentStore();if(state.status!=='ready'&&state.status!=='mock_preview')return null
  return <Actions key={state.store.store_id+state.store.authorization_version} response={response} onRefresh={onRefresh} store={state.store}/>
}
function Actions({response,onRefresh,store}:{response:InventoryResponse;onRefresh:()=>void;store:import('../store/store.types').StoreContext}) {
  const {registerChangeGuard}=useCurrentStore()
  const permissions=store.membership.effective_permissions
  const canReceive=['inventory.receive','inventory.read','ingredient.read'].every(p=>permissions.includes(p))
  const [open,setOpen]=useState(false),[discard,setDiscard]=useState(false),[review,setReview]=useState(false)
  const [kind,setKind]=useState<'receipt'|'threshold'>('receipt')
  const [selected,setSelected]=useState<IngredientStock|null>(null),[selectionMeta,setSelectionMeta]=useState<InventoryMeta>(response.meta)
  const [quantity,setQuantity]=useState(''),[reason,setReason]=useState(''),[received,setReceived]=useState(''),[expiry,setExpiry]=useState(''),[lot,setLot]=useState(''),[observed,setObserved]=useState(''),[cost,setCost]=useState('')
  const [origin,setOrigin]=useState<'ACTUAL_RECEIPT'|'OPENING_STOCK'>('ACTUAL_RECEIPT')
  const [source,setSource]=useState(''),[record,setRecord]=useState(''),[clearThreshold,setClear]=useState(false),[physical,setPhysical]=useState(false),[confirm,setConfirm]=useState(false)
  const [validation,setValidation]=useState(''),[readback,setReadback]=useState(''),[readError,setReadError]=useState(''),[reading,setReading]=useState(false)
  const receipt=useOperation<WireStockReceiptRequest,WireEnvelope_StockReceiptResult_>(),threshold=useOperation<WireThresholdRequest,WireEnvelope_ThresholdResult_>()
  const operation=kind==='receipt'?receipt:threshold
  const controller=useRef<AbortController|null>(null),thresholdVersion=useRef<string|undefined>(undefined)
  const dirty=open&&!operation.result&&!!(selected||quantity||reason||source||record||received||expiry||lot||observed||cost)
  useEffect(()=>()=>controller.current?.abort(),[])
  useEffect(()=>registerChangeGuard(()=>!open||(!operation.locked&&(!dirty||window.confirm('Bỏ thông tin nhận hàng chưa lưu để đổi cửa hàng?')))),[registerChangeGuard,open,operation.locked,dirty])
  useEffect(()=>{if(!dirty&&!operation.locked)return;const prevent=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',prevent);return()=>window.removeEventListener('beforeunload',prevent)},[dirty,operation.locked])
  const failure=operation.failure instanceof HttpError?operation.failure:null
  const forbidden=failure?.status===403||failure?.status===404
  const conflict=failure?.status===409||failure?.status===412
  function close(){if(operation.locked||reading)return;if(dirty){setDiscard(true);return}setOpen(false);if(operation.result)onRefresh()}
  function reset(){if(!receipt.reset()||!threshold.reset())return;setSelected(null);setQuantity('');setReason('');setReceived('');setExpiry('');setLot('');setObserved('');setCost('');setSource('');setRecord('');setPhysical(false);setConfirm(false);setReview(false);setReadback('');setReadError('');setValidation('');setClear(false)}
  async function verify(result:WireEnvelope_StockReceiptResult_,signal:AbortSignal){
    const ingredient=result.data.lot?result.data.movement.lot_id:null
    const id=selected?.ingredient_id;if(!id||!ingredient)throw Error('Chưa xác định nguyên liệu đã ghi.')
    const next=await getInventory({},signal,store.store_id)
    const [detail,lots,moves]=await Promise.all([getInventoryIngredient(id,next.meta.snapshot_id,signal,store.store_id),getInventoryLots(id,{snapshot_id:next.meta.snapshot_id},signal,store.store_id),getInventoryMovements(id,{snapshot_id:next.meta.snapshot_id},signal,store.store_id)])
    if(signal.aborted)return
    setReadback(`Đã đọc snapshot mới: ${detail.data.on_hand_quantity} ${detail.data.unit}. ${lots.data.items.some(l=>l.lot_id===result.data.lot.lot_id)?'Đã thấy lô mới.':'Lô mới chưa nằm trong trang đầu; xem thêm lô.'} ${moves.data.items.some(m=>m.movement_id===result.data.movement.movement_id)?'Đã thấy biến động.':'Xem thêm biến động để đối chiếu.'}`);setReadError('')
  }
  async function retryRead(){if(!receipt.result||reading)return;const c=new AbortController();controller.current=c;setReading(true)
    try{await verify(receipt.result,c.signal);receipt.clearError()}catch(e){if(!c.signal.aborted)setReadError(e instanceof Error?e.message:'Chưa tải đủ dữ liệu mới nhất.')}finally{if(!c.signal.aborted)setReading(false)}
  }
  async function reloadBasis(){const c=new AbortController();controller.current=c;setReading(true);try{const next=await getInventory({},c.signal,store.store_id);if(c.signal.aborted)return;setSelectionMeta(next.meta);setSelected(null);setReview(false);setConfirm(false);operation.clearError();setValidation('Đã tải tồn kho mới. Chọn lại nguyên liệu và kiểm tra thông tin trước khi xác nhận.')}catch(e){if(!c.signal.aborted)setValidation(e instanceof Error?e.message:'Chưa tải được Kho.')}finally{if(!c.signal.aborted)setReading(false)}}
  function validate(){
    if(!selected||!confirm||!reason.trim()||(!clearThreshold&&!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(quantity))){setValidation('Kiểm tra nguyên liệu, số lượng, lý do và xác nhận.');return false}
    if(kind==='receipt'&&(!/[1-9]/.test(quantity)||!source.trim()||!record.trim()||!observed||Number.isNaN(Date.parse(observed))||Date.parse(observed)>Date.now()||received>store.as_of_date||origin==='OPENING_STOCK'&&!physical||expiry&&received&&expiry<received||cost&&!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(cost))){setValidation('Nhập lượng dương, định danh chứng từ nguồn, thời điểm thực nhận hợp lệ và kiểm tra ngày hạn. Tồn đầu kỳ cần xác nhận quan sát thực tế.');return false}
    setValidation('');return true
  }
  async function submit(e?:FormEvent){e?.preventDefault();if(operation.busy||forbidden)return
    if(operation.uncertain){await operation.retry();return}
    if(!validate()||!selected)return
    const id=selected.ingredient_id,c=new AbortController();controller.current=c
    if(kind==='threshold'){
      try{const detail=await getInventoryIngredient(id,selectionMeta.snapshot_id,c.signal,store.store_id);if(c.signal.aborted)return;thresholdVersion.current=detail.data.threshold_version
        await threshold.send({minimum_usable_quantity:clearThreshold?null:quantity,unit:selected.unit,reason},thresholdVersion.current,(i,s)=>operationsSource.threshold(store.store_id,id,i,s),async(_,s)=>{const next=await getInventory({},s,store.store_id);await getInventoryIngredient(id,next.meta.snapshot_id,s,store.store_id);if(!s.aborted)setReadback('Đã đọc lại ngưỡng từ snapshot mới.')})
      }catch(e){if(!c.signal.aborted)setValidation(e instanceof Error?e.message:'Không đọc được phiên bản ngưỡng.')}return
    }
    await receipt.send({origin,receipt_identity:{source_system_key:source,source_record_id:record},ingredient_id:id,supplier_id:null,lot_code:lot||null,quantity,unit:selected.unit,received_date:received||null,expiry_date:expiry||null,unit_cost:cost||null,currency:store.currency,observed_at:observed,reason,expected_inventory_version:selectionMeta.data_version},undefined,(i,s)=>operationsSource.receive(store.store_id,i,s),async(r,s)=>{try{await verify(r,s)}catch(e){if(!s.aborted)setReadError(e instanceof Error?e.message:'Chưa tải đủ dữ liệu sau khi ghi.')}})
  }
  const result=operation.result
  const title=result?(kind==='receipt'?'Đã nhận hàng':'Đã cập nhật ngưỡng'):operation.uncertain?'Chưa xác định được kết quả':operation.busy?'Đang cập nhật Kho…':conflict?'Tồn kho đã thay đổi':review?'Xác nhận nhận hàng':kind==='receipt'?'Nhận hàng vào Kho':'Ngưỡng tồn kho'
  return <div className="sc-operations" style={{padding:'12px 0'}}><div className="sc-operations-actions">{canReceive&&<button onClick={()=>{reset();setKind('receipt');setOpen(true)}}>Nhận hàng / Tồn đầu kỳ</button>}{store.role==='OWNER'&&<button onClick={()=>{reset();setKind('threshold');setOpen(true)}}>Thiết lập ngưỡng kho</button>}</div>
    {open&&<FlowDialog title={title} subtitle="Ghi nhận dữ liệu thực tế của cửa hàng." closeDisabled={operation.locked||reading} onClose={close} footer={result?<><button onClick={close}>Đóng</button>{kind==='receipt'&&(readError?<button className="sc-flow-primary" disabled={reading} onClick={()=>void retryRead()}>Thử tải lại dữ liệu</button>:<><button onClick={reset}>Nhận thêm hàng</button><button className="sc-flow-primary" onClick={()=>{setOpen(false);onRefresh()}}>Xem trong Kho</button></>)}</>:operation.uncertain?<button disabled={operation.busy} className="sc-flow-primary" onClick={()=>void operation.retry()}>Thử lại cùng yêu cầu</button>:conflict?<button disabled={reading} className="sc-flow-primary" onClick={()=>void reloadBasis()}>Tải dữ liệu mới nhất</button>:review?<><button disabled={operation.busy} onClick={()=>setReview(false)}>Quay lại chỉnh sửa</button><button className="sc-flow-primary" disabled={operation.busy||forbidden} onClick={()=>void submit()}>{operation.busy?'Đang ghi…':'Xác nhận nhận hàng'}</button></>:<><button onClick={close} disabled={operation.busy}>Hủy</button><button className="sc-flow-primary" disabled={operation.busy||reading||forbidden} onClick={()=>{if(kind==='threshold')void submit();else if(validate())setReview(true)}}>{kind==='threshold'?'Xác nhận ghi':'Tiếp tục'}</button></>}>
      {result?<><FlowState title="Đã có biên nhận ghi thành công"><p>{kind==='receipt'?`${selected?.name}: +${quantity} ${selected?.unit}`:'Ngưỡng tồn kho đã được cập nhật.'}</p></FlowState>{readError?<FlowState title="Đã ghi nhận hàng, nhưng chưa tải đủ dữ liệu mới nhất" error><p>{readError}</p><p>Không cần nhận hàng lại. Chỉ thử tải lại phần tồn kho/lô/biến động.</p></FlowState>:<p role="status">{readback||'Chưa xác minh được lần đọc lại.'}</p>}</>:operation.busy?<FlowState title="Đang chờ hệ thống xác nhận"><p>Không gửi lại yêu cầu trong lúc này.</p></FlowState>:operation.uncertain?<FlowState title="Giữ nguyên yêu cầu đang chờ đối chiếu"><p>Phản hồi trước chưa rõ. Không tạo receipt mới; thử lại giữ nguyên key, nội dung và phiên bản.</p></FlowState>:review?<><span className="sc-flow-badge">{origin==='ACTUAL_RECEIPT'?'Hàng thực nhận':'Tồn đầu kỳ đã quan sát'}</span><h3>{selected?.name}</h3><dl className="sc-flow-facts">{[['Số lượng',`${quantity} ${selected?.unit}`],['Ngày nhận',received||'Chưa cung cấp'],['Hạn sử dụng',expiry||'Chưa cung cấp'],['Mã lô',lot||'Chưa cung cấp'],['Nhà cung cấp','Chưa cung cấp'],['Đơn giá',cost?`${cost} ${store.currency}`:'Chưa cung cấp'],['Lý do',reason]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className="sc-flow-notice">Tồn kho, lô và biến động chỉ được hiển thị sau khi hệ thống xác nhận.</p></>:<form onSubmit={e=>{e.preventDefault();if(validate())setReview(true)}}><fieldset disabled={operation.locked||forbidden||reading}><section className="sc-flow-section"><h3>Nguyên liệu</h3><IngredientPicker storeId={store.store_id} value={selected?.ingredient_id??''} selectedName={selected?.name} disabled={operation.locked} onClear={()=>{setSelected(null);setConfirm(false)}} onPick={(r,m)=>{setSelected(r);setSelectionMeta(m);setConfirm(false)}}/>{selected&&<p className="sc-flow-notice">Tồn hiện tại: {selected.on_hand_quantity} {selected.unit} · {selected.lot_count} lô</p>}</section>
      <section className="sc-flow-section"><h3>Số lượng</h3><div className="sc-operations-fields"><label>{kind==='receipt'?'Số lượng thực nhận':'Ngưỡng tối thiểu'} ({selected?.unit??'—'})<input inputMode="decimal" value={quantity} onChange={e=>{setQuantity(e.target.value);setConfirm(false)}}/></label><label>Đơn vị<input readOnly value={selected?.unit??''}/></label></div>{kind==='threshold'&&<label className="sc-operations-check"><input type="checkbox" checked={clearThreshold} onChange={e=>setClear(e.target.checked)}/>Xóa cấu hình ngưỡng (khác số 0)</label>}</section>
      {kind==='receipt'&&<><section className="sc-flow-section"><h3>Chi tiết nhận hàng</h3><div className="sc-operations-fields"><label>Nguồn ghi nhận<select value={origin} onChange={e=>setOrigin(e.target.value as typeof origin)}><option value="ACTUAL_RECEIPT">Hàng thực nhận</option><option value="OPENING_STOCK">Tồn đầu kỳ đã quan sát</option></select></label><label>Mã lô (nếu có)<input value={lot} maxLength={128} onChange={e=>setLot(e.target.value)}/></label><label>Ngày nhận (có thể chưa rõ)<input type="date" value={received} onChange={e=>setReceived(e.target.value)}/></label><label>Hạn dùng (có thể chưa rõ)<input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)}/></label><label>Đơn giá (không bắt buộc)<input inputMode="decimal" value={cost} onChange={e=>setCost(e.target.value)}/></label><label>Nhà cung cấp<input disabled placeholder="Chưa cung cấp"/></label></div><p>Nhà cung cấp chưa khai báo. Trùng mã lô không tự gộp lô.</p></section><section className="sc-flow-section"><h3>Thông tin chứng từ</h3><label>Hệ thống/chứng từ nguồn<input value={source} maxLength={128} onChange={e=>setSource(e.target.value)}/></label><label>Mã dòng nhận hàng duy nhất<input value={record} maxLength={128} onChange={e=>setRecord(e.target.value)}/></label><label>Thời điểm quan sát/nhận (ISO, gồm múi giờ)<input value={observed} onChange={e=>setObserved(e.target.value)}/></label></section></>}
      <label>Lý do<textarea value={reason} maxLength={1000} onChange={e=>setReason(e.target.value)}/></label>{origin==='OPENING_STOCK'&&kind==='receipt'&&<label className="sc-operations-check"><input type="checkbox" checked={physical} onChange={e=>setPhysical(e.target.checked)}/>Tôi vừa quan sát số còn thực tế của lô đầu kỳ.</label>}<label className="sc-operations-check"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/>Tôi đã kiểm tra dữ liệu và xác nhận ghi.</label></fieldset></form>}
      {(validation||operation.error)&&<FlowState title={forbidden?'Quyền truy cập đã thay đổi':conflict?'Tồn kho đã thay đổi':'Kiểm tra thông tin'} error><p>{validation||operation.error}</p></FlowState>}
    </FlowDialog>}{discard&&<DiscardDialog onKeep={()=>setDiscard(false)} onDiscard={()=>{setDiscard(false);reset();setOpen(false)}}/>}
  </div>
}
