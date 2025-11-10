'use client'

import { ChevronRight, ChevronLeft, Globe, Lock, Users } from 'lucide-react'
import type { WizardFormData } from '../wizard-plan-builder'

interface StepSharingProps {
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepSharing({ formData, updateFormData, onNext, onBack }: StepSharingProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  // Generate preview of invite message
  const getInvitePreview = () => {
    const userName = "Taylor" // This would come from auth context in real implementation
    return `${userName} is inviting you to study "${formData.title}" together!`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal mb-2">
          Sharing Settings
        </h2>
        <p className="text-charcoal/70 font-sans text-sm">
          Choose how you'd like to share this study plan with others
        </p>
      </div>

      {/* Public/Private Toggle */}
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-3 font-sans">
          Plan Visibility
        </label>
        <div className="space-y-3">
          {/* Private Option */}
          <label
            className={`
              relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${!formData.isPublic
                ? 'border-olivewood bg-olivewood/5'
                : 'border-olivewood/30 hover:border-olivewood/50 bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="visibility"
              checked={!formData.isPublic}
              onChange={() => updateFormData({ isPublic: false })}
              className="mt-1 w-5 h-5 text-olivewood focus:ring-olivewood"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-charcoal/60" />
                <span className="font-semibold text-charcoal font-sans">Private</span>
              </div>
              <p className="text-sm text-charcoal/70 font-sans">
                Only you can see this plan. You can share it via invite link later.
              </p>
            </div>
          </label>

          {/* Public Option */}
          <label
            className={`
              relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${formData.isPublic
                ? 'border-olivewood bg-olivewood/5'
                : 'border-olivewood/30 hover:border-olivewood/50 bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="visibility"
              checked={formData.isPublic}
              onChange={() => updateFormData({ isPublic: true })}
              className="mt-1 w-5 h-5 text-olivewood focus:ring-olivewood"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-charcoal/60" />
                <span className="font-semibold text-charcoal font-sans">Public</span>
              </div>
              <p className="text-sm text-charcoal/70 font-sans">
                Make this plan discoverable in the Plan Library so others can join and study along.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Invite Message Preview (only show if public) */}
      {formData.isPublic && (
        <div>
          <label htmlFor="inviteMessage" className="block text-sm font-semibold text-charcoal mb-2 font-sans">
            Custom Invite Message (Optional)
          </label>
          <textarea
            id="inviteMessage"
            value={formData.inviteMessage}
            onChange={(e) => updateFormData({ inviteMessage: e.target.value })}
            placeholder="Add a personal message to invite others (optional)..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans text-charcoal"
          />
          <p className="mt-2 text-xs text-charcoal/60 font-sans">
            This message will appear when you share an invite link
          </p>

          {/* Invite Preview */}
          <div className="mt-4 bg-golden-wheat/10 rounded-lg p-4 border border-golden-wheat/30">
            <div className="flex items-start gap-2 mb-2">
              <Users className="w-5 h-5 text-golden-wheat flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-charcoal font-sans text-sm mb-1">
                  Invite Link Preview
                </h3>
                <p className="text-xs text-charcoal/60 font-sans mb-3">
                  This is how your invite will appear to others
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal font-sans mb-2">
                {getInvitePreview()}
              </p>
              <p className="text-sm text-charcoal/80 font-sans mb-3">
                {formData.description}
              </p>
              {formData.inviteMessage && (
                <div className="bg-sandstone/50 rounded px-3 py-2 border-l-2 border-golden-wheat">
                  <p className="text-sm text-charcoal/70 font-sans italic">
                    "{formData.inviteMessage}"
                  </p>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-clay-rose/20">
                <p className="text-xs text-charcoal/60 font-sans">
                  {formData.passages.length} lessons • {formData.scheduleType === 'daily' ? 'Daily' : 'Weekly'} • {formData.depthLevel.charAt(0).toUpperCase() + formData.depthLevel.slice(1)} depth
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-olivewood/10 rounded-lg p-4 border border-olivewood/30">
        <h3 className="font-semibold text-charcoal font-sans text-sm mb-2">
          About Sharing
        </h3>
        <ul className="space-y-2 text-xs text-charcoal/70 font-sans">
          <li className="flex items-start gap-2">
            <span className="text-olivewood mt-0.5">•</span>
            <span>Public plans appear in the Plan Library for anyone to discover</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-olivewood mt-0.5">•</span>
            <span>You can generate personalized invite links anytime to share with friends</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-olivewood mt-0.5">•</span>
            <span>You can change visibility settings later from your plan page</span>
          </li>
        </ul>
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
