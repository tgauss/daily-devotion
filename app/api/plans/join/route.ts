import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/plans/join
 * Joins a shared plan by creating a copy for the current user
 * Body: { token: string }
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
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get share link and verify it's valid
    const { data: shareLink, error: shareLinkError } = await serviceSupabase
      .from('plan_shares')
      .select(`
        *,
        plans (
          id,
          title,
          description,
          schedule_type,
          source,
          theme,
          depth_level
        )
      `)
      .eq('token', token)
      .single()

    if (shareLinkError || !shareLink) {
      return NextResponse.json({ error: 'Invalid share link' }, { status: 404 })
    }

    // Check if link has expired
    if (new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    const originalPlan = (shareLink.plans as any)

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
        source: 'ai-theme', // Mark as copied from AI theme
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

    // Copy plan items
    if (originalPlanItems && originalPlanItems.length > 0) {
      const newPlanItems = originalPlanItems.map((item: any, idx: number) => ({
        plan_id: newPlan.id,
        index: idx,
        date_target: item.date_target,
        references_text: item.references_text,
        category: item.category,
        translation: item.translation,
        status: 'published', // Items are already published
      }))

      // Insert plan items
      const { error: itemsError } = await serviceSupabase
        .from('plan_items')
        .insert(newPlanItems)

      if (itemsError) {
        console.error('Error copying plan items:', itemsError)
        // Continue anyway - plan is created
      }

      // For each plan item, link it to the canonical lesson (if exists)
      for (let i = 0; i < originalPlanItems.length; i++) {
        const originalItem = originalPlanItems[i]
        const newItemIndex = i

        // Get the lesson mapping from the original plan item
        const { data: lessonMapping } = await serviceSupabase
          .from('plan_item_lessons')
          .select('lesson_id')
          .eq('plan_item_id', originalItem.id)
          .single()

        if (lessonMapping) {
          // Get the new plan item ID
          const { data: newItem } = await serviceSupabase
            .from('plan_items')
            .select('id')
            .eq('plan_id', newPlan.id)
            .eq('index', newItemIndex)
            .single()

          if (newItem) {
            // Create the lesson mapping for the new plan item
            await serviceSupabase
              .from('plan_item_lessons')
              .insert({
                plan_item_id: newItem.id,
                lesson_id: lessonMapping.lesson_id,
              })
          }
        }
      }
    }

    // Increment usage counters
    await serviceSupabase.rpc('increment_share_link_usage', { p_token: token })
    await serviceSupabase.rpc('increment_plan_participant_count', { p_plan_id: originalPlan.id })

    return NextResponse.json({
      planId: newPlan.id,
      message: 'Successfully joined plan!',
    })
  } catch (error) {
    console.error('Error in join endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
