import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { GuidanceInputForm } from '@/components/guidance/guidance-input-form'
import { GuidanceHistory } from '@/components/guidance/guidance-history'

export const metadata = {
  title: 'Guidance Guide | Daily Devotion',
  description: 'Seek personalized spiritual guidance based on your life situation',
}

export default async function GuidancePage() {
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

  // Fetch initial guidance history (first page)
  const { data: guidanceHistory } = await supabase
    .from('spiritual_guidance')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

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
      <DashboardHeader user={user} profile={profile} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Hero section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal font-heading mb-4">
            Guidance Guide
          </h1>
          <p className="text-lg text-charcoal/70 font-sans max-w-2xl mx-auto leading-relaxed">
            Share what's on your heart, and we'll help you find relevant Scripture passages
            and personalized spiritual guidance tailored to your situation.
          </p>
        </div>

        {/* Input form */}
        <GuidanceInputForm />

        {/* History section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-lg border border-olivewood/20">
          <h2 className="text-3xl font-heading text-charcoal mb-6">Your Guidance History</h2>
          <p className="text-charcoal/70 font-sans mb-6">
            Review past guidance and see how God's Word has spoken to your journey.
          </p>
          <GuidanceHistory initialGuidance={guidanceHistory || []} />
        </div>
      </main>
    </div>
  )
}
