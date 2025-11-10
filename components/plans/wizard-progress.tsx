'use client'

import { Check } from 'lucide-react'

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

const STEP_LABELS = [
  'Theme',
  'AI Suggests',
  'Refine',
  'Schedule',
  'Sharing',
  'Review'
]

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="mb-8 sm:mb-12">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-clay-rose/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-olivewood to-golden-wheat transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Dots */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          const isPending = step > currentStep

          return (
            <div key={step} className="flex flex-col items-center gap-2">
              {/* Dot */}
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 font-sans font-semibold text-sm
                  ${isCompleted
                    ? 'bg-olivewood text-white shadow-md'
                    : isCurrent
                    ? 'bg-golden-wheat text-white shadow-lg scale-110'
                    : 'bg-clay-rose/20 text-charcoal/40'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs font-sans hidden sm:block
                  ${isCurrent ? 'text-charcoal font-semibold' : 'text-charcoal/60'}
                `}
              >
                {STEP_LABELS[step - 1]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
