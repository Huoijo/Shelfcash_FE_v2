import { config } from '../../app/config'
import { createOperationsApi } from './operations.data'
import { createMockOperationsSource } from './operations.fixtures'
export const operationsSource = config.mockPreview ? createMockOperationsSource() : createOperationsApi(config.apiBaseUrl)
