import { useEffect, useId, useRef, useState } from 'react'
import { getInventory } from '../inventory/inventory.data'
import type { IngredientStock, InventoryResponse, InventoryMeta } from '../inventory/inventory.types'
import './IngredientPicker.css'

export function IngredientPicker({storeId,value,selectedName='',onPick,onClear,disabled,label='Nguyên liệu'}:{storeId:string;value:string;selectedName?:string;onPick:(item:IngredientStock,meta:InventoryMeta)=>void;onClear?:()=>void;disabled?:boolean;label?:string}) {
  const id=useId(),root=useRef<HTMLDivElement>(null)
  const [q,setQ]=useState(''),[open,setOpen]=useState(false),[cursor,setCursor]=useState<string|undefined>(),[retry,setRetry]=useState(0),[active,setActive]=useState(0)
  const [picked,setPicked]=useState<{id:string;name:string}|null>(null)
  const [result,setResult]=useState<{key:string;response?:InventoryResponse;error?:string}>({key:''})
  const key=JSON.stringify([storeId,q,cursor,retry])
  useEffect(()=>{if(!open)return;const c=new AbortController();const timer=setTimeout(()=>getInventory({q:q.trim()||undefined,cursor,limit:50,sort:'name'},c.signal,storeId).then(response=>{if(!c.signal.aborted)setResult({key,response})}).catch(e=>{if(!c.signal.aborted)setResult({key,error:e.message})}),150);return()=>{clearTimeout(timer);c.abort()}},[storeId,q,cursor,retry,key,open])
  const current=result.key===key?result:undefined,rows=current?.response?.data.items.filter(r=>r.ingredient_active)??[]
  const name=picked?.id===value?picked.name:selectedName
  function choose(row:IngredientStock){if(!current?.response)return;setPicked({id:row.ingredient_id,name:row.name});onPick(row,current.response.meta);setOpen(false);setQ('');setCursor(undefined);setActive(0)}
  return <div className="sc-ingredient-picker" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}}><label htmlFor={id}>{label}</label><div className="sc-ingredient-input"><input id={id} role="combobox" autoComplete="off" aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list" aria-activedescendant={open&&rows[active]?`${id}-option-${active}`:undefined} value={open?q:(value?name:'')} disabled={disabled} placeholder="Tìm nguyên liệu trong ShelfCash" onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setCursor(undefined);setActive(0);setOpen(true);onClear?.()}} onKeyDown={e=>{
    if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false)}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(n=>Math.max(0,Math.min(rows.length-1,n+(e.key==='ArrowDown'?1:-1))))}
    if(e.key==='Enter'&&open){e.preventDefault();if(rows[active])choose(rows[active])}
  }}/><button type="button" disabled={disabled} aria-label={open?'Đóng danh sách nguyên liệu':'Mở danh sách nguyên liệu'} onClick={()=>setOpen(v=>!v)}>⌄</button></div>
    {open&&<div className="sc-ingredient-popover"><div id={`${id}-options`} role="listbox" aria-label="Nguyên liệu ShelfCash">{!current&&<p role="status">Đang tải nguyên liệu…</p>}{current?.error&&<p role="alert">{current.error}</p>}{rows.map((r,index)=><button type="button" role="option" id={`${id}-option-${index}`} aria-selected={value===r.ingredient_id} className={index===active?'active':''} key={r.ingredient_id} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(r)}><strong>{r.name}</strong><span>Đơn vị · {r.unit}</span></button>)}{current?.response&&!rows.length&&<p>Không tìm thấy nguyên liệu đang hoạt động. Thử từ khóa khác.</p>}</div><div className="sc-ingredient-pages">{cursor&&<button type="button" onClick={()=>{setCursor(undefined);setActive(0)}}>Trang đầu nguyên liệu</button>}{current?.response?.meta.pagination.next_cursor&&<button type="button" onClick={()=>{setCursor(current.response!.meta.pagination.next_cursor!);setActive(0)}}>Tải thêm nguyên liệu</button>}{current?.error&&<button type="button" onClick={()=>{setCursor(undefined);setRetry(n=>n+1)}}>Đọc lại danh mục</button>}</div></div>}
    <small>Chỉ chọn nguyên liệu đang hoạt động trong danh mục cửa hàng.</small>
  </div>
}
