import { useEffect,useRef,useState } from 'react'
import { useCurrentStore } from './store.context'
import { FlowState } from '../../shared/flow/FlowDialog'

/** Discover every T01 page, then use the normal guarded T02 Store selection. */
export function RequestedStore({storeId,onCancel}:{storeId:string;onCancel:()=>void}){
  const {state,accessibleStores,hasMore,listBusy,listError,loadMore,selectStore,pagination,retry}=useCurrentStore()
  const [error,setError]=useState(''),[attempt,setAttempt]=useState(0),requested=useRef('')
  const found=accessibleStores.some(s=>s.store_id===storeId)
  useEffect(()=>{
    if(state.status==='loading'||listBusy||listError)return
    if(found){const key=storeId+':'+attempt;if(requested.current===key)return;requested.current=key;void selectStore(storeId).then(ok=>{if(!ok)setError('Chưa thể chọn cửa hàng được mời. Hãy kiểm tra quyền hoặc giải quyết thay đổi chưa lưu.')});return}
    if(hasMore){void loadMore();return}
  },[state.status,storeId,found,attempt,hasMore,listBusy,listError,pagination,loadMore,selectStore])
  return <FlowState title={error||listError?'Chưa mở được cửa hàng được mời':'Đang xác nhận cửa hàng được mời'} error={!!(error||listError)}><p>{error||listError||(found?'Đang đọc quyền truy cập hiện tại.':hasMore||state.status==='loading'?'Đang đọc danh sách cửa hàng…':'Cửa hàng không nằm trong danh sách truy cập hiện tại.')}</p><button onClick={()=>{requested.current='';setError('');setAttempt(n=>n+1);retry()}}>Kiểm tra lại</button><button onClick={onCancel}>Quay lại chọn cửa hàng</button></FlowState>
}
