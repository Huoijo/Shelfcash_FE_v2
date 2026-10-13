import { loadWireSource } from './wire-source.mjs'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

// Read-only drift gate for the locally frozen, published Import OpenAPI slice.
// Business guards in importFlow.validation/data are intentionally not generated.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const wire = readFileSync(resolve(root, 'src/features/import-data/importFlow.wire.ts'), 'utf8')
const current = loadWireSource().components.schemas
const frozen = Object.fromEntries([...wire.matchAll(/^  ("[^"]+"): (\{.*\}),$/gm)].map((match) => [JSON.parse(match[1]), JSON.parse(match[2])]))
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

const failures = []
const roots = ['MappingSummary', 'MappingList', 'FieldOptions', 'MappingUpdated', 'ResolveRequest-Input', 'DecisionResult', 'Approve', 'Reject', 'Retire', 'PreviewAccepted', 'CommitAccepted', 'ConfirmationResult', 'ConfirmReviewRequest', 'PreviewSummary', 'PreviewRow', 'PreviewPage', 'ImportCompletion', 'JobView', 'ImportMeta', 'ReviewConfirmation', 'ImportRead', 'TargetRequest', 'app__application__contracts__import_mapping__CommitRequest']
for (const name of roots) if (!Object.hasOwn(frozen, name)) failures.push(`Missing required root: ${name}`)
for (const [name, schema] of Object.entries(frozen)) {
  if (!current[name] || JSON.stringify(schema) !== JSON.stringify(project(current[name]))) failures.push(`Schema drift: ${name}`)
  const refs = JSON.stringify(schema).matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)
  for (const [, dependency] of refs) if (!Object.hasOwn(frozen, dependency)) failures.push(`Unclosed dependency: ${name} -> ${dependency}`)
}
let typeCount = 0
for (const [, name, actual] of wire.matchAll(/^export type (Wire\w+) = (.*)$/gm)) {
  const sourceName = Object.keys(current).find((entry) => identifier(entry) === name)
  if (!sourceName || type(current[sourceName]) !== actual) failures.push(`Type drift: ${name}`)
  typeCount++
}
if (Object.keys(frozen).length === 0 || typeCount === 0) failures.push('No frozen schemas or generated types found')
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  const digest = createHash('sha256').update(JSON.stringify(frozen)).digest('hex')
  console.log(`Import wire drift gate PASS: ${Object.keys(frozen).length} schemas, ${typeCount} types; SHA256 ${digest}`)
}
