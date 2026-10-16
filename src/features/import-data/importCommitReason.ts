import type { PreviewBundle } from './importFlow.types'
const consequentialActions = new Set(['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES', 'COUNT_CORRECTION', 'CORRECT_HISTORY_RECORD', 'AMEND_TERM_PERIOD', 'AMEND_FEE_PERIOD'])
/** Whole pinned Preview, including effect aggregates; never infer optionality from only the loaded page. */
export function commitReasonRequired(bundle: PreviewBundle): boolean {
  if (bundle.preview.rows_page.next_cursor || bundle.preview.rows_page.total_count !== null && bundle.preview.rows.length !== bundle.preview.rows_page.total_count) return true
  if (bundle.preview.rows.some(row => consequentialActions.has(row.proposed_action))) return true
  // Unknown/update actions remain conservative; only pure insert/NO_OP is reason-optional.
  return bundle.preview.summary.groups.some(group => group.planned_update_count > 0)
}
