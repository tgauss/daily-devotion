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

export interface Lesson {
  id: string
  plan_item_id: string
  passage_canonical: string
  passage_text: string | null
  translation: string
  ai_triptych_json: AiTriptych
  story_manifest_json: StoryManifest
  quiz_json: QuizQuestion[]
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
