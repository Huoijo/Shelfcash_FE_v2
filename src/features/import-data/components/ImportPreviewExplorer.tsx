import { useState } from 'react'
import type { MappingSummary, PreviewBundle, PreviewRow } from '../importFlow.types'
import { FlowDialog, FlowState } from '../../../shared/flow/FlowDialog'
import { DebugValue } from '../../../shared/debug/DevelopmentTools'
import { ImportBusinessFacts } from './ImportBusinessFacts'
import { fieldLabel } from '../../../shared/flow/fieldLabels'
import { importMessage } from '../importPresentation'
import { previewDomainLabels } from './preview.labels'
import './ImportPreviewExplorer.css'
const classificationLabels: Record<string, string> = {NEW:'Mới',CHANGED:'Thay đổi',UNCHANGED:'Không đổi',INVALID:'Không hợp lệ',CONFLICT:'Xung đột'}
const domain = (row: PreviewRow) => row.canonical_domain ?? row.after?.domain ?? row.before?.domain ?? 'unknown'
export function ImportPreviewExplorer({bundle,mapping,busy,locked,onLoadMore,showStaleNotice=true}: {bundle:PreviewBundle;mapping?:MappingSummary|null;busy:boolean;locked:boolean;onLoadMore:()=>void;showStaleNotice?:boolean}) {
  const {summary,rows,rows_page:page}=bundle.preview
  const groups=summary.groups
  const [selected,setSelected]=useState<string>(groups[0]?.canonical_domain ?? (rows[0] ? domain(rows[0]) : 'unknown'))
  const [filter,setFilter]=useState<'all'|'issues'>('all'), [rowId,setRowId]=useState<string|null>(null)
  const visible=rows.filter(row=>domain(row)===selected&&(filter==='all'||row.blockers.length||row.warnings.length))
  const row=rows.find(row=>row.row_id===rowId)
  const columns=[...new Set(rows.filter(row=>domain(row)===selected).flatMap(row=>Object.keys(row.after??row.before??{})))].filter(key=>!['domain','lines','ingredients','reason'].includes(key))
  const allDomains=[...new Set([...groups.map(group=>group.canonical_domain),...rows.map(domain)])]
  const source=(row:PreviewRow)=>`${mapping?.files.find(file=>file.file_id===row.source_location.file_id)?.filename ?? 'File nguồn'} · ${mapping?.sheets.find(sheet=>sheet.sheet_id===row.source_location.sheet_id)?.name ?? 'Sheet nguồn'} · Dòng ${row.source_location.row_number??row.source_location.record_number??row.source_location.line_start??'chưa xác định'}`
  function cell(value:unknown,key:string) {
    if (typeof value==='string' && /_id$/.test(key)) {
      const specs=[...(mapping?.approved_profiles.flatMap(profile=>profile.spec?[profile.spec]:[])??[]),...(mapping?.profile_proposals.flatMap(profile=>profile.spec?[profile.spec]:[])??[])]
      return specs.flatMap(spec=>spec.identity_rules??[]).find(rule=>rule.canonical_id===value)?.source_token ?? 'Tên chưa được cung cấp'
    }
    return <ImportBusinessFacts value={value} field={key}/>
  }
  return <section className="sc-preview-explorer">
    <header className="input-section-title"><h2>Xem trước dữ liệu</h2><p>Chưa có dữ liệu nào được ghi vào ShelfCash.</p></header>
    <div className="input-readout">{[[summary.counts.NEW,'Mới'],[summary.counts.CHANGED,'Cập nhật'],[summary.counts.UNCHANGED,'Không đổi'],[summary.warnings.length || rows.some(row=>row.warnings.length) ? 'Có' : page.next_cursor ? '—' : 'Không','Cảnh báo']].map(([value,label])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    {showStaleNotice&&bundle.preview.stale&&<FlowState title="Preview không còn mới nhất" error><p>Mapping hoặc profile đã thay đổi sau lần Preview trước.</p></FlowState>}
    {!!summary.warnings.length&&<div className="input-status"><strong>{summary.warnings.length} cảnh báo</strong><p>Cảnh báo không chặn import; bạn vẫn có thể tiếp tục sau khi review.</p><button onClick={()=>setFilter('issues')}>Xem cảnh báo</button></div>}
    <div className="sc-flow-tabs" role="tablist" aria-label="Nhóm dữ liệu Preview">{allDomains.map(value=><button type="button" role="tab" aria-selected={selected===value} key={value} onClick={()=>{setSelected(value);setRowId(null)}}>{previewDomainLabels[value]??'Dữ liệu khác'}</button>)}</div>
    <div className="sc-preview-controls"><div role="group" aria-label="Lọc dòng Preview"><button aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>Tất cả</button><button aria-pressed={filter==='issues'} onClick={()=>setFilter('issues')}>Cần kiểm tra</button></div></div>
    <div className="import-flow__table-scroll"><table><caption className="sr-only">Các dòng Preview đã tải của nhóm đang chọn</caption><thead><tr><th>Vị trí</th><th>Trạng thái</th>{columns.map(key=><th key={key}>{fieldLabel(key)}</th>)}<th /></tr></thead><tbody>{visible.map(item=><tr key={item.row_id} tabIndex={0} onClick={()=>setRowId(item.row_id)} onKeyDown={event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();setRowId(item.row_id)}}} aria-label={`Mở chi tiết dòng ${item.source_location.row_number??rows.indexOf(item)+1}`}><td>{source(item)}</td><td><span className="sc-flow-badge">{classificationLabels[item.classification]}</span></td>{columns.map(key=><td key={key}>{cell((item.after??item.before??{})[key as keyof NonNullable<PreviewRow['after']>],key)}</td>)}<td><button type="button" onClick={event=>{event.stopPropagation();setRowId(item.row_id)}}>Chi tiết</button></td></tr>)}</tbody></table>{!visible.length&&<FlowState title="Không có dòng phù hợp"><p>Thử nhóm khác hoặc tải thêm dữ liệu.</p></FlowState>}</div>
    {page.next_cursor&&<footer className="sc-preview-controls"><span>{rows.length} / {page.total_count??'…'} dòng</span><button type="button" disabled={busy||locked||bundle.preview.stale} onClick={onLoadMore}>Đọc thêm dòng Preview</button></footer>}
    <DebugValue label="Preview pin / groups / paging" value={bundle}/>
    {row&&<FlowDialog title="Chi tiết dòng dữ liệu" subtitle={source(row)} onClose={()=>setRowId(null)} footer={<button onClick={()=>setRowId(null)}>Đóng chi tiết dòng</button>}>
      <section className="sc-flow-section"><h3>Nguồn dữ liệu</h3><p>{source(row)}</p></section>
      <section className="sc-flow-section"><h3>Giá trị trước → Giá trị sau</h3>{row.changes.map((change,index)=><article className="input-business-row" key={change.field+index}><strong>{fieldLabel(change.field)}</strong><div>{cell(change.before,change.field)} → {cell(change.after,change.field)}</div></article>)}{!row.changes.length&&Object.entries(row.after??{}).filter(([key])=>key!=='domain').map(([key,value])=><article className="input-business-row" key={key}><strong>{fieldLabel(key)}</strong><div>{cell(value,key)}</div></article>)}</section>
      {!!row.blockers.length&&<section className="input-status"><h3>Cần xử lý</h3>{row.blockers.map((issue,index)=><p key={issue.code+index}>{importMessage(issue.code,issue.message)}</p>)}</section>}
      {!!row.warnings.length&&<section className="input-status"><h3>Cảnh báo</h3>{row.warnings.map((issue,index)=><p key={issue.code+index}>{importMessage(issue.code,issue.message)}</p>)}</section>}
      {row.inventory_effect&&<section className="sc-flow-section"><h3>Tác động tồn kho</h3><ImportBusinessFacts value={row.inventory_effect}/></section>}
      {row.supplier_term_semantics&&<section className="sc-flow-section"><h3>Cơ sở giá và MOQ</h3><ImportBusinessFacts value={row.supplier_term_semantics}/></section>}
      <DebugValue label="Preview row / provenance / permissions" value={row}/>
    </FlowDialog>}
  </section>
}
