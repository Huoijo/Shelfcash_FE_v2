import { test, expect, type Page } from '@playwright/test'
import { backend, env, errorResponse, s, user } from './helpers/api'

const auth = () => env({
  user: { user_id: user, email: 'controlled@example.invalid', display_name: 'QA' },
  session: { expires_at: '2027-01-01T00:00:00Z', absolute_expires_at: '2027-01-02T00:00:00Z', csrf_token: 'controlled-csrf' },
  default_store_id: s, accessible_store_count: 1, authorization_version: 'controlled-auth/1',
})
async function submitLogin(page: Page) {
  await page.getByLabel('Email', { exact: true }).fill('controlled@example.invalid')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('controlled-password')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
}

for (const failure of ['server', 'transport', 'protocol'] as const) {
  test(`login remains usable after ${failure} session failure; retry confirms session`, async ({ page }) => {
    let recovered = false, businessReads = 0, logins = 0
    await backend(page, (path) => {
      if (path === '/api/v1/auth/me') {
        if (recovered) return auth()
        return failure === 'server' ? errorResponse(503, 'SERVICE_UNAVAILABLE')
          : failure === 'transport' ? 'ABORT' : env({ malformed: true })
      }
      if (path === '/api/v1/auth/login') logins++
      else businessReads++
    })
    await page.goto('/login')
    await expect(page.getByRole('alert')).toContainText('Chưa xác nhận được phiên đăng nhập')
    await expect(page.getByLabel('Email', { exact: true })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeEnabled()
    expect(businessReads).toBe(0)
    recovered = true
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
    await expect(page).toHaveURL(/\/imports$/)
    await expect(page.getByRole('heading', { name: 'Nhập dữ liệu', exact: true })).toBeVisible()
    expect(logins).toBe(0)
  })
}

test('protected session error offers login and returns to the original Import URL only after verification', async ({ page }) => {
  let loggedIn = false, readsAfterLogin = 0, businessReads = 0
  await backend(page, (path, method) => {
    if (path === '/api/v1/auth/me') {
      if (!loggedIn) return errorResponse(503, 'SERVICE_UNAVAILABLE')
      readsAfterLogin++
      return auth()
    }
    if (path === '/api/v1/auth/login') {
      expect(method).toBe('POST')
      loggedIn = true
      return auth()
    }
    businessReads++
  })
  const destination = '/imports?mode=resume#upload'
  await page.goto(destination)
  await expect(page.getByRole('heading', { name: 'Không kiểm tra được phiên đăng nhập' })).toBeVisible()
  expect(businessReads).toBe(0)
  await page.getByRole('link', { name: 'Đăng nhập lại' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await submitLogin(page)
  await expect(page).toHaveURL(new RegExp(destination.replace('?', '\\?') + '$'))
  await expect(page.getByRole('heading', { name: 'Nhập dữ liệu', exact: true })).toBeVisible()
  expect(readsAfterLogin).toBe(1)
})

test('protected retry recovers without a login request', async ({ page }) => {
  let recovered = false, logins = 0
  await backend(page, (path) => {
    if (path === '/api/v1/auth/me') return recovered ? auth() : errorResponse(503, 'SERVICE_UNAVAILABLE')
    if (path === '/api/v1/auth/login') logins++
  })
  await page.goto('/imports')
  await expect(page.getByRole('heading', { name: 'Không kiểm tra được phiên đăng nhập' })).toBeVisible()
  recovered = true
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nhập dữ liệu', exact: true })).toBeVisible()
  expect(logins).toBe(0)
})

test('401 redirects to login without treating it as a session-check error', async ({ page }) => {
  let businessReads = 0
  await backend(page, (path) => {
    if (path === '/api/v1/auth/me') return errorResponse(401, 'UNAUTHENTICATED')
    businessReads++
  })
  await page.goto('/imports')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel('Email', { exact: true })).toBeEnabled()
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(businessReads).toBe(0)
})

test('accepted login with failed session verification stays protected and can recover through a read', async ({ page }) => {
  let recovered = false, logins = 0, businessReads = 0
  await backend(page, (path) => {
    if (path === '/api/v1/auth/me') return recovered ? auth() : errorResponse(503, 'SERVICE_UNAVAILABLE')
    if (path === '/api/v1/auth/login') { logins++; return auth() }
    businessReads++
  })
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Thử lại', exact: true })).toBeVisible()
  await submitLogin(page)
  await expect(page.getByRole('alert').filter({ hasText: 'Máy chủ đăng nhập hiện chưa khả dụng' })).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: 'Thử lại', exact: true })).toBeVisible()
  expect(businessReads).toBe(0)
  recovered = true
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nhập dữ liệu', exact: true })).toBeVisible()
  expect(logins).toBe(1)
})
