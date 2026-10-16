import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useCurrentStore } from './store.context'
import { AccountField } from '../auth/AccountLifecycle'
import { capabilitiesApi, capabilityError } from '../backend-capabilities/capabilities.react'
import { useStoreCreationMutation } from './storeCreate.react'
import { config } from '../../app/config'
import './StoreBootstrap.css'

export function StoreBootstrap() {
  const [editing, setCreating] = useState(false), [name, setName] = useState(''), [timezone, setTimezone] = useState(''), [currency, setCurrency] = useState('')
  const [error, setError] = useState(''), [checking, setChecking] = useState(false), [checked, setChecked] = useState<string | null>(null)
  const { refresh, registerChangeGuard } = useCurrentStore(), navigate = useNavigate(), mutation = useStoreCreationMutation()
  const creating = editing || !!mutation.intent
  const fields = mutation.intent?.body
  useEffect(() => registerChangeGuard(() => !mutation.locked && !checking), [registerChangeGuard, mutation.locked, checking])
  async function submit(event: FormEvent) {
    event.preventDefault(); if (mutation.locked || checking) return
    try { new Intl.DateTimeFormat('vi', { timeZone: timezone.trim() }).format() } catch { setError('Nhập múi giờ IANA hợp lệ, ví dụ Asia/Ho_Chi_Minh.'); return }
    if (!name.trim() || !/^[A-Z]{3}$/.test(currency.trim())) { setError('Nhập tên cửa hàng và mã tiền tệ gồm 3 chữ cái in hoa.'); return }
    setError(''); await mutation.send({ key: crypto.randomUUID(), body: { name: name.trim(), timezone: timezone.trim(), currency: currency.trim() } })
  }
  async function checkCurrent() {
    if (checking || mutation.busy) return
    setChecking(true); setError('')
    try {
      let response = await capabilitiesApi.stores.list({ query: { limit: 100 } }), count = response.data.items.length
      const seen = new Set<string>()
      while (response.meta.pagination?.next_cursor) { const cursor = response.meta.pagination.next_cursor; if (seen.has(cursor)) throw Error('Danh sách cửa hàng không tiến triển.'); seen.add(cursor); response = await capabilitiesApi.stores.list({ query: { limit: 100, cursor } }); count += response.data.items.length }
      setChecked(count ? 'Tài khoản đã có cửa hàng để truy cập. Kết quả yêu cầu tạo trước đó vẫn chưa được suy ra từ tên cửa hàng.' : 'Chưa đọc thấy cửa hàng. Điều này chưa chứng minh yêu cầu trước chưa tạo cửa hàng.')
    } catch (cause) { setError(capabilityError(cause)) } finally { setChecking(false) }
  }
  async function continueStore() {
    setChecking(true); setError('')
    try { await refresh(); navigate(mutation.result ? `/store?store_id=${mutation.result.data.store_id}` : '/store', { replace: true }) }
    catch (cause) { setError(capabilityError(cause)) } finally { setChecking(false) }
  }
  return <section className="store-bootstrap"><header><p className="store-bootstrap__eyebrow">BẮT ĐẦU VỚI SHELFCASH</p><h1>{mutation.result ? 'Cửa hàng đã được tạo' : creating ? 'Tạo cửa hàng đầu tiên' : 'Bạn chưa có cửa hàng'}</h1><p>{mutation.result ? 'Cửa hàng đã được tạo. Chọn cửa hàng để đọc quyền truy cập hiện tại.' : 'Tạo cửa hàng đầu tiên để bắt đầu nhập dữ liệu và quản lý vận hành.'}</p></header>
    {!creating ? <section className="store-bootstrap__card"><h2>Thiết lập không gian làm việc</h2><p>Chưa có dữ liệu kinh doanh nào được tạo cho tài khoản.</p><button className="sc-store-primary" disabled={mutation.locked} onClick={() => setCreating(true)}>Tạo cửa hàng đầu tiên</button><button className="sc-store-secondary" onClick={() => void continueStore()}>Kiểm tra cửa hàng hiện có</button></section> : mutation.result ? <section className="store-bootstrap__card"><h2>{mutation.result.data.name}</h2><p>{mutation.result.data.timezone} · {mutation.result.data.currency}</p><p>Cửa hàng chưa có menu, tồn kho hoặc ngân sách.</p><button className="sc-store-primary" disabled={checking} onClick={() => void continueStore()}>Mở cửa hàng</button></section> : <section className="store-bootstrap__card"><h2>Thông tin cửa hàng</h2><p>Nhập thông tin cơ bản. Bạn có thể cấu hình vận hành sau.</p>
      {mutation.uncertain && <div className="store-bootstrap__notice" role="alert"><strong>Chưa xác nhận được kết quả</strong><p>Yêu cầu trước có thể đã tạo cửa hàng. Không gửi ý định mới.</p><button disabled={checking || mutation.busy} onClick={() => void checkCurrent()}>Kiểm tra trạng thái</button><button disabled={checking || mutation.busy} onClick={() => void mutation.replay()}>Kiểm tra đúng yêu cầu trước</button></div>}
      {checking && <p role="status">Đang kiểm tra cửa hàng của tài khoản…</p>}{checked && <p role="status">{checked}</p>}
      <form onSubmit={e => void submit(e)}><div className="auth-form__fields"><AccountField label="Tên cửa hàng" value={fields?.name ?? name} onChange={setName} disabled={mutation.locked || checking} maxLength={200} /><AccountField label="Múi giờ" value={fields?.timezone ?? timezone} onChange={setTimezone} disabled={mutation.locked || checking} maxLength={64} /><AccountField label="Tiền tệ" value={fields?.currency ?? currency} onChange={setCurrency} disabled={mutation.locked || checking} maxLength={3} /></div><p className="store-bootstrap__hint">Múi giờ IANA, ví dụ Asia/Ho_Chi_Minh. Mã tiền tệ, ví dụ VND.</p><button className="sc-store-primary" disabled={mutation.locked || checking || config.mockPreview}>{mutation.busy ? 'Đang tạo cửa hàng…' : 'Tạo cửa hàng'}</button><button type="button" className="sc-store-secondary" disabled={mutation.locked || checking} onClick={() => setCreating(false)}>Quay lại</button></form>
    </section>}{!!(error || mutation.error) && <p role="alert">{error || capabilityError(mutation.error)}</p>}</section>
}
