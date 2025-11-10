import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { JoinPlanView } from '@/components/library/join-plan-view'

interface JoinPageProps {
  params: {
    token: string
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?redirect=/join/${params.token}`)
  }

  // Get share link info
  const { data: shareLink, error } = await serviceSupabase
    .from('plan_shares')
    .select(`
      *,
      plans (
        id,
        title,
        description,
        theme,
        depth_level,
        schedule_type,
        created_by_name
      )
    `)
    .eq('token', params.token)
    .single()

  if (error || !shareLink) {
    return (
      <div className="min-h-screen bg-sandstone flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">Invalid Link</h1>
          <p className="text-charcoal/70 font-sans mb-6">
            This invite link is invalid or has been removed.
          </p>
          <a
            href="/library"
            className="inline-block px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white rounded-lg font-sans font-semibold transition-colors"
          >
            Browse Plan Library
          </a>
        </div>
      </div>
    )
  }

  // Check if expired
  const isExpired = new Date(shareLink.expires_at) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-screen bg-sandstone flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">Link Expired</h1>
          <p className="text-charcoal/70 font-sans mb-6">
            This invite link has expired. Please ask for a new link.
          </p>
          <a
            href="/library"
            className="inline-block px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white rounded-lg font-sans font-semibold transition-colors"
          >
            Browse Plan Library
          </a>
        </div>
      </div>
    )
  }

  return <JoinPlanView shareLink={shareLink as any} token={params.token} userId={user.id} />
}
