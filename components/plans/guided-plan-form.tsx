'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GuidedPlanFormProps {
  userId: string
  onBack: () => void
}

const GUIDED_PLANS = [
  {
    id: 'gospels-30',
    title: 'Read the Gospels in 30 Days',
    description: 'Journey through Matthew, Mark, Luke, and John',
    theme: 'Life of Jesus',
    references: [
      'Matthew 1-4', 'Matthew 5-7', 'Matthew 8-10', 'Matthew 11-13', 'Matthew 14-17',
      'Matthew 18-20', 'Matthew 21-23', 'Matthew 24-28', 'Mark 1-4', 'Mark 5-8',
      'Mark 9-12', 'Mark 13-16', 'Luke 1-3', 'Luke 4-6', 'Luke 7-9',
      'Luke 10-12', 'Luke 13-15', 'Luke 16-18', 'Luke 19-21', 'Luke 22-24',
      'John 1-3', 'John 4-6', 'John 7-9', 'John 10-12', 'John 13-15',
      'John 16-18', 'John 19-21', 'Acts 1-2', 'Acts 3-5', 'Acts 6-8'
    ]
  },
  {
    id: 'psalms-12weeks',
    title: 'Psalms in 12 Weeks',
    description: 'Daily readings through the book of Psalms',
    theme: 'Prayer and Worship',
    references: [
      'Psalm 1-5', 'Psalm 6-10', 'Psalm 11-15', 'Psalm 16-20', 'Psalm 21-25',
      'Psalm 26-30', 'Psalm 31-35', 'Psalm 36-40', 'Psalm 41-45', 'Psalm 46-50',
      'Psalm 51-55', 'Psalm 56-60', 'Psalm 61-65', 'Psalm 66-70', 'Psalm 71-75',
      // Add more...
    ]
  },
  {
    id: 'proverbs-31',
    title: 'Proverbs - A Chapter a Day',
    description: 'One chapter per day for a month of wisdom',
    theme: 'Wisdom',
    references: Array.from({ length: 31 }, (_, i) => `Proverbs ${i + 1}`)
  },
  {
    id: 'genesis-creation',
    title: 'Genesis: In the Beginning',
    description: 'Explore the creation and foundations of faith',
    theme: 'Creation and Covenant',
    references: [
      'Genesis 1-2', 'Genesis 3-5', 'Genesis 6-9', 'Genesis 10-12', 'Genesis 13-15',
      'Genesis 16-18', 'Genesis 19-21', 'Genesis 22-24', 'Genesis 25-27', 'Genesis 28-30',
      'Genesis 31-33', 'Genesis 34-36', 'Genesis 37-39', 'Genesis 40-42', 'Genesis 43-45',
      'Genesis 46-50'
    ]
  }
]

export function GuidedPlanForm({ userId, onBack }: GuidedPlanFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    setLoading(true)

    try {
      const plan = GUIDED_PLANS.find((p) => p.id === selectedPlan)
      if (!plan) return

      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: plan.title,
          description: plan.description,
          theme: plan.theme,
          source: 'guided',
          references: plan.references,
          scheduleType: 'daily',
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

      <h2 className="text-3xl font-bold text-charcoal mb-8 font-heading">Choose a Guided Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {GUIDED_PLANS.map((plan) => (
          <label
            key={plan.id}
            className={`block p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-olivewood bg-golden-wheat/20 shadow-lg'
                : 'border-olivewood/20 bg-white/50 hover:bg-sandstone/30 hover:border-olivewood/30'
            }`}
          >
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={selectedPlan === plan.id}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="sr-only"
            />
            <h3 className="text-xl font-semibold text-charcoal mb-3 font-heading">{plan.title}</h3>
            <p className="text-charcoal/70 text-sm mb-3 font-sans leading-relaxed">{plan.description}</p>
            <p className="text-olivewood text-sm font-sans font-medium">{plan.references.length} lessons</p>
          </label>
        ))}

        <button
          type="submit"
          disabled={!selectedPlan || loading}
          className="w-full px-8 py-4 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-semibold rounded-md transition-colors font-sans border border-olivewood/50"
        >
          {loading ? 'Creating Plan...' : 'Create Plan'}
        </button>
      </form>
    </div>
  )
}
