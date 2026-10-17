import type { InventoryLot, InventoryMovement } from './inventory.types'
import { decimalFraction, proportion, sumFractions } from '../../shared/visual-intelligence/visualMath'

/** Called only after the detail owner has fenced the snapshot. Never convert units. */
export function lotComposition(lots:InventoryLot[],unit:string) {
  const quantities=lots.map(lot=>lot.unit===unit?decimalFraction(lot.quantity):null)
  const total=sumFractions(quantities)
  return lots.map((lot,index)=>({lot,share:proportion(quantities[index],total)}))
}
export function movementGeometry(items:InventoryMovement[],unit:string) {
  const points=[...items].reverse().map(item=>({item,magnitude:item.unit===unit?decimalFraction(item.quantity_delta.replace(/^-/,'')):null}))
  const max=points.reduce<ReturnType<typeof decimalFraction>>((max,p)=>!p.magnitude?max:!max||BigInt(p.magnitude.numerator)*BigInt(max.denominator)>BigInt(max.numerator)*BigInt(p.magnitude.denominator)?p.magnitude:max,null)
  return points.map(p=>({...p,share:proportion(p.magnitude,max)}))
}
export function expiryDistance(expiry:string|null,asOf:string):number|null {
  if(!expiry)return null
  const delta=(Date.parse(`${expiry}T00:00:00Z`)-Date.parse(`${asOf}T00:00:00Z`))/86400000
  return Number.isInteger(delta)?delta:null
}
