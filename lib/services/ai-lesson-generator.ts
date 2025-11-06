import OpenAI from 'openai'
import { LessonContentInput, LessonContentOutput } from '@/lib/types/database'

const SYSTEM_PROMPT = `You generate lesson content for Bible study plans. Be concise, accurate, and pastoral without being preachy. Use friendly, conversational, encouraging, practical language. Never alter the meaning of the text.

Your role is to help readers:
1. Understand what they're about to read (Preview)
2. Grasp the main message with practical application (Message)
3. Remember key points (Recap)
4. Connect with historical and narrative context
5. Reflect and discuss deeply
6. Test their understanding

Always be accurate to the source text. Never invent verses or misrepresent scripture.`

const USER_PROMPT_TEMPLATE = `Generate lesson content for the following Bible passage:

**Translation:** {translation}
**References:** {references}
**Plan Theme:** {theme}

**Passage Text:**
{passage_text}

Generate a JSON response with the following structure:
{
  "intro": "one short paragraph previewing what the reader is about to read",
  "body": "2-3 short paragraphs that clearly explain the main message with practical application",
  "conclusion": "1 short paragraph with a single actionable step",
  "context": {
    "historical": "2-4 sentences of historical context when relevant (or null if not applicable)",
    "narrative": "2-4 sentences connecting this passage with the broader biblical narrative"
  },
  "key_takeaways": ["bullet point 1", "bullet point 2", "...up to 5 bullets"],
  "reflection_prompts": ["open-ended question 1", "open-ended question 2", "2-3 total"],
  "discussion_questions": ["question 1", "question 2", "...3-5 questions total"],
  "quiz": [
    {
      "q": "Question text",
      "choices": ["A", "B", "C", "D"],
      "answer": "B",
      "explanation": "Explanation with verse reference"
    }
  ]
}

Important guidelines:
- Keep each Web Story page scannable - avoid long paragraphs
- Be warm, encouraging, and practical
- Include specific verse references in quiz explanations
- Make quiz questions test understanding, not just recall
- Ensure historical context is accurate and relevant
- Connect passages to the broader biblical story`

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
      'discussion_questions',
      'quiz'
    ]

    for (const field of required) {
      if (!(field in content)) {
        throw new Error(`Missing required field in lesson content: ${field}`)
      }
    }

    if (!content.context.historical && !content.context.narrative) {
      throw new Error('At least one of historical or narrative context must be provided')
    }

    if (content.key_takeaways.length === 0 || content.key_takeaways.length > 5) {
      throw new Error('key_takeaways must have 1-5 items')
    }

    if (content.reflection_prompts.length < 2 || content.reflection_prompts.length > 3) {
      throw new Error('reflection_prompts must have 2-3 items')
    }

    if (content.discussion_questions.length < 3 || content.discussion_questions.length > 5) {
      throw new Error('discussion_questions must have 3-5 items')
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
