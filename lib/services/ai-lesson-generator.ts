import OpenAI from 'openai'
import { LessonContentInput, LessonContentOutput } from '@/lib/types/database'

const SYSTEM_PROMPT = `You generate lesson content for Bible study plans. Be concise, accurate, and pastoral without being preachy. Use friendly, conversational, encouraging, practical language. Never alter the meaning of the text.

Your role is to help readers:
1. Preview what they're about to read
2. Understand the context BEFORE reading (historical and narrative background)
3. Grasp the main message with practical application
4. Take one actionable step
5. Remember key insights and reflect personally
6. Test their understanding

Keep content scannable and mobile-friendly. Avoid long paragraphs - prefer 2-3 sentences max per paragraph.

CRITICAL REQUIREMENT: You MUST generate between 3 and 5 quiz questions (no fewer, no more). This is mandatory.

Always be accurate to the source text. Never invent verses or misrepresent scripture.`

const USER_PROMPT_TEMPLATE = `Generate lesson content for the following Bible passage:

**Translation:** {translation}
**References:** {references}
**Plan Theme:** {theme}

**Passage Text:**
{passage_text}

Generate a JSON response with the following structure:
{
  "intro": "One short paragraph (2-3 sentences) previewing what the reader is about to study",
  "context": "3-5 sentences combining historical background AND how this passage connects to the broader biblical narrative. This prepares the reader BEFORE they read the passage.",
  "body": "1-2 short paragraphs (2-3 sentences each) that clearly explain the main message with practical application",
  "conclusion": "1 short paragraph (2-3 sentences) with a single, concrete actionable step",
  "key_takeaways": ["bullet point 1", "bullet point 2", "bullet point 3", "...3-5 bullets total"],
  "reflection_prompts": ["open-ended personal question 1", "open-ended personal question 2", "2-3 total"],
  "quiz": [
    {
      "q": "Question text",
      "choices": ["Choice A text", "Choice B text", "Choice C text", "Choice D text"],
      "answer": "Choice B text",
      "explanation": "Explanation with verse reference"
    },
    "...3-5 quiz questions total"
  ]
}

CRITICAL FORMATTING REQUIREMENTS:
- Intro: 2-3 sentences max (preview)
- Context: 3-5 sentences (historical + narrative combined)
- Body: 1-2 paragraphs, each 2-3 sentences (message + application)
- Conclusion: 2-3 sentences (one actionable step)
- Takeaways: 3-5 bullet points (concise)
- Reflection: 2-3 personal questions
- Quiz: EXACTLY 3-5 questions with 4 choices each

CRITICAL QUIZ FORMATTING:
- Generate EXACTLY 3-5 quiz questions (not fewer, not more)
- Each question must have exactly 4 choices (full text, not just letters)
- The "answer" field must be the EXACT TEXT of one of the choices (not "A", "B", "C", or "D")
- Example: if choices are ["Jesus wept", "Jesus laughed", "Jesus danced", "Jesus sang"], answer must be "Jesus wept" (not "A")
- Include specific verse references in quiz explanations

Important guidelines:
- Keep everything scannable and mobile-friendly
- Be warm, encouraging, and practical
- Make quiz questions test understanding, not just recall
- Ensure context is accurate and helps understanding
- Connect passages to God's redemptive story`

export class AILessonGenerator {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async generateLessonContent(input: LessonContentInput): Promise<LessonContentOutput> {
    try {
      const userPrompt = this.buildUserPrompt(input)

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2500
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content generated from OpenAI')
      }

      const parsed = JSON.parse(content) as LessonContentOutput

      // Debug logging
      console.log(`[AI] Generated ${parsed.quiz?.length || 0} quiz questions`)
      if (parsed.quiz && parsed.quiz.length > 0) {
        console.log(`[AI] First quiz question:`, {
          choices: parsed.quiz[0].choices,
          answer: parsed.quiz[0].answer
        })
      }

      // Fix quiz answers if they're letters instead of full text
      if (parsed.quiz) {
        for (const question of parsed.quiz) {
          const answer = question.answer
          // Check if answer is a single letter (A, B, C, or D)
          if (answer && answer.length === 1 && /^[A-D]$/i.test(answer)) {
            const index = answer.toUpperCase().charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
            if (index >= 0 && index < question.choices.length) {
              question.answer = question.choices[index]
              console.log(`[AI] Fixed quiz answer from "${answer}" to "${question.answer}"`)
            }
          }
        }
      }

      // Validate the response structure
      this.validateLessonContent(parsed)

      return parsed
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate lesson content: ${error.message}`)
      }
      throw new Error('Failed to generate lesson content: Unknown error')
    }
  }

  private buildUserPrompt(input: LessonContentInput): string {
    let prompt = USER_PROMPT_TEMPLATE
      .replace('{translation}', input.translation)
      .replace('{references}', input.references.join(', '))
      .replace('{theme}', input.plan_theme || 'General Bible Study')
      .replace('{passage_text}', input.passage_text)

    if (input.audience_notes) {
      prompt += `\n\n**Audience Notes:** ${input.audience_notes}`
    }

    return prompt
  }

  private validateLessonContent(content: any): asserts content is LessonContentOutput {
    const required = [
      'intro',
      'body',
      'conclusion',
      'context',
      'key_takeaways',
      'reflection_prompts',
      'quiz'
    ]

    for (const field of required) {
      if (!(field in content)) {
        throw new Error(`Missing required field in lesson content: ${field}`)
      }
    }

    // Context is now a string (combined historical + narrative)
    if (typeof content.context !== 'string' || content.context.length === 0) {
      throw new Error('Context must be a non-empty string combining historical and narrative background')
    }

    if (content.key_takeaways.length < 3 || content.key_takeaways.length > 5) {
      throw new Error('key_takeaways must have 3-5 items')
    }

    if (content.reflection_prompts.length < 2 || content.reflection_prompts.length > 3) {
      throw new Error('reflection_prompts must have 2-3 items')
    }

    if (content.quiz.length < 3 || content.quiz.length > 5) {
      throw new Error('quiz must have 3-5 questions')
    }

    // Validate each quiz question
    for (const question of content.quiz) {
      if (!question.q || !question.choices || !question.answer || !question.explanation) {
        throw new Error('Each quiz question must have q, choices, answer, and explanation')
      }
      if (question.choices.length !== 4) {
        throw new Error('Each quiz question must have exactly 4 choices')
      }
      if (!question.choices.includes(question.answer)) {
        throw new Error('Quiz answer must be one of the choices')
      }
    }
  }
}

// Singleton instance for reuse
let aiGenerator: AILessonGenerator | null = null

export function getAILessonGenerator(): AILessonGenerator {
  if (!aiGenerator) {
    aiGenerator = new AILessonGenerator()
  }
  return aiGenerator
}
