'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ME, formatAura, formatCompact, getLeaderboard, type Ranked, type Scope, type Timeframe } from '@/lib/aura-data'
import { cn } from '@/lib/utils'

const scopes: { id: Scope; label: string }[] = [
  { id: 'friends', label: 'Friends' },
  { id: 'hk', label: 'Hong Kong' },
  { id: 'global', label: 'Global' },
]

const timeframes: { id: Timeframe; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
]

export function Leaderboard() {
  const [scope, setScope] = useState<Scope>('hk')
  const [timeframe, setTimeframe] = useState<Timeframe>('week')
  const board = useMemo(() => getLeaderboard(scope, timeframe), [scope, timeframe])
  const [first, second, third] = board
  const rest = board.slice(3)
  const key = `${scope}-${timeframe}`

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <header className="sticky top-0 z-10 space-y-3 bg-background/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Trophy className="size-6 text-amber-300" aria-hidden="true" />
          <h1 className="text-2xl font-black tracking-tight">Aura Standings</h1>
        </div>
        <PillGroup label="Scope" options={scopes} value={scope} onChange={setScope} layoutId="scope-pill" />
        <PillGroup
          label="Timeframe"
          options={timeframes}
          value={timeframe}
          onChange={setTimeframe}
          layoutId="time-pill"
          small
        />
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="px-4 pb-6"
        >
          <section aria-label="Top three" className="grid grid-cols-3 items-end gap-2.5 pt-6">
            <PodiumCard entry={second} place={2} />
            <PodiumCard entry={first} place={1} />
            <PodiumCard entry={third} place={3} />
          </section>

          <ol className="mt-6 space-y-2" aria-label="Rankings 4 and below">
            {rest.map((entry, i) => (
              <motion.li
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.025 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-white/5 bg-card px-3 py-2.5',
                  entry.username === ME.username && 'border-aura-accent/60 bg-aura-accent/10',
                )}
              >
                <span className="w-8 text-center font-mono text-sm font-bold text-muted-foreground">{entry.rank}</span>
                <Avatar entry={entry} size={40} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  @{entry.username}
                  {entry.username === ME.username && (
                    <span className="ml-1.5 rounded-full bg-aura-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                      YOU
                    </span>
                  )}
                </span>
                <AuraScore value={entry.netAura} />
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  layoutId,
  small,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  layoutId: string
  small?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-card p-1">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'relative flex-1 rounded-full font-semibold transition-colors',
              small ? 'py-1.5 text-xs' : 'py-2 text-sm',
              active ? 'text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={cn(
                  'absolute inset-0 rounded-full',
                  small ? 'bg-white/10' : 'bg-aura-accent shadow-[0_0_20px_-4px_var(--aura-accent)]',
                )}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const podium = {
  1: { ring: 'from-amber-200 via-yellow-400 to-amber-600', glow: 'shadow-[0_0_40px_-8px_#fbbf24]', h: 'pt-10 pb-4' },
  2: { ring: 'from-slate-100 via-slate-300 to-slate-500', glow: 'shadow-[0_0_30px_-10px_#cbd5e1]', h: 'pt-6 pb-4' },
  3: { ring: 'from-orange-300 via-amber-700 to-orange-900', glow: 'shadow-[0_0_30px_-10px_#c2410c]', h: 'pt-4 pb-4' },
} as const

function PodiumCard({ entry, place }: { entry?: Ranked; place: 1 | 2 | 3 }) {
  if (!entry) return <div />
  const style = podium[place]
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: place === 1 ? 0.1 : 0.2 }}
      className={cn('rounded-3xl bg-gradient-to-b p-[2px]', style.ring, style.glow)}
    >
      <div className={cn('relative flex flex-col items-center gap-2 rounded-[22px] bg-card px-2', style.h)}>
        {place === 1 && (
          <Crown
            className="absolute -top-4 size-7 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_#fbbf24]"
            aria-hidden="true"
          />
        )}
        <div className={cn('rounded-full bg-gradient-to-b p-[2px]', style.ring)}>
          <Avatar entry={entry} size={place === 1 ? 64 : 52} />
        </div>
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full bg-gradient-to-b font-mono text-xs font-black text-background',
            style.ring,
          )}
        >
          {place}
        </span>
        <p className="w-full truncate text-center text-xs font-semibold">@{entry.username}</p>
        <p className="font-mono text-sm font-black text-aura-pos drop-shadow-[0_0_8px_var(--aura-pos)]">
          +{formatCompact(entry.netAura)}
        </p>
      </div>
    </motion.div>
  )
}

const gradients = [
  'from-aura-accent to-fuchsia-500',
  'from-aura-pos to-teal-600',
  'from-aura-neg to-orange-500',
  'from-sky-500 to-aura-accent',
  'from-amber-400 to-aura-neg',
]

function Avatar({ entry, size }: { entry: Ranked; size: number }) {
  if (entry.avatar) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
        <Image src={entry.avatar || '/placeholder.svg'} alt="" fill sizes={`${size}px`} className="object-cover" />
      </div>
    )
  }
  const g = gradients[entry.username.length % gradients.length]
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold uppercase text-white',
        g,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {entry.username.slice(0, 2)}
    </div>
  )
}

function AuraScore({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        'font-mono text-sm font-bold tabular-nums',
        positive
          ? 'text-aura-pos drop-shadow-[0_0_6px_var(--aura-pos)]'
          : 'text-aura-neg drop-shadow-[0_0_6px_var(--aura-neg)]',
      )}
    >
      {formatAura(value)}
    </span>
  )
}
