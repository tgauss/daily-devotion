import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PlanDetails } from '@/components/plans/plan-details'

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // First, use service client to check if plan exists and get basic info
  // This bypasses RLS to avoid permission issues on the initial check
  const serviceClient = createServiceClient()
  const { data: planBasic, error: basicError } = await serviceClient
    .from('plans')
    .select('id, title, description, user_id, is_public, source, created_at, updated_at')
    .eq('id', id)
    .single()

  // If plan doesn't exist at all, redirect
  if (basicError || !planBasic) {
    if (!user) {
      redirect('/login')
    }
    redirect('/dashboard')
  }

  // Check authorization before fetching full data
  const isOwner = user && planBasic.user_id === user.id
  const isPublic = planBasic.is_public

  // Check if user is enrolled in this plan
  let isEnrolled = false
  let enrollment = null
  if (user && !isOwner) {
    const { data: enrollmentData } = await supabase
      .from('user_plan_enrollments')
      .select('id, custom_start_date, enrolled_at')
      .eq('user_id', user.id)
      .eq('plan_id', id)
      .eq('is_active', true)
      .single()
    isEnrolled = !!enrollmentData
    enrollment = enrollmentData
  }

  // Allow access if: user owns the plan OR user is enrolled OR plan is public
  if (!isOwner && !isEnrolled && !isPublic) {
    if (!user) {
      redirect('/login')
    }
    redirect('/dashboard')
  }

  // Now fetch full plan with nested data
  // Use service client to bypass RLS for lesson data (lessons are public content)
  const { data: plan, error } = await serviceClient
    .from('plans')
    .select(`
      *,
      plan_items(
        *,
        plan_item_lessons(
          lessons(*)
        )
      )
    `)
    .eq('id', id)
    .single()

  // Fetch progress data if user is logged in
  let progress = null
  if (user) {
    const { data: progressData } = await supabase
      .from('progress')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
    progress = progressData || []
  }

  // If full fetch fails, fall back to showing basic plan info
  if (error || !plan) {
    // Use basic plan data with empty arrays for items
    const fallbackPlan = {
      ...planBasic,
      plan_items: []
    }
    return renderPlanPage(fallbackPlan, user?.id || null, progress, enrollment)
  }

  return renderPlanPage(plan, user?.id || null, progress, enrollment)
}

function renderPlanPage(plan: any, userId: string | null, progress: any, enrollment: any) {

  return (
    <div
      className="min-h-screen bg-sandstone py-12 px-4"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
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

        <PlanDetails plan={plan} userId={userId} progress={progress} enrollment={enrollment} />
      </div>
    </div>
  )
}
