'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type Profile } from '@/lib/supabase-client'

type AuthState = {
  user: { id: string; email: string } | null
  profile: Profile | null
  loading: boolean
  isGuest: boolean
}

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: string | null }>
  signInAsGuest: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isGuest: false,
  })

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) return
    setState((prev) => ({ ...prev, profile: data as Profile | null }))
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        setState({
          user: { id: session.user.id, email: session.user.email ?? '' },
          profile: null,
          loading: false,
          isGuest: false,
        })
        loadProfile(session.user.id)
      } else {
        const guest = typeof window !== 'undefined' && sessionStorage.getItem('aura-guest') === 'true'
        setState({ user: null, profile: null, loading: false, isGuest: guest })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (session?.user) {
          setState({
            user: { id: session.user.id, email: session.user.email ?? '' },
            profile: null,
            loading: false,
            isGuest: false,
          })
          await loadProfile(session.user.id)
        } else {
          setState({ user: null, profile: null, loading: false, isGuest: false })
        }
      })()
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, display_name: displayName } },
      })
      if (error) return { error: error.message }
      if (data.user) {
        await loadProfile(data.user.id)
      }
      return { error: null }
    },
    [loadProfile]
  )

  const signInAsGuest = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aura-guest', 'true')
    }
    setState({ user: null, profile: null, loading: false, isGuest: true })
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aura-guest')
    }
    await supabase.auth.signOut()
    setState({ user: null, profile: null, loading: false, isGuest: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
