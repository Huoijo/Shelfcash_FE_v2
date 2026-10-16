import type { CapabilityApi } from '../backend-capabilities/capabilities.data'
import type { WireMappingSubmission } from '../backend-capabilities/capabilities.wire'

export async function readImportSubmissions(storeId: string, importId: string, signal: AbortSignal, api: CapabilityApi): Promise<WireMappingSubmission[]> {
  const rows: WireMappingSubmission[] = [], cursors = new Set<string>(), ids = new Set<string>()
  let cursor: string | undefined, snapshot: string | undefined
  do {
    const page = await api.mapping.list({ path: { store_id: storeId }, query: { import_id: importId, limit: 100, ...(cursor ? { cursor } : {}) } }, { signal, ...(snapshot ? { snapshotId: snapshot } : {}) })
    snapshot = page.meta.snapshot_id
    for (const row of page.data.items) { if (ids.has(row.submission_id)) throw Error('Danh sách đề xuất bị trùng hoặc đã thay đổi. Đọc lại trước khi tiếp tục.'); ids.add(row.submission_id); rows.push(row) }
    cursor = page.meta.pagination.next_cursor ?? undefined
    if (cursor) { if (cursors.has(cursor)) throw Error('Không thể đọc hết đề xuất hiện tại.'); cursors.add(cursor) }
  } while (cursor)
  return rows
}

