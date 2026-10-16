import type { MappingOptions, MappingSummary } from './importFlow.types'

export type ClassificationDraft = {
  scope: string
  sheetType: string
  reason: string
  acknowledged: boolean
}
export const classificationDraftScope = (summary: MappingSummary, sheetId: string | null) =>
  JSON.stringify([summary.import_id, summary.mapping_revision, sheetId])

/** Presentation draft only. Catalogue fields are BE-owned, not per-column write authorization. */
export function classificationDraftOptions(summary: MappingSummary, sheetId: string | null, draft: ClassificationDraft | null, current?: MappingOptions) {
  const sheet = summary.sheets.find(item => item.sheet_id === sheetId)
  const active = draft?.scope === classificationDraftScope(summary, sheetId) ? draft : null
  const pending = !!active && (active.sheetType === 'IGNORE'
    ? !sheet?.ignored
    : active.sheetType !== sheet?.selected_type || !!sheet?.ignored)
  if (!pending) return { pending: false, options: current }
  // Never show an old sheet/revision's targets while the catalogue is missing/stale.
  if (!current || current.schema_context_id !== sheetId || current.mapping_revision !== summary.mapping_revision || current.unsupportedFields.length) return { pending: true, options: undefined }
  const schema = current.schemas.find(item => item.schema_id === active!.sheetType)
  return {
    pending: true,
    options: {
      ...current,
      schema: schema?.schema_id ?? null,
      options: schema?.fields.map(field => ({ ...field, unsupportedFields: [] })) ?? [],
    } satisfies MappingOptions,
  }
}
