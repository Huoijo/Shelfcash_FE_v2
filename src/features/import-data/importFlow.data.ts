import { HttpError, requestJson } from '../../shared/http/httpClient'
import { isImportUuid, isImportVersion } from './importData.validation'
import type { CommitIntent, ImportFlowDataSource, ImportFlowDataSourceOptions, MappingResolution, MappingStatus, SalesResolution } from './importFlow.types'
import { matchesImportWire } from './importFlow.wire'
import {
  validateImportCompletion, validateImportJob, validateMappingConfirmation, validateMappingOptions,
  validateMappingQueue, validateMappingSummary, validatePreviewBundle, validateProcessReceipt,
  validateProfileDecision, validateReviewConfirmation,
} from './importFlow.validation'

const statuses: readonly MappingStatus[] = ['auto_mapped', 'resolved', 'needs_confirmation', 'ambiguous', 'unmatched']
const classifications = ['NEW', 'UNCHANGED', 'CHANGED', 'INVALID', 'CONFLICT']
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

function requireId(value: string, label: string): void {
  if (!isImportUuid(value)) throw new Error(`${label} phải là UUID canonical của máy chủ.`)
}

function requireKey(value: string): void {
  requireId(value, 'Idempotency-Key')
}

function requireRevision(value: string): void {
  if (!isImportVersion(value)) throw new Error('Thao tác cần phiên bản opaque hiện tại của máy chủ.')
}

function quotedRevision(value: string): string {
  requireRevision(value)
  // Retain opaque values on reads. A value that cannot be represented as one
  // unambiguous quoted header is a contract blocker, never silently rewritten.
  if ([...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 || character.charCodeAt(0) > 255 || character === '"')) {
    throw new Error('Phiên bản không thể biểu diễn an toàn trong If-Match; cần xác nhận contract header.')
  }
  return `"${value}"`
}

function cursor(value: string | undefined): void {
  if (value !== undefined && (!nonempty(value) || value.length > 4096)) throw new Error('Con trỏ phân trang phải không rỗng và tối đa 4096 ký tự.')
}

function salesResolution(value: SalesResolution): void {
  requireId(value.row_id, 'Dòng preview')
  if (!['replace_daily_total', 'confirm_disjoint_merge'].includes(value.action) ||
    !nonempty(value.report_business_key) || !nonempty(value.evidence_reference) || !nonempty(value.reason) ||
    !(value.disjoint_assertion === null || typeof value.disjoint_assertion === 'boolean') ||
    (value.action === 'replace_daily_total' && value.disjoint_assertion === true) ||
    (value.action === 'confirm_disjoint_merge' && value.disjoint_assertion !== true)) {
    throw new Error('Xác nhận sales phải dùng action, chứng cứ và assertion đúng contract; không hỗ trợ quantity override.')
  }
}

function validateCommit(importId: string, intent: CommitIntent): void {
  requireId(importId, 'Lô nhập')
  requireKey(intent.key)
  requireId(intent.previewId, 'Preview')
  quotedRevision(intent.importRevision)
  if (!nonempty(intent.previewDigest) || !(intent.reason === null || (typeof intent.reason === 'string' && intent.reason.length <= 1000)) ||
    !Array.isArray(intent.resolutions) || new Set(intent.resolutions.map((item) => item.row_id)).size !== intent.resolutions.length) {
    throw new Error('Commit cần preview ID/digest bất biến và danh sách xác nhận tường minh.')
  }
  intent.resolutions.forEach(salesResolution)
  const supplierChanges = intent.supplierChanges ?? []
  if (!Array.isArray(supplierChanges) || new Set(supplierChanges.map((item) => item.action_id)).size !== supplierChanges.length ||
    supplierChanges.some((item) => !isImportUuid(item.action_id) || !nonempty(item.reason) || item.reason.length > 1000)) throw new Error('Xác nhận nhà cung cấp phải dùng đúng row_id và lý do của từng action.')
}

function requireResolution(resolution: MappingResolution): void {
  if (!matchesImportWire('ResolveRequest-Input', { resolution })) throw new Error('Resolution không đúng schema hiện hành của máy chủ.')
  if ('evidence_reference' in resolution && !nonempty(resolution.evidence_reference)) throw new Error('Cần chứng cứ không rỗng cho resolution.')
  if (resolution.kind === 'sheet_type' && (!nonempty(resolution.reason) || (resolution.sheet_type === null) !== (resolution.ignored === true) || (resolution.ignored === true && resolution.acknowledgment !== true))) throw new Error('IGNORE cần sheet_type=null, acknowledgment=true và lý do tường minh.')
  if (resolution.kind === 'shared_value' && resolution.replace_source_column_index !== undefined && resolution.replace_source_column_index !== null && resolution.acknowledgment !== true) throw new Error('Thay nguồn cột cần acknowledgment=true.')
  if (resolution.kind === 'declared_conversion' && [resolution.factor.numerator, resolution.factor.denominator].some((value) => /^0(?:\.0+)?$/.test(value))) throw new Error('Hệ số chuyển đổi cần tử và mẫu dương, dạng decimal chính xác.')
  if (resolution.kind === 'new_entity_proposal') {
    const schema = { product: 'ProductMetadata-Input', ingredient: 'IngredientMetadata', supplier: 'SupplierMetadata' }[resolution.entity]
    if (!nonempty(resolution.source_business_key) || !matchesImportWire(schema, resolution.metadata)) throw new Error('Metadata phải khớp entity được đề xuất.')
  }
}

function bodyLimit(body: unknown): void {
  if (new TextEncoder().encode(JSON.stringify(body)).byteLength > 65536) throw new Error('JSON request vượt giới hạn 65.536 byte của Import API.')
}

/** API never substitutes fixtures. Mock is an explicitly injected import-local source. */
export function createImportFlowDataSource(options: ImportFlowDataSourceOptions): ImportFlowDataSource {
  if (options.dataSource === 'mock') {
    if (!options.mockSource) throw new Error('Nguồn mock Import Flow phải được truyền tường minh; không có fallback hoặc persistence ngầm.')
    return options.mockSource
  }
  if (options.dataSource !== 'api') throw new Error('Nguồn Import Flow phải là api hoặc mock.')
  const read = (path: string, signal?: AbortSignal) => requestJson<unknown>(options.apiBaseUrl, path, { signal })
  const path = (importId: string) => { requireId(importId, 'Lô nhập'); return `/api/v1/imports/${importId}` }

  return {
    async summary(importId, signal) {
      return validateMappingSummary(await read(`${path(importId)}/mapping-summary?include_clean_sheets=true&include_profile_details=true`, signal), importId)
    },
    async queue(importId, query, signal) {
      const endpoint = `${path(importId)}/mappings`
      const params = new URLSearchParams()
      if (query.sheet_id !== undefined) { requireId(query.sheet_id, 'Sheet'); params.set('sheet_id', query.sheet_id) }
      for (const key of ['review_only', 'include_details'] as const) {
        if (query[key] !== undefined) {
          if (typeof query[key] !== 'boolean') throw new Error(`${key} phải là boolean.`)
          params.set(key, String(query[key]))
        }
      }
      if (query.status !== undefined) {
        if (!statuses.includes(query.status)) throw new Error('Bộ lọc mapping không thuộc allowlist.')
        params.set('status', query.status)
      }
      cursor(query.cursor)
      if (query.limit !== undefined) {
        if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100) throw new Error('Giới hạn mapping phải từ 1 đến 100.')
        params.set('limit', String(query.limit))
      }
      if (query.cursor !== undefined) params.set('cursor', query.cursor)
      const result = validateMappingQueue(await read(`${endpoint}${params.size ? `?${params}` : ''}`, signal))
      if (query.sheet_id !== undefined && result.items.some((item) => item.sheet_id !== query.sheet_id)) throw new Error('Phản hồi mapping không thuộc Sheet đã yêu cầu.')
      return result
    },
    async options(importId, sheetId, mappingId, signal) {
      const endpoint = path(importId)
      requireId(sheetId, 'Sheet')
      if (mappingId !== undefined) requireId(mappingId, 'Mapping')
      const result = validateMappingOptions(await read(`${endpoint}/sheets/${sheetId}/field-options${mappingId ? `?mapping_id=${mappingId}` : ''}`, signal))
      if (result.schema_context_id !== sheetId) throw new Error('Phản hồi field-options không thuộc Sheet đã yêu cầu.')
      return result
    },
    async confirm(importId, mappingId, intent, signal) {
      const endpoint = path(importId)
      requireId(mappingId, 'Mapping')
      requireKey(intent.key)
      if (!matchesImportWire('TargetRequest', { target_field: intent.targetField }) || !nonempty(intent.targetField)) throw new Error('Cần target field tường minh từ descriptor máy chủ.')
      const response = await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/mappings/${mappingId}`, {
        method: 'PATCH', signal,
        headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.mappingRevision) },
        body: { target_field: intent.targetField },
      })
      return validateMappingConfirmation(response, mappingId, intent.targetField)
    },
    async resolve(importId, mappingId, intent, signal) {
      const endpoint = path(importId)
      requireId(mappingId, 'Mapping')
      requireKey(intent.key)
      requireResolution(intent.resolution)
      const body = { resolution: intent.resolution }
      bodyLimit(body)
      return validateMappingConfirmation(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/mappings/${mappingId}`, {
        method: 'PATCH', signal, headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.mappingRevision) }, body,
      }), mappingId)
    },
    async decideProfile(storeId, profileId, intent, signal) {
      requireId(storeId, 'Cửa hàng')
      requireId(profileId, 'Mapping profile')
      requireKey(intent.key)
      const schema = { approve_activate: 'Approve', reject: 'Reject', retire: 'Retire' }[intent.decision.decision]
      if (!schema || !matchesImportWire(schema, intent.decision) || !nonempty(intent.decision.reason)) throw new Error('Quyết định Owner không đúng schema/CAS hoặc thiếu lý do.')
      bodyLimit(intent.decision)
      return validateProfileDecision(await requestJson<unknown>(options.apiBaseUrl, `/api/v1/stores/${storeId}/mapping-profiles/${profileId}/decisions`, {
        method: 'POST', signal, headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.lifecycleRevision) }, body: intent.decision,
      }), profileId)
    },
    async preview(importId, intent) {
      const endpoint = path(importId)
      requireKey(intent.key)
      requireRevision(intent.mappingRevision)
      const response = await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/process`, {
        method: 'POST', headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.importRevision) },
        body: { phase: 'preview', mapping_revision: intent.mappingRevision },
      })
      return validateProcessReceipt(response, importId, 'preview')
    },
    async readPreview(importId, query, signal) {
      const endpoint = path(importId)
      if (query.previewId !== undefined) requireId(query.previewId, 'Preview')
      cursor(query.rowsCursor)
      const params = new URLSearchParams({ include: 'configurations,preview' })
      if (query.previewId !== undefined) params.set('preview_id', query.previewId)
      if (query.rowsCursor !== undefined) params.set('rows_cursor', query.rowsCursor)
      if (query.classification !== undefined) {
        if (!classifications.includes(query.classification)) throw new Error('Phân loại preview không thuộc allowlist.')
        params.set('classification', query.classification)
      }
      return validatePreviewBundle(await read(`${endpoint}?${params}`, signal), importId, query.previewId)
    },
    async confirmReview(importId, intent) {
      const endpoint = path(importId)
      requireKey(intent.key)
      const body = { phase: 'confirm_review', preview_id: intent.previewId, preview_digest: intent.previewDigest, mapping_revision: intent.mappingRevision, confirm: true, reason: intent.reason }
      if (!matchesImportWire('ConfirmReviewRequest', body) || !nonempty(intent.reason)) throw new Error('Xác nhận review cần exact preview/digest, mapping revision và lý do không rỗng.')
      bodyLimit(body)
      return validateReviewConfirmation(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/process`, {
        method: 'POST', headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.importRevision) }, body,
      }), importId, intent.previewId, intent.previewDigest, intent.mappingRevision)
    },
    async commit(importId, intent) {
      validateCommit(importId, intent)
      const body = { phase: 'commit', preview_id: intent.previewId, preview_digest: intent.previewDigest, confirm: true, reason: intent.reason, resolutions: intent.resolutions, supplier_changes: intent.supplierChanges ?? [] }
      if (!matchesImportWire('app__application__contracts__import_mapping__CommitRequest', body)) throw new Error('Commit không đúng exact DTO hiện hành.')
      bodyLimit(body)
      const response = await requestJson<unknown>(options.apiBaseUrl, `${path(importId)}/process`, {
        method: 'POST', headers: { 'Idempotency-Key': intent.key, 'If-Match': quotedRevision(intent.importRevision) },
        body,
      })
      const receipt = validateProcessReceipt(response, importId, 'commit')
      if (receipt.preview_id !== intent.previewId) throw new HttpError('protocol', 'Biên nhận acceptance không khớp preview đã gửi. Cần đối chiếu đúng intent gốc.')
      return receipt
    },
    async job(jobId, signal) {
      requireId(jobId, 'Job')
      return validateImportJob(await read(`/api/v1/jobs/${jobId}`, signal), jobId)
    },
    async completion(importId, signal) {
      return validateImportCompletion(await read(`${path(importId)}/completion`, signal), importId)
    },
  }
}
