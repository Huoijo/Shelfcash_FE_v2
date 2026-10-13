import {test,expect,type Page} from '@playwright/test'
import {createHash} from 'node:crypto'
import {backend,env,errorResponse,s,at} from './helpers/api'
import {planningRunFixture,planningNoWinnerFixture,PLANNING_FIXTURE_IDS} from '../../src/features/decision-planning/planning.fixtures'
const exp='00000000-0000-4000-8000-000000000071',job='00000000-0000-4000-8000-000000000072'
const bytes=Buffer.from('%PDF-1.4\nretained reference\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
const accepted=(run:string,option:string)=>env({export_id:exp,run_id:run,option_id:option,status:'queued',job_id:job,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})
const ready=(run:string,option:string)=>env({job_id:job,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run,option_id:option,download_url:`/api/v1/procurement-plans/${run}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,warnings:[]})
async function open(page:Page,run:string){await page.goto('/forecast/planning?plan_id='+run);await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();return page.getByRole('dialog')}

test('011 reference candidate without winner exports with warning; lost ACK preserves intent',async({page})=>{
 const run=planningRunFixture(),option=PLANNING_FIXTURE_IDS.option,posts:any[]=[]
 run.outcome='no_eligible_candidate';run.result!.winner_option_id=null;run.result!.winner_reason='NO_ELIGIBLE_CANDIDATE'
 run.result!.options[0].eligible=false;run.result!.options[0].rejection_reasons=['CUSTOMER_REQUIREMENTS_NOT_MET'];run.result!.options[0].not_selected_reason='CUSTOMER_REQUIREMENTS_NOT_MET'
 for(const strategy of run.result!.strategies){strategy.customer_pass=false;strategy.selection_kind='REFERENCE_NOT_RANKED';strategy.customer_feasibility='UNKNOWN'}
 await backend(page,(path,method,body,headers)=>{
  if(path.endsWith('/exports')&&method==='POST'){posts.push({body,key:headers['idempotency-key']});return posts.length===1?'ABORT':accepted(run.run_id,option)}
  if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,option)
 })
 const d=await open(page,run.run_id);await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeDisabled();expect(posts).toHaveLength(0)
 await d.getByLabel('Phương án sẽ xuất').selectOption(option)
 await expect(d.getByText('Phương án tham khảo — không được khuyến nghị',{exact:true})).toBeVisible()
 await expect(d.getByText('CUSTOMER_REQUIREMENTS_NOT_MET',{exact:true})).toBeVisible()
 await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await d.getByRole('button',{name:'Thử lại cùng yêu cầu'}).click()
 await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible();await expect(d.getByText('Phương án tham khảo — không được khuyến nghị',{exact:true})).toBeVisible()
 expect(posts).toHaveLength(2);expect(posts[0]).toEqual(posts[1]);expect(posts[0].body.option_id).toBe(option);expect(run.result!.winner_option_id).toBeNull()
 await d.screenshot({path:'test-results/011-reference-export.png',animations:'disabled'})
})

test('011 no retained candidate never submits export or invents a selection',async({page})=>{
 const run=planningNoWinnerFixture();let writes=0
 await backend(page,(path,method)=>{if(method==='POST')writes++;if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}})
 const d=await open(page,run.run_id);await expect(d.getByText('Không có candidate đã lưu để xuất PDF.',{exact:true})).toBeVisible()
 await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeDisabled();await expect(d.getByLabel('Phương án sẽ xuất').locator('option')).toHaveCount(1);expect(writes).toBe(0)
})

for(const recovery of ['retry','new'] as const)test(`011 artifact unavailable 503 uses explicit ${recovery} recovery`,async({page})=>{
 const run=planningRunFixture(),posts:any[]=[];let reads=0
 await backend(page,(path,method,body,headers)=>{
  if(path.endsWith('/exports')&&method==='POST'){posts.push({body,key:headers['idempotency-key']});return accepted(run.run_id,PLANNING_FIXTURE_IDS.option)}
  if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,PLANNING_FIXTURE_IDS.option)
  if(path.endsWith('/exports/'+exp)){reads++;return reads===1?errorResponse(503,'EXPORT_ARTIFACT_UNAVAILABLE'):bytes}
 })
 const d=await open(page,run.run_id);await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
 await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('heading',{name:'Bản PDF không còn khả dụng'})).toBeVisible();expect(posts).toHaveLength(1)
 if(recovery==='retry'){
  const download=page.waitForEvent('download');await d.getByRole('button',{name:'Thử tải lại artifact'}).click();await download;await expect(d.getByRole('heading',{name:'Tải PDF thành công'})).toBeVisible();expect(reads).toBe(2);expect(posts).toHaveLength(1)
 }else{
  await d.getByRole('button',{name:'Tạo export mới'}).click();await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeEnabled();expect(posts).toHaveLength(1)
  await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect.poll(()=>posts.length).toBe(2);expect(posts[0].key).not.toBe(posts[1].key);expect(posts[0].body).toEqual(posts[1].body)
 }
})

test('011 revoked download permission prevents retry and new export actions',async({page})=>{
 const run=planningRunFixture();let writes=0
 await backend(page,(path,method)=>{
  if(path.endsWith('/exports')&&method==='POST'){writes++;return accepted(run.run_id,PLANNING_FIXTURE_IDS.option)}
  if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,PLANNING_FIXTURE_IDS.option)
  if(path.endsWith('/exports/'+exp))return errorResponse(403,'PERMISSION_DENIED')
 })
 const d=await open(page,run.run_id);await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
 await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('heading',{name:'Không còn quyền tải PDF'})).toBeVisible()
 await expect(d.getByRole('button',{name:/Tải PDF|Thử lại tải|Tạo export mới|Thử tải lại artifact/})).toHaveCount(0);expect(writes).toBe(1)
})
