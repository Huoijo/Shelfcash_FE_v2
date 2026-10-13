import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams, useSearchParams, useNavigate } from 'react-router'
import { useAuth } from './auth.context'
import { captureProof, forgetProof } from './invitationProof'
import { createStoreDataSource } from '../store/store.data'
import { config } from '../../app/config'
import { operationsSource } from '../operations/operations.source'
import { useOperation } from '../operations/useOperation'
import type { WireAcceptInvitation, WireEnvelope_AcceptanceReceipt_, WireEnvelope_OfferRead_ } from '../operations/operations.wire'
import { HttpError } from '../../shared/http/httpClient'
import { isPlanningUuid } from '../decision-planning/planning.validation'
import './OnboardingPages.css'
function useProof(locator:string){const location=useLocation();const [proof]=useState(()=>captureProof(locator,location.hash,()=>window.history.replaceState(window.history.state,'',location.pathname+location.search)))
  useEffect(()=>{const meta=document.createElement('meta');meta.name='referrer';meta.content='no-referrer';document.head.append(meta);return()=>meta.remove()},[]);return proof
}
function Frame({children}:{children:ReactNode}){return <div className="sc-invite-page" lang="vi"><header className="sc-invite-header"><Link className="sc-invite-wordmark" to="/">ShelfCash</Link><Link className="sc-invite-back-link" to="/login">← Quay lại đăng nhập</Link></header><main className="sc-invite-main">{children}</main></div>}
function Heading({title,eyebrow,children}:{title:string;eyebrow:string;children?:ReactNode}){return <div className="sc-invite-card-heading"><p className="sc-invite-eyebrow">{eyebrow}</p><h1>{title}</h1>{children&&<p>{children}</p>}</div>}
export function CredentialsPage(){
  const proof=useProof('credentials'),[params]=useSearchParams()
  const invitationId=params.get('invitation_id'),returnTo=invitationId&&isPlanningUuid(invitationId)?`/invitations/${invitationId}`:undefined
  const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[show,setShow]=useState(false)
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false),[invalid,setInvalid]=useState(false)
  const sending=useRef(false)
  async function submit(e:React.FormEvent){e.preventDefault();if(sending.current||!proof)return
    if([...password].length<12||[...password].length>128||new TextEncoder().encode(password).length>1024||password!==confirmation){setError('Mật khẩu cần 12–128 ký tự và xác nhận phải khớp.');return}
    sending.current=true;setBusy(true);setError('')
    try{await operationsSource.completeCredentials({token:proof,password});forgetProof('credentials');setDone(true)}catch(e){setInvalid(e instanceof HttpError&&e.problem?.code==='CREDENTIAL_TOKEN_INVALID');setError(e instanceof HttpError&&e.problem?.code==='CREDENTIAL_TOKEN_INVALID'?'Liên kết có thể không hợp lệ, hết hạn hoặc đã được dùng. Liên hệ người quản lý để được hỗ trợ.':'Chưa xác nhận hoàn tất mật khẩu. Nếu mất phản hồi, thử đăng nhập trước khi yêu cầu token mới.')}finally{setPassword('');setConfirmation('');sending.current=false;setBusy(false)}
  }
  return <Frame><section className="sc-invite-card">{done?<><Heading title="Thiết lập tài khoản đã hoàn tất" eyebrow="ĐÃ THIẾT LẬP TÀI KHOẢN">Bạn vẫn cần đăng nhập để tiếp tục xem và chấp nhận lời mời.</Heading><div className="sc-invite-actions"><Link className="sc-invite-primary" to="/login" state={returnTo?{from:returnTo}:undefined}>Tiếp tục đăng nhập</Link></div></>:!proof?<><Heading title="Hoàn tất mật khẩu" eyebrow="HOÀN TẤT TÀI KHOẢN">Mở liên kết thiết lập mật khẩu từ kênh hỗ trợ đã xác minh.</Heading><p role="alert">Liên kết hiện tại chưa có token thiết lập tài khoản.</p></>:invalid?<><Heading title="Không thể sử dụng liên kết này" eyebrow="LIÊN KẾT THIẾT LẬP">{error}</Heading><Link className="sc-invite-primary" to="/login" state={returnTo?{from:returnTo}:undefined}>Tiếp tục đăng nhập</Link></>:<><Heading title="Thiết lập mật khẩu để tiếp tục" eyebrow="HOÀN TẤT TÀI KHOẢN">Hoàn tất thiết lập không đồng nghĩa bạn đã đăng nhập.</Heading><form className="sc-invite-form" onSubmit={submit}><label className="sc-invite-field"><span>Mật khẩu mới</span><div className="sc-invite-input-shell"><input aria-label="Mật khẩu mới" type={show?'text':'password'} autoComplete="new-password" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/><button type="button" disabled={busy} aria-pressed={show} onClick={()=>setShow(v=>!v)}>{show?'Ẩn':'Hiện'}</button></div><small>12–128 ký tự.</small></label><label className="sc-invite-field"><span>Xác nhận mật khẩu</span><input type={show?'text':'password'} autoComplete="new-password" value={confirmation} disabled={busy} onChange={e=>setConfirmation(e.target.value)}/></label>{error&&<p className="sc-invite-form-error" role="alert">{error}</p>}<button className="sc-invite-primary" disabled={busy}>{busy?'Đang lưu…':'Hoàn tất thiết lập'}</button></form></>}</section></Frame>
}
export function InvitationPage(){const {invitationId=''}=useParams();const {state}=useAuth();const [actor,setActor]=useState(state.status==='authenticated'?state.context.user.user_id:state.status);const next=state.status==='authenticated'?state.context.user.user_id:state.status;if(next!=='bootstrapping'&&next!=='error'&&next!==actor)setActor(next);return <Invitation key={invitationId+actor} id={invitationId} actorId={actor}/>}
function Invitation({id,actorId}:{id:string;actorId:string}){
  const {state,refresh,logout}=useAuth(),navigate=useNavigate(),proof=useProof(id)
  const active=state.status==='authenticated'||state.status==='mock_preview'
  const [resource,setResource]=useState<{offer?:WireEnvelope_OfferRead_['data'];error?:HttpError|string}>({}),[loading,setLoading]=useState(false),[retry,setRetry]=useState(0)
  const [verified,setVerified]=useState<string|null>(null),[verifyError,setVerifyError]=useState(''),[verifying,setVerifying]=useState(false)
  const verification=useRef<AbortController|null>(null)
  useEffect(()=>()=>verification.current?.abort(),[])
  const write=useOperation<WireAcceptInvitation,WireEnvelope_AcceptanceReceipt_>()
  const verify=useCallback(async(storeId:string,signal:AbortSignal)=>{
    setVerifying(true);setVerifyError('')
    try{if(!config.mockPreview){const source=createStoreDataSource(config.apiBaseUrl);let page=await source.list(signal);const seen=new Set<string>();while(!page.items.some(s=>s.store_id===storeId)&&page.pagination.next_cursor){const cursor=page.pagination.next_cursor;if(seen.has(cursor))throw Error('Danh sách cửa hàng đã thay đổi. Hãy thử đọc lại.');seen.add(cursor);page=await source.list(signal,cursor)}if(!page.items.some(s=>s.store_id===storeId))throw Error('Chưa đọc thấy cửa hàng trong danh sách truy cập hiện tại.');await source.read(storeId,signal)}
      await refresh();if(signal.aborted)return;setVerified(storeId);forgetProof(id)
    }catch(e){if(!signal.aborted)setVerifyError(e instanceof Error?e.message:'Chưa xác minh quyền mới.');throw e}finally{if(!signal.aborted)setVerifying(false)}
  },[refresh,id])
  useEffect(()=>{if(actorId==='unauthenticated'||actorId==='bootstrapping'||actorId==='error'||!proof)return;const c=new AbortController();setLoading(true);setResource({})
    operationsSource.offer(id,proof,c.signal).then(async r=>{if(c.signal.aborted)return;setResource({offer:r.data});if(r.data.invitation.status==='accepted')await verify(r.data.invitation.store.store_id,c.signal)}).catch(e=>{if(!c.signal.aborted)setResource(previous=>previous.offer?previous:{error:e instanceof HttpError?e:String(e)})}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()
  },[actorId,id,proof,retry,verify])
  const offer=resource.offer,readFailure=resource.error instanceof HttpError?resource.error:null,code=readFailure?.problem?.code
  const mismatch=code==='INVITATION_ACCOUNT_MISMATCH',expired=offer?.invitation.status==='expired'||code==='INVITATION_EXPIRED',revoked=offer?.invitation.status==='revoked'||code==='INVITATION_REVOKED'
  const invalid=!proof||!isPlanningUuid(id)||readFailure?.status===404
  const accepted=!!write.result||offer?.invitation.status==='accepted'
  async function switchAccount(){try{await logout();navigate('/login',{state:{from:`/invitations/${id}`}})}catch{setVerifyError('Chưa đăng xuất được. Thử lại để đổi tài khoản.')}}
  const title=invalid?'Không thể mở lời mời':mismatch?'Hãy đăng nhập bằng tài khoản khác':expired?'Lời mời đã hết hạn':revoked?'Lời mời không còn hiệu lực':accepted?(write.result?'Bạn đã tham gia cửa hàng':'Bạn đã tham gia cửa hàng này'):resource.error?'Chưa thể tải lời mời':'Bạn được mời vào ShelfCash'
  const terminal=invalid||mismatch||expired||revoked||!!resource.error
  return <Frame><section className="sc-invite-card"><Heading title={title} eyebrow={accepted?'LỜI MỜI ĐÃ CHẤP NHẬN':'LỜI MỜI CỬA HÀNG'}>{invalid?'Liên kết có thể không đúng, thiếu token hoặc không còn tồn tại.':expired?'Liên hệ Owner để nhận lời mời mới.':revoked?'Người quản lý đã thu hồi lời mời này.':resource.error&&!mismatch?'Chưa kiểm tra được trạng thái. Lỗi kết nối không có nghĩa lời mời đã hết hạn.':accepted?'Xác nhận quyền truy cập hiện tại trước khi mở cửa hàng.':'Xem quyền được đề nghị trước khi xác nhận tham gia.'}</Heading>
    {active&&offer&&<><div className="sc-invite-store"><div className="sc-invite-store-mark" aria-hidden="true">SC</div><strong>{offer.invitation.store.name}</strong></div><div className="sc-invite-meta">{[['Gửi tới',offer.invitation.target_email],['Vai trò','Staff'],['Hiệu lực đến',offer.invitation.expires_at]].map(([label,value])=><div key={label} className="sc-invite-meta-row"><span>{label}</span><strong>{value}</strong></div>)}</div>{!accepted&&<section className="sc-invite-section"><h2 className="sc-invite-section-label">Quyền truy cập được đề nghị</h2><ul className="sc-invite-permissions">{offer.invitation.offered_grants.map(g=><li key={g}><span aria-hidden="true">✓</span>{offer.invitation.permission_descriptors.find(d=>d.key===g)?.label_vi??g}</li>)}</ul></section>}</>}
    {mismatch&&state.status==='authenticated'&&<div className="sc-invite-account-card"><span>Đang đăng nhập bằng</span><strong>{state.context.user.email}</strong><p>Đăng xuất rồi xác thực bằng tài khoản được mời để tiếp tục.</p></div>}
    {loading&&<div className="sc-invite-processing" role="status">Đang đọc lời mời và quyền truy cập…</div>}{write.busy&&<div className="sc-invite-processing" role="status">Đang tham gia cửa hàng…</div>}
    {write.uncertain&&<div className="sc-invite-account-warning" role="alert"><strong>Chưa xác nhận được kết quả</strong><p>Giữ nguyên logical intent. Kiểm tra lại bằng cùng yêu cầu, không tạo một lần chấp nhận mới.</p></div>}
    {(write.error||verifyError)&&<p className="sc-invite-form-error" role="alert">{write.error||verifyError}</p>}
    {active&&accepted&&verified&&<div className="sc-invite-verified"><span>✓</span><div><strong>Quyền truy cập đã được xác nhận</strong><p>Cửa hàng được mời sẽ được chọn khi bạn tiếp tục.</p></div></div>}
    <div className="sc-invite-actions">{!active&&!invalid?<><Link className="sc-invite-primary" to="/login" state={{from:`/invitations/${id}`}}>Đăng nhập để tiếp tục</Link><Link className="sc-invite-secondary" to={`/credentials/complete?invitation_id=${id}`}>Hoàn tất thiết lập tài khoản</Link><p>Thiết lập tài khoản cần liên kết riêng từ kênh hỗ trợ đã xác minh.</p></>:mismatch?<button className="sc-invite-primary" onClick={()=>void switchAccount()}>Đăng nhập bằng tài khoản khác</button>:terminal?<><Link className="sc-invite-secondary" to="/login">Quay lại đăng nhập</Link>{resource.error&&!invalid&&!expired&&!revoked&&<button className="sc-invite-primary" onClick={()=>setRetry(n=>n+1)}>Thử lại</button>}</>:accepted?verified?<Link className="sc-invite-primary" to={`/store?store_id=${verified}`}>Đi tới cửa hàng</Link>:<button className="sc-invite-primary" disabled={verifying} onClick={()=>{const storeId=write.result?.data.store_id??offer?.invitation.store.store_id;if(!storeId)return;verification.current?.abort();const c=new AbortController();verification.current=c;void verify(storeId,c.signal).catch(()=>{})}}>{verifying?'Đang xác nhận quyền…':'Đọc lại cửa hàng và phiên'}</button>:active&&offer?<><button className="sc-invite-primary" disabled={!offer.can_accept||write.busy||loading} onClick={()=>{if(!proof)return;if(write.uncertain){void write.retry();return}void write.send({token:proof,accept:true},offer.invitation.version,async(i,s)=>{const r=await operationsSource.accept(id,i,s);if(r.data.store_id!==offer.invitation.store.store_id)throw new HttpError('protocol','Biên nhận không khớp cửa hàng lời mời.');return r},async(r,s)=>verify(r.data.store_id,s))}}>{write.busy?'Đang xử lý…':write.uncertain?'Kiểm tra lại trạng thái':'Chấp nhận lời mời'}</button>{offer.reason_codes.map(c=><p key={c}>{c}</p>)}</>:null}</div>
  </section></Frame>
}
