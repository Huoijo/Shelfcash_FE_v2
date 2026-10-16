import { importDomainBlockers } from './importDomainReview'
import type { MappingIssue } from './importFlow.types'
import type { ImportBatchState } from './importData.workflow'
import type { ImportFlowState } from './importFlow.workflow'
import { HttpError } from '../../shared/http/httpClient'

export type ImportRole = 'OWNER' | 'STAFF'
export type ImportScreen = 'upload' | 'analyze' | 'resolve' | 'profile' | 'preview' | 'review' | 'commit' | 'complete'
export type ImportFault = { kind: 'permission' | 'profile' | 'stale' | 'conflict' | 'system'; code: string | null }
export function importFault(error: unknown): ImportFault {
  const code = error instanceof HttpError ? error.problem?.code ?? null : null
  const status = error instanceof HttpError ? error.status : undefined
  return { code, kind: status === 401 || status === 403 || /(?:PERMISSION|AUTHORIZATION).*(?:REVOKED|DENIED|REQUIRED)|FORBIDDEN/.test(code ?? '') ? 'permission' : /PROFILE.*(RETIRED|INACTIVE)|MAPPING_VERSION_RETIRED/.test(code ?? '') ? 'profile' :
    /PREVIEW.*(STALE|EXPIRED)|STALE_PREVIEW/.test(code ?? '') ? 'stale' : status === 409 || status === 412 ? 'conflict' : 'system' }
}

/** Presentation only. Canonical batch, grants, revisions and intent remain in the workflows. */
export function importScreen(batch: ImportBatchState, flow: ImportFlowState, resolveImportId: string | null): ImportScreen {
  if (flow.completion || batch.batch?.completion_available) return 'complete'
  if (batch.batch?.status === 'committing' || flow.job?.operation === 'import_commit' && ['queued', 'running'].includes(flow.job.status) || flow.retryOperation === 'commit') return 'commit'
  if (flow.tab === 'result') return 'complete'
  if (flow.tab === 'review') return 'review'
  if (flow.tab === 'preview' || batch.batch?.status === 'previewing' || batch.batch?.status === 'preview_ready' && !flow.summary) return 'preview'
  if (batch.sealedLocked && !flow.preview && resolveImportId !== batch.batch?.import_id) return 'analyze'
  if (batch.sealedLocked) return flow.tab === 'profile' ? 'profile' : 'resolve'
  return 'upload'
}

export function experienceStep(role: ImportRole, screen: ImportScreen): number {
  if (screen === 'upload') return 1
  if (screen === 'analyze') return 2
  if (screen === 'resolve') return 3
  if (screen === 'complete') return 6
  if (role === 'OWNER') return screen === 'profile' ? 4 : 5
  return screen === 'preview' ? 4 : screen === 'profile' ? 3 : 5
}

export function previewCanContinue(state: ImportFlowState): boolean {
  const p = state.preview
  return !importDomainBlockers(p, state.resolutions, state.supplierChanges, state.historyCorrections).length && !!p && !state.previewStale && !p.preview.stale && p.preview.summary.validation_status !== 'blocked' &&
    !p.preview.summary.blockers.length && !p.unsupportedFields.length && !p.preview.rows.some(row => row.unsupportedFields.length) &&
    !p.preview.rows_page.next_cursor && (p.preview.rows_page.total_count === null || p.preview.rows.length === p.preview.rows_page.total_count) &&
    state.batch?.status === 'preview_ready' && !state.batch.active_job_id
}

export type OwnerReviewState =
  | { status: 'idle' }
  | { status: 'waiting'; proposalRevision: string }
  | { status: 'approved'; proposalRevision: string }
  | { status: 'rejected'; proposalRevision: string; reason: string }
/** Temporary adapter, injected only by DEV mock source. No runtime endpoint implied. */
export type DevOwnerReviewGateway = {
  submit(importId: string, proposalRevision: string): Promise<OwnerReviewState>
  read(importId: string): Promise<OwnerReviewState>
}

export type ResolutionGroup = 'structure' | 'identity' | 'facts' | 'units'
export function resolutionGroup(issue: MappingIssue): ResolutionGroup {
  if (issue.issue_type === 'identity') return 'identity'
  if (issue.issue_type === 'conversion') return 'units'
  if (issue.resolution?.resolution.kind === 'shared_value' || /DECLARATION|SHARED_VALUE|BATCH_FACT|RECIPE_BASIS/.test(issue.code)) return 'facts'
  return 'structure'
}

export type AnalyzeAssessment = 'queued' | 'running' | 'failed' | 'source_required' | 'profile_ambiguous' | 'profile_drift' | 'profile_retired' | 'provider_unavailable' | 'no_profile' | 'complete'
export function analyzeAssessment(state: ImportBatchState, flow: ImportFlowState): AnalyzeAssessment {
  if (state.batch?.status === 'failed') return 'failed'
  if (state.processing || state.batch?.status === 'analyzing' || state.batch?.active_job_id) return flow.job?.status === 'queued' ? 'queued' : 'running'
  const codes = [...(flow.summary?.blockers ?? []), ...(flow.summary?.warnings ?? []), ...(flow.queue?.items.filter(issue => !['resolved', 'auto_mapped'].includes(issue.status)) ?? [])].map(item => item.code)
  if (codes.includes('PROFILE_MATCH_AMBIGUOUS')) return 'profile_ambiguous'
  if (codes.some(code => ['SOURCE_CONTEXT_REQUIRED', 'SOURCE_CONTEXT_CONFLICT', 'SOURCE_IDENTITY_CONFLICT'].includes(code))) return 'source_required'
  if (codes.includes('PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT')) return 'profile_drift'
  if (codes.includes('MAPPING_VERSION_RETIRED')) return 'profile_retired'
  if (flow.summary?.sheets.some(sheet => ['unavailable', 'invalid'].includes(sheet.suggestion_diagnostic?.status ?? ''))) return 'provider_unavailable'
  if (flow.summary && !flow.summary.binding_refs.length) return 'no_profile'
  return 'complete'
}
