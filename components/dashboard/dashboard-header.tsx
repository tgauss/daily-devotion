'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import type { User as ProfileUser } from '@/lib/types/database'

interface DashboardHeaderProps {
  user: User
  profile: ProfileUser | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
    : user.email?.split('@')[0] || 'User'

  return (
    <header className="bg-white/90 border-b border-olivewood/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/my-daily-break-logo.png"
              alt="MyDailyBread Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-heading text-charcoal">MyDailyBread</h1>
              <p className="text-sm text-olivewood font-sans mt-0.5">
                Welcome back, {displayName}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-5 py-2 bg-clay-rose/20 hover:bg-clay-rose/30 text-charcoal rounded-md border border-clay-rose/40 transition-all font-sans"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex gap-2 sm:gap-4 overflow-x-auto">
          <a
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-charcoal hover:text-olivewood hover:bg-olivewood/10 rounded-md transition-colors font-sans whitespace-nowrap"
          >
            Dashboard
          </a>
          <a
            href="/library"
            className="px-4 py-2 text-sm font-medium text-charcoal hover:text-olivewood hover:bg-olivewood/10 rounded-md transition-colors font-sans whitespace-nowrap"
          >
            Plan Library
          </a>
          <a
            href="/guidance"
            className="px-4 py-2 text-sm font-medium text-charcoal hover:text-olivewood hover:bg-olivewood/10 rounded-md transition-colors font-sans whitespace-nowrap"
          >
            Seek Guidance
          </a>
          <a
            href="/plans/create"
            className="px-4 py-2 text-sm font-medium text-charcoal hover:text-olivewood hover:bg-olivewood/10 rounded-md transition-colors font-sans whitespace-nowrap"
          >
            Create Plan
          </a>
        </nav>
      </div>
    </header>
  )
}
