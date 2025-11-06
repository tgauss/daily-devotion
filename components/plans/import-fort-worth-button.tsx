'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ImportFortWorthButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleImport = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/plans/import-fort-worth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ makePublic: true }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import plan')
      }

      const result = await response.json()

      // Redirect to the newly created plan
      router.push(`/plans/${result.planId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-sm p-6 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-amber-950 mb-2 font-serif">
            Fort Worth Bible Church 2025
          </h3>
          <p className="text-stone-700 mb-3 font-serif">
            Bible in a Year reading plan (Oct 30 - Dec 31, 2025)
          </p>
          <ul className="text-sm text-stone-600 space-y-1 font-serif">
            <li>• 4 daily readings: Gospel, Early Church, Wisdom, History & Prophets</li>
            <li>• 61 days with 244 total readings</li>
            <li>• Public plan - shareable with your study group</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-800 text-sm font-serif">
          {error}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading}
        className="px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/50 text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
      >
        {loading ? 'Importing...' : 'Import Plan'}
      </button>

      {loading && (
        <p className="mt-3 text-sm text-stone-600 font-serif">
          Creating plan with 244 readings... This may take a moment.
        </p>
      )}
    </div>
  )
}
