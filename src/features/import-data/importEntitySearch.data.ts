import {getMenu} from '../menu/menu.data'
import {getInventory} from '../inventory/inventory.data'
import type {ImportEntitySearch} from './importEntitySearch.context'

export const searchImportEntities:ImportEntitySearch=async({storeId,kind,q,cursor,signal})=>{
  if(kind==='product'){
    const response=await getMenu({q:q||undefined,cursor,limit:20},signal,storeId)
    return {items:response.data.items.map(row=>({id:row.product_id,name:row.name,code:row.sku,kind})),nextCursor:response.meta.pagination.next_cursor}
  }
  if(kind==='ingredient'){
    const response=await getInventory({q:q||undefined,cursor,limit:20},signal,storeId)
    return {items:response.data.items.filter(row=>row.ingredient_active).map(row=>({id:row.ingredient_id,name:row.name,code:row.sku,kind})),nextCursor:response.meta.pagination.next_cursor}
  }
  // Current T has no supplier collection reader. Do not invent a search endpoint.
  throw new Error('Chưa đọc được danh mục nhà cung cấp.')
}
