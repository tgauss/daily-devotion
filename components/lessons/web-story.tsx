'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryManifest, StoryPage, AudioManifest } from '@/lib/types/database'
import { StoryPageComponent } from './story-page'

interface WebStoryProps {
  manifest: StoryManifest
  audioManifest?: AudioManifest | null
  onComplete?: () => void
  lessonId?: string
}

export function WebStory({ manifest, audioManifest, onComplete, lessonId }: WebStoryProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [startTime] = useState(Date.now())
  const [direction, setDirection] = useState(0) // 1 for next, -1 for previous
  const [audioEnabled, setAudioEnabled] = useState(true) // Track if user wants audio

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
      setDirection(1)
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      setDirection(-1)
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

  // Subtle page transition
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -20 : 20,
      opacity: 0,
    }),
  }

  const pageTransition = {
    duration: 0.3,
    ease: [0.42, 0, 0.58, 1] as any, // easeInOut
  }

  return (
    <div
      className="relative w-full h-screen bg-sandstone overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-clay-rose/30 z-20">
        <motion.div
          className="h-full bg-golden-wheat"
          animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Story page with smooth transitions */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              className="w-full"
            >
              <StoryPageComponent
                page={manifest.pages[currentPage]}
                pageNumber={currentPage + 1}
                totalPages={totalPages}
                audioUrl={audioManifest?.pages.find(p => p.pageIndex === currentPage)?.audioUrl}
                autoPlayAudio={currentPage > 0 && audioEnabled}
                onAudioEnded={audioEnabled ? handleNext : undefined}
                onAudioPaused={() => setAudioEnabled(false)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation areas - disabled on CTA pages and takeaways with quiz button to allow button clicks */}
      {manifest.pages[currentPage].type !== 'cta' &&
       !(manifest.pages[currentPage].type === 'takeaways' && manifest.pages[currentPage].content.cta) && (
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
      <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 flex justify-center items-center gap-2 sm:gap-4 z-30 px-4">
        {currentPage > 0 && (
          <button
            onClick={handlePrevious}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/95 hover:bg-white text-charcoal rounded-lg border border-clay-rose/40 shadow-lg transition-all font-sans text-xs sm:text-sm font-medium"
          >
            ← Previous
          </button>
        )}
        <span className="px-3 sm:px-4 py-2 sm:py-3 bg-white/80 text-charcoal/60 rounded-lg border border-clay-rose/30 text-xs sm:text-sm font-sans font-medium">
          {currentPage + 1} / {totalPages}
        </span>
        {currentPage < totalPages - 1 && (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white/90 hover:bg-white text-charcoal rounded-lg border border-clay-rose/40 shadow-sm transition-all font-sans text-sm"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
