'use client'

import { motion } from 'framer-motion'
import { Check, MapPin, MessageCircle, Plus, Send } from 'lucide-react'
import Image from 'next/image'
import type { Post, Vote } from '@/lib/aura-data'
import { formatCompact } from '@/lib/aura-data'
import { remainingMs, type Clock } from '@/lib/use-clock'
import { cn } from '@/lib/utils'
import { AuraBadge } from './aura-badge'
import { VoteButton } from './vote-button'

type Props = {
  post: Post
  clock: Clock
  vote?: Vote
  following: boolean
  priority?: boolean
  onVote: (vote: Vote) => void
  onFollow: () => void
  onComments: () => void
  onShare: () => void
}

export function FeedPost({ post, clock, vote, following, priority, onVote, onFollow, onComments, onShare }: Props) {
  const remaining = remainingMs(clock, post.unlockOffsetMs)

  return (
    <article
      aria-label={`Post by @${post.creator.username}`}
      className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-black"
    >
      {post.mediaType === 'video' ? (
        <video src={post.media} className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <Image
          src={post.media || '/placeholder.svg'}
          alt={post.caption}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
          priority={priority}
          unoptimized={post.media.startsWith('blob:')}
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"
      />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)]">
        <span className="text-xl font-black tracking-tight text-white">
          aura<span className="text-aura-accent">.</span>
        </span>
        <div className="glass flex rounded-full p-1 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1 text-white">For You</span>
          <span className="px-3 py-1 text-white/60">Following</span>
        </div>
      </header>

      <div className="absolute bottom-4 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-2">
          <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-white">
            <Image src={post.creator.avatar || '/placeholder.svg'} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={onFollow}
            aria-label={following ? `Unfollow @${post.creator.username}` : `Follow @${post.creator.username}`}
            aria-pressed={following}
            className={cn(
              'absolute -bottom-2.5 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full text-white transition-colors',
              following ? 'bg-white text-aura-accent' : 'bg-aura-accent shadow-[0_0_12px_var(--aura-accent)]',
            )}
          >
            {following ? (
              <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
            ) : (
              <Plus className="size-3" strokeWidth={3.5} aria-hidden="true" />
            )}
          </motion.button>
        </div>

        <VoteButton kind="up" current={vote} onVote={onVote} />
        <VoteButton kind="down" current={vote} onVote={onVote} />

        <ActionButton label="Comments" count={post.comments.length} onClick={onComments}>
          <MessageCircle className="size-6" aria-hidden="true" />
        </ActionButton>
        <ActionButton label="Share to story" text="Share" onClick={onShare}>
          <Send className="size-6" aria-hidden="true" />
        </ActionButton>
      </div>

      <div className="absolute bottom-4 left-4 right-24 flex flex-col gap-2.5 text-white">
        <AuraBadge remaining={remaining} netAura={post.netAura} ready={clock !== null || post.unlockOffsetMs <= 0} />
        <p className="text-base font-bold">@{post.creator.username}</p>
        <p className="text-pretty text-sm leading-relaxed text-white/90">{post.caption}</p>
        <p className="flex items-center gap-1 text-xs font-medium text-white/70">
          <MapPin className="size-3.5" aria-hidden="true" />
          {post.location}, Hong Kong
        </p>
      </div>
    </article>
  )
}

function ActionButton({
  label,
  count,
  text,
  onClick,
  children,
}: {
  label: string
  count?: number
  text?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onClick}
        aria-label={label}
        className="glass flex size-12 items-center justify-center rounded-full text-white"
      >
        {children}
      </motion.button>
      <span className="text-xs font-semibold text-white">{text ?? formatCompact(count ?? 0)}</span>
    </div>
  )
}
