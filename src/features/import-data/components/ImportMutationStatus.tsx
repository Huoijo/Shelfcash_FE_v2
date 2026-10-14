import type { ImportFlowState } from '../importFlow.workflow'

/** No timers or optimistic success. Each transition comes from workflow reads. */
export function ImportMutationStatus({state,onCheck}:{state:ImportFlowState;onCheck:()=>void}) {
  const saving=state.busy&&['mapping','resolution','profile','review'].includes(state.savingOperation??'')
  if(!saving&&(!state.retryOperation || state.retryOperation==='commit'))return null
  return <section className="input-status input-mutation-status" role="status">
    <strong>{saving?'Đang lưu quyết định…':state.busy?'Đang kiểm tra trạng thái đã lưu…':'Chưa xác định kết quả lưu'}</strong>
    <p>{saving?'Thông tin bạn vừa xác nhận vẫn được giữ. Chưa ghi dữ liệu business.':state.notice.includes('chưa xác định')||state.notice.includes('Chưa xác nhận')?state.notice:'Giá trị đã nhập được giữ nguyên. Kiểm tra trạng thái trước khi gửi lại.'}</p>
    {!saving&&<button type="button" disabled={state.busy} onClick={onCheck}>Kiểm tra lại trạng thái</button>}
  </section>
}
