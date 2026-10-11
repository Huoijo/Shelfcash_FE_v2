import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { readFileSync } from 'node:fs'
import { authenticatedReturnPath } from '../src/features/auth/auth.navigation'
import { CurrentStore } from '../src/features/store/store.context'
import { mockStoreContext } from '../src/features/store/store.fixtures'
import { AuthContextValue } from '../src/features/auth/auth.context'
import { Sidebar } from '../src/layouts/app-shell/Sidebar'
import { AppShell } from '../src/layouts/app-shell/AppShell'
import { StorePage } from '../src/pages/store/StorePage'
import { StoreGate } from '../src/features/store/StoreProvider'

const h = React.createElement
const store = mockStoreContext()
const auth = { state: { status: 'authenticated', context: { user: { user_id: 'd1000000-0000-4000-8000-000000000099', email: 'current@example.invalid', display_name: 'Current' },
  session: { expires_at: '2026-10-12T00:00:00Z', absolute_expires_at: '2026-10-13T00:00:00Z', csrf_token: 'synthetic' }, default_store_id: store.store_id, accessible_store_count: 1, authorization_version: 'a1' } },
  login: async () => {}, logout: async () => {}, refresh: async () => {} }
function render(element, state = { status: 'ready', store }) {
  const ready = state.status === 'ready' || state.status === 'mock_preview'
  return renderToStaticMarkup(h(MemoryRouter, { initialEntries: ['/store'] }, h(AuthContextValue.Provider, { value: auth }, h(CurrentStore.Provider, { value: {
    state, currentStoreId: ready ? state.store.store_id : null, timezone: ready ? state.store.timezone : null,
    accessibleStores: [store], pagination: null, hasMore: false, listBusy: false, listError: null,
    retry() {}, loadMore: async () => {}, selectStore: async () => true, refresh: async () => {}, registerChangeGuard: () => () => {},
  } }, element))))
}
test('Login return accepts exact Store route with query and hash', () => {
  for (const target of ['/store', '/store?tab=members#permissions']) assert.equal(authenticatedReturnPath(target), target)
})
test('Store return rejects foreign origin and prefix lookalikes', () => {
  for (const target of ['/stores', '/store-evil', '//evil.example/store', 'https://evil.example/store']) assert.equal(authenticatedReturnPath(target), '/imports')
})
test('Sidebar exposes real URL-active Store link without fake href', () => {
  const html = render(h(Sidebar, { collapsed: false, onToggle() {} }))
  assert.match(html, /aria-current="page"[^>]*href="\/store"/)
  assert.doesNotMatch(html, /Cửa hàng — chưa triển khai/)
  assert.match(html, /Hôm nay — chưa triển khai/)
})
test('Store route is protected but outside StoreGate so no/multi Store can resolve', () => {
  const source = readFileSync('src/app/AppRouter.tsx', 'utf8')
  assert.ok(source.indexOf('<Route element={<AuthGuard') < source.indexOf('path="/store"'))
  assert.ok(source.indexOf('path="/store"') < source.indexOf('<Route element={<StoreGate'))
  assert.match(source, /path="\/imports" element={<ImportWorkspace/)
  assert.match(source, /path="\/forecast\/planning"/)
})
test('Shared shell keys all business outlets by Store and current authorization/catalog', () => {
  const source = readFileSync('src/layouts/app-shell/AppShell.tsx', 'utf8')
  assert.match(source, /membership.authorization_version/); assert.match(source, /permission_catalog_version/); assert.match(source, /<Outlet key={scope}/)
  assert.match(render(h(AppShell)), /app-shell__workspace/)
})
test('API Store workspace renders canonical identity and no DEV fixture notice', () => {
  const html = render(h(StorePage))
  assert.match(html, /Cửa hàng A/); assert.match(html, /Tổng quan/); assert.match(html, /Thiết lập vận hành/)
  assert.match(html, /Chưa được cung cấp/); assert.doesNotMatch(html, /dữ liệu và thay đổi chỉ ở bộ nhớ/)
})
test('Authenticated no-Store and multi-Store selection are not login failures', () => {
  assert.match(render(h(StorePage), { status: 'empty', message: 'No access' }), /Bạn chưa có cửa hàng/)
  assert.match(render(h(StorePage), { status: 'selecting', message: 'Chọn rõ cửa hàng' }), /Chọn rõ cửa hàng/)
  assert.match(render(h(StorePage), { status: 'selecting', message: 'Chọn rõ cửa hàng' }), /<select/)
})
test('Business StoreGate routes unselected user to Store without mounting children', () => {
  const html = render(h(StoreGate, null, h('p', null, 'Sensitive business facts')), { status: 'selecting', message: 'Choose store' })
  assert.match(html, /href="\/store"/); assert.doesNotMatch(html, /Sensitive business facts/)
})
