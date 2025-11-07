/**
 * ElevenLabs Text-to-Speech API Client
 * Handles communication with ElevenLabs API for audio generation
 */

export interface TextToSpeechOptions {
  stability?: number  // 0.0 to 1.0, default 0.5
  similarity_boost?: number  // 0.0 to 1.0, default 0.75
  style?: number  // 0.0 to 1.0, default 0.0 (disabled in v1)
  use_speaker_boost?: boolean  // default true
}

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required')
    }
  }

  /**
   * Generate speech from text using ElevenLabs API
   * @param voiceId - ElevenLabs voice ID
   * @param text - Text to convert to speech
   * @param options - Voice settings (optional)
   * @returns Audio buffer (MP3)
   */
  async textToSpeech(
    voiceId: string,
    text: string,
    options: TextToSpeechOptions = {}
  ): Promise<Buffer> {
    const {
      stability = 0.5,
      similarity_boost = 0.75,
      style = 0,
      use_speaker_boost = true,
    } = options

    const url = `${this.baseUrl}/text-to-speech/${voiceId}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `ElevenLabs API error (${response.status}): ${errorText}`
        )
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate speech: ${error.message}`)
      }
      throw new Error('Failed to generate speech: Unknown error')
    }
  }

  /**
   * Get voice information
   * @param voiceId - ElevenLabs voice ID
   */
  async getVoice(voiceId: string): Promise<any> {
    const url = `${this.baseUrl}/voices/${voiceId}`

    try {
      const response = await fetch(url, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get voice info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get voice: ${error.message}`)
      }
      throw new Error('Failed to get voice: Unknown error')
    }
  }

  /**
   * Get remaining character quota
   */
  async getQuota(): Promise<{
    character_count: number
    character_limit: number
    can_extend_character_limit: boolean
  }> {
    const url = `${this.baseUrl}/user`

    try {
      const response = await fetch(url, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get quota: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        character_count: data.subscription.character_count,
        character_limit: data.subscription.character_limit,
        can_extend_character_limit: data.subscription.can_extend_character_limit,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get quota: ${error.message}`)
      }
      throw new Error('Failed to get quota: Unknown error')
    }
  }
}

// Singleton instance for reuse
let elevenLabsClient: ElevenLabsClient | null = null

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    elevenLabsClient = new ElevenLabsClient()
  }
  return elevenLabsClient
}
