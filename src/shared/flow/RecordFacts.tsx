import { fieldLabel } from './fieldLabels'
/** Presentation only: keep decimal strings/null and canonical values unchanged. */
export function RecordFacts({value}:{value:unknown}) {
  if(value===null||value===undefined)return <span>Chưa được cung cấp</span>
  if(Array.isArray(value))return value.length?<div>{value.map((v,i)=><div className="sc-flow-notice" key={i}><RecordFacts value={v}/></div>)}</div>:<span>Không có</span>
  if(typeof value==='object')return <dl className="sc-flow-facts">{Object.entries(value).map(([k,v])=><div key={k}><dt>{fieldLabel(k)}</dt><dd><RecordFacts value={v}/></dd></div>)}</dl>
  return <span>{typeof value==='boolean'?(value?'Có':'Không'):String(value)}</span>
}
