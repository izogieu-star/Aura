'use client'

import { AuthProvider, useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/aura/app-shell'
import { AuthScreen } from '@/components/aura/auth-screen'

function Gate() {
  const { loading, user, isGuest } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-aura-accent" />
      </div>
    )
  }

  if (!user && !isGuest) {
    return <AuthScreen />
  }

  return <AppShell />
}

export default function Page() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
