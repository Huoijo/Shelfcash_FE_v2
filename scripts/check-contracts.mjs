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
  const expected = slice === 'baseline' ? [50, 54] : [66, 73]
  if (Object.keys(value.paths).length !== expected[0] || operations !== expected[1]) failures.push(`Inventory drift: ${slice}`)
  console.log(`${slice}: ${operations} operations / ${Object.keys(value.paths).length} paths`)
}
if (hash(readFileSync(new URL('contracts/016/openapi.main.json', root))) !== hash(readFileSync(new URL('shelfcash_FE_handoff_869eaec9/openapi.json', root)))) failures.push('016 snapshot differs from supplied handoff')
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1 }
else console.log(`Contract consolidation PASS: ${manifest.files.length} historical files preserved byte-for-byte; slice pins verified`)
