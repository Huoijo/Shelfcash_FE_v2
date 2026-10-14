import type { ImportRole } from '../../features/import-data/importExperience'
import { happyPath, importPlaygroundCatalog, playgroundSteps, previewScenario } from './importPlayground.catalog'
import { exitImportPreview, selectImportPreview, useImportPreview, type DataCondition } from './importPlayground.store'

export function ImportPlaygroundControls() {
  const preview = useImportPreview()
  const role: ImportRole = preview?.role ?? 'OWNER'
  const current = preview ? previewScenario(role, preview.scenario) : null
  const condition = preview?.condition ?? 'sufficient'
  const choose = (id: string, nextRole = role, data = condition) => selectImportPreview(nextRole, id, data)
  const path = happyPath[role], index = current ? path.indexOf(current.id) : -1
  function move(delta: number) {
    const next = index < 0 ? delta > 0 ? 0 : path.length - 1 : Math.max(0, Math.min(path.length - 1, index + delta))
    choose(path[next],role,'sufficient')
  }
  return <section className="playground-controls" aria-label="Import UI State Playground">
    <label>Role<select aria-label="Role" value={role} onChange={e => choose('file-ready', e.target.value as ImportRole, 'sufficient')}><option>OWNER</option><option>STAFF</option></select></label>
    <label>Step<select aria-label="Step" value={current?.step ?? 1} onChange={e => choose(importPlaygroundCatalog[role].find(s => s.step === Number(e.target.value))!.id)}>{playgroundSteps[role].map((step, i) => <option key={step} value={i+1}>{i+1} · {step}</option>)}</select></label>
    <label>Scenario<select aria-label="Scenario" value={current?.id ?? ''} onChange={e => choose(e.target.value)}>{!current && <option value="">Current import · select a preview</option>}{importPlaygroundCatalog[role].filter(s => s.step === (current?.step ?? 1)).map(s => <option key={s.id} value={s.id}>{playgroundSteps[role][s.step-1]} · {s.label}</option>)}</select></label>
    <div className="playground-current" aria-label="Current preview"><strong>Current preview</strong><span>{current ? `${role} · ${playgroundSteps[role][current.step-1]} · ${current.label}` : 'Current import · preview inactive'}</span></div>
    <div className="playground-actions"><button onClick={() => move(-1)} disabled={index === 0}>← Previous state</button><button onClick={() => move(1)} disabled={index === path.length-1}>Next state →</button></div>
    <label>Data condition<select aria-label="Data condition" value={condition} onChange={e => {
      const next = e.target.value as DataCondition
      choose(next === 'sufficient' ? 'complete-ready' : next === 'missing' ? 'complete-blocked' : next === 'ambiguous' ? 'analyze-ambiguous' : 'preview-blocked', role, next)
    }}><option value="sufficient">Đủ dữ liệu</option><option value="missing">Thiếu dữ liệu</option><option value="ambiguous">Dữ liệu mơ hồ</option><option value="invalid">Dữ liệu lỗi</option></select></label>
    <label>Simulate error<select aria-label="Simulate error" value="" onChange={e => { if(e.target.value) choose(e.target.value) }}><option value="">Select error…</option>{[['analyze-failed','Analyze failed'],['analyze-source','Source unresolved'],['commit-permission','Permission revoked'],['commit-retired','Profile retired'],['preview-stale','Preview stale'],['preview-blocked','Preview blocked'],['commit-failed','Commit failed'],['commit-uncertain','Lost acknowledgement'],['complete-blocked','Readiness not ready']].map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    <fieldset><legend>Happy path</legend><div className="playground-actions">{(['OWNER','STAFF'] as const).flatMap(r => [<button key={`${r}-start`} onClick={() => choose('file-ready',r,'sufficient')}>{r} · Start</button>,<button key={`${r}-final`} onClick={() => choose('complete-ready',r,'sufficient')}>{r} · Final</button>])}</div></fieldset>
    <div className="playground-actions"><button onClick={() => choose('file-ready',role,'sufficient')}>Reset scenario</button>{preview && <button onClick={exitImportPreview}>Return to current import</button>}</div>
  </section>
}
