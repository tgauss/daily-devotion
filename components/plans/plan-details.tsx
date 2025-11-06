'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PlanDetailsProps {
  plan: any
  userId: string
}

export function PlanDetails({ plan, userId }: PlanDetailsProps) {
  const [generating, setGenerating] = useState<string | null>(null)

  const handleGenerateLessons = async () => {
    if (!confirm('Generate all lessons for this plan? This may take a few minutes.')) {
      return
    }

    setGenerating(plan.id)

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate lessons')

      alert('Lessons generated successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Error generating lessons:', error)
      alert('Failed to generate lessons. Please try again.')
    } finally {
      setGenerating(null)
    }
  }

  const sortedItems = [...plan.plan_items].sort((a: any, b: any) => a.index - b.index)

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{plan.title}</h1>
            {plan.description && (
              <p className="text-white/70 mb-4">{plan.description}</p>
            )}
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-full">
                {plan.source}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-sm rounded-full">
                {plan.schedule_type}
              </span>
              {plan.theme && (
                <span className="px-3 py-1 bg-green-500/20 text-green-200 text-sm rounded-full">
                  {plan.theme}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Generate all lessons button */}
        {plan.user_id === userId && (
          <button
            onClick={handleGenerateLessons}
            disabled={generating !== null}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold rounded-lg transition-colors"
          >
            {generating ? 'Generating Lessons...' : 'Generate All Lessons'}
          </button>
        )}
      </div>

      {/* Lessons list */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Lessons</h2>

        <div className="space-y-3">
          {sortedItems.map((item: any, index: number) => {
            const lesson = item.lessons?.[0]
            const hasLesson = !!lesson

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-200 font-semibold">{index + 1}</span>
                </div>

                <div className="flex-1">
                  <p className="text-white font-medium">
                    {item.references_text.join(', ')}
                  </p>
                  <p className="text-sm text-white/60">
                    {item.date_target ? new Date(item.date_target).toLocaleDateString() : 'No date'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasLesson ? (
                    <>
                      <span className="px-3 py-1 bg-green-500/20 text-green-200 text-sm rounded-full">
                        Ready
                      </span>
                      <Link
                        href={`/s/${lesson.share_slug}`}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        View
                      </Link>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 text-sm rounded-full">
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
