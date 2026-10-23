'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, Lock, Share2, X, Zap } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { Post } from '@/lib/aura-data'
import { formatAura, formatRemaining } from '@/lib/aura-data'
import { cn } from '@/lib/utils'

type Props = {
  post: Post | null
  remaining: number
  onClose: () => void
}

export function ShareSheet({ post, remaining, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function share() {
    if (!post) return
    const url = `${window.location.origin}/?post=${post.id}`
    const data = { title: 'Rate my Aura', text: `Judge @${post.creator.username}'s aura on Aura`, url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
    } catch {
      return
    }
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const unlocked = remaining <= 0
  const positive = (post?.netAura ?? 0) >= 0

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/80 px-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Share to story"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share"
            className="glass absolute right-4 top-4 rounded-full p-2 text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <motion.div
            initial={{ scale: 0.85, y: 30, rotate: -3 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-3xl bg-gradient-to-br from-aura-accent via-fuchsia-600 to-aura-neg p-[3px] shadow-[0_0_60px_-10px_var(--aura-accent)]"
          >
            <div className="relative size-full overflow-hidden rounded-[22px] bg-background">
              <Image
                src={post.media || '/placeholder.svg'}
                alt=""
                fill
                sizes="260px"
                className="object-cover"
                unoptimized={post.media.startsWith('blob:')}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="text-lg font-black text-white">
                  aura<span className="text-aura-accent">.</span>
                </span>
                <span className="glass rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">
                  {post.location}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Rate my aura</p>
                {unlocked ? (
                  <p
                    className={cn(
                      'flex items-center gap-1 font-mono text-3xl font-black',
                      positive ? 'text-aura-pos' : 'text-aura-neg',
                    )}
                  >
                    <Zap className="size-6" fill="currentColor" aria-hidden="true" />
                    {formatAura(post.netAura)}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 font-mono text-xl font-bold text-white">
                    <Lock className="size-4 text-aura-accent" aria-hidden="true" />
                    {formatRemaining(remaining)}
                  </p>
                )}
                <p className="text-sm font-bold text-white">@{post.creator.username}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex w-full max-w-[260px] gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={share}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-background"
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Share2 className="size-4" aria-hidden="true" />
              )}
              {copied ? 'Link copied' : 'Share to Story'}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={share}
              aria-label="Copy link"
              className="glass flex size-12 items-center justify-center rounded-full text-white"
            >
              <Link2 className="size-5" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
