import { defineConfig,devices } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:60000,
  use:{trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[
    {name:'mock-desktop',testMatch:/mock\.spec\.ts$/,use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:4173'}},
    {name:'mock-mobile',testMatch:/responsive\.spec\.ts$/,use:{...devices['iPhone 13'],defaultBrowserType:'chromium',baseURL:'http://127.0.0.1:4173'}},
    {name:'controlled-api',testMatch:/api\.spec\.ts$/,use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:4174'}},
  ],
  webServer:[
    {command:'VITE_DATA_SOURCE=mock npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false},
    {command:'VITE_DATA_SOURCE=api VITE_API_BASE_URL=http://127.0.0.1:18001 npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',url:'http://127.0.0.1:4174',reuseExistingServer:false},
  ],
})
