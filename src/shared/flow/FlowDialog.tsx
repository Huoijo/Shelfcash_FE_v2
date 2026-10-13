import { useEffect, useId, useRef, type ReactNode } from 'react'
import './FlowDialog.css'

/** Native top-layer dialog supplies focus trapping, Escape and focus restoration. */
export function FlowDialog({title,subtitle,children,footer,onClose,closeDisabled=false,center=false}:{title:string;subtitle?:string;children:ReactNode;footer?:ReactNode;onClose:()=>void;closeDisabled?:boolean;center?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),id=useId()
  useEffect(()=>{const el=ref.current;if(!el)return;const origin=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();heading.current?.focus();return()=>{el.close();requestAnimationFrame(()=>{if(origin?.isConnected)origin.focus({preventScroll:true})})}},[])
  useEffect(()=>{heading.current?.focus()},[title])
  return <dialog ref={ref} className={`sc-flow-dialog ${center?'sc-flow-dialog-center':''}`} aria-labelledby={id} onCancel={e=>{e.preventDefault();if(!closeDisabled)onClose()}} onClick={e=>{if(e.target===e.currentTarget&&!closeDisabled)onClose()}}>
    <header className="sc-flow-dialog-header"><div><h2 ref={heading} tabIndex={-1} id={id}>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button type="button" aria-label={`Đóng ${title}`} disabled={closeDisabled} onClick={onClose}>×</button></header>
    <div className="sc-flow-dialog-body">{children}</div>{footer&&<footer className="sc-flow-dialog-footer">{footer}</footer>}
  </dialog>
}
export function DiscardDialog({onKeep,onDiscard}:{onKeep:()=>void;onDiscard:()=>void}) {
  return <FlowDialog title="Bạn có thay đổi chưa lưu" center onClose={onKeep} footer={<><button type="button" onClick={onKeep}>Tiếp tục chỉnh sửa</button><button type="button" className="sc-flow-primary" onClick={onDiscard}>Đóng và bỏ thay đổi</button></>}><p>Đóng và bỏ các thông tin đã nhập?</p></FlowDialog>
}
export function FlowState({title,children,error=false}:{title:string;children:ReactNode;error?:boolean}){
  return <section className="sc-flow-state" role={error?'alert':'status'}><h3>{title}</h3><div>{children}</div></section>
}
