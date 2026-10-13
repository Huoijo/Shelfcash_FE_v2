import { useEffect, useRef, useState } from 'react'
import { Mutation } from './mutation'
import type { Intent } from './operations.data'

/** Mounted callers must be keyed by Store/resource/authorization context. */
export function useOperation<T, R>() {
  const [operation] = useState(()=>new Mutation<T,R>())
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [failure,setFailure]=useState<unknown>(null)
  const [result,setResult] = useState<R | null>(null)
  const mounted = useRef(true)
  const controller = useRef<AbortController | null>(null)
  const retry = useRef<(() => Promise<void>) | null>(null)
  useEffect(()=>{ mounted.current=true; return ()=>{mounted.current=false;controller.current?.abort()} },[])
  const send = async (body: T, version: string | undefined, action:(intent: Intent<T>, signal: AbortSignal)=>Promise<R>, after?: (result:R, signal:AbortSignal)=>Promise<void>) => {
    if(operation.busy) return
    retry.current=()=>send(body,version,action,after)
    const c = new AbortController(); controller.current=c
    setBusy(true);setError('');setFailure(null)
    try {
      const receipt = await operation.send(body,version,i=>action(i,c.signal))
      if(!mounted.current || c.signal.aborted) return
      setResult(receipt)
      // A failed fresh read must not turn a confirmed write into an uncertain mutation.
      if(after) await after(receipt,c.signal)
    } catch(cause) {
      if(mounted.current && !c.signal.aborted){setFailure(cause);setError(cause instanceof Error ? cause.message : 'Chưa hoàn tất thao tác.')}
    } finally { if(mounted.current) setBusy(false) }
  }
  return {send,failure,reset:()=>{if(operation.busy||operation.uncertain)return false;setResult(null);setError('');setFailure(null);return true},clearError:()=>setError(''),retry:()=>retry.current?.(),busy,error,result,uncertain:operation.uncertain,locked:busy || operation.uncertain}
}
