import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadWireSource } from './wire-source.mjs'

const root = new URL('../', import.meta.url)
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const manifest = JSON.parse(readFileSync(new URL('contracts/history/PROVENANCE.json', root), 'utf8'))
const failures = []
for (const entry of manifest.files) {
  const path = new URL(entry.path, root)
  if (!existsSync(path) || hash(readFileSync(path)) !== entry.sha256) failures.push(`Historical snapshot changed/missing: ${entry.original}`)
}
for (const slice of ['baseline', 'import', 'capabilities']) {
  const value = loadWireSource(slice)
  const operations = Object.values(value.paths).reduce((n, path) => n + Object.keys(path).filter(m => ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(m)).length, 0)
  const expected = slice === 'baseline' ? [50, 54] : slice === 'capabilities' ? [69, 76] : [66, 73]
  if (Object.keys(value.paths).length !== expected[0] || operations !== expected[1]) failures.push(`Inventory drift: ${slice}`)
  console.log(`${slice}: ${operations} operations / ${Object.keys(value.paths).length} paths`)
}
if (hash(readFileSync(new URL('contracts/016/openapi.main.json', root))) !== hash(readFileSync(new URL('shelfcash_FE_handoff_869eaec9/openapi.json', root)))) failures.push('016 snapshot differs from supplied handoff')
const latest = JSON.parse(readFileSync(new URL('contracts/020/provenance.json', root), 'utf8'))
for (const [name, digest] of Object.entries(latest.files)) {
  if (hash(readFileSync(new URL(`contracts/020/${name}`, root))) !== digest) failures.push(`020 pin drift: ${name}`)
}
// Verify additive compatibility ourselves; the supplied diff is evidence, not an exemption.
const old = loadWireSource('import'), current = loadWireSource('capabilities')
for (const [path, verbs] of Object.entries(old.paths)) for (const [method, operation] of Object.entries(verbs)) {
  if (JSON.stringify(current.paths[path]?.[method]) !== JSON.stringify(operation)) failures.push(`Changed old operation: ${method} ${path}`)
}
for (const [name, schema] of Object.entries(old.components.schemas)) {
  if (JSON.stringify(current.components.schemas[name]) !== JSON.stringify(schema)) failures.push(`Changed old schema: ${name}`)
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1 }
else console.log(`Contract consolidation PASS: ${manifest.files.length} historical files preserved byte-for-byte; slice pins verified`)
