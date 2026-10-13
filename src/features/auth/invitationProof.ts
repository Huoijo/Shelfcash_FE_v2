// Proofs are memory-only; credential and invitation tokens have independent locators.
// Scrub fragments before requests and never copy tokens into navigation state/storage.
const proofs=new Map<string,string>()
export function captureProof(locator:string,hash:string,scrub:()=>void):string|null {
  if(hash){
    const token=new URLSearchParams(hash.replace(/^#/,'')).get('token')
    scrub()
    if(token){proofs.set(locator,token);if(proofs.size>8)proofs.delete(proofs.keys().next().value!)}else proofs.delete(locator)
  }
  return proofs.get(locator)??null
}
export function forgetProof(locator?:string){if(locator)proofs.delete(locator);else proofs.clear()}
