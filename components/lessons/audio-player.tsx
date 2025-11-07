'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  autoPlay?: boolean
  className?: string
}

export function AudioPlayer({ audioUrl, autoPlay = false, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      console.error('Audio playback error')
      setError(true)
      setIsPlaying(false)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Auto-play if requested
    if (autoPlay && !error) {
      audio.play().catch((err) => {
        console.error('Auto-play failed:', err)
        // Auto-play might be blocked by browser policy, that's OK
      })
    }

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [autoPlay, error])

  // Reset error state when audio URL changes
  useEffect(() => {
    setError(false)
    setIsPlaying(false)
  }, [audioUrl])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((err) => {
        console.error('Playback failed:', err)
        setError(true)
      })
    }
  }

  // Don't render anything if there's an error
  if (error) {
    return null
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        onClick={togglePlayback}
        className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-olivewood/30 hover:border-olivewood/60 shadow-sm hover:shadow-md transition-all"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? (
          <VolumeX className="w-5 h-5 text-olivewood animate-pulse" />
        ) : (
          <Volume2 className="w-5 h-5 text-olivewood group-hover:scale-110 transition-transform" />
        )}
      </button>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  )
}
