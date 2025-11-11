import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Play } from 'lucide-react'

export async function FeaturedLessons() {
  const supabase = await createClient()

  // Fetch featured lessons (publicly accessible)
  const { data: rawLessons } = await supabase
    .from('lessons')
    .select(`
      id,
      passage_canonical,
      ai_triptych_json,
      audio_manifest_json,
      story_manifest_json
    `)
    .eq('is_featured', true)
    .limit(3)

  // If no featured lessons, don't show the section
  if (!rawLessons || rawLessons.length === 0) {
    return null
  }

  // Transform lessons to match expected format
  const featuredLessons = rawLessons.map((lesson: any) => {
    const planTitle = lesson.story_manifest_json?.metadata?.title || 'Untitled Lesson'
    const intro = lesson.ai_triptych_json?.intro || lesson.ai_triptych_json?.body || ''

    return {
      id: lesson.id,
      title: planTitle,
      scripture_reference: lesson.passage_canonical || 'No Reference',
      content: intro,
      audio_url: lesson.audio_manifest_json?.url || null,
      plans: {
        id: null,
        title: planTitle
      }
    }
  })

  return (
    <section className="py-20 bg-sandstone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-charcoal mb-4">
            Experience a Lesson
          </h2>
          <p className="text-lg text-charcoal/70 font-sans max-w-2xl mx-auto">
            Try out these featured lessons to see how My Daily Bread helps you grow in faith
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredLessons.map((lesson: any) => (
            <Link
              key={lesson.id}
              href={`/lesson-preview/${lesson.id}`}
              className="group bg-white/90 rounded-xl p-6 shadow-lg border border-olivewood/20 hover:shadow-xl hover:border-olivewood/40 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-olivewood" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-heading font-bold text-charcoal mb-1 group-hover:text-olivewood transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 font-sans">
                    {lesson.scripture_reference}
                  </p>
                </div>
              </div>

              <p className="text-charcoal/70 font-sans mb-4 line-clamp-3">
                {lesson.content?.substring(0, 150)}...
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-olivewood font-sans">
                  From: {lesson.plans?.title}
                </span>
                {lesson.audio_url && (
                  <div className="flex items-center gap-1 text-olivewood/70">
                    <Play className="w-4 h-4" />
                    <span className="text-xs font-sans">Audio</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-olivewood/10">
                <span className="text-olivewood font-sans text-sm group-hover:underline">
                  Preview Lesson →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-olivewood text-white rounded-lg hover:bg-olivewood/90 transition-all shadow-lg font-sans"
          >
            <BookOpen className="w-5 h-5" />
            Sign Up to Access All Lessons
          </Link>
        </div>
      </div>
    </section>
  )
}
