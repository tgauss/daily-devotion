'use client'

import { Progress } from '@/lib/types/database'

interface ProgressOverviewProps {
  progress: any[]
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  const totalCompleted = progress.filter((p) => p.completed_at).length
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent_sec || 0), 0)
  const averageQuizScore = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / progress.length
    : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white/90 rounded-lg p-6 shadow-md border border-olivewood/20">
        <p className="text-sm text-charcoal/60 mb-2 font-sans">Readings Completed</p>
        <p className="text-4xl font-heading text-charcoal">{totalCompleted}</p>
      </div>

      <div className="bg-white/90 rounded-lg p-6 shadow-md border border-olivewood/20">
        <p className="text-sm text-charcoal/60 mb-2 font-sans">Time Spent</p>
        <p className="text-4xl font-heading text-charcoal">{formatTime(totalTimeSpent)}</p>
      </div>

      <div className="bg-white/90 rounded-lg p-6 shadow-md border border-olivewood/20">
        <p className="text-sm text-charcoal/60 mb-2 font-sans">Quiz Average</p>
        <p className="text-4xl font-heading text-golden-wheat">{Math.round(averageQuizScore)}%</p>
      </div>
    </div>
  )
}
