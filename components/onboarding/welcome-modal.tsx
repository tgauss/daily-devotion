'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface WelcomeModalProps {
  firstName?: string | null
  userEmail: string
}

export function WelcomeModal({ firstName, userEmail }: WelcomeModalProps) {
  const displayName = firstName || userEmail.split('@')[0]
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    {
      title: 'Welcome to MyDailyBread',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-charcoal/80 font-sans">
            We're delighted to have you here, <span className="font-semibold text-olivewood">{displayName}</span>!
          </p>
          <p className="text-charcoal/70 font-sans">
            MyDailyBread is your personal companion for daily Bible reading and spiritual growth.
            Let's take a quick tour to help you get started.
          </p>
          <div className="bg-clay-rose/10 border border-clay-rose/30 rounded-lg p-4 mt-6">
            <p className="text-sm text-charcoal/70 font-sans italic">
              "Man shall not live by bread alone, but by every word that comes from the mouth of God."
            </p>
            <p className="text-xs text-charcoal/50 font-sans mt-2">— Matthew 4:4</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Your Reading Plan',
      content: (
        <div className="space-y-4">
          <p className="text-charcoal/80 font-sans">
            Start your journey with a structured reading plan:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-golden-wheat text-xl">📖</span>
              <div>
                <p className="font-semibold text-charcoal font-sans">Fort Worth Bible Plan</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Our featured plan with 244 readings covering the Gospel, Early Church letters, and Prophets.
                  Click "Add to My Reading Plans" to get started instantly!
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-golden-wheat text-xl">✨</span>
              <div>
                <p className="font-semibold text-charcoal font-sans">Create Your Own</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Design a custom plan tailored to your spiritual goals and schedule.
                </p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Your Daily Reading Experience',
      content: (
        <div className="space-y-4">
          <p className="text-charcoal/80 font-sans">
            Each reading includes rich, AI-generated content:
          </p>
          <div className="space-y-3">
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">📜 Scripture Passage</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Read the day's passage in an immersive, story-like format
              </p>
            </div>
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">💡 Reflection & Insights</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Discover deeper meaning with thoughtful commentary and historical context
              </p>
            </div>
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">✅ Interactive Quiz</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Test your understanding and reinforce key lessons
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Track Your Progress',
      content: (
        <div className="space-y-4">
          <p className="text-charcoal/80 font-sans">
            Stay motivated with progress tracking and nudges:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-golden-wheat text-xl">📊</span>
              <div>
                <p className="font-semibold text-charcoal font-sans">Visual Progress</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  See your completion percentage and streak on your dashboard
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-golden-wheat text-xl">🔔</span>
              <div>
                <p className="font-semibold text-charcoal font-sans">Gentle Reminders</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Get friendly nudges for overdue readings to keep you on track
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-golden-wheat text-xl">👥</span>
              <div>
                <p className="font-semibold text-charcoal font-sans">Share Plans</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Study together! Share your public plans with friends and family
                </p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Ready to Begin?',
      content: (
        <div className="space-y-6 text-center">
          <p className="text-lg text-charcoal/80 font-sans">
            You're all set to start your daily Bible reading journey!
          </p>
          <div className="bg-gradient-to-br from-olivewood/10 to-golden-wheat/10 border border-olivewood/30 rounded-lg p-6">
            <p className="text-charcoal/70 font-sans mb-4">
              We recommend starting with the <span className="font-semibold text-olivewood">Fort Worth Bible Plan</span> for
              a comprehensive reading experience.
            </p>
            <p className="text-sm text-charcoal/60 font-sans italic">
              "A little reflection goes a long way"
            </p>
          </div>
          <p className="text-sm text-charcoal/60 font-sans">
            Click "Get Started" to close this guide and begin your first reading!
          </p>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-olivewood to-golden-wheat p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-heading text-white pr-8">
            {currentStepData.title}
          </h2>
          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-white'
                    : index < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-olivewood/20 p-6 flex items-center justify-between bg-sandstone/30">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-olivewood hover:text-golden-wheat disabled:text-charcoal/30 disabled:cursor-not-allowed font-sans font-medium transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-charcoal/60 font-sans">
            {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-olivewood hover:bg-olivewood/90 text-white font-medium rounded-md transition-all shadow-sm hover:shadow font-sans"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
