import { Navigate, Route, Routes, useLocation } from 'react-router'
import { AppShell } from '../layouts/app-shell/AppShell'
import { LoginPage } from '../pages/login/LoginPage'
import { ImportHistoryPage } from '../pages/import-history/ImportHistoryPage'
import { ImportPage } from '../pages/imports/ImportPage'
import { ImportWorkspace } from '../pages/imports/ImportWorkspace'

function LegacyImportHistoryRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/imports/history', search, hash }} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/imports" element={<ImportWorkspace />}>
          <Route index element={<ImportPage />} />
          <Route path="history" element={<ImportHistoryPage />} />
        </Route>
      </Route>
      <Route path="/import-history" element={<LegacyImportHistoryRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
