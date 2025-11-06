import { PassagePayload } from '@/lib/types/database'
import { ESVAdapter } from './esv-adapter'
// import { ApiBibleAdapter } from './api-bible-adapter' // Uncomment when ready to use

/**
 * Abstract interface for Bible passage providers
 * Allows swapping between ESV, NIV (API.Bible), and other translations
 */
export interface PassageAdapter {
  getPassageText(reference: string, translation: string): Promise<PassagePayload>
  getSupportedTranslations(): string[]
}

/**
 * Factory function to get the appropriate adapter based on translation
 */
export function getPassageAdapter(translation: string): PassageAdapter {
  // For now, ESV is the default and only supported translation
  // In the future, we can add API.Bible adapter for NIV and other translations
  const normalizedTranslation = translation.toUpperCase()

  switch (normalizedTranslation) {
    case 'ESV':
      return new ESVAdapter()
    // Future: case 'NIV': return new ApiBibleAdapter()
    default:
      return new ESVAdapter() // Default to ESV
  }
}
