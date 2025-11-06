'use client'

import { QuizQuestion as QuizQuestionType } from '@/lib/types/database'

interface QuizQuestionProps {
  question: QuizQuestionType
  questionNumber: number
  selectedAnswer?: string
  onAnswer: (answer: string) => void
}

export function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onAnswer,
}: QuizQuestionProps) {
  return (
    <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
      <h2 className="text-xl font-sans font-medium text-charcoal mb-6 leading-relaxed">
        {questionNumber}. {question.q}
      </h2>

      <div className="space-y-3">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === choice

          return (
            <button
              key={idx}
              onClick={() => onAnswer(choice)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-golden-wheat bg-golden-wheat/20 shadow-sm'
                  : 'border-olivewood/20 bg-white/50 hover:bg-clay-rose/10 hover:border-clay-rose/30'
              }`}
            >
              <span className="text-charcoal font-sans">{choice}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
