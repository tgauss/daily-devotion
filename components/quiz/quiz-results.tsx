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
      <div className="bg-white/80 rounded-sm p-8 shadow-md border border-amber-300">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-950 mb-4 font-serif">Quiz Complete!</h1>
          <div className="text-7xl font-bold text-amber-800 mb-2 font-serif">{score}%</div>
          <p className="text-xl text-stone-700 mb-6 font-serif">
            You got {correctCount} out of {questions.length} correct
          </p>
          <p className="text-stone-600 font-serif">
            {score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep studying!'}
          </p>
        </div>
      </div>

      {/* Review answers */}
      <div className="bg-white/80 rounded-sm p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-950 mb-6 font-serif">Review Your Answers</h2>

        <div className="space-y-6">
          {questions.map((question, idx) => {
            const userAnswer = answers[idx]
            const isCorrect = userAnswer === question.answer

            return (
              <div
                key={idx}
                className={`p-6 rounded-sm border-2 ${
                  isCorrect
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-stone-300 bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-lg font-serif ${
                      isCorrect ? 'bg-amber-700 text-white' : 'bg-stone-600 text-white'
                    }`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-950 mb-2 font-serif">
                      {idx + 1}. {question.q}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-stone-700 font-serif">
                        <span className="font-medium">Your answer:</span>{' '}
                        <span className={isCorrect ? 'text-amber-800' : 'text-stone-600'}>
                          {userAnswer}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-stone-700 font-serif">
                          <span className="font-medium">Correct answer:</span>{' '}
                          <span className="text-amber-800">{question.answer}</span>
                        </p>
                      )}
                      <p className="text-stone-600 mt-3 leading-relaxed font-serif">{question.explanation}</p>
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
          className="flex-1 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white text-center font-semibold rounded-sm border border-amber-900 transition-colors font-serif"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
