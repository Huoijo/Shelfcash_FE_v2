import { Navigate, Route, Routes, useLocation } from 'react-router'
import { AppShell } from '../layouts/app-shell/AppShell'
import { AuthGuard, LoginRoute } from '../features/auth/AuthGuard'
import { StoreGate, StoreProvider } from '../features/store/StoreProvider'
import { ImportHistoryPage } from '../pages/import-history/ImportHistoryPage'
import { ImportPage } from '../pages/imports/ImportPage'
import { ImportWorkspace } from '../pages/imports/ImportWorkspace'
import { InventoryPage } from '../pages/inventory/InventoryPage'
import { MenuPage } from '../pages/menu/MenuPage'

function LegacyImportHistoryRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/imports/history', search, hash }} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<AuthGuard />}>
        <Route element={<StoreProvider><StoreGate><AppShell /></StoreGate></StoreProvider>}>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/imports" element={<ImportWorkspace />}>
            <Route index element={<ImportPage />} />
            <Route path="history" element={<ImportHistoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/import-history" element={<LegacyImportHistoryRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
