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
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">
        {questionNumber}. {question.q}
      </h2>

      <div className="space-y-3">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === choice

          return (
            <button
              key={idx}
              onClick={() => onAnswer(choice)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-400 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-white font-medium">{choice}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
