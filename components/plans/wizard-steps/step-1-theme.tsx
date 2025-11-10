'use client'

import { useState } from 'react'
import { Lightbulb, ChevronRight } from 'lucide-react'
import type { WizardFormData } from '../wizard-plan-builder'

interface StepThemeProps {
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  onNext: () => void
}

export function StepTheme({ formData, updateFormData, onNext }: StepThemeProps) {
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.theme.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)')
      return
    }

    setError('')
    onNext()
  }

  const exampleThemes = [
    'Genesis and its application to modern life',
    'Psalms of comfort during difficult times',
    'Jesus\' parables and their meaning today',
    'The life and teachings of the Apostle Paul',
    'Understanding the book of Revelation',
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-2">
          What would you like to learn?
        </h2>
        <p className="text-charcoal/70 font-sans text-sm sm:text-base">
          Describe your learning goal or topic of interest. Be as specific as you'd like!
        </p>
      </div>

      {/* Theme Input */}
      <div>
        <label htmlFor="theme" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Learning Theme *
        </label>
        <textarea
          id="theme"
          value={formData.theme}
          onChange={(e) => {
            updateFormData({ theme: e.target.value })
            setError('')
          }}
          placeholder="e.g., I want to understand Genesis and how it applies to modern life..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
          required
        />
        {error && <p className="mt-2 text-sm text-red-600 font-sans">{error}</p>}
      </div>

      {/* Book Context (Optional) */}
      <div>
        <label htmlFor="bookContext" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Specific Book or Topic (Optional)
        </label>
        <input
          id="bookContext"
          type="text"
          value={formData.bookContext || ''}
          onChange={(e) => updateFormData({ bookContext: e.target.value })}
          placeholder="e.g., Genesis chapters 1-11, Psalms on anxiety, Gospel of John..."
          className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
        />
        <p className="mt-2 text-xs text-charcoal/60 font-sans">
          Narrow down to a specific book, chapters, or topic for more focused suggestions
        </p>
      </div>

      {/* Examples */}
      <div className="bg-golden-wheat/10 rounded-lg p-4 border border-golden-wheat/30">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-golden-wheat flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-charcoal font-sans text-sm">Example Themes</h3>
            <p className="text-xs text-charcoal/70 font-sans">Click any example to use it</p>
          </div>
        </div>
        <div className="space-y-2">
          {exampleThemes.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => updateFormData({ theme: example })}
              className="w-full text-left px-3 py-2 rounded-md bg-white/80 hover:bg-white border border-olivewood/20 hover:border-olivewood/40 transition-colors text-sm font-sans text-charcoal"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg font-sans"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
