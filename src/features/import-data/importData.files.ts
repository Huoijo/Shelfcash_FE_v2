// Preliminary checks on the prospective local selection (existing + incoming).
// Contract §6: 20 files/batch, 20 MiB/file, 100 MiB total compressed bytes/batch.
// File.size counts stored bytes, not expanded XLSX; I02 must validate contents and the real batch.
export const importFileLimits = {
  count: 20,
  perFileBytes: 20 * 1024 ** 2,
  totalBytes: 100 * 1024 ** 2,
} as const

export const importFileAccept = '.csv,.xlsx'

export function validateImportFiles(files: readonly File[]): string | null {
  if (files.length > importFileLimits.count) {
    return `Chỉ chọn tối đa ${importFileLimits.count} file. Hãy bỏ bớt file rồi chọn lại.`
  }

  for (const file of files) {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      return `Chỉ chấp nhận tệp có phần mở rộng .csv hoặc .xlsx. Tệp “${file.name}” không có phần mở rộng phù hợp.`
    }
    if (file.size > importFileLimits.perFileBytes) {
      return `“${file.name}” vượt quá ${formatImportFileSize(importFileLimits.perFileBytes)}. Hãy chọn file nhỏ hơn hoặc chia file trước khi chọn lại.`
    }
  }

  if (files.reduce((total, file) => total + file.size, 0) > importFileLimits.totalBytes) {
    return `Tổng dung lượng vượt quá ${formatImportFileSize(importFileLimits.totalBytes)}. Hãy bỏ bớt file hoặc chọn file nhỏ hơn.`
  }

  return null
}

export function formatImportFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const divisor = bytes < 1024 ** 2 ? 1024 : 1024 ** 2
  const unit = divisor === 1024 ? 'KiB' : 'MiB'
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(bytes / divisor)} ${unit}`
}
