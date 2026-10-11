import { useEffect, useState, useSyncExternalStore } from 'react'
import { Outlet } from 'react-router'
import { config } from '../../app/config'
import { createImportDataSource } from '../../features/import-data/importData.data'
import { useCurrentStore } from '../../features/store/store.context'
import { ImportBatchWorkflow, type ImportBatchState } from '../../features/import-data/importData.workflow'

export type ImportSelection = {
  state: ImportBatchState
  workflow: ImportBatchWorkflow
}

// The active batch and exact retry intents survive Import ↔ History only.
// Refresh/leaving destroys memory; this does not pretend to resume server drafts.
export function ImportWorkspace() {
  const { currentStoreId } = useCurrentStore()
  return <ScopedImportWorkspace key={currentStoreId} storeId={currentStoreId} />
}

function ScopedImportWorkspace({ storeId }: { storeId: string | null }) {
  const [workflow] = useState(() => new ImportBatchWorkflow(
    createImportDataSource({ dataSource: config.dataSource, apiBaseUrl: config.apiBaseUrl }),
    storeId,
  ))
  const state = useSyncExternalStore(workflow.subscribe, workflow.getSnapshot)

  useEffect(() => {
    if (config.dataSource !== 'api' || !state.fresh || state.busy || state.retryOperation || state.batch?.status !== 'analyzing') return
    const timer = setTimeout(() => { void workflow.refresh() }, Math.max(2000, state.batch.poll_after_ms ?? 2000))
    return () => clearTimeout(timer)
  }, [state, workflow])

  return <Outlet context={{ state, workflow } satisfies ImportSelection} />
}
