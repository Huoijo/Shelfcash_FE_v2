// Reuses the existing controlled suites/gates. Logs are always task-local.
import fs from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
const output=path.resolve('docs/testing/visual-fidelity/import-typography-20261017/regression')
await fs.mkdir(output,{recursive:true})
const checks=['test:planning','test:capabilities','test:operations','test:import','test:store','test:auth','build','lint','check:contracts','check:capabilities-wire','check:recovery-policy','check:planning-wire','check:operations-wire','check:import-wire','check:store-wire']
const results=[]
for(const name of checks){
  const result=process.platform==='win32'
    ?spawnSync(process.env.ComSpec??'cmd.exe',['/d','/s','/c',`npm run ${name}`],{encoding:'utf8'})
    :spawnSync('npm',['run',name],{encoding:'utf8'})
  const log=(result.stdout??'')+(result.stderr??'')
  const file=name.replaceAll(':','-')+'.txt'
  await fs.writeFile(path.join(output,file),log)
  const pass=Number(log.match(/\bpass (\d+)/)?.[1]??0)
  results.push({name,status:result.status===0?'PASS':'FAIL',pass,file})
  console.log(name+': '+results.at(-1).status+(pass?' '+pass:''))
}
await fs.writeFile(path.join(output,'results.json'),JSON.stringify({controlledTotal:results.reduce((n,r)=>n+r.pass,0),liveBackend:'NOT RUN',results},null,2)+'\n')
if(results.some(r=>r.status!=='PASS'))process.exitCode=1
