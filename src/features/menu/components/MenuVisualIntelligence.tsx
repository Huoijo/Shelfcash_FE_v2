import { BudgetRail, VisualState } from '../../../shared/visual-intelligence/VisualIntelligence'
import type { MenuRecipe } from '../menu.types'
import { formatMenuDecimal } from '../menu.format'
import { recipeDependencyGroups } from '../menu.visual'
import './MenuVisualIntelligence.css'
export function MenuRecipeIntelligence({recipe}:{recipe:MenuRecipe|null}) {
  return <section className="sc-vi-card sc-menu-vi" aria-label="Recipe dependency"><header><strong>Recipe dependency</strong><span>Định lượng cho toàn mẻ</span></header><p className="sc-vi-caption">Chỉ so sánh trong nhóm có cùng đơn vị. Không cộng chéo g, ml, cái; không phải tỷ trọng toàn công thức.</p>
    {!recipe||!recipe.ingredients.length?<VisualState title="Nguyên liệu" kind={!recipe?'unavailable':'empty'}>Chưa đủ dữ liệu công thức để tạo dependency.</VisualState>:recipeDependencyGroups(recipe).map(group=><section className="sc-menu-vi-group" key={group.unit} aria-label={`Nguyên liệu dùng đơn vị ${group.unit||'chưa rõ'}`}><header><strong>Nhóm {group.unit||'chưa rõ đơn vị'}</strong><span>{group.lines.length>1?'Tỷ trọng trong cùng đơn vị':'Định lượng trực tiếp'}</span></header>{group.lines.map(({line,share})=><div className="sc-menu-vi-row" key={line.recipe_line_id}><div><strong>{line.ingredient_name}</strong><span>{formatMenuDecimal(line.quantity)} {line.unit}{!line.ingredient_active?' · Ngừng hoạt động':''}</span></div><BudgetRail label={`${line.ingredient_name}: ${formatMenuDecimal(line.quantity)} ${line.unit}; chỉ so sánh trong nhóm ${group.unit}`} percent={share} copy={share===null?'Định lượng trực tiếp · không có tỷ lệ so sánh':`${share.toLocaleString('vi-VN')}% trong nhóm`}/></div>)}</section>)}
    <div className="sc-menu-vi-contracts"><VisualState title="Rủi ro tồn kho" kind="contract">Menu chưa có trạng thái tồn kho authoritative cho từng nguyên liệu.</VisualState><VisualState title="Chi phí nguyên liệu" kind="contract">Chưa có ingredient cost; không suy chi phí, margin hoặc lợi nhuận từ giá bán.</VisualState></div>
  </section>
}
