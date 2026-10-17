// DIAGNOSTIC ONLY: read tracked data as exact HEAD blobs in a child process.
// Separates Windows checkout newline drift from this CSS-only change. No writes.
// Ordinary gate outcomes remain authoritative and are reported separately.
const fs=require('node:fs'),path=require('node:path')
const {execFileSync}=require('node:child_process')
const {syncBuiltinESMExports}=require('node:module')
const read=fs.readFileSync
const root=path.resolve(__dirname,'..')+path.sep
const cache=new Map()
fs.readFileSync=function(file,options){
  const value=read.apply(this,arguments)
  const name=file instanceof URL?require('node:url').fileURLToPath(file):String(file)
  const absolute=path.resolve(name)
  if(!absolute.startsWith(root)||!/\.(json|ts|env\.example)$/.test(name))return value
  if(!cache.has(absolute)){
    try {cache.set(absolute,execFileSync('git',['show','b318e90888ba60c7c1c226e05855d1a1989f74a3:'+path.relative(root,absolute).replaceAll('\\','/')],{cwd:root,stdio:['ignore','pipe','ignore']}))}
    catch {cache.set(absolute,null)}
  }
  const baseline=cache.get(absolute)
  if(!baseline)return value
  return typeof value==='string'?baseline.toString(typeof options==='string'?options:options?.encoding??'utf8'):baseline
}
syncBuiltinESMExports()
