'use client'

import { ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react'
import type { WizardFormData, DepthLevel, ScheduleType } from '../wizard-plan-builder'

interface StepScheduleProps {
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

const DEPTH_LEVELS: Array<{ value: DepthLevel; label: string; description: string; duration: string }> = [
  { value: 'simple', label: 'Simple', description: 'Core concepts and key takeaways', duration: '5-7 minutes' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced study with context and application', duration: '10-12 minutes' },
  { value: 'deep', label: 'Deep', description: 'Extended reflection with historical context', duration: '15-20 minutes' },
]

export function StepSchedule({ formData, updateFormData, onNext, onBack }: StepScheduleProps) {
  const calculateEndDate = () => {
    const start = new Date(formData.startDate)
    const totalLessons = formData.passages.length
    const daysToAdd = formData.scheduleType === 'daily' ? totalLessons : totalLessons * 7

    const end = new Date(start)
    end.setDate(end.getDate() + daysToAdd)

    return end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-2">
          Set Your Schedule
        </h2>
        <p className="text-charcoal/70 font-sans text-sm">
          Choose when to start and how often you'd like to study
        </p>
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
          Start Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData({ startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-12 pr-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
            required
          />
        </div>
      </div>

      {/* Schedule Type */}
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-3 font-sans">
          Reading Frequency
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`
              relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${formData.scheduleType === 'daily'
                ? 'border-olivewood bg-olivewood/5'
                : 'border-olivewood/30 hover:border-olivewood/50 bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="scheduleType"
              value="daily"
              checked={formData.scheduleType === 'daily'}
              onChange={(e) => updateFormData({ scheduleType: e.target.value as ScheduleType })}
              className="w-5 h-5 text-olivewood focus:ring-olivewood"
            />
            <div>
              <div className="font-semibold text-charcoal font-sans">Daily</div>
              <div className="text-xs text-charcoal/60 font-sans">One lesson each day</div>
            </div>
          </label>

          <label
            className={`
              relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${formData.scheduleType === 'weekly'
                ? 'border-olivewood bg-olivewood/5'
                : 'border-olivewood/30 hover:border-olivewood/50 bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="scheduleType"
              value="weekly"
              checked={formData.scheduleType === 'weekly'}
              onChange={(e) => updateFormData({ scheduleType: e.target.value as ScheduleType })}
              className="w-5 h-5 text-olivewood focus:ring-olivewood"
            />
            <div>
              <div className="font-semibold text-charcoal font-sans">Weekly</div>
              <div className="text-xs text-charcoal/60 font-sans">One lesson each week</div>
            </div>
          </label>
        </div>
      </div>

      {/* Depth Level */}
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-3 font-sans">
          Study Depth
        </label>
        <div className="space-y-3">
          {DEPTH_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${formData.depthLevel === level.value
                  ? 'border-olivewood bg-olivewood/5'
                  : 'border-olivewood/30 hover:border-olivewood/50 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name="depthLevel"
                value={level.value}
                checked={formData.depthLevel === level.value}
                onChange={(e) => updateFormData({ depthLevel: e.target.value as DepthLevel })}
                className="mt-1 w-5 h-5 text-olivewood focus:ring-olivewood"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-charcoal font-sans">{level.label}</span>
                  <span className="text-xs text-charcoal/60 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {level.duration}
                  </span>
                </div>
                <p className="text-sm text-charcoal/70 font-sans">{level.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Audio Generation Toggle */}
      <div>
        <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-olivewood/30 hover:border-olivewood/50 bg-white cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={formData.includeAudio}
            onChange={(e) => updateFormData({ includeAudio: e.target.checked })}
            className="mt-1 w-5 h-5 text-olivewood focus:ring-olivewood rounded"
          />
          <div className="flex-1">
            <div className="font-semibold text-charcoal font-sans mb-1">
              Generate audio narration
            </div>
            <p className="text-sm text-charcoal/70 font-sans">
              Create AI-powered voiceover for each lesson page. Audio can be generated later if you prefer to start without it. <span className="text-golden-wheat font-medium">(Uses ElevenLabs credits)</span>
            </p>
          </div>
        </label>
      </div>

      {/* Summary Box */}
      <div className="bg-golden-wheat/10 rounded-lg p-4 border border-golden-wheat/30">
        <h3 className="font-semibold text-charcoal font-sans text-sm mb-3">Study Plan Summary</h3>
        <div className="space-y-2 text-sm font-sans">
          <div className="flex justify-between">
            <span className="text-charcoal/70">Total Lessons:</span>
            <span className="font-semibold text-charcoal">{formData.passages.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/70">Duration:</span>
            <span className="font-semibold text-charcoal">
              {formData.scheduleType === 'daily' ? `${formData.passages.length} days` : `${formData.passages.length} weeks`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/70">Estimated Completion:</span>
            <span className="font-semibold text-charcoal">{calculateEndDate()}</span>
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
