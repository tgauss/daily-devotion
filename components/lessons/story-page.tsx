'use client'

import { motion } from 'framer-motion'
import { StoryPage } from '@/lib/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { AudioPlayer } from './audio-player'
import { useRef, useState } from 'react'

interface StoryPageComponentProps {
  page: StoryPage
  pageNumber: number
  totalPages: number
  audioUrl?: string
  autoPlayAudio?: boolean
  onAudioEnded?: () => void
  onAudioPlay?: () => void
  onAudioPaused?: () => void
}

export function StoryPageComponent({ page, pageNumber, totalPages, audioUrl, autoPlayAudio = false, onAudioEnded, onAudioPlay, onAudioPaused }: StoryPageComponentProps) {
  // Subtle fade-in animation only
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } // easeOut
  }

  // Create unique paper texture variation for each passage page
  const getPaperTransform = (pageNum: number) => {
    const variations = [
      'scaleX(1) scaleY(1)',      // normal
      'scaleX(-1) scaleY(1)',     // flip horizontal
      'scaleX(1) scaleY(-1)',     // flip vertical
      'scaleX(-1) scaleY(-1)',    // flip both
    ]
    return variations[pageNum % variations.length]
  }

  switch (page.type) {
    case 'passage':
      return (
        <motion.div {...fadeIn} className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 pb-24 relative">
          {/* Audio player in top-right */}
          {audioUrl && (
            <div className="absolute top-0 right-4 sm:right-6 md:right-8 z-10">
              <AudioPlayer audioUrl={audioUrl} autoPlay={autoPlayAudio} onAudioEnded={onAudioEnded} onAudioPlay={onAudioPlay} onAudioPaused={onAudioPaused} />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-charcoal mb-6 md:mb-8 text-center">
            {page.content.title}
          </h2>
          <div
            className="relative text-base sm:text-lg md:text-xl text-charcoal leading-relaxed font-sans font-medium p-5 sm:p-8 md:p-10 rounded-lg border border-clay-rose/30 shadow-md overflow-hidden"
            style={{
              backgroundImage: 'url(/paper-page.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Paper texture layer with transform for variation */}
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: 'url(/paper-page.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: getPaperTransform(pageNumber),
              }}
            />
            {/* Text content with slight background for readability */}
            <div className="relative z-10 bg-white/30 p-4 sm:p-5 rounded">
              {page.content.text}
            </div>
          </div>
        </motion.div>
      )

    case 'cover': {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const audioRef = useRef<HTMLAudioElement>(null)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isPlaying, setIsPlaying] = useState(false)

      const handleAudioPlay = () => {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
            if (onAudioPaused) onAudioPaused()
          } else {
            audioRef.current.play()
            setIsPlaying(true)
            if (onAudioPlay) onAudioPlay()
          }
        }
      }

      return (
        <motion.div
          {...fadeIn}
          className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 -mt-8"
          style={{
            backgroundImage: 'url(/lesson-cover.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-charcoal/30" />

          {/* Hidden audio player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlaying(false)
                if (onAudioEnded) onAudioEnded()
              }}
              onPlay={() => {
                setIsPlaying(true)
                if (onAudioPlay) onAudioPlay()
              }}
              onPause={() => {
                setIsPlaying(false)
                if (onAudioPaused) onAudioPaused()
              }}
            />
          )}

          <div className="relative max-w-2xl text-center z-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-white mb-6 md:mb-8 leading-tight drop-shadow-lg">
              {page.content.title}
            </h1>
            {page.content.text && (
              <div className="space-y-6 md:space-y-8">
                {/* Parse the text - it contains reference + intro separated by \n\n */}
                {page.content.text.split('\n\n').map((part, idx) => (
                  <p
                    key={idx}
                    className={idx === 0
                      ? "text-2xl sm:text-3xl md:text-4xl text-golden-wheat font-sans font-semibold leading-tight drop-shadow-md"
                      : "text-base sm:text-lg md:text-xl text-white/90 font-sans leading-relaxed drop-shadow-md"
                    }
                  >
                    {part}
                  </p>
                ))}
              </div>
            )}

            {/* Prominent audio button */}
            {audioUrl && (
              <div className="mt-10 md:mt-12">
                <button
                  onClick={handleAudioPlay}
                  className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-golden-wheat hover:bg-golden-wheat/90 text-charcoal font-semibold font-sans rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <Image
                    src="/icons/Audio-Book-Headphones--Listen-Freehand.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="text-base sm:text-lg">
                    {isPlaying ? 'Pause Audio' : 'Read My Lesson Out Loud'}
                  </span>
                </button>
              </div>
            )}

            <p className="mt-12 md:mt-16 text-white/60 text-xs sm:text-sm font-sans drop-shadow-md">Tap or press → to continue</p>
          </div>
        </motion.div>
      )
    }

    case 'content':
      return (
        <motion.div {...fadeIn} className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 pb-24 relative">
          {/* Audio player in top-right */}
          {audioUrl && (
            <div className="absolute top-0 right-4 sm:right-6 md:right-8 z-10">
              <AudioPlayer audioUrl={audioUrl} autoPlay={autoPlayAudio} onAudioEnded={onAudioEnded} onAudioPlay={onAudioPlay} onAudioPaused={onAudioPaused} />
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-charcoal mb-6 md:mb-10">
            {page.content.title}
          </h2>
          <div className="text-base sm:text-lg md:text-xl text-charcoal leading-relaxed space-y-4 md:space-y-6 font-sans font-medium">
            {page.content.text?.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      )

    case 'takeaways':
      return (
        <motion.div {...fadeIn} className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 pb-24 relative">
          {/* Audio player in top-right */}
          {audioUrl && (
            <div className="absolute top-0 right-4 sm:right-6 md:right-8 z-10">
              <AudioPlayer audioUrl={audioUrl} autoPlay={autoPlayAudio} onAudioEnded={onAudioEnded} onAudioPlay={onAudioPlay} onAudioPaused={onAudioPaused} />
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-charcoal mb-6 md:mb-10">
            {page.content.title}
          </h2>
          <ul className="space-y-4 md:space-y-6 mb-10 md:mb-14">
            {page.content.bullets?.map((bullet, idx) => {
              // Empty bullet = spacer
              if (!bullet) {
                return <li key={idx} className="h-2"></li>
              }

              // Strip any leading emojis and clean up text
              const cleanBullet = bullet.replace(/^(💡|🤔)\s*/, '').trim()

              // Check if this is a section header (ends with colon)
              if (cleanBullet.endsWith(':')) {
                return (
                  <li key={idx} className="text-lg sm:text-xl md:text-2xl text-olivewood font-semibold font-heading mt-4">
                    {cleanBullet}
                  </li>
                )
              }

              return (
                <li
                  key={idx}
                  className="flex items-start text-base sm:text-lg md:text-xl text-charcoal leading-relaxed font-sans font-medium"
                >
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-golden-wheat/40 border border-golden-wheat flex items-center justify-center mr-3 sm:mr-5 mt-0.5 sm:mt-1">
                    <span className="text-charcoal font-semibold font-sans text-xs sm:text-sm">
                      {idx + 1}
                    </span>
                  </span>
                  <span>{cleanBullet}</span>
                </li>
              )
            })}
          </ul>

          {/* Quiz CTA section */}
          {page.content.cta && (
            <div className="text-center mt-10 md:mt-14 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-charcoal mb-3">
                  Ready to Deepen Your Understanding?
                </h3>
                <p className="text-base sm:text-lg text-charcoal/70 font-sans mb-6">
                  Reflect on what you've learned with a few thoughtful questions
                </p>
                <Link
                  href={page.content.cta.href}
                  className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-olivewood hover:bg-olivewood/90 text-white text-lg sm:text-xl font-semibold font-sans rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  {page.content.cta.text}
                </Link>
              </div>

              <div className="pt-4 border-t border-clay-rose/20">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal text-sm sm:text-base font-sans transition-colors"
                >
                  <span>←</span>
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )

    case 'cta':
      return (
        <motion.div {...fadeIn} className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 pb-24 text-center relative">
          {/* Audio player in top-right */}
          {audioUrl && (
            <div className="absolute top-0 right-4 sm:right-6 md:right-8 z-10">
              <AudioPlayer audioUrl={audioUrl} autoPlay={autoPlayAudio} onAudioEnded={onAudioEnded} onAudioPlay={onAudioPlay} onAudioPaused={onAudioPaused} />
            </div>
          )}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-bold text-charcoal mb-6 md:mb-8">
            {page.content.title}
          </h2>
          {page.content.text && (
            <p className="text-lg sm:text-xl md:text-2xl text-charcoal mb-10 md:mb-14 leading-relaxed font-sans font-medium">
              {page.content.text}
            </p>
          )}
          {page.content.cta && (
            <Link
              href={page.content.cta.href}
              className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-olivewood hover:bg-olivewood/90 text-white text-lg sm:text-xl font-semibold font-sans rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {page.content.cta.text}
            </Link>
          )}
        </motion.div>
      )

    default:
      return (
        <motion.div {...fadeIn} className="max-w-2xl mx-auto px-8 text-center">
          <p className="text-charcoal">Unknown page type</p>
        </motion.div>
      )
  }
}
