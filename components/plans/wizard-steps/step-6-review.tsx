'use client'

import { useState } from 'react'
import { ChevronLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import type { WizardFormData } from '../wizard-plan-builder'

interface StepReviewProps {
  formData: WizardFormData
  userId: string
  onBack: () => void
  onComplete: (planId: string) => void
}

export function StepReview({ formData, userId, onBack, onComplete }: StepReviewProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')

  const calculateDuration = () => {
    const totalLessons = formData.passages.length
    if (formData.scheduleType === 'daily') {
      return totalLessons === 1 ? '1 day' : `${totalLessons} days`
    } else {
      return totalLessons === 1 ? '1 week' : `${totalLessons} weeks`
    }
  }

  const getDepthLabel = () => {
    const labels = {
      simple: 'Simple (5-7 min)',
      moderate: 'Moderate (10-12 min)',
      deep: 'Deep (15-20 min)'
    }
    return labels[formData.depthLevel]
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    setProgress({ current: 0, total: formData.passages.length })

    try {
      // Step 1: Create the plan
      const createResponse = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          title: formData.title,
          description: formData.description,
          theme: formData.aiCategory || null,
          source: 'ai-theme',
          references: formData.passages,
          scheduleType: formData.scheduleType,
          startDate: formData.startDate,
          depthLevel: formData.depthLevel,
          isPublic: formData.isPublic,
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create plan')
      }

      const { planId } = await createResponse.json()

      // Step 2: Generate lessons in batches
      const batchSize = 5
      let completed = 0

      while (completed < formData.passages.length) {
        const batchResponse = await fetch('/api/lessons/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            batchSize,
            depthLevel: formData.depthLevel,
            includeAudio: formData.includeAudio,
          }),
        })

        if (!batchResponse.ok) {
          throw new Error('Failed to generate lessons')
        }

        const batchResult = await batchResponse.json()
        completed = batchResult.progress.completed
        setProgress({ current: completed, total: formData.passages.length })

        // If not done, wait a bit before next check
        if (!batchResult.completed) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          break
        }
      }

      // Success! Navigate to the plan
      onComplete(planId)
    } catch (err) {
      console.error('Plan generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create plan')
      setGenerating(false)
    }
  }

  if (generating) {
    const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

    return (
      <div className="text-center py-12">
        <div className="inline-block mb-6">
          <Loader2 className="w-16 h-16 text-golden-wheat animate-spin" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-charcoal mb-2">
          Building Your Plan...
        </h2>
        <p className="text-charcoal/70 font-sans mb-6">
          Generating AI-powered lessons for each passage
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="h-3 bg-clay-rose/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-olivewood to-golden-wheat transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-charcoal/60 font-sans mt-2">
            {progress.current} of {progress.total} lessons generated
          </p>
        </div>

        <p className="text-xs text-charcoal/50 font-sans">
          This may take a minute or two. Please don't close this page.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 font-heading mb-2">
              Generation Failed
            </h3>
            <p className="text-red-700 font-sans text-sm mb-4">{error}</p>
            <button
              onClick={handleGenerate}
              className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-sans font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-charcoal/60 hover:text-charcoal font-sans text-sm transition-colors"
          >
            ← Go back and make changes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-2">
          Review Your Plan
        </h2>
        <p className="text-charcoal/70 font-sans text-sm">
          Double-check everything looks good before generating
        </p>
      </div>

      {/* Plan Summary */}
      <div className="bg-gradient-to-r from-golden-wheat/10 via-olivewood/10 to-golden-wheat/10 rounded-xl p-6 border-2 border-golden-wheat/30">
        <h3 className="text-2xl font-heading font-bold text-charcoal mb-3">
          {formData.title}
        </h3>
        <p className="text-charcoal/80 font-sans leading-relaxed mb-4">
          {formData.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm font-sans">
          <div>
            <span className="text-charcoal/60">Lessons:</span>
            <span className="ml-2 font-semibold text-charcoal">{formData.passages.length}</span>
          </div>
          <div>
            <span className="text-charcoal/60">Duration:</span>
            <span className="ml-2 font-semibold text-charcoal">{calculateDuration()}</span>
          </div>
          <div>
            <span className="text-charcoal/60">Frequency:</span>
            <span className="ml-2 font-semibold text-charcoal capitalize">{formData.scheduleType}</span>
          </div>
          <div>
            <span className="text-charcoal/60">Depth:</span>
            <span className="ml-2 font-semibold text-charcoal">{getDepthLabel()}</span>
          </div>
          <div>
            <span className="text-charcoal/60">Start Date:</span>
            <span className="ml-2 font-semibold text-charcoal">
              {new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-charcoal/60">Visibility:</span>
            <span className="ml-2 font-semibold text-charcoal capitalize">{formData.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>
      </div>

      {/* Passages List */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 font-sans">
          Bible Passages ({formData.passages.length})
        </h3>
        <div className="bg-white rounded-lg border border-olivewood/20 max-h-64 overflow-y-auto">
          {formData.passages.map((passage, idx) => (
            <div
              key={idx}
              className={`
                flex items-center gap-3 px-4 py-3 font-sans text-charcoal
                ${idx !== formData.passages.length - 1 ? 'border-b border-clay-rose/10' : ''}
              `}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-olivewood/20 text-olivewood flex items-center justify-center text-xs font-semibold">
                {idx + 1}
              </span>
              <span>{passage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Info */}
      <div className="bg-olivewood/10 rounded-lg p-4 border border-olivewood/30">
        <div className="flex items-start gap-2">
          <Check className="w-5 h-5 text-olivewood flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-charcoal font-sans text-sm mb-1">
              Ready to Generate
            </h3>
            <p className="text-xs text-charcoal/70 font-sans">
              AI will create personalized lessons for each passage. This process may take 1-2 minutes depending on the number of lessons.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-clay-rose/20">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-olivewood/30 hover:border-olivewood/60 text-charcoal font-semibold rounded-lg transition-all font-sans"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-olivewood to-golden-wheat hover:opacity-90 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl font-sans text-lg"
        >
          <Check className="w-6 h-6" />
          Generate My Plan
        </button>
      </div>
    </div>
  )
}
