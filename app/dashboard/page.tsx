import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { PlansList } from '@/components/dashboard/plans-list'
import { ProgressOverview } from '@/components/dashboard/progress-overview'
import { NudgeCard } from '@/components/dashboard/nudge-card'
import { ImportFortWorthButton } from '@/components/plans/import-fort-worth-button'
import { WelcomeModal } from '@/components/onboarding/welcome-modal'
import { GuidanceWidget } from '@/components/dashboard/guidance-widget'
import { RecentGuidance } from '@/components/dashboard/recent-guidance'
import { ReferralStats } from '@/components/dashboard/referral-stats'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's owned plans
  const { data: ownedPlans } = await supabase
    .from('plans')
    .select(`
      *,
      plan_items(
        id,
        index,
        status,
        date_target
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch enrolled plans (plans user joined from library/invites)
  const { data: enrollments } = await supabase
    .from('user_plan_enrollments')
    .select(`
      *,
      plans (
        *,
        plan_items(
          id,
          index,
          status,
          date_target
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('enrolled_at', { ascending: false })

  // Combine owned and enrolled plans
  const enrolledPlans = (enrollments || [])
    .map((e: any) => ({
      ...e.plans,
      enrollment_id: e.id,
      enrolled_at: e.enrolled_at,
      is_enrolled: true, // Flag to distinguish from owned plans
    }))
    .filter((p: any) => p !== null)

  const plans = [...(ownedPlans || []), ...enrolledPlans]

  // Fetch progress
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)

  // Fetch recent guidance
  const { data: recentGuidance } = await supabase
    .from('spiritual_guidance')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Calculate stats for hero
  const totalCompleted = progress?.filter((p) => p.completed_at).length || 0
  const totalTimeSpent = progress?.reduce((sum, p) => sum + (p.time_spent_sec || 0), 0) || 0
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div
      className="min-h-screen bg-sandstone"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <WelcomeModal
        firstName={profile?.first_name}
        userEmail={user.email || ''}
      />

      <DashboardHeader
        user={user}
        profile={profile}
      />

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Hero Section */}
        <DashboardHero
          firstName={profile?.first_name}
          totalReadings={totalCompleted}
          totalTime={formatTime(totalTimeSpent)}
        />

        {/* Nudge card for overdue lessons */}
        <NudgeCard userId={user.id} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plans list */}
            <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-olivewood/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-heading text-charcoal">Your Reading Plans</h2>
                  <p className="text-sm text-charcoal/60 font-sans mt-1">Continue your spiritual journey</p>
                </div>
              </div>
              <PlansList plans={plans || []} />
            </div>

            {/* Import Fort Worth Bible Plan */}
            <ImportFortWorthButton />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Progress overview */}
            <div className="bg-white/90 rounded-xl p-6 shadow-lg border border-olivewood/20">
              <h3 className="text-xl font-heading text-charcoal mb-4">Your Progress</h3>
              <ProgressOverview progress={progress || []} />
            </div>

            {/* Referral Stats */}
            <ReferralStats />

            {/* Recent Guidance */}
            <RecentGuidance guidance={recentGuidance || []} />

            {/* Guidance Guide Widget - Only show if no recent guidance */}
            {(!recentGuidance || recentGuidance.length === 0) && <GuidanceWidget />}
          </div>
        </div>
      </main>
    </div>
  )
}
