import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = await mkdtemp(join(tmpdir(), 'shelfcash-planning-tests-'))
try {
  const available = ['planning-boundary', 'planning-workflow', 'planning-ui', 'planning-navigation', 'planning-assistant']
  const suites = process.argv.length > 2 ? process.argv.slice(2) : available
  if (suites.some((suite) => !available.includes(suite))) throw new Error('Unknown Planning test suite')
  for (const suite of suites) await build({
    root, configFile: false, logLevel: 'error',
    ...(suite === 'planning-ui' ? { ssr: { noExternal: ['react', 'react-dom', 'react-router', 'motion', 'framer-motion', 'motion-dom', 'motion-utils'] } } : {}),
    define: { 'import.meta.env': JSON.stringify({ VITE_DATA_SOURCE: 'mock' }) },
    build: { ssr: resolve(root, `tests/${suite}.test.mjs`), outDir: output, emptyOutDir: false,
      minify: false, rollupOptions: { output: { entryFileNames: `${suite}.test.mjs` } } },
  })
  const result = spawnSync(process.execPath, ['--test', ...suites.map((suite) => join(output, `${suite}.test.mjs`))], {
    cwd: root, stdio: 'inherit',
  })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally {
  await rm(output, { recursive: true, force: true })
}
