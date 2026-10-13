import { HttpError } from '../../shared/http/httpClient'
import type { Intent } from './operations.data'

export const uncertainMutation = (error: unknown) => error instanceof HttpError && (['transport','protocol'].includes(error.kind) || (error.status ?? 0) >= 500)
/** One logical mutation. Keep the captured body/key/CAS across ambiguous responses. */
export class Mutation<T, R> {
  intent: Intent<T> | null = null
  busy = false
  uncertain = false
  async send(request: T, version: string | undefined, action: (intent: Intent<T>) => Promise<R>): Promise<R> {
    if(this.busy) throw new Error('Đang xử lý yêu cầu.')
    if(!this.intent) this.intent = { key: crypto.randomUUID(), request: structuredClone(request), ...(version ? { version } : {}) }
    this.busy = true
    try {
      const result = await action(structuredClone(this.intent))
      this.intent = null; this.uncertain = false
      return result
    } catch(error) {
      this.uncertain = this.uncertain || uncertainMutation(error)
      if(!this.uncertain) this.intent = null
      throw error
    } finally { this.busy = false }
  }
}
