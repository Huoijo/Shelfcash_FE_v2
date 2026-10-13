import { useEffect,useState } from 'react'
import { Link } from 'react-router'
import { useCurrentStore } from '../store/store.context'
import { operationsSource } from './operations.source'
import type { WireEnvelope_PermissionEvents_,WireEnvelope_InvitationEvents_ } from './operations.wire'
import { config } from '../../app/config'
import { createStoreWorkspaceDataSource } from '../store-workspace/storeWorkspace.data'
import { mockWorkspaceSource } from '../mock/mockSources'
import type { InvitationsResponse } from '../store-workspace/storeWorkspace.types'
import './Operations.css'
const workspace=createStoreWorkspaceDataSource({dataSource:config.mockPreview?'mock':'api',apiBaseUrl:config.apiBaseUrl,mockSource:mockWorkspaceSource})
export function StoreActivityPage(){const {state}=useCurrentStore();if(state.status!=='ready'&&state.status!=='mock_preview')return null
  if(state.store.role!=='OWNER')return <main className="sc-operations"><p role="alert">Chỉ Owner được đọc hoạt động quản trị.</p></main>
  return <Activity key={state.store.store_id+state.store.authorization_version} storeId={state.store.store_id}/>
}
function Activity({storeId}:{storeId:string}) {
  const [kind,setKind]=useState<'permissions'|'invitations'>('permissions'),[cursor,setCursor]=useState<string|undefined>(),[retry,setRetry]=useState(0)
  const [invitationId,setInvitationId]=useState(''),[invitationCursor,setInvitationCursor]=useState<string|undefined>()
  const [invitations,setInvitations]=useState<{key:string;data?:InvitationsResponse;error?:string}>({key:''})
  const invitationKey=JSON.stringify([storeId,invitationCursor,retry])
  useEffect(()=>{const c=new AbortController();workspace.invitations(storeId,{cursor:invitationCursor},c.signal).then(data=>{if(!c.signal.aborted)setInvitations({key:invitationKey,data})}).catch(e=>{if(!c.signal.aborted)setInvitations({key:invitationKey,error:e.message})});return()=>c.abort()},[storeId,invitationCursor,retry,invitationKey])
  const invitationPage=invitations.key===invitationKey?invitations:undefined
  const [state,setState]=useState<{key:string;data?:WireEnvelope_PermissionEvents_|WireEnvelope_InvitationEvents_;error?:string}>({key:''})
  const key=JSON.stringify([storeId,kind,invitationId,cursor,retry])
  useEffect(()=>{const c=new AbortController();if(kind==='invitations'&&!invitationId)return()=>c.abort();const read=kind==='permissions'?operationsSource.permissionEvents(storeId,cursor,c.signal):operationsSource.invitationEvents(storeId,invitationId,cursor,c.signal)
    read.then(data=>{if(!c.signal.aborted)setState({key,data})}).catch(e=>{if(!c.signal.aborted)setState({key,error:e.message})});return()=>c.abort()
  },[storeId,kind,invitationId,cursor,retry,key])
  const current=state.key===key?state:null
  return <main className="sc-operations"><Link to="/store">← Cửa hàng</Link><h1>Hoạt động quản trị</h1><div className="sc-operations-actions"><button aria-pressed={kind==='permissions'} onClick={()=>{setKind('permissions');setCursor(undefined)}}>Thay đổi quyền</button><button aria-pressed={kind==='invitations'} onClick={()=>{setKind('invitations');setCursor(undefined)}}>Lời mời</button></div>{kind==='invitations'&&<section><label>Lời mời cần xem<select value={invitationId} onChange={e=>{setInvitationId(e.target.value);setCursor(undefined)}}><option value="">Chọn một lời mời</option>{invitationId&&!invitationPage?.data?.data.items.some(i=>i.invitation_id===invitationId)&&<option value={invitationId}>{invitationId}</option>}{invitationPage?.data?.data.items.map(i=><option key={i.invitation_id} value={i.invitation_id}>{i.target_email} · {i.status}</option>)}</select></label>{invitationPage?.error&&<p role="alert">{invitationPage.error}</p>}{invitationPage?.data?.meta.pagination?.next_cursor&&<button onClick={()=>setInvitationCursor(invitationPage.data!.meta.pagination!.next_cursor!)}>Trang tiếp lời mời</button>}{invitationCursor&&<button onClick={()=>setInvitationCursor(undefined)}>Trang đầu lời mời</button>}{!invitationId&&<p>Chọn lời mời để đọc lịch sử riêng của lời mời đó.</p>}</section>}{!current&&(kind==='permissions'||!!invitationId)&&<p role="status">Đang tải hoạt động…</p>}{current?.error&&<p role="alert">{current.error}</p>}{current?.data&&<section className="sc-operations-card">{current.data.data.items.map(e=><article className="sc-operations-card" key={e.event_id}><p>{e.occurred_at} · {e.reason}</p><p>Người thực hiện: {e.actor_user_id??'Chưa được cung cấp'}</p>{'before_grants' in e?<><p>Trước: {e.before_grants.join(', ')||'Không có quyền'}</p><p>Sau: {e.after_grants.join(', ')||'Không có quyền'}</p><p>Nguồn: {e.source}</p></>:<p>{e.kind} · {e.invitation_id}</p>}</article>)}{!current.data.data.items.length&&<p>Chưa có sự kiện trong phạm vi này.</p>}{current.data.meta.pagination?.next_cursor&&<button onClick={()=>setCursor(current.data!.meta.pagination!.next_cursor!)}>Trang tiếp</button>}{cursor&&<button onClick={()=>setCursor(undefined)}>Trang đầu</button>}</section>}<button onClick={()=>setRetry(n=>n+1)}>Đọc lại hoạt động</button></main>
}
