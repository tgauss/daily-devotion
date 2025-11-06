'use client'

import { StoryPage } from '@/lib/types/database'
import Link from 'next/link'

interface StoryPageComponentProps {
  page: StoryPage
  pageNumber: number
  totalPages: number
}

export function StoryPageComponent({ page, pageNumber, totalPages }: StoryPageComponentProps) {
  switch (page.type) {
    case 'cover':
      return (
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {page.content.title}
          </h1>
          {page.content.text && (
            <p className="text-2xl md:text-3xl text-blue-200 font-light">
              {page.content.text}
            </p>
          )}
          <p className="mt-12 text-white/60 text-sm">Tap or press → to continue</p>
        </div>
      )

    case 'content':
      return (
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {page.content.title}
          </h2>
          <div className="text-lg md:text-xl text-white/90 leading-relaxed space-y-4">
            {page.content.text?.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      )

    case 'takeaways':
      return (
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {page.content.title}
          </h2>
          <ul className="space-y-4">
            {page.content.bullets?.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start text-lg md:text-xl text-white/90 leading-relaxed"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400/30 flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-200 font-semibold">{idx + 1}</span>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'cta':
      return (
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {page.content.title}
          </h2>
          {page.content.text && (
            <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed">
              {page.content.text}
            </p>
          )}
          {page.content.cta && (
            <Link
              href={page.content.cta.href}
              className="inline-block px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              {page.content.cta.text}
            </Link>
          )}
        </div>
      )

    default:
      return (
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-white">Unknown page type</p>
        </div>
      )
  }
}
