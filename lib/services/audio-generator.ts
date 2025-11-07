import { StoryManifest, StoryPage, AudioManifest, AudioPageMetadata } from '@/lib/types/database'
import { getElevenLabsClient } from './elevenlabs-client'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const TEACHING_VOICE_ID = 'v9I7auPeR1xGKYRPwQGG'
const SCRIPTURE_VOICE_ID = 'ppLqTilh7rH7fbUVlXsf'
const AUDIO_BUCKET = 'lesson-audio'

/**
 * Audio Generator Service
 * Generates audio narration for lesson pages using ElevenLabs TTS
 */
export class AudioGenerator {
  private elevenLabsClient = getElevenLabsClient()
  private supabaseClient: ReturnType<typeof createClient>

  constructor() {
    // Use service role client for storage uploads
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing for audio generator')
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  /**
   * Generate audio for all pages in a lesson
   */
  async generateAudioForLesson(
    lessonId: string,
    storyManifest: StoryManifest
  ): Promise<AudioManifest> {
    const audioPages: AudioPageMetadata[] = []

    for (let i = 0; i < storyManifest.pages.length; i++) {
      const page = storyManifest.pages[i]

      try {
        const audioMetadata = await this.generateAudioForPage(
          lessonId,
          page,
          i
        )
        audioPages.push(audioMetadata)
      } catch (error) {
        console.error(`Failed to generate audio for page ${i}:`, error)
        throw new Error(`Audio generation failed for page ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      version: '1.0',
      generated_at: new Date().toISOString(),
      teaching_voice_id: TEACHING_VOICE_ID,
      scripture_voice_id: SCRIPTURE_VOICE_ID,
      pages: audioPages,
    }
  }

  /**
   * Generate audio for a single page
   */
  private async generateAudioForPage(
    lessonId: string,
    page: StoryPage,
    pageIndex: number
  ): Promise<AudioPageMetadata> {
    // Extract narratable text from page
    const narratableText = this.extractNarratableText(page)

    // Select voice based on page type
    const voiceId = page.type === 'passage' ? SCRIPTURE_VOICE_ID : TEACHING_VOICE_ID

    // Generate text hash for cache validation
    const textHash = this.hashText(narratableText)

    // Generate audio via ElevenLabs
    const audioBuffer = await this.elevenLabsClient.textToSpeech(
      voiceId,
      narratableText,
      {
        stability: 0.5,
        similarity_boost: 0.75,
        use_speaker_boost: true,
      }
    )

    // Upload to Supabase Storage
    const filePath = `${lessonId}/page-${pageIndex}.mp3`
    const { data: uploadData, error: uploadError } = await this.supabaseClient
      .storage
      .from(AUDIO_BUCKET)
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = this.supabaseClient
      .storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath)

    // Get audio duration (approximate based on text length and speaking rate)
    // Average speaking rate: ~150 words per minute
    const wordCount = narratableText.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60)

    return {
      pageIndex,
      pageType: page.type,
      audioUrl: urlData.publicUrl,
      duration: estimatedDuration,
      fileSize: audioBuffer.length,
      textHash,
    }
  }

  /**
   * Extract narratable text from a page based on its type
   */
  private extractNarratableText(page: StoryPage): string {
    const parts: string[] = []

    switch (page.type) {
      case 'cover':
        // Narrate title and text (reference + intro)
        if (page.content.title) {
          parts.push(page.content.title)
        }
        if (page.content.text) {
          parts.push(page.content.text)
        }
        break

      case 'passage':
        // For passages, skip the title since the passage text often includes the reference
        // Just narrate the scripture text itself
        if (page.content.text) {
          // Remove verse numbers like [1], [2] for cleaner narration
          // Also remove translation abbreviations like "ESV" or "English Standard Version"
          let cleanText = page.content.text.replace(/\[\d+\]/g, '')
          cleanText = cleanText.replace(/\s*\(?(ESV|English Standard Version)\)?\.?\s*$/i, '')
          parts.push(cleanText)
        }
        break

      case 'content':
        // Narrate title and body text
        if (page.content.title) {
          parts.push(page.content.title)
        }
        if (page.content.text) {
          parts.push(page.content.text)
        }
        break

      case 'takeaways':
        // Narrate title and bullets
        if (page.content.title) {
          parts.push(page.content.title)
        }
        if (page.content.bullets) {
          page.content.bullets.forEach((bullet, idx) => {
            // Skip empty spacers
            if (!bullet) return

            // Clean up emojis and formatting
            const cleanBullet = bullet.replace(/^(💡|🤔)\s*/, '').trim()

            // For section headers (ending with colon), just read as-is
            if (cleanBullet.endsWith(':')) {
              parts.push(cleanBullet)
            } else {
              // For regular bullets, don't add numbers (audio doesn't need them)
              parts.push(cleanBullet)
            }
          })
        }
        break

      case 'cta':
        // Narrate title and text (skip the CTA button)
        if (page.content.title) {
          parts.push(page.content.title)
        }
        if (page.content.text) {
          parts.push(page.content.text)
        }
        break

      default:
        throw new Error(`Unknown page type: ${page.type}`)
    }

    return parts.join('. ')
  }

  /**
   * Generate MD5 hash of text for cache validation
   */
  private hashText(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex')
  }
}

// Singleton instance
let audioGenerator: AudioGenerator | null = null

export function getAudioGenerator(): AudioGenerator {
  if (!audioGenerator) {
    audioGenerator = new AudioGenerator()
  }
  return audioGenerator
}
