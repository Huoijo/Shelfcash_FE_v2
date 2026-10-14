import test from 'node:test'
import assert from 'node:assert/strict'
import { createImportPlaygroundSession } from '../src/shared/debug/importPlayground.session.ts'
import { importPlaygroundCatalog, happyPath } from '../src/shared/debug/importPlayground.catalog.ts'
import { analyzeAssessment, previewCanContinue } from '../src/features/import-data/importExperience.ts'

const request = (role,scenario,condition='sufficient') => ({role,scenario,condition,generation:1})
test('every Owner/Staff scenario seeds a usable isolated workflow context without HTTP',async()=>{
  const fetch=globalThis.fetch
  globalThis.fetch=()=>{throw new Error('Playground must not call HTTP')}
  try {
    for(const role of ['OWNER','STAFF']) {
      const ids=new Set(importPlaygroundCatalog[role].map(s=>s.id))
      for(const id of happyPath[role])assert.ok(ids.has(id),`${role} happy path ${id}`)
      for(const scenario of importPlaygroundCatalog[role]) {
        const world=await createImportPlaygroundSession(request(role,scenario.id))
        try {
          const state=world.getSnapshot()
          assert.equal(state.role,role)
          assert.equal(state.preview.screen,scenario.screen,`${role} ${scenario.id}`)
          if(scenario.step>1)assert.ok(state.flowState.summary,`${role} ${scenario.id} summary`)
          if(scenario.screen==='complete')assert.ok(state.flowState.completion,`${role} completion`)
          if(scenario.editor)assert.equal(state.flowState.queue.items.length,1,`${role} ${scenario.id} issue`)
          if(role==='STAFF')assert.equal(state.canDecideProfile,false)
          const errors=new Set(['resolve-permission','profile-failed','profile-conflict','profile-rejected','profile-retired','commit-permission','commit-retired','commit-failed','commit-uncertain'])
          if(!errors.has(scenario.id))assert.equal(state.flowState.error,null,`${role} ${scenario.id} should not acquire an unrelated error`)
          if(scenario.id==='profile-review')assert.equal(state.flowState.summary.profile_proposals[0].missing_fields.length,0)
        } finally { world.dispose() }
      }
    }
  } finally { globalThis.fetch=fetch }
})
test('error scenarios represent distinct business states and keep review fail-closed',async()=>{
  for(const [id,expected] of [['analyze-source','source_required'],['analyze-ambiguous','profile_ambiguous'],['analyze-none','no_profile'],['analyze-provider','provider_unavailable']]) {
    const world=await createImportPlaygroundSession(request('STAFF',id))
    const state=world.getSnapshot();assert.equal(analyzeAssessment(state.state,state.flowState),expected);world.dispose()
  }
  for(const id of ['preview-blocked','preview-stale']) {
    const world=await createImportPlaygroundSession(request('OWNER',id))
    assert.equal(previewCanContinue(world.getSnapshot().flowState),false);world.dispose()
  }
  const denied=await createImportPlaygroundSession(request('STAFF','commit-permission'))
  assert.equal(denied.getSnapshot().flowState.canCommit,false)
  assert.equal(denied.getSnapshot().flowState.fault.kind,'permission');denied.dispose()
})
test('uncertain commit retains a real mock intent and retry completes the same mock batch',async()=>{
  const world=await createImportPlaygroundSession(request('OWNER','commit-uncertain'))
  const before=world.getSnapshot()
  assert.equal(before.flowState.retryOperation,'commit')
  const id=before.state.batch.import_id
  await before.flow.retry()
  await world.poll();await world.poll()
  assert.equal(world.getSnapshot().flowState.completion.import_id,id)
  assert.equal(world.getSnapshot().flowState.retryOperation,null)
  world.dispose()
})
test('preset readouts remain separate from commit receipt and sessions cannot mutate one another',async()=>{
  const first=await createImportPlaygroundSession(request('OWNER','complete-ready'))
  const second=await createImportPlaygroundSession(request('STAFF','complete-blocked','missing'))
  assert.equal(first.getSnapshot().preview.readiness.actions[0].can_execute,true)
  assert.equal(second.getSnapshot().preview.readiness.actions[0].availability,'blocked')
  assert.equal(second.getSnapshot().flowState.completion.status,'completed')
  second.getSnapshot().flowState.completion.summary.rows=999
  assert.equal(first.getSnapshot().flowState.completion.summary.rows,2)
  first.dispose();second.dispose()
})
