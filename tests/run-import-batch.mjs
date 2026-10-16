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
  const available = ['import-batch', 'import-flow-boundary', 'import-flow-workflow', 'import-stage', 'import-mapping-ui', 'import-locator', 'import-playground', 'import-main']
  const suites = process.argv.length > 2 ? process.argv.slice(2) : available
  if (suites.some((suite) => !available.includes(suite))) throw new Error('Unknown Import test suite')
  for (const suite of suites) {
    const dataSource = suite === 'import-main' ? 'api' : 'mock'
    await build({
    root,
    configFile: false,
    logLevel: 'error',
    ...(suite === 'import-mapping-ui' ? { ssr: { noExternal: true } } : {}),
    define: {
      'import.meta.env': JSON.stringify({ VITE_DATA_SOURCE: dataSource, DEV: true }),
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify(dataSource),
      'import.meta.env.DEV': 'true',
    },
    build: {
      ssr: resolve(root, `tests/${suite}.test.mjs`),
      outDir: output,
      emptyOutDir: false,
      minify: false,
      rollupOptions: { output: { entryFileNames: `${suite}.test.mjs` } },
    },
  })
  }
  const result = spawnSync(process.execPath, ['--test', ...suites.map((suite) => join(output, `${suite}.test.mjs`))], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally {
  await rm(output, { recursive: true, force: true })
}
