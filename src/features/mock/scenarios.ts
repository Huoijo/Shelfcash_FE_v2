export const scenarios=['owner-ready','staff-importer','staff-readonly','multi-store','no-store','empty-store','transport-error','revision-conflict'] as const
export type MockScenario = typeof scenarios[number]
function readScenario():MockScenario {
  try { const s=sessionStorage.getItem('shelfcash:dev-scenario:v1');if(scenarios.includes(s as MockScenario))return s as MockScenario } catch { /* SSR/test has no browser storage. */ }
  return 'owner-ready'
}
export const mockScenario=readScenario()
