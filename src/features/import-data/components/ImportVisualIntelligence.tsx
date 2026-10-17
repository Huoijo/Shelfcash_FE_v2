import { ProportionalRail, VisualState } from '../../../shared/visual-intelligence/VisualIntelligence'
import { mappingComposition, previewComposition } from '../import.visual'
import type { MappingSummary, PreviewSummary } from '../importFlow.types'
export function ImportMappingComposition({summary}:{summary:MappingSummary}) {
  const parts=mappingComposition(summary)
  return <section className="sc-vi-card"><header><strong>Phân bổ trạng thái ghép</strong><span>Toàn lô · không phải độ tin cậy AI</span></header>{parts?<ProportionalRail label="Trạng thái ghép toàn lô" parts={parts}/>:<VisualState title="Phân bổ trạng thái ghép" kind="unavailable">Chưa có bộ đếm trạng thái đầy đủ cho toàn lô. Danh sách đang tải không đại diện toàn bộ dữ liệu.</VisualState>}</section>
}
export function ImportWriteComposition({summary}:{summary:Pick<PreviewSummary,'groups'|'warnings'>}) {
  const parts=previewComposition(summary)
  return <section className="sc-vi-card"><header><strong>Dự kiến ghi dữ liệu</strong><span>Toàn bộ Preview · chưa ghi</span></header><ProportionalRail label="Phân bổ hành động ghi dự kiến" parts={parts}/>{parts.every(part=>part.share===null)&&<p className="sc-vi-caption">Không tạo tỷ lệ khi chưa có mẫu số dương hoặc các hành động chưa khớp tổng dòng.</p>}{summary.warnings.length>0&&<p className="sc-vi-caption">! {summary.warnings.length} cảnh báo tổng hợp · có thể trùng với các hành động ở trên, không cộng vào rail.</p>}</section>
}
