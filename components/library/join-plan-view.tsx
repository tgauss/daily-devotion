'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, Users, UserPlus, Check, Calendar, X } from 'lucide-react'
import { calculateCompletionDate } from '@/lib/utils/schedule'

interface JoinPlanViewProps {
  shareLink: {
    message: string | null
    plans: {
      id: string
      title: string
      description: string | null
      theme: string | null
      depth_level: 'simple' | 'moderate' | 'deep'
      schedule_type: 'daily' | 'weekly'
      schedule_mode: 'self-guided' | 'synchronized'
      created_by_name: string | null
      plan_items: Array<{ id: string }>
    }
  }
  token: string
  userId: string
}

export function JoinPlanView({ shareLink, token, userId }: JoinPlanViewProps) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const plan = shareLink.plans

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

  const handleJoinClick = () => {
    // For self-guided plans, show date picker modal
    // For synchronized plans, join directly
    if (plan.schedule_mode === 'self-guided') {
      setShowDatePicker(true)
    } else {
      handleJoin()
    }
  }

  const handleJoin = async (customStartDate?: string) => {
    setJoining(true)
    setError('')
    setShowDatePicker(false)

    try {
      const requestBody: { token: string; customStartDate?: string } = { token }

      // Only include customStartDate for self-guided plans if provided
      if (plan.schedule_mode === 'self-guided' && customStartDate) {
        requestBody.customStartDate = customStartDate
      }

      const response = await fetch('/api/plans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join plan')
      }

      // Redirect to the enrolled plan
      router.push(`/plans/${data.planId}`)
    } catch (err) {
      console.error('Error joining plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to join plan')
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-sandstone flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Invite Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olivewood to-golden-wheat rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-2">
            You're Invited to Join a Study Plan!
          </h1>
          {plan.created_by_name && (
            <p className="text-lg text-charcoal/70 font-sans">
              {plan.created_by_name} is inviting you to study together
            </p>
          )}
        </div>

        {/* Custom Message */}
        {shareLink.message && (
          <div className="mb-8 p-6 bg-white rounded-lg border-2 border-olivewood/20">
            <p className="text-lg text-charcoal font-sans italic">"{shareLink.message}"</p>
          </div>
        )}

        {/* Plan Details */}
        <div className="bg-white rounded-xl border-2 border-olivewood/30 p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">{plan.title}</h2>

          {plan.description && (
            <p className="text-charcoal/70 font-sans leading-relaxed mb-6">{plan.description}</p>
          )}

          {plan.theme && (
            <div className="inline-block px-4 py-2 bg-olivewood/10 text-olivewood font-medium rounded-full mb-6">
              {plan.theme}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm font-sans">
            <div className="flex items-center gap-2 text-charcoal/70">
              <Clock className="w-5 h-5 text-olivewood" />
              <div>
                <div className="font-semibold text-charcoal">Study Depth</div>
                <div>{getDepthLabel()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-charcoal/70">
              <BookOpen className="w-5 h-5 text-olivewood" />
              <div>
                <div className="font-semibold text-charcoal">Frequency</div>
                <div className="capitalize">{plan.schedule_type}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Button */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleJoinClick}
          disabled={joining}
          className="w-full px-8 py-4 bg-gradient-to-r from-olivewood to-golden-wheat hover:opacity-90 disabled:opacity-50 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl font-sans flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enrolling in Plan...
            </>
          ) : (
            <>
              <Check className="w-6 h-6" />
              Join This Plan
            </>
          )}
        </button>

        <p className="text-center text-sm text-charcoal/60 font-sans mt-4">
          {plan.schedule_mode === 'synchronized'
            ? 'Join this community study - everyone studies together on the same schedule'
            : 'Start this plan on your own schedule and progress at your own pace'
          }
        </p>

        {/* Start Date Picker Modal (for self-guided plans) */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowDatePicker(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading font-bold text-charcoal">When Would You Like to Start?</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-charcoal/40 hover:text-charcoal transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-charcoal/70 font-sans mb-6">
                Choose your start date, and we'll set up a personalized schedule just for you.
                You can always adjust your pace as you go!
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-charcoal font-sans mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg font-sans focus:border-olivewood focus:outline-none"
                />
              </div>

              {startDate && plan.plan_items && (
                <div className="bg-olivewood/10 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-olivewood mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal font-sans mb-1">
                        Your Journey
                      </p>
                      <p className="text-sm text-charcoal/70 font-sans">
                        <span className="font-medium">{plan.plan_items.length} lessons</span> •{' '}
                        Starting {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' '}• Estimated completion:{' '}
                        {new Date(calculateCompletionDate(startDate, plan.plan_items.length, plan.schedule_type)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 px-6 py-3 border-2 border-charcoal/20 text-charcoal rounded-lg font-sans font-semibold hover:bg-charcoal/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleJoin(startDate)}
                  disabled={!startDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-olivewood to-golden-wheat hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-sans font-semibold transition-opacity"
                >
                  Begin Journey
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
