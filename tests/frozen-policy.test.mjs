import test from 'node:test'
import assert from 'node:assert/strict'
import { notificationDestination } from '../src/features/notifications/notifications.navigation'
import { canRequestStaffChanges } from '../src/features/import-data/importSubmission.policy'
import { commitReasonRequired } from '../src/features/import-data/importCommitReason'
const owner='00000000-0000-4000-8000-000000000001',staff='00000000-0000-4000-8000-000000000002'
test('request changes requires verified current Staff origin and never an Owner self-proposal',()=>{
 const submission={submitted_by_user_id:staff,state:'submitted',review_eligibility:{eligible:true},allowed_actions:['request_changes']},origin={active:true,user:{user_id:staff}}
 assert.equal(canRequestStaffChanges(true,origin,submission,owner),true)
 for(const args of [[false,origin,submission,owner],[true,null,submission,owner],[true,origin,submission,staff],[true,origin,submission,undefined],[true,{...origin,active:false},submission,owner],[true,origin,{...submission,state:'rejected'},owner],[true,origin,{...submission,review_eligibility:{eligible:false}},owner],[true,origin,{...submission,allowed_actions:['reject']},owner]])assert.equal(canRequestStaffChanges(...args),false)
})
test('notifications navigate only resource-matching registered paths with Store and submission version intact',()=>{
 const item={store:{store_id:owner},object:{type:'mapping_submission',id:staff,revision:'submission/2'},link:{path:`/stores/${owner}/mapping-submissions/${staff}`,availability:'available'}}
 const url=new URL(notificationDestination(item),'https://frontend.invalid');assert.equal(url.pathname,'/imports/approvals');assert.equal(url.searchParams.get('submission_version'),'submission/2');assert.equal(url.searchParams.get('store_id'),owner)
 for(const next of [{...item,store:null},{...item,link:{...item.link,availability:'forbidden'}},{...item,link:{...item.link,path:'https://evil.invalid'}},{...item,object:{...item.object,id:owner}}])assert.equal(notificationDestination(next),null)
 assert.equal(notificationDestination({...item,object:{type:'membership',id:staff},link:{path:`/stores/${owner}`,availability:'available'}}),`/store?store_id=${owner}`)
})
test('commit reason optional only for full pure insert/NO_OP preview; updates, consequential actions and incomplete evidence require reason',()=>{
 const bundle={preview:{rows:[{proposed_action:'INSERT'},{proposed_action:'NO_OP'}],rows_page:{next_cursor:null,total_count:2},summary:{groups:[{planned_update_count:0}]}}}
 assert.equal(commitReasonRequired(bundle),false)
 for(const action of ['REPLACE_DAILY_TOTAL','MERGE_DISJOINT_SALES','COUNT_CORRECTION','AMEND_TERM_PERIOD','AMEND_FEE_PERIOD'])assert.equal(commitReasonRequired({preview:{...bundle.preview,rows:[{proposed_action:action}],rows_page:{next_cursor:null,total_count:1}}}),true)
 assert.equal(commitReasonRequired({preview:{...bundle.preview,summary:{groups:[{planned_update_count:1}]}}}),true)
 assert.equal(commitReasonRequired({preview:{...bundle.preview,rows_page:{next_cursor:'next',total_count:3}}}),true)
})

test('Staff submission gate reads the complete batch queue and refuses duplicate/repeating pages',async()=>{
 const {readImportSubmissions}=await import('../src/features/import-data/importSubmission.data')
 const calls=[],signal=new AbortController().signal
 const api={mapping:{list:async(input,options)=>{calls.push({input,options});return {data:{items:[{submission_id:input.query.cursor?'second':'first'}]},meta:{snapshot_id:'snapshot/1',pagination:{next_cursor:input.query.cursor?null:'next'}}}}}}
 const rows=await readImportSubmissions(owner,staff,signal,api);assert.equal(rows.length,2);assert.equal(calls[1].options.snapshotId,'snapshot/1');assert.equal(calls[0].input.query.import_id,staff)
 const duplicate={mapping:{list:async(input)=>({data:{items:[{submission_id:'same'}]},meta:{snapshot_id:'snapshot/1',pagination:{next_cursor:input.query.cursor?null:'next'}}})}}
 await assert.rejects(readImportSubmissions(owner,staff,signal,duplicate),/trùng/)
 const repeat={mapping:{list:async()=>({data:{items:[]},meta:{snapshot_id:'snapshot/1',pagination:{next_cursor:'repeat'}}})}}
 await assert.rejects(readImportSubmissions(owner,staff,signal,repeat),/đọc hết/)
})

test('history corrections join the global gate: missing, duplicate, stale and extra confirmations cannot bypass Review',async()=>{
 const {importDomainBlockers}=await import('../src/features/import-data/importDomainReview')
 const row={row_id:owner,proposed_action:'CORRECT_HISTORY_RECORD',confirmation_required:true,expected_version:'history/1'}
 const bundle={preview:{rows:[row]}},confirmation={row_id:owner,expected_version:'history/1',reason:'Correct source evidence'}
 assert.equal(importDomainBlockers(bundle,[],[],[confirmation]).length,0)
 for(const values of [[],[confirmation,confirmation],[{...confirmation,expected_version:'old'}],[{...confirmation,row_id:staff}],[{...confirmation,reason:' '}],[confirmation,{...confirmation,row_id:staff}]])assert.match(importDomainBlockers(bundle,[],[],values).join(' '),/lịch sử/)
 assert.equal(commitReasonRequired({preview:{rows:[row],rows_page:{next_cursor:null,total_count:1},summary:{groups:[]}}}),true)
})
