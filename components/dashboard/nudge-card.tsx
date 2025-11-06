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
    <div className="bg-amber-100 rounded-sm p-6 shadow-md border border-amber-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-950 mb-2 font-serif">
            You have an overdue lesson
          </h3>
          <p className="text-stone-700 mb-4 font-serif">
            {overdueLesson.plans.title} - {overdueLesson.references_text.join(', ')}
          </p>
          {lessonSlug && (
            <Link
              href={`/s/${lessonSlug}`}
              className="inline-block px-6 py-2 bg-amber-700 text-white font-semibold rounded-sm border border-amber-900 hover:bg-amber-800 transition-colors font-serif"
            >
              Continue Learning
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
