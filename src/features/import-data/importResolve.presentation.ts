import type { MappingIssue, MappingProfileSpec, MappingSummary, MappingQueue } from './importFlow.types'
import { resolutionGroup, type ResolutionGroup } from './importExperience'

export const resolveGroups = [
  {id:'structure',number:'3A',title:'Cấu trúc & semantics',copy:'Source field → semantic field.',metric:'Mappings',save:'Lưu mapping'},
  {id:'identity',number:'3B',title:'Identity',copy:'Giá trị nguồn → Store entity.',metric:'Bindings',save:'Lưu bindings'},
  {id:'facts',number:'3C',title:'Thông tin cần xác nhận',copy:'Giá trị ShelfCash không tự suy đoán.',metric:'Declarations',save:'Lưu thông tin'},
  {id:'units',number:'3D',title:'Units',copy:'Đơn vị và conversion của import.',metric:'Units',save:'Lưu đơn vị'},
] as const

export function retainedSpecs(summary:MappingSummary):MappingProfileSpec[] {
  const proposed=new Set(summary.profile_proposals.map(p=>p.profile_id))
  return [...summary.profile_proposals.flatMap(p=>p.spec?[p.spec]:[]),...summary.approved_profiles.filter(p=>!proposed.has(p.binding.profile_id)).map(p=>p.spec)]
}
export function sheetSpec(summary:MappingSummary,sheetId:string|null) {
  const sheet=summary.sheets.find(s=>s.sheet_id===sheetId)
  return summary.profile_proposals.find(p=>p.profile_id===sheet?.profile_id)?.spec ?? summary.approved_profiles.find(p=>p.binding.sheet_id===sheetId)?.spec
}
export const unresolvedIssue=(issue:MappingIssue)=>!['resolved','auto_mapped'].includes(issue.status)
/** Global state comes from M01. A partial scoped page never proves a group complete. */
export function resolveOverview(summary:MappingSummary,queue:MappingQueue|null) {
  const specs=retainedSpecs(summary)
  const inspected=summary.profile_proposals.every(p=>!!p.spec)&&summary.binding_refs.every(b=>summary.approved_profiles.some(p=>p.binding.profile_id===b.profile_id&&p.binding.version===b.version))
  const known=inspected && specs.length>0
  const counts:Record<ResolutionGroup,number|null>={
    structure:known?specs.reduce((n,s)=>n+s.field_bindings.filter(f=>!f.ignored).length,0):null,
    identity:known&&specs.every(s=>s.identity_rules!==undefined)?specs.reduce((n,s)=>n+(s.identity_rules?.length??0),0):null,
    facts:known&&specs.every(s=>s.shared_field_bindings!==undefined)&&summary.sheets.every(s=>s.import_values!==undefined)?specs.reduce((n,s)=>n+(s.shared_field_bindings?.length??0),0)+summary.sheets.reduce((n,s)=>n+(s.import_values?.length??0),0):null,
    units:known&&specs.every(s=>s.conversions!==undefined)?specs.reduce((n,s)=>n+(s.conversions?.length??0),0):null,
  }
  return resolveGroups.map(group=>{
    const pending=queue?.items.filter(issue=>resolutionGroup(issue)===group.id&&unresolvedIssue(issue)).length??0
    const complete=summary.progress.unresolved===0
    const status=pending?'Cần xử lý':complete?group.id==='identity'?'Đã xác định':group.id==='facts'?'Đã xác nhận':group.id==='units'?'Hợp lệ':'Đã xử lý':'Cần xác nhận'
    return {...group,count:counts[group.id],pending,complete,status}
  })
}
