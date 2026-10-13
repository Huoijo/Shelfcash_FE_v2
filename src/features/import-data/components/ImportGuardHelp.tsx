/** Explain server guards without resolving source identity or changing atomic scope. */
export function ImportGuardHelp({codes}:{codes:string[]}) {
  return <>
    {codes.some(code=>['SOURCE_CONTEXT_REQUIRED','SOURCE_CONTEXT_CONFLICT'].includes(code))&&<p className="import-flow__notice">Quay lại ghép dữ liệu để xác nhận nguồn, loại báo cáo và bằng chứng của lần nhập này. Không dùng tên file hoặc header giống nhau làm bằng chứng nguồn.</p>}
    {codes.includes('RECIPE_SOURCE_SCOPE_AMBIGUOUS')&&<p className="import-flow__notice">Công thức cùng món và phiên bản xuất hiện ở nhiều file/Sheet. Hiện chưa hỗ trợ ghép các phần qua nhiều file/Sheet; hãy đối chiếu nguồn và chuẩn bị một bản công thức đầy đủ trong một Sheet. Lỗi chặn toàn lô; hệ thống không tự gộp hoặc chọn file cuối.</p>}
  </>
}
