import { HttpError, isRecord } from '../../shared/http/httpClient'
import type { Pagination } from '../../shared/http/http.types'
import { isImportUuid, isImportVersion, validateImportBatch } from './importData.validation'
import { matchesImportWire } from './importFlow.wire'
import type { WireFieldOption, WireSheetInfo } from './importFlow.wire'
import type {
  ActionReadiness, ImportCompletion, ImportJob, JsonValue, MappingConfirmation,
  MappingOptions, MappingProgress, MappingQueue, MappingSummary, PreviewBundle,
  PreviewRow, PreviewSummary, ProcessReceipt, ProfileDecisionReceipt, ReviewConfirmationReceipt,
} from './importFlow.types'

const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const unique = (value: string[]) => new Set(value).size === value.length

export function isFlowJson(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isFlowJson)
  return isRecord(value) && Object.values(value).every(isFlowJson)
}

function invalid(surface: string, value?: unknown): never {
  const id = isRecord(value) && isRecord(value.meta) && text(value.meta.request_id) ? value.meta.request_id : undefined
  throw new HttpError('protocol', `Phản hồi ${surface} không đúng contract Import. Chưa xác nhận kết quả thao tác.`, undefined, undefined, id)
}

function envelope(value: unknown, surface: string) {
  if (!isRecord(value) || value.error !== null || !isRecord(value.data) ||
    !matchesImportWire('ImportMeta', value.meta) || !isRecord(value.meta) || !text(value.meta.request_id) ||
    (value.meta.poll_after_ms !== undefined && value.meta.poll_after_ms !== null && !count(value.meta.poll_after_ms))) return invalid(surface, value)
  return { data: value.data, meta: value.meta }
}

function page(value: unknown, size: number): value is Pagination {
  return matchesImportWire('Pagination', value) && isRecord(value) && count(value.limit) && value.limit >= 1 && value.limit <= 100 && size <= value.limit &&
    (value.next_cursor === null || text(value.next_cursor)) && (value.total_count === null || (count(value.total_count) && value.total_count >= size))
}

function progress(value: unknown): value is MappingProgress {
  return matchesImportWire('Progress', value) && isRecord(value) &&
    ['total_fields', 'completed_fields', 'unresolved'].every((key) => count(value[key])) &&
    Number(value.completed_fields) + Number(value.unresolved) === value.total_fields
}

function sheetDefaults(sheet: WireSheetInfo): WireSheetInfo {
  return { ...sheet, shared_field_bindings: sheet.shared_field_bindings ?? [], import_values: sheet.import_values ?? [],
    selected_type: sheet.selected_type ?? null, suggested_type: sheet.suggested_type ?? null,
    classification_origin: sheet.classification_origin ?? 'NONE', ignored: sheet.ignored ?? false }
}

function optionDefaults(option: WireFieldOption) {
  return { ...option, aliases: option.aliases ?? [], conditional_requirements: option.conditional_requirements ?? [],
    input_sources: option.input_sources ?? ['excel'], allowed_shared_scopes: option.allowed_shared_scopes ?? [],
    label: option.label ?? '', description: option.description ?? '', input_help: option.input_help ?? '',
    nullable: option.nullable ?? false, value_role: option.value_role ?? 'canonical_candidate', unsupportedFields: [] }
}

export function validateMappingSummary(value: unknown, importId: string): MappingSummary {
  const { data } = envelope(value, 'M01')
  if (!matchesImportWire('MappingSummary', data) || data.import_id !== importId ||
    !isImportVersion(data.mapping_revision) || !progress(data.progress)) return invalid('M01', value)
  const wire = data as Omit<MappingSummary, 'unsupportedFields'>
  if (!unique(wire.files.map((file) => file.client_file_id)) || !unique(wire.sheets.map((sheet) => sheet.sheet_id)) ||
    !unique(wire.profile_proposals.map((proposal) => proposal.profile_id)) ||
    wire.sheets.some((sheet) => !wire.files.some((file) => file.file_id === sheet.file_id)) ||
    !unique(wire.allowed_actions)) return invalid('M01', value)
  return { ...wire, sheets: wire.sheets.map(sheetDefaults), approved_profiles: wire.approved_profiles ?? [], approved_contexts: wire.approved_contexts ?? [], warnings: wire.warnings ?? [], unsupportedFields: [] }
}

export function validateMappingQueue(value: unknown): MappingQueue {
  const { data, meta } = envelope(value, 'M02')
  if (!matchesImportWire('MappingList', data) || !progress(data.counts) || !Array.isArray(data.items) ||
    !page(meta.pagination, data.items.length)) return invalid('M02', value)
  const wire = data as { items: Omit<MappingQueue['items'][number], 'unsupportedFields'>[]; counts: MappingProgress }
  if (!unique(wire.items.map((item) => item.mapping_id)) || wire.items.some((item) => item.source_location.sheet_id !== item.sheet_id)) return invalid('M02', value)
  return { ...data, items: wire.items.map((item) => ({ ...item, samples: item.samples ?? [], unsupportedFields: [] })), counts: wire.counts, pagination: meta.pagination, unsupportedFields: [] }
}

export function validateMappingOptions(value: unknown): MappingOptions {
  const { data } = envelope(value, 'M03')
  if (!matchesImportWire('FieldOptions', data) || !isImportVersion(data.mapping_revision) || data.schema_version !== 'import_schema/1') return invalid('M03', value)
  const wire = data as unknown as MappingOptions
  if (!unique(wire.options.map((option) => option.key)) || !unique((wire.schemas ?? []).map((schema) => schema.schema_id)) ||
    (wire.schemas ?? []).some((schema) => !unique(schema.fields.map((field) => field.key)))) return invalid('M03', value)
  return { ...wire, duplicate_mapping_allowed: false, schemas: (wire.schemas ?? []).map((schema) => ({ ...schema, supported: true, fields: schema.fields.map(optionDefaults) })), options: wire.options.map(optionDefaults), unsupportedFields: [] }
}

export function validateMappingConfirmation(value: unknown, mappingId: string, _targetField?: string): MappingConfirmation {
  const { data } = envelope(value, 'M04')
  if (!matchesImportWire('MappingUpdated', data) || data.mapping_id !== mappingId || !text(data.status) ||
    !isImportVersion(data.mapping_revision) || !progress(data.progress) ||
    (data.approval_required === true && !isImportVersion(data.proposal_revision))) return invalid('M04', value)
  return { ...data, sheets: (data.sheets as WireSheetInfo[]).map(sheetDefaults), unsupportedFields: [] } as unknown as MappingConfirmation
}

export function validateProfileDecision(value: unknown, profileId: string): ProfileDecisionReceipt {
  const { data } = envelope(value, 'N5')
  if (!matchesImportWire('DecisionResult', data) || data.profile_id !== profileId || !isImportVersion(data.lifecycle_revision)) return invalid('N5', value)
  return data as ProfileDecisionReceipt
}

export function validateReviewConfirmation(value: unknown, importId: string, previewId: string, previewDigest: string, mappingRevision: string): ReviewConfirmationReceipt {
  const { data } = envelope(value, 'I05 confirm_review')
  if (!matchesImportWire('ConfirmationResult', data) || !isImportVersion(data.import_revision) || !isRecord(data.confirmation) ||
    data.confirmation.import_id !== importId || data.confirmation.preview_id !== previewId ||
    data.confirmation.preview_digest !== previewDigest || data.confirmation.mapping_revision !== mappingRevision) return invalid('I05 confirm_review', value)
  return { ...data, phase: 'confirm_review', canonical_commit_supported: data.canonical_commit_supported ?? false } as ReviewConfirmationReceipt
}

export function validateProcessReceipt(value: unknown, importId: string, phase: 'preview' | 'commit'): ProcessReceipt {
  const { data, meta } = envelope(value, `I05 ${phase}`)
  if (!matchesImportWire(phase === 'preview' ? 'PreviewAccepted' : 'CommitAccepted', data) ||
    data.import_id !== importId || !isImportVersion(data.import_revision) ||
    (meta.poll_after_ms !== undefined && meta.poll_after_ms !== 2000)) return invalid(`I05 ${phase}`, value)
  return { ...data, phase, status: phase === 'preview' ? 'previewing' : 'committing', job_status: 'queued', poll_after_ms: meta.poll_after_ms ?? null, unsupportedFields: [] } as unknown as ProcessReceipt
}

export function validatePreviewBundle(value: unknown, importId: string, previewId?: string): PreviewBundle {
  const batch = validateImportBatch(value, importId)
  if (!matchesImportWire('ImportRead', isRecord(value) ? value.data : undefined) || !isRecord(batch.preview) ||
    !matchesImportWire('PreviewPage', batch.preview) || !isRecord(batch.preview.summary) ||
    (previewId !== undefined && batch.preview.summary.preview_id !== previewId) ||
    batch.preview.summary.source_set_version !== batch.file_set_version || !Array.isArray(batch.preview.rows) ||
    !page(batch.preview.rows_page, batch.preview.rows.length)) return invalid('I04 preview', value)
  const preview = batch.preview as unknown as PreviewBundle['preview']
  if (!text(preview.mapping_revision) || !text(preview.read_set_digest) ||
    preview.source_evidence_digest !== null && !text(preview.source_evidence_digest) ||
    preview.aggregates && (preview.aggregates.preview_id !== preview.summary.preview_id || preview.aggregates.preview_digest !== preview.summary.digest)) return invalid('I04 preview pins', value)
  if (Object.values(preview.summary.counts).some((value) => !count(value)) || preview.summary.groups.some((group) =>
    ![group.row_count, group.planned_insert_count, group.planned_update_count, group.no_op_count, group.blocked_count].every(count))) return invalid('I04 preview', value)
  if (!unique(preview.rows.map((row) => row.row_id)) || !unique(preview.summary.required_actions) ||
    preview.rows.some((row) => [row.before, row.after].some((domain) => domain !== null && !text(domain.domain)))) return invalid('I04 preview', value)
  const rows = preview.rows.map((row) => ({
    ...row, changes: row.changes ?? [], blockers: row.blockers ?? [], warnings: row.warnings ?? [],
    confirmation_required: row.confirmation_required ?? false, unsupportedFields: [],
  })) as PreviewRow[]
  const confirmation = batch.review_confirmation as PreviewBundle['review_confirmation']
  return {
    import_id: batch.import_id, store_id: batch.store_id, import_revision: batch.import_revision,
    file_set_version: batch.file_set_version, source_set: batch.source_set,
    status: batch.status, allowed_actions: batch.allowed_actions, completion_available: batch.completion_available,
    review_confirmation: confirmation, confirmation_usable: batch.confirmation_usable,
    configurations: batch.configurations as PreviewBundle['configurations'],
    preview: { ...preview, summary: { ...preview.summary, policy_version: preview.summary.policy_version ?? 'import_mapping_policy/1', mode: preview.summary.mode ?? 'atomic', can_commit: preview.summary.can_commit ?? false, confirmed_resolutions_version: preview.summary.confirmed_resolutions_version ?? null } as PreviewSummary, rows },
    unsupportedFields: [],
  }
}

export function validateImportJob(value: unknown, jobId: string): ImportJob {
  const { data, meta } = envelope(value, 'J01')
  if (!matchesImportWire('JobView', data) || data.job_id !== jobId ||
    !['import_analyze', 'import_preview', 'import_commit'].includes(String(data.operation)) ||
    !isRecord(data.context) || !isImportUuid(data.context.import_id) ||
    !(data.progress === null || (typeof data.progress === 'number' && Number.isFinite(data.progress) && data.progress >= 0 && data.progress <= 1)) ||
    !count(meta.poll_after_ms)) return invalid('J01', value)
  const terminal = data.status === 'completed' || data.status === 'failed'
  if (meta.poll_after_ms !== (terminal ? 0 : 2000) ||
    (!terminal && (data.result !== null || data.error !== null || data.completed_at !== null)) ||
    (data.status === 'failed' && (data.result !== null || data.stage !== 'failed' || data.completed_at === null || data.error === null))) return invalid('J01', value)
  if (data.status === 'completed') {
    const expected = { import_analyze: ['import_analysis', 'analysis_id'], import_preview: ['import_preview', 'preview_id'], import_commit: ['import_completion', 'commit_id'] }[String(data.operation)]
    if (!expected || data.stage !== 'completed' || data.completed_at === null || data.error !== null || !isRecord(data.result) ||
      data.result.resource_id !== data.context.import_id || data.result.resource_type !== expected[0] || !isImportUuid(data.result[expected[1]])) return invalid('J01', value)
  }
  return { ...data, poll_after_ms: meta.poll_after_ms, unsupportedFields: [] } as unknown as ImportJob
}

export function validateImportCompletion(value: unknown, importId: string): ImportCompletion {
  const { data } = envelope(value, 'I06')
  if (!matchesImportWire('ImportCompletion', data) || data.import_id !== importId) return invalid('I06', value)
  const wire = data as unknown as ImportCompletion
  const summaryCounts = [wire.summary.files, wire.summary.sheets, wire.summary.rows, wire.summary.mapped_fields, wire.summary.warnings,
    wire.summary.inserted_record_count, wire.summary.changed_record_count, wire.summary.no_op_count, ...Object.values(wire.summary.counts)]
  if (!summaryCounts.every(count) || !unique(wire.readiness.evaluated_actions) ||
    !unique(wire.readiness.actions.map((action) => action.action)) ||
    wire.readiness.actions.length !== wire.readiness.evaluated_actions.length ||
    !wire.readiness.actions.every((action) => wire.readiness.evaluated_actions.includes(action.action))) return invalid('I06', value)
  const actions = wire.readiness.actions.map((action) => ({
    ...action, availability: action.availability ?? 'unknown', can_execute: action.can_execute ?? false,
    data_status: action.data_status ?? 'unknown', execution_status: action.execution_status ?? 'unknown',
    blockers: action.blockers ?? [], warnings: action.warnings ?? [], result_assessment: action.result_assessment ?? 'NOT_ASSESSED',
  })) as ActionReadiness[]
  if (actions.some((action) => action.can_execute !== (action.availability === 'ready')) ||
    (wire.outcome === 'no_changes' && Object.values(wire.updated_resources).some((resource) =>
      ('updated' in resource && resource.updated === true) || Object.entries(resource).some(([key, item]) => key !== 'updated' && typeof item === 'number' && item !== 0)))) return invalid('I06', value)
  return { ...wire, mode: 'atomic', summary: { ...wire.summary, errors: 0 }, readiness: { ...wire.readiness, actions }, unsupportedFields: [] }
}
