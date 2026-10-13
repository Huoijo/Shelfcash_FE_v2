import { useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router'

export function UnderConstructionButton({children,feature,className}:{children:ReactNode;feature:string;className?:string}) {
  const dialog=useRef<HTMLDialogElement>(null)
  const id=useId()
  return <><button type="button" className={className} onClick={()=>dialog.current?.showModal()}>{children}</button><dialog ref={dialog} aria-labelledby={id} style={{border:'1px solid #ddd',borderRadius:10,padding:24,maxWidth:'min(440px, calc(100vw - 32px))'}}><h2 id={id}>{feature} đang được xây dựng</h2><p>Tính năng sẽ khả dụng trong bản cập nhật sau.</p><button type="button" autoFocus onClick={()=>dialog.current?.close()}>Đóng</button></dialog></>
}
export function UnderConstructionPage({feature}:{feature:string}) {
  return <main style={{padding:'32px',maxWidth:720}}><h1>{feature} đang được xây dựng</h1><p>Tính năng sẽ khả dụng trong bản cập nhật sau.</p><Link to="/inventory">Mở Kho</Link></main>
}
