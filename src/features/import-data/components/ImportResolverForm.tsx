import {useContext,useEffect,type ReactNode} from 'react'
import {ResolverForm} from '../importResolverForm.context'
/** A legacy required contract editor can submit through the designed sticky drawer footer. */
export function ResolverFormBody({valid,onSubmit,children}:{valid:boolean;onSubmit:()=>void;children:ReactNode}) {
  const footer=useContext(ResolverForm)
  useEffect(()=>{footer?.valid(valid)},[footer,valid])
  return <form id={footer?.id} onSubmit={event=>{event.preventDefault();if(valid)onSubmit()}}>{children}</form>
}
export function ResolverSubmit({disabled,children}:{disabled:boolean;children:ReactNode}) {
  const footer=useContext(ResolverForm)
  return footer?null:<button type="submit" disabled={disabled}>{children}</button>
}
