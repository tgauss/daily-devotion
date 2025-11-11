import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Play, ArrowLeft } from 'lucide-react'
import { LessonAudioPlayer } from '@/components/lessons/lesson-audio-player'

export default async function LessonPreviewPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If logged in, redirect to the actual lesson page
  if (user) {
    redirect(`/plans/${params.id}`)
  }

  // Fetch the lesson (only if it's featured)
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      scripture_reference,
      content,
      reflection_questions,
      audio_url,
      plans!inner(id, title, description)
    `)
    .eq('id', params.id)
    .eq('is_featured', true)
    .single()

  if (error || !lesson) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-sandstone">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-olivewood/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-olivewood hover:text-olivewood/80 transition-colors font-sans">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-olivewood text-white rounded-lg hover:bg-olivewood/90 transition-colors font-sans"
            >
              Sign Up for Full Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Plan Info Banner */}
        <div className="bg-olivewood/10 border border-olivewood/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-olivewood flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-olivewood/70 font-sans mb-1">From the plan:</p>
              <h2 className="text-xl font-heading font-bold text-olivewood mb-2">
                {(lesson.plans as any)?.title || (lesson.plans as any)?.[0]?.title}
              </h2>
              {((lesson.plans as any)?.description || (lesson.plans as any)?.[0]?.description) && (
                <p className="text-charcoal/70 font-sans text-sm">
                  {(lesson.plans as any)?.description || (lesson.plans as any)?.[0]?.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Card */}
        <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-olivewood/20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-charcoal mb-3">
              {lesson.title}
            </h1>
            <p className="text-lg text-olivewood font-sans">
              {lesson.scripture_reference}
            </p>
          </div>

          {/* Audio Player */}
          {lesson.audio_url && (
            <div className="mb-8">
              <div className="bg-sandstone/50 rounded-lg p-6 border border-olivewood/20">
                <div className="flex items-center gap-3 mb-4">
                  <Play className="w-5 h-5 text-olivewood" />
                  <h3 className="font-heading font-bold text-charcoal">
                    Listen to this Lesson
                  </h3>
                </div>
                <LessonAudioPlayer audioUrl={lesson.audio_url} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-charcoal/80 font-sans leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </div>
          </div>

          {/* Reflection Questions (if any) */}
          {lesson.reflection_questions && lesson.reflection_questions.length > 0 && (
            <div className="border-t border-olivewood/20 pt-8">
              <h3 className="text-xl font-heading font-bold text-charcoal mb-4">
                Reflection Questions
              </h3>
              <div className="space-y-4">
                {lesson.reflection_questions.map((question: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-olivewood/10 rounded-full flex items-center justify-center text-sm font-bold text-olivewood">
                      {index + 1}
                    </span>
                    <p className="text-charcoal/80 font-sans">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-olivewood text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">
            Want to Continue Your Journey?
          </h3>
          <p className="text-white/90 font-sans mb-6 max-w-2xl mx-auto">
            Sign up for free to access the full plan, track your progress, and join a community
            of believers growing in faith together.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-olivewood text-lg rounded-lg hover:bg-sandstone transition-all shadow-lg font-sans"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-white/70 font-sans mt-4">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}
