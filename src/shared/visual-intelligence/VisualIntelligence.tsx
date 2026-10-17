import type { ReactNode } from 'react'
import './VisualIntelligence.css'

export type VisualStateKind='loading'|'empty'|'partial'|'unavailable'|'error'|'permission'|'contract'
export function VisualState({title,kind,children}:{title:string;kind:VisualStateKind;children?:ReactNode}) {
  return <section className="sc-vi-state" data-state={kind} aria-label={title} role={kind==='error'?'alert':kind==='loading'?'status':undefined}>
    <header><span>{title}</span><strong>{kind==='contract'?'DATA CONTRACT REQUIRED':kind==='loading'?'Đang tải…':kind==='permission'?'Giới hạn quyền':kind==='partial'?'Một phần':kind==='empty'?'Trống':'Không khả dụng'}</strong></header>
    {children&&<div className="sc-vi-state-copy">{children}</div>}
  </section>
}
export type RailPart={key:string;label:string;value:string;share:number|null;tone?:'neutral'|'muted'|'soft'|'positive'|'attention'|'danger';note?:string}
export type ReadinessSegment={key:string;label:string;state:'complete'|'attention'|'pending'|'unknown'|'unavailable'|'permission'}
const segmentCopy={complete:['✓','Đã xác nhận'],attention:['!','Cần chú ý'],pending:['…','Chờ đánh giá'],unknown:['?','Chưa xác định'],unavailable:['—','Không khả dụng'],permission:['—','Giới hạn quyền']}
export function ReadinessSegments({items,note}:{items:ReadinessSegment[];note?:string}) {
  return <section className="sc-vi-card sc-vi-readiness" aria-label="Mức sẵn sàng dữ liệu theo điều kiện"><header><strong>Dữ liệu sẵn sàng</strong><span>Không phải tiến trình bước</span></header><div className="sc-vi-segment-track" aria-hidden="true">{items.map(item=><i key={item.key} data-state={item.state}/>)}</div><ul>{items.map(item=><li key={item.key} data-state={item.state}><span aria-hidden="true">{segmentCopy[item.state][0]}</span><div><strong>{item.label}</strong><small>{segmentCopy[item.state][1]}</small></div></li>)}</ul>{note&&<p className="sc-vi-caption">{note}</p>}</section>
}
export function ProportionalRail({label,parts,summary}:{label:string;parts:RailPart[];summary?:ReactNode}) {
  const plotted=parts.filter(p=>p.share!==null&&p.share>0)
  return <div className="sc-vi-proportion" aria-label={label}>
    {plotted.length>0&&<div className="sc-vi-track" role="img" aria-label={parts.map(p=>`${p.label}: ${p.value}${p.note?`, ${p.note}`:''}`).join('; ')}>{plotted.map(p=><span key={p.key} data-tone={p.tone??'neutral'} style={{width:`${Math.min(100,p.share!)}%`}}/>)}</div>}
    <ul className="sc-vi-legend">{parts.map(p=><li key={p.key}><i data-tone={p.tone??'neutral'} aria-hidden="true"/><span>{p.label}</span><strong>{p.value}</strong>{p.note&&<small>{p.note}</small>}</li>)}</ul>
    {summary&&<div className="sc-vi-caption">{summary}</div>}
  </div>
}
export function BudgetRail({label,percent,copy}:{label:string;percent:number|null;copy:ReactNode}) {
  return <div className="sc-vi-budget" aria-label={label}>{percent!==null&&<div className="sc-vi-track" role="img" aria-label={label}><span style={{width:`${Math.min(100,Math.max(0,percent))}%`}}/></div>}<div className="sc-vi-caption">{copy}</div></div>
}
