'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface NudgeCardProps {
  userId: string
}

export function NudgeCard({ userId }: NudgeCardProps) {
  const [overdueLesson, setOverdueLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOverdueLessons() {
      try {
        // Find plan items that are overdue
        const today = new Date().toISOString().split('T')[0]

        const { data: planItems } = await supabase
          .from('plan_items')
          .select(`
            *,
            plans!inner(user_id, title),
            lessons(id, share_slug)
          `)
          .eq('plans.user_id', userId)
          .lt('date_target', today)
          .eq('status', 'published')
          .limit(1)
          .single()

        if (planItems) {
          setOverdueLesson(planItems)
        }
      } catch (error) {
        // No overdue lessons
      } finally {
        setLoading(false)
      }
    }

    fetchOverdueLessons()
  }, [userId, supabase])

  if (loading || !overdueLesson) {
    return null
  }

  const lessonSlug = overdueLesson.lessons?.[0]?.share_slug

  return (
    <div className="bg-golden-wheat/20 rounded-lg p-6 shadow-md border border-golden-wheat/40">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-heading text-charcoal mb-2">
            You're almost there
          </h3>
          <p className="text-charcoal/70 mb-4 font-sans">
            {overdueLesson.plans.title} - {overdueLesson.references_text.join(', ')}
          </p>
          {lessonSlug && (
            <Link
              href={`/s/${lessonSlug}`}
              className="inline-block px-6 py-2.5 bg-olivewood text-white font-medium rounded-md border border-olivewood/50 hover:bg-olivewood/90 transition-all shadow-sm hover:shadow font-sans"
            >
              Continue Reading
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
