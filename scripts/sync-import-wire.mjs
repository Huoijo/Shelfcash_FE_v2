import {readFileSync,writeFileSync} from 'node:fs'
import {loadWireSource} from './wire-source.mjs'
const path='src/features/import-data/importFlow.wire.ts'
const wire=readFileSync(path,'utf8'),current=loadWireSource('import').components.schemas
const identifier = (name) => `Wire${name.replace(/[^A-Za-z0-9_]/g, '_')}`

function project(schema) {
  if (Array.isArray(schema)) return schema.map(project)
  if (schema === null || typeof schema !== 'object') return schema
  return Object.fromEntries(Object.entries(schema)
    .filter(([key]) => !['title', 'description', 'examples', 'example', 'discriminator'].includes(key))
    .map(([key, value]) => [key, key === 'properties'
      ? Object.fromEntries(Object.entries(value).map(([property, definition]) => [property, project(definition)]))
      : project(value)]))
}

function type(schema) {
  if (schema.$ref) return identifier(schema.$ref.split('/').at(-1))
  if ('const' in schema) return JSON.stringify(schema.const)
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ')
  if (schema.anyOf || schema.oneOf) return `(${(schema.anyOf ?? schema.oneOf).map(type).join(' | ')})`
  if (schema.type === 'array') return `(${type(schema.items ?? {})})[]`
  if (schema.type === 'object' || schema.properties) {
    const fields = Object.entries(schema.properties ?? {}).map(([key, value]) => `${JSON.stringify(key)}${schema.required?.includes(key) ? '' : '?'}: ${type(value)}`)
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') fields.push(`[key: string]: ${type(schema.additionalProperties)}`)
    else if (schema.additionalProperties === true) fields.push('[key: string]: JsonValue')
    return fields.length ? `{ ${fields.join('; ')} }` : 'Record<string, never>'
  }
  return { string: 'string', integer: 'number', number: 'number', boolean: 'boolean', null: 'null' }[schema.type] ?? 'JsonValue'
}


const names=new Set([...wire.matchAll(/^  ("[^"]+"): (\{.*\}),$/gm)].map(m=>JSON.parse(m[1])))
names.add('SupplierPickerEnvelope')
names.add('Envelope_Readiness_')
function visit(name){
 if(!current[name])throw Error('Missing schema '+name)
 for(const [,ref] of JSON.stringify(current[name]).matchAll(/"\$ref":"#\/components\/schemas\/([^" ]+)"/g))if(!names.has(ref)){names.add(ref);visit(ref)}
}
for(const name of names)visit(name)
const ordered=[...names].sort()
const marker=wire.indexOf('export type ImportWireSchema')
let result=wire.slice(0,wire.indexOf('export type Wire'))+ordered.map(n=>`export type ${identifier(n)} = ${type(current[n])}`).join('\n')+'\n\n'+wire.slice(marker)
result=result.replace(/const schemas: Record<string, ImportWireSchema> = \{[\s\S]*?\n\}/, 'const schemas: Record<string, ImportWireSchema> = {\n'+ordered.map(n=>`  ${JSON.stringify(n)}: ${JSON.stringify(project(current[n]))},`).join('\n')+'\n}')
result=result.replace(/contracts\/(?:011|history\/v2\/generated)\/openapi(?:\.main)?\.json/g,'contracts/016/openapi.main.json')
writeFileSync(path,result)
console.log('Import wire generated from pinned main snapshot:',ordered.length,'schemas')
