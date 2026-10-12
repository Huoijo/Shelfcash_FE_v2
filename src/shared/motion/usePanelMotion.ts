import { useCallback, useEffect, useRef } from 'react'
import { useAnimate, useReducedMotion } from 'motion/react'
import { panelTransition } from './motion'

// Only explicit Close/Escape waits for the visual exit. Scope changes and
// invalidated reads still unmount immediately and cancel pending callbacks.
export function usePanelMotion<T extends HTMLElement>(visible = true) {
  const scope = useRef<T>(null)
  const [, animate] = useAnimate<T>()
  const reducedMotion = useReducedMotion()
  const generation = useRef(0)
  const closing = useRef(false)
  const animation = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    generation.current += 1
    closing.current = false
    const element = scope.current
    if (visible && element) {
      element.inert = false
      element.removeAttribute('data-motion-closing')
      animation.current = animate(element, {
        opacity: reducedMotion ? 1 : [0, 1],
        transform: reducedMotion ? 'none' : ['translateX(20px)', 'translateX(0px)'],
      }, { ...panelTransition, duration: reducedMotion ? 0 : panelTransition.duration })
    }
    return () => {
      generation.current += 1
      animation.current?.stop()
      if (element) element.inert = false
    }
  }, [visible, reducedMotion, animate, scope])

  const close = useCallback((onClosed: () => void) => {
    if (closing.current) return
    const element = scope.current
    if (!element || reducedMotion) { onClosed(); return }
    closing.current = true
    element.inert = true
    element.setAttribute('data-motion-closing', '')
    animation.current?.stop()
    const current = generation.current
    animation.current = animate(element, { opacity: 0, transform: 'translateX(20px)' }, { ...panelTransition, duration: 0.16 })
    void animation.current.then(() => { if (generation.current === current) onClosed() })
  }, [animate, scope, reducedMotion])

  return { scope, close }
}
