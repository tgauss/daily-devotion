import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanCreator } from '@/components/plans/plan-creator'

export default async function CreatePlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
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
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Create a Study Plan</h1>
          <p className="text-blue-200">
            Choose how you'd like to structure your Bible study journey
          </p>
        </div>

        <PlanCreator userId={user.id} />
      </div>
    </div>
  )
}
