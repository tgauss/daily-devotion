'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, CheckCircle2, PlayCircle } from 'lucide-react'
import { BatchLessonGenerator } from './batch-lesson-generator'
import { SingleLessonGenerator } from './single-lesson-generator'

interface PlanDetailsProps {
  plan: any
  userId: string | null
  progress: any
}

export function PlanDetails({ plan, userId, progress }: PlanDetailsProps) {
  const [buildingItemId, setBuildingItemId] = useState<string | null>(null)

  const handleGenerationComplete = () => {
    // Reload the page to show newly built lessons
    window.location.reload()
  }

  const buildSpecificLesson = async (planItemId: string) => {
    setBuildingItemId(planItemId)

    try {
      const response = await fetch('/api/lessons/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planItemId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to build lesson')
      }

      // Reload to show the newly built lesson
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setBuildingItemId(null)
    }
  }

  const sortedItems = [...plan.plan_items].sort((a: any, b: any) => a.index - b.index)

  // Helper to check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false
    return progress.some((p: any) => p.lesson_id === lessonId && p.completed_at)
  }

  // Helper to check if this is today's lesson
  const isTodaysLesson = (dateTarget: string) => {
    if (!dateTarget) return false
    const today = new Date().toDateString()
    const target = new Date(dateTarget).toDateString()
    return today === target
  }

  // Count completed lessons
  const completedCount = sortedItems.filter((item: any) => {
    const lesson = item.plan_item_lessons?.[0]?.lessons
    return lesson && isLessonCompleted(lesson.id)
  }).length

  return (
    <div className="space-y-8">
      {/* Plan header */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-charcoal mb-3 font-heading">{plan.title}</h1>
            {plan.description && (
              <p className="text-charcoal/70 mb-6 text-lg font-sans leading-relaxed">{plan.description}</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                {plan.source}
              </span>
              <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                {plan.schedule_type}
              </span>
              {plan.theme && (
                <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                  {plan.theme}
                </span>
              )}
              {plan.is_public && (
                <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                  Public
                </span>
              )}
              {progress && (
                <span className="px-4 py-2 bg-olivewood/10 text-olivewood text-sm rounded-md border border-olivewood/30 font-sans font-semibold">
                  {completedCount} / {sortedItems.length} completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lesson building options */}
        {plan.user_id === userId && (
          <div className="space-y-6">
            <div className="border-t border-olivewood/20 pt-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4 font-heading">
                Quick Build
              </h3>
              <SingleLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
            </div>

            <div className="border-t border-olivewood/20 pt-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4 font-heading">
                Batch Build
              </h3>
              <BatchLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
            </div>
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <h2 className="text-3xl font-bold text-charcoal mb-8 font-heading">Ready for today's reading? ({sortedItems.length} lessons)</h2>

        <div className="space-y-4">
          {sortedItems.map((item: any, index: number) => {
            // New structure: plan_item_lessons is a junction table with lessons
            const lesson = item.plan_item_lessons?.[0]?.lessons
            const hasLesson = !!lesson
            const isCompleted = lesson && isLessonCompleted(lesson.id)
            const isToday = isTodaysLesson(item.date_target)

            return (
              <div
                key={item.id}
                className={`flex items-center gap-6 p-6 rounded-lg border transition-all ${
                  isToday
                    ? 'bg-golden-wheat/10 border-golden-wheat shadow-md'
                    : isCompleted
                    ? 'bg-white/30 border-olivewood/10 opacity-70'
                    : 'bg-white/50 border-olivewood/20 hover:border-olivewood/30'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${
                  isCompleted
                    ? 'bg-olivewood/20 border-olivewood'
                    : 'bg-sandstone border-olivewood/30'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-olivewood" />
                  ) : (
                    <span className="text-olivewood font-semibold font-sans text-lg">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-charcoal font-medium font-sans text-lg">
                      {item.references_text.join(', ')}
                    </p>
                    {isToday && (
                      <span className="px-3 py-1 bg-golden-wheat text-white text-xs rounded-md border border-golden-wheat font-sans font-semibold flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Today
                      </span>
                    )}
                    {item.category && (
                      <span className="px-3 py-1 bg-clay-rose/30 text-olivewood text-xs rounded-md border border-olivewood/20 font-sans">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal/60 font-sans">
                    {item.date_target ? new Date(item.date_target).toLocaleDateString() : 'No date'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {hasLesson ? (
                    <>
                      {isCompleted && (
                        <span className="px-4 py-2 bg-olivewood/10 text-olivewood text-sm rounded-md border border-olivewood/30 font-sans font-semibold">
                          Completed
                        </span>
                      )}
                      <Link
                        href={`/s/${lesson.share_slug}`}
                        className={`px-6 py-2 rounded-md border transition-colors font-sans font-medium ${
                          isToday
                            ? 'bg-golden-wheat hover:bg-golden-wheat/90 text-white border-golden-wheat/50'
                            : 'bg-olivewood hover:bg-olivewood/90 text-white border-olivewood/50'
                        }`}
                      >
                        {isToday ? 'Start Today' : isCompleted ? 'Review' : 'View'}
                      </Link>
                    </>
                  ) : (
                    <>
                      {plan.user_id === userId ? (
                        <button
                          onClick={() => buildSpecificLesson(item.id)}
                          disabled={buildingItemId === item.id}
                          className="px-6 py-2 bg-golden-wheat hover:bg-golden-wheat/90 disabled:bg-golden-wheat/50 text-charcoal font-medium rounded-md border border-golden-wheat/50 transition-colors font-sans flex items-center gap-2"
                        >
                          {buildingItemId === item.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Building...
                            </>
                          ) : (
                            'Build Now'
                          )}
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-clay-rose/20 text-charcoal/60 text-sm rounded-md border border-olivewood/20 font-sans">
                          Not ready yet
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
