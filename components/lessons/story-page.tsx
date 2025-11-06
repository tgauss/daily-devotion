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
    case 'passage':
      return (
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-950 mb-6 text-center">
            {page.content.title}
          </h2>
          <div className="text-base md:text-lg text-stone-800 leading-relaxed font-serif bg-white/50 p-6 rounded-sm border border-amber-200 shadow-sm">
            {page.content.text}
          </div>
          <p className="mt-6 text-center text-amber-700/60 text-sm font-serif italic">
            The Holy Bible, English Standard Version
          </p>
        </div>
      )

    case 'cover':
      return (
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-amber-950 mb-8 leading-tight">
            {page.content.title}
          </h1>
          {page.content.text && (
            <p className="text-2xl md:text-3xl text-amber-800 font-serif font-light">
              {page.content.text}
            </p>
          )}
          <p className="mt-12 text-amber-700/60 text-sm font-serif">Tap or press → to continue</p>
        </div>
      )

    case 'content':
      return (
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mb-8">
            {page.content.title}
          </h2>
          <div className="text-lg md:text-xl text-stone-800 leading-relaxed space-y-4 font-serif">
            {page.content.text?.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      )

    case 'takeaways':
      return (
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mb-8">
            {page.content.title}
          </h2>
          <ul className="space-y-4">
            {page.content.bullets?.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start text-lg md:text-xl text-stone-800 leading-relaxed font-serif"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-sm bg-amber-200/60 border border-amber-300 flex items-center justify-center mr-4 mt-1">
                  <span className="text-amber-900 font-semibold font-serif">{idx + 1}</span>
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
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 mb-6">
            {page.content.title}
          </h2>
          {page.content.text && (
            <p className="text-xl md:text-2xl text-stone-800 mb-12 leading-relaxed font-serif">
              {page.content.text}
            </p>
          )}
          {page.content.cta && (
            <Link
              href={page.content.cta.href}
              className="inline-block px-12 py-4 bg-amber-700 hover:bg-amber-800 text-white text-xl font-semibold font-serif rounded-sm border border-amber-900 transition-all shadow-md"
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
