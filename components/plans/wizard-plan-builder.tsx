'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardProgress } from './wizard-progress'
import { StepTheme } from './wizard-steps/step-1-theme'
import { StepAISuggest } from './wizard-steps/step-2-ai-suggest'
import { StepRefine } from './wizard-steps/step-3-refine'
import { StepSchedule } from './wizard-steps/step-4-schedule'
import { StepSharing } from './wizard-steps/step-5-sharing'
import { StepReview } from './wizard-steps/step-6-review'

export type DepthLevel = 'simple' | 'moderate' | 'deep'
export type ScheduleType = 'daily' | 'weekly'

export interface WizardFormData {
  // Step 1: Theme & Goals
  theme: string
  bookContext?: string

  // Step 2: AI Suggestions (populated by AI)
  aiTitle: string
  aiDescription: string
  aiPassages: string[]
  aiReasoning: string
  aiCategory?: string

  // Step 3: Refined data (user edits)
  title: string
  description: string
  passages: string[]

  // Step 4: Schedule
  startDate: string
  scheduleType: ScheduleType
  depthLevel: DepthLevel

  // Step 5: Sharing
  isPublic: boolean
  inviteMessage: string
}

const TOTAL_STEPS = 6

export function WizardPlanBuilder() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>({
    theme: '',
    bookContext: '',
    aiTitle: '',
    aiDescription: '',
    aiPassages: [],
    aiReasoning: '',
    aiCategory: '',
    title: '',
    description: '',
    passages: [],
    startDate: new Date().toISOString().split('T')[0],
    scheduleType: 'daily',
    depthLevel: 'moderate',
    isPublic: false,
    inviteMessage: '',
  })

  const updateFormData = (data: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = (planId: string) => {
    // Navigate to the newly created plan
    router.push(`/plans/${planId}`)
  }

  return (
    <div
      className="min-h-screen bg-sandstone py-8 sm:py-12 px-4"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <a
            href="/plans/create"
            className="text-olivewood hover:text-golden-wheat transition-colors font-sans inline-flex items-center gap-2 mb-4"
          >
            ← Back to Plan Options
          </a>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-charcoal mb-3">
            AI-Powered Plan Builder
          </h1>
          <p className="text-base sm:text-lg text-charcoal/70 font-sans max-w-2xl mx-auto">
            Let AI help you create a personalized Bible study plan based on what you want to learn
          </p>
        </div>

        {/* Progress Indicator */}
        <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step Content */}
        <div className="bg-white/90 rounded-xl p-6 sm:p-8 shadow-lg border border-olivewood/20 mb-6">
          {currentStep === 1 && (
            <StepTheme
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepAISuggest
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepRefine
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepSchedule
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <StepSharing
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && (
            <StepReview
              formData={formData}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-charcoal/60 font-sans">
          {currentStep === 1 && "Tell us what you'd like to learn about"}
          {currentStep === 2 && "Review AI suggestions based on your theme"}
          {currentStep === 3 && "Customize the passages and details"}
          {currentStep === 4 && "Set your reading schedule"}
          {currentStep === 5 && "Choose sharing options"}
          {currentStep === 6 && "Review and generate your plan"}
        </p>
      </div>
    </div>
  )
}
