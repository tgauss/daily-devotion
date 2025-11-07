import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { getPassageAdapter } from '@/lib/services/passage-adapter'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'
import { getStoryCompiler } from '@/lib/services/story-compiler'
import { getAudioGenerator } from '@/lib/services/audio-generator'
import crypto from 'crypto'

/**
 * Build a specific lesson on-demand
 * Optimized for Vercel Pro (5-minute timeout)
 */
export const maxDuration = 300 // 5 minutes (Vercel Pro)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planItemId } = body

    if (!planItemId) {
      return NextResponse.json({ error: 'Plan item ID is required' }, { status: 400 })
    }

    // Use service client for lesson creation (bypasses RLS)
    const serviceSupabase = createServiceClient()

    // Fetch the specific plan item
    const { data: planItem, error: itemError } = await serviceSupabase
      .from('plan_items')
      .select('*, plans(*)')
      .eq('id', planItemId)
      .single()

    if (itemError || !planItem) {
      return NextResponse.json({ error: 'Plan item not found' }, { status: 404 })
    }

    // Verify plan ownership
    if (planItem.plans.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if lesson already exists for this plan item
    const { data: existingMapping } = await serviceSupabase
      .from('plan_item_lessons')
      .select('lesson_id, lessons(id, share_slug, passage_canonical)')
      .eq('plan_item_id', planItemId)
      .single()

    if (existingMapping && existingMapping.lessons) {
      const lesson = existingMapping.lessons as any
      return NextResponse.json({
        success: true,
        message: 'Lesson already built',
        lesson: {
          id: lesson.id,
          shareSlug: lesson.share_slug,
          reference: lesson.passage_canonical,
          wasReused: true,
        },
      })
    }

    // Get services
    const passageAdapter = getPassageAdapter('ESV')
    const aiGenerator = getAILessonGenerator()
    const storyCompiler = getStoryCompiler()
    const audioGenerator = getAudioGenerator()

    // Build the lesson
    try {
      // 1. Fetch passage text to get canonical reference
      const passage = await passageAdapter.getPassageText(
        planItem.references_text[0],
        planItem.translation
      )

      // 2. Check if canonical lesson already exists
      const { data: canonicalLesson } = await serviceSupabase
        .from('lessons')
        .select('id, share_slug')
        .eq('passage_canonical', passage.canonical)
        .eq('translation', planItem.translation)
        .single()

      let lessonId: string
      let shareSlug: string
      let wasReused = false

      if (canonicalLesson) {
        // Canonical lesson exists - reuse it!
        lessonId = canonicalLesson.id
        shareSlug = canonicalLesson.share_slug
        wasReused = true
      } else {
        // Build new canonical lesson
        // 3. Generate AI content
        const lessonContent = await aiGenerator.generateLessonContent({
          translation: planItem.translation,
          references: planItem.references_text,
          passage_text: passage.text,
          plan_theme: planItem.plans.theme,
        })

        // 4. Generate share slug
        shareSlug = crypto.randomBytes(16).toString('hex')

        // 5. Compile Web Story
        const storyManifest = storyCompiler.compile(lessonContent, {
          title: planItem.plans.title,
          reference: passage.canonical,
          translation: planItem.translation,
          quizUrl: `/quiz/${shareSlug}`,
          passageText: passage.text,
        })

        // 6. Generate audio for all pages
        let audioManifest = null
        try {
          const tempLessonId = crypto.randomBytes(16).toString('hex')
          audioManifest = await audioGenerator.generateAudioForLesson(
            tempLessonId,
            storyManifest
          )
        } catch (audioError) {
          console.error('Audio generation failed, continuing without audio:', audioError)
          // Continue without audio - don't fail the entire lesson creation
        }

        // 7. Store canonical lesson
        const { data: lesson, error: lessonError } = await serviceSupabase
          .from('lessons')
          .insert({
            plan_item_id: null, // Canonical lessons aren't owned by any plan_item
            passage_canonical: passage.canonical,
            passage_text: passage.text,
            translation: planItem.translation,
            ai_triptych_json: lessonContent,
            story_manifest_json: storyManifest,
            quiz_json: lessonContent.quiz,
            audio_manifest_json: audioManifest,
            share_slug: shareSlug,
            published_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (lessonError) {
          console.error('Error creating canonical lesson:', lessonError)
          return NextResponse.json(
            { error: 'Failed to create lesson', details: lessonError.message },
            { status: 500 }
          )
        }

        lessonId = lesson.id
      }

      // 8. Create plan_item → lesson mapping
      await serviceSupabase.from('plan_item_lessons').insert({
        plan_item_id: planItem.id,
        lesson_id: lessonId,
      })

      // 9. Update plan item status to published
      await serviceSupabase
        .from('plan_items')
        .update({ status: 'published' })
        .eq('id', planItem.id)

      return NextResponse.json({
        success: true,
        message: wasReused ? 'Lesson built (reused existing)' : 'Lesson built with audio',
        lesson: {
          id: lessonId,
          shareSlug,
          reference: passage.canonical,
          wasReused,
        },
      })
    } catch (error: any) {
      console.error(`Error building lesson for item ${planItem.id}:`, error)
      return NextResponse.json(
        { error: 'Failed to build lesson', details: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in build lesson API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
