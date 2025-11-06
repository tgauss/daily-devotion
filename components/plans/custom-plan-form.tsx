'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CustomPlanFormProps {
  userId: string
  onBack: () => void
}

export function CustomPlanForm({ userId, onBack }: CustomPlanFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState('')
  const [references, setReferences] = useState([''])
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addReference = () => {
    setReferences([...references, ''])
  }

  const updateReference = (index: number, value: string) => {
    const newReferences = [...references]
    newReferences[index] = value
    setReferences(newReferences)
  }

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const filteredReferences = references.filter((ref) => ref.trim() !== '')

      if (filteredReferences.length === 0) {
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
          source: 'custom',
          references: filteredReferences,
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

      <h2 className="text-3xl font-bold text-charcoal mb-8 font-heading">Create Custom Plan</h2>

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
            placeholder="My Bible Study Plan"
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
            Bible References *
          </label>
          <div className="space-y-4">
            {references.map((ref, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => updateReference(index, e.target.value)}
                  className="flex-1 px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans"
                  placeholder="e.g., John 3:16, Genesis 1-2, Psalm 23"
                />
                {references.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
                    className="px-5 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded-lg transition-colors font-sans"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addReference}
            className="mt-4 px-5 py-3 bg-sandstone hover:bg-clay-rose/30 text-charcoal border border-olivewood/30 rounded-lg transition-colors font-sans"
          >
            + Add Reference
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-semibold rounded-md transition-colors font-sans border border-olivewood/50"
        >
          {loading ? 'Creating Plan...' : 'Create Plan'}
        </button>
      </form>
    </div>
  )
}
