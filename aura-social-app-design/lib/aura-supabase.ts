import { supabase, type DbPost } from '@/lib/supabase-client'
import type { Comment, Creator, Post, ProfilePost } from '@/lib/aura-data'

const DAY = 86_400_000

export function mediaUrl(path: string): string {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('/')) return path
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

export function dbPostToUi(db: DbPost, appStartMs: number): Post {
  const unlockMs = new Date(db.unlock_at).getTime() - appStartMs
  return {
    id: db.id,
    creator: {
      username: db.username,
      name: db.display_name,
      avatar: db.avatar_url || '/avatars/me.png',
    },
    media: mediaUrl(db.media_url),
    mediaType: db.media_type,
    caption: db.caption,
    location: db.location,
    unlockOffsetMs: unlockMs,
    netAura: db.net_aura,
    comments: [],
  }
}

export async function fetchActivePosts(appStartMs: number): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbPost[]).map((db) => dbPostToUi(db, appStartMs))
}

export async function fetchUserPosts(userId: string, appStartMs: number): Promise<ProfilePost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbPost[]).map((db) => {
    const unlockMs = new Date(db.unlock_at).getTime() - appStartMs
    return {
      id: db.id,
      media: mediaUrl(db.media_url),
      unlockOffsetMs: unlockMs,
      netAura: db.net_aura,
    }
  })
}

export async function createPostRecord(params: {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  storagePath: string
  mediaType: 'image' | 'video'
  caption: string
  location: string
}): Promise<DbPost> {
  const unlockAt = new Date(Date.now() + DAY).toISOString()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: params.userId,
      username: params.username,
      display_name: params.displayName,
      avatar_url: params.avatarUrl,
      media_url: params.storagePath,
      media_type: params.mediaType,
      caption: params.caption,
      location: params.location,
      unlock_at: unlockAt,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as DbPost
}

export async function uploadMedia(
  userId: string,
  file: File
): Promise<{ path: string; mediaType: 'image' | 'video' }> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
  return { path, mediaType }
}

export async function castVote(postId: string, voteType: 'up' | 'down', voterId: string): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .insert({ post_id: postId, voter_id: voterId, vote_type: voteType })
  if (error) throw error
}

export async function fetchUserVote(postId: string, userId: string): Promise<'up' | 'down' | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('post_id', postId)
    .eq('voter_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.vote_type as 'up' | 'down'
}

export function uiPostFromNewPost(db: DbPost, appStartMs: number): Post {
  return dbPostToUi(db, appStartMs)
}

export function profilePostFromDb(db: DbPost, appStartMs: number): ProfilePost {
  const unlockMs = new Date(db.unlock_at).getTime() - appStartMs
  return {
    id: db.id,
    media: mediaUrl(db.media_url),
    unlockOffsetMs: unlockMs,
    netAura: db.net_aura,
  }
}

export function creatorFromProfile(username: string, displayName: string, avatarUrl: string | null): Creator {
  return {
    username,
    name: displayName,
    avatar: avatarUrl || '/avatars/me.png',
  }
}

export type { Comment }
