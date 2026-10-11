import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = await mkdtemp(join(tmpdir(), 'shelfcash-auth-tests-'))
try {
  await build({
    root, configFile: false, logLevel: 'error',
    define: {
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify('api'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://qa.invalid'),
      'import.meta.env.DEV': 'true',
      // This obsolete public value must never override authenticated request scope.
      'import.meta.env.VITE_DEV_STORE_ID': JSON.stringify('ffffffff-ffff-4fff-8fff-ffffffffffff'),
    },
    build: {
      ssr: resolve(root, 'tests/auth-session.test.mjs'), outDir: output,
      emptyOutDir: false, minify: false,
      rollupOptions: { output: { entryFileNames: 'auth-session.test.mjs' } },
    },
  })
  const result = spawnSync(process.execPath, ['--test', join(output, 'auth-session.test.mjs')], {
    cwd: root, stdio: 'inherit',
  })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally {
  await rm(output, { recursive: true, force: true })
}
