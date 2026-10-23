'use client'

import { motion } from 'framer-motion'
import { Home, Plus, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'feed' | 'leaderboard' | 'profile'

type Props = {
  tab: Tab
  onTabChange: (tab: Tab) => void
  onCreate: () => void
}

const items = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'create', label: 'Create', icon: Plus },
  { id: 'profile', label: 'Profile', icon: User },
] as const

export function BottomNav({ tab, onTabChange, onCreate }: Props) {
  return (
    <nav
      aria-label="Primary"
      className="relative z-30 border-t border-white/5 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          if (item.id === 'create') {
            return (
              <li key={item.id}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={onCreate}
                  aria-label="Create post"
                  className="flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-aura-accent via-fuchsia-500 to-aura-neg text-white shadow-[0_0_24px_-4px_var(--aura-accent)]"
                >
                  <Icon className="size-6" strokeWidth={2.5} aria-hidden="true" />
                </motion.button>
              </li>
            )
          }
          const active = tab === item.id
          return (
            <li key={item.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => onTabChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-16 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                <span>{item.label === 'Leaderboard' ? 'Ranks' : item.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -top-2 h-0.5 w-6 rounded-full bg-aura-accent shadow-[0_0_10px_var(--aura-accent)]"
                  />
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
