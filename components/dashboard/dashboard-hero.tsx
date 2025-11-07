'use client'

import Link from 'next/link'

interface DashboardHeroProps {
  firstName?: string | null
  totalReadings: number
  totalTime: string
}

export function DashboardHero({ firstName, totalReadings, totalTime }: DashboardHeroProps) {
  const displayName = firstName || 'friend'

  return (
    <div className="relative bg-gradient-to-br from-olivewood/5 via-golden-wheat/5 to-clay-rose/5 rounded-2xl p-8 md:p-12 shadow-lg border border-olivewood/20 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-olivewood"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading text-charcoal mb-4">
            Welcome back, {displayName}
          </h1>
          <p className="text-lg md:text-xl text-charcoal/70 font-sans leading-relaxed mb-8">
            Continue your journey of spiritual growth. Every day is an opportunity to deepen your understanding of God's Word.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-olivewood/20">
              <div className="text-2xl font-heading text-olivewood">{totalReadings}</div>
              <div className="text-sm text-charcoal/60 font-sans">Readings Complete</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-olivewood/20">
              <div className="text-2xl font-heading text-golden-wheat">{totalTime}</div>
              <div className="text-sm text-charcoal/60 font-sans">Time in Scripture</div>
            </div>
            <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-olivewood/20">
              <div className="text-2xl font-heading text-clay-rose">
                <svg className="w-8 h-8 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-sm text-charcoal/60 font-sans">Growing Daily</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/guidance"
              className="px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-semibold rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Seek Guidance
            </Link>
            <Link
              href="/plans/create"
              className="px-6 py-3 bg-white hover:bg-sandstone text-charcoal font-semibold rounded-lg border border-olivewood/30 transition-all shadow-sm hover:shadow font-sans inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Reading Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
