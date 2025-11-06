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
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-charcoal mb-8 text-center">
            {page.content.title}
          </h2>
          <div className="text-base md:text-lg text-charcoal leading-loose font-serif italic bg-white/60 p-8 md:p-10 rounded-lg border border-clay-rose/30 shadow-md">
            {page.content.text}
          </div>
          <p className="mt-8 text-center text-charcoal/50 text-sm font-serif italic">
            The Holy Bible, English Standard Version
          </p>
        </div>
      )

    case 'cover':
      return (
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-charcoal mb-12 leading-tight">
            {page.content.title}
          </h1>
          {page.content.text && (
            <p className="text-2xl md:text-3xl text-olivewood font-sans font-light leading-relaxed">
              {page.content.text}
            </p>
          )}
          <p className="mt-16 text-charcoal/40 text-sm font-sans">Tap or press → to continue</p>
        </div>
      )

    case 'content':
      return (
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-10">
            {page.content.title}
          </h2>
          <div className="text-lg md:text-xl text-charcoal leading-relaxed space-y-6 font-sans">
            {page.content.text?.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      )

    case 'takeaways':
      return (
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-10">
            {page.content.title}
          </h2>
          <ul className="space-y-6">
            {page.content.bullets?.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start text-lg md:text-xl text-charcoal leading-relaxed font-sans"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-golden-wheat/40 border border-golden-wheat flex items-center justify-center mr-5 mt-1">
                  <span className="text-charcoal font-semibold font-sans text-sm">{idx + 1}</span>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'cta':
      return (
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-8">
            {page.content.title}
          </h2>
          {page.content.text && (
            <p className="text-xl md:text-2xl text-charcoal mb-14 leading-relaxed font-sans">
              {page.content.text}
            </p>
          )}
          {page.content.cta && (
            <Link
              href={page.content.cta.href}
              className="inline-block px-12 py-4 bg-olivewood hover:bg-olivewood/90 text-white text-xl font-semibold font-sans rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {page.content.cta.text}
            </Link>
          )}
        </div>
      )

    default:
      return (
        <div className="max-w-2xl mx-auto px-8 text-center">
          <p className="text-charcoal">Unknown page type</p>
        </div>
      )
  }
}
