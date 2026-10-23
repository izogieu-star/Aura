'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { INITIAL_POSTS, ME, type Comment, type Post, type ProfilePost, type Vote } from '@/lib/aura-data'
import { castVote, createPostRecord, fetchActivePosts, fetchUserPosts, fetchUserVote, uiPostFromNewPost, uploadMedia, profilePostFromDb } from '@/lib/aura-supabase'
import { remainingMs, useClock } from '@/lib/use-clock'
import { BottomNav, type Tab } from './bottom-nav'
import { CommentsDrawer } from './comments-drawer'
import { CreatePostModal, type NewPost } from './create-post-modal'
import { FeedPost } from './feed-post'
import { Leaderboard } from './leaderboard'
import { Profile } from './profile'
import { ShareSheet } from './share-sheet'

export function AppShell() {
  const clock = useClock()
  const { user, profile, isGuest } = useAuth()
  const [tab, setTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [myPosts, setMyPosts] = useState<ProfilePost[]>([])
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const [shareFor, setShareFor] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  const appStart = clock?.start ?? Date.now()

  const loadFeed = useCallback(async (start: number) => {
    try {
      const dbPosts = await fetchActivePosts(start)
      setPosts(dbPosts.length > 0 ? dbPosts : INITIAL_POSTS)
    } catch {
      setPosts(INITIAL_POSTS)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyPosts = useCallback(async (userId: string, start: number) => {
    try {
      const dbPosts = await fetchUserPosts(userId, start)
      setMyPosts(dbPosts)
    } catch {
      setMyPosts([])
    }
  }, [])

  useEffect(() => {
    if (!clock) return
    loadFeed(clock.start)
  }, [clock, loadFeed])

  useEffect(() => {
    if (user) {
      loadMyPosts(user.id, clock?.start ?? Date.now())
    }
  }, [user, clock, loadMyPosts])

  // Load existing votes for the current user
  useEffect(() => {
    if (!user || posts.length === 0) return
    Promise.all(
      posts.map((p) => fetchUserVote(p.id, user.id))
    ).then((results) => {
      const voteMap: Record<string, Vote> = {}
      posts.forEach((p, i) => {
        if (results[i]) voteMap[p.id] = results[i] as Vote
      })
      setVotes(voteMap)
    })
  }, [user, posts])

  const commentsPost = posts.find((p) => p.id === commentsFor) ?? null
  const sharePost = posts.find((p) => p.id === shareFor) ?? null

  async function vote(postId: string, v: Vote) {
    if (votes[postId]) return
    if (!user) return

    // Optimistic UI update
    setVotes((prev) => ({ ...prev, [postId]: v }))
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, netAura: p.netAura + (v === 'up' ? 1 : -1) } : p)))

    try {
      await castVote(postId, v, user.id)
    } catch {
      // Revert on failure
      setVotes((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, netAura: p.netAura - (v === 'up' ? 1 : -1) } : p)))
    }
  }

  function addComment(postId: string, comment: Comment) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p)))
  }

  async function createPost(input: NewPost) {
    if (!user || !profile) throw new Error('Not authenticated')

    const { path, mediaType } = await uploadMedia(user.id, input.file)
    const dbPost = await createPostRecord({
      userId: user.id,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      storagePath: path,
      mediaType,
      caption: input.caption || 'New drop. Judge my aura.',
      location: input.location,
    })

    const start = clock?.start ?? Date.now()
    const newPost = uiPostFromNewPost(dbPost, start)
    setPosts((prev) => [newPost, ...prev])
    setMyPosts((prev) => [profilePostFromDb(dbPost, start), ...prev])
    setCreateOpen(false)
    setTab('feed')
    requestAnimationFrame(() => feedRef.current?.scrollTo({ top: 0 }))
  }

  const myCreator = profile
    ? { username: profile.username, name: profile.display_name, avatar: profile.avatar_url || '/avatars/me.png' }
    : ME

  if (loading) {
    return (
      <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-aura-accent" />
          <p className="text-sm text-muted-foreground">Loading the feed…</p>
        </motion.div>
      </div>
    )
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
                {posts.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                    <p className="text-lg font-bold">No posts yet</p>
                    <p className="text-sm text-muted-foreground">Be the first to drop an aura post.</p>
                  </div>
                )}
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
            {tab === 'profile' && <Profile posts={myPosts} clock={clock} creator={myCreator} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav
        tab={tab}
        onTabChange={setTab}
        onCreate={() => {
          if (isGuest) {
            setError('Sign up to create posts')
          } else {
            setCreateOpen(true)
          }
        }}
      />

      <CommentsDrawer post={commentsPost} onClose={() => setCommentsFor(null)} onAdd={addComment} myCreator={myCreator} />
      <ShareSheet
        post={sharePost}
        remaining={sharePost ? remainingMs(clock, sharePost.unlockOffsetMs) : 0}
        onClose={() => setShareFor(null)}
      />
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createPost} />

      {error && (
        <div className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-full px-4 py-2 text-sm text-white"
          >
            {error}
          </motion.div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-aura-neg text-xs text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
