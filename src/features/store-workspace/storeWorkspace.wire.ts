// Frozen current canonical Store Workspace OpenAPI slice. Never includes recipient tokens.
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export type WireBudgetCeiling = { "amount": string; "currency": string; "version": string; "updated_at": string }
export type WireBudgetRequest = { "amount": string }
export type WireBudgetResult = { "store_id": string; "budget_ceiling": WireBudgetCeiling }
export type WireCreateInvitation = { "grants": (string)[]; "reason": string; "email": string; "permission_catalog_version": string }
export type WireDeliveryReceipt = { "status": "queued" | "delivered" | "failed"; "attempt_id": string }
export type WireEnvelope_BudgetResult_ = { "data": WireBudgetResult; "meta": WireMeta; "error": null }
export type WireEnvelope_InvitationAction_ = { "data": WireInvitationAction; "meta": WireMeta; "error": null }
export type WireEnvelope_InvitationCreation_ = { "data": WireInvitationCreation; "meta": WireMeta; "error": null }
export type WireEnvelope_InvitationList_ = { "data": WireInvitationList; "meta": WireMeta; "error": null }
export type WireEnvelope_MembershipList_ = { "data": WireMembershipList; "meta": WireMeta; "error": null }
export type WireEnvelope_PermissionUpdate_ = { "data": WirePermissionUpdate; "meta": WireMeta; "error": null }
export type WireGrantsRequest = { "grants": (string)[]; "reason": string }
export type WireInvitation = { "invitation_id": string; "store_id": string; "target_email": string; "role"?: "STAFF"; "offered_grants": (string)[]; "permission_catalog_version": string; "version": string; "status": "pending" | "accepted" | "revoked" | "expired"; "issuer_user_id": string; "created_at": string; "issued_at": string; "expires_at": string; "accepted_at": (string | null); "revoked_at": (string | null); "reason": string; "delivery_status": "queued" | "delivered" | "failed" }
export type WireInvitationAction = { "invitation": WireInvitation; "delivery": (WireDeliveryReceipt | null); "event_id": (string | null) }
export type WireInvitationCreation = { "invitation": WireInvitation; "delivery": WireDeliveryReceipt }
export type WireInvitationList = { "items": (WireInvitation)[] }
export type WireMembershipList = { "items": (WireStaffMembership)[]; "permission_catalog_version"?: "permissions-v2"; "permission_catalog": (WirePermissionDescriptor)[] }
export type WireMeta = { "request_id": string; "pagination"?: (WirePagination | null) }
export type WirePagination = { "limit": number; "next_cursor": (string | null); "total_count": (number | null) }
export type WirePermissionDescriptor = { "key": string; "group": string; "label_vi": string; "description_vi": string; "grantable_to_staff": boolean; "required_with": (string)[]; "exposure": "ordinary" | "cost" | "budget" }
export type WirePermissionUpdate = { "membership": WireStaffMembership; "event_id": (string | null); "changed": boolean }
export type WireReissueInvitation = { "grants": (string)[]; "reason": string; "action": "reissue"; "permission_catalog_version": string }
export type WireRevokeInvitation = { "action": "revoke"; "reason": string }
export type WireStaffMembership = { "membership_id": string; "user": WireUserSummary; "role"?: "STAFF"; "active": boolean; "grants": (string)[]; "version": string; "updated_at": string }
export type WireUserSummary = { "user_id": string; "email": string; "display_name": string }

export type StoreWireSchema = {
  $ref?: string; type?: string; const?: unknown; enum?: unknown[]; anyOf?: StoreWireSchema[]; oneOf?: StoreWireSchema[]
  properties?: Record<string, StoreWireSchema>; required?: string[]; additionalProperties?: boolean | StoreWireSchema
  items?: StoreWireSchema; minItems?: number; maxItems?: number; minLength?: number; maxLength?: number
  minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; pattern?: string; format?: string; default?: unknown
}
const schemas: Record<string, StoreWireSchema> = {
  "BudgetCeiling": {"properties":{"amount":{"type":"string","pattern":"^(0|[1-9][0-9]*)(\\.[0-9]+)?$"},"currency":{"type":"string"},"version":{"type":"string","maxLength":128,"minLength":1},"updated_at":{"type":"string","format":"date-time"}},"additionalProperties":false,"type":"object","required":["amount","currency","version","updated_at"]},
  "BudgetRequest": {"properties":{"amount":{"type":"string","maxLength":37,"minLength":1}},"additionalProperties":false,"type":"object","required":["amount"]},
  "BudgetResult": {"properties":{"store_id":{"type":"string","format":"uuid"},"budget_ceiling":{"$ref":"#/components/schemas/BudgetCeiling"}},"additionalProperties":false,"type":"object","required":["store_id","budget_ceiling"]},
  "CreateInvitation": {"properties":{"grants":{"items":{"type":"string"},"type":"array","maxItems":37},"reason":{"type":"string","maxLength":1000,"minLength":1},"email":{"type":"string","maxLength":320,"minLength":1},"permission_catalog_version":{"type":"string","maxLength":128,"minLength":1}},"additionalProperties":false,"type":"object","required":["grants","reason","email","permission_catalog_version"]},
  "DeliveryReceipt": {"properties":{"status":{"type":"string","enum":["queued","delivered","failed"]},"attempt_id":{"type":"string","format":"uuid"}},"additionalProperties":false,"type":"object","required":["status","attempt_id"]},
  "Envelope_BudgetResult_": {"properties":{"data":{"$ref":"#/components/schemas/BudgetResult"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "Envelope_InvitationAction_": {"properties":{"data":{"$ref":"#/components/schemas/InvitationAction"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "Envelope_InvitationCreation_": {"properties":{"data":{"$ref":"#/components/schemas/InvitationCreation"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "Envelope_InvitationList_": {"properties":{"data":{"$ref":"#/components/schemas/InvitationList"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "Envelope_MembershipList_": {"properties":{"data":{"$ref":"#/components/schemas/MembershipList"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "Envelope_PermissionUpdate_": {"properties":{"data":{"$ref":"#/components/schemas/PermissionUpdate"},"meta":{"$ref":"#/components/schemas/Meta"},"error":{"type":"null"}},"additionalProperties":false,"type":"object","required":["data","meta","error"]},
  "GrantsRequest": {"properties":{"grants":{"items":{"type":"string"},"type":"array","maxItems":37},"reason":{"type":"string","maxLength":1000,"minLength":1}},"additionalProperties":false,"type":"object","required":["grants","reason"]},
  "Invitation": {"properties":{"invitation_id":{"type":"string","format":"uuid"},"store_id":{"type":"string","format":"uuid"},"target_email":{"type":"string"},"role":{"type":"string","const":"STAFF","default":"STAFF"},"offered_grants":{"items":{"type":"string"},"type":"array"},"permission_catalog_version":{"type":"string"},"version":{"type":"string"},"status":{"type":"string","enum":["pending","accepted","revoked","expired"]},"issuer_user_id":{"type":"string","format":"uuid"},"created_at":{"type":"string","format":"date-time"},"issued_at":{"type":"string","format":"date-time"},"expires_at":{"type":"string","format":"date-time"},"accepted_at":{"anyOf":[{"type":"string","format":"date-time"},{"type":"null"}]},"revoked_at":{"anyOf":[{"type":"string","format":"date-time"},{"type":"null"}]},"reason":{"type":"string"},"delivery_status":{"type":"string","enum":["queued","delivered","failed"]}},"additionalProperties":false,"type":"object","required":["invitation_id","store_id","target_email","offered_grants","permission_catalog_version","version","status","issuer_user_id","created_at","issued_at","expires_at","accepted_at","revoked_at","reason","delivery_status"]},
  "InvitationAction": {"properties":{"invitation":{"$ref":"#/components/schemas/Invitation"},"delivery":{"anyOf":[{"$ref":"#/components/schemas/DeliveryReceipt"},{"type":"null"}]},"event_id":{"anyOf":[{"type":"string","format":"uuid"},{"type":"null"}]}},"additionalProperties":false,"type":"object","required":["invitation","delivery","event_id"]},
  "InvitationCreation": {"properties":{"invitation":{"$ref":"#/components/schemas/Invitation"},"delivery":{"$ref":"#/components/schemas/DeliveryReceipt"}},"additionalProperties":false,"type":"object","required":["invitation","delivery"]},
  "InvitationList": {"properties":{"items":{"items":{"$ref":"#/components/schemas/Invitation"},"type":"array"}},"additionalProperties":false,"type":"object","required":["items"]},
  "MembershipList": {"properties":{"items":{"items":{"$ref":"#/components/schemas/StaffMembership"},"type":"array"},"permission_catalog_version":{"type":"string","const":"permissions-v2","default":"permissions-v2"},"permission_catalog":{"items":{"$ref":"#/components/schemas/PermissionDescriptor"},"type":"array"}},"additionalProperties":false,"type":"object","required":["items","permission_catalog"]},
  "Meta": {"properties":{"request_id":{"type":"string"},"pagination":{"anyOf":[{"$ref":"#/components/schemas/Pagination"},{"type":"null"}]}},"additionalProperties":false,"type":"object","required":["request_id"]},
  "Pagination": {"properties":{"limit":{"type":"integer"},"next_cursor":{"anyOf":[{"type":"string"},{"type":"null"}]},"total_count":{"anyOf":[{"type":"integer"},{"type":"null"}]}},"additionalProperties":false,"type":"object","required":["limit","next_cursor","total_count"]},
  "PermissionDescriptor": {"properties":{"key":{"type":"string"},"group":{"type":"string"},"label_vi":{"type":"string"},"description_vi":{"type":"string"},"grantable_to_staff":{"type":"boolean"},"required_with":{"items":{"type":"string"},"type":"array"},"exposure":{"type":"string","enum":["ordinary","cost","budget"]}},"additionalProperties":false,"type":"object","required":["key","group","label_vi","description_vi","grantable_to_staff","required_with","exposure"]},
  "PermissionUpdate": {"properties":{"membership":{"$ref":"#/components/schemas/StaffMembership"},"event_id":{"anyOf":[{"type":"string","format":"uuid"},{"type":"null"}]},"changed":{"type":"boolean"}},"additionalProperties":false,"type":"object","required":["membership","event_id","changed"]},
  "ReissueInvitation": {"properties":{"grants":{"items":{"type":"string"},"type":"array","maxItems":37},"reason":{"type":"string","maxLength":1000,"minLength":1},"action":{"type":"string","const":"reissue"},"permission_catalog_version":{"type":"string","maxLength":128,"minLength":1}},"additionalProperties":false,"type":"object","required":["grants","reason","action","permission_catalog_version"]},
  "RevokeInvitation": {"properties":{"action":{"type":"string","const":"revoke"},"reason":{"type":"string","maxLength":1000,"minLength":1}},"additionalProperties":false,"type":"object","required":["action","reason"]},
  "StaffMembership": {"properties":{"membership_id":{"type":"string","format":"uuid"},"user":{"$ref":"#/components/schemas/UserSummary"},"role":{"type":"string","const":"STAFF","default":"STAFF"},"active":{"type":"boolean"},"grants":{"items":{"type":"string"},"type":"array"},"version":{"type":"string"},"updated_at":{"type":"string","format":"date-time"}},"additionalProperties":false,"type":"object","required":["membership_id","user","active","grants","version","updated_at"]},
  "UserSummary": {"properties":{"user_id":{"type":"string","format":"uuid"},"email":{"type":"string"},"display_name":{"type":"string"}},"additionalProperties":false,"type":"object","required":["user_id","email","display_name"]},
}

export function matchesStoreWire(name: string, value: unknown): boolean {
  const root = schemas[name]
  return root !== undefined && matches(root, value)
}

function matches(schema: StoreWireSchema, value: unknown): boolean {
  if (schema.$ref) return matchesStoreWire(schema.$ref.split('/').at(-1)!, value)
  if ('const' in schema && value !== schema.const) return false
  if (schema.enum && !schema.enum.includes(value)) return false
  if (schema.anyOf) return schema.anyOf.some((option) => matches(option, value))
  if (schema.oneOf) return schema.oneOf.filter((option) => matches(option, value)).length === 1
  if (schema.type === 'null') return value === null
  if (schema.type === 'boolean') return typeof value === 'boolean'
  if (schema.type === 'string') {
    if (typeof value !== 'string' || (schema.minLength !== undefined && [...value].length < schema.minLength) || (schema.maxLength !== undefined && [...value].length > schema.maxLength) || (schema.pattern && !new RegExp(schema.pattern).test(value))) return false
    if (schema.format === 'uuid') return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)
    if (schema.format === 'date') { const parsed = new Date(value+'T00:00:00Z'); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !value.startsWith('0000-') && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value }
    if (schema.format === 'date-time') {
      const localDate = value.slice(0, 10)
      const parsedDate = new Date(localDate + 'T00:00:00Z')
      return /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) &&
        !localDate.startsWith('0000-') && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === localDate && !Number.isNaN(Date.parse(value))
    }
    return true
  }
  if (schema.type === 'number' || schema.type === 'integer') return typeof value === 'number' && Number.isFinite(value) && (schema.type !== 'integer' || Number.isSafeInteger(value)) && (schema.minimum === undefined || value >= schema.minimum) && (schema.maximum === undefined || value <= schema.maximum) && (schema.exclusiveMinimum === undefined || value > schema.exclusiveMinimum) && (schema.exclusiveMaximum === undefined || value < schema.exclusiveMaximum)
  if (schema.type === 'array') return Array.isArray(value) && (schema.minItems === undefined || value.length >= schema.minItems) && (schema.maxItems === undefined || value.length <= schema.maxItems) && value.every((item) => matches(schema.items ?? {}, item))
  if (schema.type === 'object' || schema.properties) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
    const record = value as Record<string, unknown>
    if (schema.required?.some((key) => !Object.hasOwn(record, key))) return false
    return Object.entries(record).every(([key, item]) => {
      const property = schema.properties?.[key]
      if (property) return matches(property, item)
      if (schema.additionalProperties === false) return false
      if (typeof schema.additionalProperties === 'object') return matches(schema.additionalProperties, item)
      return true
    })
  }
  return true
}

