// Node test helpers using the repository's existing node:test fetch interception convention.
import assert from 'node:assert/strict'
import { configureHttpSession } from '../../src/shared/http/httpClient'
export function memoryPreparationJournal(seed=[]) {
  const rows=new Map(seed.map(r=>[r.id,structuredClone(r)])),events=[]
  return {rows,events,
    async reserve(r){events.push('reserve');if([...rows.values()].some(p=>p.id===r.id||(p.scope===r.scope&&['pending','unknown'].includes(p.state))))throw Error('Unresolved intent conflict');rows.set(r.id,structuredClone(r))},
    async update(id,state,ids){const r=rows.get(id);assert.ok(r);if(['confirmed','rejected'].includes(r.state)){if(state===r.state||state==='unknown')return;throw Error('Terminal state cannot regress')}
      r.state=state;if(ids)r.receipt_ids=structuredClone(ids);events.push(state)},
    async list(actor,store){return structuredClone([...rows.values()].filter(r=>r.actor_user_id===actor&&r.store_id===store))},
  }
}
export function strictAssistantTransport(t,replies) {
  const queue=[...replies],calls=[]
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    // Never delegates to a real transport, including unexpected C03/provider paths.
    assert.equal(new URL(url).origin,'https://assistant-preparation.invalid')
    const call={url,method:options.method??'GET',body:options.body?JSON.parse(options.body):undefined,key:options.headers.get('Idempotency-Key')};calls.push(call)
    const reply=queue.shift();assert.ok(reply,`Unplanned request: ${call.method} ${url}`)
    assert.equal(call.method,reply.method);assert.ok(url.endsWith(reply.path),`Unexpected path: ${url}`)
    if(reply.reject)throw Error('QA synthetic response lost')
    return new Response(JSON.stringify(reply.response),{status:reply.status??200,headers:{'Content-Type':'application/json'}})
  })
  t.after(configureHttpSession({getCsrfToken:()=> 'qa-controlled-csrf',onUnauthenticated:()=>{}}))
  t.after(()=>assert.equal(queue.length,0,'Not all planned requests were consumed'))
  return calls
}
export function assertProtectedFactsCleared(state) {assert.equal(state.chat,null);assert.equal(state.summary,null);assert.deepEqual(state.history,[])}
export function assertMetadataOnly(record) {
  assert.equal(record.operation_id,'AS03');assert.equal(record.replay_input,undefined);assert.equal(record.receipt_ids,undefined)
  const allowed=['id','scope','actor_user_id','store_id','operation_id','phase','method','path','resource_ids','idempotency_key','original_cas','created_at','payload_sha256','state']
  assert.ok(Object.keys(record).every(k=>allowed.includes(k)))
}
export function assertOriginalTurnReplay(first,second){assert.equal(second.key,first.key);assert.deepEqual(second.body,first.body)}
export function assertExplicitContinuation(first,next,clarification,kind,id) {
  assert.notEqual(next.key,first.key);assert.equal(next.body.question,clarification.original_question)
  if(kind==='product'){assert.equal(next.body.context.product_id,id);assert.equal(Object.hasOwn(next.body,'product_id'),false)}
  else assert.equal(next.body[`${kind}_id`],id)
}

export function assertSummaryMatchesCurrentEvidence(summary,version){assert.equal(summary.result?.identity.aggregate_digest,version,'Retained Summary must not be presented as current under another evidence pin')}
