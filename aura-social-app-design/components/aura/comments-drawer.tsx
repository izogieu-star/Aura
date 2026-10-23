'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { Comment, Post } from '@/lib/aura-data'
import { ME } from '@/lib/aura-data'

type Props = {
  post: Post | null
  onClose: () => void
  onAdd: (postId: string, comment: Comment) => void
}

export function CommentsDrawer({ post, onClose, onAdd }: Props) {
  const [text, setText] = useState('')

  function submit() {
    const value = text.trim()
    if (!post || !value) return
    onAdd(post.id, {
      id: `c-${Date.now()}`,
      username: ME.username,
      avatar: ME.avatar,
      text: value,
      ago: 'now',
    })
    setText('')
  }

  return (
    <AnimatePresence>
      {post && (
        <>
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.section
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
            className="absolute inset-x-0 bottom-0 z-50 flex max-h-[70%] flex-col rounded-t-3xl border-t border-white/10 bg-card"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
            <header className="flex items-center justify-between px-5 pb-3 pt-3">
              <h2 className="text-sm font-bold">{post.comments.length} comments</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close comments"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            <ul className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-4">
              {post.comments.length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to judge the aura.
                </li>
              )}
              {post.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
                    <Image src={c.avatar || '/placeholder.svg'} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">
                      @{c.username} <span className="font-normal">· {c.ago}</span>
                    </p>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="flex items-center gap-2 border-t border-white/5 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3"
            >
              <label htmlFor="comment-input" className="sr-only">
                Add a comment
              </label>
              <input
                id="comment-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
                }}
                maxLength={200}
                placeholder="Add a comment..."
                className="h-11 flex-1 rounded-full bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-aura-accent"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Post comment"
                className="flex size-11 items-center justify-center rounded-full bg-aura-accent text-white transition-opacity disabled:opacity-40"
              >
                <ArrowUp className="size-5" aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}
