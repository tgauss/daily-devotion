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
            className="text-olivewood hover:text-golden-wheat transition-colors font-sans"
          >
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-heading text-charcoal mt-6 mb-3">Create a Plan</h1>
          <p className="text-lg text-charcoal/70 font-sans">
            Choose how you'd like to structure your daily practice
          </p>
        </div>

        <PlanCreator userId={user.id} />
      </div>
    </div>
  )
}
