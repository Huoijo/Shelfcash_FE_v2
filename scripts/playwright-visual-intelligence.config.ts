// Same existing projects/tests; Windows-safe startup and a closed outbound proxy.
import {defineConfig} from '@playwright/test'
import existing from '../playwright.config'
import path from 'node:path'
const output=path.resolve(`docs/testing/visual-intelligence-20261017/${process.env.SHELFCASH_VI_E2E_RUN??'e2e-current-02'}`)
export default defineConfig({
  ...existing,testDir:'../tests/e2e',outputDir:`${output}/artifacts`,
  reporter:[['list'],['json',{outputFile:`${output}/results.json`}]],
  // All API/production tests use helpers/api.ts's complete 18001 interceptor.
  // Mock projects have no API source. Proxy blocks remote fonts/network.
  use:{...existing.use,serviceWorkers:'block',proxy:{server:'http://vi-block-all.invalid:9',bypass:'127.0.0.1'},launchOptions:{...(process.env.SHELFCASH_CHROMIUM_PATH?{executablePath:process.env.SHELFCASH_CHROMIUM_PATH}:{})}},
  webServer:[
    {cwd:path.resolve('.'),command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4180 --strictPort',url:'http://127.0.0.1:4180',reuseExistingServer:false},
    {cwd:path.resolve('.'),command:'node node_modules/vite/bin/vite.js --config scripts/vite-visual-intelligence.config.ts --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',env:{VITE_DATA_SOURCE:'mock'},reuseExistingServer:false},
    {cwd:path.resolve('.'),command:'node node_modules/vite/bin/vite.js --config scripts/vite-visual-intelligence.config.ts --host 127.0.0.1 --port 4174 --strictPort',url:'http://127.0.0.1:4174',env:{VITE_DATA_SOURCE:'api',VITE_API_BASE_URL:'http://127.0.0.1:18001'},reuseExistingServer:false},
  ],
})
