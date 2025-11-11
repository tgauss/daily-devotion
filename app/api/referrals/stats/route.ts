import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/referrals/stats
 * Returns referral statistics for the authenticated user
 * Response: {
 *   referral_code: string,
 *   total_referrals: number,
 *   active_referrals: number (last 30 days),
 *   referral_link: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get referral stats using database function
    const { data: stats, error } = await supabase.rpc('get_referral_stats', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error fetching referral stats:', error)
      return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 })
    }

    // Stats returns array with single row
    const referralData = stats?.[0] || {
      total_referrals: 0,
      active_referrals: 0,
      referral_code: null,
    }

    // Generate referral link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const referralLink = referralData.referral_code
      ? `${appUrl}/auth?ref=${referralData.referral_code}`
      : null

    return NextResponse.json({
      referral_code: referralData.referral_code,
      total_referrals: referralData.total_referrals,
      active_referrals: referralData.active_referrals,
      referral_link: referralLink,
    })
  } catch (error) {
    console.error('Error in referral stats endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
