'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import type { WizardFormData } from '../wizard-plan-builder'

interface StepAISuggestProps {
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepAISuggest({ formData, updateFormData, onNext, onBack }: StepAISuggestProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)

  useEffect(() => {
    // Auto-generate on mount if not already generated
    if (!hasGenerated && !formData.aiTitle) {
      generateAIPlan()
    }
  }, [])

  const generateAIPlan = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/plans/generate-ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: formData.theme,
          bookContext: formData.bookContext,
          depthLevel: formData.depthLevel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate plan')
      }

      const data = await response.json()

      updateFormData({
        aiTitle: data.title,
        aiDescription: data.description,
        aiPassages: data.passages,
        aiReasoning: data.reasoning,
        aiCategory: data.category,
        // Pre-populate refined fields with AI suggestions
        title: data.title,
        description: data.description,
        passages: data.passages,
      })

      setHasGenerated(true)
    } catch (err) {
      console.error('AI generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate AI suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!formData.aiTitle || formData.aiPassages.length === 0) {
      setError('Please generate AI suggestions before continuing')
      return
    }
    onNext()
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block mb-6">
          <Loader2 className="w-16 h-16 text-golden-wheat animate-spin" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-charcoal mb-2">
          Analyzing your theme...
        </h2>
        <p className="text-charcoal/70 font-sans mb-4">
          AI is crafting a personalized study plan just for you
        </p>
        <div className="max-w-md mx-auto space-y-2 text-sm text-charcoal/60 font-sans">
          <p className="animate-pulse">✓ Understanding your learning goals</p>
          <p className="animate-pulse animation-delay-200">✓ Selecting relevant Bible passages</p>
          <p className="animate-pulse animation-delay-400">✓ Structuring your study plan</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 font-heading mb-2">
              Generation Failed
            </h3>
            <p className="text-red-700 font-sans text-sm mb-4">{error}</p>
            <button
              onClick={generateAIPlan}
              className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-sans font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-charcoal/60 hover:text-charcoal font-sans text-sm transition-colors"
          >
            ← Go back and revise your theme
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-golden-wheat/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-golden-wheat" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-1">
            AI Suggestions
          </h2>
          <p className="text-charcoal/70 font-sans text-sm">
            Review the AI-generated plan based on your theme
          </p>
        </div>
      </div>

      {/* AI Generated Content */}
      <div className="space-y-4">
        {/* Title */}
        <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
          <h3 className="text-xs font-semibold text-charcoal/60 uppercase tracking-wide mb-2 font-sans">
            Suggested Title
          </h3>
          <p className="text-lg font-heading font-bold text-charcoal">
            {formData.aiTitle}
          </p>
        </div>

        {/* Description */}
        <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
          <h3 className="text-xs font-semibold text-charcoal/60 uppercase tracking-wide mb-2 font-sans">
            Description
          </h3>
          <p className="text-charcoal font-sans leading-relaxed">
            {formData.aiDescription}
          </p>
        </div>

        {/* Passages */}
        <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
          <h3 className="text-xs font-semibold text-charcoal/60 uppercase tracking-wide mb-3 font-sans">
            Selected Passages ({formData.aiPassages.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {formData.aiPassages.map((passage, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white/80 rounded-md px-3 py-2 border border-olivewood/10"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-olivewood/20 text-olivewood flex items-center justify-center text-xs font-semibold font-sans">
                  {idx + 1}
                </span>
                <span className="font-sans text-charcoal">{passage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        {formData.aiReasoning && (
          <div className="bg-golden-wheat/10 rounded-lg p-4 border border-golden-wheat/30">
            <h3 className="text-xs font-semibold text-charcoal/60 uppercase tracking-wide mb-2 font-sans">
              Why These Passages?
            </h3>
            <p className="text-sm text-charcoal/80 font-sans leading-relaxed">
              {formData.aiReasoning}
            </p>
          </div>
        )}
      </div>

      {/* Regenerate Option */}
      <div className="flex items-center justify-center pt-4">
        <button
          onClick={generateAIPlan}
          disabled={loading}
          className="text-sm font-sans text-charcoal/60 hover:text-charcoal flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate suggestions
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-clay-rose/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-olivewood/30 hover:border-olivewood/60 text-charcoal font-semibold rounded-lg transition-all font-sans"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg font-sans"
        >
          Looks Great!
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
