import type { MappingSummary, PreviewSummary } from './importFlow.types'
import type { WireActionReadiness } from './importFlow.wire'
import type { ReadinessSegment, RailPart } from '../../shared/visual-intelligence/VisualIntelligence'
import { decimalFraction, proportion } from '../../shared/visual-intelligence/visualMath'

export function mappingComposition(summary:MappingSummary):RailPart[]|null {
  const counts=summary.counters?.batch
  if(!counts)return null
  const keys=['auto_mapped','resolved','needs_confirmation','ambiguous','unmatched'] as const
  // Optional absent counts remain unknown. Never extrapolate a scoped queue page.
  if(keys.some(key=>!Number.isSafeInteger(counts.by_status[key])||counts.by_status[key]!<0)||!Number.isSafeInteger(counts.total)||keys.reduce((sum,key)=>sum+counts.by_status[key]!,0)!==counts.total)return null
  const labels=['Ghép tự động','Đã xác nhận','Cần xác nhận','Mơ hồ','Chưa ghép']
  return keys.map((key,i)=>({key,label:labels[i],value:String(counts.by_status[key]),share:proportion(decimalFraction(String(counts.by_status[key])),decimalFraction(String(counts.total))),tone:i<2?'neutral':'attention'}))
}
export function previewComposition(summary:Pick<PreviewSummary,'groups'>):RailPart[] {
  const fields=['planned_insert_count','planned_update_count','no_op_count','blocked_count'] as const
  const values=fields.map(field=>summary.groups.reduce((sum,group)=>sum+BigInt(group[field]),0n))
  const total=values.reduce((sum,n)=>sum+n,0n)
  const reconciled=summary.groups.every(group=>fields.reduce((sum,field)=>sum+BigInt(group[field]),0n)===BigInt(group.row_count))
  return values.map((value,index)=>({key:fields[index],label:['Thêm','Cập nhật','Không đổi','Chặn'][index],value:String(value),share:reconciled?proportion({numerator:String(value),denominator:'1'},{numerator:String(total),denominator:'1'}):null,tone:(['neutral','muted','soft','danger'] as const)[index]}))
}
export function importReadinessSegments(action:WireActionReadiness|null|undefined,state:'pending'|'loading'|'loaded'|'error'|'permission'):ReadinessSegment[] {
  return (['sales','inventory','recipe','supplier'] as const).map((key,index)=>{
    const issues=[...(action?.blockers??[]),...(action?.warnings??[])]
    const status:ReadinessSegment['state']=state==='permission'?'permission':state==='error'?'unavailable':state!=='loaded'?'pending':issues.some(issue=>issue.source==='authorization')?'permission':issues.some(issue=>issue.source===key)?'attention':'unknown'
    // R01 does not publish per-domain positive assessments. No issue != complete.
    return {key,label:['Doanh số','Tồn kho','Công thức','Nhà cung cấp'][index],state:status}
  })
}
