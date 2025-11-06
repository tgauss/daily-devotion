'use client'

import Link from 'next/link'
import { Plan } from '@/lib/types/database'

interface PlansListProps {
  plans: any[]
}

export function PlansList({ plans }: PlansListProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 mb-4">You haven't created any plans yet.</p>
        <Link
          href="/plans/create"
          className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          Create Your First Plan
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => {
        const totalItems = plan.plan_items?.length || 0
        const completedItems = plan.plan_items?.filter((item: any) => item.status === 'published').length || 0
        const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

        return (
          <Link
            key={plan.id}
            href={`/plans/${plan.id}`}
            className="block p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.title}</h3>
                {plan.description && (
                  <p className="text-sm text-white/60 line-clamp-2">{plan.description}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-medium rounded-full">
                {plan.source}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{completedItems} of {totalItems} lessons</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
