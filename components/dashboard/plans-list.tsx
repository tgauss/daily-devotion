'use client'

import Link from 'next/link'
import { Plan } from '@/lib/types/database'

interface PlansListProps {
  plans: any[]
}

export function PlansList({ plans }: PlansListProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal/60 mb-6 font-sans text-lg">Ready to begin?</p>
        <Link
          href="/plans/create"
          className="inline-block px-8 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-medium rounded-md border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
        >
          Create Your First Plan
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {plans.map((plan) => {
        const totalItems = plan.plan_items?.length || 0
        const completedItems = plan.plan_items?.filter((item: any) => item.status === 'published').length || 0
        const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

        return (
          <Link
            key={plan.id}
            href={`/plans/${plan.id}`}
            onClick={() => console.log('[CLIENT] Clicking plan link:', plan.id, `/plans/${plan.id}`)}
            className="block p-6 bg-white hover:bg-white/80 rounded-lg border border-olivewood/20 hover:border-golden-wheat/40 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-heading text-charcoal mb-2">{plan.title}</h3>
                {plan.description && (
                  <p className="text-sm text-charcoal/60 line-clamp-2 font-sans">{plan.description}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-clay-rose/20 text-olivewood text-xs font-medium rounded-md border border-clay-rose/30 font-sans">
                {plan.source}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-charcoal/70 font-sans">
                <span>{completedItems} of {totalItems} readings</span>
                <span className="font-medium text-golden-wheat">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-2.5 bg-sandstone rounded-full overflow-hidden border border-olivewood/10">
                <div
                  className="h-full bg-gradient-to-r from-olivewood to-golden-wheat transition-all"
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
