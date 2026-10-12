import { useEffect, useRef } from 'react'
import { useAnimate, useReducedMotion } from 'motion/react'
import { uiTransition } from './motion'

// Animate the current content in place, preserving form state and focus.
export function useContentReveal<T extends HTMLElement>(changeKey: string) {
  const scope = useRef<T>(null)
  const [, animate] = useAnimate<T>()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (reducedMotion || !scope.current) return
    const element = scope.current
    const animation = animate(element, { opacity: [0.7, 1] }, uiTransition)
    return () => { animation.stop(); element.style.removeProperty('opacity') }
  }, [changeKey, reducedMotion, animate, scope])
  return scope
}
