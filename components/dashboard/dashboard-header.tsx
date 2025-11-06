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
    <header className="bg-white/90 border-b border-olivewood/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-charcoal">MyDailyBread</h1>
          <p className="text-sm text-olivewood font-sans mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-5 py-2 bg-clay-rose/20 hover:bg-clay-rose/30 text-charcoal rounded-md border border-clay-rose/40 transition-all font-sans"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
