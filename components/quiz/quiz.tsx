'use client'

import { useState } from 'react'
import { QuizQuestion as QuizQuestionType } from '@/lib/types/database'
import { QuizQuestion } from './quiz-question'
import { QuizResults } from './quiz-results'

interface QuizProps {
  lesson: any
  userId: string
  existingProgress: any
}

export function Quiz({ lesson, userId, existingProgress }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const questions: QuizQuestionType[] = lesson.quiz_json
  const planTitle = lesson.plan_items?.plans?.title || 'Bible Study'

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // Calculate score
      let correctCount = 0
      questions.forEach((q, idx) => {
        if (answers[idx] === q.answer) {
          correctCount++
        }
      })

      const score = Math.round((correctCount / questions.length) * 100)

      // Save quiz results
      const response = await fetch('/api/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId: lesson.id,
          score,
        }),
      })

      if (!response.ok) throw new Error('Failed to save quiz results')

      setShowResults(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (existingProgress && existingProgress.quiz_score !== null && !showResults) {
    return (
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <div className="text-center">
          <h2 className="text-3xl font-heading text-charcoal mb-4">You've Already Reflected on This</h2>
          <p className="text-olivewood mb-6 font-sans">
            You scored {existingProgress.quiz_score}% on this reflection. Well done!
          </p>
          <button
            onClick={() => setShowResults(true)}
            className="px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white font-medium rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
          >
            Review Your Responses
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const correctCount = questions.filter((q, idx) => answers[idx] === q.answer).length
    const score = Math.round((correctCount / questions.length) * 100)

    return (
      <QuizResults
        questions={questions}
        answers={answers}
        score={score}
        planTitle={planTitle}
        passage={lesson.passage_canonical}
      />
    )
  }

  const allAnswered = questions.every((_, idx) => answers[idx] !== undefined)
  const currentAnswer = answers[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg border border-olivewood/20">
        <h1 className="text-2xl font-heading text-charcoal mb-2">{planTitle}</h1>
        <p className="text-olivewood font-sans">{lesson.passage_canonical}</p>
        <p className="text-sm text-clay-rose mt-3 italic font-sans">A little reflection goes a long way</p>
      </div>

      {/* Progress */}
      <div className="bg-white/90 rounded-lg p-4 shadow-lg border border-olivewood/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-charcoal text-sm font-sans">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-olivewood text-sm font-sans">
            {currentQuestion < questions.length - 1
              ? "You're making great progress"
              : "You're almost through"}
          </span>
        </div>
        <div className="h-2.5 bg-sandstone rounded-full overflow-hidden border border-olivewood/10">
          <div
            className="h-full bg-gradient-to-r from-olivewood to-golden-wheat transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuizQuestion
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        selectedAnswer={currentAnswer}
        onAnswer={(answer) => handleAnswer(currentQuestion, answer)}
      />

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-clay-rose/20 hover:bg-clay-rose/30 disabled:opacity-50 disabled:cursor-not-allowed text-charcoal rounded-lg border border-clay-rose/40 transition-all font-sans"
        >
          ← Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 px-6 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 disabled:cursor-not-allowed text-white font-medium rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 px-6 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 disabled:cursor-not-allowed text-white font-medium rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
          >
            {submitting ? 'Submitting...' : 'Complete Reflection'}
          </button>
        )}
      </div>
    </div>
  )
}
