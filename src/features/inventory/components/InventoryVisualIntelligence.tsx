import { ProportionalRail, VisualState } from '../../../shared/visual-intelligence/VisualIntelligence'
import type { InventoryLot, InventoryMovement } from '../inventory.types'
import { expiryLabel, formatInventoryDate, formatQuantity } from '../inventory.format'
import { expiryDistance, lotComposition, movementGeometry } from '../inventory.visual'
import './InventoryVisualIntelligence.css'
import { decimalFraction } from '../../../shared/visual-intelligence/visualMath'

export function InventoryLotIntelligence({lots,unit,asOf,partial}:{lots:InventoryLot[];unit:string;asOf:string;partial:boolean}) {
  const composition=lotComposition(lots,unit)
  const dated=lots.filter(lot=>lot.expiry_date&&BigInt(decimalFraction(lot.quantity)?.numerator??'0')>0n)
  const nearest=[...dated].sort((a,b)=>a.expiry_date!.localeCompare(b.expiry_date!))[0]
  const remaining=expiryDistance(nearest?.expiry_date??null,asOf)
  const received=nearest?.received_date
  const lifetime=received?expiryDistance(nearest.expiry_date,received):null
  const elapsed=received?expiryDistance(asOf,received):null
  const progress=lifetime!==null&&lifetime>0&&elapsed!==null?Math.min(100,Math.max(0,elapsed/lifetime*100)):null
  return <div className="sc-inventory-vi">
    <section className="sc-vi-card"><header><strong>Phân bổ theo lô</strong><span>{partial?'Một phần · các lô đã tải':'Các lô đã ghi nhận'} · {lots.length} lô</span></header>
      {lots.length?<ProportionalRail label="Phân bổ lượng tồn theo lô" parts={composition.map(({lot,share},index)=>({key:lot.lot_id,label:lot.batch_code??`Lô ${index+1}`,value:formatQuantity(lot.quantity,unit),share,tone:lot.status==='expired'?'danger':lot.status==='near_expiry'?'attention':index%2?'muted':'neutral',note:`${lot.use_first?'Ưu tiên dùng trước · ':''}${expiryLabel(lot.expiry_date,asOf)}`}))} summary={partial?'Tỷ lệ chỉ trong các lô đã tải; chưa đại diện toàn bộ tồn kho.':undefined}/>:<VisualState title="Phân bổ theo lô" kind="empty">Chưa có lô được ghi nhận; chưa xác nhận tồn thực tế bằng 0.</VisualState>}
    </section>
    <section className="sc-vi-card"><header><strong>Hạn dùng gần nhất</strong><span>{partial?'Một phần · ':''}Theo ngày ảnh tồn kho</span></header>
      {nearest&&remaining!==null?<><div className="sc-inventory-expiry"><span>{received?formatInventoryDate(received):'Chưa rõ ngày nhận'}</span><div>{progress!==null&&<i style={{left:`${progress}%`}} aria-label={`Ngày ảnh tồn kho ${asOf}`}/>}</div><span>{formatInventoryDate(nearest.expiry_date)}</span></div><p className="sc-vi-caption">{nearest.batch_code??'Lô chưa có mã'} · {expiryLabel(nearest.expiry_date,asOf)} · Ngày ảnh tồn kho {formatInventoryDate(asOf)}</p></>:<VisualState title="Hạn dùng gần nhất" kind="unavailable">Chưa có lô còn lượng tồn với hạn dùng đã biết.</VisualState>}
      {lots.some(lot=>!lot.expiry_date)&&<p className="sc-vi-caption">Có lô chưa biết hạn dùng; không thể xác nhận hạn gần nhất cho toàn bộ các lô.</p>}
    </section>
    <VisualState title="Stock coverage" kind="contract">Chưa có nhu cầu dự kiến để xác định số ngày đáp ứng. Ngưỡng sắp hết không phải coverage.</VisualState>
  </div>
}
export function InventoryMovementIntelligence({items,unit,partial}:{items:InventoryMovement[];unit:string;partial:boolean}) {
  if(!items.length)return null
  const points=movementGeometry(items,unit)
  return <section className="sc-vi-card"><header><strong>Movement deltas</strong><span>{partial?'Một phần · ':''}Không phải số dư tồn kho</span></header><div className="sc-inventory-deltas" tabIndex={0} role="region" aria-label="Biến động đã ghi nhận theo thời gian, có thể cuộn ngang"><div className="sc-inventory-deltas-track">{points.map(({item,share})=><div className="sc-inventory-delta" key={item.movement_id}><div className="sc-inventory-delta-bar">{share!==null&&share>0&&<i data-negative={item.quantity_delta.startsWith('-')} style={{height:`${share*.25}px`}}/>}</div><time dateTime={item.occurred_at}>{formatInventoryDate(item.occurred_at.slice(0,10))}</time><strong>{formatQuantity(item.quantity_delta,unit)}</strong></div>)}</div></div><p className="sc-vi-caption">Cũ → mới · lượng tăng / giảm từng bản ghi, không cộng dồn thành đường tồn kho.</p></section>
}
