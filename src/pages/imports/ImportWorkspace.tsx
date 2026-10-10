import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Outlet } from 'react-router'

export type ImportSelection = {
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
  dataDate: string
  setDataDate: Dispatch<SetStateAction<string>>
}

// Keep local selections when opening History; leaving this workspace or refreshing clears them.
export function ImportWorkspace() {
  const [files, setFiles] = useState<File[]>([])
  const [dataDate, setDataDate] = useState('')

  return <Outlet context={{ files, setFiles, dataDate, setDataDate } satisfies ImportSelection} />
}
