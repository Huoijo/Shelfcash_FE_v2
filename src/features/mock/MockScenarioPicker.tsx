import { config } from '../../app/config'
import { mockScenario,scenarios } from './mockRepository'
import '../operations/Operations.css'
export function MockScenarioPicker() {
  if(!config.mockPreview)return null
  function choose(value:string) {sessionStorage.setItem('shelfcash:dev-scenario:v1',value);window.location.assign('/store')}
  return <aside className="sc-dev-scenario" aria-label="DEV scenarios"><strong>DEV · dữ liệu minh họa</strong><label>Scenario <select aria-label="DEV scenario" value={mockScenario} onChange={e=>choose(e.target.value)}>{scenarios.map(s=><option key={s}>{s}</option>)}</select></label><button onClick={()=>choose(mockScenario)}>Reset dữ liệu giả</button><span>Dữ liệu giả trong bộ nhớ; reload sẽ reset. Chỉ giữ ID scenario.</span></aside>
}
