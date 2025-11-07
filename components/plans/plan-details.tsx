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
            </div>
          </div>
        </div>

        {/* Generate all lessons */}
        {plan.user_id === userId && (
          <BatchLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
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

            return (
              <div
                key={item.id}
                className="flex items-center gap-6 p-6 bg-white/50 rounded-lg border border-olivewood/20 hover:border-olivewood/30 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-sandstone border border-olivewood/30 flex items-center justify-center">
                  <span className="text-olivewood font-semibold font-sans text-lg">{index + 1}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-charcoal font-medium font-sans text-lg">
                      {item.references_text.join(', ')}
                    </p>
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
                      <span className="px-4 py-2 bg-golden-wheat/30 text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                        Ready
                      </span>
                      <Link
                        href={`/s/${lesson.share_slug}`}
                        className="px-6 py-2 bg-olivewood hover:bg-olivewood/90 text-white rounded-md border border-olivewood/50 transition-colors font-sans font-medium"
                      >
                        View
                      </Link>
                    </>
                  ) : (
                    <span className="px-4 py-2 bg-clay-rose/20 text-charcoal/60 text-sm rounded-md border border-olivewood/20 font-sans">
                      You're almost there
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
