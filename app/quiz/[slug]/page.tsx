import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import { Quiz } from '@/components/quiz/quiz'

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user (required for quiz)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch lesson by share slug using service client to avoid RLS issues with nested queries
  // (lesson might be from a public plan owned by another user)
  const serviceClient = createServiceClient()
  const { data: lesson, error } = await serviceClient
    .from('lessons')
    .select('*, plan_items(*, plans(title))')
    .eq('share_slug', slug)
    .single()

  if (error || !lesson) {
    console.error(`[QuizPage] Lesson not found: ${slug}`, error)
    notFound()
  }

  // Check if user already completed the quiz
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .single()

  return (
    <div
      className="min-h-screen bg-sandstone py-12 px-4"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .03) 25%, rgba(165, 154, 126, .03) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .03) 75%, rgba(165, 154, 126, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="max-w-3xl mx-auto">
        <Quiz
          lesson={lesson}
          userId={user.id}
          existingProgress={progress}
        />
      </div>
    </div>
  )
}
