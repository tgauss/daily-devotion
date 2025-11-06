import { createClient } from '@/lib/supabase/server'
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

  // Fetch lesson by share slug
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, plan_items(*, plans(title))')
    .eq('share_slug', slug)
    .single()

  if (error || !lesson) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
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
