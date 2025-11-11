'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface FeaturedLessonsManagerProps {
  lessons: Array<{
    id: string
    title: string
    scripture_reference: string
    is_featured: boolean
    plans: {
      title: string
    }
  }>
}

export function FeaturedLessonsManager({ lessons }: FeaturedLessonsManagerProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [localLessons, setLocalLessons] = useState(lessons)

  const toggleFeatured = async (lessonId: string, currentStatus: boolean) => {
    setUpdating(lessonId)

    try {
      const response = await fetch('/api/admin/toggle-featured-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, isFeatured: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update lesson')
      }

      // Update local state
      setLocalLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, is_featured: !currentStatus }
            : lesson
        )
      )
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update lesson. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const featuredCount = localLessons.filter((l) => l.is_featured).length

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal/70 font-sans">
            {featuredCount} of {localLessons.length} lessons are featured on the homepage
          </p>
          <div className="flex items-center gap-2 text-golden-wheat">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-sans font-bold">Featured Lessons</span>
          </div>
        </div>
        <p className="text-xs text-charcoal/60 font-sans mt-2">
          Featured lessons are publicly accessible and displayed on the homepage for visitors to preview
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {localLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`flex items-start justify-between p-4 rounded-lg border transition-all ${
              lesson.is_featured
                ? 'bg-golden-wheat/10 border-golden-wheat/30'
                : 'bg-white border-olivewood/10'
            }`}
          >
            <div className="flex-1 min-w-0 mr-4">
              <h4 className="font-heading font-bold text-charcoal mb-1">
                {lesson.title}
              </h4>
              <p className="text-sm text-charcoal/60 font-sans mb-1">
                {lesson.scripture_reference}
              </p>
              <p className="text-xs text-olivewood/70 font-sans">
                From: {lesson.plans.title}
              </p>
            </div>
            <button
              onClick={() => toggleFeatured(lesson.id, lesson.is_featured)}
              disabled={updating === lesson.id}
              className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                lesson.is_featured
                  ? 'bg-golden-wheat text-white hover:bg-golden-wheat/90'
                  : 'bg-olivewood/10 text-olivewood hover:bg-olivewood/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={lesson.is_featured ? 'Remove from featured' : 'Add to featured'}
            >
              <Star
                className={`w-5 h-5 ${lesson.is_featured ? 'fill-current' : ''}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
