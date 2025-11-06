import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import fortWorthPlan from '@/data/fort-worth-bible-plan.json'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { makePublic = true } = await req.json()

    // Create the plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        title: 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)',
        description: 'A systematic Bible reading plan covering the Gospel of John, Early Church letters (2 Peter through Revelation), Job, and the Major & Minor Prophets. Four daily readings from October 30 through December 31, 2025.',
        schedule_type: 'daily',
        source: 'import',
        theme: 'Complete Bible Reading',
        is_public: makePublic,
      })
      .select()
      .single()

    if (planError) {
      console.error('[Import] Plan creation error:', planError)
      return NextResponse.json({ error: 'Failed to create plan', details: planError.message }, { status: 500 })
    }

    console.log(`[Import] Created plan: ${plan.id}`)

    // Create plan items for each date and reading
    const planItemsToInsert = []
    let itemIndex = 0

    for (const day of fortWorthPlan) {
      for (const reading of day.readings) {
        planItemsToInsert.push({
          plan_id: plan.id,
          index: itemIndex++,
          date_target: day.date,
          references_text: [reading.reference],
          category: reading.category,
          translation: 'ESV',
          status: 'pending',
        })
      }
    }

    const { data: createdPlanItems, error: itemsError } = await supabase
      .from('plan_items')
      .insert(planItemsToInsert)
      .select('id, references_text, translation')

    if (itemsError || !createdPlanItems) {
      console.error('[Import] Plan items creation error:', itemsError)
      // Rollback: delete the plan
      await supabase.from('plans').delete().eq('id', plan.id)
      return NextResponse.json({ error: 'Failed to create plan items', details: itemsError.message }, { status: 500 })
    }

    console.log(`[Import] Created ${createdPlanItems.length} plan items`)

    // Try to find existing Fort Worth plan with lessons to copy from
    const { data: existingPlans } = await serviceClient
      .from('plans')
      .select('id')
      .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
      .neq('id', plan.id)
      .limit(1)

    if (existingPlans && existingPlans.length > 0) {
      const templatePlanId = existingPlans[0].id
      console.log(`[Import] Found existing Fort Worth plan ${templatePlanId}, attempting to copy lessons`)

      // Get plan items with lessons from the template plan
      const { data: templatePlanItems } = await serviceClient
        .from('plan_items')
        .select('references_text, lessons(*)')
        .eq('plan_id', templatePlanId)
        .not('lessons', 'is', null)

      if (templatePlanItems && templatePlanItems.length > 0) {
        console.log(`[Import] Found ${templatePlanItems.length} lessons to copy`)

        // Create a map of reference -> lesson for quick lookup
        const templateLessonsMap = new Map()
        for (const item of templatePlanItems) {
          const ref = item.references_text[0]
          if (item.lessons && item.lessons.length > 0) {
            templateLessonsMap.set(ref, item.lessons[0])
          }
        }

        // Copy lessons for matching plan items
        const lessonsToCopy = []
        let copiedCount = 0

        for (const newItem of createdPlanItems) {
          const ref = newItem.references_text[0]
          const templateLesson = templateLessonsMap.get(ref)

          if (templateLesson) {
            lessonsToCopy.push({
              plan_item_id: newItem.id,
              passage_canonical: templateLesson.passage_canonical,
              passage_text: templateLesson.passage_text,
              translation: templateLesson.translation,
              ai_triptych_json: templateLesson.ai_triptych_json,
              story_manifest_json: templateLesson.story_manifest_json,
              quiz_json: templateLesson.quiz_json,
              share_slug: crypto.randomBytes(16).toString('hex'), // New unique share slug
              published_at: new Date().toISOString(),
            })
            copiedCount++
          }
        }

        if (lessonsToCopy.length > 0) {
          const { error: lessonsError } = await serviceClient
            .from('lessons')
            .insert(lessonsToCopy)

          if (lessonsError) {
            console.error('[Import] Error copying lessons:', lessonsError)
          } else {
            // Update plan items status to published for items with lessons
            const itemIdsWithLessons = lessonsToCopy.map(l => l.plan_item_id)
            await serviceClient
              .from('plan_items')
              .update({ status: 'published' })
              .in('id', itemIdsWithLessons)

            console.log(`[Import] Successfully copied ${copiedCount} lessons`)
          }
        }

        return NextResponse.json({
          success: true,
          planId: plan.id,
          totalDays: fortWorthPlan.length,
          totalReadings: createdPlanItems.length,
          lessonsCopied: copiedCount,
          message: copiedCount > 0
            ? `Successfully imported Fort Worth Bible plan with ${copiedCount} lessons pre-loaded! ${createdPlanItems.length - copiedCount} lessons still need generation.`
            : `Successfully imported Fort Worth Bible plan with ${createdPlanItems.length} readings across ${fortWorthPlan.length} days`,
        })
      }
    }

    console.log('[Import] No existing lessons found to copy')

    return NextResponse.json({
      success: true,
      planId: plan.id,
      totalDays: fortWorthPlan.length,
      totalReadings: createdPlanItems.length,
      lessonsCopied: 0,
      message: `Successfully imported Fort Worth Bible plan with ${createdPlanItems.length} readings across ${fortWorthPlan.length} days`,
    })
  } catch (error: any) {
    console.error('[Import] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
