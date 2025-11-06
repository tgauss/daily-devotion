'use client'

import Link from 'next/link'
import { BatchLessonGenerator } from './batch-lesson-generator'

interface PlanDetailsProps {
  plan: any
  userId: string | null
}

export function PlanDetails({ plan, userId }: PlanDetailsProps) {
  const handleGenerationComplete = () => {
    // Reload the page to show newly generated lessons
    window.location.reload()
  }

  const sortedItems = [...plan.plan_items].sort((a: any, b: any) => a.index - b.index)

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="bg-white/80 rounded-sm p-8 shadow-md border border-amber-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-950 mb-2 font-serif">{plan.title}</h1>
            {plan.description && (
              <p className="text-stone-700 mb-4 font-serif">{plan.description}</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-sm border border-amber-200 font-serif">
                {plan.source}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-sm border border-amber-200 font-serif">
                {plan.schedule_type}
              </span>
              {plan.theme && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-sm border border-amber-200 font-serif">
                  {plan.theme}
                </span>
              )}
              {plan.is_public && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-sm border border-amber-200 font-serif">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Generate all lessons */}
        {plan.user_id === userId && (
          <BatchLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
        )}
      </div>

      {/* Lessons list */}
      <div className="bg-white/80 rounded-sm p-6 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-950 mb-6 font-serif">Lessons ({sortedItems.length})</h2>

        <div className="space-y-3">
          {sortedItems.map((item: any, index: number) => {
            const lesson = item.lessons?.[0]
            const hasLesson = !!lesson

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white/50 rounded-sm border border-amber-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <span className="text-amber-900 font-semibold font-serif">{index + 1}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-amber-950 font-medium font-serif">
                      {item.references_text.join(', ')}
                    </p>
                    {item.category && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-sm border border-amber-200 font-serif">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 font-serif">
                    {item.date_target ? new Date(item.date_target).toLocaleDateString() : 'No date'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasLesson ? (
                    <>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-sm border border-amber-200 font-serif">
                        Ready
                      </span>
                      <Link
                        href={`/s/${lesson.share_slug}`}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-sm border border-amber-900 transition-colors font-serif"
                      >
                        View
                      </Link>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm border border-stone-200 font-serif">
                      Pending
                    </span>
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
