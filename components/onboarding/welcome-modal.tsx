'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

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
          <div className="flex justify-center mb-6">
            <Image
              src="/my-daily-break-logo.png"
              alt="MyDailyBread Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
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
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-olivewood/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-olivewood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Fort Worth Bible Plan</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Our featured plan with 244 readings covering the Gospel, Early Church letters, and Prophets.
                  Click "Add to My Reading Plans" to get started instantly.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-golden-wheat/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-golden-wheat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
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
            Each reading includes rich, AI-generated content designed to deepen your understanding:
          </p>
          <div className="space-y-3">
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">Scripture Passage</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Read the day's passage in an immersive, story-like format with audio narration
              </p>
            </div>
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">Reflection & Insights</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Discover deeper meaning with thoughtful commentary and historical context
              </p>
            </div>
            <div className="bg-sandstone/50 rounded-lg p-4 border border-olivewood/20">
              <p className="font-semibold text-charcoal mb-2 font-sans">Interactive Quiz</p>
              <p className="text-sm text-charcoal/70 font-sans">
                Test your understanding and reinforce key lessons
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Seek Personalized Guidance',
      content: (
        <div className="space-y-4">
          <p className="text-charcoal/80 font-sans">
            Get spiritual direction whenever you need it with our Guidance Guide feature:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-olivewood/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-olivewood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Share Your Situation</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Describe what's on your heart — celebrating, struggling, seeking wisdom, or making a decision
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-golden-wheat/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-golden-wheat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Receive Scripture-Based Guidance</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  AI finds relevant passages and provides personalized spiritual insights tailored to your situation
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-rose/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-clay-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Private & Secure</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Your guidance history is completely private and accessible anytime you need to reflect
                </p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Track Your Progress',
      content: (
        <div className="space-y-4">
          <p className="text-charcoal/80 font-sans">
            Stay motivated with progress tracking and helpful features:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-olivewood/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-olivewood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Visual Progress</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  See your completion percentage, time spent, and quiz scores on your dashboard
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-golden-wheat/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-golden-wheat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Gentle Reminders</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Get friendly nudges for overdue readings to keep you on track
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-rose/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-clay-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal font-sans">Share Plans</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  Study together by sharing your public plans with friends and family
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
