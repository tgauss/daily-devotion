import OpenAI from 'openai'
import {
  GuidanceSuggestionInput,
  GuidanceSuggestionOutput,
  GuidanceGenerationInput,
  GuidanceGenerationOutput,
  PassageSuggestion,
} from '@/lib/types/database'

/**
 * Spiritual Guidance Generator Service
 * Uses OpenAI GPT-4 to suggest relevant Bible passages and generate compassionate guidance
 */
export class SpiritualGuidanceGenerator {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Step 1: Suggest relevant Bible passages based on user's situation
   */
  async suggestPassages(input: GuidanceSuggestionInput): Promise<GuidanceSuggestionOutput> {
    const systemPrompt = `You are a compassionate spiritual guide with deep knowledge of Scripture.

Your task is to suggest 3-5 Bible passages that are relevant to someone's life situation.

Guidelines:
- Be empathetic and understanding
- Consider passages that offer comfort, wisdom, direction, or hope
- Include both Old and New Testament when appropriate
- Vary the types: psalms, teachings, narratives, prophecy
- Explain why each passage is relevant in 1-2 sentences
- Default to ESV translation

For celebrations: Include passages of thanksgiving, joy, blessing
For struggles: Include passages of comfort, strength, perseverance
For questions: Include passages of wisdom, direction, trust
For grief: Include passages of comfort, hope, God's presence

Be specific and thoughtful. The user is trusting you with something personal.`

    const userPrompt = `The user is going through this:

"${input.situation}"

Please suggest 3-5 Bible passages that would be meaningful for this situation.

Return your response as JSON in this exact format:
{
  "passages": [
    {
      "reference": "Psalm 23:1-6",
      "relevance": "This psalm offers comfort and reassurance of God's presence during difficult times",
      "translation": "ESV"
    },
    ...
  ]
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const parsed = JSON.parse(content) as { passages: Omit<PassageSuggestion, 'text'>[] }

      // Return passages without text (will be fetched from ESV API)
      return {
        passages: parsed.passages.map((p) => ({
          ...p,
          text: '', // Will be filled by ESV API
        })),
      }
    } catch (error) {
      console.error('Error suggesting passages:', error)
      throw new Error('Failed to suggest passages from AI')
    }
  }

  /**
   * Step 2: Generate compassionate guidance based on situation and passages
   */
  async generateGuidance(input: GuidanceGenerationInput): Promise<GuidanceGenerationOutput> {
    const systemPrompt = `You are a compassionate spiritual counselor and guide. Your role is to provide loving, Scripture-grounded guidance to someone going through a life situation.

Your writing should be:
- Warm and empathetic (acknowledge their feelings)
- Pastoral without being preachy
- Honest about struggles (don't minimize pain)
- Grounded in Scripture (connect Bible to life)
- Practical and actionable
- Hopeful and encouraging
- Personal (write to "you", not "one should")

Avoid:
- Clichés or trite religious phrases
- Judgment or condemnation
- Platitudes that minimize real pain
- Overly theological language
- Making promises God didn't make

Remember: This is personal and private. They've trusted you with something vulnerable.`

    // Build passage context
    const passagesContext = input.passages
      .map((p, i) => {
        return `
Passage ${i + 1}: ${p.reference}
Why it's relevant: ${p.relevance}

Text:
${p.text}
`
      })
      .join('\n---\n')

    const userPrompt = `The user shared this situation:

"${input.situation}"

I've selected these relevant Bible passages for them:

${passagesContext}

Please generate compassionate spiritual guidance with these sections:

1. **Opening** (2-3 sentences)
   - Acknowledge their situation with empathy
   - Affirm they're not alone

2. **Scriptural Insights** (one paragraph per passage, ${input.passages.length} total)
   - Connect each passage specifically to their situation
   - Draw out hope, comfort, wisdom, or direction
   - Be concrete, not abstract

3. **Reflections** (3-5 bullet points)
   - Practical applications
   - Thought-provoking questions
   - Small, doable action steps

4. **Prayer Points** (3-4 bullet points)
   - Specific to their situation
   - Grounded in the Scripture passages
   - Both requests and thanksgiving

5. **Encouragement** (2-3 sentences)
   - Hopeful and forward-looking
   - Remind them of God's character
   - Leave them strengthened

Return as JSON:
{
  "opening": "...",
  "scriptural_insights": ["insight for passage 1", "insight for passage 2", ...],
  "reflections": ["reflection 1", "reflection 2", ...],
  "prayer_points": ["prayer 1", "prayer 2", ...],
  "encouragement": "..."
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8, // Slightly higher for warmth and personality
        max_tokens: 3000,
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const parsed = JSON.parse(content)

      return {
        guidance_content: {
          opening: parsed.opening,
          scriptural_insights: parsed.scriptural_insights,
          reflections: parsed.reflections,
          prayer_points: parsed.prayer_points,
          encouragement: parsed.encouragement,
        },
      }
    } catch (error) {
      console.error('Error generating guidance:', error)
      throw new Error('Failed to generate guidance from AI')
    }
  }
}

// Singleton instance
let spiritualGuidanceGenerator: SpiritualGuidanceGenerator | null = null

export function getSpiritualGuidanceGenerator(): SpiritualGuidanceGenerator {
  if (!spiritualGuidanceGenerator) {
    spiritualGuidanceGenerator = new SpiritualGuidanceGenerator()
  }
  return spiritualGuidanceGenerator
}
