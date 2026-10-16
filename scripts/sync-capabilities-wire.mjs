import { readFileSync, writeFileSync } from 'node:fs'
import { loadWireSource } from './wire-source.mjs'

// Additive, callable data layer only. No route/UI or older feature pin is changed.
const publicOperations = new Set(['health_health_get','A01','A02','A05','A06','A07','N7'])
const source = loadWireSource('capabilities')
const selected = Object.values(source.paths).flatMap(verbs => Object.values(verbs).flatMap(op => op.operationId ? [op.operationId] : []))
if (new Set(selected).size !== selected.length) throw Error('Duplicate operation IDs')
const schemas = {}
const definitions = {}
const identifier = name => 'Wire' + name.replace(/[^A-Za-z0-9_]/g, '_')
const supported = new Set(['$ref','type','const','enum','anyOf','oneOf','properties','required','additionalProperties','items','prefixItems','minLength','maxLength','pattern','format','minimum','maximum','exclusiveMinimum','exclusiveMaximum','minItems','maxItems','uniqueItems','default','writeOnly','deprecated'])
function assertSchema(s) {
  for (const key of Object.keys(s)) if (!supported.has(key)) throw Error('Unsupported schema keyword: '+key)
  if (s.type && !['string','integer','number','boolean','null','object','array'].includes(s.type)) throw Error('Unsupported schema type')
  if (s.format && !['uuid','date','date-time','binary','password'].includes(s.format)) throw Error('Unsupported format: '+s.format)
  for(const v of Object.values(s.properties??{})) assertSchema(v)
  for(const v of [...(s.anyOf??[]),...(s.oneOf??[])]) assertSchema(v)
  if(s.items)assertSchema(s.items)
  for (const item of s.prefixItems??[]) assertSchema(item)
  if(typeof s.additionalProperties==='object')assertSchema(s.additionalProperties)
}
function project(value) {
  if (Array.isArray(value)) return value.map(project)
  if (value === null || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).filter(([k]) => !['title','description','example','examples','discriminator'].includes(k)).map(([k,v]) => [k, k === 'properties' ? Object.fromEntries(Object.entries(v).map(([p,s]) => [p,project(s)])) : project(v)]))
}
function visit(schema) {
  if (!schema || typeof schema !== 'object') return
  if (schema.$ref) {
    const name = schema.$ref.split('/').at(-1)
    if (!schemas[name]) {
      if (!source.components.schemas[name]) throw Error('Missing schema: '+name)
      schemas[name] = project(source.components.schemas[name])
      assertSchema(schemas[name])
      visit(schemas[name])
    }
  }
  for (const value of Object.values(schema)) if (typeof value === 'object') visit(value)
}
function type(s) {
  if (s.$ref) return identifier(s.$ref.split('/').at(-1))
  if ('const' in s) return JSON.stringify(s.const)
  if (s.format === 'binary') return 'File'
  if (s.enum) return s.enum.map(v=>JSON.stringify(v)).join(' | ')
  if (s.anyOf || s.oneOf) return '('+(s.anyOf??s.oneOf).map(type).join(' | ')+')'
  if (s.type === 'array') {
    if (s.prefixItems) {
      if (s.minItems !== s.prefixItems.length || s.maxItems !== s.prefixItems.length) throw Error('Only fixed-length tuples supported')
      return '['+s.prefixItems.map(type).join(', ')+']'
    }
    return '('+type(s.items??{})+')[]'
  }
  if (s.type === 'object' || s.properties) {
    const fields = Object.entries(s.properties??{}).map(([k,v])=>`${JSON.stringify(k)}${s.required?.includes(k)?'':'?'}: ${type(v)}`)
    if (s.additionalProperties && typeof s.additionalProperties === 'object') fields.push(`[key: string]: ${type(s.additionalProperties)}`)
    else if(s.additionalProperties === true) fields.push('[key: string]: JsonValue')
    return fields.length ? '{ '+fields.join('; ')+' }' : 'Record<string, never>'
  }
  return {string:'string',integer:'number',number:'number',boolean:'boolean',null:'null'}[s.type]??'JsonValue'
}
for (const [path, verbs] of Object.entries(source.paths)) for (const [method, op] of Object.entries(verbs)) {
  if (!selected.includes(op.operationId)) continue
  const pathParams = {}, query = {}, requiredPath = [], requiredQuery = []
  for (const p of op.parameters??[]) {
    if (p.in === 'path') { pathParams[p.name] = project(p.schema); if(p.required) requiredPath.push(p.name) }
    if (p.in === 'query') { query[p.name] = project(p.schema); if(p.required) requiredQuery.push(p.name) }
  }
  const request = {type:'object',additionalProperties:false,properties:{path:{type:'object',properties:pathParams,required:requiredPath,additionalProperties:false},query:{type:'object',properties:query,required:requiredQuery,additionalProperties:false}},required:Object.keys(pathParams).length?['path']:[]}
  const multipart=!!op.requestBody?.content?.['multipart/form-data']
  const body=op.requestBody?.content?.[multipart?'multipart/form-data':'application/json']?.schema
  if (body) { request.properties.body=project(body); if(op.requestBody.required) request.required.push('body') }
  const mutation=method!=='get'
  const key=mutation&&(op.parameters??[]).some(p=>p.name==='Idempotency-Key')
  const cas=mutation&&(op.parameters??[]).some(p=>p.name==='If-Match')
  if(key) { request.properties.key=op.operationId==='T03'?{type:'string',minLength:1,maxLength:128,pattern:'^[!-~]+$'}:{type:'string',format:'uuid'}; request.required.push('key') }
  if(cas) { request.properties.revision={type:'string',minLength:1,maxLength:256}; if(op.operationId !== 'N4') request.required.push('revision') }
  if(op.operationId === 'N4') request.properties.ifNoneMatch={type:'string',const:'*'}
  if((op.parameters??[]).some(p=>p.name==='X-Invitation-Token')) { request.properties.invitationToken={type:'string',minLength:1,maxLength:512}; request.required.push('invitationToken') }
  const headerSchemas=Object.fromEntries((op.parameters??[]).filter(p=>p.in==='header').map(p=>[p.name,project(p.schema)]))
  const responses=Object.entries(op.responses).filter(([code])=>code.startsWith('2')).map(([,r])=>r.content?.['application/json']?.schema).filter(Boolean)
  const unique=[...new Map(responses.map(s=>[JSON.stringify(s),s])).values()]
  const responseKind=op.operationId==='health_health_get'?'document':Object.values(op.responses).some(r=>r.content?.['application/pdf'])?'pdf':Object.hasOwn(op.responses,'204')?'empty':'envelope'
  const response=unique.length===1?project(unique[0]):unique.length?{anyOf:unique.map(project)}:{type:'null'}
  if(!unique.length && !['pdf','empty'].includes(responseKind))throw Error('No JSON response: '+op.operationId)
  assertSchema(request);assertSchema(response);visit(request);visit(response)
  definitions[op.operationId]={method:method.toUpperCase(),path,auth:publicOperations.has(op.operationId)?'public':'protected',key,cas,multipart,responseKind,statuses:Object.keys(op.responses).filter(code=>code.startsWith('2')).map(Number),headerSchemas,request,response}
}
for(const id of selected) if(!definitions[id]) throw Error('Missing operation: '+id)
const ordered=Object.keys(schemas).sort()
let result='// Generated by scripts/sync-capabilities-wire.mjs from hash-pinned contracts/020/openapi.main.json.\n// Additive data-layer capabilities; not runtime UI integration or live acceptance.\nimport type { JsonSchema } from "./capabilities.validation"\nexport type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }\n'
result+=ordered.map(n=>`export type ${identifier(n)} = ${type(schemas[n])}`).join('\n')+'\n'
result+='export type CapabilityContracts = {\n'+selected.map(id=>`  ${id}: { input: ${type(definitions[id].request)}; output: ${definitions[id].responseKind==='empty'?'void':definitions[id].responseKind==='pdf'?'Blob':type(definitions[id].response)} }`).join('\n')+'\n}\n'
result+='export type CapabilityOperation = keyof CapabilityContracts\n'
result+='export type CapabilityReadOperation = '+selected.filter(id=>definitions[id].method==='GET').map(id=>JSON.stringify(id)).join(' | ')+'\n'
result+='export type CapabilityWriteOperation = Exclude<CapabilityOperation, CapabilityReadOperation>\n'
result+='export const capabilityOperations: Record<CapabilityOperation, {method: string; path: string; auth: "public" | "protected"; key: boolean; cas: boolean; multipart: boolean; responseKind: "document" | "envelope" | "pdf" | "empty"; statuses: number[]; headerSchemas: Record<string, JsonSchema>; request: JsonSchema; response: JsonSchema}> = '+JSON.stringify(definitions,null,2)+'\n'
result+='export const capabilitySchemas: Record<string, JsonSchema> = {\n'+ordered.map(n=>'  '+JSON.stringify(n)+': '+JSON.stringify(schemas[n])+',').join('\n')+'\n}\n'
const output=new URL('../src/features/backend-capabilities/capabilities.wire.ts',import.meta.url)
if(process.argv.includes('--check')) { if(readFileSync(output,'utf8')!==result)throw Error('Capabilities wire drift; regenerate after reviewing pinned source') }
else writeFileSync(output,result)
console.log(`Capabilities wire ${process.argv.includes('--check')?'PASS':'generated'}: ${selected.length} operations, ${ordered.length} schemas`)
const coverage={
  source:'contracts/020/openapi.main.json',
  sourceSha:'d5cfbfb59de7c45bc08eb47129b5ba3919e05473',
  sourceSha256:'18fb4eabe469c69c817fcf5f0c5b4764c3feb1a886adb71b382c19b347147f7a',
  evidence:'Typed callable service + controlled tests; no live acceptance; existing UI consumers/pins not migrated.',
  operations:selected.map(id=>({operationId:id,method:definitions[id].method,path:definitions[id].path,responseKind:definitions[id].responseKind,service:'IMPLEMENTED',applicationState:definitions[id].method==='GET'?'SCOPED_READ':'EXPLICIT_MUTATION',uiChange:'NONE',liveVerification:'NOT_RUN'})),
}
const coveragePath=new URL('../docs/testing/BACKEND_CAPABILITY_COVERAGE.json',import.meta.url)
const coverageText=JSON.stringify(coverage,null,2)+'\n'
if(process.argv.includes('--check')) { if(readFileSync(coveragePath,'utf8')!==coverageText)throw Error('Capabilities coverage inventory drift') }
else writeFileSync(coveragePath,coverageText)
