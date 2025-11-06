import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PlansList } from '@/components/dashboard/plans-list'
import { ProgressOverview } from '@/components/dashboard/progress-overview'
import { NudgeCard } from '@/components/dashboard/nudge-card'
import { ImportFortWorthButton } from '@/components/plans/import-fort-worth-button'

export default async function DashboardPage() {
  console.log('[Dashboard] Loading dashboard page')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch user's plans
  const { data: plans } = await supabase
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

  // Fetch progress
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div
      className="min-h-screen bg-sandstone"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <DashboardHeader user={user} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Nudge card for overdue lessons */}
        <NudgeCard userId={user.id} />

        {/* Progress overview */}
        <ProgressOverview progress={progress || []} />

        {/* Import Fort Worth Bible Plan */}
        <ImportFortWorthButton />

        {/* Plans list */}
        <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-heading text-charcoal">Your Plans</h2>
            <a
              href="/plans/create"
              className="px-6 py-2.5 bg-olivewood hover:bg-olivewood/90 text-white font-medium rounded-md border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
            >
              + New Plan
            </a>
          </div>
          <PlansList plans={plans || []} />
        </div>
      </main>
    </div>
  )
}
