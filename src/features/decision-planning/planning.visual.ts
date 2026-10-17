import type { PlanningContext, PlanningIngredient, PlanningQuantity, PlanningRequest } from './planning.types'
import { parsePlanningBudget, shiftPlanningDate } from './planning.format'
import { decimalFraction, proportion, type Fraction } from '../../shared/visual-intelligence/visualMath'

export function setupVisualBudget(context:PlanningContext,request:PlanningRequest|null,input:string,permitted:boolean) {
  const ceiling=permitted?context.budget_ceiling?.amount??null:null
  const saved=request?.requirements_mode==='saved'
  const runBudget=!permitted||saved?null:input.trim()?parsePlanningBudget(input):!request?null:request.requirements?.budget_limit??context.default_requirements?.budget_limit??ceiling
  return {ceiling,runBudget,percent:permitted?proportion(decimalFraction(runBudget),decimalFraction(ceiling)):null,
    mode:!permitted?'permission':saved?'saved':ceiling===null?'no-ceiling':/^0(?:\.0+)?$/.test(ceiling)?'zero-ceiling':input.trim()||request?.requirements_mode==='custom'?'custom':'inherited'}
}
export function retainedBudgetShare(cost:PlanningQuantity|undefined,limit:string|null|undefined) {
  return proportion(cost,decimalFraction(limit))
}
export function maximumFraction(values:Fraction[]):Fraction|null {
  return values.reduce<Fraction|null>((max,value)=>{
    try {if(BigInt(value.denominator)<=0n||BigInt(value.numerator)<0n)return max
      return !max||BigInt(value.numerator)*BigInt(max.denominator)>BigInt(max.numerator)*BigInt(value.denominator)?value:max
    }catch{return max}
  },null)
}
/** C05 retained facts only. Missing dates are explicit gaps, not interpolated values. */
export function retainedDailySeries(ingredient:PlanningIngredient,start:string) {
  const dates=Array.from({length:7},(_,i)=>shiftPlanningDate(start,i)).filter((d):d is string=>!!d)
  return (['LOW','BASE','HIGH'] as const).map(path=>({path,points:dates.map(day=>{
    const matches=ingredient.daily_balances?.filter(row=>row.path===path&&row.day===day&&row.unit===ingredient.unit)??[]
    return {day,row:matches.length===1?matches[0]:null}
  })}))
}
