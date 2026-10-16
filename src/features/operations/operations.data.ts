import { HttpError, requestJson, requestPdf } from '../../shared/http/httpClient'
import { comparePlanningDecimal, isPlanningDate, isPlanningUuid, validatePlanningRequest } from '../decision-planning/planning.validation'
import { validateWorkspaceKey, workspaceIfMatch } from '../store-workspace/storeWorkspace.validation'
import { matchesOperationsWire } from './operations.wire'
import type * as W from './operations.wire'

export type Intent<T> = { key: string; request: T; version?: string }
export type RecipePreviewRequest = W.Wireapp__application__contracts__recipe_schedule__PreviewRequest
export type RecipeCommitRequest = W.Wireapp__application__contracts__recipe_schedule__CommitRequest
export type HistoryQuery = { cursor?: string; created_by_user_id?: string; created_date_from?: string; created_date_to?: string; status?: 'queued' | 'running' | 'completed' | 'failed'; forecast_start_from?: string; forecast_start_to?: string }
export function protocol(message = 'Phản hồi không khớp tài nguyên hoặc phiên bản đã yêu cầu.'): never { throw new HttpError('protocol', message) }
export function checked<T>(schema: string, value: unknown): T {
  if (!matchesOperationsWire(schema, value) || (typeof value === 'object' && value !== null && 'meta' in value && !(value as {meta:{request_id:string}}).meta.request_id.trim())) return protocol(`Phản hồi không đúng contract ${schema}. Chưa xác nhận kết quả.`)
  return value as T
}
const uuid = (id: string) => { if (!isPlanningUuid(id)) throw new Error('Cần UUID canonical.'); return id }
function token(value: string): string {
  if (!value || new TextEncoder().encode(value).length > 512 || /[\r\n]/.test(value)) throw new Error('Token không hợp lệ.')
  return value
}
function request<T>(schema: string, value: T): T {
  if (!matchesOperationsWire(schema, value)) throw new Error('Dữ liệu nhập không đúng contract hiện hành.')
  return structuredClone(value)
}
function page(value: { data: { items: unknown[] }; meta: { pagination?: W.WirePagination | null } }) {
  const p = value.meta.pagination
  if (!p || !Number.isSafeInteger(p.limit) || (p.total_count !== null && !Number.isSafeInteger(p.total_count)) || p.limit < 1 || p.limit > 100 || value.data.items.length > p.limit || (p.next_cursor !== null && (!p.next_cursor.trim() || p.next_cursor.length > 4096)) || (p.total_count !== null && p.total_count < value.data.items.length)) protocol('Phân trang trả về không hợp lệ.')
}
function cursorParams(cursor?: string) {
  const p = new URLSearchParams({ limit: '50' })
  if (cursor !== undefined) { if (!cursor.trim() || cursor.length > 4096) throw new Error('Cursor không hợp lệ.'); p.set('cursor', cursor) }
  return p
}


export function validateRecipePreview(body: RecipePreviewRequest): void {
  request('app__application__contracts__recipe_schedule__PreviewRequest', body)
  const refs = body.new_recipes.map(r=>r.client_reference)
  if(!body.reason.trim() || new Set(refs).size !== refs.length || !body.operations.length) throw new Error('Cần lý do, operation và reference duy nhất.')
  for(const recipe of body.new_recipes) {
    if(!/[1-9]/.test(recipe.yield_quantity) || comparePlanningDecimal(recipe.process_loss_rate,'1') >= 0 || recipe.ingredients.some(l=>!/[1-9]/.test(l.quantity)) || new Set(recipe.ingredients.map(l=>l.ingredient_id)).size !== recipe.ingredients.length) throw new Error('Yield/lượng phải dương, nguyên liệu duy nhất và hao hụt nhỏ hơn 1.')
  }
}

/** Current V2 operations only; injection keeps mock explicit and transport failures visible. */
export function createOperationsApi(baseUrl: string) {
  const store = (id: string) => `/api/v1/stores/${uuid(id)}`
  const plan = (id: string) => `/api/v1/procurement-plans/${uuid(id)}`
  const recipe = (s: string, p: string) => `${store(s)}/products/${uuid(p)}/recipe-schedule`
  const get = async <T>(schema: string, path: string, signal?: AbortSignal, headers?: HeadersInit) => checked<T>(schema, await requestJson(baseUrl, path, { signal, headers, referrerPolicy: 'no-referrer' }))
  const write = async <T>(schema: string, path: string, method: string, intent: Intent<unknown>, signal?: AbortSignal) => {
    const headers: Record<string, string> = { 'Idempotency-Key': validateWorkspaceKey(intent.key) }
    if (intent.version !== undefined) headers['If-Match'] = workspaceIfMatch(intent.version)
    return checked<T>(schema, await requestJson(baseUrl, path, { method, body: structuredClone(intent.request), headers, signal, referrerPolicy: 'no-referrer' }))
  }
  return {
    async completeCredentials(body: W.WireCredentialCompletion, signal?: AbortSignal) {
      token(body.token); request('CredentialCompletion', body)
      return checked<W.WireEnvelope_CompletedCredential_>('Envelope_CompletedCredential_', await requestJson(baseUrl, '/api/v1/auth/credentials/complete', { method: 'POST', auth: 'public', body, signal, referrerPolicy: 'no-referrer' }))
    },
    async offer(id: string, proof: string, signal?: AbortSignal) {
      const r = await get<W.WireEnvelope_OfferRead_>('Envelope_OfferRead_', `/api/v1/staff-invitations/${uuid(id)}`, signal, { 'X-Invitation-Token': token(proof) })
      if (r.data.invitation.invitation_id !== id || (r.data.can_accept && r.data.invitation.status !== 'pending')) protocol()
      return r
    },
    async accept(id: string, intent: Intent<W.WireAcceptInvitation>, signal?: AbortSignal) {
      token(intent.request.token); request('AcceptInvitation', intent.request)
      if (intent.request.accept !== true || !intent.version) throw new Error('Chỉ hỗ trợ chấp nhận offer đã đọc và xác nhận.')
      const r = await write<W.WireEnvelope_AcceptanceReceipt_>('Envelope_AcceptanceReceipt_', `/api/v1/staff-invitations/${uuid(id)}/accept`, 'POST', intent, signal)
      if (r.data.invitation_id !== id) protocol()
      return r
    },
    async permissionEvents(s: string, cursor?: string, signal?: AbortSignal) {
      const r = await get<W.WireEnvelope_PermissionEvents_>('Envelope_PermissionEvents_', `${store(s)}/permission-events?${cursorParams(cursor)}`, signal)
      page(r); if (r.data.items.some(i => i.store_id !== s)) protocol(); return r
    },
    async invitationEvents(s: string, invitationId: string, cursor?: string, signal?: AbortSignal) {
      const p = cursorParams(cursor); p.set('view', 'events'); p.set('invitation_id',uuid(invitationId))
      const r = await get<W.WireEnvelope_InvitationEvents_>('Envelope_InvitationEvents_', `${store(s)}/staff-invitations?${p}`, signal)
      page(r); if (r.data.items.some(i => i.store_id !== s || i.invitation_id !== invitationId)) protocol(); return r
    },
    async history(s: string, query: HistoryQuery = {}, signal?: AbortSignal) {
      const p = cursorParams(query.cursor); p.set('sort', '-accepted_at')
      if (query.status) { if (!['queued','running','completed','failed'].includes(query.status)) throw new Error('Trạng thái không hợp lệ.'); p.set('status',query.status) }
      for (const k of ['forecast_start_from','forecast_start_to','created_date_from','created_date_to'] as const) if(query[k] !== undefined) { if (!isPlanningDate(query[k])) throw new Error('Ngày không hợp lệ.'); p.set(k,query[k]) }
      if(query.forecast_start_from && query.forecast_start_to && query.forecast_start_from > query.forecast_start_to) throw new Error('Khoảng ngày không hợp lệ.')
      if(query.created_by_user_id) p.set('created_by_user_id',uuid(query.created_by_user_id))
      if(query.created_date_from && query.created_date_to && query.created_date_from > query.created_date_to) throw new Error('Khoảng ngày tạo không hợp lệ.')
      const r = await get<W.WireRunHistoryEnvelope>('RunHistoryEnvelope', `${store(s)}/procurement-plans?${p}`, signal)
      page(r); if (r.data.items.some(i=>i.store_id !== s)) protocol();
      for(const k of ['created_by_user_id','created_date_from','created_date_to'] as const) if(r.meta.applied_filters[k] !== (query[k]??null)) protocol('Bộ lọc lịch sử không khớp phản hồi máy chủ.'); return r
    },
    async exportPlan(run: string, intent: Intent<W.WireExportRequest>, signal?: AbortSignal) {
      uuid(intent.key); request('ExportRequest', intent.request)
      const r = await write<W.WireExportEnvelope>('ExportEnvelope', `${plan(run)}/exports`, 'POST', intent, signal)
      if(r.data.run_id !== run || (intent.request.option_id !== null && r.data.option_id !== intent.request.option_id)) protocol(); return r
    },
    async exportJob(s: string, run: string, exp: string, job: string, signal?: AbortSignal) {
      const r = await get<W.WireImportEnvelope_JobView_>('ImportEnvelope_JobView_', `/api/v1/jobs/${uuid(job)}`, signal)
      const c = r.data.context
      if(r.data.job_id !== job || r.data.operation !== 'planning_pdf_export' || !('run_id' in c) || c.store_id !== s || c.run_id !== run || c.export_id !== exp) protocol()
      if(r.data.status === 'completed') {
        const result = r.data.result
        if(!result || !('download_url' in result) || result.run_id !== run || result.resource_id !== exp || result.download_url !== `${plan(run)}/exports/${uuid(exp)}`) protocol()
      }
      return r
    },
    async download(run: string, exp: string, evidence?: W.WireExportJobResult, signal?: AbortSignal) {
      const blob = await requestPdf(baseUrl, `${plan(run)}/exports/${uuid(exp)}`, { signal, referrerPolicy: 'no-referrer' })
      if(evidence) {
        if(evidence.run_id !== run || evidence.resource_id !== exp || blob.size !== evidence.byte_count) protocol('PDF không khớp biên nhận export.')
        const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())), x=>x.toString(16).padStart(2,'0')).join('')
        if(digest !== evidence.sha256) protocol('Checksum PDF không khớp biên nhận export.')
      }
      return blob
    },
    async saved(s: string, id: string, signal?: AbortSignal) {
      const r = await get<W.WireEnvelope_SavedDetail_>('Envelope_SavedDetail_', `${store(s)}/planning-requirements/${uuid(id)}`, signal)
      if(r.data.store_id !== s || r.data.saved_requirement_id !== id) protocol(); return r
    },
    async saveRequirements(s: string, intent: Intent<W.WireSaveRequest | W.WireReplaceRequest | W.WireArchiveRequest>, id?: string, signal?: AbortSignal) {
      const body = intent.request
      request('state' in body ? body.state === 'archived' ? 'ArchiveRequest' : 'ReplaceRequest' : 'SaveRequest', body)
      if('requirements' in body) validatePlanningRequest({ forecast_start_date: '2026-10-12', requirements_mode: 'custom', requirements: body.requirements, ...(body.default_requirements_version ? { default_requirements_version: body.default_requirements_version } : {}) })
      if(Boolean(id) !== ('state' in body) || (id && !intent.version)) throw new Error('Thay bộ đã lưu cần ID và phiên bản đã đọc.')
      const r = await write<W.WireEnvelope_SavedDetail_>('Envelope_SavedDetail_', `${store(s)}/planning-requirements${id ? `/${uuid(id)}` : ''}`, id ? 'PUT':'POST', intent, signal)
      if(r.data.store_id !== s || (id && r.data.saved_requirement_id !== id)) protocol(); return r
    },
    async receive(s: string, intent: Intent<W.WireStockReceiptRequest>, signal?: AbortSignal) {
      request('StockReceiptRequest', intent.request)
      if(!/[1-9]/.test(intent.request.quantity)) throw new Error('Số lượng nhận phải lớn hơn 0.')
      const r = await write<W.WireEnvelope_StockReceiptResult_>('Envelope_StockReceiptResult_', `${store(s)}/inventory/receipts`, 'POST', intent, signal)
      if(comparePlanningDecimal(r.data.lot.quantity, intent.request.quantity) !== 0 || comparePlanningDecimal(r.data.movement.quantity_delta, intent.request.quantity) !== 0 || r.data.origin !== intent.request.origin || r.data.lot.unit !== intent.request.unit || r.data.movement.lot_id !== r.data.lot.lot_id) protocol(); return r
    },
    async threshold(s: string, id: string, intent: Intent<W.WireThresholdRequest>, signal?: AbortSignal) {
      request('ThresholdRequest', intent.request); if(!intent.version) throw new Error('Cần phiên bản ngưỡng từ chi tiết kho.')
      const r = await write<W.WireEnvelope_ThresholdResult_>('Envelope_ThresholdResult_', `${store(s)}/inventory/${uuid(id)}/threshold`, 'PUT', intent, signal)
      if(r.data.ingredient_id !== id || r.data.unit !== intent.request.unit || (r.data.minimum_usable_quantity === null) !== (intent.request.minimum_usable_quantity === null) || (r.data.minimum_usable_quantity !== null && intent.request.minimum_usable_quantity !== null && comparePlanningDecimal(r.data.minimum_usable_quantity,intent.request.minimum_usable_quantity) !== 0)) protocol(); return r
    },
    async timeline(s: string, p: string, cursor?: string, signal?: AbortSignal) {
      const q = cursorParams(cursor); q.set('status','past,in_effect,scheduled,unassigned')
      const r = await get<W.WireEnvelope_Timeline_>('Envelope_Timeline_', `${recipe(s,p)}?${q}`, signal)
      page(r); if(r.data.store_id !== s || r.data.product_id !== p) protocol(); return r
    },
    async change(s: string, p: string, id: string, signal?: AbortSignal) {
      const r = await get<W.WireEnvelope_ChangeRead_>('Envelope_ChangeRead_', `${recipe(s,p)}/changes/${uuid(id)}`, signal)
      if(r.data.change_id !== id || r.data.preview.change_id !== id || r.data.preview.store_id !== s || r.data.preview.product_id !== p || (r.data.status === 'committed') !== (r.data.receipt !== null) || (r.data.receipt && (r.data.receipt.change_id !== id || r.data.receipt.store_id !== s || r.data.receipt.product_id !== p || r.data.receipt.preview_digest !== r.data.preview.preview_digest))) protocol(); return r
    },
    async changeRecipe(s: string, p: string, intent: Intent<RecipePreviewRequest | RecipeCommitRequest>, signal?: AbortSignal) {
      if(intent.request.phase === 'preview') validateRecipePreview(intent.request)
      uuid(intent.key); if(!intent.version) throw new Error('Cần phiên bản lịch công thức.')
      request(intent.request.phase === 'preview' ? 'app__application__contracts__recipe_schedule__PreviewRequest' : 'app__application__contracts__recipe_schedule__CommitRequest', intent.request)
      const r = await write<W.WireEnvelope_Union_Preview__Receipt__>('Envelope_Union_Preview__Receipt__', `${recipe(s,p)}/changes`, 'POST', intent, signal)
      if(r.data.store_id !== s || r.data.product_id !== p || (intent.request.phase === 'preview' ? !('can_commit' in r.data) : !('committed_at' in r.data) || r.data.change_id !== intent.request.change_id || r.data.preview_digest !== intent.request.preview_digest)) protocol()
      return r
    },
  }
}
export type OperationsSource = ReturnType<typeof createOperationsApi>
