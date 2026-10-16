import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const bytes = readFileSync(new URL('../contracts/020/recovery_journal.json', import.meta.url))
if (createHash('sha256').update(bytes).digest('hex') !== 'e06d47cd202a42a79f6ca978c244ea8218baaf0405cb60667dde505d3f7ae3be') throw Error('Recovery policy pin drift')
const policy = JSON.parse(bytes)
const rules = policy.operations.map(o => ({ operation: o.operation_id, phase: o.phase, mode: o.journal.mode, fields: o.journal.allowed_body_fields, conditions: o.journal.conditions }))
const output = '// Generated from hash-pinned contracts/020/recovery_journal.json. Do not edit.\nexport const recoveryRules = ' + JSON.stringify(rules, null, 2) + ' as const\n'
const target = new URL('../src/features/backend-capabilities/recovery.policy.ts', import.meta.url)
if (process.argv.includes('--check')) { if (readFileSync(target, 'utf8') !== output) throw Error('Recovery policy projection drift') }
else writeFileSync(target, output)
console.log(`Recovery policy ${process.argv.includes('--check') ? 'PASS' : 'generated'}: ${rules.length} operation/phase rules`)
