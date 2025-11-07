import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { getPassageAdapter } from '@/lib/services/passage-adapter'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'
import { getStoryCompiler } from '@/lib/services/story-compiler'
import { getAudioGenerator } from '@/lib/services/audio-generator'
import crypto from 'crypto'

/**
 * Batch lesson generation endpoint
 * Processes a limited number of lessons at a time to avoid timeouts
 */
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
    const { planId, batchSize = 5 } = body

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

    // Find plan items that don't have lessons yet (via plan_item_lessons mapping)
    const { data: allPlanItems, error: itemsError } = await serviceSupabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('index', { ascending: true })

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch plan items' }, { status: 500 })
    }

    // Check which items already have mappings
    const { data: existingMappings } = await serviceSupabase
      .from('plan_item_lessons')
      .select('plan_item_id')
      .in('plan_item_id', allPlanItems.map((i: any) => i.id))

    const mappedItemIds = new Set(existingMappings?.map((m: any) => m.plan_item_id) || [])

    // Filter to only items without lesson mappings
    const pendingItems = allPlanItems.filter((item: any) => !mappedItemIds.has(item.id))

    // Get total count for progress tracking
    const totalItems = allPlanItems.length
    const completedCount = totalItems - pendingItems.length

    // If all lessons are already generated
    if (pendingItems.length === 0) {
      return NextResponse.json({
        completed: true,
        progress: {
          completed: completedCount,
          total: totalItems,
          remaining: 0,
        },
        results: [],
      })
    }

    // Process only up to batchSize items
    const itemsToProcess = pendingItems.slice(0, Math.min(batchSize, pendingItems.length))
    const results = []

    for (const item of itemsToProcess) {
      try {
        // 1. Fetch passage text to get canonical reference
        const passage = await passageAdapter.getPassageText(
          item.references_text[0],
          item.translation
        )

        // 2. Check if canonical lesson already exists (key optimization!)
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
          // 3. Generate AI content
          const lessonContent = await aiGenerator.generateLessonContent({
            translation: item.translation,
            references: item.references_text,
            passage_text: passage.text,
            plan_theme: plan.theme,
          })

          // 4. Generate share slug
          const shareSlug = crypto.randomBytes(16).toString('hex')

          // 5. Compile Web Story
          const storyManifest = storyCompiler.compile(lessonContent, {
            title: plan.title,
            reference: passage.canonical,
            translation: item.translation,
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

          lessonId = lesson.id
          results.push({ itemId: item.id, status: 'created_canonical', lessonId })
        }

        // 8. Create plan_item → lesson mapping
        await serviceSupabase
          .from('plan_item_lessons')
          .insert({
            plan_item_id: item.id,
            lesson_id: lessonId,
          })

        // 9. Update plan item status to published
        await serviceSupabase
          .from('plan_items')
          .update({ status: 'published' })
          .eq('id', item.id)

      } catch (error: any) {
        console.error(`Error generating lesson for item ${item.id}:`, error)
        results.push({ itemId: item.id, status: 'error', error: error.message })
      }
    }

    // Calculate progress after this batch
    const successfulResults = results.filter((r) =>
      r.status === 'reused_canonical' || r.status === 'created_canonical'
    )
    const newCompletedCount = completedCount + successfulResults.length
    const remaining = totalItems - newCompletedCount

    return NextResponse.json({
      completed: remaining === 0,
      progress: {
        completed: newCompletedCount,
        total: totalItems,
        remaining,
      },
      results,
    })
  } catch (error) {
    console.error('Error in batch lesson generation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
