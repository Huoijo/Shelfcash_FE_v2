import type {ReactNode} from 'react'

/** Shared geometry from latest OWNER/STAFF ActionBar; behavior is supplied by each flow. */
export function ImportActionBar({back,backLabel='Quay lại',note,children}:{back?:()=>void;backLabel?:string;note?:string;children:ReactNode}) {
  return <footer className="input-actionbar"><div>{back&&<button type="button" onClick={back}>{backLabel}</button>}</div><div className="input-actionright">{note&&<span>{note}</span>}{children}</div></footer>
}
