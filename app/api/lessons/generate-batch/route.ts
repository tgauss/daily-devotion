import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { getPassageAdapter } from '@/lib/services/passage-adapter'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'
import { getStoryCompiler } from '@/lib/services/story-compiler'
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

    // Find plan items that don't have lessons yet (limit to batchSize)
    const { data: itemsWithoutLessons, error: itemsError } = await serviceSupabase
      .from('plan_items')
      .select('*, lessons(id)')
      .eq('plan_id', planId)
      .order('index', { ascending: true })

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch plan items' }, { status: 500 })
    }

    // Filter to only items without lessons
    const pendingItems = itemsWithoutLessons.filter((item: any) => !item.lessons || item.lessons.length === 0)

    // Get total count for progress tracking
    const totalItems = itemsWithoutLessons.length
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
        // 1. Fetch passage text
        const passage = await passageAdapter.getPassageText(
          item.references_text[0],
          item.translation
        )

        // 2. Generate AI content
        const lessonContent = await aiGenerator.generateLessonContent({
          translation: item.translation,
          references: item.references_text,
          passage_text: passage.text,
          plan_theme: plan.theme,
        })

        // 3. Generate share slug
        const shareSlug = crypto.randomBytes(16).toString('hex')

        // 4. Compile Web Story
        const storyManifest = storyCompiler.compile(lessonContent, {
          title: plan.title,
          reference: passage.canonical,
          translation: item.translation,
          quizUrl: `/quiz/${shareSlug}`,
          passageText: passage.text,
        })

        // 5. Store lesson
        const { data: lesson, error: lessonError } = await serviceSupabase
          .from('lessons')
          .insert({
            plan_item_id: item.id,
            passage_canonical: passage.canonical,
            passage_text: passage.text,
            translation: item.translation,
            ai_triptych_json: lessonContent,
            story_manifest_json: storyManifest,
            quiz_json: lessonContent.quiz,
            share_slug: shareSlug,
            published_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (lessonError) {
          console.error('Error creating lesson:', lessonError)
          results.push({ itemId: item.id, status: 'error', error: lessonError.message })
          continue
        }

        // 6. Update plan item status
        await serviceSupabase
          .from('plan_items')
          .update({ status: 'published' })
          .eq('id', item.id)

        results.push({ itemId: item.id, status: 'success', lessonId: lesson.id })
      } catch (error: any) {
        console.error(`Error generating lesson for item ${item.id}:`, error)
        results.push({ itemId: item.id, status: 'error', error: error.message })
      }
    }

    // Calculate progress after this batch
    const newCompletedCount = completedCount + results.filter((r) => r.status === 'success').length
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
