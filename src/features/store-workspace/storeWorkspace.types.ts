import type {
  WireBudgetRequest, WireBudgetCeiling, WireCreateInvitation, WireEnvelope_BudgetResult_,
  WireEnvelope_InvitationAction_, WireEnvelope_InvitationCreation_, WireEnvelope_InvitationList_,
  WireEnvelope_MembershipList_, WireEnvelope_PermissionUpdate_, WireGrantsRequest,
  WireInvitation, WirePermissionDescriptor, WireReissueInvitation, WireRevokeInvitation,
  WireStaffMembership,
} from './storeWorkspace.wire'
import type { PlanningContextResponse } from '../decision-planning/planning.types'

export type StaffMembership = WireStaffMembership
export type PermissionDescriptor = WirePermissionDescriptor
export type Invitation = WireInvitation
export type PermissionMutationRequest = WireGrantsRequest
export type PermissionMutationReceipt = WireEnvelope_PermissionUpdate_['data']
export type StaffInvitationCreateRequest = WireCreateInvitation
export type StaffInvitationActionRequest = WireReissueInvitation | WireRevokeInvitation
export type StoreBudget = WireBudgetCeiling
export type StoreBudgetRequest = WireBudgetRequest
export type MembershipsResponse = WireEnvelope_MembershipList_
export type PermissionsResponse = WireEnvelope_PermissionUpdate_
export type InvitationsResponse = WireEnvelope_InvitationList_
export type InvitationCreateResponse = WireEnvelope_InvitationCreation_
export type InvitationActionResponse = WireEnvelope_InvitationAction_
export type BudgetResponse = WireEnvelope_BudgetResult_
export type WorkspaceIntent<T> = { key: string; request: T }
export type WorkspaceCasIntent<T> = WorkspaceIntent<T> & { version: string }
export type BudgetIntent = WorkspaceIntent<StoreBudgetRequest> & {
  condition: { kind: 'create' } | { kind: 'replace'; version: string }
}
export type WorkspacePageQuery = { limit?: number; cursor?: string }
export type MembershipsQuery = WorkspacePageQuery & { active?: 'all' | 'true' | 'false' }
export type InvitationsQuery = WorkspacePageQuery & {
  statuses?: Invitation['status'][]
  email?: string
}

/** Owner roster only. No membership lifecycle, Store metadata or recipient token APIs. */
export type StoreWorkspaceDataSource = {
  memberships(storeId: string, query?: MembershipsQuery, signal?: AbortSignal): Promise<MembershipsResponse>
  replacePermissions(storeId: string, membershipId: string, intent: WorkspaceCasIntent<PermissionMutationRequest>, signal?: AbortSignal): Promise<PermissionsResponse>
  invitations(storeId: string, query?: InvitationsQuery, signal?: AbortSignal): Promise<InvitationsResponse>
  createInvitation(storeId: string, intent: WorkspaceIntent<StaffInvitationCreateRequest>, signal?: AbortSignal): Promise<InvitationCreateResponse>
  invitationAction(storeId: string, invitationId: string, intent: WorkspaceCasIntent<StaffInvitationActionRequest>, signal?: AbortSignal): Promise<InvitationActionResponse>
  planningContext(storeId: string, signal?: AbortSignal): Promise<PlanningContextResponse>
  updateBudget(storeId: string, intent: BudgetIntent, signal?: AbortSignal): Promise<BudgetResponse>
}
export type StoreWorkspaceDataSourceOptions = {
  dataSource: 'api' | 'mock'
  apiBaseUrl: string
  mockSource?: StoreWorkspaceDataSource
}
