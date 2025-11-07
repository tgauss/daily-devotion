import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { getPassageAdapter } from '@/lib/services/passage-adapter'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'
import { getStoryCompiler } from '@/lib/services/story-compiler'
import { getAudioGenerator } from '@/lib/services/audio-generator'
import crypto from 'crypto'

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
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Fetch plan and verify ownership
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*, plan_items(*)')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for lesson creation (bypasses RLS)
    const serviceSupabase = createServiceClient()

    // Get services
    const passageAdapter = getPassageAdapter('ESV')
    const aiGenerator = getAILessonGenerator()
    const storyCompiler = getStoryCompiler()
    const audioGenerator = getAudioGenerator()

    // Generate lessons for each plan item
    const results = []

    for (const item of plan.plan_items) {
      try {
        // 1. Check if this plan_item already has a lesson mapping
        const { data: existingMapping } = await serviceSupabase
          .from('plan_item_lessons')
          .select('lesson_id')
          .eq('plan_item_id', item.id)
          .single()

        if (existingMapping) {
          results.push({ itemId: item.id, status: 'already_mapped', lessonId: existingMapping.lesson_id })
          continue
        }

        // 2. Fetch passage text to get canonical reference
        const passage = await passageAdapter.getPassageText(
          item.references_text[0],
          item.translation
        )

        // 3. Check if canonical lesson already exists (key optimization!)
        const { data: canonicalLesson } = await serviceSupabase
          .from('lessons')
          .select('id')
          .eq('passage_canonical', passage.canonical)
          .eq('translation', item.translation)
          .single()

        let lessonId: string

        if (canonicalLesson) {
          // Canonical lesson exists - reuse it!
          lessonId = canonicalLesson.id
          results.push({ itemId: item.id, status: 'reused_canonical', lessonId })
        } else {
          // Generate new canonical lesson
          // 4. Generate AI content
          const lessonContent = await aiGenerator.generateLessonContent({
            translation: item.translation,
            references: item.references_text,
            passage_text: passage.text,
            plan_theme: plan.theme,
          })

          // 5. Generate share slug
          const shareSlug = crypto.randomBytes(16).toString('hex')

          // 6. Compile Web Story (including passage text)
          const storyManifest = storyCompiler.compile(lessonContent, {
            title: plan.title,
            reference: passage.canonical,
            translation: item.translation,
            quizUrl: `/quiz/${shareSlug}`,
            passageText: passage.text,
          })

          // 7. Generate audio for all pages
          let audioManifest = null
          try {
            // Generate a temporary lesson ID for audio file paths
            const tempLessonId = crypto.randomBytes(16).toString('hex')
            audioManifest = await audioGenerator.generateAudioForLesson(
              tempLessonId,
              storyManifest
            )
            console.log(`Generated audio for lesson (${audioManifest.pages.length} pages)`)
          } catch (audioError) {
            console.error('Audio generation failed, continuing without audio:', audioError)
            // Continue without audio - don't fail the entire lesson creation
          }

          // 8. Store canonical lesson (no plan_item_id!)
          const { data: newLesson, error: lessonError } = await serviceSupabase
            .from('lessons')
            .insert({
              plan_item_id: null, // Canonical lessons aren't owned by any plan_item
              passage_canonical: passage.canonical,
              passage_text: passage.text,
              translation: item.translation,
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
            results.push({ itemId: item.id, status: 'error', error: lessonError.message })
            continue
          }

          lessonId = newLesson.id
          results.push({ itemId: item.id, status: 'created_canonical', lessonId })
        }

        // 9. Create plan_item → lesson mapping
        await serviceSupabase
          .from('plan_item_lessons')
          .insert({
            plan_item_id: item.id,
            lesson_id: lessonId,
          })

        // 10. Update plan item status to published
        await serviceSupabase
          .from('plan_items')
          .update({ status: 'published' })
          .eq('id', item.id)

      } catch (error: any) {
        console.error(`Error generating lesson for item ${item.id}:`, error)
        results.push({ itemId: item.id, status: 'error', error: error.message })
      }
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Error in generate lessons API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
