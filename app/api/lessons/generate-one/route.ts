import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { getPassageAdapter } from '@/lib/services/passage-adapter'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'
import { getStoryCompiler } from '@/lib/services/story-compiler'
import { getAudioGenerator } from '@/lib/services/audio-generator'
import crypto from 'crypto'

/**
 * Generate a single lesson on-demand
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
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Fetch plan and verify ownership
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
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

    // Find the NEXT unpublished plan item
    const { data: allPlanItems, error: itemsError } = await serviceSupabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('index', { ascending: true })

    if (itemsError || !allPlanItems) {
      return NextResponse.json({ error: 'Failed to fetch plan items' }, { status: 500 })
    }

    // Check which items already have mappings
    const { data: existingMappings } = await serviceSupabase
      .from('plan_item_lessons')
      .select('plan_item_id')
      .in('plan_item_id', allPlanItems.map((i: any) => i.id))

    const mappedItemIds = new Set(existingMappings?.map((m: any) => m.plan_item_id) || [])

    // Find first unpublished item
    const nextItem = allPlanItems.find((item: any) => !mappedItemIds.has(item.id))

    if (!nextItem) {
      return NextResponse.json({
        success: false,
        message: 'All lessons have been generated!',
        allComplete: true,
      })
    }

    // Generate the lesson
    try {
      // 1. Fetch passage text to get canonical reference
      const passage = await passageAdapter.getPassageText(
        nextItem.references_text[0],
        nextItem.translation
      )

      // 2. Check if canonical lesson already exists (key optimization!)
      const { data: canonicalLesson } = await serviceSupabase
        .from('lessons')
        .select('id, share_slug')
        .eq('passage_canonical', passage.canonical)
        .eq('translation', nextItem.translation)
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
        // Generate new canonical lesson
        // 3. Generate AI content
        const lessonContent = await aiGenerator.generateLessonContent({
          translation: nextItem.translation,
          references: nextItem.references_text,
          passage_text: passage.text,
          plan_theme: plan.theme,
        })

        // 4. Generate share slug
        shareSlug = crypto.randomBytes(16).toString('hex')

        // 5. Compile Web Story
        const storyManifest = storyCompiler.compile(lessonContent, {
          title: plan.title,
          reference: passage.canonical,
          translation: nextItem.translation,
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

        // 7. Store canonical lesson (no plan_item_id!)
        const { data: lesson, error: lessonError } = await serviceSupabase
          .from('lessons')
          .insert({
            plan_item_id: null, // Canonical lessons aren't owned by any plan_item
            passage_canonical: passage.canonical,
            passage_text: passage.text,
            translation: nextItem.translation,
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
        plan_item_id: nextItem.id,
        lesson_id: lessonId,
      })

      // 9. Update plan item status to published
      await serviceSupabase
        .from('plan_items')
        .update({ status: 'published' })
        .eq('id', nextItem.id)

      // Calculate progress
      const completedCount = mappedItemIds.size + 1
      const totalCount = allPlanItems.length

      return NextResponse.json({
        success: true,
        lesson: {
          id: lessonId,
          shareSlug,
          reference: passage.canonical,
          wasReused,
        },
        progress: {
          completed: completedCount,
          total: totalCount,
          remaining: totalCount - completedCount,
        },
      })
    } catch (error: any) {
      console.error(`Error generating lesson for item ${nextItem.id}:`, error)
      return NextResponse.json(
        { error: 'Failed to generate lesson', details: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in generate-one lesson API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
