'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <header className="bg-white/80 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-950 font-serif">Daily Devotion</h1>
          <p className="text-sm text-amber-700 font-serif">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-sm border border-amber-300 transition-colors font-serif"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
