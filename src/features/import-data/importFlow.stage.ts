import type { ImportBatchState } from './importData.workflow'

// A single projection of canonical lifecycle. Tabs are navigation only and never
// grant permission, complete a job or make a preview current.
export type ImportStage = 'LOCAL_SELECTION' | 'DRAFT' | 'UPLOADING' | 'UPLOAD_REVIEW' | 'ANALYZING' | 'MAPPING' | 'MAPPING_COMPLETE' | 'PREVIEWING' | 'PREVIEW_READY' | 'COMMITTING' | 'COMPLETED' | 'BLOCKED' | 'FAILED'
export function importStage(state: ImportBatchState): ImportStage {
  if (!state.draft) return state.busy ? 'UPLOADING' : 'LOCAL_SELECTION'
  if (state.busy && !state.sealedLocked) return 'UPLOADING'
  switch (state.batch?.status ?? state.draft.status) {
    case 'draft': return 'DRAFT'
    case 'uploaded': return 'UPLOAD_REVIEW'
    case 'analyzing': return 'ANALYZING'
    case 'review_required': return 'MAPPING'
    case 'blocked': return 'BLOCKED'
    case 'ready_for_preview': return 'MAPPING_COMPLETE'
    case 'previewing': return 'PREVIEWING'
    case 'preview_ready': return 'PREVIEW_READY'
    case 'committing': return 'COMMITTING'
    case 'completed': case 'completed_with_warnings': return 'COMPLETED'
    case 'failed': return 'FAILED'
  }
}

export const importStageLabels: Record<ImportStage, string> = {
  LOCAL_SELECTION: 'Chọn file', DRAFT: 'Bản nháp', UPLOADING: 'Đang tải file', UPLOAD_REVIEW: 'Kiểm tra file đã nhận',
  ANALYZING: 'Đang phân tích', MAPPING: 'Kiểm tra cách hiểu', MAPPING_COMPLETE: 'Sẵn sàng xem lại', PREVIEWING: 'Đang tạo Preview',
  PREVIEW_READY: 'Preview đã sẵn sàng', COMMITTING: 'Đang ghi dữ liệu', COMPLETED: 'Lô có biên nhận hoàn tất', BLOCKED: 'Có lỗi chặn', FAILED: 'Có lỗi cần kiểm tra',
}
