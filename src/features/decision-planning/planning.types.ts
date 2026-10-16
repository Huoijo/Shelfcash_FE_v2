import type {
  WireAccepted, WireActionReadiness, WireContext, WireEnvelope_Context_, WireEnvelope_Readiness_, WireExactQuantity, WireExplanation,
  WireExplanationEnvelope, WireIngredientDetail, WireIngredientNavigator,
  WireInspectionEnvelope_IngredientDetail_, WireInspectionEnvelope_IngredientNavigator_,
  WireOption, WirePlanningEnvelope_Accepted_, WirePlanningEnvelope_RunView_,
  WirePlanningNotification, WirePlanningRequest_Input, WirePlanningResult, WireRunView,
  WireReadiness, WireStoredRequirements, WireStrategyResult,
} from './planning.wire'

export type PlanningContext = WireContext
export type PlanningReadiness = WireReadiness
export type PlanningActionReadiness = WireActionReadiness
export type PlanningRequest = WirePlanningRequest_Input
export type PlanningIntent = { key: string; request: PlanningRequest }
export type PlanningAccepted = WireAccepted
export type PlanningRun = WireRunView
export type PlanningResult = WirePlanningResult
export type PlanningOption = WireOption
export type PlanningStrategy = WireStrategyResult['strategy']
export type PlanningPath = WireStrategyResult['construction_path']
export type PlanningNotification = WirePlanningNotification
export type PlanningQuantity = WireExactQuantity
export type PlanningRequirements = WireStoredRequirements
export type PlanningReasons = WireExplanation
export type PlanningIngredients = WireIngredientNavigator
export type PlanningIngredient = WireIngredientDetail
export type PlanningContextResponse = WireEnvelope_Context_
export type PlanningReadinessResponse = WireEnvelope_Readiness_
export type PlanningAcceptedResponse = WirePlanningEnvelope_Accepted_
export type PlanningRunResponse = WirePlanningEnvelope_RunView_
export type PlanningIngredientsResponse = WireInspectionEnvelope_IngredientNavigator_
export type PlanningIngredientResponse = WireInspectionEnvelope_IngredientDetail_
export type PlanningReasonsResponse = WireExplanationEnvelope

/** Retained projection endpoints only. Store IDs are guards, never read filters. */
export type PlanningDataSource = {
  context(storeId: string, signal?: AbortSignal): Promise<PlanningContextResponse>
  readiness(storeId: string, forecastStartDate: string, signal?: AbortSignal, request?: PlanningRequest): Promise<PlanningReadinessResponse>
  create(storeId: string, intent: PlanningIntent, signal?: AbortSignal): Promise<PlanningAcceptedResponse>
  read(storeId: string, runId: string, signal?: AbortSignal): Promise<PlanningRunResponse>
  ingredients(storeId: string, runId: string, query: { optionId?: string; cursor?: string }, signal?: AbortSignal): Promise<PlanningIngredientsResponse>
  ingredient(storeId: string, runId: string, ingredientId: string, optionId?: string, signal?: AbortSignal): Promise<PlanningIngredientResponse>
  reasons(storeId: string, runId: string, optionId?: string, signal?: AbortSignal): Promise<PlanningReasonsResponse>
}

export type PlanningDataSourceOptions = {
  dataSource: 'api' | 'mock'
  apiBaseUrl: string
  mockSource?: PlanningDataSource
}
