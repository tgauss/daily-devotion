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
        <p className="text-stone-600 mb-4 font-serif">You haven't created any plans yet.</p>
        <Link
          href="/plans/create"
          className="inline-block px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
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
            className="block p-6 bg-white/50 hover:bg-amber-50 rounded-sm border border-amber-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-amber-950 mb-1 font-serif">{plan.title}</h3>
                {plan.description && (
                  <p className="text-sm text-stone-600 line-clamp-2 font-serif">{plan.description}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-sm border border-amber-200 font-serif">
                {plan.source}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-stone-700 font-serif">
                <span>{completedItems} of {totalItems} lessons</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-2 bg-amber-100 rounded-sm overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-amber-700 transition-all"
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
