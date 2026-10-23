'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flame, ThumbsDown } from 'lucide-react'
import { useState } from 'react'
import type { Vote } from '@/lib/aura-data'
import { cn } from '@/lib/utils'

type Particle = { id: number; x: number; distance: number; size: number; delay: number; rotate: number }

type Props = {
  kind: Vote
  current?: Vote
  onVote: (vote: Vote) => void
}

let particleId = 0

export function VoteButton({ kind, current, onVote }: Props) {
  const [particles, setParticles] = useState<Particle[]>([])
  const isUp = kind === 'up'
  const locked = current !== undefined
  const selected = current === kind
  const Icon = isUp ? Flame : ThumbsDown

  function handleClick() {
    if (locked) return
    const burst = Array.from({ length: 14 }, () => ({
      id: particleId++,
      x: (Math.random() - 0.5) * 90,
      distance: 70 + Math.random() * 80,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.12,
      rotate: (Math.random() - 0.5) * 120,
    }))
    setParticles(burst)
    onVote(kind)
    setTimeout(() => setParticles([]), 1400)
  }

  return (
    <div className="relative flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={locked && !selected}
        aria-pressed={selected}
        aria-label={isUp ? 'Give +Aura' : 'Give −Aura'}
        whileTap={locked ? undefined : { scale: 0.8 }}
        animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className={cn(
          'glass flex size-14 items-center justify-center rounded-full transition-[opacity,box-shadow,background-color] disabled:opacity-35',
          isUp ? 'text-aura-pos' : 'text-aura-neg',
          selected && isUp && 'bg-aura-pos/25 shadow-[0_0_28px_2px_var(--aura-pos)]',
          selected && !isUp && 'bg-aura-neg/25 shadow-[0_0_28px_2px_var(--aura-neg)]',
          !locked && isUp && 'shadow-[0_0_18px_-4px_var(--aura-pos)]',
          !locked && !isUp && 'shadow-[0_0_18px_-4px_var(--aura-neg)]',
        )}
      >
        <Icon className="size-7" strokeWidth={2.25} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.button>
      <span className={cn('text-xs font-bold', isUp ? 'text-aura-pos' : 'text-aura-neg')}>
        {isUp ? '+Aura' : '−Aura'}
      </span>

      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-7">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className={cn(
                'absolute block rounded-full',
                isUp ? 'bg-aura-pos shadow-[0_0_8px_var(--aura-pos)]' : 'bg-aura-neg shadow-[0_0_8px_var(--aura-neg)]',
                !isUp && 'rounded-[2px]',
              )}
              style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: isUp ? -p.distance : p.distance,
                opacity: 0,
                scale: isUp ? 0.4 : 1.1,
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: isUp ? 1 : 1.1, delay: p.delay, ease: isUp ? 'easeOut' : 'easeIn' }}
            />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {particles.length > 0 && (
            <motion.span
              className={cn(
                'absolute -translate-x-1/2 whitespace-nowrap font-mono text-sm font-bold',
                isUp ? 'text-aura-pos' : 'text-aura-neg',
              )}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: isUp ? -64 : 64, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
            >
              {isUp ? '+1 Aura' : '−1 Aura'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
