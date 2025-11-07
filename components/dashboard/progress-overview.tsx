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
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-olivewood/10 to-olivewood/5 rounded-lg border border-olivewood/20">
        <div>
          <p className="text-xs text-charcoal/60 font-sans uppercase tracking-wide mb-1">Readings</p>
          <p className="text-3xl font-heading text-charcoal">{totalCompleted}</p>
        </div>
        <svg className="w-10 h-10 text-olivewood/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-golden-wheat/10 to-golden-wheat/5 rounded-lg border border-golden-wheat/20">
        <div>
          <p className="text-xs text-charcoal/60 font-sans uppercase tracking-wide mb-1">Time Spent</p>
          <p className="text-3xl font-heading text-charcoal">{formatTime(totalTimeSpent)}</p>
        </div>
        <svg className="w-10 h-10 text-golden-wheat/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-clay-rose/10 to-clay-rose/5 rounded-lg border border-clay-rose/20">
        <div>
          <p className="text-xs text-charcoal/60 font-sans uppercase tracking-wide mb-1">Quiz Average</p>
          <p className="text-3xl font-heading text-charcoal">{Math.round(averageQuizScore)}%</p>
        </div>
        <svg className="w-10 h-10 text-clay-rose/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
    </div>
  )
}
