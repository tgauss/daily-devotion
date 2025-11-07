import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

/**
 * Admin utility to copy Fort Worth lessons from one plan to another
 * Use this when a user imported Fort Worth before lessons were generated
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Verify the requesting user is authenticated (basic check)
    const {
      data: { user: adminUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetPlanId } = await req.json()

    if (!targetPlanId) {
      return NextResponse.json({ error: 'targetPlanId required' }, { status: 400 })
    }

    console.log(`[CopyLessons] Copying lessons to plan ${targetPlanId}`)

    // Get the target plan
    const { data: targetPlan } = await serviceClient
      .from('plans')
      .select('id, title, user_id')
      .eq('id', targetPlanId)
      .single()

    if (!targetPlan || targetPlan.title !== 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)') {
      return NextResponse.json({ error: 'Plan not found or not a Fort Worth plan' }, { status: 404 })
    }

    // Get target plan items without lessons
    const { data: targetPlanItems } = await serviceClient
      .from('plan_items')
      .select('id, references_text, plan_id')
      .eq('plan_id', targetPlanId)

    if (!targetPlanItems || targetPlanItems.length === 0) {
      return NextResponse.json({ error: 'No plan items found' }, { status: 404 })
    }

    console.log(`[CopyLessons] Found ${targetPlanItems.length} plan items`)

    // Find existing Fort Worth plan with lessons (not this one)
    const { data: sourcePlans } = await serviceClient
      .from('plans')
      .select('id')
      .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
      .neq('id', targetPlanId)
      .limit(1)

    if (!sourcePlans || sourcePlans.length === 0) {
      return NextResponse.json({
        error: 'No source Fort Worth plan found with lessons',
        message: 'Generate lessons on at least one Fort Worth plan first'
      }, { status: 404 })
    }

    const sourcePlanId = sourcePlans[0].id
    console.log(`[CopyLessons] Using source plan ${sourcePlanId}`)

    // Get plan items with lessons from source
    const { data: sourcePlanItems } = await serviceClient
      .from('plan_items')
      .select('id, references_text, lessons(*)')
      .eq('plan_id', sourcePlanId)

    if (!sourcePlanItems || sourcePlanItems.length === 0) {
      return NextResponse.json({
        error: 'Source plan has no plan items',
        message: 'Source plan is empty'
      }, { status: 404 })
    }

    console.log(`[CopyLessons] Found ${sourcePlanItems.length} source plan items`)

    // Create map of reference -> lesson (filter items that have lessons)
    const sourceLessonsMap = new Map()
    let sourceLessonsCount = 0

    for (const item of sourcePlanItems) {
      const ref = item.references_text[0]
      if (item.lessons && item.lessons.length > 0) {
        sourceLessonsMap.set(ref, item.lessons[0])
        sourceLessonsCount++
      }
    }

    console.log(`[CopyLessons] Found ${sourceLessonsCount} source items with lessons out of ${sourcePlanItems.length} total`)

    if (sourceLessonsCount === 0) {
      return NextResponse.json({
        error: 'Source plan has no generated lessons',
        message: 'Generate lessons on the source plan first',
        details: {
          sourcePlanId,
          totalSourceItems: sourcePlanItems.length,
          itemsWithLessons: 0
        }
      }, { status: 404 })
    }

    // Copy lessons for matching references
    const lessonsToCopy = []
    const itemsToUpdate = []
    let alreadyExistCount = 0
    let noMatchCount = 0

    for (const targetItem of targetPlanItems) {
      const ref = targetItem.references_text[0]
      const sourceLesson = sourceLessonsMap.get(ref)

      if (sourceLesson) {
        // Check if lesson already exists for this plan_item
        const { data: existingLesson } = await serviceClient
          .from('lessons')
          .select('id')
          .eq('plan_item_id', targetItem.id)
          .single()

        if (!existingLesson) {
          lessonsToCopy.push({
            plan_item_id: targetItem.id,
            passage_canonical: sourceLesson.passage_canonical,
            passage_text: sourceLesson.passage_text,
            translation: sourceLesson.translation,
            ai_triptych_json: sourceLesson.ai_triptych_json,
            story_manifest_json: sourceLesson.story_manifest_json,
            quiz_json: sourceLesson.quiz_json,
            share_slug: crypto.randomBytes(16).toString('hex'),
            published_at: new Date().toISOString(),
          })
          itemsToUpdate.push(targetItem.id)
        } else {
          alreadyExistCount++
        }
      } else {
        noMatchCount++
      }
    }

    console.log(`[CopyLessons] Results: ${lessonsToCopy.length} to copy, ${alreadyExistCount} already exist, ${noMatchCount} no source match`)

    if (lessonsToCopy.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All lessons already copied',
        lessonsCopied: 0,
        details: {
          totalTargetItems: targetPlanItems.length,
          alreadyExist: alreadyExistCount,
          noSourceMatch: noMatchCount,
          availableSourceLessons: sourceLessonsCount
        }
      })
    }

    console.log(`[CopyLessons] Copying ${lessonsToCopy.length} lessons`)

    // Insert lessons
    const { error: lessonsError } = await serviceClient
      .from('lessons')
      .insert(lessonsToCopy)

    if (lessonsError) {
      console.error('[CopyLessons] Error inserting lessons:', lessonsError)
      return NextResponse.json({
        error: 'Failed to copy lessons',
        details: lessonsError.message
      }, { status: 500 })
    }

    // Update plan_items status to published
    await serviceClient
      .from('plan_items')
      .update({ status: 'published' })
      .in('id', itemsToUpdate)

    console.log(`[CopyLessons] Successfully copied ${lessonsToCopy.length} lessons`)

    return NextResponse.json({
      success: true,
      lessonsCopied: lessonsToCopy.length,
      totalItems: targetPlanItems.length,
      message: `Successfully copied ${lessonsToCopy.length} lessons to plan ${targetPlanId}`
    })
  } catch (error: any) {
    console.error('[CopyLessons] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
