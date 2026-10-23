'use client'

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { Lock, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { formatAura, formatRemaining } from '@/lib/aura-data'
import { cn } from '@/lib/utils'

type Props = {
  remaining: number
  netAura: number
  ready: boolean
}

export function AuraBadge({ remaining, netAura, ready }: Props) {
  const unlocked = remaining <= 0

  return (
    <div aria-live="polite" className="h-9">
      <AnimatePresence mode="wait" initial={false}>
        {unlocked ? (
          <motion.div
            key="revealed"
            initial={{ scale: 0.6, opacity: 0, filter: 'blur(6px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className={cn(
              'glass inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-mono text-sm font-bold',
              netAura >= 0
                ? 'text-aura-pos shadow-[0_0_24px_-6px_var(--aura-pos)]'
                : 'text-aura-neg shadow-[0_0_24px_-6px_var(--aura-neg)]',
            )}
          >
            <Zap className="size-4" fill="currentColor" aria-hidden="true" />
            <CountUp value={netAura} />
            <span className="font-sans font-semibold">Aura</span>
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            exit={{ scale: 1.15, opacity: 0, filter: 'blur(6px)' }}
            className="glass inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-foreground"
          >
            <motion.span
              animate={remaining < 15_000 ? { rotate: [0, -12, 12, -8, 8, 0] } : undefined}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.4 }}
              className="inline-flex"
            >
              <Lock className="size-3.5 text-aura-accent" aria-hidden="true" />
            </motion.span>
            <span>Aura unlocks in</span>
            <span className="font-mono font-bold tabular-nums">{ready ? formatRemaining(remaining) : '--'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatAura(Math.round(v)))

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: 'easeOut' })
    return () => controls.stop()
  }, [mv, value])

  return <motion.span className="tabular-nums">{text}</motion.span>
}
