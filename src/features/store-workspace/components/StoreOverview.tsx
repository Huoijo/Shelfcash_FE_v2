import { useId } from 'react'
import type { StoreContext } from '../../store/store.types'
import { storeWeekdays } from '../storeWorkspace.format'
import { StoreReadonlyToggle } from './StoreWorkspaceChrome'
import './StoreWorkspace.css'

// These values never merge into T02. They are illustrative presentation only, explicitly DEV mock.
const illustrativeProfile = { businessType: 'Café', address: '19-21 Nguyễn Huệ, Quận 1, TP.HCM', phone: '028 1234 5678' }

export function StoreOverview({ store, mockPreview = false }: { store: StoreContext; mockPreview?: boolean }) {
  const id = useId()
  const unavailable = 'Chưa được cung cấp'
  return <div className="sc-store-stack">
    {mockPreview && <p className="sc-store-note" role="note">Minh họa DEV: loại hình, địa chỉ, điện thoại và giờ mở cửa dưới đây là dữ liệu mẫu, không phải thông tin đã lưu.</p>}
    <section className="sc-store-card sc-store-card-body" aria-labelledby={`${id}-profile`}>
      <div className="sc-store-section-heading"><div><h2 id={`${id}-profile`}>Thông tin cửa hàng</h2></div></div>
      <div className="sc-store-fields">
        <label className="sc-store-field">Tên cửa hàng<input className="sc-store-input" value={store.name} disabled readOnly /></label>
        <label className="sc-store-field">Loại hình kinh doanh<select className="sc-store-input" disabled value={mockPreview ? illustrativeProfile.businessType : ''}><option value="">{unavailable}</option>{mockPreview && <option value="Café">Café · minh họa</option>}</select></label>
        <label className="sc-store-field sc-store-field-wide">Địa chỉ<input className="sc-store-input" value={mockPreview ? illustrativeProfile.address : unavailable} disabled readOnly /></label>
        <label className="sc-store-field">Số điện thoại<input className="sc-store-input" value={mockPreview ? illustrativeProfile.phone : unavailable} disabled readOnly /></label>
        <label className="sc-store-field">Múi giờ<select className="sc-store-input" disabled value={store.timezone}><option value={store.timezone}>{store.timezone}</option></select></label>
        <label className="sc-store-field">Đơn vị tiền tệ<select className="sc-store-input" disabled value={store.currency}><option value={store.currency}>{store.currency}</option></select></label>
      </div><p className="sc-store-note sc-store-note-spaced" id={`${id}-readonly`}>Chỉnh sửa thông tin cửa hàng chưa được hỗ trợ.</p>
      <div className="sc-store-actions"><button type="button" className="sc-store-primary" disabled aria-describedby={`${id}-readonly`}>Lưu thay đổi</button></div>
    </section>
    <div className="sc-store-overview-grid">
      <section className="sc-store-card sc-store-card-body" aria-labelledby={`${id}-hours`}><h2 id={`${id}-hours`}>Giờ hoạt động</h2>
        <div className="sc-store-hours">{storeWeekdays.map((day, index) => <div key={day} className="sc-store-hours-row"><strong>{day}</strong>
          <button type="button" className="sc-store-status" disabled aria-label={`Trạng thái mở cửa ${day}`}>{mockPreview ? 'Mở cửa' : 'Chưa biết'}</button>
          <div className="sc-store-hours-times"><input disabled aria-label={`Giờ mở cửa ${day}`} value={mockPreview ? '07:00' : '—'} readOnly /><span aria-hidden="true">—</span><input disabled aria-label={`Giờ đóng cửa ${day}`} value={mockPreview ? index === 4 || index === 5 ? '23:00' : '22:00' : '—'} readOnly /></div>
        </div>)}</div><p className="sc-store-note sc-store-note-spaced">Giờ mở cửa chưa được hỗ trợ. Không suy ra giờ mở cửa từ lịch giao hàng hay dữ liệu bán.</p>
      </section>
      <section className="sc-store-card sc-store-card-body" aria-labelledby={`${id}-status`}><h2 id={`${id}-status`}>Trạng thái</h2>
        <div className="sc-store-status-row"><div><p>Đang hoạt động</p></div><StoreReadonlyToggle checked label="Cửa hàng đang cho phép truy cập; không thể thay đổi tại đây" /></div>
        <p className="sc-store-note sc-store-divider">Chuyển cửa hàng sang Tạm ngưng chưa được hỗ trợ. Trạng thái này không được suy từ dữ liệu hoặc số thành viên.</p>
      </section>
    </div>
  </div>
}
