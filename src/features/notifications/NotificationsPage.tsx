import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { useCurrentStore } from '../store/store.context'
import { capabilitiesApi, capabilityError, useCapabilityMutation, useCapabilityQuery } from '../backend-capabilities/capabilities.react'
import { notificationDestination, type NotificationItem } from './notifications.navigation'
import { useUnreadNotifications } from './notifications.context'
import { FlowDialog } from '../../shared/flow/FlowDialog'
import { config } from '../../app/config'
import './NotificationsPage.css'

export function NotificationsPage() {
  const { accessibleStores, hasMore, loadMore, listBusy } = useCurrentStore()
  const [store, setStore] = useState(''), [filter, setFilter] = useState<'all' | 'true' | 'false'>('all'), [version, reset] = useState(0)
  const count = useCapabilityQuery('NF02', { query: store ? { store_id: store } : {} })
  return <><AppShellHeader><span>Thông báo</span></AppShellHeader><main className="notification-page"><header className="notification-page__heading"><div><h1>Thông báo {count.result && <small>{count.result.data.unread_count} chưa đọc</small>}</h1><p>Những việc cần bạn chú ý và nơi cần đến để xử lý.</p></div><label>Phạm vi cửa hàng<select aria-label="Phạm vi cửa hàng" value={store} onChange={e => setStore(e.target.value)}><option value="">Tất cả cửa hàng có thể truy cập</option>{accessibleStores.map(s => <option key={s.store_id} value={s.store_id}>{s.name}</option>)}</select>{hasMore && <button disabled={listBusy} onClick={() => void loadMore()}>Đọc thêm cửa hàng</button>}</label></header>
    <nav className="notification-page__filters" aria-label="Trạng thái thông báo">{([['all', 'Tất cả'], ['true', 'Chưa đọc'], ['false', 'Đã đọc']] as const).map(([value, label]) => <button aria-pressed={filter === value} key={value} onClick={() => setFilter(value)}>{label}</button>)}</nav>
    <p className="notification-page__notice"><strong>Đã đọc không có nghĩa là đã xử lý.</strong> Mở hoặc đọc thông báo không tự duyệt Profile, nhập dữ liệu, thay đổi quyền hay chấp nhận lời mời.</p>
    <Inbox key={`${store}:${filter}:${version}`} store={store} filter={filter} onRefresh={() => { reset(v => v + 1); count.retry() }} onCount={count.retry} />
  </main></>
}

function Inbox({ store, filter, onRefresh, onCount }: { store: string; filter: 'all' | 'true' | 'false'; onRefresh: () => void; onCount: () => void }) {
  const [items, setItems] = useState<NotificationItem[]>([]), [cursor, setCursor] = useState<string | null>(null), [next, setNext] = useState<string | null>(null), [attempt, retry] = useState(0)
  const [busy, setBusy] = useState(!config.mockPreview), [error, setError] = useState(''), [selected, setSelected] = useState<string | null>(null)
  const snapshot = useRef<string | undefined>(undefined), seen = useRef(new Set<string>()), mutation = useCapabilityMutation('NF03'), unread = useUnreadNotifications()
  useEffect(() => {
    if (config.mockPreview) return
    const c = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- Reflect the explicit external request lifecycle.
    setBusy(true); setError('')
    void capabilitiesApi.notifications.list({ query: { limit: 20, ...(store ? { store_id: store } : {}), ...(filter !== 'all' ? { unread: filter } : {}), ...(cursor ? { cursor } : {}) } }, { signal: c.signal, ...(snapshot.current ? { snapshotId: snapshot.current } : {}) }).then(response => {
      if (c.signal.aborted) return
      const rows = response.data.items
      if (rows.some(item => seen.current.has(item.notification_id))) throw Error('Danh sách thông báo đã thay đổi. Đọc lại hộp thư.')
      snapshot.current = response.meta.snapshot_id; rows.forEach(item => seen.current.add(item.notification_id))
      setItems(previous => cursor ? [...previous, ...rows] : rows); setNext(response.meta.pagination.next_cursor)
    }).catch(cause => { if (!c.signal.aborted) setError(capabilityError(cause)) }).finally(() => { if (!c.signal.aborted) setBusy(false) })
    return () => c.abort()
  }, [store, filter, cursor, attempt])
  async function mark(item: NotificationItem, read = true) {
    if (mutation.locked) return
    const result = await mutation.send({ path: { notification_id: item.notification_id }, key: crypto.randomUUID(), revision: item.version, body: { read } })
    if (result) { setItems(rows => rows.map(row => row.notification_id === result.data.notification_id ? { ...row, read_at: result.data.read_at, version: result.data.version } : row)); unread?.refresh(); onCount() }
  }
  async function replay() {
    const result = await mutation.replay()
    if (result) { setItems(rows => rows.map(row => row.notification_id === result.data.notification_id ? { ...row, read_at: result.data.read_at, version: result.data.version } : row)); unread?.refresh(); onCount() }
  }
  const visible = items.filter(row => filter === 'all' || (filter === 'true' ? !row.read_at : !!row.read_at))
  const item = items.find(row => row.notification_id === selected)
  return <section className="notification-inbox"><header><div><h2>Inbox</h2><p>Mỗi thông báo giữ đúng cửa hàng và nội dung cần mở.</p></div><button disabled={busy || mutation.locked} onClick={onRefresh}>Đọc lại hộp thư</button></header>
    {config.mockPreview && <p className="notification-page__empty">Kết nối tài khoản để đọc thông báo hiện tại. Bản minh họa không gọi API.</p>}
    {busy && <p role="status" className="notification-page__empty">Đang tải thông báo…</p>}
    {error && <div role="alert" className="notification-page__empty"><p>{error}</p><button disabled={busy} onClick={() => retry(v => v + 1)}>Thử lại</button><button disabled={busy || mutation.locked} onClick={onRefresh}>Đọc lại hộp thư</button></div>}
    {!busy && !error && !visible.length && !config.mockPreview && <div className="notification-page__empty"><h3>Chưa có thông báo</h3><p>Thông báo cần bạn chú ý sẽ xuất hiện ở đây.</p></div>}
    {!!mutation.error && <p role="alert" className="notification-page__notice">Không thể xác nhận trạng thái đã đọc. {capabilityError(mutation.error)} Bạn vẫn có thể mở nội dung cần xử lý.</p>}
    {mutation.uncertain && <button disabled={mutation.busy} onClick={() => void replay()}>Kiểm tra đúng yêu cầu đánh dấu trước</button>}
    {visible.map(row => <article className={`notification-row${row.read_at ? '' : ' notification-row--unread'}`} key={row.notification_id}><button className="notification-row__content" onClick={() => setSelected(row.notification_id)}><strong>{!row.read_at && <span aria-label="Chưa đọc">● </span>}{row.title}</strong><p>{row.body}</p><small>{row.store?.name ?? 'Cửa hàng không còn khả dụng'} · {new Date(row.occurred_at).toISOString().replace('T', ' ').slice(0, 16)} UTC</small></button><div className="notification-row__actions"><span>{row.read_at ? 'Đã đọc' : 'Chưa đọc'}</span><button disabled={mutation.locked} onClick={() => void mark(row, !row.read_at)}>{row.read_at ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}</button><button onClick={() => setSelected(row.notification_id)}>Mở →</button></div></article>)}
    {next && !error && <footer><button disabled={busy || mutation.locked} onClick={() => setCursor(next)}>Xem thêm thông báo</button></footer>}
    {item && <FlowDialog className="notification-dialog" title={item.title} eyebrow="Thông tin cần mở" onClose={() => setSelected(null)} footer={<><button onClick={() => setSelected(null)}>Đóng</button>{notificationDestination(item) && <Link className="sc-flow-primary" to={notificationDestination(item)!}>Mở nội dung cần xử lý</Link>}</>}><section className="notification-detail"><small>Cửa hàng</small><h3>{item.store?.name ?? 'Cửa hàng không còn khả dụng'}</h3><p>{item.body}</p><div className="notification-page__notice"><strong>{notificationDestination(item) ? 'Mở trạng thái hiện tại' : !item.store ? 'Cửa hàng này không còn khả dụng' : item.link?.availability === 'forbidden' ? 'Bạn không còn quyền mở nội dung này' : 'Đích thông báo không còn khả dụng'}</strong><p>Thông báo giữ lịch sử. Quyền và trạng thái công việc được kiểm tra lại ở màn hình đích; hành động cũ không được tự thực hiện lại.</p></div><button disabled={mutation.locked} onClick={() => void mark(item, !item.read_at)}>{item.read_at ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}</button>{!!mutation.error && <p role="alert">Chưa xác nhận trạng thái đã đọc. Bạn vẫn có thể mở nội dung.</p>}</section></FlowDialog>}
  </section>
}
