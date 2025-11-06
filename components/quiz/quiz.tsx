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
      <div className="bg-white/80 rounded-sm p-8 shadow-md border border-amber-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-amber-950 mb-4 font-serif">Quiz Already Completed</h2>
          <p className="text-stone-700 mb-6 font-serif">
            You've already taken this quiz and scored {existingProgress.quiz_score}%.
          </p>
          <button
            onClick={() => setShowResults(true)}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
          >
            Review Answers
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
      <div className="bg-white/80 rounded-sm p-6 shadow-md border border-amber-200">
        <h1 className="text-2xl font-bold text-amber-950 mb-2 font-serif">{planTitle}</h1>
        <p className="text-amber-700 font-serif">{lesson.passage_canonical}</p>
      </div>

      {/* Progress */}
      <div className="bg-white/80 rounded-sm p-4 shadow-md border border-amber-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-stone-700 text-sm font-serif">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-stone-700 text-sm font-serif">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="h-2 bg-amber-100 rounded-sm overflow-hidden border border-amber-200">
          <div
            className="h-full bg-amber-700 transition-all"
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
          className="px-6 py-3 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-amber-900 rounded-sm border border-amber-300 transition-colors font-serif"
        >
          ← Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/50 disabled:cursor-not-allowed text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/50 disabled:cursor-not-allowed text-white font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
