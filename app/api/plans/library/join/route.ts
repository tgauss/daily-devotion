import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/plans/library/join
 * Enrolls the current user in a public library plan (no duplication!)
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
    const { planId, customStartDate } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify plan exists and is public
    const { data: plan, error: planError } = await serviceSupabase
      .from('plans')
      .select('id, is_public, title, schedule_mode')
      .eq('id', planId)
      .eq('is_public', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Public plan not found' }, { status: 404 })
    }

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

    // Increment participant count in stats
    await serviceSupabase.rpc('increment_plan_participant_count', { p_plan_id: planId })

    return NextResponse.json({
      planId,
      enrollmentId: enrollment.id,
      message: 'Successfully enrolled in plan!',
    })
  } catch (error) {
    console.error('Error in library join endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
