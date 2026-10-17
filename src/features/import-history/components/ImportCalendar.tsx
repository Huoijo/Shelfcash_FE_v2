import { Link } from 'react-router'
import { calendarCells, formatDate, shiftMonth } from '../importHistory.format'
import type { ImportCalendar as CalendarData } from '../importHistory.types'
import { VisualState } from '../../../shared/visual-intelligence/VisualIntelligence'

type Props = {
  month: string
  selectedDate: string
  data?: CalendarData
  loadState?: 'loading'|'error'|'permission'|'unavailable'
  dateLink: (date: string) => string
}

export function ImportCalendar({ month, selectedDate, data, dateLink, loadState='unavailable' }: Props) {
  const counts = new Map(data?.days.map((day) => [day.date, day.import_count]))
  const [year, monthNumber] = month.split('-')
  return (
    <section className="history-calendar" aria-labelledby="history-month-title">
      <header className="history-calendar__header">
        {month > '0001-01' ? <Link to={dateLink(`${shiftMonth(month, -1)}-01`)} aria-label="Tháng trước">‹ <span>Tháng trước</span></Link> : <span />}
        <h2 id="history-month-title">Tháng {Number(monthNumber)} {year}</h2>
        {month < '9999-12' ? <Link to={dateLink(`${shiftMonth(month, 1)}-01`)} aria-label="Tháng sau"><span>Tháng sau</span> ›</Link> : <span />}
      </header>
      <div className="sc-history-vi"><strong>{!data||data.matched_import_count===null?'Chưa rõ số lần nhập':`${data.matched_import_count} lần nhập`}</strong><span>Trong tháng · theo bộ lọc hiện tại</span><VisualState title="Trạng thái trong tháng" kind={!data?loadState:data.matched_import_count===0?'empty':'contract'}>{!data?loadState==='loading'?'Đang đọc hoạt động theo tháng.':loadState==='permission'?'Bạn chưa có quyền xem dữ liệu tháng.':'Chưa tải được dữ liệu tháng.':data.matched_import_count===0?'Không có lần nhập theo bộ lọc hiện tại.':'Chưa có tổng số thành công / cảnh báo / thất bại của cả tháng. Trạng thái từng lần nhập ở danh sách ngày đã chọn.'}</VisualState></div>
      <div className="history-calendar__weekdays" aria-hidden="true">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="history-calendar__days" aria-label="Chọn ngày nhập dữ liệu">
        {calendarCells(month).map((date, index) => {
          if (!date) return <span className="history-calendar__blank" key={`blank-${index}`} />
          // Sparse H01 dates mean known zero only AFTER a successful response.
          const count = data ? (counts.has(date) ? counts.get(date)! : 0) : null
          return (
            <Link key={date} to={dateLink(date)} aria-current={date === selectedDate ? 'date' : undefined}
              aria-label={`${formatDate(date)}, ${count === null ? 'chưa có số lần nhập' : `${count} lần nhập`}`}
              className={`history-calendar__day${count !== null && count > 0 ? ' history-calendar__day--active' : ''}`}>
              <span className="history-calendar__number">{Number(date.slice(-2))}</span>
              {count !== null && count > 0 && <span className="history-calendar__count"><span aria-hidden="true">●</span> {count}</span>}
              {data && count === null && <span className="history-calendar__count">Chưa biết</span>}
            </Link>
          )
        })}
      </div>
      <footer className="history-calendar__footer">
        {!data ? 'Chưa có dữ liệu lịch' : data.matched_import_count === null
          ? 'Chưa có tổng số lần nhập trong tháng'
          : `${data.matched_import_count} lần nhập trong tháng`}
        {data && <span>Ngày tải lên · {data.timezone}</span>}
      </footer>
    </section>
  )
}
