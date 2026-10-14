import { useSyncExternalStore } from 'react'
import type { ImportRole } from '../../features/import-data/importExperience'

export type DataCondition = 'sufficient' | 'missing' | 'ambiguous' | 'invalid'
export type PreviewRequest = { role: ImportRole; scenario: string; condition: DataCondition; generation: number }
let current: PreviewRequest | null = null
let generation = 0
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const getSnapshot = () => current
const serverSnapshot = () => null
export function selectImportPreview(role: ImportRole, scenario: string, condition: DataCondition = 'sufficient') {
  if (!import.meta.env.DEV) return
  current = { role, scenario, condition, generation: ++generation }
  listeners.forEach(listener => listener())
}
export function exitImportPreview() {
  current = null
  listeners.forEach(listener => listener())
}
export function useImportPreview() { return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot) }
