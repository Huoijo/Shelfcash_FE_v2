/** Structural wire checks only; eligibility, current grants and domain semantics remain BE-owned. */
export type JsonSchema = {
  $ref?: string; type?: string; const?: unknown; enum?: unknown[]
  anyOf?: JsonSchema[]; oneOf?: JsonSchema[]; properties?: Record<string, JsonSchema>
  required?: string[]; additionalProperties?: boolean | JsonSchema; items?: JsonSchema
  minLength?: number; maxLength?: number; pattern?: string; format?: string
  minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number
  minItems?: number; maxItems?: number; uniqueItems?: boolean
  default?: unknown; writeOnly?: boolean; deprecated?: boolean
}

export function matchesCapabilitySchema(schema: JsonSchema, value: unknown, registry: Record<string, JsonSchema>): boolean {
  if (schema.$ref) { const ref = registry[schema.$ref.split('/').at(-1)!]; return ref !== undefined && matchesCapabilitySchema(ref, value, registry) }
  if ('const' in schema && value !== schema.const) return false
  if (schema.enum && !schema.enum.includes(value)) return false
  if (schema.anyOf) return schema.anyOf.some(s => matchesCapabilitySchema(s, value, registry))
  if (schema.oneOf) return schema.oneOf.filter(s => matchesCapabilitySchema(s, value, registry)).length === 1
  if (schema.type === 'null') return value === null
  if (schema.type === 'boolean') return typeof value === 'boolean'
  if (schema.type === 'string') {
    if (schema.format === 'binary') return typeof Blob !== 'undefined' && value instanceof Blob
    if (typeof value !== 'string' || (schema.minLength !== undefined && [...value].length < schema.minLength) || (schema.maxLength !== undefined && [...value].length > schema.maxLength) || (schema.pattern && !new RegExp(schema.pattern).test(value))) return false
    if (schema.format === 'uuid') return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
    if (schema.format === 'date' || schema.format === 'date-time') {
      const date = value.slice(0, 10), parsed = new Date(date + 'T00:00:00Z')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000-') || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false
      if (schema.format === 'date') return value === date
      return /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) && Number.isFinite(Date.parse(value))
    }
    return true
  }
  if (schema.type === 'integer' || schema.type === 'number') return typeof value === 'number' && Number.isFinite(value) && (schema.type !== 'integer' || Number.isSafeInteger(value)) && (schema.minimum === undefined || value >= schema.minimum) && (schema.maximum === undefined || value <= schema.maximum) && (schema.exclusiveMinimum === undefined || value > schema.exclusiveMinimum) && (schema.exclusiveMaximum === undefined || value < schema.exclusiveMaximum)
  if (schema.type === 'array') return Array.isArray(value) && (schema.minItems === undefined || value.length >= schema.minItems) && (schema.maxItems === undefined || value.length <= schema.maxItems) && (!schema.uniqueItems || new Set(value.map(v => JSON.stringify(v))).size === value.length) && value.every(v => matchesCapabilitySchema(schema.items ?? {}, v, registry))
  if (schema.type === 'object' || schema.properties) {
    if (value === null || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false
    const record = value as Record<string, unknown>
    if (schema.required?.some(k => !Object.hasOwn(record, k))) return false
    return Object.entries(record).every(([key, item]) => {
      const field = schema.properties?.[key]
      if (field) return matchesCapabilitySchema(field, item, registry)
      if (schema.additionalProperties === false) return false
      return typeof schema.additionalProperties !== 'object' || matchesCapabilitySchema(schema.additionalProperties, item, registry)
    })
  }
  // Empty schemas in OpenAPI represent JSON values, never undefined or NaN.
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(v => matchesCapabilitySchema({}, v, registry))
  return typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value)) && Object.values(value).every(v => matchesCapabilitySchema({}, v, registry))
}
