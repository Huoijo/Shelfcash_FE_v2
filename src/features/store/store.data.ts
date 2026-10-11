import { requestJson } from '../../shared/http/httpClient'
import type { StoreDataSource } from './store.types'
import { validateStoreContext, validateStoreList } from './store.validation'

export function createStoreDataSource(apiBaseUrl: string): StoreDataSource {
  return {
    async list(signal, cursor) {
      const query = new URLSearchParams()
      if (cursor !== undefined) {
        if (!cursor || cursor.length > 4096) throw new Error('Cursor Store phải có từ 1 đến 4096 ký tự.')
        query.set('cursor', cursor)
      }
      const suffix = query.size ? `?${query}` : ''
      const response = await requestJson<unknown>(apiBaseUrl, `/api/v1/stores${suffix}`, { signal })
      return validateStoreList(response)
    },
    async read(storeId, signal) {
      if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(storeId)) throw new Error('Store ID chưa hợp lệ.')
      const response = await requestJson<unknown>(apiBaseUrl, `/api/v1/stores/${storeId}`, { signal })
      return validateStoreContext(response, storeId)
    },
  }
}
