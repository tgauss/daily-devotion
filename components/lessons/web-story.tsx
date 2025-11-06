'use client'

import { useState, useEffect } from 'react'
import { StoryManifest, StoryPage } from '@/lib/types/database'
import { StoryPageComponent } from './story-page'

interface WebStoryProps {
  manifest: StoryManifest
  onComplete?: () => void
  lessonId?: string
}

export function WebStory({ manifest, onComplete, lessonId }: WebStoryProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [startTime] = useState(Date.now())

  const totalPages = manifest.pages.length
  const isLastPage = currentPage === totalPages - 1

  useEffect(() => {
    // Track progress when reaching the last page
    if (isLastPage && onComplete) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      onComplete()
    }
  }, [isLastPage, onComplete, startTime])

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevious()
    }
  }

  return (
    <div
      className="relative w-full h-screen bg-[#f5f1e8] overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/50 z-20">
        <div
          className="h-full bg-amber-700 transition-all duration-300"
          style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* Story page */}
      <div className="absolute inset-0 flex items-center justify-center">
        <StoryPageComponent
          page={manifest.pages[currentPage]}
          pageNumber={currentPage + 1}
          totalPages={totalPages}
        />
      </div>

      {/* Navigation areas - disabled on CTA pages to allow button clicks */}
      {manifest.pages[currentPage].type !== 'cta' && (
        <div className="absolute inset-0 flex">
          {/* Left tap area - previous */}
          {currentPage > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 cursor-pointer focus:outline-none"
              aria-label="Previous page"
            >
              <div className="h-full opacity-0 hover:opacity-10 bg-white transition-opacity" />
            </button>
          )}

          {/* Right tap area - next */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={handleNext}
              className="flex-1 cursor-pointer focus:outline-none ml-auto"
              aria-label="Next page"
            >
              <div className="h-full opacity-0 hover:opacity-10 bg-white transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* Navigation buttons (mobile-friendly) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10 px-4">
        {currentPage > 0 && (
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-sm border border-amber-300 shadow-sm transition-all font-serif"
          >
            ← Previous
          </button>
        )}
        <span className="px-4 py-3 bg-white/80 text-amber-900/70 rounded-sm border border-amber-200 text-sm font-serif">
          {currentPage + 1} / {totalPages}
        </span>
        {currentPage < totalPages - 1 && (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-sm border border-amber-300 shadow-sm transition-all font-serif"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
