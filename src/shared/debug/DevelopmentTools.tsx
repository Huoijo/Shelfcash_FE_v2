import { useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { config } from '../../app/config'
import { MockScenarioPicker } from '../../features/mock/MockScenarioPicker'
import { ImportPlaygroundControls } from './ImportPlaygroundControls'
import { DebugVisibility } from './debugVisibility.context'
import './DevelopmentTools.css'

let host: HTMLDivElement | null = null
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const snapshot = () => host
const serverSnapshot = () => null

function setHost(value: HTMLDivElement | null) {
  if (host === value) return
  host = value
  listeners.forEach(listener => listener())
}

/** No wrapper or placeholder in the product tree. Portals retain their original context/handlers. */
export function DebugContent({ children }: { children: ReactNode }) {
  const visible = useContext(DebugVisibility)
  return import.meta.env.DEV && visible ? <DebugPortal>{children}</DebugPortal> : null
}
function DebugPortal({ children }: { children: ReactNode }) {
  const target = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  return target ? createPortal(<section className="development-section">{children}</section>, target) : null
}
export function DebugValue({ label, value }: { label: string; value: unknown }) {
  if (!import.meta.env.DEV) return null
  return <DebugContent><details><summary>{label}</summary><pre>{JSON.stringify(value, null, 2)}</pre></details></DebugContent>
}

export function DevelopmentTools() {
  return import.meta.env.DEV ? <DevelopmentDrawer /> : null
}
function DevelopmentDrawer() {
  const [open, setOpen] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(() => typeof document === 'undefined' ? null : document.body)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  useEffect(() => {
    const update = () => {
      const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog[open]')
      setContainer(dialogs[dialogs.length - 1] ?? document.body)
    }
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] })
    update()
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!open) return
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true})
    return () => { if (origin?.isConnected) origin.focus({preventScroll:true}) }
  }, [open, container])
  useEffect(() => {
    if (!open) return
    // DebugContent uses portals from the product tree; React bubbling alone
    // cannot catch their keys. Capture native events across the complete drawer.
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false) }
      if (event.key === 'Tab') {
        const focusable = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select, input, textarea, summary, a[href], [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0)
        const first = focusable[0], last = focusable.at(-1)
        if (!ref.current?.contains(document.activeElement) || event.shiftKey && document.activeElement === first) { event.preventDefault(); (event.shiftKey ? last : first)?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keydown, true)
    return () => document.removeEventListener('keydown', keydown, true)
  }, [open])
  if (!container) return null
  return createPortal(<>
    <button className={`development-trigger${container.tagName === 'DIALOG' ? ' development-trigger-modal' : ''}`} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="development-tools" onClick={() => setOpen(true)}>Debug</button>
    {open && <><div className="development-backdrop" onClick={() => setOpen(false)} /><div id="development-tools" ref={ref} className="development-drawer" role="dialog" aria-modal="true" aria-labelledby="development-title">
      <header><div><h2 id="development-title">{location.pathname === '/imports' ? 'UI State Preview' : 'Debug'}</h2><small>Development only</small></div><button type="button" aria-label="Đóng Debug" onClick={() => setOpen(false)}>×</button></header>
      <div className="development-body">
        {location.pathname === '/imports' && <ImportPlaygroundControls />}
        <details className="development-diagnostics"><summary>Advanced diagnostics</summary>
          <p>{config.dataSource === 'mock' ? 'Mock — không phân tích file hoặc ghi dữ liệu thật' : 'API — kết nối HTTP theo cấu hình hiện hành'}</p><p>Route: {location.pathname}</p>
          <MockScenarioPicker />
          <div ref={setHost} />
        </details>
      </div>
    </div></>}
  </>, container)
}
