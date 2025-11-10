import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/plans/library/join
 * Joins a public library plan by creating a copy for the current user
 * Body: { planId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

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

    // Get public plan
    const { data: originalPlan, error: planError } = await serviceSupabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('is_public', true)
      .single()

    if (planError || !originalPlan) {
      return NextResponse.json({ error: 'Public plan not found' }, { status: 404 })
    }

    // Check if user already has this plan (avoid duplicates)
    const { data: existingPlan } = await supabase
      .from('plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', originalPlan.title)
      .eq('source', 'ai-theme')
      .single()

    if (existingPlan) {
      // User already has this plan, just return it
      return NextResponse.json({
        planId: existingPlan.id,
        message: 'You already have this plan',
      })
    }

    // Create a copy of the plan for the current user
    const { data: newPlan, error: newPlanError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        title: originalPlan.title,
        description: originalPlan.description,
        schedule_type: originalPlan.schedule_type,
        source: 'ai-theme',
        theme: originalPlan.theme,
        depth_level: originalPlan.depth_level || 'moderate',
        is_public: false, // User's copy is private by default
      })
      .select()
      .single()

    if (newPlanError) {
      console.error('Error creating plan copy:', newPlanError)
      return NextResponse.json({ error: 'Failed to join plan' }, { status: 500 })
    }

    // Get plan items from original plan
    const { data: originalPlanItems } = await serviceSupabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', originalPlan.id)
      .order('index', { ascending: true })

    // Copy plan items and lesson mappings
    if (originalPlanItems && originalPlanItems.length > 0) {
      const newPlanItems = originalPlanItems.map((item: any, idx: number) => ({
        plan_id: newPlan.id,
        index: idx,
        date_target: item.date_target,
        references_text: item.references_text,
        category: item.category,
        translation: item.translation,
        status: 'published',
      }))

      const { error: itemsError } = await serviceSupabase
        .from('plan_items')
        .insert(newPlanItems)

      if (itemsError) {
        console.error('Error copying plan items:', itemsError)
      }

      // Link to canonical lessons
      for (let i = 0; i < originalPlanItems.length; i++) {
        const originalItem = originalPlanItems[i]
        const newItemIndex = i

        const { data: lessonMapping } = await serviceSupabase
          .from('plan_item_lessons')
          .select('lesson_id')
          .eq('plan_item_id', originalItem.id)
          .single()

        if (lessonMapping) {
          const { data: newItem } = await serviceSupabase
            .from('plan_items')
            .select('id')
            .eq('plan_id', newPlan.id)
            .eq('index', newItemIndex)
            .single()

          if (newItem) {
            await serviceSupabase.from('plan_item_lessons').insert({
              plan_item_id: newItem.id,
              lesson_id: lessonMapping.lesson_id,
            })
          }
        }
      }
    }

    // Increment participant count
    await serviceSupabase.rpc('increment_plan_participant_count', { p_plan_id: originalPlan.id })

    return NextResponse.json({
      planId: newPlan.id,
      message: 'Successfully joined plan!',
    })
  } catch (error) {
    console.error('Error in library join endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
