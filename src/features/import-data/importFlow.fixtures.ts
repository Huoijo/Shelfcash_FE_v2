import type { DevOwnerReviewGateway, OwnerReviewState } from './importExperience'
import { HttpError } from '../../shared/http/httpClient'
import type { MockImportDataSource } from './importData.fixtures'
import type { ImportBatch } from './importData.types'
import type {
  ImportCompletion, ImportFlowDataSource, ImportJob, MappingIssue, MappingProgress,
  MappingSummary, PreviewBundle, PreviewRow, ProcessReceipt, ReviewConfirmation, MappingResolution,
} from './importFlow.types'

const timestamp = '2026-10-11T01:00:00Z'
const digest = `sha256:${'d'.repeat(64)}`
const counts = { NEW: 0, UNCHANGED: 0, CHANGED: 2, INVALID: 0, CONFLICT: 0 }
type Fixture = {
  batch: ImportBatch
  sheetId: string
  analysisId: string
  mappingId: string
  profileId: string
  proposalRevision: string
  lifecycleRevision: string
  mappingRevision: string
  ownerRequired: boolean
  mappingResolved: boolean
  targetField: string
  preview: PreviewBundle | null
  completion: ImportCompletion | null
  commitId: string | null
}
type FixtureJob = { job: ImportJob; polls: number; fixture: Fixture }
function fail(status: number, code: string): never {
  throw new HttpError('contract', code, status, { code, message: code, details: { approval_request_allowed: false } })
}

/** Explicit synthetic DEV/QA scenario, never parsing/persistence evidence.
 * Shares the original mock batch instance and uses the published wire shapes.
 * It cannot authorize an API fallback or model all backend business validators.
 */
export function createMockImportFlowDataSource(
  batches: MockImportDataSource,
  options: { ownerRequired?: boolean; pageSize?: number; rejectOwnerReview?: boolean } = {},
): ImportFlowDataSource & { ownerReview: DevOwnerReviewGateway } {
  const fixtures = new Map<string, Fixture>()
  const jobs = new Map<string, FixtureJob>()
  const receipts = new Map<string, { fingerprint: string; value: unknown }>()
  let counter = 1
  const id = () => `f1700000-0000-4000-8000-${String(counter++).padStart(12, '0')}`
  const revision = () => `mock-continuation-${counter++}`
  const pageSize = options.pageSize ?? 1

  async function fixture(importId: string): Promise<Fixture> {
    const batch = await batches.read(importId)
    if (!batch.source_set.sealed) fail(409, 'ANALYSIS_NOT_READY')
    let record = fixtures.get(importId)
    if (!record) {
      record = { batch, sheetId: id(), analysisId: id(), mappingId: id(), profileId: id(),
        proposalRevision: revision(), lifecycleRevision: revision(), mappingRevision: revision(),
        ownerRequired: options.ownerRequired === true, mappingResolved: options.ownerRequired !== true, targetField: 'on_hand',
        preview: null, completion: null, commitId: null }
      fixtures.set(importId, record)
    } else record.batch = batch
    return record
  }
  function update(record: Fixture, patch: Parameters<MockImportDataSource['advanceContinuation']>[1]) {
    record.batch = batches.advanceContinuation(record.batch.import_id, patch)
  }
  function progress(record: Fixture): MappingProgress {
    return { total_fields: 3, completed_fields: record.mappingResolved ? 3 : 2, unresolved: record.mappingResolved ? 0 : 1 }
  }
  function sheet(record: Fixture) {
    return { file_id: record.batch.source_set.accepted_file_ids[0], sheet_id: record.sheetId,
      name: 'Ví dụ kiểm kê', schema_signature: 'mock-inventory-signature', row_count: 2,
      headers: ['ingredient_id', 'lot_id', 'on_hand'], profile_id: record.profileId,
      selected_type: 'inventory_count' as const, suggested_type: 'inventory_count' as const,
      classification_origin: 'REUSED' as const, confidence: 1, ignored: false, ignore_reason: null,
      shared_field_bindings: [], import_values: [] }
  }
  function spec(record: Fixture) {
    return { scope: { source_system_key: 'mock.synthetic', report_type: 'inventory_count', schema_version: 'import_schema/1' as const },
      schema: 'inventory_count' as const,
      structure: { sheet_roles: ['inventory_count'], header_rules: [], schema_signature: 'mock-inventory-signature' },
      field_bindings: [{ source_column_index: 2, source_header: 'on_hand', target_field: record.mappingResolved ? record.targetField : null,
        requiredness: 'required' as const, ignored: false, evidence_reference: 'Phiếu kiểm kê', origin: 'MANUAL' as const, confidence: null }],
      identity_rules: [], entity_proposals: [], aliases: [], normalizations: [], conversions: [],
      sales_semantics: null, inventory_semantics: 'lot_stock_count' as const,
      planned_arrival_expiry_rule: null, term_period_amendments: [], fee_period_amendments: [],
      source_provenance: { declared_by: record.batch.store_id, evidence_references: ['Phiếu kiểm kê'],
        verification: 'USER_DECLARED' as const, owner_reviewed: !record.ownerRequired }, shared_field_bindings: [] }
  }
  function summary(record: Fixture): MappingSummary {
    return { import_id: record.batch.import_id, analysis_id: record.analysisId,
      mapping_revision: record.mappingRevision, progress: progress(record),
      files: structuredClone(record.batch.files), sheets: [sheet(record)], binding_refs: record.ownerRequired ? [] : [
        { sheet_id: record.sheetId, profile_id: record.profileId, version: 'mock-approved/1', content_digest: digest }],
      profile_proposals: record.ownerRequired ? [{ profile_id: record.profileId,
        proposal_revision: record.proposalRevision, lifecycle_revision: record.lifecycleRevision,
        active_version: null, spec: spec(record), missing_fields: record.mappingResolved ? [] : ['on_hand'] }] : [],
      approved_profiles: record.ownerRequired ? [] : [{ binding: { sheet_id: record.sheetId, profile_id: record.profileId, version: 'mock-approved/1', content_digest: digest }, spec: spec(record) }], approved_contexts: [], warnings: [],
      can_preview: !record.ownerRequired,
      blockers: record.ownerRequired ? [{ code: 'OWNER_MAPPING_APPROVAL_REQUIRED', severity: 'ERROR',
        message: 'Ví dụ bị chặn: cần Owner duyệt toàn bộ profile.' }] : [],
      allowed_actions: record.batch.allowed_actions, unsupportedFields: [] }
  }
  function issue(record: Fixture): MappingIssue {
    return { mapping_id: record.mappingId, sheet_id: record.sheetId, issue_type: 'column',
      code: record.ownerRequired ? 'OWNER_MAPPING_APPROVAL_REQUIRED' : 'APPROVED_PROFILE_BINDING',
      status: !record.mappingResolved ? 'needs_confirmation' : record.ownerRequired ? 'resolved' : 'auto_mapped',
      source_location: { file_id: record.batch.source_set.accepted_file_ids[0], sheet_id: record.sheetId,
        source_column_index: 2 }, source_header: 'on_hand', target_field: record.mappingResolved ? record.targetField : null,
      samples: ['10', '8'], suggested_target_field: 'on_hand', suggestion_origin: 'REUSED',
      confidence: record.ownerRequired ? null : 1, resolution_origin: !record.mappingResolved ? 'UNRESOLVED' : record.ownerRequired ? 'USER_PROPOSAL' : 'APPROVED_PROFILE',
      profile_ref: record.ownerRequired ? null : { sheet_id: record.sheetId, profile_id: record.profileId,
        version: 'mock-approved/1', content_digest: digest },
      resolution: null, resolved_by: null, ignored: false, unsupportedFields: [] }
  }
  function replay<T>(scope: string, intent: unknown): T | null {
    const previous = receipts.get(scope)
    if (!previous) return null
    if (previous.fingerprint !== JSON.stringify(intent)) return fail(409, 'IDEMPOTENCY_KEY_REUSED')
    return structuredClone(previous.value) as T
  }
  function retain(scope: string, intent: unknown, value: unknown) {
    receipts.set(scope, { fingerprint: JSON.stringify(intent), value: structuredClone(value) })
  }
  function previewRows(record: Fixture): PreviewRow[] {
    return [0, 1].map((index) => {
      const ingredientId = id(), lotId = id()
      return { row_id: id(),
        source_location: { file_id: record.batch.source_set.accepted_file_ids[0], sheet_id: record.sheetId,
          row_number: index + 2, source_column_index: 2 },
        classification: 'CHANGED', proposed_action: 'COUNT_CORRECTION', entity_refs: { ingredient_id: ingredientId, lot_id: lotId },
        before: { domain: 'inventory_count', ingredient_id: ingredientId, lot_id: lotId,
          on_hand: index ? '9' : '12', unit: 'l', observed_at: timestamp, reason: 'Đối chiếu số lượng kiểm kê' },
        after: { domain: 'inventory_count', ingredient_id: ingredientId, lot_id: lotId,
          on_hand: index ? '8' : '10', unit: 'l', observed_at: timestamp, reason: 'Đối chiếu số lượng kiểm kê' },
        changes: [{ field: 'on_hand', before: index ? '9' : '12', after: index ? '8' : '10', delta: index ? '-1' : '-2' }],
        provenance: { on_hand: { origin: 'SOURCE_EXPLICIT', applied_rule_ids: [], value_source: 'SOURCE_COLUMN', source_column_index: 2 } },
        blockers: [], warnings: [], confirmation_required: true, unsupportedFields: [] }
    })
  }
  function accept(record: Fixture, phase: 'preview' | 'commit'): ProcessReceipt {
    const jobId = id()
    const job: ImportJob = {
      job_id: jobId, operation: phase === 'preview' ? 'import_preview' : 'import_commit', status: 'queued', stage: 'queued',
      progress: null, created_at: timestamp, started_at: null, completed_at: null,
      context: { store_id: record.batch.store_id, import_id: record.batch.import_id }, result: null, error: null,
      poll_after_ms: 2000, unsupportedFields: [],
    }
    jobs.set(jobId, { job, polls: 0, fixture: record })
    update(record, { status: phase === 'preview' ? 'previewing' : 'committing',
      import_revision: revision(), active_job_id: jobId, allowed_actions: [], completion_available: false })
    const common = { import_id: record.batch.import_id, job_id: jobId, job_status: 'queued' as const,
      import_revision: record.batch.import_revision, poll_after_ms: 2000, unsupportedFields: [] }
    if (phase === 'preview') return { ...common, status: 'previewing', phase: 'preview' }
    record.commitId = id()
    return { ...common, status: 'committing', phase: 'commit', commit_id: record.commitId,
      preview_id: record.preview!.preview.summary.preview_id, effective_plan_digest: digest }
  }
  async function resolve(importId: string, mappingId: string, intent: { key: string; mappingRevision: string; targetField?: string; resolution?: MappingResolution }) {
    const record = await fixture(importId)
    const scope = `mapping:${importId}:${mappingId}:${intent.key}`
    const old = replay<Awaited<ReturnType<ImportFlowDataSource['confirm']>>>(scope, intent)
    if (old) return old
    if (mappingId !== record.mappingId) fail(404, 'RESOURCE_NOT_FOUND')
    if (intent.mappingRevision !== record.mappingRevision) fail(412, 'MAPPING_REVISION_CONFLICT')
    if (intent.targetField) record.targetField = intent.targetField
    const batchOnly = intent.resolution?.kind === 'shared_value' && intent.resolution.scope === 'IMPORT_VALUE' && intent.resolution.replace_source_column_index == null
    record.ownerRequired ||= !batchOnly
    record.mappingResolved = true
    record.mappingRevision = revision()
    record.proposalRevision = revision()
    record.lifecycleRevision = revision()
    record.preview = null
    update(record, { status: 'review_required', import_revision: revision(), preview: null,
      review_confirmation: null, confirmation_usable: false, allowed_actions: ['mapping.read', 'mapping.propose', ...(!record.ownerRequired ? ['preview'] : [])] })
    const result = { mapping_id: mappingId, status: 'resolved', mapping_revision: record.mappingRevision,
      progress: progress(record), sheets: [sheet(record)], proposal_revision: record.proposalRevision,
      approval_required: record.ownerRequired, unsupportedFields: [] }
    retain(scope, intent, result)
    return result
  }

  const source: ImportFlowDataSource = {
    async summary(importId) { return summary(await fixture(importId)) },
    async queue(importId, query = {}) {
      const record = await fixture(importId)
      const row = issue(record)
      const selected = (query.review_only !== false && row.status === 'auto_mapped' ? [] : [row])
        .filter((item) => !query.sheet_id || item.sheet_id === query.sheet_id)
        .filter((item) => !query.status || item.status === query.status)
      if (query.cursor) fail(422, 'INVALID_CURSOR')
      return { items: selected, counts: progress(record),
        pagination: { limit: 50, next_cursor: null, total_count: selected.length }, unsupportedFields: [] }
    },
    async options(importId, sheetId) {
      const record = await fixture(importId)
      if (sheetId !== record.sheetId) fail(404, 'RESOURCE_NOT_FOUND')
      const field = { key: 'on_hand', type: 'decimal', requiredness: 'required' as const, unit_semantics: 'ingredient base unit',
        support: 'supported' as const, available: true, reason_code: null, label: 'Số lượng thực đếm', description: '',
        aliases: [], conditional_requirements: [], nullable: false, input_sources: ['excel' as const],
        allowed_shared_scopes: [], input_help: '', value_role: 'canonical_candidate' as const, unsupportedFields: [] }
      return { schema: 'inventory_count', schema_version: 'import_schema/1', schema_context_id: record.sheetId,
        mapping_revision: record.mappingRevision, duplicate_mapping_allowed: false, options: [field],
        schemas: [{ schema_id: 'inventory_count', label: 'Kiểm kê', description: 'Synthetic fixture', supported: true, fields: [field] }],
        unsupportedFields: [] }
    },
    confirm: resolve,
    resolve,
    async decideProfile(storeId, profileId, intent) {
      const record = [...fixtures.values()].find((entry) => entry.profileId === profileId && entry.batch.store_id === storeId)
      if (!record) fail(404, 'RESOURCE_NOT_FOUND')
      const scope = `decision:${profileId}:${intent.key}`
      const old = replay<Awaited<ReturnType<ImportFlowDataSource['decideProfile']>>>(scope, intent)
      if (old) return old
      if (intent.lifecycleRevision !== record.lifecycleRevision) fail(412, 'PROFILE_REVISION_CONFLICT')
      const approved = intent.decision.decision === 'approve_activate'
      record.ownerRequired = !approved
      record.lifecycleRevision = revision()
      record.mappingRevision = revision()
      update(record, { import_revision: revision(), allowed_actions: ['mapping.read', 'mapping.propose', ...(approved ? ['preview'] : [])] })
      const result = { profile_id: profileId, approved_version: approved ? 'mock-approved/1' : null,
        active_version: approved ? 'mock-approved/1' : null, lifecycle_revision: record.lifecycleRevision,
        decision_id: id(), decided_at: timestamp, audit_id: id(), submission: null,
        notification_delivery: { status: 'not_required' as const, event_id: null }, unsupportedFields: [] }
      retain(scope, intent, result)
      return result
    },
    async preview(importId, intent) {
      const record = await fixture(importId)
      const scope = `preview:${importId}:${intent.key}`
      const old = replay<ProcessReceipt>(scope, intent)
      if (old) return old
      if (intent.importRevision !== record.batch.import_revision) fail(412, 'IMPORT_REVISION_CONFLICT')
      if (intent.mappingRevision !== record.mappingRevision) fail(412, 'MAPPING_REVISION_CONFLICT')
      if (record.ownerRequired) fail(409, 'OWNER_MAPPING_APPROVAL_REQUIRED')
      if (!record.batch.allowed_actions.includes('preview')) fail(409, 'IMPORT_STATE_CONFLICT')
      update(record, { review_confirmation: null, confirmation_usable: false })
      const receipt = accept(record, 'preview')
      retain(scope, intent, receipt)
      return receipt
    },
    async readPreview(importId, query = {}) {
      const record = await fixture(importId)
      if (!record.preview || (query.previewId && record.preview.preview.summary.preview_id !== query.previewId)) fail(409, 'PREVIEW_NOT_AVAILABLE')
      const current = record.preview!
      let offset = 0
      const prefix = `mock-preview:${current.preview.summary.preview_id}:${current.preview.summary.digest}:`
      if (query.rowsCursor) {
        if (!query.rowsCursor.startsWith(prefix)) fail(422, 'INVALID_CURSOR')
        offset = Number(query.rowsCursor.slice(prefix.length))
        if (!Number.isSafeInteger(offset) || offset <= 0 || offset >= current.preview.rows.length) fail(422, 'INVALID_CURSOR')
      }
      const rows = current.preview.rows.filter((row) => !query.classification || row.classification === query.classification)
      return { ...structuredClone(current), import_revision: record.batch.import_revision,
        allowed_actions: record.batch.allowed_actions, review_confirmation: record.batch.review_confirmation as ReviewConfirmation | null,
        confirmation_usable: record.batch.confirmation_usable, preview: { ...current.preview,
          summary: { ...structuredClone(current.preview.summary), can_commit: record.batch.allowed_actions.includes('commit') },
          stale: false, rows: structuredClone(rows.slice(offset, offset + pageSize)),
          rows_page: { limit: pageSize, next_cursor: offset + pageSize < rows.length ? `${prefix}${offset + pageSize}` : null, total_count: rows.length },
        } }
    },
    async confirmReview(importId, intent) {
      const record = await fixture(importId)
      const scope = `confirm_review:${importId}:${intent.key}`
      const old = replay<Awaited<ReturnType<ImportFlowDataSource['confirmReview']>>>(scope, intent)
      if (old) return old
      if (intent.importRevision !== record.batch.import_revision) fail(412, 'IMPORT_REVISION_CONFLICT')
      if (!record.preview || record.preview.preview.summary.preview_id !== intent.previewId ||
        record.preview.preview.summary.digest !== intent.previewDigest || record.mappingRevision !== intent.mappingRevision) fail(409, 'PREVIEW_STALE')
      if (!intent.reason.trim()) fail(422, 'INVALID_IMPORT_CONFIGURATION')
      const confirmation: ReviewConfirmation = { version: 'import_review/1', confirmation_id: id(), import_id: importId,
        preview_id: intent.previewId, preview_digest: intent.previewDigest, file_set_version: record.batch.file_set_version,
        source_digest: record.batch.source_set.digest, mapping_revision: record.mappingRevision,
        binding_digest: digest, reviewed_import_revision: intent.importRevision, read_set_digest: digest,
        confirmed_by: record.batch.store_id, confirmed_at: timestamp, reason: intent.reason, content_digest: digest }
      update(record, { import_revision: revision(), review_confirmation: confirmation, confirmation_usable: true,
        allowed_actions: ['preview', 'commit'] })
      const result = { phase: 'confirm_review' as const, import_revision: record.batch.import_revision,
        confirmation, canonical_commit_supported: true, unsupportedFields: [] }
      retain(scope, intent, result)
      return result
    },
    async commit(importId, intent) {
      const record = await fixture(importId)
      const scope = `commit:${importId}:${intent.key}`
      const old = replay<ProcessReceipt>(scope, intent)
      if (old) return old
      if (intent.importRevision !== record.batch.import_revision) fail(412, 'IMPORT_REVISION_CONFLICT')
      if (!record.preview || intent.previewId !== record.preview.preview.summary.preview_id || intent.previewDigest !== record.preview.preview.summary.digest) fail(409, 'PREVIEW_STALE')
      if (!record.batch.confirmation_usable) fail(409, 'PREVIEW_BLOCKED')
      const requiredHistory=record.preview.preview.rows.filter(r=>r.proposed_action==='CORRECT_HISTORY_RECORD'),history=intent.historyCorrections??[]
      if(history.length!==requiredHistory.length||new Set(history.map(h=>h.row_id)).size!==history.length||requiredHistory.some(r=>!history.some(h=>h.row_id===r.row_id&&h.expected_version===r.expected_version&&h.reason.trim()))) fail(409,'HISTORY_CORRECTION_UNRESOLVED')
      if (!intent.reason?.trim() || intent.resolutions.length || intent.supplierChanges?.length) fail(422, 'INVALID_IMPORT_CONFIGURATION')
      if (!record.batch.allowed_actions.includes('commit')) fail(409, 'IMPORT_STATE_CONFLICT')
      const receipt = accept(record, 'commit')
      retain(scope, intent, receipt)
      return receipt
    },
    async job(jobId) {
      const entry = jobs.get(jobId)
      if (!entry) {
        const original = batches.findContinuationJob(jobId)
        if (!original) fail(404, 'RESOURCE_NOT_FOUND')
        const record = await fixture(original.import_id)
        update(record, { status: 'review_required', active_job_id: null, allowed_actions: ['mapping.read', 'mapping.propose', 'preview'] })
        return { job_id: jobId, operation: 'import_analyze', status: 'completed', stage: 'completed', progress: 1,
          created_at: timestamp, started_at: timestamp, completed_at: timestamp,
          context: { store_id: record.batch.store_id, import_id: record.batch.import_id },
          result: { resource_type: 'import_analysis', resource_id: record.batch.import_id, analysis_id: record.analysisId },
          error: null, poll_after_ms: 0, unsupportedFields: [] }
      }
      if (entry.job.status === 'completed') return structuredClone(entry.job)
      entry.polls++
      if (entry.polls === 1) {
        entry.job = { ...entry.job, status: 'running', stage: entry.job.operation === 'import_preview' ? 'validating' : 'committing', started_at: timestamp, progress: null }
        return structuredClone(entry.job)
      }
      const record = entry.fixture
      if (entry.job.operation === 'import_preview') {
        const previewId = id(), rows = previewRows(record)
        update(record, { status: 'preview_ready', active_job_id: null, import_revision: revision(), allowed_actions: ['preview'] })
        record.preview = { import_id: record.batch.import_id, store_id: record.batch.store_id, import_revision: record.batch.import_revision,
          file_set_version: record.batch.file_set_version, source_set: record.batch.source_set,
          status: 'preview_ready', allowed_actions: record.batch.allowed_actions, completion_available: false,
          review_confirmation: null, confirmation_usable: false,
          preview: { mapping_revision: record.mappingRevision, read_set_digest: digest, source_evidence_digest: digest,
            summary: { preview_id: previewId, digest, created_at: timestamp, source_set_version: record.batch.source_set.version,
            mapping_bindings: summary(record).binding_refs, policy_version: 'import_mapping_policy/1', mode: 'atomic',
            validation_status: 'confirmation_required', can_commit: false, required_actions: ['inventory.count.correct'],
            groups: [{ canonical_domain: 'inventory_count', required_write_action: 'inventory.count.correct', row_count: 2,
              planned_insert_count: 0, planned_update_count: 2, no_op_count: 0, blocked_count: 0 }],
            counts, blockers: [], warnings: [], confirmed_resolutions_version: null },
            stale: false, rows, rows_page: { limit: pageSize, next_cursor: null, total_count: rows.length } }, unsupportedFields: [] }
        update(record, { preview: { summary: record.preview.preview.summary }, completion_available: false })
        entry.job.result = { resource_type: 'import_preview', resource_id: record.batch.import_id, preview_id: previewId }
      } else {
        const preview = record.preview!, commitId = record.commitId!
        update(record, { status: 'completed', active_job_id: null, import_revision: revision(), allowed_actions: [], completion_available: true })
        record.completion = { import_id: record.batch.import_id, data_date: record.batch.data_date, status: 'completed', outcome: 'committed', mode: 'atomic',
          completed_at: timestamp, commit_id: commitId, preview_id: preview.preview.summary.preview_id,
          effective_plan_digest: digest, mapping_bindings: summary(record).binding_refs,
          summary: { files: record.batch.file_count, sheets: record.batch.file_count, rows: 2, mapped_fields: 3, errors: 0, warnings: 0,
            counts, inserted_record_count: 0, changed_record_count: 2, no_op_count: 0 },
          updated_resources: {
            inventory: { updated: true, affected_ingredient_count: 2, changed_record_count: 2 },
            menu: { updated: false, affected_product_count: 0, changed_record_count: 0 },
            sales: { updated: false, added_record_count: 0, changed_record_count: 0 }, catalog: { created_product_count: 0, created_ingredient_count: 0 },
          }, readiness: { evaluated_at: timestamp, as_of_date: record.batch.data_date, data_version: revision(),
            actions: [{ action: 'inventory', availability: 'ready', can_execute: true, data_status: 'valid', execution_status: 'available',
              blockers: [], warnings: [], result_assessment: 'NOT_ASSESSED' }], evaluated_actions: ['inventory'], omitted_actions: [] },
          audit_reference: id(), canonical_references: [], unsupportedFields: [] }
        entry.job.result = { resource_type: 'import_completion', resource_id: record.batch.import_id, commit_id: commitId }
      }
      entry.job = { ...entry.job, status: 'completed', stage: 'completed', completed_at: timestamp, progress: 1, poll_after_ms: 0 }
      return structuredClone(entry.job)
    },
    async completion(importId) {
      const record = await fixture(importId)
      if (!record.completion || !record.batch.completion_available) fail(409, 'IMPORT_NOT_COMPLETED')
      return structuredClone(record.completion)
    },
  }
  // Simulates a separate Owner actor only in the explicitly selected DEV source.
  // No Staff control calls N5; this gateway is absent from the HTTP data source.
  const reviews = new Map<string, { state: OwnerReviewState; polls: number; rejectedOnce: boolean }>()
  const ownerReview: DevOwnerReviewGateway = {
    async submit(importId, proposalRevision) {
      const record = await fixture(importId)
      if (!record.ownerRequired || !record.mappingResolved || record.proposalRevision !== proposalRevision) fail(412, 'PROFILE_REVISION_CONFLICT')
      const old = reviews.get(importId)
      if (old?.state.status === 'rejected' && old.state.proposalRevision === proposalRevision) fail(409, 'REJECTED_PROPOSAL_REQUIRES_EDIT')
      if (old?.state.status === 'waiting' && old.state.proposalRevision === proposalRevision) return structuredClone(old.state)
      const entry = { state: { status: 'waiting', proposalRevision } as OwnerReviewState, polls: 0, rejectedOnce: old?.rejectedOnce ?? false }
      reviews.set(importId, entry)
      return structuredClone(entry.state)
    },
    async read(importId) {
      const entry = reviews.get(importId)
      if (!entry) return { status: 'idle' }
      if (entry.state.status !== 'waiting' || ++entry.polls < 2) return structuredClone(entry.state)
      const record = await fixture(importId)
      if (record.proposalRevision !== entry.state.proposalRevision) fail(412, 'PROFILE_REVISION_CONFLICT')
      const reject = options.rejectOwnerReview === true && !entry.rejectedOnce
      await source.decideProfile(record.batch.store_id, record.profileId, {
        key: id(), lifecycleRevision: record.lifecycleRevision,
        decision: reject ? { decision: 'reject', proposal_revision: record.proposalRevision, reason: 'DEV Owner: kiểm tra lại cách hiểu cột nguồn.' } :
          { decision: 'approve_activate', proposal_revision: record.proposalRevision, expected_active_version: null, reason: 'DEV Owner reviewed synthetic full spec.' },
      })
      entry.state = reject ? { status: 'rejected', proposalRevision: record.proposalRevision, reason: 'Kiểm tra lại cách hiểu cột nguồn trước khi gửi lại.' } :
        { status: 'approved', proposalRevision: record.proposalRevision }
      entry.rejectedOnce ||= reject
      return structuredClone(entry.state)
    },
  }
  return Object.assign(source, { ownerReview })

}
