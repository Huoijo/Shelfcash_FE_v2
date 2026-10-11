import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

// Reuse the project's TypeScript bundler; no extra test dependencies or app output.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = await mkdtemp(join(tmpdir(), 'shelfcash-import-tests-'))
try {
  await build({
    root,
    configFile: false,
    logLevel: 'error',
    define: {
      'import.meta.env': JSON.stringify({ VITE_DATA_SOURCE: 'mock' }),
    },
    build: {
      ssr: resolve(root, 'tests/import-batch.test.mjs'),
      outDir: output,
      emptyOutDir: false,
      minify: false,
      rollupOptions: { output: { entryFileNames: 'import-batch.test.mjs' } },
    },
  })
  const result = spawnSync(process.execPath, ['--test', join(output, 'import-batch.test.mjs')], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally {
  await rm(output, { recursive: true, force: true })
}
