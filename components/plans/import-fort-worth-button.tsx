'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ImportFortWorthButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

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

      // Show success message if lessons were copied
      if (result.lessonsCopied > 0) {
        setSuccessMessage(`${result.lessonsCopied} lessons pre-loaded! Redirecting...`)
        setTimeout(() => {
          router.push(`/plans/${result.planId}`)
          router.refresh()
        }, 1500)
      } else {
        router.push(`/plans/${result.planId}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-clay-rose/10 border border-clay-rose/30 rounded-lg p-6 shadow-md">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-heading text-charcoal mb-2">
            Fort Worth Bible Church 2025
          </h3>
          <p className="text-charcoal/70 mb-4 font-sans">
            Bible in a Year reading plan (Oct 30 - Dec 31, 2025)
          </p>
          <ul className="text-sm text-charcoal/60 space-y-2 font-sans">
            <li>• 4 daily readings: Gospel, Early Church, Wisdom, History & Prophets</li>
            <li>• 61 days with 244 total readings</li>
            <li>• Public plan - shareable with your study group</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm font-sans">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm font-sans">
          ✅ {successMessage}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading}
        className="px-6 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-medium rounded-md border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
      >
        {loading ? 'Importing...' : 'Import Plan'}
      </button>

      {loading && !successMessage && (
        <p className="mt-4 text-sm text-charcoal/60 font-sans">
          Setting up your 244 readings... Just a moment.
        </p>
      )}
    </div>
  )
}
