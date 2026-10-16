import type { HistoryCorrection } from './importFlow.types'
import { importFault, previewCanContinue, type ImportFault } from './importExperience'
import { importDomainBlockers } from './importDomainReview'
import { commitReasonRequired } from './importCommitReason'
import { HttpError } from '../../shared/http/httpClient'
import type { ImportBatch } from './importData.types'
import { describeImportError } from './importData.workflow'
import { isImportUuid } from './importData.validation'
import type {
  CommitIntent, ImportCompletion, ImportFlowDataSource, ImportJob, MappingIntent,
  MappingOptions, MappingQueue, MappingStatus, MappingSummary, PreviewBundle,
  PreviewIntent, ProcessReceipt, SalesResolution, MappingResolution, ResolutionIntent,
  ProfileDecisionRequest, ProfileDecisionIntent, ReviewIntent, SupplierConfirmation,
} from './importFlow.types'

export type ImportFlowTab = 'mapping' | 'profile' | 'review' | 'preview' | 'result'
type Pending =
  | { operation: 'mapping'; mappingId: string; intent: MappingIntent }
  | { operation: 'resolution'; mappingId: string; intent: ResolutionIntent }
  | { operation: 'profile'; profileId: string; intent: ProfileDecisionIntent }
  | { operation: 'preview'; intent: PreviewIntent }
  | { operation: 'review'; intent: ReviewIntent }
  | { operation: 'commit'; intent: CommitIntent }

export type ImportFlowState = {
  batch: ImportBatch | null
  tab: ImportFlowTab
  summary: MappingSummary | null
  queue: MappingQueue | null
  options: MappingOptions | null
  mappingOptions: Record<string, MappingOptions>
  optionsMappingId: string | null
  preview: PreviewBundle | null
  previewStale: boolean
  completion: ImportCompletion | null
  job: ImportJob | null
  selectedSheetId: string | null
  filter: MappingStatus | 'all'
  reviewOnly: boolean
  busy: boolean
  error: string | null
  fault: ImportFault | null
  faultOperation: 'commit' | null
  savingOperation: Pending['operation'] | null
  notice: string
  retryOperation: Pending['operation'] | null
  reviewAcknowledged: boolean
  reviewReason: string
  reviewBlockers: string[]
  canConfirmReview: boolean
  commitAcknowledged: boolean
  commitReason: string
  resolutions: SalesResolution[]
  supplierChanges: SupplierConfirmation[]
  historyCorrections: HistoryCorrection[]
  pollAfterMs: number | null
  commitBlockers: string[]
  canCommit: boolean
}

const initial = (): ImportFlowState => ({
  batch: null, tab: 'mapping', summary: null, queue: null, mappingOptions: {}, options: null,
  optionsMappingId: null, preview: null, previewStale: false, completion: null,
  job: null, selectedSheetId: null, filter: 'all', reviewOnly: true, busy: false, error: null, fault: null, faultOperation: null, savingOperation: null,
  notice: '', retryOperation: null, reviewAcknowledged: false, reviewReason: '',
  reviewBlockers: ['Chưa có bản xem trước từ máy chủ.'], canConfirmReview: false,
  commitAcknowledged: false, commitReason: '',
  resolutions: [], supplierChanges: [], historyCorrections: [], pollAfterMs: null, commitBlockers: ['Chưa có bản xem trước từ máy chủ.'], canCommit: false,
})

function previewBlockers(state: ImportFlowState, mappingRevision: string | null, pending: Pending | null): string[] {
  const { batch, preview, summary } = state
  const blockers: string[] = []
  if (!batch || !preview || !summary) return ['Chưa có bản xem trước và tóm tắt ghép cột từ máy chủ.']
  if (pending) blockers.push('Cần đối chiếu yêu cầu chưa xác định trước thao tác mới.')
  if (state.completion) blockers.push('Lô đã có biên nhận hoàn tất; không ghi lại.')
  if (batch.active_job_id || batch.status !== 'preview_ready') blockers.push('Cần lô ở trạng thái preview_ready và không có tiến trình đang chạy.')
  if (state.previewStale || preview.preview.stale || preview.import_revision !== batch.import_revision || mappingRevision !== summary.mapping_revision ||
    preview.preview.summary.source_set_version !== batch.source_set.version) blockers.push('Bản xem trước hoặc phiên bản ghép cột đã cũ.')
  if (preview.preview.summary.validation_status === 'blocked' || preview.preview.summary.blockers.length) blockers.push('Bản xem trước còn lỗi chặn từ máy chủ.')
  if (preview.unsupportedFields.length || preview.preview.rows.some((row) => row.unsupportedFields.length)) blockers.push('Bản xem trước chứa kiểu dữ liệu chưa được hỗ trợ an toàn.')
  if (preview.preview.rows_page.next_cursor) blockers.push('Cần đọc hết các trang của cùng bản xem trước.')
  if (preview.preview.rows_page.total_count !== null && preview.preview.rows.length !== preview.preview.rows_page.total_count) blockers.push('Số dòng đã đọc chưa khớp tổng của bản xem trước từ máy chủ.')
  if (preview.preview.rows.some((row) => row.confirmation_required && !['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES', 'COUNT_CORRECTION', 'CORRECT_HISTORY_RECORD'].includes(row.proposed_action) &&
    !['supplier_terms', 'payable_fees'].includes(row.canonical_domain ?? row.after?.domain ?? row.before?.domain ?? ''))) blockers.push('Có thao tác cần xác nhận riêng chưa được hỗ trợ; không tự tạo confirmation thay người dùng.')
  return blockers
}

function reviewBlockers(state: ImportFlowState, mappingRevision: string | null, pending: Pending | null, currentReviewRights: boolean): string[] {
  const blockers = [...previewBlockers(state, mappingRevision, pending), ...importDomainBlockers(state.preview, state.resolutions, state.supplierChanges, state.historyCorrections)]
  // can_commit is false before server confirmation, and allowed_actions has no
  // documented confirm_review literal. Use current T02 grants for this phase;
  // the server still reauthorizes the complete action set on the POST.
  if (!currentReviewRights) blockers.push('Cần quyền import.commit và đầy đủ required_actions hiện tại để xác nhận review.')
  if (!state.reviewReason.trim()) blockers.push('Cần nhập lý do review trước khi gửi xác nhận lên máy chủ.')
  if (!state.reviewAcknowledged) blockers.push('Cần xác nhận đã đọc đầy đủ snapshot và cảnh báo.')
  return blockers
}

function commitBlockers(state: ImportFlowState, mappingRevision: string | null, pending: Pending | null): string[] {
  const blockers = [...previewBlockers(state, mappingRevision, pending), ...importDomainBlockers(state.preview, state.resolutions, state.supplierChanges, state.historyCorrections)]
  const { batch, preview, summary } = state
  if (!batch || !preview || !summary) return blockers
  const confirmation = preview.review_confirmation
  if (!preview.confirmation_usable || !confirmation || confirmation.import_id !== batch.import_id ||
    confirmation.read_set_digest !== preview.preview.read_set_digest ||
    confirmation.preview_id !== preview.preview.summary.preview_id || confirmation.preview_digest !== preview.preview.summary.digest ||
    confirmation.mapping_revision !== summary.mapping_revision || confirmation.file_set_version !== batch.file_set_version ||
    confirmation.source_digest !== batch.source_set.digest) blockers.push('Cần xác nhận review hợp lệ trên máy chủ cho đúng preview và nguồn hiện tại.')
  if (!permitted(batch, 'commit') || !preview.preview.summary.can_commit) blockers.push('Máy chủ chưa cho phép ghi toàn bộ lô.')
  const requiredSales = preview.preview.rows.filter((row) => row.confirmation_required && ['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES'].includes(row.proposed_action))
  if (state.resolutions.length !== requiredSales.length || new Set(state.resolutions.map((item) => item.row_id)).size !== state.resolutions.length ||
    state.resolutions.some((item) => !requiredSales.some((row) => row.row_id === item.row_id &&
      (row.proposed_action === 'REPLACE_DAILY_TOTAL' ? item.action === 'replace_daily_total' && item.disjoint_assertion !== true : item.action === 'confirm_disjoint_merge' && item.disjoint_assertion === true)) ||
      !item.report_business_key.trim() || !item.evidence_reference.trim() || !item.reason.trim())) blockers.push('Cần xác nhận tường minh đúng từng dòng thay thế/gộp doanh số.')
  const supplierRows = preview.preview.rows.filter((row) => row.confirmation_required &&
    ['supplier_terms', 'payable_fees'].includes(row.canonical_domain ?? row.after?.domain ?? row.before?.domain ?? ''))
  if (state.supplierChanges.length !== supplierRows.length || new Set(state.supplierChanges.map((item) => item.action_id)).size !== state.supplierChanges.length ||
    state.supplierChanges.some((item) => !supplierRows.some((row) => row.row_id === item.action_id) || !item.reason.trim())) blockers.push('Cần xác nhận đúng từng thay đổi điều khoản/phí nhà cung cấp.')
  if (commitReasonRequired(preview) && !state.commitReason.trim()) blockers.push('Cần nhập lý do đối chiếu kiểm kê hoặc thay đổi dữ liệu.')
  if (!state.commitAcknowledged) blockers.push('Cần xác nhận rõ ràng trước khi ghi nguyên tử toàn bộ lô.')
  return blockers
}

function uncertain(error: unknown) {
  return error instanceof HttpError && ![401, 403].includes(error.status ?? 0) && (error.kind !== 'contract' || (error.status ?? 0) >= 500)
}

function permitted(batch: ImportBatch, action: string) {
  return batch.allowed_actions.includes(action) || batch.allowed_actions.includes(`import.${action}`)
}

function stageError(stage: string, error: unknown) {
  const requestId = error instanceof HttpError && error.requestId ? ` · Mã yêu cầu: ${error.requestId}` : ''
  return `${stage}: ${describeImportError(error)}${requestId}`
}

function configurationRows<T extends { canonical_id: string }>(previous: T[], next: T[]): T[] {
  const combined = [...previous]
  for (const item of next) {
    const existing = combined.find((old) => old.canonical_id === item.canonical_id)
    if (existing && JSON.stringify(existing) !== JSON.stringify(item)) throw new HttpError('protocol', 'Cấu hình của cùng canonical ID thay đổi giữa các trang preview.')
    if (!existing) combined.push(item)
  }
  return combined
}

function mergeConfigurations(previous: PreviewBundle['configurations'], next: PreviewBundle['configurations']) {
  if (!previous || !next) return next
  if (previous.preview_id !== next.preview_id || previous.preview_digest !== next.preview_digest || previous.basis !== next.basis || next.stale) throw new HttpError('protocol', 'Cấu hình không cùng preview pin hoặc đã cũ.')
  return { ...next,
    suppliers: configurationRows(previous.suppliers, next.suppliers), terms: configurationRows(previous.terms, next.terms),
    fees: configurationRows(previous.fees, next.fees), declarations: configurationRows(previous.declarations, next.declarations),
    blocked_row_ids: [...new Set([...previous.blocked_row_ids, ...next.blocked_row_ids])],
  }
}

/** Memory-only continuation of the current upload workspace. Server snapshots,
 * not tabs, counters or a 202 receipt, are the authority for every transition.
 * Poll scheduling belongs to the mounted UI; this class never retries a write automatically.
 */
export class ImportFlowWorkflow {
  private state = initial()
  private listeners = new Set<() => void>()
  private pending: Pending | null = null
  private epoch = 0
  private expectedPreviewId: string | null = null
  private previewMappingRevision: string | null = null
  private processReceipt: ProcessReceipt | null = null
  private abort: AbortController | null = null
  private source: ImportFlowDataSource
  private authorization: { canDecideProfile: boolean; permissions: readonly string[] } | null = null
  private hooks: { refreshBatch: () => Promise<ImportBatch | null>; canDecideProfile?: () => boolean; currentPermissions?: () => readonly string[] }

  constructor(
    source: ImportFlowDataSource,
    hooks: { refreshBatch: () => Promise<ImportBatch | null>; canDecideProfile?: () => boolean; currentPermissions?: () => readonly string[] },
  ) { this.source = source; this.hooks = hooks }

  getSnapshot = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  private update(patch: Partial<ImportFlowState>) {
    this.state = { ...this.state, ...patch }
    const permissions = this.authorization?.permissions ?? this.hooks.currentPermissions?.() ?? []
    const required = this.state.preview?.preview.summary.required_actions ?? []
    const hasCommitRights = permissions.includes('import.commit') && required.every((permission) => permissions.includes(permission))
    const blockers = commitBlockers(this.state, this.previewMappingRevision, this.pending)
    if ((this.authorization || this.hooks.currentPermissions) && !hasCommitRights) blockers.push('Quyền hiện tại chưa đủ cho toàn bộ lô; không dùng quyền từ snapshot cũ.')
    const review = reviewBlockers(this.state, this.previewMappingRevision, this.pending,
      hasCommitRights)
    this.state = { ...this.state, commitBlockers: blockers, canCommit: blockers.length === 0,
      reviewBlockers: review, canConfirmReview: review.length === 0 }
    this.listeners.forEach((listener) => listener())
  }

  setBatch = (batch: ImportBatch | null) => {
    if (batch && (!isImportUuid(batch.import_id) || !isImportUuid(batch.store_id))) return
    if (batch?.import_id !== this.state.batch?.import_id || batch?.store_id !== this.state.batch?.store_id) {
      this.abort?.abort()
      this.epoch++
      this.pending = null
      this.expectedPreviewId = null
      this.previewMappingRevision = null
      this.processReceipt = null
      this.state = initial()
    }
    const stale = !!this.state.preview && batch?.import_revision !== this.state.preview.import_revision &&
      !['committing', 'completed', 'completed_with_warnings'].includes(batch?.status ?? '')
    if (stale && !this.pending && !batch?.active_job_id &&
      ['review_required', 'ready_for_preview'].includes(batch?.status ?? '') && this.state.job?.operation === 'import_preview' && this.state.job.status === 'completed') {
      // A new proposal revision returns the batch to mapping. Keep the historical
      // preview visible/stale, but do not route its refresh through an old job.
      this.processReceipt = null
      this.expectedPreviewId = null
      this.state = { ...this.state, job: null, pollAfterMs: null }
    }
    const activeJobChanged = !!batch?.active_job_id &&
      batch.active_job_id !== (this.state.job?.job_id ?? this.processReceipt?.job_id)
    if (activeJobChanged) {
      // Explicit server-authorized retries receive a new job ID. A terminal old
      // attempt must neither suppress polling nor redirect it to an old receipt.
      if (this.processReceipt?.job_id !== batch.active_job_id) this.processReceipt = null
      this.state = { ...this.state, job: null, error: null }
    }
    const activePoll = batch?.active_job_id && !this.state.job ? batch.poll_after_ms ?? 2000 : this.state.pollAfterMs
    this.update({ batch, pollAfterMs: activePoll, previewStale: this.state.previewStale || stale,
      ...(stale ? { commitAcknowledged: false, reviewAcknowledged: false } : {}) })
  }

  dispose = () => { this.abort?.abort(); this.epoch++; this.listeners.clear() }
  reevaluatePermissions = () => this.update({ reviewAcknowledged: false, commitAcknowledged: false })
  setAuthorization = (canDecideProfile: boolean, permissions: readonly string[]) => {
    this.authorization = { canDecideProfile, permissions: [...permissions] }
    this.reevaluatePermissions()
  }
  setTab = (tab: ImportFlowTab) => {
    if (this.state.completion && tab !== 'result') return
    if (tab === 'result' && !this.state.completion) return
    if (tab === 'preview' && !this.state.preview && !this.processReceipt && !this.state.summary?.can_preview) return
    if (tab === 'profile' && (!this.state.summary || !(this.authorization?.canDecideProfile ?? this.hooks.canDecideProfile?.()))) return
    if (tab === 'review' && !previewCanContinue(this.state)) return
    this.update({ tab })
  }
  acknowledgeCommit = (value: boolean) => {
    if (!this.state.busy && !this.pending) this.update({ commitAcknowledged: value })
  }
  acknowledgeReview = (value: boolean) => {
    if (!this.state.busy && !this.pending) this.update({ reviewAcknowledged: value })
  }
  setReviewReason = (value: string) => {
    if (!this.state.busy && !this.pending) this.update({ reviewReason: value, reviewAcknowledged: false })
  }
  setCommitReason = (value: string) => {
    if (!this.state.busy && !this.pending) this.update({ commitReason: value, commitAcknowledged: false })
  }
  setHistoryCorrections = (values: HistoryCorrection[]) => {
    if (!this.state.busy && !this.pending) this.update({ historyCorrections: structuredClone(values), reviewAcknowledged: false, commitAcknowledged: false })
  }
  setResolutions = (resolutions: SalesResolution[]) => {
    if (!this.state.busy && !this.pending) this.update({ resolutions: structuredClone(resolutions), reviewAcknowledged: false, commitAcknowledged: false })
  }
  setSupplierChanges = (changes: SupplierConfirmation[]) => {
    if (!this.state.busy && !this.pending) this.update({ supplierChanges: structuredClone(changes), reviewAcknowledged: false, commitAcknowledged: false })
  }

  private current(epoch: number, importId: string) {
    return this.epoch === epoch && this.state.batch?.import_id === importId
  }

  private async run(stage: string, task: (importId: string, epoch: number, signal: AbortSignal) => Promise<void>, operation: 'commit' | null = null) {
    const batch = this.state.batch
    if (!batch || this.state.busy) return
    const epoch = this.epoch
    this.abort = new AbortController()
    const signal = this.abort.signal
    this.update({ busy: true, error: null, fault: null, faultOperation: null, savingOperation: null })
    try { await task(batch.import_id, epoch, signal) }
    catch (error) { if (this.current(epoch, batch.import_id)) this.update({ error: stageError(stage, error), fault: importFault(error), faultOperation: operation }) }
    finally { if (this.current(epoch, batch.import_id)) this.update({ busy: false, savingOperation: null }) }
  }

  private async readParent(importId: string, epoch: number) {
    const batch = await this.hooks.refreshBatch()
    if (!this.current(epoch, importId)) return null
    if (!batch || batch.import_id !== importId || batch.store_id !== this.state.batch?.store_id) {
      throw new HttpError('protocol', 'Chưa đọc được đúng lô và cửa hàng hiện tại.')
    }
    this.setBatch(batch)
    return batch
  }

  private async readMappings(importId: string, epoch: number, signal: AbortSignal) {
    const summary = await this.source.summary(importId, signal)
    if (!this.current(epoch, importId)) return
    if (summary.import_id !== importId) throw new HttpError('protocol', 'Tóm tắt không thuộc lô hiện tại.')
    const selected = summary.sheets.some((sheet) => sheet.sheet_id === this.state.selectedSheetId) ? this.state.selectedSheetId : summary.sheets[0]?.sheet_id ?? null
    const queue = await this.source.queue(importId, {
      ...(selected ? { sheet_id: selected } : {}), review_only: this.state.reviewOnly, include_details: true,
      ...(this.state.filter !== 'all' ? { status: this.state.filter } : {}),
    }, signal)
    if (!this.current(epoch, importId)) return
    const sheetOptions = selected ? await this.source.options(importId, selected, undefined, signal) : null
    const after = await this.source.summary(importId, signal)
    if (!this.current(epoch, importId)) return
    // M02 revision metadata is optional; coherent M01 reads remain the fence.
    // Never synthesize a revision from counters or a single filtered page.
    if (after.import_id !== importId || after.mapping_revision !== summary.mapping_revision ||
      (queue.mapping_revision && queue.mapping_revision !== summary.mapping_revision) ||
      (sheetOptions && (sheetOptions.mapping_revision !== summary.mapping_revision || sheetOptions.schema_context_id !== selected)) ||
      (selected && queue.items.some((item) => item.sheet_id !== selected))) {
      this.update({ summary: null, queue: null, mappingOptions: {}, options: null, previewStale: !!this.state.preview, commitAcknowledged: false })
      throw new HttpError('protocol', 'Phiên bản ghép cột thay đổi giữa các lượt đọc. Hãy đọc lại toàn bộ.')
    }
    const stale = !!this.state.preview && summary.mapping_revision !== this.previewMappingRevision
    this.update({ mappingOptions: {}, summary: after, queue, selectedSheetId: selected, options: sheetOptions, optionsMappingId: null,
      previewStale: this.state.previewStale || stale, ...(stale ? { commitAcknowledged: false, reviewAcknowledged: false } : {}) })
  }

  refresh = async () => {
    if (this.processReceipt || this.state.batch?.active_job_id || this.state.job?.status === 'completed') return this.pollJob()
    return this.run('Đọc trạng thái xử lý', async (id, epoch, signal) => {
      const batch = await this.readParent(id, epoch)
      if (!batch || !this.current(epoch, id)) return
      if (batch.completion_available) {
        const completion = await this.source.completion(id, signal)
        if (this.current(epoch, id)) this.update({ completion, tab: 'result', notice: 'Đã khôi phục biên nhận từ máy chủ; không gửi lại commit.' })
        return
      }
      if (!batch.source_set.sealed || ['draft', 'uploaded', 'analyzing'].includes(batch.status)) return
      await this.readMappings(id, epoch, signal)
      if (!this.current(epoch, id)) return
      if (batch.status === 'preview_ready') {
        await this.readPinnedPreview(id, epoch, signal)
        if (this.current(epoch, id)) this.update({ tab: 'preview' })
      }
    })
  }

  selectSheet = async (sheetId: string) => {
    if (this.state.busy || this.pending || !isImportUuid(sheetId) ||
      !this.state.summary?.sheets.some((sheet) => sheet.sheet_id === sheetId)) return
    this.update({ selectedSheetId: sheetId, queue: null, mappingOptions: {}, options: null, optionsMappingId: null })
    await this.refresh()
  }
  setFilter = async (filter: MappingStatus | 'all', reviewOnly = this.state.reviewOnly) => {
    if (this.state.busy || this.pending) return
    this.update({ filter, reviewOnly, queue: null, mappingOptions: {}, options: null, optionsMappingId: null })
    await this.refresh()
  }
  loadMoreMappings = () => this.run('Đọc trang ghép cột', async (id, epoch, signal) => {
    const old = this.state.queue
    if (!old?.pagination.next_cursor) return
    try {
      const next = await this.source.queue(id, {
        ...(this.state.selectedSheetId ? { sheet_id: this.state.selectedSheetId } : {}),
        review_only: this.state.reviewOnly, include_details: true,
        ...(this.state.filter !== 'all' ? { status: this.state.filter } : {}), cursor: old.pagination.next_cursor,
      }, signal)
      if (!this.current(epoch, id)) return
      const after = await this.source.summary(id, signal)
      if (!this.current(epoch, id)) return
      if (after.mapping_revision !== this.state.summary?.mapping_revision ||
        (next.mapping_revision && next.mapping_revision !== after.mapping_revision) ||
        JSON.stringify(next.counts) !== JSON.stringify(old.counts) ||
        (this.state.selectedSheetId && next.items.some((item) => item.sheet_id !== this.state.selectedSheetId)) ||
        next.pagination.total_count !== old.pagination.total_count ||
        next.items.some((item) => old.items.some((previous) => previous.mapping_id === item.mapping_id))) {
        throw new HttpError('protocol', 'Trang ghép cột không cùng phiên bản hoặc bị lặp.')
      }
      this.update({ queue: { ...next, items: [...old.items, ...next.items] } })
    } catch (error) {
      if (this.current(epoch, id)) this.update({ queue: null, mappingOptions: {}, options: null, commitAcknowledged: false })
      throw error
    }
  })

  loadVisibleOptions = async () => {
    const missing = this.state.queue?.items.filter((item) => item.issue_type === 'column' && !this.state.mappingOptions[item.mapping_id]) ?? []
    if (!missing.length || this.state.busy || this.state.error || this.pending) return
    await this.run('Đọc trường đích', async (id, epoch, signal) => {
      const sheetId = this.state.selectedSheetId
      const revision = this.state.summary?.mapping_revision
      if (!sheetId || !revision) return
      const loaded: Record<string, MappingOptions> = {}
      // Bound parallel reads, keeping descriptors specific to each mapping row.
      let next = 0
      await Promise.all(Array.from({ length: Math.min(4, missing.length) }, async () => {
        while (next < missing.length) {
          const item = missing[next++]
          const options = await this.source.options(id, sheetId, item.mapping_id, signal)
          if (options.mapping_revision !== revision || options.schema_context_id !== sheetId) {
            throw new HttpError('protocol', 'Danh sách trường đã thay đổi. Hãy đọc lại ghép cột.')
          }
          loaded[item.mapping_id] = options
        }
      }))
      if (this.current(epoch, id)) this.update({ mappingOptions: { ...this.state.mappingOptions, ...loaded } })
    })
  }

  loadOptions = (mappingId: string) => this.run('Đọc trường đích', async (id, epoch, signal) => {
    if (!this.state.selectedSheetId || !this.state.queue?.items.some((item) => item.mapping_id === mappingId)) return
    const options = await this.source.options(id, this.state.selectedSheetId, mappingId, signal)
    if (!this.current(epoch, id)) return
    if (options.mapping_revision !== this.state.summary?.mapping_revision ||
      options.schema_context_id !== this.state.selectedSheetId) {
      this.update({ options: null, optionsMappingId: null })
      throw new HttpError('protocol', 'Danh sách trường không cùng phiên bản hoặc sheet với hàng đang xử lý.')
    }
    this.update({ options, optionsMappingId: mappingId, mappingOptions: { ...this.state.mappingOptions, [mappingId]: options } })
  })

  loadSheetOptions = (sheetId: string) => this.run('Đọc danh mục schema', async (id, epoch, signal) => {
    if (this.pending || !this.state.summary?.sheets.some((sheet) => sheet.sheet_id === sheetId)) return
    const options = await this.source.options(id, sheetId, undefined, signal)
    if (!this.current(epoch, id)) return
    if (options.mapping_revision !== this.state.summary.mapping_revision || options.schema_context_id !== sheetId) throw new Error('Danh mục schema đã đổi; đọc lại ghép cột.')
    this.update({ options, optionsMappingId: null })
  })

  confirmMapping = (mappingId: string, targetField: string) => this.run('Xác nhận đề xuất', async (id, epoch, signal) => {
    if (this.pending) return
    const issue = this.state.queue?.items.find((item) => item.mapping_id === mappingId)
    const options = this.state.mappingOptions[mappingId] ?? (this.state.optionsMappingId === mappingId ? this.state.options : null)
    const option = options?.options.find((item) => item.key === targetField)
    if (!issue || issue.issue_type !== 'column' ||
      issue.unsupportedFields.length || !option?.available || option.support === 'unsupported' || option.unsupportedFields.length ||
      !options || options.unsupportedFields.length || options.schema_context_id !== issue.sheet_id ||
      !this.state.summary || options.mapping_revision !== this.state.summary.mapping_revision ||
      !this.canPropose()) {
      throw new Error('Cần trường đích khả dụng theo descriptor hiện tại và quyền sửa mapping.')
    }
    this.pending = { operation: 'mapping', mappingId, intent: {
      key: crypto.randomUUID(), mappingRevision: this.state.summary.mapping_revision, targetField,
    } }
    await this.sendPending(id, epoch, signal)
  })

  private canPropose() {
    if (!this.state.batch || this.state.batch.active_job_id || ['completed', 'completed_with_warnings', 'committing'].includes(this.state.batch.status)) return false
    if (this.authorization) return this.authorization.permissions.includes('mapping.propose')
    if (this.hooks.currentPermissions) return this.hooks.currentPermissions().includes('mapping.propose')
    return !!this.state.summary?.allowed_actions.some((action) => ['mapping.propose', 'propose'].includes(action)) ||
      this.state.batch.allowed_actions.some((action) => ['mapping.propose', 'propose'].includes(action))
  }

  resolveMapping = (mappingId: string, resolution: MappingResolution) => this.run('Cập nhật schema / mapping', async (id, epoch, signal) => {
    if (this.pending) return
    const issue = this.state.queue?.items.find((item) => item.mapping_id === mappingId)
    const summary = this.state.summary
    if (!issue || !summary || !this.canPropose()) throw new Error('Cần issue hiện tại và quyền sửa mapping.')
    const requiredType: Partial<Record<MappingResolution['kind'], string>> = {
      sheet_type: 'classification', source_context: 'source_context', identity_binding: 'identity',
      new_entity_proposal: 'identity', declared_conversion: 'conversion', ignored_optional_field: 'column',
    }
    if (requiredType[resolution.kind] && issue.issue_type !== requiredType[resolution.kind]) throw new Error('Resolution không khớp loại issue của máy chủ.')
    if (resolution.kind === 'shared_value') {
      const selectedSheet = summary.sheets.find((sheet) => sheet.sheet_id === issue.sheet_id)
      if (!selectedSheet?.selected_type || selectedSheet.ignored) throw new Error('Chọn schema không bị bỏ qua trước khi khai báo giá trị dùng chung.')
    }
    this.pending = { operation: 'resolution', mappingId, intent: {
      key: crypto.randomUUID(), mappingRevision: summary.mapping_revision, resolution: structuredClone(resolution),
    } }
    await this.sendPending(id, epoch, signal)
  })

  decideProfile = (profileId: string, lifecycleRevision: string, decision: ProfileDecisionRequest) => this.run('Quyết định profile', async (id, epoch, signal) => {
    if (this.pending) return
    const proposal = this.state.summary?.profile_proposals.find((item) => item.profile_id === profileId)
    if (!(this.authorization?.canDecideProfile ?? this.hooks.canDecideProfile?.()) || !proposal || proposal.lifecycle_revision !== lifecycleRevision) throw new Error('Chỉ Owner hiện tại được quyết định đúng phiên bản profile đang xem.')
    if (decision.decision === 'approve_activate' && (!proposal.spec || proposal.missing_fields.length ||
      decision.proposal_revision !== proposal.proposal_revision || decision.expected_active_version !== proposal.active_version)) throw new Error('Phải đọc full spec đầy đủ và đúng proposal/active version trước khi duyệt.')
    if (decision.decision === 'approve_activate' && proposal.active_version !== null && !this.state.summary?.approved_profiles.some((profile) =>
      profile.binding.profile_id === profileId && profile.binding.version === proposal.active_version)) throw new Error('Chưa có approved spec khớp active version để review; không thay bằng latest profile khác.')
    if (decision.decision === 'reject' && decision.proposal_revision !== proposal.proposal_revision) throw new Error('Proposal đã đổi; cần đọc lại trước khi từ chối.')
    if (decision.decision === 'retire' && decision.active_version !== proposal.active_version) throw new Error('Active version đã đổi; cần đọc lại trước khi ngừng sử dụng.')
    this.pending = { operation: 'profile', profileId, intent: { key: crypto.randomUUID(), lifecycleRevision, decision: structuredClone(decision) } }
    await this.sendPending(id, epoch, signal)
  })

  startPreview = () => this.run('Tạo bản xem trước', async (id, epoch, signal) => {
    if (this.pending) return
    await this.readParent(id, epoch)
    if (!this.current(epoch, id)) return
    await this.readMappings(id, epoch, signal)
    if (!this.current(epoch, id)) return
    const batch = this.state.batch
    const summary = this.state.summary
    if (!batch || !summary?.can_preview || summary.blockers.length || !permitted(batch, 'preview')) {
      throw new Error('Máy chủ chưa cho phép xem trước. Hoàn thành ghép cột và phê duyệt Owner nếu được yêu cầu.')
    }
    this.pending = { operation: 'preview', intent: {
      key: crypto.randomUUID(), importRevision: batch.import_revision, mappingRevision: summary.mapping_revision,
    } }
    this.previewMappingRevision = summary.mapping_revision
    this.update({ commitAcknowledged: false, reviewAcknowledged: false })
    await this.sendPending(id, epoch, signal)
  })

  confirmReview = () => this.run('Xác nhận review trên máy chủ', async (id, epoch, signal) => {
    if (this.pending) return
    await this.readParent(id, epoch)
    if (!this.current(epoch, id)) return
    await this.readPinnedPreview(id, epoch, signal, true)
    if (!this.current(epoch, id)) return
    if (!this.state.canConfirmReview) throw new Error(this.state.reviewBlockers.join(' '))
    const { batch, preview, summary, reviewReason } = this.state
    if (!batch || !preview || !summary) return
    this.pending = { operation: 'review', intent: {
      key: crypto.randomUUID(), importRevision: batch.import_revision,
      previewId: preview.preview.summary.preview_id, previewDigest: preview.preview.summary.digest,
      mappingRevision: summary.mapping_revision, reason: reviewReason.trim(),
    } }
    await this.sendPending(id, epoch, signal)
  })

  commit = () => this.run('Ghi toàn bộ lô', async (id, epoch, signal) => {
    if (this.pending) return
    await this.readParent(id, epoch)
    if (!this.current(epoch, id)) return
    await this.readPinnedPreview(id, epoch, signal, true)
    if (!this.current(epoch, id)) return
    if (!this.state.canCommit) throw new Error(this.state.commitBlockers.join(' '))
    const { batch, preview, summary, commitAcknowledged, commitReason, resolutions } = this.state
    const rows = preview?.preview.rows ?? []
    if (!batch || !preview || !summary || !commitAcknowledged || this.state.previewStale ||
      preview.import_revision !== batch.import_revision || this.previewMappingRevision !== summary.mapping_revision ||
      !preview.preview.summary.can_commit || preview.preview.summary.blockers.length ||
      preview.unsupportedFields.length || rows.some((row) => row.unsupportedFields.length) ||
      !permitted(batch, 'commit') || preview.preview.rows_page.next_cursor ||
      preview.preview.summary.source_set_version !== batch.source_set.version) {
      throw new Error('Chưa đủ bản xem trước đầy đủ, phiên bản hiện tại, quyền và xác nhận rõ ràng để ghi lô.')
    }
    const required = rows.filter((row) => row.confirmation_required &&
      ['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES'].includes(row.proposed_action))
    if (resolutions.length !== required.length || new Set(resolutions.map((item) => item.row_id)).size !== resolutions.length ||
      resolutions.some((resolution) => !required.some((row) => row.row_id === resolution.row_id &&
        (row.proposed_action === 'REPLACE_DAILY_TOTAL' ? resolution.action === 'replace_daily_total' && resolution.disjoint_assertion !== true :
          resolution.action === 'confirm_disjoint_merge' && resolution.disjoint_assertion === true)) ||
        !resolution.report_business_key.trim() || !resolution.evidence_reference.trim() || !resolution.reason.trim())) {
      throw new Error('Cần xác nhận đúng toàn bộ phạm vi thay thế/gộp doanh số; không được tự đổi số lượng.')
    }
    if (rows.some((row) => ['COUNT_CORRECTION', 'CORRECT_HISTORY_RECORD', 'REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES', 'AMEND_TERM_PERIOD', 'AMEND_FEE_PERIOD'].includes(row.proposed_action)) && !commitReason.trim()) {
      throw new Error('Cần lý do đối chiếu cho kiểm kê, thay thế hoặc gộp dữ liệu.')
    }
    this.pending = { operation: 'commit', intent: {
      key: crypto.randomUUID(), importRevision: batch.import_revision,
      previewId: preview.preview.summary.preview_id, previewDigest: preview.preview.summary.digest,
      reason: commitReason.trim() || null, resolutions: structuredClone(resolutions), supplierChanges: structuredClone(this.state.supplierChanges), historyCorrections: structuredClone(this.state.historyCorrections),
    } }
    await this.sendPending(id, epoch, signal)
  }, 'commit')

  private async sendPending(id: string, epoch: number, signal: AbortSignal) {
    const pending = this.pending
    if (!pending) return
    this.update({ savingOperation: pending.operation })
    try {
      if (pending.operation === 'mapping' || pending.operation === 'resolution' || pending.operation === 'profile') {
        const result = pending.operation === 'mapping' ? await this.source.confirm(id, pending.mappingId, pending.intent, signal) :
          pending.operation === 'resolution' ? await this.source.resolve(id, pending.mappingId, pending.intent, signal) :
            await this.source.decideProfile(this.state.batch!.store_id, pending.profileId, pending.intent, signal)
        if (!this.current(epoch, id)) return
        this.pending = null
        this.update({ retryOperation: null, options: null, previewStale: !!this.state.preview, commitAcknowledged: false, reviewAcknowledged: false,
          notice: pending.operation === 'profile' ? pending.intent.decision.decision === 'reject' ? 'Owner đã từ chối đề xuất. Quay lại kiểm tra cách hiểu; file và context vẫn được giữ.' : pending.intent.decision.decision === 'retire' ? 'Profile đã ngừng sử dụng. Kiểm tra lại cách hiểu trước khi tiếp tục; không ảnh hưởng completion đã ghi.' : 'Owner đã duyệt reusable profile. Đang đọc lại binding và quyền; chưa ghi dữ liệu Import.' :
            'approval_required' in result && result.approval_required ? 'Đã sửa đề xuất. Vẫn cần Owner duyệt toàn bộ profile; chưa ghi dữ liệu.' : 'Đã cập nhật mapping; chưa ghi dữ liệu.' })
        await this.readMappings(id, epoch, signal)
        if (this.current(epoch, id)) await this.readParent(id, epoch)
      } else if (pending.operation === 'review') {
        const result = await this.source.confirmReview(id, pending.intent)
        if (!this.current(epoch, id)) return
        if (result.confirmation.preview_id !== pending.intent.previewId || result.confirmation.preview_digest !== pending.intent.previewDigest ||
          result.confirmation.mapping_revision !== pending.intent.mappingRevision) throw new HttpError('protocol', 'Xác nhận review không khớp intent đã gửi.')
        this.pending = null
        this.update({ retryOperation: null, reviewAcknowledged: false, commitAcknowledged: false,
          notice: 'Đã lưu xác nhận review trên máy chủ. Chưa ghi dữ liệu; cần xác nhận commit riêng.' })
        await this.readParent(id, epoch)
        if (this.current(epoch, id)) await this.readPinnedPreview(id, epoch, signal, true)
      } else {
        const receipt = pending.operation === 'preview' ? await this.source.preview(id, pending.intent) : await this.source.commit(id, pending.intent)
        if (!this.current(epoch, id)) return
        this.pending = null
        this.processReceipt = receipt
        this.expectedPreviewId = pending.operation === 'commit' ? pending.intent.previewId : null
        this.update({ retryOperation: null, job: null, pollAfterMs: receipt.poll_after_ms ?? 2000,
          notice: pending.operation === 'commit' ? 'Máy chủ đã nhận yêu cầu ghi. Chưa có kết quả bền vững.' : 'Máy chủ đã nhận yêu cầu xem trước. Chưa ghi dữ liệu.',
          tab: 'preview', commitAcknowledged: false })
        await this.readParent(id, epoch)
      }
    } catch (error) {
      if (!this.current(epoch, id)) return
      // Once a receipt was obtained, a follow-up read failure must never resend it.
      if (this.pending === pending) {
        const keep = uncertain(error)
        if (!keep) this.pending = null
        this.update({ retryOperation: keep ? pending.operation : null, commitAcknowledged: false, reviewAcknowledged: false })
        try {
          await this.readParent(id, epoch)
          if (['mapping', 'resolution', 'profile'].includes(pending.operation) && this.current(epoch, id)) await this.readMappings(id, epoch, signal)
        } catch { /* Preserve the mutation's original diagnostic and retained intent. */ }
      }
      throw error
    }
  }

  retry = () => this.checkPendingState()

  /** Product recovery is read-only until authoritative state proves the intent
   * was applied. The current API has no negative/terminal intent-status receipt;
   * unchanged state therefore means unknown, never permission to resend. */
  checkPendingState = () => this.run('Kiểm tra kết quả lưu', async (id, epoch, signal) => {
    const pending = this.pending
    if (!pending) return
    const batch = await this.readParent(id, epoch)
    if (!batch || !this.current(epoch, id)) return
    if (pending.operation === 'commit') {
      if (batch.completion_available) {
        const completion = await this.source.completion(id, signal)
        if (!this.current(epoch, id)) return
        if (completion.preview_id !== pending.intent.previewId) throw new HttpError('protocol', 'Biên nhận không khớp Preview đang kiểm tra.')
        this.pending = null
        this.update({ completion, retryOperation: null, tab: 'result', notice: 'Đã xác nhận import hoàn tất từ biên nhận máy chủ.' })
      } else if (batch.active_job_id && batch.status === 'committing') {
        this.pending = null
        this.expectedPreviewId = pending.intent.previewId
        this.update({ retryOperation: null, job: null, pollAfterMs: batch.poll_after_ms ?? 2000, notice: 'Máy chủ đang xử lý lần nhập hiện tại. Chưa có completion.' })
      } else this.update({ notice: 'Vẫn chưa xác định kết quả. Yêu cầu gốc được giữ; chưa gửi lại.' })
      return
    }
    if (pending.operation === 'review') {
      await this.readPinnedPreview(id, epoch, signal, true)
      if (!this.current(epoch, id)) return
      const confirmation = this.state.preview?.review_confirmation
      if (this.state.preview?.confirmation_usable && confirmation?.preview_id === pending.intent.previewId &&
        confirmation.preview_digest === pending.intent.previewDigest && confirmation.mapping_revision === pending.intent.mappingRevision &&
        confirmation.reason === pending.intent.reason) {
        this.pending = null
        this.update({ retryOperation: null, notice: 'Đã xác nhận Review được lưu. Cần quyết định nhập dữ liệu riêng.' })
      } else this.update({ notice: 'Chưa xác nhận được kết quả lưu Review. Chưa gửi lại.' })
      return
    }
    await this.readMappings(id, epoch, signal)
    if (!this.current(epoch, id)) return
    // Queue may be paginated/filtered. Missing an issue is not proof of success.
    let issue = pending.operation === 'mapping' || pending.operation === 'resolution'
      ? this.state.queue?.items.find(item => item.mapping_id === pending.mappingId) : null
    if (!issue && (pending.operation === 'mapping' || pending.operation === 'resolution')) {
      // A resolved item may disappear from review_only/status-filtered reads.
      // Read the complete current sheet without changing the user's filter.
      const revision = this.state.summary?.mapping_revision
      const cursors = new Set<string>()
      let cursor: string | undefined
      do {
        const page = await this.source.queue(id, { sheet_id: this.state.selectedSheetId ?? undefined,
          review_only: false, include_details: true, ...(cursor ? { cursor } : {}) }, signal)
        if (!this.current(epoch, id)) return
        issue = page.items.find(item => item.mapping_id === pending.mappingId)
        cursor = page.pagination.next_cursor ?? undefined
        if (cursor && cursors.has(cursor)) throw new HttpError('protocol', 'Cursor kiểm tra kết quả bị lặp.')
        if (cursor) cursors.add(cursor)
      } while (!issue && cursor)
      const after = await this.source.summary(id, signal)
      if (!this.current(epoch, id)) return
      if (after.import_id !== id || after.mapping_revision !== revision) throw new HttpError('protocol', 'Cách hiểu thay đổi trong lúc kiểm tra kết quả lưu.')
    }
    const saved = issue && ['resolved', 'auto_mapped'].includes(issue.status) && (pending.operation === 'mapping'
      ? issue.target_field === pending.intent.targetField
      : pending.operation === 'resolution' && JSON.stringify(issue.resolution?.resolution) === JSON.stringify(pending.intent.resolution))
    if (saved) {
      this.pending = null
      this.update({ retryOperation: null, previewStale: !!this.state.preview, notice: 'Đã xác nhận cách hiểu được lưu từ trạng thái máy chủ.' })
    } else this.update({ notice: 'Vẫn chưa xác định kết quả lưu. Giữ nguyên giá trị đã nhập; chưa gửi lại.' })
  })

  pollJob = () => this.run('Đọc tiến trình', async (id, epoch, signal) => {
    const jobId = this.state.batch?.active_job_id ?? this.processReceipt?.job_id ?? this.state.job?.job_id
    if (!jobId) return
    const retained = this.state.job?.job_id === jobId && ['completed', 'failed'].includes(this.state.job.status) ? this.state.job : null
    if (retained?.status === 'failed') {
      this.update({ error: `${retained.error?.message ?? 'Tiến trình thất bại'} (${retained.error?.code ?? 'JOB_FAILED'})` })
      return
    }
    const job = retained ?? await this.source.job(jobId, signal)
    if (!this.current(epoch, id)) return
    if (job.context.import_id !== id || job.context.store_id !== this.state.batch?.store_id || job.job_id !== jobId) {
      throw new HttpError('protocol', 'Tiến trình không thuộc đúng lô và cửa hàng.')
    }
    this.update({ job, pollAfterMs: ['queued', 'running'].includes(job.status) ? job.poll_after_ms : null })
    if (job.status === 'failed') {
      this.update({ error: `${job.error?.message ?? 'Tiến trình thất bại'} (${job.error?.code ?? 'JOB_FAILED'})`, faultOperation: job.operation === 'import_commit' ? 'commit' : null, fault: importFault(new HttpError('contract', job.error?.message ?? 'Tiến trình thất bại', undefined, { code: job.error?.code ?? 'JOB_FAILED', message: job.error?.message ?? 'Tiến trình thất bại', details: {} })), commitAcknowledged: false })
      await this.readParent(id, epoch)
      return
    }
    if (job.status !== 'completed') return
    const batch = await this.readParent(id, epoch)
    if (!batch || !this.current(epoch, id)) return
    if (job.result?.resource_id !== id) throw new HttpError('protocol', 'Kết quả tiến trình không thuộc lô hiện tại.')
    if (job.operation === 'import_preview' && job.result.resource_type === 'import_preview' && job.result.preview_id) {
      this.expectedPreviewId = job.result.preview_id
      // Re-entry while a job is running starts without in-memory mapping. Load
      // current mapping authority before showing the retained completed preview.
      await this.readMappings(id, epoch, signal)
      if (!this.current(epoch, id)) return
      await this.readPinnedPreview(id, epoch, signal)
    } else if (job.operation === 'import_commit' && job.result.resource_type === 'import_completion') {
      if (!batch.completion_available || !['completed', 'completed_with_warnings'].includes(batch.status)) {
        throw new Error('Tiến trình báo xong nhưng lô chưa có biên nhận bền vững. Hãy đọc lại.')
      }
      const completion = await this.source.completion(id, signal)
      if (!this.current(epoch, id)) return
      if (completion.commit_id !== job.result.commit_id || (this.expectedPreviewId && completion.preview_id !== this.expectedPreviewId) ||
        (this.processReceipt?.commit_id && completion.commit_id !== this.processReceipt.commit_id) ||
        (this.processReceipt?.effective_plan_digest && completion.effective_plan_digest !== this.processReceipt.effective_plan_digest)) {
        throw new HttpError('protocol', 'Biên nhận hoàn tất không khớp tiến trình và bản xem trước đã xác nhận.')
      }
      this.update({ completion, tab: 'result', notice: 'Đã hoàn tất nhập dữ liệu.' })
    } else if (job.operation === 'import_analyze') {
      await this.readMappings(id, epoch, signal)
    } else throw new HttpError('protocol', 'Loại kết quả tiến trình không khớp thao tác.')
  })

  private async readPinnedPreview(id: string, epoch: number, signal: AbortSignal, preserveReview = false) {
    const expectedId = this.expectedPreviewId ?? this.state.preview?.preview.summary.preview_id
    const preview = await this.source.readPreview(id, expectedId ? { previewId: expectedId } : {}, signal)
    if (!this.current(epoch, id)) return
    if (preview.import_id !== id || preview.store_id !== this.state.batch?.store_id || (expectedId && preview.preview.summary.preview_id !== expectedId) ||
      preview.import_revision !== this.state.batch.import_revision) throw new HttpError('protocol', 'Bản xem trước không khớp lô hoặc phiên bản đã đọc.')
    this.expectedPreviewId = preview.preview.summary.preview_id
    if (preview.preview.mapping_revision !== this.state.summary?.mapping_revision) {
      this.update({ previewStale: true, commitAcknowledged: false, reviewAcknowledged: false })
      throw new HttpError('protocol', 'Preview không cùng phiên bản mapping hiện tại.')
    }
    if (!this.previewMappingRevision) this.previewMappingRevision = preview.preview.mapping_revision
    const old = this.state.preview
    if (preserveReview && old && old.preview.summary.preview_id === preview.preview.summary.preview_id && old.preview.summary.digest === preview.preview.summary.digest) {
      if (old.preview.mapping_revision !== preview.preview.mapping_revision || old.preview.read_set_digest !== preview.preview.read_set_digest || old.preview.source_evidence_digest !== preview.preview.source_evidence_digest) {
        this.update({ previewStale: true, reviewAcknowledged: false, commitAcknowledged: false })
        throw new HttpError('protocol', 'Preview pin thay đổi dù ID/digest không đổi; cần đọc lại toàn bộ.')
      }
      if (preview.preview.rows.some((row) => !old.preview.rows.some((previous) => previous.row_id === row.row_id && JSON.stringify(previous) === JSON.stringify(row)))) {
        this.update({ previewStale: true, reviewAcknowledged: false, commitAcknowledged: false })
        throw new HttpError('protocol', 'Nội dung trang đã đọc thay đổi dù preview digest không đổi; cần đọc lại toàn bộ.')
      }
      this.update({ preview: { ...preview, configurations: mergeConfigurations(old.configurations, preview.configurations), preview: { ...preview.preview, rows: old.preview.rows, rows_page: old.preview.rows_page } },
        previewStale: preview.preview.stale || preview.preview.summary.source_set_version !== this.state.batch.source_set.version || this.previewMappingRevision !== this.state.summary?.mapping_revision })
    } else this.update({ preview, previewStale: preview.preview.stale || preview.preview.summary.source_set_version !== this.state.batch.source_set.version,
      commitAcknowledged: false, reviewAcknowledged: false, commitReason: '', reviewReason: '', resolutions: [], supplierChanges: [], historyCorrections: [] })
  }

  loadMorePreview = () => this.run('Đọc trang xem trước', async (id, epoch, signal) => {
    const previous = this.state.preview
    if (!previous?.preview.rows_page.next_cursor || this.state.previewStale) return
    try {
      const next = await this.source.readPreview(id, { previewId: previous.preview.summary.preview_id, rowsCursor: previous.preview.rows_page.next_cursor }, signal)
      if (!this.current(epoch, id)) return
      if (next.import_id !== id || next.store_id !== previous.store_id || next.store_id !== this.state.batch?.store_id ||
        next.import_revision !== previous.import_revision || next.preview.summary.preview_id !== previous.preview.summary.preview_id ||
        next.preview.summary.digest !== previous.preview.summary.digest || next.preview.mapping_revision !== previous.preview.mapping_revision ||
        next.preview.read_set_digest !== previous.preview.read_set_digest || next.preview.source_evidence_digest !== previous.preview.source_evidence_digest ||
        JSON.stringify(next.preview.summary) !== JSON.stringify(previous.preview.summary) || next.preview.stale ||
        next.preview.rows_page.total_count !== previous.preview.rows_page.total_count ||
        next.preview.rows.some((row) => previous.preview.rows.some((old) => old.row_id === row.row_id))) {
        throw new HttpError('protocol', 'Trang xem trước không khớp ảnh bất biến hoặc có hàng bị lặp.')
      }
      this.update({ preview: { ...next, configurations: mergeConfigurations(previous.configurations, next.configurations), unsupportedFields: [...new Set([...previous.unsupportedFields, ...next.unsupportedFields])],
        preview: { ...next.preview, rows: [...previous.preview.rows, ...next.preview.rows] } }, commitAcknowledged: false, reviewAcknowledged: false })
    } catch (error) {
      if (this.current(epoch, id)) this.update({ previewStale: true, commitAcknowledged: false, reviewAcknowledged: false })
      throw error
    }
  })
}
