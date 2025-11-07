'use client'

import { PassageSuggestion } from '@/lib/types/database'

interface Page {
  type: 'cover' | 'opening' | 'passage' | 'reflection' | 'prayer' | 'encouragement'
  title: string
  content: any
  index: number
}

interface GuidancePageProps {
  page: Page
  desktopMode?: boolean
}

export function GuidancePage({ page, desktopMode = false }: GuidancePageProps) {
  const containerClass = desktopMode
    ? 'bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-lg border border-olivewood/20'
    : 'max-w-lg mx-auto px-6'

  // Cover page
  if (page.type === 'cover') {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-olivewood/10 rounded-full">
            <p className="text-sm font-medium text-olivewood font-sans">Your Personal Guidance</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal font-heading leading-tight">
            Scripture & Wisdom for Your Journey
          </h1>
          <div className="bg-sandstone/50 rounded-lg p-6 border border-olivewood/20">
            <p className="text-sm text-charcoal/60 font-sans mb-2">Your Situation:</p>
            <p className="text-base text-charcoal font-sans leading-relaxed italic">
              "{page.content}"
            </p>
          </div>
          <p className="text-sm text-charcoal/60 font-sans">
            Swipe or tap to explore personalized guidance
          </p>
        </div>
      </div>
    )
  }

  // Opening page
  if (page.type === 'opening') {
    return (
      <div className={containerClass}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-heading mb-4">
              {page.title}
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-charcoal/90 font-sans leading-relaxed text-base sm:text-lg">
              {page.content}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Passage page with scriptural insight
  if (page.type === 'passage') {
    const { passage, insight } = page.content as {
      passage: PassageSuggestion
      insight: string
    }

    return (
      <div className={containerClass}>
        <div className="space-y-6">
          {/* Reference header */}
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-golden-wheat/20 rounded-full mb-4">
              <p className="text-sm font-medium text-charcoal/70 font-sans">Scripture</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-olivewood font-heading">
              {passage.reference}
            </h2>
          </div>

          {/* Why it's relevant */}
          <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
            <p className="text-sm text-charcoal/80 font-sans leading-relaxed">
              <span className="font-semibold text-olivewood">Why this passage: </span>
              {passage.relevance}
            </p>
          </div>

          {/* Passage text */}
          <div className="bg-white/80 rounded-lg p-6 border-l-4 border-golden-wheat">
            <p className="text-charcoal/90 font-serif leading-relaxed text-base sm:text-lg">
              {passage.text}
            </p>
            <p className="text-sm text-charcoal/50 mt-4 font-sans text-right">
              — {passage.reference} ({passage.translation})
            </p>
          </div>

          {/* Scriptural insight */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-charcoal font-sans mb-3">
              How This Speaks to You
            </h3>
            <p className="text-charcoal/90 font-sans leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Reflection page
  if (page.type === 'reflection') {
    const reflections = page.content as string[]

    return (
      <div className={containerClass}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-clay-rose/20 rounded-full mb-4">
              <p className="text-sm font-medium text-charcoal/70 font-sans">Reflections</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-heading">
              {page.title}
            </h2>
            <p className="text-sm text-charcoal/60 font-sans mt-2">
              Consider these thoughts and actions
            </p>
          </div>

          <div className="space-y-4">
            {reflections.map((reflection, index) => (
              <div
                key={index}
                className="bg-white/80 rounded-lg p-5 border border-clay-rose/30 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-clay-rose/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-charcoal font-sans">
                      {index + 1}
                    </span>
                  </div>
                  <p className="flex-1 text-charcoal/90 font-sans leading-relaxed">
                    {reflection}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Prayer page
  if (page.type === 'prayer') {
    const prayers = page.content as string[]

    return (
      <div className={containerClass}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-olivewood/10 rounded-full mb-4">
              <p className="text-sm font-medium text-olivewood font-sans">Prayer</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-heading">
              {page.title}
            </h2>
            <p className="text-sm text-charcoal/60 font-sans mt-2">
              Bring these before the Lord
            </p>
          </div>

          <div className="space-y-4">
            {prayers.map((prayer, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-olivewood/5 to-golden-wheat/5 rounded-lg p-5 border border-olivewood/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-xl text-olivewood">•</div>
                  <p className="flex-1 text-charcoal/90 font-sans leading-relaxed">
                    {prayer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Encouragement page
  if (page.type === 'encouragement') {
    return (
      <div className={containerClass}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-golden-wheat/20 rounded-full mb-4">
              <p className="text-sm font-medium text-charcoal/70 font-sans">Final Word</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-heading">
              {page.title}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-golden-wheat/10 to-olivewood/10 rounded-lg p-8 border border-golden-wheat/30">
            <p className="text-charcoal/90 font-sans leading-relaxed text-base sm:text-lg text-center">
              {page.content}
            </p>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-charcoal/60 font-sans italic">
              May God's Word bring you comfort, wisdom, and strength
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
