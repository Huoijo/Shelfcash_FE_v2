import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { build } from 'vite'

const output = await mkdtemp(join(tmpdir(), 'shelfcash-capabilities-tests-'))
try {
  await build({ root: resolve('.'), configFile: false, logLevel: 'error', build: { ssr: resolve('tests/backend-capabilities.test.mjs'), outDir: output, emptyOutDir: false, minify: false, rollupOptions: { output: { entryFileNames: 'backend-capabilities.test.mjs' } } } })
  const result = spawnSync(process.execPath, ['--test', join(output, 'backend-capabilities.test.mjs')], { stdio: 'inherit', cwd: resolve('.') })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally { await rm(output, { recursive: true, force: true }) }
