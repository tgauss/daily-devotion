import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/plans/join
 * Enrolls the current user in a shared plan via invite token (no duplication!)
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
    const { token, customStartDate } = body

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
          is_public,
          schedule_mode
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

    const plan = (shareLink.plans as any)
    const planId = plan.id

    // Validate custom start date for self-guided plans
    let startDate: string | null = null
    if (plan.schedule_mode === 'self-guided') {
      if (customStartDate) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(customStartDate)) {
          return NextResponse.json({ error: 'Invalid date format (use YYYY-MM-DD)' }, { status: 400 })
        }
        startDate = customStartDate
      }
      // If no custom start date provided for self-guided, that's okay (pure self-paced)
    }
    // For synchronized plans, custom start date should be null

    // Check if user already enrolled (avoid duplicates)
    const { data: existingEnrollment } = await supabase
      .from('user_plan_enrollments')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .single()

    if (existingEnrollment) {
      // User already enrolled - reactivate if archived
      if (!existingEnrollment.is_active) {
        await supabase
          .from('user_plan_enrollments')
          .update({ is_active: true })
          .eq('id', existingEnrollment.id)

        // Increment counters
        await serviceSupabase.rpc('increment_share_link_usage', { p_token: token })

        return NextResponse.json({
          planId,
          message: 'Welcome back! Re-activated your enrollment.',
        })
      }

      // Already active enrollment
      return NextResponse.json({
        planId,
        message: 'You are already enrolled in this plan',
      })
    }

    // Create enrollment (NO plan duplication!)
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('user_plan_enrollments')
      .insert({
        user_id: user.id,
        plan_id: planId,
        enrolled_at: new Date().toISOString(),
        custom_start_date: startDate,
        is_active: true,
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      return NextResponse.json({ error: 'Failed to join plan' }, { status: 500 })
    }

    // Increment usage counters
    await serviceSupabase.rpc('increment_share_link_usage', { p_token: token })
    await serviceSupabase.rpc('increment_plan_participant_count', { p_plan_id: planId })

    return NextResponse.json({
      planId,
      enrollmentId: enrollment.id,
      message: 'Successfully enrolled in plan!',
    })
  } catch (error) {
    console.error('Error in join endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
