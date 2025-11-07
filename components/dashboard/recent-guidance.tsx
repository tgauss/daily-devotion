'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface RecentGuidanceProps {
  guidance: any[]
}

export function RecentGuidance({ guidance }: RecentGuidanceProps) {
  if (!guidance || guidance.length === 0) {
    return (
      <div className="bg-white/90 rounded-xl p-6 shadow-lg border border-olivewood/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-heading text-charcoal">Recent Guidance</h3>
          <Link
            href="/guidance"
            className="text-sm text-olivewood hover:text-golden-wheat font-sans font-medium transition-colors"
          >
            Seek Guidance →
          </Link>
        </div>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-charcoal/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-charcoal/60 font-sans text-sm mb-4">
            You haven't sought guidance yet
          </p>
          <Link
            href="/guidance"
            className="inline-block px-4 py-2 bg-olivewood hover:bg-olivewood/90 text-white font-medium rounded-lg transition-all text-sm font-sans"
          >
            Get Started
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 rounded-xl p-6 shadow-lg border border-olivewood/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading text-charcoal">Recent Guidance</h3>
        <Link
          href="/guidance"
          className="text-sm text-olivewood hover:text-golden-wheat font-sans font-medium transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="space-y-3">
        {guidance.slice(0, 3).map((item) => {
          const situationPreview = item.situation_text.length > 80
            ? item.situation_text.substring(0, 80) + '...'
            : item.situation_text

          return (
            <Link
              key={item.id}
              href={`/guidance/${item.id}`}
              className="block p-4 bg-gradient-to-r from-olivewood/5 to-transparent hover:from-olivewood/10 rounded-lg border border-olivewood/10 hover:border-olivewood/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal font-sans line-clamp-2 mb-2">
                    {situationPreview}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-charcoal/50 font-sans">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-olivewood/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
