import { test, expect } from '@playwright/test'
import { backend, env, paging, s, member, user, at, errorResponse } from './helpers/api'
const id='00000000-0000-4000-8000-000000000041', staff='00000000-0000-4000-8000-000000000042'
const auth=(stores=1)=>env({user:{user_id:user,email:'controlled@example.invalid',display_name:'QA'},session:{expires_at:'2027-01-01T00:00:00Z',absolute_expires_at:'2027-01-02T00:00:00Z',csrf_token:'controlled-csrf'},default_store_id:stores?s:null,accessible_store_count:stores,authorization_version:'auth/1'})
const summary={store_id:s,name:'Created Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'OWNER',membership_id:member,authorization_version:'member/1'}
const notification=()=>({notification_id:id,recipient_user_id:user,store:{store_id:s,name:'Controlled Store'},event_id:staff,decision_id:null,event_type:'mapping.submitted',occurred_at:at,created_at:at,read_at:null,title:'Đề xuất cần xem',body:'Xem cách đọc Staff đã gửi.',object:{type:'mapping_submission',id:staff,revision:'submission/1'},link:{path:`/stores/${s}/mapping-submissions/${staff}`,availability:'available'},version:'notification/1'})
const submission=(actor=staff)=>({submission_id:id,store_id:s,profile_id:id,import_id:id,sheet_id:id,file_id:id,submitted_by_user_id:actor,submitted_at:at,reason:'Staff reviewed source',version:'submission/1',state:'submitted',proposal_revision:'proposal/1',mapping_revision:'mapping/1',import_revision:'import/1',file_set_version:'files/1',lifecycle_revision_at_submission:'lifecycle/1',spec_digest:'spec/1',expected_active_version:null,review_eligibility:{eligible:true,reason_codes:[]},current_profile:{lifecycle_revision:'lifecycle/1',active_version:null,reviewed_version_retired:false},decision:null,allowed_actions:['approve_activate','request_changes','reject']})
const detail=(actor=staff)=>env({submission:submission(actor),source:{file_id:id,filename:'source.csv',sheet_id:id,sheet_name:'Sheet',source_system_key:'test',report_type:'sales',schema_signature:'shape/1',evidence_references:['source/1']},spec:{scope:{source_system_key:'test',report_type:'sales'},schema:'sales',structure:{sheet_roles:[],header_rules:[],schema_signature:'shape/1'},field_bindings:[],source_provenance:{declared_by:staff,evidence_references:['source/1']}},warnings:[],missing_fields:[],evidence:{cells:[],next_cursor:null,total_count:0}})

test('registration sends only A02 fields, then verification-required; it creates no session or Store',async({page})=>{
 const writes:any[]=[]
 await backend(page,(path,method,body)=>{if(path==='/api/v1/auth/me')return errorResponse(401,'UNAUTHENTICATED');if(method==='POST'){writes.push({path,body});if(path==='/api/v1/auth/register')return {httpStatus:202,body:env({next_action:'check_email',delivery:{status:'accepted'},retry_after_seconds:60})}}})
 await page.goto('/register');await page.getByLabel('Email',{exact:true}).fill('new@example.invalid');await page.getByLabel('Tên hiển thị').fill('New User');await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click()
 await expect(page).toHaveURL(/email-verification/);await expect(page.getByRole('heading',{name:'Kiểm tra email của bạn'})).toBeVisible()
 expect(writes).toEqual([{path:'/api/v1/auth/register',body:{email:'new@example.invalid',display_name:'New User'}}])
})
test('verification scrubs proof, waits for explicit password and preserves invitation without accepting it',async({page})=>{
 const writes:any[]=[]
 await backend(page,(path,method,body)=>{if(path==='/api/v1/auth/me')return errorResponse(401,'UNAUTHENTICATED');if(method==='POST'){writes.push({path,body});if(path.endsWith('/email-verifications/complete'))return env({next_action:'login',completed_at:at})}})
 await page.goto(`/email-verification?invitation_id=${id}#token=controlled-proof`)
 await expect(page).not.toHaveURL(/token=/);expect(writes).toHaveLength(0)
 await page.getByLabel('Mật khẩu mới',{exact:true}).fill('controlled-password');await page.getByLabel('Xác nhận mật khẩu',{exact:true}).fill('controlled-password');await page.getByRole('button',{name:'Xác minh email',exact:true}).click()
 await expect(page.getByRole('button',{name:'Tiếp tục đăng nhập'})).toBeVisible();expect(writes).toEqual([{path:'/api/v1/auth/email-verifications/complete',body:{token:'controlled-proof',password:'controlled-password'}}])
 await page.screenshot({path:'/tmp/shelfcash-freeze-verification-runtime.png',fullPage:true});await page.getByRole('button',{name:'Tiếp tục đăng nhập'}).click();await expect(page).toHaveURL(/login/);expect(writes).toHaveLength(1)
 await page.screenshot({path:'/tmp/shelfcash-freeze-auth-runtime.png',fullPage:true})
})
test('zero-Store T03 uncertainty cannot be disproved by empty T01 and exact replay preserves original key/body',async({page})=>{
 const writes:any[]=[];let count=0
 await backend(page,(path,method,body,headers)=>{if(path==='/api/v1/auth/me')return auth(0);if(path==='/api/v1/stores'){if(method==='GET')return env({items:[]},paging(0));writes.push({body,key:headers['idempotency-key']});return ++count===1?'ABORT':{httpStatus:201,body:env(summary)}}})
 await page.goto('/store');await page.getByRole('button',{name:'Tạo cửa hàng đầu tiên',exact:true}).click();await page.getByLabel('Tên cửa hàng').fill('Created Store');await page.getByLabel('Múi giờ').fill('Asia/Ho_Chi_Minh');await page.getByLabel('Tiền tệ').fill('VND');await page.getByRole('button',{name:'Tạo cửa hàng',exact:true}).click()
 await expect(page.getByText('Chưa xác nhận được kết quả',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Kiểm tra trạng thái',exact:true}).click();await expect(page.getByText(/chưa chứng minh yêu cầu trước chưa tạo/)).toBeVisible();await expect(page.getByLabel('Tên cửa hàng')).toBeDisabled();expect(writes).toHaveLength(1)
 await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu trước',exact:true}).click();await expect(page.getByRole('heading',{name:'Cửa hàng đã được tạo'})).toBeVisible();expect(writes).toHaveLength(2);expect(writes[1]).toEqual(writes[0])
 await page.screenshot({path:'/tmp/shelfcash-freeze-store-runtime.png',fullPage:true})
})
test('notification opening causes no business write; failed read acknowledgment retains unread state and handoff pins destination',async({page})=>{
 const writes:any[]=[]
 await backend(page,(path,method,body,headers)=>{if(path==='/api/v1/notifications/unread-count')return env({unread_count:1,scope:'accessible',store_id:null},{snapshot_id:'count/1',observed_at:at});if(path==='/api/v1/notifications')return env({items:[notification()]},{...paging(1),snapshot_id:'inbox/1',observed_at:at});if(method==='PATCH'){writes.push({path,body,key:headers['idempotency-key'],revision:headers['if-match']});return errorResponse(412,'STALE_NOTIFICATION')}})
 await page.goto('/notifications');await page.getByRole('button',{name:'Mở →',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(writes).toHaveLength(0);await expect(page.getByRole('dialog').getByRole('link',{name:'Mở nội dung cần xử lý'})).toHaveAttribute('href',`/imports/approvals?store_id=${s}&submission_id=${staff}&submission_version=submission%2F1`)
 await page.getByRole('dialog').getByRole('button',{name:'Đánh dấu đã đọc',exact:true}).click();await expect(page.getByRole('dialog').getByText('Chưa xác nhận trạng thái đã đọc. Bạn vẫn có thể mở nội dung.')).toBeVisible();await expect(page.getByRole('dialog').getByRole('button',{name:'Đánh dấu đã đọc',exact:true})).toBeVisible();expect(writes).toHaveLength(1);expect(writes[0].revision).toBe('"notification/1"')
 await page.screenshot({path:'/tmp/shelfcash-freeze-notifications-runtime.png',fullPage:true})
})
for(const own of [false,true])test(`Owner request changes requires real Staff submission; own=${own}`,async({page})=>{
 const writes:any[]=[]
 await backend(page,(path,method,body)=>{if(path===`/api/v1/stores/${s}/mapping-submissions/${id}`)return detail(own?user:staff);if(path===`/api/v1/stores/${s}/memberships`)return env({permission_catalog:[],items:[{membership_id:member,user:{user_id:staff,email:'staff@example.invalid',display_name:'Real Staff'},role:'STAFF',active:true,grants:[],version:'grants/1',updated_at:at}]},paging(1));if(method==='POST'){writes.push(body);return errorResponse(412,'STALE_SUBMISSION')}})
 await page.goto(`/imports/approvals?store_id=${s}&submission_id=${id}`);await expect(page.getByRole('heading',{name:'source.csv · Sheet'})).toBeVisible();await expect(page.getByRole('button',{name:'Duyệt Profile',exact:true})).toBeVisible()
 if(own){await expect(page.getByRole('button',{name:'Yêu cầu chỉnh sửa',exact:true})).toHaveCount(0);return}
 await page.getByRole('button',{name:'Yêu cầu chỉnh sửa',exact:true}).click();await page.getByLabel('Lý do quyết định').fill('Clarify unit evidence');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Xác nhận',exact:true}).click();await expect(page.getByRole('dialog').getByRole('alert')).toContainText('STALE_SUBMISSION');expect(writes).toHaveLength(1);expect(writes[0].decision).toBe('request_changes');expect(writes[0].expected_submission_version).toBe('submission/1');expect(writes[0].proposal_revision).toBe('proposal/1')
 await page.screenshot({path:'/tmp/shelfcash-freeze-owner-runtime.png',fullPage:true})
})
test('Today unknown inventory remains unknown and does not claim calm, zero stock or pending decision',async({page})=>{
 await backend(page,path=>path===`/api/v1/stores/${s}/today`?env({store_id:s,sections:{inventory:{availability:'unknown',value:null,updated_at:null,completeness:'unknown',reason_codes:[],source:null}}},{snapshot_id:'today/1',observed_at:at,as_of_date:'2026-10-12',timezone:'Asia/Ho_Chi_Minh'}):undefined)
 await page.goto('/today');await expect(page.getByText('Tồn kho',{exact:true})).toBeVisible();await expect(page.getByText(/Tồn kho.*Chưa xác định/)).toBeVisible();await expect(page.getByText('Hôm nay mọi thứ đang ổn')).toHaveCount(0);await expect(page.getByText(/Chưa có dữ liệu xác định quyết định đang chờ/)).toBeVisible()
})

test('unknown read acknowledgment survives internal navigation and only exact replay releases the writer',async({page})=>{
 const writes:any[]=[];let attempt=0
 await backend(page,(path,method,body,headers)=>{
  if(path==='/api/v1/notifications/unread-count')return env({unread_count:attempt>=2?0:1,scope:'accessible',store_id:null},{snapshot_id:'count/1',observed_at:at});if(path==='/api/v1/notifications')return env({items:[notification()]},{...paging(1),snapshot_id:'inbox/1',observed_at:at})
  if(method==='PATCH'){writes.push({body,key:headers['idempotency-key'],revision:headers['if-match']});return ++attempt===1?'ABORT':env({notification_id:id,read_at:at,version:'notification/2'})}
 })
 await page.goto('/notifications');await page.getByRole('button',{name:'Đánh dấu đã đọc',exact:true}).click();await expect(page.getByRole('button',{name:'Kiểm tra đúng yêu cầu đánh dấu trước'})).toBeVisible()
 await page.getByRole('link',{name:'Hôm nay',exact:true}).click();await page.getByRole('link',{name:/^Thông báo/}).click()
 await expect(page.getByRole('button',{name:'Đánh dấu đã đọc',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Kiểm tra đúng yêu cầu đánh dấu trước'}).click()
 await expect(page.getByRole('button',{name:'Đánh dấu chưa đọc',exact:true})).toBeEnabled();expect(writes).toHaveLength(2);expect(writes[1]).toEqual(writes[0])
})
