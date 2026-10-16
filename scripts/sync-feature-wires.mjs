import { readFileSync, writeFileSync } from 'node:fs'
import { loadWireSource } from './wire-source.mjs'
const source = loadWireSource('capabilities').components.schemas
const identifier = n => `Wire${n.replace(/[^A-Za-z0-9_]/g, '_')}`
function project(s) {
  if (Array.isArray(s)) return s.map(project)
  if (s === null || typeof s !== 'object') return s
  return Object.fromEntries(Object.entries(s).filter(([k]) => !['title','description','example','examples','discriminator'].includes(k)).map(([k,v]) => [k,k==='properties'?Object.fromEntries(Object.entries(v).map(([p,x])=>[p,project(x)])):project(v)]))
}
function type(s) {
  if(s.$ref)return identifier(s.$ref.split('/').at(-1))
  if('const' in s)return JSON.stringify(s.const)
  if(s.enum)return s.enum.map(v=>JSON.stringify(v)).join(' | ')
  if(s.anyOf||s.oneOf)return `(${(s.anyOf??s.oneOf).map(type).join(' | ')})`
  if(s.type==='array')return `(${type(s.items??{})})[]`
  if(s.type==='object'||s.properties){const fields=Object.entries(s.properties??{}).map(([k,v])=>`${JSON.stringify(k)}${s.required?.includes(k)?'':'?'}: ${type(v)}`);if(typeof s.additionalProperties==='object')fields.push(`[key: string]: ${type(s.additionalProperties)}`);else if(s.additionalProperties===true)fields.push('[key: string]: JsonValue');return fields.length?`{ ${fields.join('; ')} }`:'Record<string, never>'}
  return {string:'string',integer:'number',number:'number',boolean:'boolean',null:'null'}[s.type]??'JsonValue'
}
for(const [feature,file,marker] of [['Planning','src/features/decision-planning/planning.wire.ts','PlanningWireSchema'],['Store','src/features/store-workspace/storeWorkspace.wire.ts','StoreWireSchema'],['Operations','src/features/operations/operations.wire.ts','OperationsWireSchema']]){
  const old=readFileSync(file,'utf8'),names=new Set([...old.matchAll(/^  ("[^"]+"): /gm)].map(m=>JSON.parse(m[1])))
  function visit(n){if(!source[n])throw Error('Missing schema '+n);for(const[,ref]of JSON.stringify(source[n]).matchAll(/"\$ref":"#\/components\/schemas\/([^" ]+)"/g))if(!names.has(ref)){names.add(ref);visit(ref)}}
  for(const n of names)visit(n)
  const ordered=[...names].sort()
  let result=old.slice(0,old.indexOf('export type Wire'))+ordered.map(n=>`export type ${identifier(n)} = ${type(source[n])}`).join('\n')+'\n\n'+old.slice(old.indexOf(`export type ${marker}`))
  result=result.replace(new RegExp(`const schemas: Record<string, ${marker}> = \\{[\\s\\S]*?\\n\\}`),'const schemas: Record<string, '+marker+'> = {\n'+ordered.map(n=>`  ${JSON.stringify(n)}: ${JSON.stringify(project(source[n]))},`).join('\n')+'\n}')
  result=result.replaceAll('contracts/011/openapi.main.json','contracts/016/openapi.main.json')
  if(process.argv.includes('--check')){if(old!==result)throw Error(feature+' main wire drift')}else writeFileSync(file,result)
  console.log(`${feature} main closure: ${ordered.length} schemas`)
}
