import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GuidanceViewer } from '@/components/guidance/guidance-viewer'
import Link from 'next/link'

interface GuidancePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: GuidancePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      title: 'Guidance | Daily Devotion',
    }
  }

  const { data: guidance } = await supabase
    .from('spiritual_guidance')
    .select('situation_text')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!guidance) {
    return {
      title: 'Guidance Not Found | Daily Devotion',
    }
  }

  const truncated = guidance.situation_text.substring(0, 60) + '...'

  return {
    title: `${truncated} | Guidance Guide`,
    description: 'Your personalized spiritual guidance',
  }
}

export default async function GuidancePage({ params }: GuidancePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the specific guidance
  const { data: guidance, error } = await supabase
    .from('spiritual_guidance')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Ensure ownership
    .single()

  if (error || !guidance) {
    notFound()
  }

  return (
    <div className="relative">
      {/* Back button - fixed at top */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/guidance"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-charcoal rounded-lg border border-olivewood/30 shadow-lg transition-all font-sans text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Guidance
        </Link>
      </div>

      {/* Guidance viewer */}
      <GuidanceViewer guidance={guidance} />
    </div>
  )
}
