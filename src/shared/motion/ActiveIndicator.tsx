import { motion, useReducedMotion } from 'motion/react'
import { uiTransition } from './motion'
import './Motion.css'

export function ActiveIndicator({ id, underline = false }: { id: string; underline?: boolean }) {
  const reducedMotion = useReducedMotion()
  return <motion.span aria-hidden="true" className={underline ? 'motion-underline' : 'motion-indicator'}
    layoutId={reducedMotion ? undefined : id} initial={false}
    transition={reducedMotion ? { duration: 0 } : uiTransition} />
}
