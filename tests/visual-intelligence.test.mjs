import assert from 'node:assert/strict'
import { test } from 'node:test'
import {decimalFraction, proportion, decimalDelta} from '../src/shared/visual-intelligence/visualMath'
import {setupVisualBudget,retainedDailySeries} from '../src/features/decision-planning/planning.visual'
import {planningContextFixture,planningIngredientFixture} from '../src/features/decision-planning/planning.fixtures'
import {lotComposition,movementGeometry,expiryDistance} from '../src/features/inventory/inventory.visual'
import {inventoryFixtureLots,inventoryFixtureMovements} from '../src/features/inventory/inventory.fixtures'
import {mappingComposition,previewComposition,importReadinessSegments} from '../src/features/import-data/import.visual'
import {recipeDependencyGroups} from '../src/features/menu/menu.visual'
import {menuFixtureProducts} from '../src/features/menu/menu.fixtures'

test('VI ratios distinguish zero numerator, absent and zero denominator without floating point loss',()=>{
  assert.equal(proportion(decimalFraction('0'),decimalFraction('2')),0)
  assert.equal(proportion(decimalFraction('2'),decimalFraction('0')),null)
  assert.equal(proportion(decimalFraction('2'),null),null)
  assert.equal(proportion(decimalFraction('-1'),decimalFraction('2')),null)
  assert.equal(proportion(decimalFraction('900719925474099300000'),decimalFraction('1801439850948198600000')),50)
})
test('VI exact cost delta stays presentation-only and does not coerce missing costs',()=>{
  assert.equal(decimalDelta(decimalFraction('9007199254740993.125'),decimalFraction('9007199254740993.025')),'0.1')
  assert.equal(decimalDelta(decimalFraction('0.0000000000001'),decimalFraction('0')),'0.0000000000001')
  assert.equal(decimalDelta(undefined,decimalFraction('1')),null)
})
test('setup VI hides forbidden budget facts and preserves no-ceiling, zero and saved unknown',()=>{
  const context=planningContextFixture()
  assert.equal(setupVisualBudget(context,null,'',false).runBudget,null)
  assert.equal(setupVisualBudget({...context,budget_ceiling:null},null,'',true).mode,'no-ceiling')
  assert.equal(setupVisualBudget({...context,budget_ceiling:{...context.budget_ceiling,amount:'0'}},null,'',true).percent,null)
  assert.equal(setupVisualBudget(context,{requirements_mode:'saved',saved_requirement_id:'fixture'},'',true).runBudget,null)
})
test('retained daily adapter keeps path/date gaps, duplicate points and unit mismatches unknown',()=>{
  const ingredient=planningIngredientFixture()
  ingredient.daily_balances=ingredient.daily_balances.filter(row=>row.day!=='2026-10-13')
  const first=ingredient.daily_balances[0]
  ingredient.daily_balances.push({...first})
  const groups=retainedDailySeries(ingredient,'2026-10-11')
  assert.equal(groups[0].points[0].row,null)
  assert.equal(groups[1].points[2].row,null)
  assert.equal(groups[1].points.length,7)
  assert.equal(retainedDailySeries({...ingredient,daily_balances:null},'2026-10-11')[0].points.every(p=>p.row===null),true)
})
test('lot composition rejects mixed units and distinguishes zero denominator from a known zero lot',()=>{
  const lots=Object.values(inventoryFixtureLots)[0]
  const parts=lotComposition(lots,'l')
  assert.equal(parts[0].share,0)
  assert.equal(parts[1].share,16.1)
  assert.equal(lotComposition([{...lots[0],quantity:'0'}],'l')[0].share,null)
  assert.equal(lotComposition([lots[1],{...lots[2],unit:'kg'}],'l')[0].share,null)
  assert.equal(expiryDistance('2026-10-09','2026-10-10'),-1)
  assert.equal(expiryDistance(null,'2026-10-10'),null)
})
test('movement geometry uses ordered signed deltas and does not reconstruct stock balances',()=>{
  const items=Object.values(inventoryFixtureMovements)[0]
  const points=movementGeometry(items,'l')
  assert.equal(points[0].item.movement_id,items.at(-1).movement_id)
  assert.equal(points.at(-1).item.quantity_delta,'-0.500')
  assert.equal(points.at(-1).share,20)
  assert.equal(movementGeometry([{...items[0],unit:'kg'}],'l')[0].share,null)
})
test('mapping uses complete batch counters only, not filtered or partially loaded issues',()=>{
  const batch={total:10,by_status:{auto_mapped:4,resolved:2,needs_confirmation:2,ambiguous:1,unmatched:1},by_origin:{}}
  assert.equal(mappingComposition({counters:{batch,filtered:{total:1,by_status:{},by_origin:{}}}})[0].share,40)
  assert.equal(mappingComposition({counters:{batch:{...batch,total:11}}}),null)
  assert.equal(mappingComposition({counters:{batch:{...batch,by_status:{auto_mapped:4}}}}),null)
  assert.equal(mappingComposition({}),null)
})
test('preview composition uses full summary groups; warning notices are not action counts',()=>{
  const group={row_count:10,planned_insert_count:5,planned_update_count:2,no_op_count:2,blocked_count:1}
  const parts=previewComposition({groups:[group],warnings:new Array(20)})
  assert.deepEqual(parts.map(p=>p.share),[50,20,20,10])
  assert.equal(previewComposition({groups:[{...group,row_count:11}]}).every(p=>p.share===null),true)
  assert.equal(previewComposition({groups:[{...group,planned_insert_count:0,planned_update_count:0,no_op_count:0,blocked_count:0}]}).every(p=>p.share===null),true)
})
test('readiness never converts no issues into positive domain confirmation',()=>{
  assert.equal(importReadinessSegments({availability:'ready',can_execute:true,blockers:[],warnings:[]},'loaded').every(p=>p.state==='unknown'),true)
  assert.equal(importReadinessSegments({blockers:[{source:'inventory'}]},'loaded')[1].state,'attention')
  assert.equal(importReadinessSegments(null,'permission').every(p=>p.state==='permission'),true)
})
test('recipe dependency keeps explicit units, duplicate line identity, zero and unavailable denominators',()=>{
  const recipe=structuredClone(menuFixtureProducts[1].recipe)
  const groups=recipeDependencyGroups(recipe)
  assert.equal(groups.length,2)
  assert.equal(groups.find(g=>g.unit==='ml').lines[0].share,null)
  assert.equal(groups.find(g=>g.unit==='g').lines[0].share,3.8)
  recipe.ingredients.push({...recipe.ingredients[0],recipe_line_id:'duplicate-line'})
  assert.equal(recipeDependencyGroups(recipe).find(g=>g.unit==='ml').lines.length,2)
  recipe.ingredients.forEach(line=>line.quantity='0')
  assert.equal(recipeDependencyGroups(recipe).every(g=>g.lines.every(p=>p.share===null)),true)
})
