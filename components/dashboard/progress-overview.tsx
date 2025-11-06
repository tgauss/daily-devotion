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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <p className="text-sm text-white/60 mb-1">Lessons Completed</p>
        <p className="text-4xl font-bold text-white">{totalCompleted}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <p className="text-sm text-white/60 mb-1">Time Spent</p>
        <p className="text-4xl font-bold text-white">{formatTime(totalTimeSpent)}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <p className="text-sm text-white/60 mb-1">Avg Quiz Score</p>
        <p className="text-4xl font-bold text-white">{Math.round(averageQuizScore)}%</p>
      </div>
    </div>
  )
}
