import { PassageAdapter } from './passage-adapter'
import { PassagePayload } from '@/lib/types/database'

interface ESVApiResponse {
  query: string
  canonical: string
  parsed: number[][]
  passage_meta: Array<{
    canonical: string
    chapter_start: number[]
    chapter_end: number[]
    prev_verse: number
    next_verse: number
    prev_chapter: number[]
    next_chapter: number[]
  }>
  passages: string[]
}

export class ESVAdapter implements PassageAdapter {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.esv.org/v3/passage/text/'

  constructor() {
    this.apiKey = process.env.ESV_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('ESV_API_KEY is not configured')
    }
  }

  getSupportedTranslations(): string[] {
    return ['ESV']
  }

  async getPassageText(reference: string, translation: string = 'ESV'): Promise<PassagePayload> {
    if (translation.toUpperCase() !== 'ESV') {
      throw new Error(`ESVAdapter only supports ESV translation, got: ${translation}`)
    }

    try {
      const url = new URL(this.baseUrl)
      url.searchParams.append('q', reference)
      url.searchParams.append('include-passage-references', 'true')
      url.searchParams.append('include-verse-numbers', 'true')
      url.searchParams.append('include-first-verse-numbers', 'true')
      url.searchParams.append('include-footnotes', 'false')
      url.searchParams.append('include-footnote-body', 'false')
      url.searchParams.append('include-headings', 'true')
      url.searchParams.append('include-short-copyright', 'true')
      url.searchParams.append('include-passage-horizontal-lines', 'false')
      url.searchParams.append('include-heading-horizontal-lines', 'false')

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
        // Cache for 24 hours to respect API limits
        next: { revalidate: 86400 }
      })

      if (!response.ok) {
        throw new Error(`ESV API error: ${response.status} ${response.statusText}`)
      }

      const data: ESVApiResponse = await response.json()

      if (!data.passages || data.passages.length === 0) {
        throw new Error(`No passages found for reference: ${reference}`)
      }

      // Combine all passages (for cases where multiple passages are returned)
      const text = data.passages.join('\n\n')

      return {
        reference: data.query,
        canonical: data.canonical,
        text: text.trim(),
        translation: 'ESV'
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ESV passage: ${error.message}`)
      }
      throw new Error('Failed to fetch ESV passage: Unknown error')
    }
  }
}
