import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
// Pin the main-tree source snapshot. Auth/Import WIP are not a combined release.
export function loadWireSource(){
 const bytes=readFileSync(new URL('../contracts/011/openapi.main.json',import.meta.url))
 if(createHash('sha256').update(bytes).digest('hex')!=='d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d')throw Error('011 main OpenAPI snapshot hash mismatch; review handoff before repinning')
 return JSON.parse(bytes)
}
