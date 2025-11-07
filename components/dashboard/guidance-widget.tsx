'use client'

import Link from 'next/link'

export function GuidanceWidget() {
  return (
    <div className="bg-gradient-to-br from-olivewood/10 to-golden-wheat/10 rounded-lg p-8 shadow-lg border border-olivewood/20">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading text-charcoal mb-2">Guidance Guide</h3>
          <p className="text-charcoal/70 font-sans leading-relaxed">
            Need spiritual direction? Share what's on your heart and receive personalized Scripture-based guidance.
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <svg
            className="w-12 h-12 text-olivewood/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 rounded-lg p-4 border border-olivewood/20">
          <div className="text-sm text-charcoal/60 font-sans mb-1">Find</div>
          <div className="text-lg font-semibold text-olivewood font-heading">
            Relevant Scripture
          </div>
        </div>
        <div className="bg-white/60 rounded-lg p-4 border border-olivewood/20">
          <div className="text-sm text-charcoal/60 font-sans mb-1">Receive</div>
          <div className="text-lg font-semibold text-olivewood font-heading">
            Personal Guidance
          </div>
        </div>
        <div className="bg-white/60 rounded-lg p-4 border border-olivewood/20">
          <div className="text-sm text-charcoal/60 font-sans mb-1">Keep</div>
          <div className="text-lg font-semibold text-olivewood font-heading">
            Private History
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/guidance"
          className="block w-full px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-semibold rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow text-center font-sans"
        >
          Seek Guidance
        </Link>
        <p className="text-xs text-charcoal/50 text-center font-sans italic">
          Whether celebrating, struggling, or seeking wisdom — God's Word has something for you
        </p>
      </div>
    </div>
  )
}
