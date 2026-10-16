import { HttpError, isRecord, requestDocument, requestJson, requestMultipart, requestNoContent, requestPdf } from '../../shared/http/httpClient'
import { capabilityOperations, capabilitySchemas } from './capabilities.wire'
import type { CapabilityContracts, CapabilityOperation, WireExportSummary } from './capabilities.wire'
import { matchesCapabilitySchema } from './capabilities.validation'

export type CapabilityInput<K extends CapabilityOperation> = CapabilityContracts[K]['input']
export type CapabilityOutput<K extends CapabilityOperation> = CapabilityContracts[K]['output']
export type CapabilityCallOptions = {
  signal?: AbortSignal
  // Readers can pin successive pages without replacing captured evidence with latest state.
  snapshotId?: string
  submissionPin?: { submission_id: string; version: string; spec_digest: string }
}
export type CapabilityServices = { [K in CapabilityOperation]: (input: CapabilityInput<K>, options?: CapabilityCallOptions) => Promise<CapabilityOutput<K>> }
export class CapabilityInputError extends Error {
  readonly operation: CapabilityOperation
  constructor(operation: CapabilityOperation, message = 'Input does not match the pinned backend contract.') {
    super(message); this.operation = operation; this.name = 'CapabilityInputError'
  }
}
const protocol = (operation: CapabilityOperation, message: string): never => { throw new HttpError('protocol', `${operation}: ${message}`) }
function quotedRevision(operation: CapabilityOperation, revision: string): string {
  if (!revision.trim() || [...revision].some(c => c === '"' || c.charCodeAt(0) < 32 || c.charCodeAt(0) > 255 || c.charCodeAt(0) === 127)) throw new CapabilityInputError(operation, 'Revision cannot be represented safely as one quoted If-Match value.')
  return `"${revision}"`
}

/** Explicit input validation/capture; never fills defaults, creates keys, selects entities or writes storage. */
export function captureCapabilityInput<K extends CapabilityOperation>(operation: K, input: CapabilityInput<K>): CapabilityInput<K> {
  const definition = capabilityOperations[operation]
  if (!definition || !matchesCapabilitySchema(definition.request, input, capabilitySchemas)) throw new CapabilityInputError(operation)
  const record = input as Record<string, unknown>
  const body = isRecord(record.body) ? record.body : undefined
  const query = isRecord(record.query) ? record.query : undefined
  if (typeof record.revision === 'string') quotedRevision(operation, record.revision)
  if (operation === 'N4' && (typeof record.revision === 'string') === (record.ifNoneMatch === '*')) throw new CapabilityInputError(operation, 'Budget requires exactly one explicit create or update precondition.')
  if (typeof record.invitationToken === 'string' && /[\r\n]/.test(record.invitationToken)) throw new CapabilityInputError(operation, 'Invitation proof cannot contain header control characters.')
  if (operation === 'NF01' && query?.unread != null && !['true', 'false'].includes(String(query.unread))) throw new CapabilityInputError(operation, 'Unread filter must be true or false.')
  if (operation === 'N5' && body && (body.submission_id != null) !== (body.expected_submission_version != null)) throw new CapabilityInputError(operation, 'Submission ID and version must be supplied together.')
  for (const field of ['reason', 'proposal_revision', 'mapping_revision', 'expected_submission_version']) if (typeof body?.[field] === 'string' && !body[field].trim()) throw new CapabilityInputError(operation, 'Required evidence/revision/reason must not be blank.')
  for (const field of ['requested_permissions', 'approved_permissions']) if (Array.isArray(body?.[field]) && new Set(body[field]).size !== body[field].length) throw new CapabilityInputError(operation, 'Permissions must be unique.')
  if (definition.multipart) {
    if (!body || Object.keys(body).some(k => !['files', 'client_file_ids'].includes(k)) || !Array.isArray(body.files) || !Array.isArray(body.client_file_ids) || !body.files.length || body.files.length !== body.client_file_ids.length || new Set(body.client_file_ids).size !== body.client_file_ids.length || body.files.some(f => !(f instanceof Blob) || !('name' in f) || typeof f.name !== 'string' || !f.name)) throw new CapabilityInputError(operation, 'Upload requires named files and one unique client ID for each file.')
    // File/Blob bytes are immutable; retain File names (structuredClone can erase them in some runtimes).
    return { ...record, path: { ...(record.path as object) }, body: { files: [...body.files], client_file_ids: [...body.client_file_ids] } } as CapabilityInput<K>
  }
  return structuredClone(input)
}

function validateResponse<K extends CapabilityOperation>(operation: K, input: CapabilityInput<K>, result: unknown, options: CapabilityCallOptions): CapabilityOutput<K> {
  const definition = capabilityOperations[operation]
  if (!matchesCapabilitySchema(definition.response, result, capabilitySchemas)) return protocol(operation, 'Response schema mismatch; outcome is not confirmed.')
  if (!isRecord(result) || definition.responseKind === 'document') return result as CapabilityOutput<K>
  if (!isRecord(result.meta) || (Object.hasOwn(result.meta, 'request_id') && (typeof result.meta.request_id !== 'string' || !result.meta.request_id.trim()))) return protocol(operation, 'Invalid request metadata.')
  const data = result.data
  if (!isRecord(data)) return protocol(operation, 'Missing response data.')
  const args = input as { path?: Record<string, unknown>; query?: Record<string, unknown>; body?: Record<string, unknown> }
  const expected = { ...args.path }
  for (const key of ['store_id', 'import_id', 'file_id']) if (args.query?.[key] != null) expected[key] = args.query[key]
  if (['MQ01', 'N5'].includes(operation) && args.body) for (const key of ['profile_id', 'submission_id']) if (args.body[key] != null) expected[key] = args.body[key]
  const rows = Array.isArray(data.items) ? data.items : []
  const resources = [data, data.submission, data.request, ...rows, ...rows.filter(isRecord).map(row => row.store)].filter(isRecord)
  for (const resource of resources) for (const [key, value] of Object.entries(expected)) {
    if (Object.hasOwn(resource, key) && resource[key] !== value) return protocol(operation, 'Response belongs to a different resource/scope.')
    if (key === 'plan_id' && Object.hasOwn(resource, 'run_id') && resource.run_id !== value) return protocol(operation, 'Response belongs to a different retained run.')
    if (operation === 'M03' && key === 'sheet_id' && resource.schema_context_id !== value) return protocol(operation, 'Field descriptors belong to a different sheet.')
  }
  if (operation === 'NF02' && (data.store_id !== (args.query?.store_id ?? null) || data.scope !== (args.query?.store_id ? 'store' : 'accessible'))) return protocol(operation, 'Unread count scope mismatch.')
  if (operation === 'NF03' && ((args.body?.read === true && data.read_at === null) || (args.body?.read === false && data.read_at !== null))) return protocol(operation, 'Notification read state does not match the acknowledged intent.')
  if (options.snapshotId !== undefined && result.meta.snapshot_id !== options.snapshotId) return protocol(operation, 'Snapshot changed between reads.')
  if (args.query?.snapshot_id != null && result.meta.snapshot_id !== args.query.snapshot_id) return protocol(operation, 'Requested snapshot was not retained.')
  if (options.submissionPin) {
    const submission = data.submission
    if (!isRecord(submission) || Object.entries(options.submissionPin).some(([key, value]) => submission[key] !== value)) return protocol(operation, 'Pinned submission evidence changed.')
  }
  if (isRecord(result.meta.pagination)) {
    const page = result.meta.pagination
    if (typeof page.limit !== 'number' || page.limit < 1 || rows.length > page.limit || (page.total_count !== null && (typeof page.total_count !== 'number' || page.total_count < rows.length)) || (page.next_cursor !== null && (typeof page.next_cursor !== 'string' || !page.next_cursor.trim() || page.next_cursor === args.query?.cursor))) return protocol(operation, 'Invalid or repeating pagination receipt.')
  }
  for (const key of ['submission_id', 'request_id', 'notification_id', 'export_id']) {
    const ids = rows.filter(isRecord).filter(row => Object.hasOwn(row, key)).map(row => row[key])
    if (new Set(ids).size !== ids.length) return protocol(operation, 'Duplicate resource identities within one page.')
  }
  if (isRecord(data.evidence) && args.query?.evidence_cursor != null && data.evidence.next_cursor === args.query.evidence_cursor) return protocol(operation, 'Evidence cursor did not advance.')
  return result as CapabilityOutput<K>
}

export type CapabilityApi = ReturnType<typeof createBackendCapabilitiesApi>

/** All published operations are explicitly callable; construction performs no I/O and enables no product flow. */
export function createBackendCapabilitiesApi(baseUrl: string) {
  const parsed = new URL(baseUrl)
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('Invalid API base URL.')
  const base = baseUrl.replace(/\/+$/, '')
  async function call<K extends CapabilityOperation>(operation: K, input: CapabilityInput<K>, options: CapabilityCallOptions = {}): Promise<CapabilityOutput<K>> {
    options = { ...options, submissionPin: options.submissionPin ? { ...options.submissionPin } : undefined }
    const captured = captureCapabilityInput(operation, input)
    const definition = capabilityOperations[operation]
    const args = captured as { path?: Record<string, string>; query?: Record<string, unknown>; body?: unknown; key?: string; revision?: string; ifNoneMatch?: '*'; invitationToken?: string }
    const path = definition.path.replace(/\{([^}]+)\}/g, (_, key: string) => encodeURIComponent(args.path![key]))
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(args.query ?? {})) if (value !== null && value !== undefined) {
      for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item))
    }
    const endpoint = path + (params.size ? `?${params}` : '')
    const headers: Record<string, string> = {}
    if (args.key) headers['Idempotency-Key'] = args.key
    if (args.revision) headers['If-Match'] = quotedRevision(operation, args.revision)
    if (args.ifNoneMatch) headers['If-None-Match'] = args.ifNoneMatch
    if (args.invitationToken) headers['X-Invitation-Token'] = args.invitationToken
    for (const [name, value] of Object.entries(headers)) if (!matchesCapabilitySchema(definition.headerSchemas[name], value, capabilitySchemas)) throw new CapabilityInputError(operation, 'Header exceeds the published contract constraints.')
    const transport = { method: definition.method, auth: definition.auth, signal: options.signal, headers, expectedStatuses: definition.statuses, referrerPolicy: 'no-referrer' as const }
    if (definition.responseKind === 'empty') { await requestNoContent(base, endpoint, transport); return undefined as CapabilityOutput<K> }
    if (definition.responseKind === 'pdf') {
      const result = await requestPdf(base, endpoint, transport)
      options.signal?.throwIfAborted()
      return result as CapabilityOutput<K>
    }
    let result: unknown
    if (definition.multipart) {
      const body = args.body as { files: File[]; client_file_ids: string[] }, form = new FormData()
      body.files.forEach(file => form.append('files', file, file.name))
      body.client_file_ids.forEach(id => form.append('client_file_ids', id))
      result = await requestMultipart(base, endpoint, { ...transport, body: form })
    } else if (definition.responseKind === 'document') result = await requestDocument(base, endpoint, transport)
    else result = await requestJson(base, endpoint, { ...transport, body: args.body })
    options.signal?.throwIfAborted()
    return validateResponse(operation, captured, result, options)
  }
  const operations = Object.fromEntries(Object.keys(capabilityOperations).map(id => [id, (input: CapabilityInput<CapabilityOperation>, options?: CapabilityCallOptions) => call(id as CapabilityOperation, input, options)])) as CapabilityServices
  function planningQuery(request: CapabilityInput<'C02'>['body']): string {
    if (!matchesCapabilitySchema({ $ref: '#/components/schemas/PlanningRequest-Input' }, request, capabilitySchemas)) throw new CapabilityInputError('C02', 'Supplied planning context needs the same typed request as generation.')
    return JSON.stringify(request)
  }
  async function downloadRetainedExport(receipt: WireExportSummary, options?: CapabilityCallOptions): Promise<Blob> {
    if (!matchesCapabilitySchema({ $ref: '#/components/schemas/ExportSummary' }, receipt, capabilitySchemas) || receipt.status !== 'completed' || receipt.artifact_availability !== 'available' || !receipt.allowed_actions.includes('download') || !receipt.sha256 || !/^[0-9a-f]{64}$/.test(receipt.sha256) || receipt.byte_count === null || !Number.isSafeInteger(receipt.byte_count) || receipt.byte_count < 8) throw new CapabilityInputError('N11', 'A verifiable retained export receipt is required.')
    const captured = structuredClone(receipt)
    const blob = await operations.N11({ path: { plan_id: captured.run_id, export_id: captured.export_id } }, options)
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))].map(v => v.toString(16).padStart(2, '0')).join('')
    if (blob.size !== captured.byte_count || digest !== captured.sha256) return protocol('N11', 'Downloaded artifact does not match its retained size/hash receipt.')
    options?.signal?.throwIfAborted()
    return blob
  }
  return {
    call, operations,
    auth: { register: operations.A02, requestVerification: operations.A06, completeVerification: operations.A05, requestPasswordReset: operations.A07, completeCredentials: operations.N7 },
    stores: { create: operations.T03, list: operations.T01, read: operations.T02 },
    invitations: { offer: operations.N18, accept: operations.N19, decline: operations.IN01 },
    notifications: { list: operations.NF01, count: operations.NF02, setRead: operations.NF03 },
    permissions: { submit: operations.PR01, list: operations.PR02, read: operations.PR03, act: operations.PR04 },
    mapping: { submitOrWithdraw: operations.MQ01, list: operations.MQ02, read: operations.MQ03, decide: operations.N5 },
    exports: { list: operations.EX01, create: operations.N10, download: operations.N11, downloadRetained: downloadRetainedExport },
    planning: {
      contextForRequest: (storeId: string, request: CapabilityInput<'C02'>['body'], options?: CapabilityCallOptions) => operations.C01({ path: { store_id: storeId }, query: { planning_request: planningQuery(request) } }, options),
      readinessForRequest: (storeId: string, request: CapabilityInput<'C02'>['body'], options?: CapabilityCallOptions) => operations.R01({ path: { store_id: storeId }, query: { actions: 'planning', planning_request: planningQuery(request) } }, options),
    },
  }
}
