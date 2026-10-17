import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
import {build} from 'vite'
const output=await mkdtemp(join(tmpdir(),'shelfcash-vi-tests-'))
try{
  await build({configFile:false,logLevel:'error',define:{'import.meta.env':JSON.stringify({VITE_DATA_SOURCE:'mock',DEV:true})},build:{ssr:resolve('tests/visual-intelligence.test.mjs'),outDir:output,minify:false,rollupOptions:{output:{entryFileNames:'test.mjs'}}}})
  const result=spawnSync(process.execPath,['--test',join(output,'test.mjs')],{stdio:'inherit'})
  process.exitCode=result.status??1
}finally{await rm(output,{recursive:true,force:true})}
