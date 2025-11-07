'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SpiritualGuidance } from '@/lib/types/database'
import { GuidancePage } from './guidance-page'

interface GuidanceViewerProps {
  guidance: SpiritualGuidance
}

type PageType =
  | 'cover'
  | 'opening'
  | 'passage'
  | 'reflection'
  | 'prayer'
  | 'encouragement'

interface Page {
  type: PageType
  title: string
  content: any
  index: number
}

export function GuidanceViewer({ guidance }: GuidanceViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Build pages array
  const pages: Page[] = [
    {
      type: 'cover',
      title: 'Your Personal Guidance',
      content: guidance.situation_text,
      index: 0,
    },
    {
      type: 'opening',
      title: 'A Word for You',
      content: guidance.guidance_content.opening,
      index: 1,
    },
    ...guidance.passages.map((passage, i) => ({
      type: 'passage' as PageType,
      title: passage.reference,
      content: {
        passage,
        insight: guidance.guidance_content.scriptural_insights[i] || 'This passage speaks to your situation with comfort and wisdom.',
      },
      index: 2 + i,
    })),
    {
      type: 'reflection',
      title: 'Reflections',
      content: guidance.guidance_content.reflections,
      index: 2 + guidance.passages.length,
    },
    {
      type: 'prayer',
      title: 'Prayer Points',
      content: guidance.guidance_content.prayer_points,
      index: 3 + guidance.passages.length,
    },
    {
      type: 'encouragement',
      title: 'Encouragement',
      content: guidance.guidance_content.encouragement,
      index: 4 + guidance.passages.length,
    },
  ]

  const totalPages = pages.length

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Page transition variants
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
    ease: [0.42, 0, 0.58, 1] as any,
  }

  // Mobile: Swipeable pages
  if (isMobile) {
    return (
      <div
        className="relative w-full min-h-screen bg-sandstone overflow-hidden"
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
                <GuidancePage page={pages[currentPage]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          {currentPage > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 cursor-pointer focus:outline-none"
              aria-label="Previous page"
            >
              <div className="h-full opacity-0 hover:opacity-10 bg-white transition-opacity" />
            </button>
          )}

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

        {/* Navigation buttons */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-30 px-4">
          {currentPage > 0 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-white/95 hover:bg-white text-charcoal rounded-lg border border-clay-rose/40 shadow-lg transition-all font-sans text-xs font-medium"
            >
              ← Previous
            </button>
          )}
          <span className="px-3 py-2 bg-white/80 text-charcoal/60 rounded-lg border border-clay-rose/30 text-xs font-sans font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          {currentPage < totalPages - 1 && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-white/95 hover:bg-white text-charcoal rounded-lg border border-clay-rose/40 shadow-lg transition-all font-sans text-xs font-medium"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    )
  }

  // Desktop: Single scrollable page
  return (
    <div
      className="min-h-screen bg-sandstone py-12"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {pages.map((page, index) => (
          <div key={index}>
            <GuidancePage page={page} desktopMode />
          </div>
        ))}
      </div>
    </div>
  )
}
