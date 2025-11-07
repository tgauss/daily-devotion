'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GuidanceLoadingScreenProps {
  estimatedSeconds?: number
}

export function GuidanceLoadingScreen({ estimatedSeconds = 60 }: GuidanceLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      label: 'Understanding your situation',
      description: 'Reading and analyzing what you shared...',
      duration: 10,
    },
    {
      label: 'Finding relevant Scripture',
      description: 'Searching through the Bible for passages that speak to your situation...',
      duration: 15,
    },
    {
      label: 'Gathering passage texts',
      description: 'Retrieving the full text of selected passages...',
      duration: 10,
    },
    {
      label: 'Crafting your guidance',
      description: 'Writing personalized insights, reflections, and prayers...',
      duration: 25,
    },
  ]

  useEffect(() => {
    // Calculate total duration
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    const progressInterval = 100 // Update every 100ms

    let elapsed = 0
    let currentStepIndex = 0
    let stepStartTime = 0

    const timer = setInterval(() => {
      elapsed += progressInterval / 1000

      // Calculate which step we're on
      let cumulativeDuration = 0
      for (let i = 0; i < steps.length; i++) {
        cumulativeDuration += steps[i].duration
        if (elapsed < cumulativeDuration) {
          if (currentStepIndex !== i) {
            currentStepIndex = i
            stepStartTime = elapsed
            setCurrentStep(i)
          }
          break
        }
      }

      // Calculate progress percentage (cap at 95% until actually done)
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 95)
      setProgress(progressPercent)
    }, progressInterval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="fixed inset-0 bg-sandstone flex items-center justify-center z-50"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-lg rounded-lg p-8 sm:p-12 shadow-2xl border border-olivewood/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-olivewood/10 rounded-full mb-4">
              <p className="text-sm font-medium text-olivewood font-sans">Generating Your Guidance</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-heading mb-3">
              Creating Your Personal Guidance
            </h2>
            <p className="text-charcoal/60 font-sans">
              This usually takes 1-2 minutes. We're carefully selecting Scripture and crafting guidance just for you.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full h-3 bg-clay-rose/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-olivewood to-golden-wheat"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-charcoal/50 font-sans">
                {Math.round(progress)}% complete
              </p>
              <p className="text-xs text-charcoal/50 font-sans">
                ~{Math.max(0, Math.round((100 - progress) / 100 * estimatedSeconds))}s remaining
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = currentStep === index
              const isCompleted = currentStep > index

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                    isActive
                      ? 'bg-olivewood/10 border border-olivewood/30'
                      : isCompleted
                      ? 'bg-golden-wheat/10 border border-golden-wheat/30'
                      : 'bg-sandstone/30 border border-clay-rose/20'
                  }`}
                >
                  {/* Step indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <div className="w-6 h-6 bg-golden-wheat rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 bg-olivewood rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-clay-rose/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-charcoal/30 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold font-sans mb-1 ${
                        isActive
                          ? 'text-olivewood'
                          : isCompleted
                          ? 'text-golden-wheat'
                          : 'text-charcoal/50'
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-sm font-sans ${
                        isActive ? 'text-charcoal/80' : 'text-charcoal/50'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Footer message */}
          <div className="mt-8 text-center">
            <p className="text-sm text-charcoal/60 font-sans italic">
              "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
