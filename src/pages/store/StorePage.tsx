import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { config } from '../../app/config'
import { useAuth } from '../../features/auth/auth.context'
import { useCurrentStore } from '../../features/store/store.context'
import type { StoreContext } from '../../features/store/store.types'
import { createStoreWorkspaceDataSource } from '../../features/store-workspace/storeWorkspace.data'
import { createMockStoreWorkspaceDataSource } from '../../features/store-workspace/storeWorkspace.fixtures'
import { StoreWorkspaceWorkflow } from '../../features/store-workspace/storeWorkspace.workflow'
import {
  InvitationActionDrawer, MemberPermissionDrawer, StaffInviteDrawer, StoreMembers, StoreNoAccess,
  StoreOperatingDefaults, StoreOverview, StoreWorkspaceFeedback, StoreWorkspaceHeader,
  StoreWorkspaceLoading, StoreWorkspaceTabs,
} from '../../features/store-workspace/components'
import type { StoreWorkspaceIdentity, StoreWorkspaceTab } from '../../features/store-workspace/components'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import './StorePage.css'

// Explicit DEV-only synthetic server memory, isolated per Store; cleared on reload.
// Re-reading T02 must not immediately erase an acknowledged fixture mutation.
const previewSource = config.mockPreview ? createMockStoreWorkspaceDataSource() : undefined

function StoreSelector({ locked = false }: { locked?: boolean }) {
  const { accessibleStores, currentStoreId, listBusy, listError, hasMore, loadMore, selectStore, state } = useCurrentStore()
  const [feedback, setFeedback] = useState<string | null>(null)
  return <div className="store-page-selector"><label>Cửa hàng hiện tại<select value={currentStoreId ?? ''} disabled={locked || state.status === 'loading'} onChange={(event) => {
    setFeedback(null)
    void selectStore(event.target.value).then((selected) => { if (!selected) setFeedback('Chưa đổi cửa hàng. Giải quyết yêu cầu hoặc thay đổi chưa lưu trước khi chuyển.') })
  }}><option value="" disabled>Chọn cửa hàng…</option>{accessibleStores.map((store) => <option key={store.store_id} value={store.store_id}>{store.name} · {store.role === 'OWNER' ? 'Owner' : 'Staff'}</option>)}</select></label>
    {hasMore && <button type="button" className="sc-store-secondary" disabled={listBusy || locked} onClick={() => { void loadMore() }}>Đọc thêm cửa hàng</button>}
    {listBusy && <p role="status">Đang đọc danh sách…</p>}{(listError || feedback) && <p role="alert">{listError || feedback}</p>}
    {locked && <p className="sc-store-note">Giải quyết thay đổi chưa lưu hoặc yêu cầu đang chờ trước khi đổi cửa hàng.</p>}
  </div>
}

export function StorePage() {
  const { state, retry } = useCurrentStore()
  const store = state.status === 'ready' || state.status === 'mock_preview' ? state.store : null
  return <><AppShellHeader><span className="store-page-breadcrumb">Cửa hàng</span></AppShellHeader>
    {config.mockPreview && <p className="store-page-preview" role="note">DEV/QA minh họa — dữ liệu và thay đổi chỉ ở bộ nhớ; không ghi Backend hoặc gửi email thật.</p>}
    <main className="store-page">
      {store ? <ScopedStoreWorkspace store={store} /> : state.status === 'empty' ? <StoreNoAccess />
        : state.status === 'loading' ? <StoreWorkspaceLoading />
          : state.status === 'selecting' ? <><h1>Cửa hàng</h1><p>{state.message}</p><StoreSelector /></>
            : <><StoreWorkspaceFeedback title="Chưa mở được cửa hàng" message={state.status === 'error' || state.status === 'unavailable' ? state.message : 'Chưa có cửa hàng hiện hành.'} onRetry={retry} /><StoreSelector /></>}
    </main></>
}

function ScopedStoreWorkspace({ store }: { store: StoreContext }) {
  const { state: auth } = useAuth()
  const { registerChangeGuard, refresh } = useCurrentStore()
  const workflow = useMemo(() => new StoreWorkspaceWorkflow(createStoreWorkspaceDataSource({
    dataSource: config.mockPreview ? 'mock' : 'api', apiBaseUrl: config.apiBaseUrl,
    ...(previewSource ? { mockSource: previewSource } : {}),
  }), store), [store])
  const state = useSyncExternalStore(workflow.subscribe, workflow.getSnapshot, workflow.getSnapshot)
  const [tab, setTab] = useState<StoreWorkspaceTab>('overview')
  const [drawer, setDrawer] = useState<{ kind: 'member' | 'invitation'; id: string } | { kind: 'invite'; openedAt: number } | { kind: 'self' } | null>(null)
  const dirty = useRef(false)
  const [isDirty, setDirty] = useState(false)
  const id = useId()
  const dirtyChange = useMemo(() => (value: boolean) => { dirty.current = value; setDirty(value) }, [])
  useEffect(() => registerChangeGuard(() => !dirty.current && workflow.canLeave()), [registerChangeGuard, workflow])
  useEffect(() => () => workflow.dispose(), [workflow])
  useEffect(() => {
    if (state.receiptKind === 'permissions') {
      dirty.current = false
      void refresh()
    }
  }, [state.receiptKind, state.receiptSerial, refresh])
  useEffect(() => {
    if (tab === 'members' && workflow.canManage) { void workflow.loadMembers(); void workflow.loadInvitations() }
    if (tab === 'operations') void workflow.loadBudget()
  }, [tab, workflow])
  const member = drawer?.kind === 'member' ? state.members.items.find((item) => item.membership_id === drawer.id) : undefined
  const invitation = drawer?.kind === 'invitation' ? state.invitations.items.find((item) => item.invitation_id === drawer.id) : undefined
  const identity: StoreWorkspaceIdentity = { name: auth.status === 'authenticated' ? auth.context.user.display_name : 'Tài khoản · DEV/QA',
    email: auth.status === 'authenticated' ? auth.context.user.email : 'owner-qa@example.invalid', role: store.membership.role, grants: store.membership.effective_permissions }
  const locked = state.busy || state.uncertain
  const readsBusy = state.members.busy || state.invitations.busy || state.contextBusy
  const close = () => { if (!state.busy) { dirtyChange(false); setDrawer(null) } }
  const feedback = { busy: state.busy, error: state.error, notice: state.notice, locked: state.uncertain, onDirtyChange: dirtyChange,
    onRetry: () => { void workflow.retry() } }
  return <>
    <StoreWorkspaceHeader store={store} selector={<StoreSelector locked={locked || isDirty} />} restricted={!workflow.canManage} />
    <StoreWorkspaceTabs tab={tab} id={id} onTab={(next) => { if (!locked && !dirty.current) { close(); setTab(next) } }} />
    <div className="store-page-status" aria-live="polite">
      {state.error && <p role="alert">{state.error}</p>}{state.notice && <p role="status">{state.notice}</p>}
      {state.authorizationInvalidated && state.uncertain && <p>Quyền truy cập chưa được xác minh lại nên thao tác thử lại đang bị khóa. Kết quả lần gửi đầu vẫn chưa biết; cần đối chiếu với hỗ trợ, không suy ra yêu cầu chưa được nhận.</p>}
      {state.uncertain && <><p>Chưa biết kết quả yêu cầu trước. Thử lại giữ nguyên nội dung, key và version gốc. Refresh, rời màn hình hoặc đăng xuất sẽ mất intent ở bộ nhớ; không tạo yêu cầu mới khi chưa đối chiếu.</p><button type="button" className="sc-store-secondary" disabled={state.busy || state.authorizationInvalidated} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button></>}
    </div>
    <section role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`}>
      {tab === 'overview' && <StoreOverview store={store} mockPreview={config.mockPreview} />}
      {tab === 'members' && <StoreMembers members={state.members.items} invitations={state.invitations.items} currentIdentity={state.authorizationInvalidated ? null : identity}
        canManage={workflow.canManage} busy={locked || readsBusy} error={state.members.error || state.invitations.error} membersTotal={state.members.total} invitationsTotal={state.invitations.total}
        hasMoreMembers={!!state.members.cursor} hasMoreInvitations={!!state.invitations.cursor}
        onInvite={() => { if (state.catalogVersion && !readsBusy) setDrawer({ kind: 'invite', openedAt: state.receiptSerial }) }} onSelectIdentity={() => setDrawer({ kind: 'self' })}
        onSelectMember={(item) => setDrawer({ kind: 'member', id: item.membership_id })} onSelectInvitation={(item) => setDrawer({ kind: 'invitation', id: item.invitation_id })}
        onRetry={() => { void workflow.loadMembers(); void workflow.loadInvitations() }} onMoreMembers={() => { void workflow.loadMembers(true) }} onMoreInvitations={() => { void workflow.loadInvitations(true) }} />}
      {tab === 'operations' && <StoreOperatingDefaults key={`${state.context?.context_version ?? 'unread'}:${state.context?.budget_ceiling?.version ?? 'unknown'}:${state.revision}`}
        store={store} planningContext={state.context} loading={state.contextBusy} error={state.contextError || (!workflow.canReadBudget ? 'Cần đủ quyền planning.context.read, budget.read và procurement.cost.read để đọc C01; không suy quyền từ vai trò.' : state.context && !state.context.budget_ceiling ? 'Trần chưa xác minh: API chưa phân biệt rõ chưa cấu hình và không đọc được. Chưa thể tạo trần ban đầu.' : null)}
        canUpdateBudget={workflow.canUpdateBudget && !!state.context?.budget_ceiling} busy={state.busy} locked={state.uncertain} onSaveBudget={(amount) => { void workflow.saveBudget(amount) }} onRetry={() => { if (!isDirty && !locked) void workflow.loadBudget() }} onDirtyChange={dirtyChange} />}
    </section>
    <div className="store-page-refresh"><button type="button" className="sc-store-secondary" disabled={locked || isDirty || readsBusy} onClick={() => { void refresh() }}>Đọc lại cửa hàng và quyền hiện hành</button></div>
    {!state.authorizationInvalidated && (drawer?.kind === 'self' || member) && <MemberPermissionDrawer key={`${member?.membership_id ?? 'self'}:${member?.version ?? store.membership.authorization_version}:${state.catalogVersion}:${state.revision}`}
      member={member} identity={drawer?.kind === 'self' ? identity : null} catalog={state.catalog} canEdit={workflow.canManage && !!state.catalogVersion && !readsBusy} {...feedback}
        onSave={(request) => { if (member) void workflow.savePermissions(member.membership_id, request) }} onClose={close} />}
    {!state.authorizationInvalidated && drawer?.kind === 'invite' && drawer.openedAt === state.receiptSerial && <StaffInviteDrawer key={`invite:${state.revision}`} catalog={state.catalog} catalogVersion={state.catalogVersion} canInvite={workflow.canManage && !readsBusy} {...feedback}
      onSend={(request) => { void workflow.invite(request) }} onClose={close} />}
    {invitation && <InvitationActionDrawer key={`${invitation.invitation_id}:${invitation.version}:${state.revision}`} invitation={invitation} catalog={state.catalog} catalogVersion={state.catalogVersion} canManage={workflow.canManage && !readsBusy} {...feedback}
      onAction={(request) => { void workflow.actOnInvitation(invitation.invitation_id, request) }} onClose={close} />}
  </>
}
