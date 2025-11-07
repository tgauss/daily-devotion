'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface SingleLessonGeneratorProps {
  planId: string
  onComplete: () => void
}

export function SingleLessonGenerator({ planId, onComplete }: SingleLessonGeneratorProps) {
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const buildNextLesson = async () => {
    setIsBuilding(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/lessons/generate-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to build lesson: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.allComplete) {
        setSuccess('All lessons have been built!')
      } else {
        const wasReused = data.lesson.wasReused ? ' (reused existing)' : ' (with audio)'
        setSuccess(
          `Built: ${data.lesson.reference}${wasReused} - ${data.progress.completed}/${data.progress.total} complete`
        )
      }

      // Wait a moment to show success, then reload
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <button
          onClick={buildNextLesson}
          disabled={isBuilding}
          className="px-6 py-3 bg-golden-wheat hover:bg-golden-wheat/90 disabled:bg-golden-wheat/50 text-charcoal font-semibold rounded-md border border-golden-wheat/50 transition-colors font-sans flex items-center gap-2"
        >
          {isBuilding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building...
            </>
          ) : (
            'Build Next Lesson'
          )}
        </button>
        <p className="text-sm text-charcoal/60 font-sans">
          Build the next lesson in your plan with audio narration
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-sans text-sm">{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-sans text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  )
}
