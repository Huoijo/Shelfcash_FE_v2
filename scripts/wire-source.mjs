import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
// Explicit pins: capabilities uses Planning preview021; Import and 019 feature closures retain unchanged main016; baseline readers remain 011.
export function loadWireSource(slice='baseline'){
 if(!['baseline','import','capabilities'].includes(slice))throw Error('Unknown contract slice')
 const main=slice!=='baseline', latest=slice==='capabilities'
 const bytes=readFileSync(new URL(latest?'../contracts/021/openapi.main.json':main?'../contracts/016/openapi.main.json':'../contracts/011/openapi.main.json',import.meta.url))
 const digest=latest?'68204af15000f3c79da135ecd56435becf30b6ef069e7338bb93f87552869a5b':main?'790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee':'d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d'
 if(createHash('sha256').update(bytes).digest('hex')!==digest)throw Error('Pinned main OpenAPI snapshot hash mismatch; review handoff before repinning')
 return JSON.parse(bytes)
}
