import { PassageAdapter } from './passage-adapter'
import { PassagePayload } from '@/lib/types/database'

/**
 * API.Bible adapter for NIV and other commercial translations
 *
 * To use this adapter:
 * 1. Sign up for API.Bible at https://scripture.api.bible/
 * 2. Get your API key and add it to .env.local as API_BIBLE_KEY
 * 3. Ensure you have proper licensing for commercial translations (NIV, etc.)
 * 4. Uncomment the implementation below
 * 5. Add case 'NIV': return new ApiBibleAdapter() to getPassageAdapter() in passage-adapter.ts
 */

export class ApiBibleAdapter implements PassageAdapter {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.scripture.api.bible/v1'
  private readonly bibleIds: Record<string, string> = {
    // Add Bible IDs from API.Bible documentation
    // 'NIV': 'bible-id-for-niv',
    // 'NASB': 'bible-id-for-nasb',
  }

  constructor() {
    this.apiKey = process.env.API_BIBLE_KEY || ''
    if (!this.apiKey) {
      throw new Error('API_BIBLE_KEY is not configured')
    }
  }

  getSupportedTranslations(): string[] {
    return Object.keys(this.bibleIds)
  }

  async getPassageText(reference: string, translation: string): Promise<PassagePayload> {
    const bibleId = this.bibleIds[translation.toUpperCase()]
    if (!bibleId) {
      throw new Error(`Translation ${translation} not supported by ApiBibleAdapter`)
    }

    // TODO: Implement API.Bible integration
    // 1. Parse reference to API.Bible format
    // 2. Call passages endpoint
    // 3. Format response to PassagePayload

    throw new Error('ApiBibleAdapter not yet implemented. Coming soon!')
  }
}
