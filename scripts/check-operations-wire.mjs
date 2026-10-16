import { loadWireSource } from './wire-source.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const current = loadWireSource('capabilities').components.schemas
const identifier = name => `Wire${name.replace(/[^A-Za-z0-9_]/g, '_')}`
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


const roots = ['CredentialCompletion', 'Envelope_CompletedCredential_', 'AcceptInvitation', 'Envelope_OfferRead_', 'Envelope_AcceptanceReceipt_', 'Envelope_PermissionEvents_', 'Envelope_InvitationEvents_', 'SaveRequest', 'ReplaceRequest', 'ArchiveRequest', 'Envelope_SavedDetail_', 'StockReceiptRequest', 'Envelope_StockReceiptResult_', 'ThresholdRequest', 'Envelope_ThresholdResult_', 'Envelope_Timeline_', 'app__application__contracts__recipe_schedule__PreviewRequest', 'app__application__contracts__recipe_schedule__CommitRequest', 'Envelope_Union_Preview__Receipt__', 'Envelope_ChangeRead_', 'ExportRequest', 'ExportEnvelope', 'RunHistoryEnvelope', 'ImportEnvelope_JobView_']
const selected = new Set()
function visit(name) {
 if(selected.has(name)) return
 if(!current[name]) throw Error(`Missing schema ${name}`)
 selected.add(name)
 for(const [,ref] of JSON.stringify(current[name]).matchAll(/"\$ref":"#\/components\/schemas\/([^" ]+)"/g)) visit(ref)
}
roots.forEach(visit)
const names = [...selected].sort()
const schemas = Object.fromEntries(names.map(name=>[name,project(current[name])]))
const matcher = "export type OperationsWireSchema = {\n  $ref?: string; type?: string; const?: unknown; enum?: unknown[]; anyOf?: OperationsWireSchema[]; oneOf?: OperationsWireSchema[]\n  properties?: Record<string, OperationsWireSchema>; required?: string[]; additionalProperties?: boolean | OperationsWireSchema\n  items?: OperationsWireSchema; minItems?: number; maxItems?: number; minLength?: number; maxLength?: number\n  minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; pattern?: string; format?: string; default?: unknown; writeOnly?: boolean\n}\nSCHEMAS_PLACEHOLDER\nexport function matchesOperationsWire(name: string, value: unknown): boolean {\n  const root = schemas[name]\n  return root !== undefined && matches(root, value)\n}\n\nfunction matches(schema: OperationsWireSchema, value: unknown): boolean {\n  if (schema.$ref) return matchesOperationsWire(schema.$ref.split('/').at(-1)!, value)\n  if ('const' in schema && value !== schema.const) return false\n  if (schema.enum && !schema.enum.includes(value)) return false\n  if (schema.anyOf) return schema.anyOf.some((option) => matches(option, value))\n  if (schema.oneOf) return schema.oneOf.filter((option) => matches(option, value)).length === 1\n  if (schema.type === 'null') return value === null\n  if (schema.type === 'boolean') return typeof value === 'boolean'\n  if (schema.type === 'string') {\n    if (typeof value !== 'string' || (schema.minLength !== undefined && [...value].length < schema.minLength) || (schema.maxLength !== undefined && [...value].length > schema.maxLength) || (schema.pattern && !new RegExp(schema.pattern).test(value))) return false\n    if (schema.format === 'uuid') return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)\n    if (schema.format === 'date') { const parsed = new Date(value+'T00:00:00Z'); return /^\\d{4}-\\d{2}-\\d{2}$/.test(value) && !value.startsWith('0000-') && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value }\n    if (schema.format === 'date-time') {\n      const localDate = value.slice(0, 10)\n      const parsedDate = new Date(localDate + 'T00:00:00Z')\n      return /^\\d{4}-\\d{2}-\\d{2}T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-](?:[01]\\d|2[0-3]):[0-5]\\d)$/.test(value) &&\n        !localDate.startsWith('0000-') && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === localDate && !Number.isNaN(Date.parse(value))\n    }\n    return true\n  }\n  if (schema.type === 'number' || schema.type === 'integer') return typeof value === 'number' && Number.isFinite(value) && (schema.type !== 'integer' || Number.isSafeInteger(value)) && (schema.minimum === undefined || value >= schema.minimum) && (schema.maximum === undefined || value <= schema.maximum) && (schema.exclusiveMinimum === undefined || value > schema.exclusiveMinimum) && (schema.exclusiveMaximum === undefined || value < schema.exclusiveMaximum)\n  if (schema.type === 'array') return Array.isArray(value) && (schema.minItems === undefined || value.length >= schema.minItems) && (schema.maxItems === undefined || value.length <= schema.maxItems) && value.every((item) => matches(schema.items ?? {}, item))\n  if (schema.type === 'object' || schema.properties) {\n    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false\n    const record = value as Record<string, unknown>\n    if (schema.required?.some((key) => !Object.hasOwn(record, key))) return false\n    return Object.entries(record).every(([key, item]) => {\n      const property = schema.properties?.[key]\n      if (property) return matches(property, item)\n      if (schema.additionalProperties === false) return false\n      if (typeof schema.additionalProperties === 'object') return matches(schema.additionalProperties, item)\n      return true\n    })\n  }\n  return true\n}\n\n"
const result = '// Generated from contracts/021/openapi.main.json. Run node scripts/check-operations-wire.mjs --write.\n' +
 'export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }\n' +
 names.map(name=>`export type ${identifier(name)} = ${type(current[name])}`).join('\n')+'\n\n'+
 matcher.replace('SCHEMAS_PLACEHOLDER', 'const schemas: Record<string, OperationsWireSchema> = {\n'+names.map(name=>`  ${JSON.stringify(name)}: ${JSON.stringify(schemas[name])},`).join('\n')+'\n}\n')
const path = resolve('src/features/operations/operations.wire.ts')
if(process.argv.includes('--write')) writeFileSync(path,result)
else if(readFileSync(path,'utf8') !== result) throw Error('Operations wire drift; regenerate and review contract changes')
console.log(`Operations wire ${process.argv.includes('--write')?'generated':'PASS'}: ${names.length} schemas`)
