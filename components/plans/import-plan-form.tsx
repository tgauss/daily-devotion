'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImportPlanFormProps {
  userId: string
  onBack: () => void
}

export function ImportPlanForm({ userId, onBack }: ImportPlanFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState('')
  const [referencesText, setReferencesText] = useState('')
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse references from text (one per line or comma-separated)
      const references = referencesText
        .split(/[\n,]/)
        .map((ref) => ref.trim())
        .filter((ref) => ref !== '')

      if (references.length === 0) {
        alert('Please add at least one Bible reference')
        setLoading(false)
        return
      }

      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          description,
          theme,
          source: 'import',
          references,
          scheduleType,
        }),
      })

      if (!response.ok) throw new Error('Failed to create plan')

      const data = await response.json()
      router.push(`/plans/${data.planId}`)
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Failed to create plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
      <button onClick={onBack} className="text-blue-300 hover:text-blue-200 mb-6">
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-6">Import Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Plan Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Imported Bible Plan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="What's this plan about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Theme</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., Faith, Prayer, Hope"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Schedule Type
          </label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as 'daily' | 'weekly')}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Bible References * (one per line or comma-separated)
          </label>
          <textarea
            value={referencesText}
            onChange={(e) => setReferencesText(e.target.value)}
            rows={10}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
            placeholder="John 3:16&#10;Genesis 1-2&#10;Psalm 23&#10;Matthew 5-7"
          />
          <p className="mt-2 text-sm text-white/60">
            Example formats: "John 3:16", "Genesis 1-2", "Psalm 23"
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Creating Plan...' : 'Import Plan'}
        </button>
      </form>
    </div>
  )
}
