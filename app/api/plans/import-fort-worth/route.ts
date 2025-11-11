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
        schedule_mode: 'synchronized', // Fort Worth plans are synchronized - everyone on same schedule
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

    // Map plan items to existing canonical lessons (instant!)
    console.log(`[Import] Mapping to canonical lessons...`)

    let mappedCount = 0
    const mappingsToCreate = []

    for (const item of createdPlanItems) {
      const reference = item.references_text[0]

      // Normalize reference format: convert regular hyphens to en-dashes
      // Fort Worth plan uses "-" but canonical lessons use "–"
      const normalizedReference = reference.replace(/-/g, '–')

      // Look up canonical lesson for this passage
      const { data: canonicalLesson } = await serviceClient
        .from('lessons')
        .select('id')
        .eq('passage_canonical', normalizedReference)
        .eq('translation', item.translation)
        .single()

      if (canonicalLesson) {
        // Canonical lesson exists - create mapping!
        mappingsToCreate.push({
          plan_item_id: item.id,
          lesson_id: canonicalLesson.id
        })
        mappedCount++
      }
    }

    // Create all mappings in batch
    if (mappingsToCreate.length > 0) {
      const { error: mappingError } = await serviceClient
        .from('plan_item_lessons')
        .insert(mappingsToCreate)

      if (mappingError) {
        console.error('[Import] Error creating lesson mappings:', mappingError)
      } else {
        // Update plan items status to published
        const mappedItemIds = mappingsToCreate.map(m => m.plan_item_id)
        await serviceClient
          .from('plan_items')
          .update({ status: 'published' })
          .in('id', mappedItemIds)

        console.log(`[Import] Successfully mapped ${mappedCount} existing canonical lessons`)
      }
    }

    return NextResponse.json({
      success: true,
      planId: plan.id,
      totalDays: fortWorthPlan.length,
      totalReadings: createdPlanItems.length,
      lessonsMapped: mappedCount,
      lessonsToGenerate: createdPlanItems.length - mappedCount,
      message: mappedCount > 0
        ? `Successfully imported Fort Worth Bible plan with ${mappedCount} lessons instantly mapped! ${createdPlanItems.length - mappedCount} lessons need generation.`
        : `Successfully imported Fort Worth Bible plan with ${createdPlanItems.length} readings. Run "Generate Lessons" to create content.`,
    })
  } catch (error: any) {
    console.error('[Import] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
