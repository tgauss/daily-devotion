'use client'

import Link from 'next/link'

export function GuidanceWidget() {
  return (
    <div className="bg-gradient-to-br from-olivewood/10 via-golden-wheat/10 to-clay-rose/5 rounded-xl p-6 shadow-lg border border-olivewood/20 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-olivewood/5 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-olivewood/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-olivewood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-heading text-charcoal">Guidance Guide</h3>
        </div>

        <p className="text-sm text-charcoal/70 font-sans leading-relaxed mb-6">
          Share what's on your heart and receive personalized Scripture-based guidance. Whether celebrating, struggling, or seeking wisdom — God's Word has something for you.
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-charcoal/60 font-sans">
            <svg className="w-4 h-4 text-olivewood" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>AI-powered Scripture matching</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal/60 font-sans">
            <svg className="w-4 h-4 text-olivewood" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Private & secure</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal/60 font-sans">
            <svg className="w-4 h-4 text-olivewood" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Access anytime</span>
          </div>
        </div>

        <Link
          href="/guidance"
          className="block w-full px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-semibold rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow text-center font-sans"
        >
          Seek Guidance Now
        </Link>
      </div>
    </div>
  )
}
