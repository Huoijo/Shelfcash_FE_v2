import type {ReactNode} from 'react'
export function ImportStatus({title,copy,kind='neutral',children}:{title:string;copy?:string;kind?:'neutral'|'warn'|'error'|'success';children?:ReactNode}) {
  return <div className={`input-status-card ${kind}`} role={kind==='error'?'alert':'status'}><span aria-hidden="true">{kind==='success'?'✓':kind==='neutral'?'…':'!'}</span><div><strong>{title}</strong>{copy&&<p>{copy}</p>}{children}</div></div>
}
