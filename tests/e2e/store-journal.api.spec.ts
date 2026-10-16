import {test,expect,type Page} from '@playwright/test'
import {backend,env,paging,s,member,user,errorResponse} from './helpers/api'

const body={name:'Journal controlled Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND'}
const summary={store_id:s,...body,role:'OWNER',membership_id:member,authorization_version:'member/1'}
const auth=(actor=user,csrf='fresh-controlled-csrf')=>env({user:{user_id:actor,email:'controlled@example.invalid',display_name:'QA'},session:{expires_at:'2027-01-01T00:00:00Z',absolute_expires_at:'2027-01-02T00:00:00Z',csrf_token:csrf},default_store_id:null,accessible_store_count:0,authorization_version:'auth/1'})
type Write={body:unknown;key:string;csrf:string}
async function setup(page:Page,writes:Write[],options:{actor?:()=>string;csrf?:()=>string;reply?:(n:number)=>unknown|Promise<unknown>}={}){
 await backend(page,(path,method,payload,headers)=>{
  if(path==='/api/v1/auth/me')return auth(options.actor?.()??user,options.csrf?.()??'fresh-controlled-csrf')
  if(path==='/api/v1/stores'){
   if(method==='GET')return env({items:[]},paging(0))
   writes.push({body:payload,key:headers['idempotency-key'],csrf:headers['x-csrf-token']})
   return options.reply?options.reply(writes.length):writes.length===1?'ABORT':{httpStatus:201,body:env(summary)}
  }
 })
}
async function create(page:Page){
 await page.getByRole('button',{name:'Tạo cửa hàng đầu tiên',exact:true}).click()
 await page.getByLabel('Tên cửa hàng').fill(body.name);await page.getByLabel('Múi giờ').fill(body.timezone);await page.getByLabel('Tiền tệ').fill(body.currency)
 await page.getByRole('button',{name:'Tạo cửa hàng',exact:true}).click()
}
const unknown=(page:Page)=>expect(page.getByText('Chưa xác nhận được kết quả',{exact:true})).toBeVisible()

test('T03 unknown -> reload restores exact intent; empty readback stays locked; explicit replay uses fresh CSRF',async({page})=>{
 let csrf='first-controlled-csrf';const writes:Write[]=[];await setup(page,writes,{csrf:()=>csrf});await page.goto('/store');await create(page);await unknown(page)
 csrf='fresh-controlled-csrf';await page.reload();await unknown(page);await expect(page.getByLabel('Tên cửa hàng')).toHaveValue(body.name);await expect(page.getByLabel('Tên cửa hàng')).toBeDisabled()
 await page.getByRole('button',{name:'Kiểm tra trạng thái',exact:true}).click();await expect(page.getByText(/chưa chứng minh yêu cầu trước chưa tạo/)).toBeVisible();expect(writes).toHaveLength(1)
 await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await expect(page.getByRole('heading',{name:'Cửa hàng đã được tạo'})).toBeVisible()
 expect(writes).toHaveLength(2);expect(writes[1].key).toBe(writes[0].key);expect(writes[1].body).toEqual(writes[0].body);expect(writes[1].csrf).toBe('fresh-controlled-csrf');expect(writes[0].csrf).toBe('first-controlled-csrf')
 const rows=await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('shelfcash-intent-journal',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});try{return await new Promise<unknown[]>((resolve,reject)=>{const r=db.transaction('intents').objectStore('intents').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}finally{db.close()}})
 expect(JSON.stringify(rows)).not.toContain('fresh-controlled-csrf');expect(JSON.stringify(rows)).not.toMatch(/password|cookie|token/i)
})
test('T03 unavailable durable storage prevents any initial dispatch',async({page})=>{
 const writes:Write[]=[];await page.addInitScript(()=>{Object.defineProperty(IDBFactory.prototype,'open',{value:()=>{throw new DOMException('Test storage unavailable','SecurityError')}})})
 await setup(page,writes);await page.goto('/store');await expect(page.getByRole('alert')).toContainText('lưu');await expect(page.getByRole('button',{name:'Tạo cửa hàng đầu tiên',exact:true})).toBeDisabled();expect(writes).toHaveLength(0)
})
test('T03 write transaction failure prevents dispatch even when storage reads succeed',async({page})=>{
 const writes:Write[]=[];await page.addInitScript(()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='intents')throw new DOMException('Test quota','QuotaExceededError');return original.apply(this,args)}})
 await setup(page,writes);await page.goto('/store');await create(page);await expect(page.getByRole('alert')).toContainText('lưu');expect(writes).toHaveLength(0)
})
test('T03 switching account hides another actor intent and restores it only for matching actor',async({page})=>{
 let actor=user;const writes:Write[]=[];await setup(page,writes,{actor:()=>actor});await page.goto('/store');await create(page);await unknown(page)
 actor='00000000-0000-4000-8000-000000000099';await page.reload();await expect(page.getByRole('button',{name:'Tạo cửa hàng đầu tiên',exact:true})).toBeVisible();await expect(page.getByText('Chưa xác nhận được kết quả',{exact:true})).toHaveCount(0);expect(writes).toHaveLength(1)
 actor=user;await page.reload();await unknown(page);await expect(page.getByLabel('Tên cửa hàng')).toHaveValue(body.name);expect(writes).toHaveLength(1)
})
test('T03 wrong current cookie account blocks replay before POST',async({page})=>{
 let actor=user;const writes:Write[]=[];await setup(page,writes,{actor:()=>actor});await page.goto('/store');await create(page);await unknown(page)
 actor='00000000-0000-4000-8000-000000000099';await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await expect(page.getByRole('button',{name:'Tạo cửa hàng đầu tiên',exact:true})).toBeVisible();await expect(page.getByLabel('Tên cửa hàng')).toHaveCount(0);expect(writes).toHaveLength(1)
})
test('T03 two tabs share one intent and cannot dispatch concurrently; replay keeps original key',async({page,context})=>{
 const writes:Write[]=[];let release!:()=>void;const pending=new Promise<void>(r=>{release=r})
 await setup(page,writes,{reply:async()=>{await pending;return 'ABORT'}});await page.goto('/store');await create(page);await expect.poll(()=>writes.length).toBe(1)
 const other=await context.newPage();await setup(other,writes,{reply:()=>({httpStatus:201,body:env(summary)})});await other.goto('/store');await unknown(other);await expect(other.getByLabel('Tên cửa hàng')).toBeDisabled()
 await other.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();expect(writes).toHaveLength(1)
 release();await unknown(page);await other.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await expect(other.getByRole('heading',{name:'Cửa hàng đã được tạo'})).toBeVisible();expect(writes).toHaveLength(2);expect(writes[1].key).toBe(writes[0].key);expect(writes[1].body).toEqual(writes[0].body)
})
test('T03 late original success after reload is reconciled only with original key',async({page})=>{
 const writes:Write[]=[];let release!:()=>void;const pending=new Promise<void>(r=>{release=r});let effects=0
 await setup(page,writes,{reply:async n=>{if(n===1){await pending;effects=1}return {httpStatus:201,body:env(summary)}}})
 await page.goto('/store');await create(page);await expect.poll(()=>writes.length).toBe(1);await page.reload();await unknown(page);release();await expect.poll(()=>effects).toBe(1)
 await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await expect(page.getByRole('heading',{name:'Cửa hàng đã được tạo'})).toBeVisible();expect(writes).toHaveLength(2);expect(writes[1].key).toBe(writes[0].key);expect(effects).toBe(1)
})
test('T03 denied replay keeps original uncertainty across reload and never unlocks a replacement',async({page})=>{
 const writes:Write[]=[];await setup(page,writes,{reply:n=>n===1?'ABORT':errorResponse(403,'PERMISSION_DENIED')});await page.goto('/store');await create(page);await unknown(page)
 await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await unknown(page);await expect(page.getByLabel('Tên cửa hàng')).toBeDisabled();expect(writes).toHaveLength(2);expect(writes[1].key).toBe(writes[0].key)
 await page.reload();await unknown(page);await expect(page.getByLabel('Tên cửa hàng')).toHaveValue(body.name);await expect(page.getByRole('button',{name:'Tạo cửa hàng',exact:true})).toBeDisabled();expect(writes).toHaveLength(2)
})
