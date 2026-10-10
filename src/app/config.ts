// Vite substitutes these public values at dev-server startup / build time.
const dataSource = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').trim().toLowerCase()
if (dataSource !== 'mock' && dataSource !== 'api') {
  throw new Error('VITE_DATA_SOURCE must be "mock" or "api".')
}

const apiBaseUrl = new URL(
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').trim(),
)
if (
  !['http:', 'https:'].includes(apiBaseUrl.protocol) ||
  apiBaseUrl.username || apiBaseUrl.password || apiBaseUrl.search || apiBaseUrl.hash
) {
  throw new Error('VITE_API_BASE_URL must be an HTTP(S) URL without credentials, query or fragment.')
}

const devStoreId = (import.meta.env.VITE_DEV_STORE_ID ?? '').trim()
if (devStoreId && !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(devStoreId)) {
  throw new Error('VITE_DEV_STORE_ID must be a canonical lowercase Store UUID.')
}

export const config = Object.freeze({
  dataSource,
  apiBaseUrl: apiBaseUrl.toString().replace(/\/+$/, ''),
  devStoreId: devStoreId || null,
})
