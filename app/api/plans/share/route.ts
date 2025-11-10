import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/plans/share
 * Creates a share link for a plan
 * Body: { planId: string, message?: string }
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
    const { planId, message } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify user owns this plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, user_id, title')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex')

    // Create share link
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('plan_shares')
      .insert({
        plan_id: planId,
        shared_by_user_id: user.id,
        token,
        message: message || null,
      })
      .select()
      .single()

    if (shareLinkError) {
      console.error('Error creating share link:', shareLinkError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    // Return the share link
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${token}`

    return NextResponse.json({
      shareLink,
      shareUrl,
    })
  } catch (error) {
    console.error('Error in share endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
