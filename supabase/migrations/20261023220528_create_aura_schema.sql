/*
# Aura Social App — Database Schema

## Overview
Creates the full database backend for the Aura social app: user profiles, posts with media,
anonymous votes, and a storage bucket for media uploads.

## New Tables
1. `profiles` — extends Supabase auth.users with display info
   - `id` (uuid, PK, references auth.users)
   - `username` (text, unique, not null)
   - `display_name` (text, not null)
   - `avatar_url` (text, nullable — defaults to a generated avatar path)
   - `bio` (text, nullable)
   - `location` (text, default 'Hong Kong')
   - `created_at` (timestamptz, default now())

2. `posts` — user-generated content (photos/videos) with locked Aura scores
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users, not null, defaults to auth.uid())
   - `username` (text, not null — denormalized for fast feed reads)
   - `display_name` (text, not null)
   - `avatar_url` (text, nullable)
   - `media_url` (text, not null — path in Supabase storage)
   - `media_type` (text, 'image' or 'video', default 'image')
   - `caption` (text, not null)
   - `location` (text, not null)
   - `unlock_at` (timestamptz, not null — when the Aura score reveals; defaults to now() + 24h)
   - `net_aura` (integer, default 0 — updated by trigger from votes)
   - `is_active` (boolean, default true — only active posts show in feed)
   - `created_at` (timestamptz, default now())

3. `votes` — anonymous +Aura / -Aura votes on posts
   - `id` (uuid, PK)
   - `post_id` (uuid, FK → posts, not null, ON DELETE CASCADE)
   - `voter_id` (uuid, FK → auth.users, nullable — anonymous votes allowed)
   - `vote_type` (text, 'up' or 'down', not null)
   - `created_at` (timestamptz, default now())
   - UNIQUE constraint on (post_id, voter_id) to prevent duplicate votes per user

## Triggers / Functions
- `update_net_aura()` — trigger function that recalculates posts.net_aura on each vote insert/delete
- Trigger on `votes` AFTER INSERT/DELETE to call update_net_aura()

## Storage
- Creates a `media` storage bucket (public) for user photo/video uploads

## Security (RLS)
### profiles
- SELECT: public (anyone can view profiles — anon + authenticated)
- INSERT/UPDATE: authenticated users can only modify their own profile
- INSERT trigger: auto-creates a profile row when a new auth.users row is inserted

### posts
- SELECT: public (anyone can view posts — the feed is public)
- INSERT: authenticated users can only insert their own posts
- UPDATE/DELETE: authenticated users can only modify their own posts

### votes
- SELECT: public (vote counts are visible through posts.net_aura)
- INSERT: authenticated users can vote (voter_id defaults to auth.uid())
- DELETE: authenticated users can only delete their own votes

## Grants
- profiles: SELECT to anon, authenticated; INSERT/UPDATE to authenticated
- posts: SELECT to anon, authenticated; INSERT/UPDATE/DELETE to authenticated
- votes: SELECT to anon, authenticated; INSERT to authenticated; DELETE to authenticated
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  location text NOT NULL DEFAULT 'Hong Kong',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

-- ============ POSTS ============
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Hong Kong',
  unlock_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  net_aura integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON posts TO authenticated;

DROP POLICY IF EXISTS "posts_select_public" ON posts;
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "posts_insert_own" ON posts;
CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON posts;
CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_active_created ON posts(is_active, created_at DESC);

-- ============ VOTES ============
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, voter_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON votes TO anon, authenticated;
GRANT INSERT ON votes TO authenticated;
GRANT DELETE ON votes TO authenticated;

DROP POLICY IF EXISTS "votes_select_public" ON votes;
CREATE POLICY "votes_select_public"
  ON votes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "votes_insert_own" ON votes;
CREATE POLICY "votes_insert_own"
  ON votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

DROP POLICY IF EXISTS "votes_delete_own" ON votes;
CREATE POLICY "votes_delete_own"
  ON votes FOR DELETE TO authenticated USING (auth.uid() = voter_id);

-- ============ NET AURA TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_net_aura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET net_aura = net_aura + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET net_aura = net_aura - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS votes_net_aura_insert ON votes;
CREATE TRIGGER votes_net_aura_insert
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION public.update_net_aura();

DROP TRIGGER IF EXISTS votes_net_aura_delete ON votes;
CREATE TRIGGER votes_net_aura_delete
  AFTER DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION public.update_net_aura();

REVOKE EXECUTE ON FUNCTION public.update_net_aura() FROM PUBLIC, anon;

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload, everyone can read
DROP POLICY IF EXISTS "media_upload_authenticated" ON storage.objects;
CREATE POLICY "media_upload_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_read_public" ON storage.objects;
CREATE POLICY "media_read_public"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_delete_own" ON storage.objects;
CREATE POLICY "media_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid());
