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
    <div
      className="min-h-screen bg-[#f5f1e8] py-12 px-4"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-amber-700 hover:text-amber-800 transition-colors font-serif"
          >
            ← Back to Dashboard
          </a>
        </div>

        <PlanDetails plan={plan} userId={user.id} />
      </div>
    </div>
  )
}
