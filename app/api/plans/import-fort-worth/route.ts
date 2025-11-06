import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fortWorthPlan from '@/data/fort-worth-bible-plan.json'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

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
    const planItems = []
    let itemIndex = 0

    for (const day of fortWorthPlan) {
      for (const reading of day.readings) {
        planItems.push({
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

    const { error: itemsError } = await supabase
      .from('plan_items')
      .insert(planItems)

    if (itemsError) {
      console.error('[Import] Plan items creation error:', itemsError)
      // Rollback: delete the plan
      await supabase.from('plans').delete().eq('id', plan.id)
      return NextResponse.json({ error: 'Failed to create plan items', details: itemsError.message }, { status: 500 })
    }

    console.log(`[Import] Created ${planItems.length} plan items (${fortWorthPlan.length} days × 4 readings)`)

    return NextResponse.json({
      success: true,
      planId: plan.id,
      totalDays: fortWorthPlan.length,
      totalReadings: planItems.length,
      message: `Successfully imported Fort Worth Bible plan with ${planItems.length} readings across ${fortWorthPlan.length} days`,
    })
  } catch (error: any) {
    console.error('[Import] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
