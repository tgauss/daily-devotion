import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { LibraryPlanPreview } from '@/components/library/library-plan-preview'

interface LibraryPlanPageProps {
  params: {
    id: string
  }
}

export default async function LibraryPlanPage({ params }: LibraryPlanPageProps) {
  const { id } = await params // Await params in Next.js 15+
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?redirect=/library/${id}`)
  }

  // Get public plan
  const { data: plan, error } = await serviceSupabase
    .from('plans')
    .select(`
      *,
      plan_library_stats (
        participant_count,
        completion_count
      ),
      plan_items (
        id
      )
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-sandstone flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">Plan Not Found</h1>
          <p className="text-charcoal/70 font-sans mb-6">
            This plan doesn't exist or is no longer public.
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

  return <LibraryPlanPreview plan={plan as any} userId={user.id} />
}
