'use client'

import { QuizQuestion } from '@/lib/types/database'
import Link from 'next/link'

interface QuizResultsProps {
  questions: QuizQuestion[]
  answers: Record<number, string>
  score: number
  planTitle: string
  passage: string
}

export function QuizResults({ questions, answers, score, planTitle, passage }: QuizResultsProps) {
  const correctCount = questions.filter((q, idx) => answers[idx] === q.answer).length

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-green-500/30">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
          <div className="text-7xl font-bold text-white mb-2">{score}%</div>
          <p className="text-xl text-white/80 mb-6">
            You got {correctCount} out of {questions.length} correct
          </p>
          <p className="text-white/70">
            {score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep studying!'}
          </p>
        </div>
      </div>

      {/* Review answers */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Review Your Answers</h2>

        <div className="space-y-6">
          {questions.map((question, idx) => {
            const userAnswer = answers[idx]
            const isCorrect = userAnswer === question.answer

            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 ${
                  isCorrect
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {idx + 1}. {question.q}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="font-medium">Your answer:</span>{' '}
                        <span className={isCorrect ? 'text-green-200' : 'text-red-200'}>
                          {userAnswer}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-white/80">
                          <span className="font-medium">Correct answer:</span>{' '}
                          <span className="text-green-200">{question.answer}</span>
                        </p>
                      )}
                      <p className="text-white/70 mt-3 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
