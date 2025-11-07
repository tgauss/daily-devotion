'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FortWorthPlan {
  id: string
  title: string
  user_id: string
  created_at: string
  users: Array<{
    email: string
    first_name: string | null
    last_name: string | null
  }>
  plan_items: Array<{
    id: string
    status: string
  }>
}

interface FortWorthPlansListProps {
  plans: FortWorthPlan[]
}

export function FortWorthPlansList({ plans }: FortWorthPlansListProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleCopyLessons = async (planId: string) => {
    setLoadingPlanId(planId)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/copy-fort-worth-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlanId: planId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to copy lessons')
      }

      const result = await response.json()
      setSuccess(`✅ Successfully copied ${result.lessonsCopied} lessons!`)

      // Refresh page to show updated counts
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingPlanId(null)
    }
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal/60 font-sans">
        No Fort Worth plans found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm font-sans">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm font-sans">
          {success}
        </div>
      )}

      <div className="space-y-3">
        {plans.map((plan) => {
          const publishedCount = plan.plan_items.filter(item => item.status === 'published').length
          const totalCount = plan.plan_items.length
          const hasAllLessons = publishedCount === totalCount
          const user = plan.users[0] // Get first user from array
          const displayName = user?.first_name
            ? `${user.first_name} ${user.last_name || ''}`.trim()
            : user?.email || 'Unknown'

          return (
            <div
              key={plan.id}
              className="p-4 bg-sandstone/30 rounded-md border border-clay-rose/20 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-charcoal font-sans">
                    {displayName}
                  </span>
                  {hasAllLessons && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-sans">
                      Complete
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal/70 font-sans">
                  {user?.email || 'Unknown email'}
                </div>
                <div className="text-xs text-charcoal/50 font-sans mt-1">
                  {publishedCount} of {totalCount} lessons
                  {publishedCount > 0 && ` (${Math.round((publishedCount / totalCount) * 100)}%)`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`/plans/${plan.id}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs bg-white hover:bg-gray-50 text-charcoal rounded-md border border-clay-rose/30 transition-all font-sans"
                >
                  View Plan
                </a>

                {!hasAllLessons && (
                  <button
                    onClick={() => handleCopyLessons(plan.id)}
                    disabled={loadingPlanId === plan.id}
                    className="px-4 py-1.5 text-xs bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white rounded-md transition-all font-sans font-medium"
                  >
                    {loadingPlanId === plan.id ? 'Copying...' : 'Copy Lessons'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-clay-rose/10 border border-clay-rose/30 rounded-md">
        <p className="text-sm text-charcoal/70 font-sans">
          <strong>How it works:</strong> Click "Copy Lessons" to copy all 244 pre-generated lessons
          from an existing Fort Worth plan to this user's plan. This is instant and avoids regenerating content.
        </p>
      </div>
    </div>
  )
}
