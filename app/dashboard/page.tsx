import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PlansList } from '@/components/dashboard/plans-list'
import { ProgressOverview } from '@/components/dashboard/progress-overview'
import { NudgeCard } from '@/components/dashboard/nudge-card'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <DashboardHeader user={user} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Nudge card for overdue lessons */}
        <NudgeCard userId={user.id} />

        {/* Progress overview */}
        <ProgressOverview progress={progress || []} />

        {/* Plans list */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Study Plans</h2>
            <a
              href="/plans/create"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
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
