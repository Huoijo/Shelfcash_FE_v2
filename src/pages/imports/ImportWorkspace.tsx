import { useEffect, useState, useSyncExternalStore } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router'
import { config } from '../../app/config'
import { createImportDataSource } from '../../features/import-data/importData.data'
import { useCurrentStore } from '../../features/store/store.context'
import { ImportBatchWorkflow, type ImportBatchState } from '../../features/import-data/importData.workflow'
import { createMockImportDataSource } from '../../features/import-data/importData.fixtures'
import { createImportFlowDataSource } from '../../features/import-data/importFlow.data'
import { createMockImportFlowDataSource } from '../../features/import-data/importFlow.fixtures'
import { ImportFlowWorkflow, type ImportFlowState } from '../../features/import-data/importFlow.workflow'
import { ImportLocatorVisit } from '../../features/import-data/importFlow.locator'

export type ImportSelection = {
  state: ImportBatchState
  workflow: ImportBatchWorkflow
  flow: ImportFlowWorkflow
  flowState: ImportFlowState
  canDecideProfile: boolean
  canProposeMapping: boolean
  startNewDraft: () => void
}

// URL persists only an identifier locator. Every resumed state is read from I04;
// no workflow, credentials, preview content or mutation intent is stored locally.
export function ImportWorkspace() {
  const { currentStoreId } = useCurrentStore()
  return <ScopedImportWorkspace key={currentStoreId} storeId={currentStoreId} />
}

function ScopedImportWorkspace({ storeId }: { storeId: string | null }) {
  const { state: storeState } = useCurrentStore()
  const canDecideProfile = config.mockPreview || storeState.status === 'ready' && storeState.store.membership.role === 'OWNER'
  const permissions = storeState.status === 'ready' ? storeState.store.membership.effective_permissions : []
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const locator = searchParams.get('import_id')
  const [locatorVisit] = useState(() => new ImportLocatorVisit())
  const [{ workflow, flow }] = useState(() => {
    const mock = config.dataSource === 'mock' ? createMockImportDataSource({ continuation: true }) : undefined
    const workflow = new ImportBatchWorkflow(mock ?? createImportDataSource({ dataSource: config.dataSource, apiBaseUrl: config.apiBaseUrl }), storeId)
    const flow = new ImportFlowWorkflow(createImportFlowDataSource({
      dataSource: config.dataSource, apiBaseUrl: config.apiBaseUrl,
      ...(mock ? { mockSource: createMockImportFlowDataSource(mock) } : {}),
    }), {
      refreshBatch: async () => {
        await workflow.refresh()
        const snapshot = workflow.getSnapshot()
        if (!snapshot.fresh || snapshot.error) throw new Error(snapshot.error ?? 'Chưa có trạng thái lô hiện tại.')
        return snapshot.batch
      },
    })
    return { workflow, flow }
  })
  const state = useSyncExternalStore(workflow.subscribe, workflow.getSnapshot)
  const flowState = useSyncExternalStore(flow.subscribe, flow.getSnapshot)

  useEffect(() => {
    flow.setAuthorization(canDecideProfile, config.mockPreview ? [
      'mapping.propose', 'import.commit', 'inventory.count.correct', 'sales.record', 'sales.correct', 'sales.merge',
      'product.create', 'ingredient.create', 'recipe.create_version', 'supplier.create', 'supplier.terms.create',
      'supplier.terms.correct', 'supplier.fees.manage', 'budget.read',
    ] : storeState.status === 'ready' ? storeState.store.membership.effective_permissions : [])
  }, [storeState, canDecideProfile, flow])
  useEffect(() => {
    if (locatorVisit.claim(location.pathname, locator, state.draft?.import_id,
      state.processing || state.busy || !!state.retryOperation || flowState.busy || !!flowState.retryOperation) && locator) void workflow.resume(locator)
  }, [location.pathname, locator, state, flowState.busy, flowState.retryOperation, workflow, locatorVisit])
  useEffect(() => {
    // Never overwrite a user-provided target with a previous batch, including
    // while hydration is pending or failed. Publish a newly accepted I01 ID too.
    if (location.pathname !== '/imports' || !state.draft || locator) return
    const next = new URLSearchParams(searchParams)
    next.set('import_id', state.draft.import_id)
    setSearchParams(next, { replace: true })
  }, [location.pathname, state.draft, locator, searchParams, setSearchParams])
  useEffect(() => { flow.setBatch(state.batch) }, [flow, state.batch])
  useEffect(() => {
    if (!state.fresh || state.processing || state.busy || state.retryOperation || flowState.busy || flowState.retryOperation || flowState.error || !state.batch?.source_set.sealed) return
    if (flowState.pollAfterMs !== null || state.batch.active_job_id) return
    if (!flowState.summary && !flowState.completion && ['review_required', 'ready_for_preview', 'blocked', 'preview_ready', 'completed', 'completed_with_warnings'].includes(state.batch.status)) void flow.refresh()
  }, [state, flowState, flow])
  useEffect(() => {
    if (state.processing || state.busy || flowState.busy || flowState.retryOperation || flowState.error || flowState.pollAfterMs === null) return
    const timer = setTimeout(() => { void flow.pollJob() }, Math.max(250, flowState.pollAfterMs))
    return () => clearTimeout(timer)
  }, [state.processing, state.busy, flowState, flow])
  useEffect(() => () => flow.dispose(), [flow])

  const startNewDraft = () => {
    if (state.processing || state.busy || state.retryOperation || flowState.busy || flowState.retryOperation) return
    locatorVisit.suppress(location.pathname, locator)
    const next = new URLSearchParams(searchParams)
    next.delete('import_id')
    setSearchParams(next, { replace: true })
    workflow.startNewDraft()
  }
  return <Outlet context={{ state, workflow, flow, flowState, canDecideProfile,
    canProposeMapping: config.mockPreview || permissions.includes('mapping.propose'), startNewDraft } satisfies ImportSelection} />
}
