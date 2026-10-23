'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { INITIAL_POSTS, ME, MY_POSTS, type Comment, type Post, type ProfilePost, type Vote } from '@/lib/aura-data'
import { remainingMs, useClock } from '@/lib/use-clock'
import { BottomNav, type Tab } from './bottom-nav'
import { CommentsDrawer } from './comments-drawer'
import { CreatePostModal, type NewPost } from './create-post-modal'
import { FeedPost } from './feed-post'
import { Leaderboard } from './leaderboard'
import { Profile } from './profile'
import { ShareSheet } from './share-sheet'

const DAY = 86_400_000

export function AppShell() {
  const clock = useClock()
  const [tab, setTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [myPosts, setMyPosts] = useState<ProfilePost[]>(MY_POSTS)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const [shareFor, setShareFor] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  const commentsPost = posts.find((p) => p.id === commentsFor) ?? null
  const sharePost = posts.find((p) => p.id === shareFor) ?? null

  function vote(postId: string, v: Vote) {
    if (votes[postId]) return
    setVotes((prev) => ({ ...prev, [postId]: v }))
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, netAura: p.netAura + (v === 'up' ? 1 : -1) } : p)))
  }

  function addComment(postId: string, comment: Comment) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p)))
  }

  function createPost(input: NewPost) {
    const elapsed = clock ? clock.now - clock.start : 0
    const id = `new-${Date.now()}`
    const unlockOffsetMs = elapsed + DAY
    setPosts((prev) => [
      {
        id,
        creator: ME,
        media: input.media,
        mediaType: input.mediaType,
        caption: input.caption || 'New drop. Judge my aura.',
        location: input.location,
        unlockOffsetMs,
        netAura: 0,
        comments: [],
      },
      ...prev,
    ])
    setMyPosts((prev) => [{ id, media: input.media, unlockOffsetMs, netAura: 0 }, ...prev])
    setCreateOpen(false)
    setTab('feed')
    requestAnimationFrame(() => feedRef.current?.scrollTo({ top: 0 }))
  }

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
      <main className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'feed' && (
              <div ref={feedRef} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
                {posts.map((post, i) => (
                  <FeedPost
                    key={post.id}
                    post={post}
                    clock={clock}
                    vote={votes[post.id]}
                    following={!!following[post.creator.username]}
                    priority={i === 0}
                    onVote={(v) => vote(post.id, v)}
                    onFollow={() =>
                      setFollowing((prev) => ({ ...prev, [post.creator.username]: !prev[post.creator.username] }))
                    }
                    onComments={() => setCommentsFor(post.id)}
                    onShare={() => setShareFor(post.id)}
                  />
                ))}
              </div>
            )}
            {tab === 'leaderboard' && <Leaderboard />}
            {tab === 'profile' && <Profile posts={myPosts} clock={clock} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav tab={tab} onTabChange={setTab} onCreate={() => setCreateOpen(true)} />

      <CommentsDrawer post={commentsPost} onClose={() => setCommentsFor(null)} onAdd={addComment} />
      <ShareSheet
        post={sharePost}
        remaining={sharePost ? remainingMs(clock, sharePost.unlockOffsetMs) : 0}
        onClose={() => setShareFor(null)}
      />
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createPost} />
    </div>
  )
}
