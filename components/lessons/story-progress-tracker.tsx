'use client'

import { useEffect } from 'react'

interface StoryProgressTrackerProps {
  userId: string
  lessonId: string
}

export function StoryProgressTracker({ userId, lessonId }: StoryProgressTrackerProps) {
  useEffect(() => {
    const startTime = Date.now()

    // Track completion when user leaves or closes
    const handleComplete = async () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      try {
        await fetch('/api/progress/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId,
            timeSpent,
          }),
        })
      } catch (error) {
        console.error('Error tracking progress:', error)
      }
    }

    // Track on unmount
    return () => {
      handleComplete()
    }
  }, [userId, lessonId])

  return null
}
