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
    <div className="bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-lg border border-olivewood/20">
      <button onClick={onBack} className="text-olivewood hover:text-olivewood/80 mb-8 font-sans transition-colors">
        ← Back
      </button>

      <h2 className="text-3xl font-bold text-charcoal mb-8 font-heading">Import Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">
            Plan Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans"
            placeholder="Imported Bible Plan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans leading-relaxed"
            placeholder="What's this plan about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">Theme</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans"
            placeholder="e.g., Faith, Prayer, Hope"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">
            Schedule Type
          </label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as 'daily' | 'weekly')}
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">
            Bible References * (one per line or comma-separated)
          </label>
          <textarea
            value={referencesText}
            onChange={(e) => setReferencesText(e.target.value)}
            rows={10}
            required
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-mono text-sm"
            placeholder="John 3:16&#10;Genesis 1-2&#10;Psalm 23&#10;Matthew 5-7"
          />
          <p className="mt-3 text-sm text-charcoal/60 font-sans">
            Example formats: "John 3:16", "Genesis 1-2", "Psalm 23"
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-semibold rounded-md transition-colors font-sans border border-olivewood/50"
        >
          {loading ? 'Creating Plan...' : 'Import Plan'}
        </button>
      </form>
    </div>
  )
}
