import {useState} from 'react'
import type {MappingProfileSpec} from '../importFlow.types'
import {ImportBusinessFacts} from './ImportBusinessFacts'
import {businessField,reportLabel,schemaLabel,sourceLabel} from '../importPresentation'
import {FlowDialog} from '../../../shared/flow/FlowDialog'

type Rule={key:string;label:string;group:string;before:unknown;after:unknown;status:'Không đổi'|'Thêm mới'|'Thay đổi'|'Loại bỏ'|'Chưa thể so sánh'}
const groups:Record<string,string>={field_bindings:'Cấu trúc & semantics',identity_rules:'Identity behavior',aliases:'Identity behavior',entity_proposals:'Identity behavior',shared_field_bindings:'Reusable declarations',conversions:'Unit / exact conversion rules'}
const titles:Record<string,string>={scope:'Nguồn báo cáo',structure:'Cấu trúc nguồn',source_provenance:'Bằng chứng nguồn',sales_semantics:'Cách hiểu doanh số',inventory_semantics:'Cách hiểu kiểm kê',planned_arrival_expiry_rule:'Quy tắc hạn sử dụng'}
const record=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}
function labelFor(key:string,value:unknown){const item=record(value);return typeof item.source_header==='string'?item.source_header:typeof item.source_token==='string'?item.source_token:typeof item.target_field==='string'?businessField(item.target_field):typeof item.from_unit==='string'?`${item.from_unit} → ${item.to_unit}`:titles[key]??'Quy tắc reusable'}
function entries(spec:MappingProfileSpec|undefined):{key:string;label:string;group:string;value:unknown}[]{
  return Object.entries(spec??{}).filter(([key,value])=>!['schema','schema_version','version','content_digest'].includes(key)&&value!=null).flatMap<{key:string;label:string;group:string;value:unknown}>(([key,value])=>Array.isArray(value)?value.map((item,index)=>({key:`${key}:${index}`,label:labelFor(key,item),group:groups[key]??'Nguồn & quy tắc khác',value:item})):[{key,label:labelFor(key,value),group:groups[key]??'Nguồn & quy tắc khác',value}])
}
function CompactValue({value}:{value:unknown}){
  const item=record(value)
  if(typeof item.source_header==='string'&&('target_field' in item||item.ignored))return <span>{item.source_header} → {item.ignored?'Bỏ qua':typeof item.target_field==='string'?businessField(item.target_field):'Chưa xác định'}{item.requiredness==='required'?' · Bắt buộc':''}</span>
  if(typeof item.source_token==='string')return <span>{item.source_token} → Đối tượng đã liên kết trong Store</span>
  if(typeof item.source_system_key==='string')return <span>{sourceLabel(item.source_system_key)} · {reportLabel(String(item.report_type??''))}</span>
  if(Array.isArray(item.sheet_roles))return <span>{item.sheet_roles.map(value=>schemaLabel(String(value))).join(', ')} · {Array.isArray(item.header_rules)?item.header_rules.length:'—'} quy tắc header</span>
  if(Array.isArray(item.evidence_references))return <span>{item.evidence_references.join(' · ')||'Chưa được cung cấp'}</span>
  if(typeof item.from_unit==='string'){const factor=record(item.factor);return <span>{item.from_unit} → {String(item.to_unit)} · {String(factor.numerator)} / {String(factor.denominator)}</span>}
  if(typeof item.target_field==='string')return <span>{businessField(item.target_field)} · <ImportBusinessFacts value={item.value??null}/></span>
  return <ImportBusinessFacts value={value}/>
}
export function ImportProfileSpecification({proposed,baseline,first=false}:{proposed:MappingProfileSpec;baseline?:MappingProfileSpec;first?:boolean}) {
  const [full,setFull]=useState(first),[evidence,setEvidence]=useState<Rule|null>(null)
  const comparable=first||!!baseline
  const before=entries(baseline),after=entries(proposed)
  const keys=[...new Set([...after.map(item=>item.key),...before.map(item=>item.key)])]
  const rules:Rule[]=keys.map(key=>{const a=after.find(item=>item.key===key),b=before.find(item=>item.key===key);return {key,label:(a??b)!.label,group:(a??b)!.group,before:b?.value,after:a?.value,status:!comparable?'Chưa thể so sánh':!b?'Thêm mới':!a?'Loại bỏ':JSON.stringify(a.value)===JSON.stringify(b.value)?'Không đổi':'Thay đổi'}})
  const changed=rules.filter(rule=>rule.status!=='Không đổi'&&rule.status!=='Chưa thể so sánh')
  return <>
    <section className="input-profile-change-summary"><header><strong>{!comparable?'Chưa có baseline để so sánh':first?`${changed.length} quy tắc của Profile đầu tiên`:`${changed.length} quy tắc thay đổi`}</strong><span>{!comparable?'Cần tải cách đọc đã duyệt':first?'Chưa có baseline':changed.length?'Cần Owner quyết định':'Không có thay đổi reusable'}</span></header><div>{[...new Set(rules.map(rule=>rule.group))].map(group=><article key={group}><span>{group}</span><strong>{comparable?changed.filter(rule=>rule.group===group).length:'—'}</strong></article>)}</div></section>
    <div role="group" aria-label="Chế độ xem Profile" className="input-profile-toggle"><button type="button" aria-pressed={!full} onClick={()=>setFull(false)}>Thay đổi</button><button type="button" aria-pressed={full} onClick={()=>setFull(true)}>Toàn bộ Profile</button></div>
    <p className="input-resolver-help">Quyết định duyệt áp dụng cho toàn bộ Profile version này, kể cả khi đang xem “Thay đổi”.</p>
    {[...new Set(rules.map(rule=>rule.group))].map(group=>{const visible=rules.filter(rule=>rule.group===group&&(full||rule.status!=='Không đổi'));return !!visible.length&&<section className="input-profile-rule-group" key={group}><header><small>Reusable specification</small><h3>{group}</h3></header>{visible.map(rule=><article key={rule.key}><header><strong>{rule.label}</strong><span>{rule.status}</span><button type="button" onClick={()=>setEvidence(rule)}>Xem bằng chứng →</button></header><div className="import-flow__profile-comparison">{!first&&<section><small>Trước</small>{rule.before===undefined?<p>{baseline?'Chưa có':'Chưa được cung cấp'}</p>:<CompactValue value={rule.before}/>}</section>}<section><small>Đề xuất</small>{rule.after===undefined?<p>Không còn trong Profile đề xuất</p>:<CompactValue value={rule.after}/>}</section></div></article>)}</section>})}
    {evidence&&<FlowDialog className="import-evidence" eyebrow="Bằng chứng · Profile review" title={evidence.label} onClose={()=>setEvidence(null)}><ImportBusinessFacts value={{before:evidence.before??null,proposed:evidence.after??null,source_provenance:proposed.source_provenance}}/><p>Read-only · Quyết định này không sửa cách hiểu ở Step 3.</p></FlowDialog>}
  </>
}
