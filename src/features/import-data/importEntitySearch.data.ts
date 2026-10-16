import {getMenu} from '../menu/menu.data'
import {getInventory} from '../inventory/inventory.data'
import type {ImportEntitySearch} from './importEntitySearch.context'
import {config} from '../../app/config'
import {HttpError,requestJson} from '../../shared/http/httpClient'
import {matchesImportWire,type WireSupplierPickerEnvelope} from './importFlow.wire'
import {isImportUuid} from './importData.validation'

export const searchImportEntities:ImportEntitySearch=async({storeId,kind,q,cursor,snapshotId,signal})=>{
  if(kind==='product'){
    const response=await getMenu({q:q||undefined,cursor,limit:20},signal,storeId)
    return {items:response.data.items.map(row=>({id:row.product_id,name:row.name,code:row.sku,kind})),nextCursor:response.meta.pagination.next_cursor}
  }
  if(kind==='ingredient'){
    const response=await getInventory({q:q||undefined,cursor,limit:20},signal,storeId)
    return {items:response.data.items.filter(row=>row.ingredient_active).map(row=>({id:row.ingredient_id,name:row.name,code:row.sku,kind})),nextCursor:response.meta.pagination.next_cursor}
  }
  if(!isImportUuid(storeId)||!q.trim()||q.trim().length>200||
    cursor!==undefined&&(!cursor||cursor.length>4096)||snapshotId!==undefined&&(!snapshotId||snapshotId.length>128))throw new Error('Cần Store, từ khóa và phạm vi tìm nhà cung cấp hợp lệ.')
  if(config.mockPreview)throw new Error('Danh mục nhà cung cấp chưa được cấp trong bản xem trước.')
  const query=new URLSearchParams({q:q.trim(),limit:'20',sort:'name'})
  if(cursor!==undefined)query.set('cursor',cursor)
  if(snapshotId!==undefined)query.set('snapshot_id',snapshotId)
  const response=await requestJson<unknown>(config.apiBaseUrl,`/api/v1/stores/${storeId}/suppliers?${query}`,{signal})
  if(!matchesImportWire('SupplierPickerEnvelope',response))throw new HttpError('protocol','Phản hồi danh mục nhà cung cấp không đúng contract.')
  const value=response as unknown as WireSupplierPickerEnvelope
  const {items}=value.data,{pagination}=value.meta
  if(!value.meta.request_id.trim()||!value.meta.snapshot_id.trim()||
    snapshotId!==undefined&&snapshotId!==value.meta.snapshot_id||pagination.limit<1||pagination.limit>100||items.length>pagination.limit||
    pagination.total_count!==null&&pagination.total_count<items.length||pagination.next_cursor!==null&&(!pagination.next_cursor.trim()||pagination.next_cursor===cursor)||
    new Set(items.map(item=>item.supplier_id)).size!==items.length||items.some(item=>!item.name.trim()))throw new HttpError('protocol','Danh mục nhà cung cấp không khớp snapshot hoặc phân trang.',undefined,undefined,value.meta.request_id)
  return {items:items.map(item=>({id:item.supplier_id,name:item.name,code:null,kind,active:item.active,version:item.version})),nextCursor:pagination.next_cursor,snapshotId:value.meta.snapshot_id}
}
