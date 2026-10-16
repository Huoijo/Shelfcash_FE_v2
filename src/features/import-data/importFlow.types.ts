import type { Pagination } from '../../shared/http/http.types'
import type { ImportBatchStatus } from './importData.types'
import type {
  WireApprove, WireBindingRef, WireCompletionActionReadiness, WireCompletionReadinessIssue,
  WireConfirmationResult, WireConfigurations, WireDecisionResult, WireFieldOption, WireFileView,
  WireImportCompletion, WireInspectedProfile, WireJobContext, WireJobView,
  WireMappingIssue, WireMappingList, WireMappingSummary, WireMappingUpdated, WireNotice, WirePreviewPage, WireSourceEffectRow,
  WirePreviewRow, WirePreviewSummary, WireProfileProposal, WireProfileSpec,
  WireProgress, WireReject, WireResolveRequest_Input, WireRetire, WireReviewConfirmation,
  WireSchemaDescriptor, WireSheetInfo, WireSourceSet,
} from './importFlow.wire'

export type HistoryCorrection = { row_id: string; expected_version: string; reason: string }

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export type FlowDiagnostic = WireNotice
export type MappingStatus = WireMappingIssue['status']
export type MappingProgress = WireProgress
export type MappingSchema = NonNullable<WireSheetInfo['selected_type']>
export type MappingSheet = WireSheetInfo
export type MappingFile = WireFileView
export type MappingBindingRef = WireBindingRef
export type MappingProfileSpec = WireProfileSpec
export type MappingProfileProposal = WireProfileProposal
export type ApprovedProfile = WireInspectedProfile
export type MappingSummary = Omit<WireMappingSummary, 'approved_profiles' | 'approved_contexts' | 'warnings'> & {
  approved_profiles: ApprovedProfile[]
  approved_contexts: NonNullable<WireMappingSummary['approved_contexts']>
  warnings: FlowDiagnostic[]
  unsupportedFields: string[]
}
export type MappingIssue = Omit<WireMappingIssue, 'samples'> & { samples: string[]; unsupportedFields: string[] }
export type MappingQueueQuery = {
  sheet_id?: string
  review_only?: boolean
  status?: MappingStatus
  include_details?: boolean
  limit?: number
  cursor?: string
}
export type MappingQueue = Pick<WireMappingList, 'mapping_revision' | 'counters' | 'counter_scope'> & {
  items: MappingIssue[]
  counts: MappingProgress
  pagination: Pagination
  unsupportedFields: string[]
}
export type MappingOption = WireFieldOption & { unsupportedFields: string[] }
export type MappingSchemaDescriptor = WireSchemaDescriptor
export type MappingOptions = {
  schema: MappingSchema | null
  schema_version: string
  schema_context_id: string
  mapping_revision: string
  duplicate_mapping_allowed: false
  options: MappingOption[]
  schemas: MappingSchemaDescriptor[]
  unsupportedFields: string[]
}
type ExplicitResolution<T> = T extends { kind?: infer Kind } ? Omit<T, 'kind'> & { kind: NonNullable<Kind> } : never
export type MappingResolution = ExplicitResolution<WireResolveRequest_Input['resolution']>
export type MappingIntent = { key: string; mappingRevision: string; targetField: string }
export type ResolutionIntent = { key: string; mappingRevision: string; resolution: MappingResolution }
export type MappingResolutionIntent = ResolutionIntent
export type MappingConfirmation = WireMappingUpdated & { unsupportedFields: string[] }
export type ProfileDecisionRequest = WireApprove | WireReject | WireRetire
export type ProfileDecisionIntent = { key: string; lifecycleRevision: string; decision: ProfileDecisionRequest }
export type ProfileDecisionReceipt = WireDecisionResult
export type PreviewIntent = { key: string; importRevision: string; mappingRevision: string }
export type ReviewConfirmation = WireReviewConfirmation
export type ReviewIntent = {
  key: string
  importRevision: string
  previewId: string
  previewDigest: string
  mappingRevision: string
  reason: string
}
export type ReviewConfirmationIntent = ReviewIntent
export type ReviewConfirmationReceipt = WireConfirmationResult & { phase: 'confirm_review'; canonical_commit_supported: boolean }
export type SalesResolution = {
  row_id: string
  action: 'replace_daily_total' | 'confirm_disjoint_merge'
  report_business_key: string
  evidence_reference: string
  reason: string
  disjoint_assertion: boolean | null
}
export type SupplierConfirmation = { action_id: string; reason: string }
export type SupplierChangeConfirmation = SupplierConfirmation
export type CommitIntent = {
  key: string
  importRevision: string
  previewId: string
  previewDigest: string
  reason: string | null
  resolutions: SalesResolution[]
  supplierChanges?: SupplierConfirmation[]
  historyCorrections?: HistoryCorrection[]
}
export type ProcessReceipt = {
  import_id: string
  status: 'previewing' | 'committing'
  phase: 'preview' | 'commit'
  job_id: string
  job_status: 'queued'
  import_revision: string
  commit_id?: string
  preview_id?: string
  effective_plan_digest?: string
  poll_after_ms: number | null
  unsupportedFields: string[]
}
export type PreviewClassification = WirePreviewRow['classification']
export type PreviewAction = string
export type PreviewSummary = Omit<WirePreviewSummary, 'confirmed_resolutions_version'> & { confirmed_resolutions_version: string | null }
export type PreviewDomainValue = NonNullable<WirePreviewRow['after']>
export type PreviewRow = Omit<WirePreviewRow, 'changes' | 'blockers' | 'warnings' | 'confirmation_required'> & Partial<Pick<WireSourceEffectRow, 'source_cells' | 'planned_effect' | 'source_evidence_availability' | 'source_cells_truncated'>> & {
  changes: NonNullable<WirePreviewRow['changes']>
  blockers: FlowDiagnostic[]
  warnings: FlowDiagnostic[]
  confirmation_required: boolean
  unsupportedFields: string[]
}
export type PreviewReadQuery = { previewId?: string; rowsCursor?: string; classification?: PreviewClassification }
export type PreviewBundle = {
  import_id: string
  store_id: string
  import_revision: string
  file_set_version: string
  source_set: WireSourceSet
  status: ImportBatchStatus
  allowed_actions: string[]
  completion_available: boolean
  review_confirmation: ReviewConfirmation | null
  confirmation_usable: boolean
  configurations?: WireConfigurations | null
  preview: Pick<WirePreviewPage, 'mapping_revision' | 'read_set_digest' | 'source_evidence_digest' | 'aggregates'> & { summary: PreviewSummary; rows: PreviewRow[]; rows_page: Pagination; stale: boolean }
  unsupportedFields: string[]
}
export type ImportJob = Omit<WireJobView, 'operation' | 'stage' | 'context' | 'result'> & {
  operation: 'import_analyze' | 'import_preview' | 'import_commit'
  stage: Exclude<WireJobView['stage'], 'rendering'>
  context: WireJobContext
  result: null | { resource_type: 'import_analysis' | 'import_preview' | 'import_completion'; resource_id: string; analysis_id?: string; preview_id?: string; commit_id?: string }
  poll_after_ms: number
  unsupportedFields: string[]
}
export type ReadinessIssue = WireCompletionReadinessIssue
export type ActionReadiness = Required<WireCompletionActionReadiness>
export type ImportCompletion = Omit<WireImportCompletion, 'mode' | 'summary' | 'readiness'> & {
  mode: 'atomic'
  summary: WireImportCompletion['summary'] & { errors: 0 }
  readiness: Omit<WireImportCompletion['readiness'], 'actions'> & { actions: ActionReadiness[] }
  unsupportedFields: string[]
}
export type ImportFlowDataSource = {
  summary(importId: string, signal?: AbortSignal): Promise<MappingSummary>
  queue(importId: string, query: MappingQueueQuery, signal?: AbortSignal): Promise<MappingQueue>
  options(importId: string, sheetId: string, mappingId?: string, signal?: AbortSignal): Promise<MappingOptions>
  confirm(importId: string, mappingId: string, intent: MappingIntent, signal?: AbortSignal): Promise<MappingConfirmation>
  resolve(importId: string, mappingId: string, intent: ResolutionIntent, signal?: AbortSignal): Promise<MappingConfirmation>
  decideProfile(storeId: string, profileId: string, intent: ProfileDecisionIntent, signal?: AbortSignal): Promise<ProfileDecisionReceipt>
  preview(importId: string, intent: PreviewIntent): Promise<ProcessReceipt>
  readPreview(importId: string, query: PreviewReadQuery, signal?: AbortSignal): Promise<PreviewBundle>
  confirmReview(importId: string, intent: ReviewIntent): Promise<ReviewConfirmationReceipt>
  commit(importId: string, intent: CommitIntent): Promise<ProcessReceipt>
  job(jobId: string, signal?: AbortSignal): Promise<ImportJob>
  completion(importId: string, signal?: AbortSignal): Promise<ImportCompletion>
}
export type ImportFlowDataSourceOptions = {
  dataSource: 'api' | 'mock'
  apiBaseUrl: string
  mockSource?: ImportFlowDataSource
}
