import { inventoryFixtureItems, inventoryFixtureLots, inventoryFixtureMeta, inventoryFixtureMovements } from '../inventory/inventory.fixtures'
import { MOCK_STORE_IDS } from '../store/store.fixtures'
import { HttpError } from '../../shared/http/httpClient'
import type { IngredientStock, InventoryLot, InventoryMovement } from '../inventory/inventory.types'
import { mockScenario } from './scenarios'
export { mockScenario, scenarios } from './scenarios'
type MockInventory={items:IngredientStock[];lots:Record<string,InventoryLot[]>;movements:Record<string,InventoryMovement[]>;meta:typeof inventoryFixtureMeta;revision:number}
const stores=new Map<string,MockInventory>()
export function mockInventory(storeId:string|null):MockInventory {
  if(storeId!==MOCK_STORE_IDS.first && storeId!==MOCK_STORE_IDS.second) throw new HttpError('contract','Store không thuộc mock scenario.',404)
  if(mockScenario==='transport-error')throw new HttpError('transport','DEV: lỗi kết nối xác định.')
  if(!stores.has(storeId)) {
    const empty=mockScenario==='empty-store'||storeId===MOCK_STORE_IDS.second
    stores.set(storeId,{items:empty?[]:structuredClone(inventoryFixtureItems),lots:empty?{}:structuredClone(inventoryFixtureLots),movements:empty?{}:structuredClone(inventoryFixtureMovements),meta:structuredClone(inventoryFixtureMeta),revision:1})
  }
  return stores.get(storeId)!
}
export function mockSummary(items:IngredientStock[]) {
  return {ingredient_count:items.length,positive_lot_count:items.reduce((n,i)=>n+i.positive_lot_count,0),near_expiry_lot_count:items.reduce((n,i)=>n+i.near_expiry_lot_count,0),near_expiry_ingredient_count:items.filter(i=>i.near_expiry_lot_count>0).length,expired_lot_count:items.filter(i=>i.status==='expired').length,low_stock_ingredient_count:items.filter(i=>i.low_stock_assessment.status==='low').length,unknown_assessment_ingredient_count:items.filter(i=>i.low_stock_assessment.status==='unknown').length}
}
/** Exact decimal addition belongs only to this fake backend, never to API presentation code. */
export function mockAdd(a:string,b:string):string {
  const [ai,af='']=a.split('.'),[bi,bf='']=b.split('.');const scale=Math.max(af.length,bf.length)
  const total=BigInt(ai+af.padEnd(scale,'0'))+BigInt(bi+bf.padEnd(scale,'0'))
  const s=total.toString().padStart(scale+1,'0');return scale?`${s.slice(0,-scale)}.${s.slice(-scale)}`:s
}
export function touchMockInventory(s:MockInventory) {s.revision++;s.meta={...s.meta,data_version:`mock-inventory/${s.revision}`,snapshot_id:`mock-snapshot/${s.revision}`}}
