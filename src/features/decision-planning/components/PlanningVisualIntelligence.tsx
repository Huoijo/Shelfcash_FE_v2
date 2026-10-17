import { useState } from 'react'
import type { PlanningContext, PlanningIngredient, PlanningOption, PlanningRequest } from '../planning.types'
import { formatPlanningDate, formatPlanningMoney, formatPlanningQuantity } from '../planning.format'
import { retainedBudgetShare, retainedDailySeries, maximumFraction, setupVisualBudget } from '../planning.visual'
import { decimalDelta, proportion } from '../../../shared/visual-intelligence/visualMath'
import { BudgetRail, VisualState } from '../../../shared/visual-intelligence/VisualIntelligence'
import './PlanningVisualIntelligence.css'

export function PlanningContextRail({context,request,input,cutoff,readiness,permitted}:{context:PlanningContext;request:PlanningRequest|null;input:string;cutoff:string;readiness:string;permitted:boolean}) {
  const budget=setupVisualBudget(context,request,input,permitted)
  return <section className="sc-pvi-context" aria-label="Planning context của lần chạy đang cấu hình"><header><span>Planning context</span><strong>Các facts sẽ được capture khi tạo run</strong></header><dl>
    <div><dt>Ngày tham chiếu</dt><dd>{formatPlanningDate(cutoff)}</dd></div><div><dt>Kỳ kế hoạch</dt><dd>7 ngày</dd></div><div><dt>Nguồn yêu cầu</dt><dd>{request?.requirements_mode==='saved'?'Bộ yêu cầu đã lưu':request?.requirements_mode==='custom'?'Tùy chỉnh':request?'Mặc định':'Chưa xác định'}</dd></div><div><dt>Ngân sách run</dt><dd>{permitted?budget.mode==='saved'?'Theo bộ yêu cầu đã lưu':formatPlanningMoney(budget.runBudget,context.currency):'Giới hạn quyền'}</dd></div><div><dt>Readiness backend</dt><dd>{readiness}</dd></div>
  </dl></section>
}
export function PlanningBudgetRelationship({context,request,input,permitted}:{context:PlanningContext;request:PlanningRequest|null;input:string;permitted:boolean}) {
  const budget=setupVisualBudget(context,request,input,permitted)
  return <section className="sc-vi-card sc-pvi-budget-relation" aria-label="Quan hệ ngân sách"><header><strong>Quan hệ ngân sách</strong><span>Run budget ≠ tiền đã chi</span></header><dl className="sc-vi-facts"><div><dt>Ngân sách run</dt><dd>{!permitted?'Giới hạn quyền':budget.mode==='saved'?'Theo bộ yêu cầu đã lưu':formatPlanningMoney(budget.runBudget,context.currency)}</dd></div><div><dt>Trần Store</dt><dd>{!permitted?'Giới hạn quyền':budget.ceiling===null?'Không cấu hình':formatPlanningMoney(budget.ceiling,context.currency)}</dd></div></dl>
    <BudgetRail label="Ngân sách run so với trần Store" percent={budget.percent} copy={budget.percent!==null?`${budget.percent.toLocaleString('vi-VN')}% trần Store`:!permitted?'Không hiển thị tỷ lệ vì không có quyền xem trần Store.':budget.mode==='no-ceiling'?'Không có mẫu số: “không cấu hình trần” khác với 0 ₫.':budget.mode==='zero-ceiling'?'Không tạo tỷ lệ khi mẫu số là 0 ₫.':budget.mode==='saved'?'Ngân sách lấy từ bộ yêu cầu đã lưu.':'Nhập ngân sách run hợp lệ để xem quan hệ.'}/>
  </section>
}
export function PlanningBudgetShare({option,limit,currency}:{option:PlanningOption|undefined;limit:string|null;currency:string}) {
  const percent=retainedBudgetShare(option?.costs.currency===currency?option.costs.total:undefined,limit)
  return <BudgetRail label={`Chi phí đề xuất retained ${formatPlanningMoney(option?.costs.total,currency)} so với ngân sách run ${formatPlanningMoney(limit,currency)}`} percent={percent} copy={percent===null?'Không khả dụng · thiếu retained cost hoặc ngân sách run hợp lệ':`${percent.toLocaleString('vi-VN')}% ngân sách run · không phải tiền đã chi`}/>
}
export function PlanningStrategyDelta({current,baseline,currency}:{current:PlanningOption;baseline:PlanningOption|undefined;currency:string}) {
  const delta=decimalDelta(current.costs.currency===currency?current.costs.total:undefined,baseline?.costs.currency===currency?baseline.costs.total:undefined)
  return <div className="sc-pvi-delta"><span>Delta chi phí retained</span><strong>{delta===null?'Không khả dụng · thiếu retained cost để so sánh':`${delta.startsWith('-')?'': '+'}${formatPlanningMoney(delta,currency)}`}</strong><small>vs Cân bằng</small></div>
}
export function PlanningIngredientVisual({ingredient,start}:{ingredient:PlanningIngredient;start:string}) {
  const groups=retainedDailySeries(ingredient,start)
  const [selected,setSelected]=useState<'LOW'|'BASE'|'HIGH'>('BASE')
  const points=groups.find(g=>g.path===selected)!.points
  const known=points.flatMap(p=>p.row?[p.row.requested,p.row.ending]:[])
  const maximum=maximumFraction(known)
  const y=(v:typeof maximum)=>v&&maximum?(proportion(v,maximum)??0)*.72:0
  return <>
    <VisualState title="Coverage × lead time" kind="partial"><span>Coverage · Không khả dụng · Lead time · Không khả dụng · Kỳ kế hoạch 7 ngày</span></VisualState>
    <section className="sc-vi-card sc-pvi-trajectory" aria-label="Projected inventory vs demand"><header><strong>Projected inventory vs demand</strong><span>{ingredient.evidence_availability==='partial'?'Một phần · ':''}Retained · {ingredient.unit}</span></header>
      {!ingredient.daily_balances?.length?<VisualState title="Projected inventory vs demand" kind={ingredient.daily_balances===null?'unavailable':'empty'}>Chưa có bằng chứng tính theo ngày.</VisualState>:<>
        <div className="sc-pvi-paths" role="group" aria-label="Đường tính retained">{groups.map(g=><button type="button" key={g.path} aria-pressed={selected===g.path} onClick={()=>setSelected(g.path)}>{g.path}</button>)}</div>
        <div className="sc-pvi-trajectory-scroll" tabIndex={0} role="region" aria-label="Chuỗi theo ngày, có thể cuộn ngang"><svg viewBox="0 0 510 142" role="img" aria-label={`${selected}: nhu cầu và tồn cuối ngày được lưu theo ${ingredient.unit}; khoảng thiếu không được nối`}>
          <line x1="32" x2="476" y1="105" y2="105" stroke="#ddd"/>
          {points.map((p,i)=>{const prior=points[i-1]?.row;return <g key={p.day}>
            {p.row&&<>{prior&&<><line x1={32+(i-1)*74} y1={105-y(prior.requested)} x2={32+i*74} y2={105-y(p.row.requested)} stroke="#777" strokeWidth="2" strokeDasharray="4 3"/><line x1={32+(i-1)*74} y1={105-y(prior.ending)} x2={32+i*74} y2={105-y(p.row.ending)} stroke="#333" strokeWidth="2"/></>}
              <circle className="sc-pvi-demand-point" cx={32+i*74} cy={105-y(p.row.requested)} r="2.5" fill="#fff" stroke="#777"/>
              <circle className="sc-pvi-ending-point" cx={32+i*74} cy={105-y(p.row.ending)} r="3" fill="#fff" stroke="#333"/>
              {BigInt(p.row.incoming_quantity.numerator)>0n&&<path d={`M ${32+i*74} 18 l -4 -6 h 8 z`} fill="#1f6b4a"/>}</>}
            {!p.row&&<text x={32+i*74} y="80" textAnchor="middle">?</text>}<text x={32+i*74} y="129" textAnchor="middle">{p.day.slice(8)}/{p.day.slice(5,7)}</text>
          </g>})}
        </svg></div>
        <ul className="sc-vi-legend"><li>— Tồn cuối ngày</li><li>┄ Nhu cầu</li><li>▼ Hàng về</li></ul>
        <div className="sc-pvi-point-values" aria-label="Giá trị chính xác theo ngày">{points.map(p=><details key={p.day}><summary>{formatPlanningDate(p.day)}{p.row?'':' · Chưa có dữ liệu'}</summary>{p.row&&<dl className="sc-vi-facts"><div><dt>Nhu cầu</dt><dd>{formatPlanningQuantity(p.row.requested,ingredient.unit)}</dd></div><div><dt>Tồn cuối ngày</dt><dd>{formatPlanningQuantity(p.row.ending,ingredient.unit)}</dd></div><div><dt>Nhập đến</dt><dd>{formatPlanningQuantity(p.row.incoming_quantity,ingredient.unit)}</dd></div></dl>}</details>)}</div>
      </>}
    </section>
  </>
}

