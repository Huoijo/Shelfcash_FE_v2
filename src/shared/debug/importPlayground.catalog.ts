import type { ImportRole, ImportScreen, ResolutionGroup } from '../../features/import-data/importExperience'

export type PlaygroundScenario = { id: string; label: string; step: number; screen: ImportScreen; editor?: ResolutionGroup; submit?: boolean }
const group = (step: number, screen: ImportScreen, prefix: string, entries: readonly (readonly [string, string, ResolutionGroup?])[]): PlaygroundScenario[] => entries.map(([id, label, editor]) => ({ id: `${prefix}-${id}`, label, step, screen, editor }))
const file = group(1, 'upload', 'file', [['ready', 'Ready'], ['empty', 'Empty'], ['failed', 'Upload failed'], ['unsupported', 'Unsupported file'], ['conflict', 'Duplicate / conflict']])
const analyze = group(2, 'analyze', 'analyze', [['running', 'Running'], ['complete', 'Complete'], ['failed', 'Failed'], ['source', 'Source required'], ['ambiguous', 'Profile ambiguous'], ['none', 'No profile'], ['drift', 'Profile drift'], ['retired', 'Retired profile']])
const resolve = [['manual', 'Manual mapping required', 'structure'], ['identity', 'Identity unresolved', 'identity'], ['ambiguous', 'Identity ambiguous', 'identity'], ['declaration', 'Missing declaration', 'facts'], ['unit', 'Unit unresolved', 'units'], ['permission', 'Permission blocked']] as const
const preview = [['clean', 'Preview clean'], ['warnings', 'Preview warnings'], ['blocked', 'Preview blocked'], ['stale', 'Preview stale']] as const
const commit = [['review', 'Review ready'], ['processing', 'Processing'], ['permission', 'Permission changed'], ['retired', 'Profile retired before commit'], ['failed', 'Commit failed'], ['uncertain', 'Commit result uncertain']] as const
const completion = group(6, 'complete', 'complete', [['ready', 'Completed + Ready'], ['blocked', 'Completed + Not ready'], ['warnings', 'Completed with warnings']])
export const importPlaygroundCatalog: Record<ImportRole, PlaygroundScenario[]> = {
  OWNER: [...file, ...analyze, ...group(3, 'resolve', 'resolve', [['complete', 'Resolved'], ...resolve]),
    ...group(4, 'profile', 'profile', [['review', 'Review'], ['dirty', 'Dirty / edited'], ['approved', 'Approved'], ['failed', 'Approval failed'], ['conflict', 'Changed while reviewing'], ['rejected', 'Rejected'], ['retired', 'Profile retired']]),
    ...group(5, 'preview', 'preview', preview), ...group(5, 'review', 'commit', commit).map(s => s.id === 'commit-processing' || s.id === 'commit-uncertain' ? {...s, screen:'commit' as const} : s), ...completion],
  STAFF: [...file, ...analyze, ...group(2, 'analyze', 'analyze', [['provider', 'Provider unavailable']]),
    ...group(3, 'resolve', 'resolve', [['complete', 'Approved profile reused'], ...resolve, ['new', 'New entity', 'identity'], ['changed', 'Reusable spec changed'], ['submit', 'Submit for Owner approval'], ['waiting', 'Waiting for Owner'], ['approved', 'Owner approved'], ['rejected', 'Owner rejected']]).map(s => s.id === 'resolve-submit' ? {...s, submit:true} : s),
    ...group(4, 'preview', 'preview', preview), ...group(5, 'review', 'commit', [...commit, ['stale', 'Preview stale']]).map(s => s.id === 'commit-processing' || s.id === 'commit-uncertain' ? {...s, screen:'commit' as const} : s), ...completion],
}
export const playgroundSteps: Record<ImportRole, string[]> = {
  OWNER: ['File', 'Analyze', 'Resolve', 'Profile approval', 'Preview / Commit', 'Completion'],
  STAFF: ['File', 'Analyze', 'Resolve', 'Preview', 'Commit', 'Completion'],
}
export const happyPath: Record<ImportRole, string[]> = {
  OWNER: ['file-ready','analyze-complete','resolve-complete','profile-review','profile-approved','preview-clean','commit-review','commit-processing','complete-ready'],
  STAFF: ['file-ready','analyze-complete','resolve-complete','preview-clean','commit-review','commit-processing','complete-ready'],
}
export function previewScenario(role: ImportRole, id: string) { return importPlaygroundCatalog[role].find(s => s.id === id) ?? importPlaygroundCatalog[role][0] }
