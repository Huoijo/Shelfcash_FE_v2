import {test,expect} from '@playwright/test'
import {inventoryFixtureItems,inventoryFixtureMeta,inventoryFixtureSummary,inventoryFixtureLots,inventoryFixtureMovements} from '../../src/features/inventory/inventory.fixtures'
import {planningRunFixture,planningContextFixture,PLANNING_FIXTURE_IDS} from '../../src/features/decision-planning/planning.fixtures'
import {createHash} from 'node:crypto'
import {s,user,at,env,paging,backend} from './helpers/api'
test('API receipt lost response retries same intent; fresh snapshot/lot/movement reads confirm one write',async({page})=>{
  const rows=structuredClone(inventoryFixtureItems),lots=structuredClone(inventoryFixtureLots),moves=structuredClone(inventoryFixtureMovements),meta=structuredClone(inventoryFixtureMeta)
  const id='10000000-0000-0000-0000-000000000001',lotId='00000000-0000-4000-8000-000000000021',moveId='00000000-0000-4000-8000-000000000022'
  const requests:any[]=[];let receipt:any
  await backend(page,async(path,method,body,headers)=>{
    if(path.endsWith('/inventory/receipts')){
      requests.push({body,headers});expect(method).toBe('POST');expect(headers['x-csrf-token']).toBe('controlled-csrf')
      if(!receipt){const row=rows.find(r=>r.ingredient_id===id)!;row.on_hand_quantity='17.625';row.usable_quantity='17.625';row.usable_known_quantity='17.625';meta.snapshot_id='controlled-after-receipt';meta.data_version='controlled-stock/2'
        const lot={...lots[id][1],lot_id:lotId,quantity:'2.125',batch_code:'QA-LOT'},movement={...moves[id][0],movement_id:moveId,lot_id:lotId,kind:'receipt',quantity_delta:'2.125',origin:'ACTUAL_RECEIPT'}
        lots[id].push(lot);moves[id].unshift(movement);receipt=env({receipt_id:lotId,origin:'ACTUAL_RECEIPT',lot,movement,inventory_version:meta.data_version,audit_reference:moveId,warnings:[]});return 'ABORT'
      }
      return receipt
    }
    if(path.endsWith('/inventory'))return env({summary:inventoryFixtureSummary,items:rows,missing_ingredient_ids:[]},{...meta,...paging(rows.length)})
    if(path.endsWith('/lots'))return env({ingredient_id:id,items:lots[id]},{...meta,...paging(lots[id].length)})
    if(path.endsWith('/movements'))return env({ingredient_id:id,items:moves[id]},{...meta,...paging(moves[id].length)})
    if(path.endsWith('/'+id))return env({...rows.find(r=>r.ingredient_id===id)!,lots:lots[id],lots_page:{next_cursor:null,total_count:lots[id].length},threshold_version:'threshold/1'},meta)
  })
  await page.goto('/inventory');await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click();const d=page.getByRole('dialog')
  await d.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa tươi');await d.getByRole('option',{name:/Sữa tươi/}).click();await d.getByLabel(/Số lượng thực nhận/).fill('2.125');await d.getByLabel('Hệ thống/chứng từ nguồn').fill('qa-browser');await d.getByLabel('Mã dòng nhận hàng duy nhất').fill('row-1');await d.getByLabel(/Thời điểm quan sát/).fill(at);await d.getByLabel('Lý do',{exact:true}).fill('Actual receipt');await d.getByLabel('Tôi đã kiểm tra dữ liệu và xác nhận ghi.').check();await d.getByRole('button',{name:'Tiếp tục',exact:true}).click();await d.getByRole('button',{name:'Xác nhận nhận hàng',exact:true}).click()
  await d.getByRole('button',{name:'Thử lại cùng yêu cầu'}).click();await expect(d.getByText(/Đã đọc snapshot mới: 17.625/)).toBeVisible();expect(requests).toHaveLength(2);expect(requests[0].body).toEqual(requests[1].body);expect(requests[0].headers['idempotency-key']).toBe(requests[1].headers['idempotency-key']);expect(moves[id].filter(m=>m.movement_id===moveId)).toHaveLength(1)
})
test('retained run → PDF job → authenticated binary download; no procurement/stock mutation',async({page})=>{
  const run=planningRunFixture(),exp='00000000-0000-4000-8000-000000000031',job='00000000-0000-4000-8000-000000000032'
  const bytes=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
  const writes:string[]=[]
  await backend(page,(path,method,body)=>{
    if(method==='POST'){writes.push(path);expect(body.format).toBe('pdf');return env({export_id:exp,run_id:run.run_id,option_id:PLANNING_FIXTURE_IDS.option,status:'queued',job_id:job,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})}
    if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
    if(path===`/api/v1/jobs/${job}`)return env({job_id:job,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run.run_id,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run.run_id,option_id:PLANNING_FIXTURE_IDS.option,download_url:`/api/v1/procurement-plans/${run.run_id}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,pagination:null,warnings:[]})
    if(path.endsWith('/exports/'+exp))return bytes
  })
  await page.goto('/forecast/planning?plan_id='+run.run_id);await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();const d=page.getByRole('dialog');await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng')).toBeVisible();const downloading=page.waitForEvent('download');await d.getByRole('button',{name:'Tải PDF',exact:true}).click();const download=await downloading;expect(download.suggestedFilename()).toContain(exp);expect(writes).toEqual([`/api/v1/procurement-plans/${run.run_id}/exports`])
})
test('confirmed saved write with failed N2 retries only readback, never creates another resource',async({page})=>{
  const savedId='00000000-0000-4000-8000-000000000041';let writes=0,reads=0
  const requirements={budget_limit:null,paths:[{path:'BASE',min_fill_rate_percent:'95',product_overrides:[]}]}
  const detail={saved_requirement_id:savedId,store_id:s,name:'Known receipt',version:'saved/1',state:'active',created_at:at,updated_at:at,created_by_user_id:user,updated_by_user_id:user,requirements,default_reference:null,validation:{status:'valid',reason_codes:[]},warnings:[]}
  await backend(page,(path,method)=>{
    if(path.endsWith('/planning-context'))return env(planningContextFixture())
    if(path.endsWith('/planning-requirements')&&method==='POST'){writes++;return env(detail)}
    if(path.endsWith('/planning-requirements/'+savedId)){reads++;return reads===1?'ABORT':env(detail)}
  })
  await page.goto('/forecast/planning')
  await page.getByRole('tab',{name:'Tùy chỉnh',exact:true}).click()
  await page.getByRole('button',{name:'Lưu thành bộ mới',exact:true}).click()
  await page.getByLabel('Tên bộ yêu cầu').fill('Known receipt')
  await page.getByRole('button',{name:'Xác nhận lưu bộ mới',exact:true}).click()
  await page.getByRole('dialog').getByRole('button',{name:'Đọc lại bộ yêu cầu đã ghi'}).click()
  await expect(page.getByRole('tab',{name:'Đã lưu',exact:true})).toHaveAttribute('aria-selected','true')
  await expect(page.getByLabel('Bộ yêu cầu',{exact:true}).locator('option:checked')).toHaveText('Known receipt')
  await expect(page.getByRole('region',{name:'Yêu cầu lập kế hoạch'}).getByRole('alert')).toHaveCount(0)
  expect(writes).toBe(1);expect(reads).toBe(2)
})
