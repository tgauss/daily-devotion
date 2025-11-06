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
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-500/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            You have an overdue lesson
          </h3>
          <p className="text-white/80 mb-4">
            {overdueLesson.plans.title} - {overdueLesson.references_text.join(', ')}
          </p>
          {lessonSlug && (
            <Link
              href={`/s/${lessonSlug}`}
              className="inline-block px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Continue Learning
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
