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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Already Completed</h2>
          <p className="text-white/80 mb-6">
            You've already taken this quiz and scored {existingProgress.quiz_score}%.
          </p>
          <button
            onClick={() => setShowResults(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">{planTitle}</h1>
        <p className="text-blue-200">{lesson.passage_canonical}</p>
      </div>

      {/* Progress */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-white/80 text-sm">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
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
          className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          ← Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
