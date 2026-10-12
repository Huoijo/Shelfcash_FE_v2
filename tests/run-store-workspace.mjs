import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = await mkdtemp(join(tmpdir(), 'shelfcash-store-tests-'))
try {
  const available = ['store-context', 'store-workspace-boundary', 'store-workspace-workflow', 'store-workspace-ui', 'store-navigation']
  const suites = process.argv.length > 2 ? process.argv.slice(2) : available
  if (suites.some((suite) => !available.includes(suite))) throw new Error('Unknown Store test suite')
  for (const suite of suites) await build({
    root, configFile: false, logLevel: 'error',
    ...(suite.endsWith('-ui') || suite === 'store-navigation' ? { ssr: { noExternal: ['react', 'react-dom', 'react-router', 'motion', 'framer-motion', 'motion-dom', 'motion-utils'] } } : {}),
    define: {
      'import.meta.env': JSON.stringify({ VITE_DATA_SOURCE: 'api', DEV: false }),
      // Keep controlled API tests independent of the developer's .env.local.
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify('api'),
      'import.meta.env.DEV': 'false',
    },
    build: { ssr: resolve(root, `tests/${suite}.test.mjs`), outDir: output, emptyOutDir: false,
      minify: false, rollupOptions: { output: { entryFileNames: `${suite}.test.mjs` } } },
  })
  const result = spawnSync(process.execPath, ['--test', ...suites.map((suite) => join(output, `${suite}.test.mjs`))], { cwd: root, stdio: 'inherit' })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally { await rm(output, { recursive: true, force: true }) }
