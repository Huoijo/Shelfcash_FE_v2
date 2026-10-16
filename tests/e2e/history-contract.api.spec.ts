import {test,expect} from '@playwright/test'
import {backend,env,s,user,at} from './helpers/api'

test('Independent current-contract N9 history paginates, preserves filter, and reloads',async({page},info)=>{
 const run='00000000-0000-4000-8000-000000000071',second='00000000-0000-4000-8000-000000000072'
 const item={run_id:run,store_id:s,status:'completed',accepted_at:at,started_at:at,completed_at:at,forecast_start_date:'2026-10-11',forecast_end_date:'2026-10-17',requirements_mode:'default',created_by:{user_id:user,display_name:'QA'},winner_option_id:'synthetic-basket/1',outcome:'recommendation_available',error_code:null,result_schema_version:'planning-result/1',result_digest:'synthetic-result-digest/1',record_version:'run/1',captured_budget:{availability:'available',limit:'0',currency:'VND'}}
 const calls:string[]=[]
 await backend(page,(path,_method,_body,_headers,url)=>{
  if(path===`/api/v1/stores/${s}/procurement-plans`){calls.push(url.toString());const filtered=url.searchParams.has('status'),cursor=url.searchParams.has('cursor');return env({items:filtered?[]:cursor?[{...item,run_id:second,status:'running',completed_at:null,result_schema_version:null,result_digest:null,winner_option_id:null,outcome:null}]:[item]}, {snapshot_id:'history/1',pagination:{limit:50,next_cursor:filtered||cursor?null:'signed-next',total_count:filtered?0:2},timezone:'Asia/Ho_Chi_Minh',applied_filters:{created_by_user_id:null,created_date_from:null,created_date_to:null}})}
 })
 await page.goto('/forecast/planning/history');await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(1)
 await page.getByRole('button',{name:'Tải thêm',exact:true}).click();await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(2)
 await page.getByLabel('Trạng thái',{exact:true}).selectOption('failed');await expect(page.getByRole('heading',{name:'Không có run phù hợp bộ lọc'})).toBeVisible()
 await page.reload();await expect(page.getByRole('heading',{name:'Không có run phù hợp bộ lọc'})).toBeVisible()
 expect(new URL(calls.at(-1)!).searchParams.get('status')).toBe('failed');expect(new URL(calls.at(-1)!).searchParams.has('cursor')).toBe(false)
 await info.attach('synthetic-history-requests',{body:JSON.stringify(calls),contentType:'application/json'})
})
