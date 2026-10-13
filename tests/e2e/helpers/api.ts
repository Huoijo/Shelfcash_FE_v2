import type {Page} from '@playwright/test'
import {PLANNING_FIXTURE_IDS} from '../../../src/features/decision-planning/planning.fixtures'
export const s=PLANNING_FIXTURE_IDS.store,user='00000000-0000-4000-8000-000000000001',member='00000000-0000-4000-8000-000000000002',at='2026-10-12T03:00:00Z'
export const permissions=['ingredient.read','inventory.read','inventory.receive','menu.read','recipe.read','recipe.create_version','recipe.manage_effectivity','planning.context.read','planning.run','planning.result.read','planning.export','planning.requirements.create','planning.requirements.manage','budget.update','budget.read','procurement.cost.read']
export const env=(data:unknown,meta={})=>({data,meta:{request_id:'controlled-browser',...meta},error:null})
export const paging=(n:number)=>({pagination:{limit:50,next_cursor:null,total_count:n}})
export const errorResponse=(status:number,code:string)=>({httpStatus:status,body:{data:null,meta:{request_id:'controlled-error'},error:{code,message:code,details:{}}}})
/** Controlled HTTP only; each unhandled business route fails, never falls back to fixtures. */
export async function backend(page:Page,handler:(path:string,method:string,body:any,headers:Record<string,string>,url:URL)=>Promise<unknown>|unknown){
  await page.route('http://127.0.0.1:18001/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname
    const headers={'Access-Control-Allow-Origin':'http://127.0.0.1:4174','Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'content-type,x-csrf-token,idempotency-key,if-match,if-none-match,x-invitation-token','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'}
    if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
    let data:any=await handler(path,req.method(),req.postDataJSON(),req.headers(),url)
    if(data===undefined){
      if(path==='/api/v1/auth/me')data=env({user:{user_id:user,email:'controlled@example.invalid',display_name:'QA'},session:{expires_at:'2027-01-01T00:00:00Z',absolute_expires_at:'2027-01-02T00:00:00Z',csrf_token:'controlled-csrf'},default_store_id:s,accessible_store_count:1,authorization_version:'controlled-auth/1'})
      else if(path==='/api/v1/stores')data=env({items:[{store_id:s,name:'Controlled Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'OWNER',membership_id:member,authorization_version:'controlled-member/1'}]},paging(1))
      else if(path===`/api/v1/stores/${s}`)data=env({store_id:s,name:'Controlled Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'OWNER',membership_id:member,authorization_version:'controlled-member/1',active:true,server_now:at,as_of_date:'2026-10-12',membership:{membership_id:member,role:'OWNER',authorization_version:'controlled-member/1',effective_permissions:permissions},permission_catalog_version:'permissions-v2'})
    }
    if(data==='ABORT'){await route.abort('failed');return}
    if(data instanceof Buffer){await route.fulfill({status:200,headers:{...headers,'content-type':'application/pdf'},body:data});return}
    if(data?.httpStatus){if(data.httpStatus===204)await route.fulfill({status:204,headers});else await route.fulfill({status:data.httpStatus,headers,json:data.body});return}
    if(!data){await route.fulfill({status:404,headers,json:{data:null,meta:{request_id:'qa'},error:{code:'NOT_STUBBED',message:path,details:{}}}});return}
    await route.fulfill({status:200,headers,json:data})
  })
}
