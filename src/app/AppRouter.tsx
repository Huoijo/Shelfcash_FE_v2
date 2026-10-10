import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '../pages/login/LoginPage'
import { ImportHistoryPage } from '../pages/import-history/ImportHistoryPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/import-history" element={<ImportHistoryPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
