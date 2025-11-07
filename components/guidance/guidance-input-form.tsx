'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GuidanceLoadingScreen } from './guidance-loading-screen'

interface GuidanceInputFormProps {
  onSuccess?: (guidanceId: string) => void
}

export function GuidanceInputForm({ onSuccess }: GuidanceInputFormProps) {
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const charCount = situation.length
  const minChars = 10
  const maxChars = 1000
  const isValid = charCount >= minChars && charCount <= maxChars

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setError(`Please enter between ${minChars} and ${maxChars} characters`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/guidance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate guidance')
      }

      // Success - navigate to the guidance page or call success callback
      if (onSuccess) {
        onSuccess(data.guidance.id)
      } else {
        router.push(`/guidance/${data.guidance.id}`)
      }
    } catch (err: any) {
      console.error('Error generating guidance:', err)

      // Provide helpful error messages based on error type
      let errorMessage = 'Something went wrong while generating your guidance. '

      if (err.message?.includes('Unauthorized')) {
        errorMessage = 'Your session has expired. Please refresh the page and try again.'
      } else if (err.message?.includes('timeout') || err.message?.includes('timed out')) {
        errorMessage = 'The request took too long to complete. This sometimes happens during high traffic. Please try again in a moment.'
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else {
        errorMessage += 'Please try again, or rephrase your situation if the issue persists. If this continues, contact support.'
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxChars) {
      setSituation(value)
      setError(null)
    }
  }

  // Show loading screen during generation
  if (loading) {
    return <GuidanceLoadingScreen estimatedSeconds={60} />
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-lg border border-olivewood/20">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-charcoal mb-3 font-heading">
          Seek Guidance
        </h2>
        <p className="text-charcoal/70 font-sans leading-relaxed">
          Share what's on your heart, and we'll help you find relevant Scripture and personalized guidance.
          Whether you're celebrating a blessing, facing a challenge, or seeking wisdom, God's Word has
          something for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-charcoal/80 mb-3 font-sans">
            What's happening in your life? *
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={handleChange}
            rows={6}
            className="w-full px-5 py-4 bg-sandstone border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans leading-relaxed resize-none"
            placeholder="Share your thoughts, struggles, celebrations, questions, or anything you're going through..."
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-charcoal/50 font-sans">
              {charCount < minChars ? (
                <>Need at least {minChars - charCount} more characters</>
              ) : (
                <>Your situation is private and personal to you</>
              )}
            </p>
            <p
              className={`text-xs font-sans font-medium ${
                charCount > maxChars * 0.9
                  ? 'text-red-600'
                  : charCount >= minChars
                  ? 'text-olivewood'
                  : 'text-charcoal/50'
              }`}
            >
              {charCount} / {maxChars}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-md text-sm font-sans bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full px-8 py-4 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors font-sans border border-olivewood/50 shadow-sm hover:shadow"
        >
          {loading ? 'Generating Your Personal Guidance...' : 'Get Guidance'}
        </button>

        {loading && (
          <div className="text-center text-sm text-charcoal/60 font-sans">
            <p className="mb-2">This usually takes 1-2 minutes</p>
            <p className="text-xs text-charcoal/50">
              We're finding relevant Scripture passages and crafting personalized guidance for you
            </p>
          </div>
        )}
      </form>

      <div className="mt-8 pt-6 border-t border-olivewood/20">
        <h3 className="text-sm font-semibold text-charcoal mb-3 font-sans">Examples:</h3>
        <ul className="space-y-2 text-sm text-charcoal/70 font-sans">
          <li className="flex items-start">
            <span className="text-olivewood mr-2">•</span>
            <span>"I just found out I'm expecting my first child and feeling overwhelmed with joy and anxiety"</span>
          </li>
          <li className="flex items-start">
            <span className="text-olivewood mr-2">•</span>
            <span>"I'm struggling with loneliness after moving to a new city"</span>
          </li>
          <li className="flex items-start">
            <span className="text-olivewood mr-2">•</span>
            <span>"I got promoted at work but worried about new responsibilities"</span>
          </li>
          <li className="flex items-start">
            <span className="text-olivewood mr-2">•</span>
            <span>"Grieving the loss of my grandmother and need comfort"</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
