'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X, Edit2 } from 'lucide-react'
import type { WizardFormData } from '../wizard-plan-builder'

interface StepRefineProps {
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepRefine({ formData, updateFormData, onNext, onBack }: StepRefineProps) {
  const [newPassage, setNewPassage] = useState('')
  const [error, setError] = useState('')

  const handleAddPassage = () => {
    const trimmed = newPassage.trim()
    if (trimmed) {
      updateFormData({
        passages: [...formData.passages, trimmed]
      })
      setNewPassage('')
    }
  }

  const handleRemovePassage = (index: number) => {
    const updated = formData.passages.filter((_, i) => i !== index)
    updateFormData({ passages: updated })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Please provide a title for your plan')
      return
    }

    if (formData.passages.length === 0) {
      setError('Please add at least one Bible passage')
      return
    }

    setError('')
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-2">
          Refine Your Plan
        </h2>
        <p className="text-charcoal/70 font-sans text-sm">
          Customize the title, description, and passages to perfectly match your needs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-sans text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Plan Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g., Genesis: Foundations for Modern Life"
          className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Brief overview of what learners will discover..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
          required
        />
      </div>

      {/* Passages */}
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Bible Passages * ({formData.passages.length})
        </label>

        {/* Passage List */}
        <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
          {formData.passages.map((passage, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-sandstone/30 rounded-lg px-4 py-3 border border-olivewood/20"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-olivewood/20 text-olivewood flex items-center justify-center text-sm font-semibold font-sans">
                {idx + 1}
              </span>
              <span className="flex-1 font-sans text-charcoal">{passage}</span>
              <button
                type="button"
                onClick={() => handleRemovePassage(idx)}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Remove passage"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Passage */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPassage}
            onChange={(e) => setNewPassage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddPassage()
              }
            }}
            placeholder="e.g., Genesis 1:1-31"
            className="flex-1 px-4 py-2 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
          />
          <button
            type="button"
            onClick={handleAddPassage}
            className="flex items-center gap-2 px-4 py-2 bg-olivewood/10 hover:bg-olivewood/20 text-olivewood border-2 border-olivewood/30 rounded-lg transition-colors font-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-charcoal/60 font-sans">
          Add, remove, or reorder passages to customize your study plan
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-golden-wheat/10 rounded-lg p-4 border border-golden-wheat/30">
        <div className="flex items-start gap-2">
          <Edit2 className="w-5 h-5 text-golden-wheat flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-charcoal font-sans text-sm mb-1">
              Customize Your Plan
            </h3>
            <p className="text-xs text-charcoal/70 font-sans">
              Feel free to modify the AI suggestions. You can change the title, description, add or remove passages, and reorder them to match your study goals.
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
