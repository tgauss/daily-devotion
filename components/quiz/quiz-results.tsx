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

  // Warm, encouraging messages based on score
  const getEncouragingMessage = () => {
    if (score >= 90) return "Your understanding shines brightly! You've really connected with this passage."
    if (score >= 80) return "Wonderful reflection! You're growing in wisdom and understanding."
    if (score >= 70) return "You're making meaningful progress. Each step deepens your faith journey."
    if (score >= 60) return "Keep going! Every reflection brings new insights and growth."
    return "Each time you engage with Scripture, you're planting seeds of understanding. Well done!"
  }

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-golden-wheat/40">
        <div className="text-center">
          <h1 className="text-4xl font-heading text-charcoal mb-4">Reflection Complete!</h1>
          <div className="text-7xl font-heading text-golden-wheat mb-2">{score}%</div>
          <p className="text-xl text-olivewood mb-4 font-sans">
            You answered {correctCount} out of {questions.length} correctly
          </p>
          <p className="text-charcoal/80 font-sans italic max-w-md mx-auto leading-relaxed">
            {getEncouragingMessage()}
          </p>
        </div>
      </div>

      {/* Review answers */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <h2 className="text-2xl font-heading text-charcoal mb-2">Reflect on Your Responses</h2>
        <p className="text-sm text-clay-rose mb-6 italic font-sans">Growing in understanding, one question at a time</p>

        <div className="space-y-6">
          {questions.map((question, idx) => {
            const userAnswer = answers[idx]
            const isCorrect = userAnswer === question.answer

            return (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-golden-wheat/60 bg-golden-wheat/10'
                    : 'border-clay-rose/40 bg-clay-rose/5'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg font-sans ${
                      isCorrect ? 'bg-golden-wheat text-charcoal' : 'bg-clay-rose/60 text-white'
                    }`}
                  >
                    {isCorrect ? '✓' : '○'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-sans font-medium text-charcoal mb-2 leading-relaxed">
                      {idx + 1}. {question.q}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-charcoal/80 font-sans">
                        <span className="font-medium">Your response:</span>{' '}
                        <span className={isCorrect ? 'text-olivewood font-medium' : 'text-charcoal/70'}>
                          {userAnswer}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-charcoal/80 font-sans">
                          <span className="font-medium">Consider this:</span>{' '}
                          <span className="text-olivewood font-medium">{question.answer}</span>
                        </p>
                      )}
                      <p className="text-charcoal/70 mt-3 leading-relaxed font-sans border-l-2 border-clay-rose/30 pl-4 italic">
                        {question.explanation}
                      </p>
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
          className="flex-1 px-6 py-3 bg-olivewood hover:bg-olivewood/90 text-white text-center font-medium rounded-lg border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
        >
          Continue Your Journey
        </Link>
      </div>
    </div>
  )
}
