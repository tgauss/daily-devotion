import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PlansList } from '@/components/dashboard/plans-list'
import { ProgressOverview } from '@/components/dashboard/progress-overview'
import { NudgeCard } from '@/components/dashboard/nudge-card'
import { ImportFortWorthButton } from '@/components/plans/import-fort-worth-button'

export default async function DashboardPage() {
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
      className="min-h-screen bg-[#f5f1e8]"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <DashboardHeader user={user} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Nudge card for overdue lessons */}
        <NudgeCard userId={user.id} />

        {/* Progress overview */}
        <ProgressOverview progress={progress || []} />

        {/* Import Fort Worth Bible Plan */}
        <ImportFortWorthButton />

        {/* Plans list */}
        <div className="bg-white/80 rounded-sm p-6 shadow-md border border-amber-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Your Study Plans</h2>
            <a
              href="/plans/create"
              className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
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
