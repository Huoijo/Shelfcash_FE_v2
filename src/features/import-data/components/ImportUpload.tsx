import { useId, useRef, useState, type DragEvent } from 'react'
import {
  formatImportFileSize,
  importFileAccept,
  importFileLimits,
  validateImportFiles,
} from '../importData.files'
import './ImportUpload.css'

interface ImportUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  uncertainFiles?: boolean
}

export function ImportUpload({ files, onFilesChange, disabled = false, uncertainFiles = false }: ImportUploadProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLButtonElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  function addFiles(incoming: File[]) {
    if (disabled) return
    if (!incoming.length) return
    const next = [...files, ...incoming]
    const validationError = validateImportFiles(next)
    setError(validationError)
    if (validationError) {
      setNotice('')
      return
    }
    onFilesChange(next)
    setNotice(`Đã chọn thêm ${incoming.length} file trên thiết bị.`)
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))
    setError(null)
    setNotice('Đã bỏ file khỏi danh sách chọn.')
    pickerRef.current?.focus()
  }

  function onDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!Array.from(event.dataTransfer.types).includes('Files')) return
    dragDepth.current += 1
    setDragging(true)
  }

  function onDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    addFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <section className="import-upload" aria-label="Chọn file dữ liệu">
      <button
        ref={pickerRef}
        type="button"
        disabled={disabled}
        className={`import-upload__dropzone${dragging ? ' import-upload__dropzone--active' : ''}`}
        aria-label="Kéo thả file ở đây hoặc chọn file từ thiết bị"
        aria-controls={`${id}-picker`}
        aria-describedby={`${id}-limits ${id}-local`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onDrop={onDrop}
      >
        <span className="import-upload__title">Kéo thả file ở đây</span>
        <span className="import-upload__hint">{dragging ? 'Thả file để thêm vào danh sách' : 'hoặc chọn file từ thiết bị'}</span>
      </button>
      <input
        id={`${id}-picker`}
        ref={inputRef}
        type="file"
        accept={importFileAccept}
        multiple
        disabled={disabled}
        hidden
        aria-label="Chọn file dữ liệu"
        aria-describedby={`${id}-limits ${id}-local`}
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []))
          event.currentTarget.value = ''
        }}
      />

      <p id={`${id}-limits`} className="import-upload__limits">
        Phần mở rộng .csv hoặc .xlsx · Tối đa {importFileLimits.count} file/lô · {formatImportFileSize(importFileLimits.perFileBytes)}/file · {formatImportFileSize(importFileLimits.totalBytes)} tổng dung lượng trước giải nén/lô
      </p>
      <p id={`${id}-local`} className="import-upload__local">{uncertainFiles ? 'Các file có thể đã được máy chủ nhận. Giữ nguyên yêu cầu và dùng nút thử lại để xác định kết quả.' : 'Kiểm tra sơ bộ danh sách chưa tải. Máy chủ quyết định nhận từng file và hạn mức của toàn lô.'}</p>
      {error && <p className="import-upload__error" role="alert">Không thêm file. {error}</p>}
      <p className="import-upload__notice" role="status">{notice}</p>

      <section className="import-upload__files" aria-labelledby={`${id}-files-title`}>
        <div className="import-upload__files-heading">
          <h2 id={`${id}-files-title`}>{uncertainFiles ? 'File chờ xác định kết quả' : 'File chưa tải'} <span>({files.length})</span></h2>
          {files.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              className="import-upload__clear"
              onClick={() => {
                onFilesChange([])
                setError(null)
                setNotice('Đã bỏ tất cả file khỏi danh sách chọn.')
                pickerRef.current?.focus()
              }}
            >
              Bỏ tất cả
            </button>
          )}
        </div>
        {files.length === 0 ? (
          <p className="import-upload__empty">Chưa có file nào được chọn.</p>
        ) : (
          <ul className="import-upload__file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`}>
                <span className="import-upload__file-icon" aria-hidden="true">▤</span>
                <div className="import-upload__file-info">
                  <p className="import-upload__filename">{file.name}</p>
                  <p className="import-upload__file-size">{formatImportFileSize(file.size)} · {uncertainFiles ? 'Chưa xác định kết quả' : 'Chỉ trên thiết bị'}</p>
                </div>
                <button type="button" disabled={disabled} className="import-upload__remove" aria-label={`Bỏ file ${file.name}`} onClick={() => removeFile(index)}>
                  Bỏ
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
