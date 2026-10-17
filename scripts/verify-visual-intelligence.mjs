// Current controlled regression. No contract regeneration or live HTTP.
import fs from 'node:fs/promises'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
if(process.argv[2]==='--compare-e2e'){
  const dir=path.resolve('docs/testing/visual-intelligence-20261017')
  const current=JSON.parse(await fs.readFile(path.join(dir,'e2e-current-04/results.json'),'utf8'))
  const baseline=JSON.parse(await fs.readFile(path.join(dir,'e2e-baseline-failed/results.json'),'utf8'))
  const collect=suites=>suites.flatMap(suite=>[...(suite.specs??[]).flatMap(spec=>(spec.tests??[]).map(test=>({key:[spec.file,spec.line,spec.title,test.projectName].join(':'),title:spec.title,project:test.projectName,file:spec.file,line:spec.line,status:test.status,errors:test.results?.flatMap(result=>(result.errors??[]).map(error=>error.message??''))??[]}))),...collect(suite.suites??[])])
  const before=new Map(collect(baseline.suites).map(test=>[test.key,test]))
  const signature=test=>{const lines=(test?.errors??[]).join('\n').replace(/\u001b\[[0-9;]*m/g,'').split('\n');return lines.find(line=>line.startsWith('Locator:'))??lines.find(line=>line.startsWith('Test timeout'))??lines[0]??''}
  const pairs=collect(current.suites).filter(test=>test.status==='unexpected').map(test=>({current:test,baseline:before.get(test.key)??null,currentFailureLocation:signature(test),baselineFailureLocation:signature(before.get(test.key)),comparison:before.get(test.key)?.status==='unexpected'?(signature(test)===signature(before.get(test.key))?'BASELINE_FAILURE_REPRODUCED':'BASELINE_CASE_FAILED_DIFFERENT_SYMPTOM'):before.get(test.key)?'BASELINE_PASSED_CURRENT_FAILED':'BASELINE_NOT_RUN'}))
  const result={kind:'CONTROLLED_SOURCE_COMPARISON',baselineHead:'b318e90888ba60c7c1c226e05855d1a1989f74a3',priorTypographyPreserved:true,current:current.stats,baselineFailedSubset:baseline.stats,pairs}
  await fs.writeFile(path.join(dir,'e2e-baseline-comparison.json'),JSON.stringify(result,null,2)+'\n')
  console.log(JSON.stringify({current:current.stats,baseline:baseline.stats,pairs:pairs.map(pair=>({title:pair.current.title,comparison:pair.comparison}))}))
  process.exit(0)
}
const output=path.resolve('docs/testing/visual-intelligence-20261017/final-regression')
await fs.mkdir(output,{recursive:true})
const checks=['test:planning','test:capabilities','test:operations','test:import','test:store','test:auth','build','lint','check:contracts','check:capabilities-wire','check:recovery-policy','check:planning-wire','check:operations-wire','check:import-wire','check:store-wire']
const results=[]
for(const name of checks){
  const result=process.platform==='win32'?spawnSync(process.env.ComSpec??'cmd.exe',['/d','/s','/c',`npm run ${name}`],{encoding:'utf8'}):spawnSync('npm',['run',name],{encoding:'utf8'})
  const log=(result.stdout??'')+(result.stderr??''),file=name.replaceAll(':','-')+'.txt'
  await fs.writeFile(path.join(output,file),log)
  results.push({name,status:result.status===0?'PASS':'FAIL',pass:Number(log.match(/\bpass (\d+)/)?.[1]??0),file})
  console.log(name+': '+results.at(-1).status+' '+results.at(-1).pass)
}
await fs.writeFile(path.join(output,'results.json'),JSON.stringify({kind:'CONTROLLED',liveBackend:'NOT_RUN',total:results.reduce((sum,r)=>sum+r.pass,0),results},null,2)+'\n')
if(results.some(r=>r.status==='FAIL'))process.exitCode=1
