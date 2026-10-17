// Source census complements the computed-style guard in capture-import-typography.
import fs from 'node:fs/promises'
const roots=['src/features/import-data','src/pages/imports','src/features/import-history','src/pages/import-history']
async function files(dir){return (await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]))).flat()}
const occurrences=[]
for(const file of (await Promise.all(roots.map(files))).flat()){
  const source=await fs.readFile(file,'utf8')
  if(file.endsWith('.css'))for(const match of source.matchAll(/(?:font-size\s*:\s*(?:[89]|10)px|--sc-import-type-micro\s*:\s*10px|font-size\s*:\s*var\(--sc-import-type-micro\))/g)){
    const prefix=source.slice(0,match.index),selector=prefix.slice(Math.max(prefix.lastIndexOf('}'),prefix.lastIndexOf('{'))+1).trim()
    const rule=source.slice(source.lastIndexOf('}',match.index)+1,source.indexOf('}',match.index)+1)
    const approved=file.endsWith('ImportTypography.css')&&match[0]==='--sc-import-type-micro: 10px'
      ||file.endsWith('ImportPage.css')&&/var\(--sc-import-type-micro\)/.test(match[0])&&(rule.includes('.input-steps')||rule.includes('.import-upload__file-size'))
      ||file.endsWith('ImportHistoryPage.css')&&rule.trim().startsWith('.history-calendar__count > span {')&&match[0]==='font-size: 8px'
    occurrences.push({file,line:prefix.split('\n').length,selector:rule.slice(0,rule.indexOf('{')).trim()||selector,value:match[0],classification:approved?'APPROVED_MICRO':'UNRESOLVED',reason:rule.includes('history-calendar')?'Decorative aria-hidden dot; adjacent count has its own 11px text':rule.includes('file-size')?'Secondary noninteractive byte size; filename and quota are stronger':rule.includes('steps')?'Redundant step numeral / secondary orientation; title is 11px and stage stays 54px high':'Import-scoped 10px token, used only by documented secondary roles'})
  }
}
const counts={APPROVED_MICRO:0,PROTOTYPE_ONLY:0,UNRESOLVED:0}
for(const item of occurrences)counts[item.classification]++
await fs.writeFile('docs/testing/visual-fidelity/import-typography-20261017/REMAINING_TYPE.json',JSON.stringify({scope:roots,unit:'CSS declarations including token definition and references, not rendered text count',counts,occurrences},null,2)+'\n')
console.log(JSON.stringify(counts))
if(counts.UNRESOLVED)process.exitCode=1
