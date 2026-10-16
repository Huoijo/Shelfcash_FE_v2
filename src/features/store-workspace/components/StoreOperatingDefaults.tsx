import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { PlanningContext } from '../../decision-planning/planning.types'
import type { StoreContext } from '../../store/store.types'
import { formatStoreBudget, parseStoreBudget } from '../storeWorkspace.format'
import { StoreReadonlyToggle, StoreWorkspaceFeedback } from './StoreWorkspaceChrome'
import './StoreWorkspace.css'

export type StoreOperatingDefaultsProps = {
  store: StoreContext
  planningContext?: PlanningContext | null
  loading?: boolean
  error?: string | null
  canUpdateBudget: boolean
  busy: boolean
  locked?: boolean
  notice?: string | null
  onSaveBudget: (amount: string) => void
  onRetry?: () => void
  onDirtyChange?: (dirty: boolean) => void
}

export function StoreOperatingDefaults({ store, planningContext, loading, error, canUpdateBudget, busy, locked, notice, onSaveBudget, onRetry, onDirtyChange }: StoreOperatingDefaultsProps) {
  const id = useId()
  const base = planningContext?.budget_ceiling?.amount ?? ''
  const owner = `${store.store_id}:${planningContext ? planningContext.budget_ceiling?.version ?? 'verified-empty' : 'unread'}`
  const [draft, setDraft] = useState(() => ({ owner, amount: base }))
  const amount = draft.owner === owner ? draft.amount : base
  const dirty = amount !== base
  const parsed = parseStoreBudget(amount)
  const editable = canUpdateBudget && !!planningContext && !loading && !busy && !locked && !error
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false) }, [dirty, onDirtyChange])
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editable && parsed !== null && dirty) onSaveBudget(parsed)
  }
  return <form className="sc-store-stack" onSubmit={save} noValidate>
    <section className="sc-store-card sc-store-card-body"><h2>Thiết lập chung</h2><div className="sc-store-fields sc-store-note-spaced">
      <label className="sc-store-field">Ngày bắt đầu tuần<select className="sc-store-input" disabled value=""><option value="">Chưa được cung cấp</option></select></label>
      <label className="sc-store-field">Ngôn ngữ hiển thị<select className="sc-store-input" disabled value="vi"><option value="vi">Tiếng Việt · giao diện hiện tại</option></select></label>
      <label className="sc-store-field">Múi giờ<select className="sc-store-input" disabled value={store.timezone}><option value={store.timezone}>{store.timezone}</option></select></label>
      <label className="sc-store-field">Đơn vị tiền tệ<select className="sc-store-input" disabled value={store.currency}><option value={store.currency}>{store.currency}</option></select></label>
    </div><p className="sc-store-note sc-store-note-spaced">Múi giờ và tiền tệ là cùng thông tin cửa hàng ở Tổng quan, không có bản chỉnh sửa riêng. Ngày bắt đầu tuần và tùy chọn ngôn ngữ chưa được hỗ trợ.</p></section>
    <section className="sc-store-card sc-store-card-body"><h2>Mặc định lập kế hoạch</h2><div className="sc-store-fields sc-store-note-spaced">
      <label className="sc-store-field">Chu kỳ lập kế hoạch mặc định<select className="sc-store-input" disabled value="7"><option value="7">7 ngày · cố định hiện hành</option></select></label>
      <div><p className="sc-store-field">Tính đơn hàng đang chờ</p><div className="sc-store-status-row"><span className="sc-store-note">Chưa hỗ trợ</span><StoreReadonlyToggle checked={false} label="Tính đơn hàng đang chờ — chưa hỗ trợ" /></div></div>
    </div><div className="sc-store-note-spaced"><p className="sc-store-field">Ưu tiên mặc định</p><div className="sc-store-priorities" role="group" aria-label="Ưu tiên mặc định chưa hỗ trợ">{['Tiết kiệm', 'Cân bằng', 'An toàn'].map((label) => <button key={label} type="button" disabled>{label}</button>)}</div>
      <p className="sc-store-note sc-store-note-spaced">Chưa hỗ trợ chọn ưu tiên mặc định. Ba chiến lược là phương án được máy chủ so sánh, không phải tùy chọn đầu vào; không chọn Cân bằng giả.</p></div></section>
    <div className="sc-store-operations-grid"><section className="sc-store-card sc-store-card-body"><h2>Lịch nhận hàng</h2>
      <div className="sc-store-weekdays" role="group" aria-label="Lịch nhận hàng cửa hàng chưa được cung cấp">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <button key={day} type="button" disabled>{day}</button>)}</div><p className="sc-store-note sc-store-note-spaced">Chưa hỗ trợ lịch nhận hàng chung của cửa hàng. Không dùng lịch giao của từng nhà cung cấp thay thế.</p></section>
      <section className="sc-store-card sc-store-card-body" aria-labelledby={`${id}-budget-title`} aria-busy={loading || busy || undefined}><h2 id={`${id}-budget-title`}>Ngân sách mặc định</h2>
        <label className="sc-store-field sc-store-note-spaced" htmlFor={`${id}-budget`}>Trần ngân sách cửa hàng<div className="sc-store-money"><input id={`${id}-budget`} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} className="sc-store-input" disabled={!editable} value={amount} onChange={(event) => setDraft({ owner, amount: event.target.value })} placeholder="Chưa được thiết lập" aria-invalid={amount !== '' && parsed === null || undefined} aria-describedby={`${id}-budget-note`} /><span>{store.currency}</span></div></label>
        <p className="sc-store-note sc-store-note-spaced">Trần hiện hành: {formatStoreBudget(planningContext?.budget_ceiling?.amount, store.currency)}.</p>
        <p className="sc-store-note sc-store-note-spaced">Ngân sách yêu cầu mặc định: {planningContext ? planningContext.default_requirements?.budget_limit === null ? 'Kế thừa trần cửa hàng' : formatStoreBudget(planningContext.default_requirements?.budget_limit, store.currency) : 'Chưa đọc được'}.</p>
        <p className="sc-store-note sc-store-note-spaced" id={`${id}-budget-note`}>Lưu chỉ thay trần ngân sách, không đổi yêu cầu phục vụ đã lưu. Nhập 0 hoặc 50,000,000; dấu chấm là phần thập phân. Chưa thiết lập không có nghĩa không giới hạn.</p>
        {!canUpdateBudget && <p className="sc-store-note sc-store-note-spaced">Bạn chưa có đủ quyền đọc cấu hình và thay đổi ngân sách.</p>}
        {planningContext && !planningContext.budget_ceiling && <p className="sc-store-note sc-store-note-spaced">Cửa hàng chưa có trần ngân sách. Lưu sẽ tạo cấu hình ban đầu; nếu người khác vừa tạo, hãy đọc lại để đối chiếu.</p>}
        {loading && <p className="sc-store-note sc-store-note-spaced" role="status">Đang tải ngân sách hiện hành…</p>}
      </section></div>
    {error && <StoreWorkspaceFeedback title="Không tải hoặc lưu được ngân sách" message={error} onRetry={onRetry} />}
    {notice && <p className="sc-store-note" role="status">{notice}</p>}
    {locked && <p className="sc-store-note" role="status">Yêu cầu ngân sách trước chưa được giải quyết. Chưa thể gửi thay đổi mới.</p>}
    <footer className="sc-store-actions"><span className="sc-store-note">Các thiết lập chưa hỗ trợ không được lưu cùng ngân sách.</span><button type="submit" className="sc-store-primary" disabled={!editable || parsed === null || !dirty}>{busy ? 'Đang lưu…' : planningContext && !planningContext.budget_ceiling ? 'Tạo ngân sách ban đầu' : 'Lưu ngân sách'}</button></footer>
  </form>
}
