import { StoreActivityPage } from '../features/operations/StoreActivityPage'
import { RecipeSchedulePage } from '../features/operations/RecipeSchedulePage'
import { PlanningHistoryPage } from '../features/operations/PlanningHistoryPage'
import { CredentialsPage, InvitationPage } from '../features/auth/OnboardingPages'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { lazy, Suspense } from 'react'
import { AppShell } from '../layouts/app-shell/AppShell'
import { AuthGuard, LoginRoute } from '../features/auth/AuthGuard'
import { StoreGate, StoreProvider } from '../features/store/StoreProvider'
import { ImportHistoryPage } from '../pages/import-history/ImportHistoryPage'
import { ImportPage } from '../pages/imports/ImportPage'
import { ImportWorkspace } from '../pages/imports/ImportWorkspace'
import { InventoryPage } from '../pages/inventory/InventoryPage'
import { MenuPage } from '../pages/menu/MenuPage'
import { HomePage } from '../pages/home/HomePage'
import { UnderConstructionPage } from '../shared/UnderConstruction'

const PlanningPage = lazy(() => import('../pages/forecast/PlanningPage').then((module) => ({ default: module.PlanningPage })))
const StorePage = lazy(() => import('../pages/store/StorePage').then((module) => ({ default: module.StorePage })))
function PlanningRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/forecast/planning', search, hash }} replace />
}

function LegacyImportHistoryRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/imports/history', search, hash }} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/credentials/complete" element={<CredentialsPage />} />
      <Route path="/invitations/:invitationId" element={<InvitationPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<StoreProvider><AppShell /></StoreProvider>}>
          <Route path="/store" element={<Suspense fallback={<p role="status">Đang tải Cửa hàng…</p>}><StorePage /></Suspense>} />
          <Route element={<StoreGate><Outlet /></StoreGate>}>
          <Route path="/store/activity" element={<StoreActivityPage />} />
          <Route path="/today" element={<UnderConstructionPage feature="Hôm nay" />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/menu/recipe" element={<RecipeSchedulePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/forecast/planning/history" element={<PlanningHistoryPage />} />
          <Route path="/forecast" element={<PlanningRedirect />} />
          <Route path="/forecast/planning" element={<Suspense fallback={<p role="status">Đang tải kế hoạch nhập…</p>}><PlanningPage /></Suspense>} />
          <Route path="/forecast/planning/results" element={<PlanningRedirect />} />
          <Route path="/imports" element={<ImportWorkspace />}>
            <Route index element={<ImportPage />} />
            <Route path="history" element={<ImportHistoryPage />} />
          </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/import-history" element={<LegacyImportHistoryRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
