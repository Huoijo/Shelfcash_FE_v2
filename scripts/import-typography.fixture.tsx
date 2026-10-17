// Controlled production rendering, using the existing disposable Import worlds.
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { CurrentStore } from '../src/features/store/store.context'
import { ImportPage } from '../src/pages/imports/ImportPage'
import { ImportEntitySearchContext } from '../src/features/import-data/importEntitySearch.context'
import { ImportResolutionView } from '../src/features/import-data/importResolutionView.context'
import { DebugVisibility } from '../src/shared/debug/debugVisibility.context'
import { createImportPlaygroundSession } from '../src/shared/debug/importPlayground.session'
import { ImportCalendar } from '../src/features/import-history/components/ImportCalendar'
import { calendarFixture } from '../src/features/import-history/importHistory.fixtures'
import { ImportProfileReview } from '../src/features/import-data/components/ImportMapping'
import { ImportDomainReview } from '../src/features/import-data/components/ImportDomainReview'
import { ImportHistoryCorrections } from '../src/features/import-data/components/ImportHistoryCorrections'
import { MappingSubmissionsPage } from '../src/features/import-data/components/MappingSubmissionsPage'
import { AuthContextValue } from '../src/features/auth/auth.context'
import { ImportSourceContext } from '../src/features/import-data/components/ImportSourceContext'
import { ImportPreview } from '../src/features/import-data/components/ImportPreview'
import '../src/index.css'
import '../src/pages/import-history/ImportHistoryPage.css'

let root: Root | undefined
let session: Awaited<ReturnType<typeof createImportPlaygroundSession>> | undefined
const noop = () => {}
// No live provider, account, API client or persistent storage enters this harness.
window.renderImport = async (role: 'OWNER' | 'STAFF', scenario: string) => {
  root?.unmount()
  session?.dispose()
  const host = document.getElementById('root')!
  root = createRoot(host)
  if(scenario.startsWith('submission-')) {
    const storeId='00000000-0000-4000-8000-000000000021'
    const provider={currentStoreId:storeId,state:{status:'ready',store:{name:'Controlled Store',membership:{role:'OWNER',effective_permissions:[]}}},registerChangeGuard:()=>noop}
    const auth={state:{status:'authenticated',context:{user:{user_id:'00000000-0000-4000-8000-000000000001'}}}}
    root.render(<MemoryRouter initialEntries={['/imports/approvals?submission_id=00000000-0000-4000-8000-000000000041']}><AuthContextValue.Provider value={auth as never}><CurrentStore.Provider value={provider as never}><DebugVisibility value={false}><MappingSubmissionsPage/></DebugVisibility></CurrentStore.Provider></AuthContextValue.Provider></MemoryRouter>)
  } else if (scenario === 'history-calendar') {
    root.render(<MemoryRouter><div className="history-page" style={{maxWidth:600,margin:'24px auto'}}><ImportCalendar month="2026-10" selectedDate="2026-10-02" data={calendarFixture.data} dateLink={date=>`?date=${date}`} /></div></MemoryRouter>)
  } else {
    const focusedProfile=scenario==='profile-reusable'
    const focusedDomain=scenario==='domain-history'
    const focusedSource=scenario==='source-evidence'
    const focusedReview=['review-awaiting','commit-optional'].includes(scenario)
    session = await createImportPlaygroundSession({role:focusedProfile?'OWNER':role,scenario:focusedProfile?'profile-review':focusedSource?'analyze-source':focusedDomain||scenario==='review-awaiting'?'preview-clean':scenario==='commit-optional'?'commit-review':scenario,condition:'sufficient',generation:1})
    const selection = session.getSnapshot()
    let content=<ImportPage selection={selection}/>
    if(focusedSource){
      // Existing source-context editor also has direct import-mapping-ui coverage.
      const issue={...selection.flowState.queue!.items[0],issue_type:'source_context' as const,target_field:null,source_header:'Nguồn kiểm kê',samples:['ingredient','on_hand','unit']}
      content=<main className="import-page"><div className="import-flow" style={{padding:24}}><ImportSourceContext state={selection.flowState} flow={selection.flow} issue={issue} canPropose onContinue={noop}/></div></main>
    }
    if(focusedReview){
      const bundle=structuredClone(selection.flowState.preview)!
      if(scenario==='commit-optional'){
        // Pure NO_OP is the existing reason-optional contract case, not a new flow.
        bundle.preview.rows.forEach(row=>{row.proposed_action='NO_OP';row.confirmation_required=false})
        bundle.preview.summary.groups.forEach(group=>{group.planned_update_count=0})
      }
      content=<main className="import-page"><div className="import-flow" style={{padding:24}}><ImportPreview stage="review" bundle={bundle} busy={false} locked={false} blockers={[]} reason="" acknowledged={false} reviewReason="" reviewAcknowledged={false} reviewBlockers={[]} resolutions={[]} supplierChanges={[]} onReviewReason={noop} onReviewAcknowledge={noop} onConfirmReview={noop} onResolutions={noop} onSupplierChanges={noop} onReason={noop} onAcknowledge={noop} onLoadMore={noop} onCommit={noop}/></div></main>
    }
    if(focusedProfile){
      // Exact-baseline comparison shape already covered by import-mapping-ui tests.
      const summary=structuredClone(selection.flowState.summary)!
      const proposal=summary.profile_proposals[0]
      const baseline=structuredClone(proposal.spec)!
      baseline.field_bindings[0].source_header='Số lượng trước'
      proposal.active_version=1
      summary.approved_profiles=[{binding:{profile_id:proposal.profile_id,version:1},spec:baseline} as never]
      content=<main className="import-page"><div className="import-flow" style={{padding:24}}><ImportProfileReview summary={summary} busy={false} locked={false} canDecide={role==='OWNER'} onDecision={noop}/></div></main>
    }
    if(focusedDomain){
      // Uses the mixed Sales/History and supplier Preview shapes from import-mapping-ui.
      const bundle=structuredClone(selection.flowState.preview)!
      const base=bundle.preview.rows[0]
      const sales={...base,row_id:'00000000-0000-4000-8000-000000000090',proposed_action:'REPLACE_DAILY_TOTAL',confirmation_required:true,before:{quantity:'0'},after:{quantity:'12'},blockers:[],warnings:[],source_location:{...base.source_location,row_number:2}}
      const history={...sales,row_id:'00000000-0000-4000-8000-000000000091',proposed_action:'CORRECT_HISTORY_RECORD',expected_version:'history/1',source_location:{...base.source_location,row_number:3}}
      const supplier={...sales,row_id:'00000000-0000-4000-8000-000000000092',proposed_action:'AMEND_TERM_PERIOD',canonical_domain:'supplier_terms'}
      bundle.preview.rows=[sales,history,supplier] as never
      content=<main className="import-page"><div className="import-flow" style={{padding:24}}><ImportDomainReview bundle={bundle} resolutions={[]} supplierChanges={[]} disabled={false} onResolutions={noop} onSupplierChanges={noop}/><ImportHistoryCorrections bundle={bundle} values={[]} onChange={noop} disabled={false}/></div></main>
    }
    const store = {state:{status:'mock_preview',store:{name:'Controlled Store',role,membership:{role,effective_permissions:[]}}},registerChangeGuard:()=>noop}
    root.render(<MemoryRouter><CurrentStore.Provider value={store as never}><DebugVisibility value={false}>
      <ImportEntitySearchContext value={async({kind,q})=>({items:[{id:'00000000-0000-4000-8000-000000000011',name:q||'Sữa tươi',code:'ING-014',kind}],nextCursor:null})}>
        <ImportResolutionView value={{identityMode:scenario==='resolve-new'?'new':'existing',sharedValueExpanded:scenario==='resolve-declaration'}}>{content}</ImportResolutionView>
      </ImportEntitySearchContext>
    </DebugVisibility></CurrentStore.Provider></MemoryRouter>)
  }
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
}
