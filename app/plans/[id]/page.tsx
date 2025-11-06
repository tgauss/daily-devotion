import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanDetails } from '@/components/plans/plan-details'

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

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

  if (error || !plan) {
    redirect('/dashboard')
  }

  // Check authorization
  if (plan.user_id !== user.id && !plan.is_public) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-blue-300 hover:text-blue-200 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        <PlanDetails plan={plan} userId={user.id} />
      </div>
    </div>
  )
}
