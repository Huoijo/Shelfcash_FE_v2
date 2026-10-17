import type { MenuRecipe } from './menu.types'
import { decimalFraction, proportion, sumFractions } from '../../shared/visual-intelligence/visualMath'

/** Recipe lines retain their own identity. Denominators never cross explicit units. */
export function recipeDependencyGroups(recipe:MenuRecipe) {
  const units=[...new Set(recipe.ingredients.map(line=>line.unit))]
  return units.map(unit=>{
    const lines=recipe.ingredients.filter(line=>line.unit===unit)
    const quantities=lines.map(line=>decimalFraction(line.quantity))
    const total=unit.trim()?sumFractions(quantities):null
    return {unit,lines:lines.map((line,index)=>({line,share:lines.length>1?proportion(quantities[index],total):null}))}
  })
}
