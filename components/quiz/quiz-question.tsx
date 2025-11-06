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
    <div className="bg-white/80 rounded-sm p-8 shadow-md border border-amber-200">
      <h2 className="text-xl font-semibold text-amber-950 mb-6 font-serif">
        {questionNumber}. {question.q}
      </h2>

      <div className="space-y-3">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === choice

          return (
            <button
              key={idx}
              onClick={() => onAnswer(choice)}
              className={`w-full p-4 text-left rounded-sm border-2 transition-all ${
                isSelected
                  ? 'border-amber-700 bg-amber-100'
                  : 'border-amber-200 bg-white/50 hover:bg-amber-50'
              }`}
            >
              <span className="text-stone-800 font-medium font-serif">{choice}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
