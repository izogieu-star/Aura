'use client'

import { useEffect, useState } from 'react'

export type Clock = { start: number; now: number } | null

/** Ticking clock that only starts on the client, avoiding hydration mismatches. */
export function useClock(intervalMs = 1000): Clock {
  const [clock, setClock] = useState<Clock>(null)

  useEffect(() => {
    const start = Date.now()
    setClock({ start, now: start })
    const id = setInterval(() => setClock({ start, now: Date.now() }), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return clock
}

export function remainingMs(clock: Clock, unlockOffsetMs: number) {
  if (unlockOffsetMs <= 0) return 0
  if (!clock) return unlockOffsetMs
  return clock.start + unlockOffsetMs - clock.now
}
