import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  location: string
}

export type DbPost = {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  media_url: string
  media_type: 'image' | 'video'
  caption: string
  location: string
  unlock_at: string
  net_aura: number
  is_active: boolean
  created_at: string
}

export type DbVote = {
  id: string
  post_id: string
  voter_id: string | null
  vote_type: 'up' | 'down'
  created_at: string
}
