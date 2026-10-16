import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { AssistantState } from '../planning.assistant'
import type { PlanningIntentState } from '../planning.intent'
import type { PlanningRun } from '../planning.types'
import type { CapabilityOutput } from '../../backend-capabilities/capabilities.data'
import './PlanningAssistant.css'

type Chat = CapabilityOutput<'AS03'>['data']
type Summary = CapabilityOutput<'AS02'>['data']
export type AssistantPresentation = { locale: 'vi' | 'en'; detail_level: 'simple' | 'technical' }
export type AssistantDrawerProps = {
  run: PlanningRun; optionId?: string | null; state: AssistantState
  chatIntent: PlanningIntentState<'AS03'>; summaryIntent: PlanningIntentState<'AS01'>
  authorized: boolean; contextStatus: 'current' | 'refreshing' | 'restored'
  question: string; onAsk: (question: string) => void
  onCandidate: (kind: 'ingredient' | 'option' | 'product', id: string) => void
  onGenerate: (presentation: AssistantPresentation) => void
  onReadSummary: () => void; onRecoverSummary: () => void
  onRefreshContext: () => void; onClose: () => void; onNavigate: () => void
}
const suggestions = ['Vì sao cần nhập nhiều sữa hơn?', 'Nguyên liệu nào cần chú ý nhất?', 'Cho tôi xem bằng chứng']
function Mark() { return <span className="sc-copilot-mark" aria-hidden="true">✦</span> }
function Loading({ children = 'ShelfCash đang xem kế hoạch này…' }: { children?: ReactNode }) {
  return <div className="sc-copilot-loading" role="status"><i aria-hidden="true"/><span><Mark/> {children}</span></div>
}
function Notice({ title, children, variant = '' }: { title: string; children?: ReactNode; variant?: string }) {
  return <section className={`sc-copilot-state ${variant}`}><strong>{title}</strong>{children}</section>
}
function Evidence({ run, references = [], stale = false, onNavigate }: { run?: PlanningRun; references?: Chat['references']; stale?: boolean; onNavigate?: () => void }) {
  return <section className={`sc-copilot-evidence${stale ? ' is-stale' : ''}`} aria-label={stale ? 'Bằng chứng retained từ ngữ cảnh trước' : 'Bằng chứng của Planning Run hiện tại'}>
    <header><span>{stale ? 'NGỮ CẢNH TRƯỚC' : 'NGUỒN TRONG PLANNING'}</span><strong>{stale ? 'Retained · không dùng như dữ liệu hiện tại' : 'Planning context hiện tại'}</strong></header>
    <div className="sc-copilot-evidence-grid">{run && <><div><span>Kỳ kế hoạch</span><strong>{run.request.forecast_start_date}</strong></div><div><span>Planning Run</span><strong>{run.run_id}</strong></div></>}{references.map(ref => <div key={ref.evidence_id}><span>{ref.source}</span><strong title={ref.evidence_id}>{ref.pointer}</strong></div>)}</div>
    {!stale && onNavigate && <button type="button" onClick={onNavigate}>Xem trong kế hoạch →</button>}
  </section>
}
function Answer({ data, run, stale, onNavigate }: { data: Pick<Chat, 'answer' | 'claims' | 'references'>; run?: PlanningRun; stale?: boolean; onNavigate?: () => void }) {
  return <section className="sc-copilot-answer"><div className="sc-copilot-speaker"><Mark/><strong>ShelfCash</strong></div>
    <p className="sc-copilot-returned-text">{data.answer}</p>
    {data.claims.some(claim => !data.answer.includes(claim.text)) && <ul>{data.claims.filter(claim => !data.answer.includes(claim.text)).map((claim, i) => <li key={i}>{claim.text}</li>)}</ul>}
    <Evidence run={run} references={data.references} stale={stale} onNavigate={onNavigate}/>
  </section>
}
function Clarification({ chat, blocked, onCandidate, onBack }: { chat: Chat; blocked: boolean; onCandidate: AssistantDrawerProps['onCandidate']; onBack: () => void }) {
  const [selection, setSelection] = useState<{ source: Chat; id: string } | null>(null), refs = useRef<(HTMLButtonElement | null)[]>([])
  const selected = selection?.source === chat ? selection.id : null
  const setSelected = (id: string) => setSelection({ source: chat, id })
  const c = chat.clarification!
  const candidates = [...c.candidates.map(x => ({ kind: 'ingredient' as const, id: x.ingredient_id, label: x.name, meta: x.ingredient_id })),
    ...(c.option_candidates ?? []).map(x => ({ kind: 'option' as const, id: x.option_id, label: `Lựa chọn · ${x.option_id}`, meta: `Nguồn chiến lược · ${x.source_strategies.join(' · ')}` })),
    ...(c.product_candidates ?? []).map(x => ({ kind: 'product' as const, id: x.product_id, label: x.name, meta: x.product_id }))]
  const labels = candidates[0]?.kind === 'product' ? 'Bạn đang nói tới sản phẩm nào?' : candidates[0]?.kind === 'option' ? 'Bạn đang nói tới lựa chọn nào?' : c.candidates.length > 3 ? 'Chọn đúng nguyên liệu theo tên và mã nhận diện.' : 'Bạn đang nói tới nguyên liệu nào?'
  const chosen = candidates.find(x => `${x.kind}:${x.id}` === selected)
  return <section><div className="sc-copilot-intent"><span>CÂU HỎI BAN ĐẦU</span><strong>{c.original_question}</strong></div>
    {!candidates.length || c.code === 'QUERY_UNSUPPORTED' ? <Notice title="ShelfCash chưa hỗ trợ câu hỏi này trong Planning hiện tại." variant="neutral"><p>Không có lựa chọn phù hợp để làm rõ. Hãy đặt một câu hỏi mới về Planning Run này.</p><button type="button" disabled={blocked} onClick={onBack}>Đặt câu hỏi mới</button></Notice> : <>
      <div className="sc-copilot-state-head"><Mark/><div><strong>Cần làm rõ một chi tiết</strong><p>{labels} ShelfCash chỉ tiếp tục sau khi bạn chọn rõ một mục.</p></div></div>
      <div className="sc-copilot-candidates" role="radiogroup" aria-label={labels}>{candidates.map((c, i) => <button ref={node => { refs.current[i] = node }} key={`${c.kind}:${c.id}`} type="button" role="radio" disabled={blocked} aria-checked={selected === `${c.kind}:${c.id}`} tabIndex={selected === `${c.kind}:${c.id}` || !selected && i === 0 ? 0 : -1} className={selected === `${c.kind}:${c.id}` ? 'selected' : ''} onClick={() => setSelected(`${c.kind}:${c.id}`)} onKeyDown={event => {
        const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (i + 1) % candidates.length : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (i + candidates.length - 1) % candidates.length : event.key === 'Home' ? 0 : event.key === 'End' ? candidates.length - 1 : null
        if (next !== null) { event.preventDefault(); setSelected(`${candidates[next].kind}:${candidates[next].id}`); refs.current[next]?.focus() }
      }}><span className="sc-copilot-radio" aria-hidden="true"/><span><strong>{c.label}</strong><small>{c.meta}</small></span></button>)}</div>
      {!!c.option_candidates?.length && <p className="sc-copilot-footnote">Tên thân thiện, thứ hạng hoặc “winner” không được suy ra nếu dữ liệu không cung cấp.</p>}
      <div className="sc-copilot-inline-actions"><button type="button" className="secondary" disabled={blocked} onClick={onBack}>Quay lại</button><button type="button" className="primary" disabled={!chosen || blocked} onClick={() => chosen && onCandidate(chosen.kind, chosen.id)}>Tiếp tục câu hỏi này</button></div>
    </>}
  </section>
}
function SummaryPanel({ p, blocked }: { p: AssistantDrawerProps; blocked: boolean }) {
  const [configuring, setConfiguring] = useState(false)
  const [presentation, setPresentation] = useState<AssistantPresentation>({ locale: 'vi', detail_level: 'simple' })
  const { state, summaryIntent, onGenerate, onReadSummary, onRecoverSummary } = p, summary: Summary | null = state.summary
  const unknown = summaryIntent.status === 'unknown', locator = summaryIntent.receiptIds?.generation_id
  const pending = state.requestPending && summaryIntent.status === 'pending'
  const terminal = summary?.status === 'completed' || summary?.status === 'failed'
  if (pending) return <section className="sc-copilot-summary-card"><header><span>YÊU CẦU ĐANG CHỜ</span><h3>Đang gửi yêu cầu tạo tóm tắt</h3><p>ShelfCash đang chờ hệ thống xác nhận yêu cầu tạo vừa gửi. Chưa có trạng thái tạo được lưu để kiểm tra.</p></header><Loading>Đang chờ phản hồi tạo tóm tắt…</Loading></section>
  if (unknown || !summary && locator) return <Notice title="Cần khôi phục lần tạo hiện có trước." variant="recovery"><p>ShelfCash sẽ đối chiếu đúng lần tạo ban đầu để lấy trạng thái hoặc kết quả hiện tại. Thao tác này không tạo một bản tóm tắt mới.</p><div className="sc-copilot-recovery-actions"><button type="button" className="primary" disabled={state.requestPending || p.chatIntent.status === 'unknown'} onClick={onRecoverSummary}>Khôi phục lần tạo này</button></div></Notice>
  if (summary?.status === 'running') return <section className="sc-copilot-summary-card"><header><span>LẦN TẠO ĐÃ ĐƯỢC TIẾP NHẬN</span><h3>Tóm tắt vẫn đang được tạo</h3><p>Yêu cầu tạo đã được tiếp nhận và ShelfCash đang tạo bản tóm tắt. Kiểm tra trạng thái không gửi thêm yêu cầu tạo mới.</p></header><div className="sc-copilot-retained-running"><span className="pulse" aria-hidden="true"/><div><strong>Đang tạo bản tóm tắt</strong><small>Có thể đọc lại trạng thái của lần tạo hiện có.</small></div></div><button type="button" className="sc-copilot-summary-read" disabled={state.requestPending || blocked} onClick={onReadSummary}>Đọc trạng thái hiện tại</button></section>
  if (terminal && !configuring) {
    if (summary.status === 'failed') return <Notice title="Lần tạo tóm tắt này đã kết thúc không thành công."><p>Kết quả kết thúc đã được xác định. Nếu cần, hãy cấu hình một lần tạo mới; đây không phải thử lại.</p><div className="sc-copilot-recovery-actions"><button type="button" className="primary" disabled={blocked} onClick={() => setConfiguring(true)}>Cấu hình bản tóm tắt mới</button></div></Notice>
    const result = summary.result!
    const previous = state.summaryContext === 'previous' || result.identity.aggregate_digest !== p.run.response_version || !!p.optionId && result.option_id !== p.optionId
    return <section className={previous ? 'sc-copilot-stale' : ''}>{previous && <Notice title="Đã đọc lại một bản tóm tắt retained từ ngữ cảnh trước." variant="warning"><p>Bản này vẫn là retained result hợp lệ, nhưng không tự động trở thành tóm tắt của Planning context hiện đã xác minh.</p></Notice>}
      <div className={previous ? 'sc-copilot-summary-previous' : ''}><div className="sc-copilot-summary-meta"><span>{previous ? 'RETAINED SUMMARY · NGỮ CẢNH TRƯỚC' : 'TÓM TẮT ĐÃ TẠO'}</span><strong>{result.locale === 'vi' ? 'Tiếng Việt' : 'English'} · {result.detail_level === 'simple' ? 'Simple' : 'Technical'}</strong></div><Answer data={result} run={previous ? undefined : p.run} stale={previous} onNavigate={p.onNavigate}/></div>
      <div className="sc-copilot-retained-note"><span>NGỮ CẢNH TẠO</span><strong>{summary.generation_id}</strong><small>{result.identity.aggregate_digest}</small></div>
      {previous && <><div className="sc-copilot-context-divider"><span>PLANNING CONTEXT HIỆN TẠI</span></div><Evidence run={p.run} onNavigate={p.onNavigate}/></>}
      <div className="sc-copilot-inline-actions"><button type="button" className="secondary" disabled={blocked} onClick={() => setConfiguring(true)}>{previous ? 'Tạo tóm tắt cho ngữ cảnh hiện tại' : 'Cấu hình bản tóm tắt mới'}</button></div>
    </section>
  }
  return <section className="sc-copilot-summary-card"><header><span>{configuring ? 'TẠO BẢN MỚI CÓ CHỦ ĐÍCH' : 'TÓM TẮT PLANNING RUN'}</span><h3>{configuring ? 'Cấu hình một bản tóm tắt mới' : `Kế hoạch nhập · ${p.run.request.forecast_start_date}`}</h3><p>{configuring ? 'Bản retained trước vẫn giữ nguyên. Bạn có thể chọn ngôn ngữ và mức chi tiết khác cho lần tạo mới.' : 'Tóm tắt được tạo riêng với câu hỏi thông thường.'}</p></header>
    {configuring && <div className="sc-copilot-retained-note"><span>BẢN TRƯỚC</span><strong>Giữ nguyên · không bị thay thế</strong><small>Tạo bản mới không sửa hay tiếp tục bản retained trước.</small></div>}
    <div className="sc-copilot-summary-controls"><label><span>Ngôn ngữ</span><select aria-label="Ngôn ngữ" disabled={blocked} value={presentation.locale} onChange={e => setPresentation({ ...presentation, locale: e.target.value as AssistantPresentation['locale'] })}><option value="vi">Tiếng Việt</option><option value="en">English</option></select></label><label><span>Chế độ</span><select aria-label="Chế độ" disabled={blocked} value={presentation.detail_level} onChange={e => setPresentation({ ...presentation, detail_level: e.target.value as AssistantPresentation['detail_level'] })}><option value="simple">Simple</option><option value="technical">Technical</option></select></label></div>
    <dl className="sc-copilot-summary-context"><div><dt>Nguồn</dt><dd>Planning context hiện tại</dd></div><div><dt>Phạm vi</dt><dd>Retained result</dd></div></dl><button type="button" className="sc-copilot-summary-generate" disabled={blocked} onClick={() => { onGenerate(presentation); setConfiguring(false) }}>{configuring ? 'Tạo bản tóm tắt mới' : 'Tạo tóm tắt'}</button>
  </section>
}

/** Canonical PL-01 render boundary. All facts/actions come from the scoped owner. */
export function PlanningAssistantDrawer(p: AssistantDrawerProps) {
  const [tab, setTab] = useState<'ask' | 'summary'>(p.summaryIntent.status === 'unknown' || p.summaryIntent.status === 'pending' || p.summaryIntent.receiptIds?.generation_id ? 'summary' : 'ask')
  const [draft, setDraft] = useState(p.question), [newQuestion, setNewQuestion] = useState(false)
  const drawer = useRef<HTMLElement>(null), close = useRef<HTMLButtonElement>(null), tabRefs = useRef<(HTMLButtonElement | null)[]>([]), prefix = useId()
  const { state, chatIntent, summaryIntent, authorized, contextStatus } = p
  const permission = !authorized || state.phase === 'permission'
  const unknownChat = chatIntent.status === 'unknown', unknownSummary = summaryIntent.status === 'unknown'
  const restoring = [chatIntent, summaryIntent].some(i => i.status === 'restoring')
  const blockedStorage = [chatIntent, summaryIntent].some(i => i.status === 'blocked')
  const stale = state.phase === 'stale' || contextStatus === 'refreshing'
  const blocked = permission || stale || unknownChat || unknownSummary || restoring || blockedStorage || !!state.requestPending
  useEffect(() => { close.current?.focus() }, [])
  const onClose = p.onClose
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape) }, [onClose])
  const first = () => { setNewQuestion(true); setDraft('') }
  const submit = (question: string) => { if (blocked || !question.trim()) return; setNewQuestion(false); setDraft(''); p.onAsk(question.trim()) }
  let body: ReactNode
  if (permission) body = <div className="sc-copilot-stale"><Notice title={unknownChat || unknownSummary ? 'Không thể hiển thị nội dung Assistant với quyền hiện tại.' : 'Không thể hiển thị thông tin này với quyền hiện tại.'}><p>{unknownChat || unknownSummary ? 'Nội dung Planning được bảo vệ đã được ẩn theo quyền hiện tại.' : 'ShelfCash chỉ dùng dữ liệu Planning mà bạn có thể xem bình thường.'}</p></Notice>{(unknownChat || unknownSummary) && <><div className="sc-copilot-redacted" aria-label="Nội dung đã được ẩn">Nội dung được bảo vệ không hiển thị</div><Notice title="Một lượt trước vẫn chưa có kết quả xác định." variant="recovery blocked"><p>Thay đổi quyền không chứng minh lượt trước đã thất bại hay được hoàn tác. ShelfCash không mở lượt thay thế trong trạng thái này.</p></Notice></>}</div>
  else if (stale) body = <section className="sc-copilot-stale">{contextStatus === 'refreshing' ? <Loading>ShelfCash đang đọc lại bằng chứng Planning hiện tại…</Loading> : <><Notice title="Ngữ cảnh giải thích này đã cũ." variant="warning"><p>ShelfCash sẽ không tiếp tục dùng bằng chứng cũ như thể nó vẫn là dữ liệu hiện tại.</p></Notice>{p.question && <div className="sc-copilot-intent"><span>Ý ĐỊNH CHƯA GIẢI QUYẾT</span><strong>{p.question}</strong></div>}<Evidence stale/><div className="sc-copilot-inline-actions"><button className="primary" type="button" onClick={p.onRefreshContext}>Đọc lại dữ liệu Planning hiện tại</button></div></>}</section>
  else if (unknownChat) body = contextStatus === 'restored' ? <section className="sc-copilot-stale"><div className="sc-copilot-dual-truth"><div className="current"><span>PLANNING CONTEXT</span><strong>Hiện tại</strong><small>Dữ liệu Planning đã được đọc lại thành công.</small></div><div className="blocked"><span>LƯỢT HỎI TRƯỚC</span><strong>Chưa xác định</strong><small>Lượt trước chưa có kết quả; câu hỏi mới đang bị khóa.</small></div></div><Evidence run={p.run} onNavigate={p.onNavigate}/><Notice title="Ngữ cảnh mới không giải quyết lượt hỏi cũ." variant="warning"><p>ShelfCash không tiếp tục câu hỏi trước và cũng không tạo câu hỏi thay thế cho đến khi lượt cũ có kết quả xác định.</p></Notice><div className="sc-copilot-inline-actions"><button type="button" className="secondary" onClick={p.onNavigate}>Xem Planning hiện tại</button></div></section> : <Notice title="Không thể xác định hoặc tiếp tục an toàn lượt hỏi trước." variant="recovery blocked"><p>ShelfCash chỉ còn đủ thông tin để biết một lượt trước vẫn chưa có kết quả xác định. Không đủ nội dung để tái tạo, gửi lại hoặc thay thế câu hỏi đó.</p><div className="sc-copilot-lock-note"><span>CÂU HỎI MỚI ĐANG KHÓA</span><strong>Không thử lại · không tiếp tục · không tạo câu hỏi thay thế</strong></div><div className="sc-copilot-recovery-actions"><button type="button" className="secondary" onClick={p.onNavigate}>Xem Planning hiện tại</button><button type="button" className="secondary" onClick={p.onClose}>Đóng cửa sổ</button></div><small className="sc-copilot-footnote">Đóng cửa sổ không làm lượt chưa xác định trở thành đã giải quyết.</small></Notice>
  else if (restoring) body = <Loading/>
  else if (tab === 'summary' || unknownSummary) body = <SummaryPanel p={p} blocked={blocked}/>
  else if (blockedStorage || state.phase === 'error' && chatIntent.status !== 'failed' && !newQuestion) body = <Notice title="Không thể trả lời lúc này."><p>Dữ liệu Planning Run không bị thay đổi.</p>{!blockedStorage && <button type="button" onClick={first}>Về câu hỏi Planning</button>}</Notice>
  else if (contextStatus === 'restored' && !state.chat && !newQuestion) body = <section className="sc-copilot-stale"><Notice title="Đã thiết lập lại ngữ cảnh hiện tại." variant="success"><p>Bằng chứng mới đã được đọc lại. Không có lượt chưa xác định đang chặn câu hỏi này.</p></Notice><Evidence run={p.run} onNavigate={p.onNavigate}/><div className="sc-copilot-inline-actions"><button type="button" className="primary" onClick={() => p.question ? submit(p.question) : first()}>Tiếp tục với ngữ cảnh mới</button></div></section>
  else if (state.requestPending && !state.chat) body = <><section className="sc-copilot-user"><span>Bạn</span><p>{p.question}</p></section><Loading/></>
  else if (!state.chat || newQuestion) body = <section className="sc-copilot-first">{chatIntent.status === 'failed' && <Notice title="Lượt trước đã có kết quả xác định." variant="success"><p>Công việc trước đã được xác định xong. Câu hỏi dưới đây là một lượt mới có chủ đích, không phải thử lại hay tiếp tục lượt trước.</p></Notice>}<h3>{chatIntent.status === 'failed' ? 'Bắt đầu câu hỏi mới' : 'Bạn muốn hiểu gì về kế hoạch này?'}</h3><p>ShelfCash giải thích Planning Run hiện tại và chỉ ra bằng chứng liên quan.</p><div className="sc-copilot-suggestions">{suggestions.map(item => <button key={item} type="button" disabled={blocked} onClick={() => submit(item)}>{item}<span>→</span></button>)}</div>{state.requestPending && <Loading/>}</section>
  else if (state.chat.kind === 'clarification' && !state.requestPending) body = <Clarification key={state.chat.clarification?.original_question + state.chat.answer} chat={state.chat} blocked={blocked} onCandidate={p.onCandidate} onBack={first}/>
  else body = <section className={state.requestPending ? 'sc-copilot-prior-flow' : ''}><div className={state.requestPending ? 'sc-copilot-prior-answer' : ''}>{state.requestPending && <span>CÂU TRẢ LỜI TRƯỚC · ĐÃ BIẾT</span>}{(state.history.some(m => m.role === 'user') || p.question) && <section className="sc-copilot-user"><span>Bạn</span><p>{state.history.filter(m => m.role === 'user').at(-1)?.content ?? p.question}</p></section>}<Answer data={state.chat} run={p.run} onNavigate={p.onNavigate}/></div>{state.requestPending && <div className="sc-copilot-pending-turn"><span>LƯỢT MỚI ĐANG CHỜ</span><strong>{p.question}</strong><Loading>Đang chờ phản hồi cho câu hỏi mới…</Loading></div>}</section>
  const composer = tab === 'ask' && !permission && !stale && !unknownChat && !unknownSummary && (!state.chat?.clarification || newQuestion)
  return <aside ref={drawer} className="sc-copilot-drawer" role="dialog" aria-modal="false" aria-labelledby={`${prefix}-title`} onKeyDown={event => {
    if (event.key === 'Tab') { const nodes = Array.from(drawer.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]') ?? []); const first = nodes[0], last = nodes.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } }
  }}><header><div><div className="sc-copilot-title"><Mark/><h2 id={`${prefix}-title`}>Hỏi ShelfCash</h2></div><p>Hỏi về Planning Run hiện tại</p></div><button ref={close} type="button" aria-label="Đóng Hỏi ShelfCash" onClick={p.onClose}>×</button></header>
    <section className="sc-copilot-context"><span>ĐANG XEM</span>{!permission && !stale && <><strong>Kế hoạch nhập · {p.run.request.forecast_start_date}</strong><small>Retained result · {p.run.run_id}</small></>}</section>
    <nav className="sc-copilot-mode-tabs" role="tablist" aria-label="Planning Assistant mode">{(['ask', 'summary'] as const).map((t, i) => <button ref={node => { tabRefs.current[i] = node }} key={t} id={`${prefix}-${t}`} type="button" role="tab" aria-selected={tab === t} aria-controls={`${prefix}-panel`} tabIndex={tab === t ? 0 : -1} className={tab === t ? 'active' : ''} disabled={permission || unknownChat || unknownSummary || stale || !!state.requestPending} onClick={() => setTab(t)} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - i; setTab(next ? 'summary' : 'ask'); tabRefs.current[next]?.focus() } }}>{t === 'ask' ? 'Hỏi' : 'Tóm tắt'}</button>)}</nav>
    <div className="sc-copilot-transcript" role="tabpanel" id={`${prefix}-panel`} aria-labelledby={`${prefix}-${tab}`} aria-live="polite" aria-busy={!!state.requestPending}>{body}</div>
    {composer && <form className="sc-copilot-composer" onSubmit={e => { e.preventDefault(); submit(draft) }}><label><span className="sc-copilot-sr-only">Hỏi thêm về Planning Run này</span><input value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} placeholder="Hỏi thêm về kế hoạch này..." disabled={blocked}/></label><button type="submit" aria-label="Gửi câu hỏi" disabled={blocked || !draft.trim()}>↑</button></form>}
  </aside>
}
