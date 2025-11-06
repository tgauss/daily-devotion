import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanDetails } from '@/components/plans/plan-details'

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch plan with items and lessons
  const { data: plan, error } = await supabase
    .from('plans')
    .select(`
      *,
      plan_items(
        *,
        lessons(*)
      )
    `)
    .eq('id', id)
    .single()

  // If plan not found or query failed, redirect to dashboard (or auth if not logged in)
  if (error || !plan) {
    console.error('[PlanPage] Plan fetch error:', error?.message || 'Plan not found')
    if (!user) {
      redirect('/auth')
    }
    redirect('/dashboard')
  }

  // Check authorization
  const isOwner = user && plan.user_id === user.id
  const isPublic = plan.is_public

  console.log('[PlanPage] Authorization check:', {
    planId: plan.id,
    isOwner,
    isPublic,
    hasUser: !!user,
  })

  // Allow access if: user owns the plan OR plan is public
  if (!isOwner && !isPublic) {
    // Private plan that user doesn't own
    if (!user) {
      redirect('/auth')
    }
    redirect('/dashboard')
  }

  return (
    <div
      className="min-h-screen bg-sandstone py-12 px-4"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <a
            href="/dashboard"
            className="text-olivewood hover:text-golden-wheat transition-colors font-sans inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </a>
        </div>

        <PlanDetails plan={plan} userId={user?.id || null} />
      </div>
    </div>
  )
}
