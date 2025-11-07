export type ScheduleType = 'daily' | 'weekly'
export type PlanSource = 'guided' | 'custom' | 'import' | 'ai-theme'
export type PlanItemStatus = 'pending' | 'ready' | 'published'

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  user_id: string
  title: string
  description: string | null
  schedule_type: ScheduleType
  source: PlanSource
  theme: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PlanItem {
  id: string
  plan_id: string
  index: number
  date_target: string | null
  references_text: string[]
  category: string | null
  translation: string
  status: PlanItemStatus
  created_at: string
}

export interface AiTriptych {
  intro: string
  body: string
  conclusion: string
  context: string
  key_takeaways: string[]
  reflection_prompts: string[]
}

export interface QuizQuestion {
  q: string
  choices: string[]
  answer: string
  explanation: string
}

export interface StoryPage {
  type: 'cover' | 'content' | 'takeaways' | 'cta' | 'passage'
  content: {
    title?: string
    text?: string
    bullets?: string[]
    cta?: {
      text: string
      href: string
    }
  }
}

export interface StoryManifest {
  pages: StoryPage[]
  metadata: {
    title: string
    reference: string
    translation: string
  }
}

export interface AudioPageMetadata {
  pageIndex: number
  pageType: 'cover' | 'passage' | 'content' | 'takeaways' | 'cta'
  audioUrl: string
  duration: number  // Duration in seconds
  fileSize: number  // File size in bytes
  textHash: string  // MD5 hash of narrated text for cache validation
}

export interface AudioManifest {
  version: string  // Format version (e.g., "1.0")
  generated_at: string  // ISO timestamp
  teaching_voice_id: string  // ElevenLabs voice ID for teaching content
  scripture_voice_id: string  // ElevenLabs voice ID for scripture passages
  pages: AudioPageMetadata[]
}

export interface Lesson {
  id: string
  plan_item_id: string
  passage_canonical: string
  passage_text: string | null
  translation: string
  ai_triptych_json: AiTriptych
  story_manifest_json: StoryManifest
  quiz_json: QuizQuestion[]
  audio_manifest_json: AudioManifest | null
  share_slug: string
  published_at: string | null
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string | null
  quiz_score: number | null
  time_spent_sec: number | null
  created_at: string
}

export type NudgeType = 'overdue' | 'reminder' | 'encouragement'

export interface Nudge {
  id: string
  user_id: string
  type: NudgeType
  last_shown_at: string | null
  created_at: string
}

// Passage API Types
export interface PassagePayload {
  reference: string
  canonical: string
  text: string
  translation: string
}

// AI Service Types
export interface LessonContentInput {
  translation: string
  references: string[]
  passage_text: string
  plan_theme?: string
  audience_notes?: string
}

export interface LessonContentOutput extends AiTriptych {
  quiz: QuizQuestion[]
}

// Spiritual Guidance (Guidance Guide) Types
export interface PassageSuggestion {
  reference: string  // e.g., "Psalm 23:1-6"
  text: string  // Full passage text from ESV API
  relevance: string  // Why this passage is relevant (AI-generated, 1-2 sentences)
  translation: string  // e.g., "ESV"
}

export interface GuidanceContent {
  opening: string  // Empathetic acknowledgment (2-3 sentences)
  scriptural_insights: string[]  // One insight per passage, connecting to situation
  reflections: string[]  // 3-5 practical applications, questions, or action steps
  prayer_points: string[]  // 3-4 specific prayers grounded in Scripture
  encouragement: string  // Hopeful closing (2-3 sentences)
}

export interface SpiritualGuidance {
  id: string
  user_id: string
  situation_text: string  // User's input (max 500 chars)
  passages: PassageSuggestion[]  // AI-suggested passages (3-5 typically)
  guidance_content: GuidanceContent  // AI-generated guidance
  created_at: string
  updated_at: string
}

// AI Service Input/Output Types for Guidance Guide
export interface GuidanceSuggestionInput {
  situation: string
}

export interface GuidanceSuggestionOutput {
  passages: PassageSuggestion[]  // Without full text yet
}

export interface GuidanceGenerationInput {
  situation: string
  passages: PassageSuggestion[]  // With full text from ESV API
}

export interface GuidanceGenerationOutput {
  guidance_content: GuidanceContent
}
