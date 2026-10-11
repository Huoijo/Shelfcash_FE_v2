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

// Fixtures are an explicit local preview, never a production authentication bypass.
const mockPreview = dataSource === 'mock' && import.meta.env.DEV === true
if (dataSource === 'mock' && !mockPreview) {
  throw new Error('Mock preview is development-only. Build deployment with VITE_DATA_SOURCE=api.')
}

export const config = Object.freeze({
  dataSource,
  apiBaseUrl: apiBaseUrl.toString().replace(/\/+$/, ''),
  mockPreview,
})
