import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {ImportEntitySearchContext} from '../../features/import-data/importEntitySearch.context'
import { ImportResolutionView } from '../../features/import-data/importResolutionView.context'
import { ImportPage } from '../../pages/imports/ImportPage'
import { DebugVisibility } from './debugVisibility.context'
import { useImportPreview, type PreviewRequest } from './importPlayground.store'
import { createImportPlaygroundSession, type ImportPlaygroundSession } from './importPlayground.session'

export default function ImportPlaygroundBoundary({children}:{children:ReactNode}) {
  const request=useImportPreview()
  const live=useRef<HTMLDivElement>(null)
  const active=!!request
  useEffect(()=>{
    if(!active)return
    // A top-layer native dialog must be suspended too, not just its hidden ancestor.
    const dialogs=Array.from(live.current?.querySelectorAll<HTMLDialogElement>('dialog[open]')??[])
    dialogs.forEach(dialog=>dialog.close())
    return()=>{dialogs.forEach(dialog=>{if(dialog.isConnected&&!dialog.open)dialog.showModal()})}
  },[active])
  return <><div ref={live} hidden={active}><DebugVisibility value={!request}>{children}</DebugVisibility></div>{request&&<Preview key={request.generation} request={request}/>}</>
}
function Preview({request}:{request:PreviewRequest}) {
  const [result,setResult]=useState<{session:ImportPlaygroundSession}|{error:string}|null>(null)
  useEffect(()=>{
    let active=true, session:ImportPlaygroundSession|undefined
    void createImportPlaygroundSession(request).then(value=>{
      session=value
      if(active)setResult({session:value});else value.dispose()
    }).catch(error=>{if(active)setResult({error:error instanceof Error?error.message:'Không mở được preview.'})})
    return()=>{active=false;session?.dispose()}
  },[request])
  if(!result)return <div role="status" className="sr-only">Preparing UI preview…</div>
  if('error' in result)return <p role="alert">{result.error}</p>
  return <PreviewScreen session={result.session}/>
}
function PreviewScreen({session}:{session:ImportPlaygroundSession}) {
  const selection=useSyncExternalStore(session.subscribe,session.getSnapshot)
  useEffect(()=>{if(session.interactive)selection.flow.setBatch(selection.state.batch)},[session,selection.flow,selection.state.batch])
  useEffect(()=>{
    const {state,flowState,flow}=selection
    if(session.interactive && state.fresh && state.sealedLocked && !state.busy && !state.processing && !flowState.busy && !flowState.summary && !flowState.error && !flowState.retryOperation && !state.batch?.active_job_id)void flow.refresh()
  },[session,selection])
  useEffect(()=>{
    if(!session.interactive || selection.flowState.busy || selection.flowState.retryOperation || selection.flowState.pollAfterMs===null)return
    const timer=setTimeout(()=>{void session.poll()},Math.max(250,selection.flowState.pollAfterMs))
    return()=>clearTimeout(timer)
  },[session,selection])
  return <ImportEntitySearchContext value={async({kind,q})=>({items:[{id:'00000000-0000-0000-0000-000000000011',name:q||'Sữa tươi',code:'ING-014',kind},{id:'00000000-0000-0000-0000-000000000012',name:(q||'Sữa tươi')+' không đường',code:'ING-021',kind}],nextCursor:null})}><ImportResolutionView value={{identityMode:selection.preview?.scenario==='resolve-new'?'new':'existing',sharedValueExpanded:selection.preview?.scenario==='resolve-declaration'}}><ImportPage selection={selection}/></ImportResolutionView></ImportEntitySearchContext>
}
