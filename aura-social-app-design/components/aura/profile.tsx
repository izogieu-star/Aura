'use client'

import { motion } from 'framer-motion'
import { Grid3x3, Lock, Settings, Zap } from 'lucide-react'
import Image from 'next/image'
import { formatAura, formatCompact, formatRemaining, type Creator, type ProfilePost } from '@/lib/aura-data'
import { remainingMs, type Clock } from '@/lib/use-clock'
import { cn } from '@/lib/utils'

type Props = {
  posts: ProfilePost[]
  clock: Clock
  creator?: Creator
}

export function Profile({ posts, clock, creator }: Props) {
  const me = creator ?? { username: 'kaito.hk', name: 'Kaito Wong', avatar: '/avatars/me.png' }
  const total = posts.reduce((sum, p) => (remainingMs(clock, p.unlockOffsetMs) <= 0 ? sum + p.netAura : sum), 0)

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <header className="flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),1rem)]">
        <h1 className="text-lg font-bold">@{me.username}</h1>
        <button
          type="button"
          aria-label="Settings"
          className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col items-center gap-3 px-4 pt-2">
        <div className="rounded-full bg-gradient-to-br from-aura-pos via-aura-accent to-aura-neg p-[3px] shadow-[0_0_40px_-8px_var(--aura-accent)]">
          <div className="relative size-24 overflow-hidden rounded-full border-4 border-background">
            <Image src={me.avatar || '/placeholder.svg'} alt={me.name} fill sizes="96px" className="object-cover" priority />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-black">{me.name}</p>
          <p className="text-sm text-muted-foreground">Central, Hong Kong · chasing good aura only</p>
        </div>

        <dl className="grid w-full grid-cols-3 text-center">
          <Stat label="Posts" value={posts.length.toString()} />
          <Stat label="Followers" value={formatCompact(18420)} />
          <Stat label="Following" value="312" />
        </dl>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-aura-pos/90 via-aura-accent to-aura-accent/80 p-[1px]"
        >
          <div className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3.5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Zap className="size-6 fill-aura-pos text-aura-pos drop-shadow-[0_0_8px_var(--aura-pos)]" aria-hidden="true" />
              <div>
                <p className="font-mono text-2xl font-black tabular-nums text-aura-pos">{formatAura(total)}</p>
                <p className="text-xs font-medium text-muted-foreground">Net Aura</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold">#6</p>
              <p className="text-xs font-medium text-muted-foreground">in Hong Kong</p>
            </div>
          </div>
        </motion.div>

        <div className="flex w-full gap-2">
          <button
            type="button"
            className="h-10 flex-1 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80"
          >
            Edit profile
          </button>
          <button
            type="button"
            className="h-10 flex-1 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80"
          >
            Share profile
          </button>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-center gap-2 border-b border-white/5 pb-2.5 text-sm font-semibold">
        <Grid3x3 className="size-4" aria-hidden="true" />
        Posts
      </div>

      <ul className="grid grid-cols-3 gap-0.5 pb-4" aria-label="Your posts">
        {posts.map((post) => (
          <GridItem key={post.id} post={post} clock={clock} />
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-lg font-bold">{value}</dd>
    </div>
  )
}

function GridItem({ post, clock }: { post: ProfilePost; clock: Clock }) {
  const remaining = remainingMs(clock, post.unlockOffsetMs)
  const locked = remaining > 0
  const positive = post.netAura >= 0

  return (
    <li className="relative aspect-[3/4] overflow-hidden bg-card">
      {post.media.startsWith('blob:') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.media || '/placeholder.svg'} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Image src={post.media || '/placeholder.svg'} alt="" fill sizes="150px" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span
        className={cn(
          'glass absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold',
          locked ? 'text-white' : positive ? 'text-aura-pos' : 'text-aura-neg',
        )}
      >
        {locked ? (
          <>
            <Lock className="size-3 text-aura-accent" aria-hidden="true" />
            {clock ? formatRemaining(remaining) : '--'}
          </>
        ) : (
          <>
            <Zap className="size-3" fill="currentColor" aria-hidden="true" />
            {formatAura(post.netAura)}
          </>
        )}
      </span>
    </li>
  )
}
