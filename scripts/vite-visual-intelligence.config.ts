// Read-only comparison to the exact pre-VI tracked component sources.
// Existing user typography CSS remains the starting worktree in both runs.
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
const files=new Set([
  'src/features/decision-planning/components/PlanningSetup.tsx',
  'src/features/decision-planning/components/PlanningResults.tsx',
  'src/features/decision-planning/components/PlanningEvidence.tsx',
  'src/features/inventory/components/InventoryDetail.tsx',
  'src/features/menu/components/MenuDetail.tsx',
  'src/pages/today/TodayPage.tsx',
  'src/features/import-data/components/ImportResolveOverview.tsx',
  'src/features/import-data/components/ImportPreview.tsx',
  'src/features/import-data/components/ImportReadiness.tsx',
  'src/features/import-history/components/ImportCalendar.tsx',
  'src/pages/import-history/ImportHistoryPage.tsx',
])
export default defineConfig({plugins:[{
  name:'pre-vi-source-comparison',enforce:'pre',
  load(id){
    if(process.env.SHELFCASH_VI_BASELINE!=='1')return null
    const relative=path.relative(process.cwd(),id).replaceAll('\\','/')
    if(files.has(relative))return execFileSync('git',['show',`b318e90888ba60c7c1c226e05855d1a1989f74a3:${relative}`],{encoding:'utf8'})
    return null
  },
},react()]})
