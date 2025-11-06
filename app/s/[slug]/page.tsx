import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WebStory } from '@/components/lessons/web-story'
import { StoryProgressTracker } from '@/components/lessons/story-progress-tracker'

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch lesson by share slug (public access)
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('share_slug', slug)
    .not('published_at', 'is', null) // Only published lessons
    .single()

  if (error || !lesson) {
    notFound()
  }

  // Get current user (optional - story is public)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <WebStory
        manifest={lesson.story_manifest_json}
        lessonId={lesson.id}
      />
      {user && <StoryProgressTracker userId={user.id} lessonId={lesson.id} />}
    </>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('passage_canonical, translation')
    .eq('share_slug', slug)
    .single()

  return {
    title: lesson ? `${lesson.passage_canonical} - Daily Devotion` : 'Daily Devotion',
    description: lesson
      ? `Read and study ${lesson.passage_canonical} from the ${lesson.translation}`
      : 'Your personal Bible study companion',
  }
}
