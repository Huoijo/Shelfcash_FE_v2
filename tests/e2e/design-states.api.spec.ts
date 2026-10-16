import {test,expect,type Page} from '@playwright/test'
import {createHash} from 'node:crypto'
import {backend,env,paging,errorResponse,s,user,member,at} from './helpers/api'
import {planningRunFixture,planningOptionFixture,PLANNING_FIXTURE_IDS} from '../../src/features/decision-planning/planning.fixtures'
import {inventoryFixtureItems,inventoryFixtureMeta,inventoryFixtureSummary,inventoryFixtureLots,inventoryFixtureMovements} from '../../src/features/inventory/inventory.fixtures'
const invite='00000000-0000-4000-8000-000000000061',exp='00000000-0000-4000-8000-000000000062',jobId='00000000-0000-4000-8000-000000000063'
const proof='synthetic-invitation-proof'
const offer=(status='pending')=>env({invitation:{invitation_id:invite,store:{store_id:s,name:'Invited Store'},target_email:'controlled@example.invalid',role:'STAFF',offered_grants:['inventory.read'],permission_catalog_version:'permissions-v3',permission_descriptors:[{key:'inventory.read',group:'Kho',label_vi:'Xem tồn kho',description_vi:'Đọc kho',grantable_to_staff:true,required_with:[],exposure:'ordinary'}],version:'invite/1',status,declined_at:status==='declined'?at:null,issued_at:at,expires_at:'2026-10-19T00:00:00Z'},can_accept:status==='pending',can_decline:status==='pending',reason_codes:[]})

test('wrong-account invitation reveals only current account and supports logout before login',async({page})=>{
  let writes=0
  await backend(page,(path,method)=>{
    if(path===`/api/v1/staff-invitations/${invite}`)return errorResponse(403,'INVITATION_ACCOUNT_MISMATCH')
    if(path==='/api/v1/auth/logout'){writes++;return {httpStatus:204}}
    if(method==='POST')throw Error('Unexpected business write')
  })
  await page.goto(`/invitations/${invite}#token=${proof}`)
  await expect(page.getByRole('heading',{name:'Hãy đăng nhập bằng tài khoản khác'})).toBeVisible()
  await expect(page.getByText('controlled@example.invalid',{exact:true})).toBeVisible()
  await expect(page.getByText('Invited Store')).toHaveCount(0)
  expect(page.url()).not.toContain('#')
  await page.getByRole('button',{name:'Đăng nhập bằng tài khoản khác'}).click()
  await expect.poll(()=>writes).toBe(1)
})

for(const status of ['expired','revoked'] as const)test(`invitation ${status} is terminal without acceptance writes`,async({page})=>{
  let writes=0
  await backend(page,(path,method)=>{if(method==='POST')writes++;if(path===`/api/v1/staff-invitations/${invite}`)return offer(status)})
  await page.goto(`/invitations/${invite}#token=${proof}`)
  await expect(page.getByRole('heading',{name:status==='expired'?'Lời mời đã hết hạn':'Lời mời không còn hiệu lực'})).toBeVisible()
  await expect(page.getByRole('button',{name:'Chấp nhận lời mời'})).toHaveCount(0)
  expect(writes).toBe(0)
})

test('acceptance lost ACK preserves intent and opens freshly verified invited Store',async({page})=>{
  const writes:any[]=[];let accepted=false,sessionReads=0,storeReads=0
  await backend(page,(path,method,body,headers)=>{
    if(path==='/api/v1/auth/me'){sessionReads++;return env({user:{user_id:user,email:'controlled@example.invalid',display_name:'QA'},session:{expires_at:'2027-01-01T00:00:00Z',absolute_expires_at:'2027-01-02T00:00:00Z',csrf_token:'controlled-csrf'},default_store_id:accepted?s:null,accessible_store_count:accepted?1:0,authorization_version:accepted?'auth/2':'auth/1'})}
    if(path===`/api/v1/staff-invitations/${invite}`)return offer(accepted?'accepted':'pending')
    if(path.endsWith('/accept')){writes.push({body,headers});accepted=true;if(writes.length===1)return 'ABORT';return env({invitation_id:invite,invitation_version_at_acceptance:'invite/1',store_id:s,membership_id:member,role:'STAFF',accepted_grants:['inventory.read'],authorization_version_at_acceptance:'staff/2',accepted_at:at,event_id:exp,next_action:'refresh_store_context'})}
    if(path==='/api/v1/stores')return env({items:[{store_id:s,name:'Invited Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'STAFF',membership_id:member,authorization_version:'staff/2'}]},paging(1))
    if(path===`/api/v1/stores/${s}`){storeReads++;return env({store_id:s,name:'Invited Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'STAFF',membership_id:member,authorization_version:'staff/2',active:true,server_now:at,as_of_date:'2026-10-12',membership:{membership_id:member,role:'STAFF',authorization_version:'staff/2',effective_permissions:['inventory.read','ingredient.read']},permission_catalog_version:'permissions-v3'})}
  })
  await page.goto(`/invitations/${invite}#token=${proof}`)
  await page.getByRole('button',{name:'Chấp nhận lời mời',exact:true}).click()
  await expect(page.getByText('Chưa xác nhận được kết quả',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Kiểm tra lại trạng thái'}).click()
  await expect(page.getByText('Quyền truy cập đã được xác nhận',{exact:true})).toBeVisible()
  expect(writes).toHaveLength(2);expect(writes[0]).toEqual(writes[1]);expect(sessionReads).toBeGreaterThan(1);expect(storeReads).toBeGreaterThan(0)
  await page.getByRole('link',{name:'Đi tới cửa hàng',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Cửa hàng',exact:true})).toBeVisible()
  await expect(page.getByLabel('Cửa hàng hiện tại')).toHaveValue(s)
  await expect.poll(()=>new URL(page.url()).searchParams.has('store_id')).toBe(false)
  await page.screenshot({path:'test-results/009-onboarding-store.png',animations:'disabled'})
})

test('credential UI retains 12-character contract, hides token and never auto-logins',async({page})=>{
  let writes=0,logins=0
  await backend(page,(path,method,body,headers)=>{
    if(path==='/api/v1/auth/credentials/complete'){writes++;expect(method).toBe('POST');expect(headers['x-csrf-token']).toBeUndefined();expect(body.password).toBe('Strong password 009');return env({completed_at:at,next_action:'login'})}
    if(path==='/api/v1/auth/login')logins++
  })
  await page.goto('/credentials/complete#token=synthetic-credential-proof')
  await page.getByLabel('Mật khẩu mới',{exact:true}).fill('short123')
  await page.getByLabel('Xác nhận mật khẩu',{exact:true}).fill('short123')
  await page.getByRole('button',{name:'Hoàn tất thiết lập',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('12–128')
  expect(writes).toBe(0)
  await page.getByLabel('Mật khẩu mới',{exact:true}).fill('Strong password 009')
  await page.getByLabel('Xác nhận mật khẩu',{exact:true}).fill('Strong password 009')
  await page.getByRole('button',{name:'Hoàn tất thiết lập',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Thiết lập tài khoản đã hoàn tất'})).toBeVisible()
  expect(writes).toBe(1);expect(logins).toBe(0);expect(page.url()).not.toContain('token=')
  await page.screenshot({path:'test-results/009-credential-success.png',animations:'disabled'})
})

async function fillReceipt(page:Page){const d=page.getByRole('dialog');await d.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa tươi');await d.getByRole('option',{name:/Sữa tươi/}).click();await d.getByLabel(/Số lượng thực nhận/).fill('2.125');await d.getByLabel('Hệ thống/chứng từ nguồn').fill('qa-009');await d.getByLabel('Mã dòng nhận hàng duy nhất').fill('readback');await d.getByLabel(/Thời điểm quan sát/).fill(at);await d.getByLabel('Lý do',{exact:true}).fill('Readback recovery');await d.getByLabel('Tôi đã kiểm tra dữ liệu và xác nhận ghi.').check();await d.getByRole('button',{name:'Tiếp tục',exact:true}).click();return d}

test('confirmed receipt with failed readback retries reads without another receipt write',async({page})=>{
  const id='10000000-0000-0000-0000-000000000001',rows=structuredClone(inventoryFixtureItems),lots=structuredClone(inventoryFixtureLots),moves=structuredClone(inventoryFixtureMovements),meta=structuredClone(inventoryFixtureMeta)
  let writes=0,failNext=false
  await backend(page,(path,method)=>{
    if(path.endsWith('/inventory/receipts')){writes++;failNext=true;const row=rows.find(r=>r.ingredient_id===id)!;row.on_hand_quantity='17.625';meta.snapshot_id='readback/2';meta.data_version='readback/2';const lot={...lots[id][1],lot_id:exp,quantity:'2.125'},movement={...moves[id][0],movement_id:jobId,lot_id:exp,quantity_delta:'2.125',kind:'receipt',origin:'ACTUAL_RECEIPT'};lots[id].push(lot);moves[id].unshift(movement);return env({receipt_id:exp,origin:'ACTUAL_RECEIPT',lot,movement,inventory_version:meta.data_version,audit_reference:jobId,warnings:[]})}
    if(path.endsWith('/inventory')){if(failNext){failNext=false;return 'ABORT'}return env({summary:inventoryFixtureSummary,items:rows,missing_ingredient_ids:[]},{...meta,...paging(rows.length)})}
    if(path.endsWith('/lots'))return env({ingredient_id:id,items:lots[id]},{...meta,...paging(lots[id].length)})
    if(path.endsWith('/movements'))return env({ingredient_id:id,items:moves[id]},{...meta,...paging(moves[id].length)})
    if(path.endsWith('/'+id))return env({...rows.find(r=>r.ingredient_id===id),lots:lots[id],lots_page:{next_cursor:null,total_count:lots[id].length},threshold_version:'threshold/1'},meta)
    if(method==='POST')throw Error('Unexpected write')
  })
  await page.goto('/inventory');await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click();const d=await fillReceipt(page)
  expect(writes).toBe(0)
  await d.getByRole('button',{name:'Xác nhận nhận hàng',exact:true}).click()
  await expect(d.getByRole('heading',{name:'Đã ghi nhận hàng, nhưng chưa tải đủ dữ liệu mới nhất'})).toBeVisible()
  await d.getByRole('button',{name:'Thử tải lại dữ liệu'}).click()
  await expect(d.getByText(/Đã đọc snapshot mới: 17.625/)).toBeVisible();expect(writes).toBe(1)
  await d.screenshot({path:'test-results/009-receipt-recovered.png',animations:'disabled'})
})

test('PDF captures chosen alternative and download failure retries artifact only',async({page})=>{
  const run=planningRunFixture(),option='controlled-alternative',bytes=Buffer.from('%PDF-1.4\ncontrolled artifact\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
  run.result!.options[0].source_strategies=['lean','balanced'];run.result!.strategies.find(s=>s.strategy==='protected')!.option_id=option
  run.result!.options.push(planningOptionFixture({option_id:option,source_strategies:['protected'],not_selected_reason:'HIGHER_COST'}))
  let writes=0,downloads=0
  await backend(page,(path,method,body)=>{
    if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
    if(method==='POST'){writes++;expect(body.option_id).toBe(option);return env({export_id:exp,run_id:run.run_id,option_id:option,status:'queued',job_id:jobId,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})}
    if(path===`/api/v1/jobs/${jobId}`)return env({job_id:jobId,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run.run_id,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run.run_id,option_id:option,download_url:`/api/v1/procurement-plans/${run.run_id}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,pagination:null,warnings:[]})
    if(path.endsWith('/exports/'+exp)){downloads++;return downloads===1?'ABORT':bytes}
  })
  await page.goto('/forecast/planning?plan_id='+run.run_id+'&historical=1')
  await expect(page.getByText('Run lịch sử · chỉ đọc',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();const d=page.getByRole('dialog')
  await d.getByLabel('Phương án sẽ xuất').selectOption(option);expect(writes).toBe(0)
  await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
  await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('button',{name:'Thử lại tải'})).toBeVisible()
  const download=page.waitForEvent('download');await d.getByRole('button',{name:'Thử lại tải'}).click();await download
  await expect(d.getByRole('heading',{name:'Tải PDF thành công'})).toBeVisible();expect(writes).toBe(1);expect(downloads).toBe(2)
})

test('History paginates same snapshot and empty filters never manufacture budget or results',async({page})=>{
  const run=planningRunFixture(),second='00000000-0000-4000-8000-000000000064'
  const item={run_id:run.run_id,store_id:s,status:'completed',accepted_at:at,started_at:at,completed_at:at,forecast_start_date:'2026-10-11',forecast_end_date:'2026-10-17',requirements_mode:'default',created_by:{user_id:user,display_name:'QA'},winner_option_id:PLANNING_FIXTURE_IDS.option,outcome:'recommendation_available',error_code:null,result_schema_version:'planning-result/1',result_digest:PLANNING_FIXTURE_IDS.digest,record_version:'run/1'}
  const requests:URL[]=[]
  await backend(page,(path,_method,_body,_headers,url)=>{if(path===`/api/v1/stores/${s}/procurement-plans`){requests.push(url);const filtered=url.searchParams.has('status'),cursor=url.searchParams.has('cursor');return env({items:filtered?[]:cursor?[{...item,run_id:second,status:'running',completed_at:null,result_schema_version:null,result_digest:null,winner_option_id:null,outcome:null}]:[item]},{snapshot_id:'history/1',pagination:{limit:50,next_cursor:filtered||cursor?null:'signed-next',total_count:filtered?0:2}})}})
  await page.goto('/forecast/planning/history');await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(1)
  await page.getByRole('button',{name:'Tải thêm',exact:true}).click();await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(2)
  await expect(page.getByText('Xem trong Run',{exact:true})).toHaveCount(2)
  await page.getByLabel('Trạng thái',{exact:true}).selectOption('failed');await expect(page.getByRole('heading',{name:'Không có run phù hợp bộ lọc'})).toBeVisible()
  expect(requests.at(-1)!.searchParams.get('status')).toBe('failed');expect(requests.at(-1)!.searchParams.has('cursor')).toBe(false)
  await page.screenshot({path:'test-results/009-history-filtered-empty.png',animations:'disabled'})
})
