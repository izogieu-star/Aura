'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup'

export function AuthScreen() {
  const { signIn, signUp, signInAsGuest } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      if (!username.trim() || !displayName.trim()) {
        setError('Username and display name are required')
        setBusy(false)
        return
      }
      const { error } = await signUp(email, password, username.trim(), displayName.trim())
      if (error) setError(error)
    }
    setBusy(false)
  }

  async function handleGuest() {
    setBusy(true)
    await signInAsGuest()
    setBusy(false)
  }

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-aura-accent/20 via-background to-background" />
      <div className="absolute -top-32 left-1/2 size-64 -translate-x-1/2 rounded-full bg-aura-accent/20 blur-[80px]" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-aura-pos via-aura-accent to-aura-neg shadow-[0_0_60px_-12px_var(--aura-accent)]">
            <Zap className="size-10 fill-white text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            aura<span className="text-aura-accent">.</span>
          </h1>
          <p className="text-sm text-muted-foreground">Rate the vibe. No mercy.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === 'signup' && (
                <>
                  <Input
                    label="Username"
                    value={username}
                    onChange={setUsername}
                    placeholder="kaito.hk"
                    autoComplete="username"
                  />
                  <Input
                    label="Display name"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Kaito Wong"
                    autoComplete="name"
                  />
                </>
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {error && (
                <p className="rounded-xl bg-aura-neg/15 px-4 py-2.5 text-sm text-aura-neg">{error}</p>
              )}

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={{ scale: 0.97 }}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-aura-pos via-aura-accent to-aura-neg text-base font-black text-white shadow-[0_0_40px_-10px_var(--aura-accent)] transition-opacity disabled:opacity-50"
              >
                <Sparkles className="size-5" />
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null)
              setMode(mode === 'login' ? 'signup' : 'login')
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-semibold text-aura-accent">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </button>

          <div className="my-1 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-card text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'h-12 w-full rounded-2xl bg-card px-4 text-sm outline-none placeholder:text-muted-foreground',
          'focus-visible:ring-2 focus-visible:ring-aura-accent'
        )}
      />
    </label>
  )
}
