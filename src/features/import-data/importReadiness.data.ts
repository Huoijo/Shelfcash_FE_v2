import { HttpError, requestJson } from '../../shared/http/httpClient'
import { shiftPlanningDate } from '../decision-planning/planning.validation'
import { isImportBusinessDate, isImportUuid } from './importData.validation'
import { matchesImportWire, type WireEnvelope_Readiness_, type WireReadiness } from './importFlow.wire'

/** Import uses the 016 R01 slice without changing unrelated Planning writers. */
export async function readImportReadiness(baseUrl: string, storeId: string, date: string, signal: AbortSignal): Promise<WireReadiness> {
  if (!isImportUuid(storeId) || !isImportBusinessDate(date)) throw new Error('Cần cửa hàng và ngày đánh giá hợp lệ.')
  const query = new URLSearchParams({ actions: 'planning', forecast_start_date: date })
  const response = await requestJson<unknown>(baseUrl, `/api/v1/stores/${storeId}/readiness?${query}`, { signal })
  if (!matchesImportWire('Envelope_Readiness_', response)) throw new HttpError('protocol', 'Phản hồi Readiness không đúng contract hiện hành.')
  const value = response as unknown as WireEnvelope_Readiness_
  const data = value.data
  if (data.store_id !== storeId || data.evaluated_forecast_start_date !== date || data.cutoff_date !== shiftPlanningDate(date, -1) ||
    data.planning_assessment && (data.planning_assessment.input_scope !== 'DEFAULT_CONFIGURATION' || data.planning_assessment.requirements_mode !== 'default') ||
    data.actions.length !== 1 || data.actions[0].action !== 'planning' || data.actions.some(action =>
      action.can_execute !== (action.availability === 'ready') || action.can_execute &&
      (action.data_status !== 'valid' || action.execution_status !== 'available' || action.blockers.length > 0))) {
    throw new HttpError('protocol', 'Readiness không khớp cửa hàng, ngày hoặc quyền thực thi.', undefined, undefined, value.meta.request_id)
  }
  return data
}
