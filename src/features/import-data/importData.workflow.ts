import { HttpError } from '../../shared/http/httpClient'
import { validateImportFiles } from './importData.files'
import { isImportBusinessDate } from './importData.validation'
import type {
  AnalyzeIntent, DraftIntent, ImportAnalyzeResult, ImportBatch, ImportDataSource,
  ImportDraft, ImportFileReceipt, ImportFileView, UploadIntent,
} from './importData.types'

type Operation = 'draft' | 'upload' | 'analyze'
type Preparation = {
  importRevision: string
  fileSetVersion: string
  acceptedFileIds: string[]
  rejectedClientFileIds: string[]
  acknowledged: boolean
}

export type ImportBatchState = {
  files: File[]
  dataDate: string
  draft: ImportDraft | null
  batch: ImportBatch | null
  serverFiles: ImportFileView[]
  receipts: ImportFileReceipt[]
  nextCursor: string | null
  fresh: boolean
  busy: boolean
  retryOperation: Operation | null
  sealedLocked: boolean
  preparation: Preparation | null
  analysis: ImportAnalyzeResult | null
  error: string | null
  notice: string
}

function initialState(): ImportBatchState {
  return {
    files: [], dataDate: '', draft: null, batch: null, serverFiles: [], receipts: [],
    nextCursor: null, fresh: false, busy: false, retryOperation: null,
    sealedLocked: false, preparation: null, analysis: null, error: null, notice: '',
  }
}

function uncertain(error: unknown): boolean {
  return error instanceof HttpError && (
    error.kind === 'transport' || error.kind === 'protocol' || error.kind === 'http' || (error.status ?? 0) >= 500
  )
}

export function describeImportError(error: unknown): string {
  if (!(error instanceof HttpError)) return error instanceof Error ? error.message : 'Không thực hiện được yêu cầu.'
  const code = error.problem?.code
  const explanations: Record<number, string> = {
    401: 'Phiên đăng nhập không hợp lệ. Cần đăng nhập lại trước khi tiếp tục.',
    403: code === 'CSRF_CHECK_FAILED' ? 'Phiên xác thực chưa cung cấp CSRF hợp lệ.' : 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy lô hoặc bạn không có quyền truy cập cửa hàng này.',
    409: 'Trạng thái lô hoặc định danh yêu cầu đã xung đột. Hãy đọc lại lô trước khi tiếp tục.',
    412: 'Lô đã thay đổi. Hãy đọc lại và xác nhận tập file hiện tại.',
    413: 'Yêu cầu vượt giới hạn tài nguyên của máy chủ.',
    422: 'Máy chủ từ chối cấu hình yêu cầu; đây không phải biên nhận tải file.',
    428: 'Yêu cầu thiếu điều kiện phiên bản bắt buộc.',
    503: 'Máy chủ tạm không khả dụng; kết quả ghi có thể chưa xác định.',
  }
  return [explanations[error.status ?? 0], error.message, code ? `(${code})` : ''].filter(Boolean).join(' ')
}

function sameRead(a: ImportBatch, b: ImportBatch): boolean {
  return a.import_id === b.import_id && a.store_id === b.store_id && a.data_date === b.data_date &&
    a.import_revision === b.import_revision && a.status === b.status && a.active_job_id === b.active_job_id &&
    a.files_page.total_count === b.files_page.total_count &&
    a.file_set_version === b.file_set_version && a.source_set.version === b.source_set.version &&
    a.source_set.digest === b.source_set.digest && a.source_set.sealed === b.source_set.sealed &&
    a.file_count === b.file_count && a.quota.accepted_file_count === b.quota.accepted_file_count &&
    a.quota.accepted_total_bytes === b.quota.accepted_total_bytes &&
    a.source_set.accepted_file_ids.length === b.source_set.accepted_file_ids.length &&
    a.source_set.accepted_file_ids.every((id) => b.source_set.accepted_file_ids.includes(id))
}

// One active workspace owns this in-memory lifecycle. No persistence, automatic
// mutation retry, optimistic quota accounting, or cross-feature server state.
export class ImportBatchWorkflow {
  private state = initialState()
  private listeners = new Set<() => void>()
  private draftIntent: DraftIntent | null = null
  private uploadIntent: UploadIntent | null = null
  private analyzeIntent: AnalyzeIntent | null = null
  private source: ImportDataSource
  private storeId: string | null

  constructor(source: ImportDataSource, storeId: string | null) {
    this.source = source
    this.storeId = storeId
  }

  getSnapshot = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private update(patch: Partial<ImportBatchState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((listener) => listener())
  }

  setFiles = (files: File[]) => {
    if (this.state.busy || this.state.retryOperation || this.state.sealedLocked || this.state.batch?.source_set.sealed) return
    this.update({ files, preparation: null, error: null })
  }

  setDataDate = (dataDate: string) => {
    if (!this.state.draft && !this.state.busy && !this.state.retryOperation) this.update({ dataDate, error: null })
  }

  private async readCurrent() {
    if (!this.state.draft) return null
    const batch = await this.source.read(this.state.draft.import_id)
    if (batch.store_id !== this.state.draft.store_id || batch.data_date !== this.state.draft.data_date) {
      throw new HttpError('protocol', 'Trạng thái trả về không thuộc cửa hàng hoặc ngày của lô hiện tại.')
    }
    this.update({
      batch, serverFiles: batch.files, nextCursor: batch.files_page.next_cursor, fresh: true,
      sealedLocked: this.state.sealedLocked || batch.source_set.sealed, preparation: null,
    })
    return batch
  }

  refresh = async () => {
    if (this.state.busy || !this.state.draft) return
    this.update({ busy: true, fresh: false, error: null, preparation: null })
    try { await this.readCurrent() } catch (error) { this.update({ error: describeImportError(error) }) }
    finally { this.update({ busy: false }) }
  }

  loadMore = async () => {
    const { batch, nextCursor, serverFiles } = this.state
    if (this.state.busy || !batch || !nextCursor || !this.state.fresh) return
    this.update({ busy: true, error: null, preparation: null })
    try {
      const next = await this.source.read(batch.import_id, nextCursor)
      if (!sameRead(batch, next) || next.files.some((file) => serverFiles.some((old) => old.client_file_id === file.client_file_id))) {
        throw new Error('Lô đã thay đổi giữa các trang. Đã bỏ tập trang cũ; hãy đọc lại lô.')
      }
      this.update({ serverFiles: [...serverFiles, ...next.files], nextCursor: next.files_page.next_cursor })
    } catch (error) {
      this.update({ fresh: false, serverFiles: [], nextCursor: null, error: describeImportError(error) })
      try { await this.readCurrent() } catch { /* Keep the original actionable read error. */ }
    } finally { this.update({ busy: false }) }
  }

  upload = async () => {
    if (this.state.busy || this.state.retryOperation) return
    if (!this.storeId) { this.update({ error: 'Chưa có cửa hàng. Cần cấu hình Store hợp lệ trước khi tạo lô.' }); return }
    const localError = validateImportFiles(this.state.files)
    if (localError || !this.state.files.length) { this.update({ error: localError ?? 'Hãy chọn file trước khi tải lên.' }); return }
    if (!isImportBusinessDate(this.state.dataDate)) { this.update({ error: 'Hãy chọn ngày dữ liệu hợp lệ trước khi tải lên.' }); return }
    if (this.state.sealedLocked || this.state.batch?.source_set.sealed) return
    this.update({ busy: true, error: null, preparation: null })
    let operation: Operation = 'draft'
    try {
      if (!this.state.draft) {
        this.draftIntent ??= { key: crypto.randomUUID(), dataDate: this.state.dataDate }
        const draft = await this.source.createDraft(this.storeId, this.draftIntent)
        this.draftIntent = null
        this.update({ draft, dataDate: draft.data_date, notice: 'Đã tạo lô. Đang đọc trạng thái trước khi tải file.' })
      }
      // Always establish an authoritative state before a fresh upload call.
      operation = 'upload'
      const batch = await this.readCurrent()
      if (!batch || batch.source_set.sealed || !batch.allowed_actions.includes('upload')) {
        throw new Error('Máy chủ hiện không cho phép tải thêm file vào lô này.')
      }
      this.uploadIntent = { key: crypto.randomUUID(), items: this.state.files.map((file) => ({ file, clientFileId: crypto.randomUUID() })) }
      await this.sendUpload()
    } catch (error) { await this.mutationFailed(error, operation) }
    finally { this.update({ busy: false }) }
  }

  private async sendUpload() {
    if (!this.uploadIntent || !this.state.draft) return
    this.update({ fresh: false, notice: 'Đang tải file; vui lòng giữ trang mở.' })
    const result = await this.source.upload(this.state.draft.import_id, this.uploadIntent)
    const receipts = new Map(this.state.receipts.map((item) => [item.client_file_id, item]))
    result.items.forEach((item) => receipts.set(item.client_file_id, item))
    const accepted = result.items.filter((item) => item.upload_status === 'uploaded').length
    const summary = `Kết quả lần tải: ${accepted} file đã nhận, ${result.items.length - accepted} file bị từ chối.`
    this.uploadIntent = null
    this.update({
      files: [], receipts: [...receipts.values()], retryOperation: null, fresh: false,
      notice: `${summary} Đang đọc lại hạn mức lô.`,
    })
    // A successful mutation followed by a failed read must never resend files.
    try {
      await this.readCurrent()
      this.update({ notice: `${summary} Đã cập nhật hạn mức lô.` })
    } catch (error) {
      this.update({ notice: summary, error: `Đã nhận biên nhận, nhưng chưa đọc được hạn mức hiện tại. ${describeImportError(error)}` })
    }
  }

  private async mutationFailed(error: unknown, operation: Operation) {
    const retained = operation === 'draft' ? this.draftIntent : operation === 'upload' ? this.uploadIntent : this.analyzeIntent
    const keepIntent = uncertain(error) && retained !== null
    if (!keepIntent) {
      if (operation === 'draft') this.draftIntent = null
      if (operation === 'upload') this.uploadIntent = null
      if (operation === 'analyze') this.analyzeIntent = null
    }
    this.update({
      fresh: false, retryOperation: keepIntent ? operation : null, preparation: null,
      error: `${describeImportError(error)}${keepIntent ? ' Kết quả chưa xác định. Thử lại sẽ dùng nguyên định danh và nội dung yêu cầu.' : ''}`,
      notice: '',
    })
    if (this.state.draft) {
      try { await this.readCurrent() } catch { /* Do not conceal the mutation outcome with a read failure. */ }
    }
  }

  retry = async () => {
    const operation = this.state.retryOperation
    if (!operation || this.state.busy) return
    this.update({ busy: true, error: null })
    try {
      if (operation === 'draft' && this.draftIntent && this.storeId) {
        const draft = await this.source.createDraft(this.storeId, this.draftIntent)
        this.draftIntent = null
        this.update({ draft, dataDate: draft.data_date, retryOperation: null, notice: 'Đã xác định lô. Đọc lại trạng thái trước khi tải file.' })
        await this.readCurrent()
        this.update({ notice: 'Đã xác định lô và đọc lại trạng thái. Bạn có thể tiếp tục tải file.' })
        // Require the ordinary upload action after reconciling draft identity.
      } else if (operation === 'upload') await this.sendUpload()
      else if (operation === 'analyze') await this.sendAnalysis()
    } catch (error) { await this.mutationFailed(error, operation) }
    finally { this.update({ busy: false }) }
  }

  prepareAnalysis = async () => {
    if (this.state.busy || this.state.retryOperation || !this.state.draft || this.state.files.length) return
    this.update({ busy: true, fresh: false, error: null, preparation: null })
    try {
      const first = await this.readCurrent()
      if (!first || !first.allowed_actions.includes('analyze') || !first.source_set.accepted_file_ids.length) {
        throw new Error('Máy chủ hiện không cho phép bắt đầu phân tích lô này.')
      }
      const files = [...first.files]
      const cursors = new Set<string>()
      let cursor = first.files_page.next_cursor
      while (cursor) {
        if (cursors.has(cursor)) throw new Error('Máy chủ trả về cursor lặp. Hãy đọc lại lô.')
        cursors.add(cursor)
        const page = await this.source.read(first.import_id, cursor)
        if (!sameRead(first, page)) throw new Error('Lô đã thay đổi trong khi đọc file. Hãy xác nhận lại từ trạng thái mới.')
        if (page.files.some((file) => files.some((old) => old.client_file_id === file.client_file_id))) {
          throw new Error('Các trang file trùng định danh. Hãy đọc lại lô.')
        }
        files.push(...page.files)
        cursor = page.files_page.next_cursor
      }
      const acceptedIds = files.filter((file) => file.upload_status === 'uploaded').map((file) => file.file_id)
      if ((first.files_page.total_count !== null && files.length !== first.files_page.total_count) ||
        acceptedIds.length !== first.source_set.accepted_file_ids.length || new Set(acceptedIds).size !== acceptedIds.length ||
        first.source_set.accepted_file_ids.some((id) => !acceptedIds.includes(id))) {
        throw new Error('Chưa đọc đủ biên nhận của lô. Hãy đọc lại trước khi phân tích.')
      }
      this.update({
        serverFiles: files, nextCursor: null, fresh: true,
        preparation: {
          importRevision: first.import_revision, fileSetVersion: first.file_set_version,
          acceptedFileIds: [...first.source_set.accepted_file_ids],
          rejectedClientFileIds: files.filter((file) => file.upload_status === 'rejected').map((file) => file.client_file_id),
          acknowledged: false,
        },
      })
    } catch (error) {
      this.update({ fresh: false, error: describeImportError(error), preparation: null })
      try { await this.readCurrent() } catch { /* The original consistency error remains visible. */ }
    } finally { this.update({ busy: false }) }
  }

  acknowledgeRejected = (acknowledged: boolean) => {
    if (this.state.preparation && !this.state.busy) this.update({ preparation: { ...this.state.preparation, acknowledged } })
  }

  analyze = async () => {
    const preparation = this.state.preparation
    if (this.state.busy || this.state.retryOperation || !this.state.fresh || !preparation?.acknowledged || !this.state.draft) return
    this.analyzeIntent = {
      key: crypto.randomUUID(), importRevision: preparation.importRevision, fileSetVersion: preparation.fileSetVersion,
      acceptedFileIds: preparation.acceptedFileIds, rejectedClientFileIds: preparation.rejectedClientFileIds,
    }
    this.update({ busy: true, error: null, preparation: null })
    try { await this.sendAnalysis() } catch (error) { await this.mutationFailed(error, 'analyze') }
    finally { this.update({ busy: false }) }
  }

  private async sendAnalysis() {
    if (!this.analyzeIntent || !this.state.draft) return
    this.update({ fresh: false })
    const analysis = await this.source.analyze(this.state.draft.import_id, this.analyzeIntent)
    this.analyzeIntent = null
    this.update({ analysis, sealedLocked: true, retryOperation: null, notice: 'Đã khóa tập file và bắt đầu phân tích. Chưa ghi dữ liệu nghiệp vụ.' })
    try { await this.readCurrent() } catch (error) {
      this.update({ error: `Đã khóa tập file, nhưng chưa đọc được trạng thái phân tích. ${describeImportError(error)}` })
    }
  }

  startNewDraft = () => {
    if (this.state.busy || this.state.retryOperation) return
    const { files, dataDate } = this.state
    this.draftIntent = null
    this.uploadIntent = null
    this.analyzeIntent = null
    this.state = { ...initialState(), files, dataDate, notice: 'Đã mở lựa chọn cho lô mới. Lô trước vẫn được giữ trên máy chủ.' }
    this.listeners.forEach((listener) => listener())
  }
}
