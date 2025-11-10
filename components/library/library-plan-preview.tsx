'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, Users, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LibraryPlanPreviewProps {
  plan: {
    id: string
    title: string
    description: string | null
    theme: string | null
    depth_level: 'simple' | 'moderate' | 'deep'
    schedule_type: 'daily' | 'weekly'
    created_by_name: string | null
    plan_library_stats: {
      participant_count: number
      completion_count: number
    } | null
  }
  userId: string
}

export function LibraryPlanPreview({ plan, userId }: LibraryPlanPreviewProps) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const getDepthLabel = () => {
    switch (plan.depth_level) {
      case 'simple':
        return 'Simple (5-7 min)'
      case 'moderate':
        return 'Moderate (10-12 min)'
      case 'deep':
        return 'Deep (15-20 min)'
      default:
        return ''
    }
  }

  const handleJoinFromLibrary = async () => {
    setJoining(true)
    setError('')

    try {
      // For library plans, we'll copy the plan directly using the plan ID
      // This is different from invite links which use tokens
      const response = await fetch('/api/plans/library/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join plan')
      }

      // Redirect to the new plan
      router.push(`/plans/${data.planId}`)
    } catch (err) {
      console.error('Error joining plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to join plan')
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-sandstone py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal font-sans mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Library
        </Link>

        {/* Plan Details */}
        <div className="bg-white rounded-xl border-2 border-olivewood/30 p-8 shadow-lg mb-8">
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">{plan.title}</h1>

          {plan.description && (
            <p className="text-lg text-charcoal/70 font-sans leading-relaxed mb-6">{plan.description}</p>
          )}

          {plan.theme && (
            <div className="inline-block px-4 py-2 bg-olivewood/10 text-olivewood font-medium rounded-full mb-6">
              {plan.theme}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-clay-rose/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-olivewood/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-olivewood" />
              </div>
              <div>
                <div className="font-semibold text-charcoal font-sans text-sm">Study Depth</div>
                <div className="text-charcoal/70 font-sans text-sm">{getDepthLabel()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-olivewood/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-olivewood" />
              </div>
              <div>
                <div className="font-semibold text-charcoal font-sans text-sm">Frequency</div>
                <div className="text-charcoal/70 font-sans text-sm capitalize">{plan.schedule_type}</div>
              </div>
            </div>

            {plan.plan_library_stats && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-olivewood/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-olivewood" />
                </div>
                <div>
                  <div className="font-semibold text-charcoal font-sans text-sm">Participants</div>
                  <div className="text-charcoal/70 font-sans text-sm">
                    {plan.plan_library_stats.participant_count} joined
                  </div>
                </div>
              </div>
            )}
          </div>

          {plan.created_by_name && (
            <p className="text-sm text-charcoal/60 font-sans">
              Created by {plan.created_by_name}
            </p>
          )}
        </div>

        {/* Join Button */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleJoinFromLibrary}
          disabled={joining}
          className="w-full px-8 py-4 bg-gradient-to-r from-olivewood to-golden-wheat hover:opacity-90 disabled:opacity-50 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl font-sans flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding to Your Plans...
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              Add This Plan to My Library
            </>
          )}
        </button>

        <p className="text-center text-sm text-charcoal/60 font-sans mt-4">
          This will create a personalized copy of the plan in your account
        </p>
      </div>
    </div>
  )
}
