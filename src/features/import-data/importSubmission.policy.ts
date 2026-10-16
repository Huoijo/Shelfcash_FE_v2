import type { WireMappingSubmission, WireStaffMembership } from '../backend-capabilities/capabilities.wire'

export function canRequestStaffChanges(owner: boolean, origin: WireStaffMembership | null, submission: WireMappingSubmission, currentUserId?: string): boolean {
  return owner && !!currentUserId && currentUserId !== submission.submitted_by_user_id && origin !== null && origin.active && origin.user.user_id === submission.submitted_by_user_id && submission.state === 'submitted' && submission.review_eligibility.eligible && submission.allowed_actions.includes('request_changes')
}
export const submissionStateLabel: Record<WireMappingSubmission['state'], string> = { submitted: 'Đang chờ Owner', changes_requested: 'Yêu cầu chỉnh sửa', approved: 'Đã duyệt', rejected: 'Đã từ chối', stale: 'Đề xuất đã thay đổi', withdrawn: 'Đã rút đề xuất' }

