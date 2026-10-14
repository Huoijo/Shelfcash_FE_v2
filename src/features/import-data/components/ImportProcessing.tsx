import type {ReactNode} from 'react'
export function ImportProcessing({kind,title,copy,confirmed=false,children}:{kind:'running'|'uncertain'|'failed';title:string;copy:string;confirmed?:boolean;children?:ReactNode}) {
  return <section className="input-processing" role={kind==='failed'?'alert':'status'} aria-busy={kind==='running'}><span className={kind==='failed'?'input-processing-icon':'input-processing-indicator'} aria-hidden="true">{kind==='failed'?'!':''}</span><h2>{title}</h2><p>{copy}</p>{kind==='running'&&<div className="input-processing-list">{confirmed&&<span>✓ Review đã xác nhận</span>}<strong>• Đang ghi dữ liệu</strong><span>• Chờ trạng thái hoàn tất</span></div>}{children&&<div className="input-processing-actions">{children}</div>}</section>
}
