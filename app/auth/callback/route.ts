import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /auth/callback
 * Handles OAuth callback from providers (Google, etc.)
 * Processes authentication code and manages referral tracking
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const ref = requestUrl.searchParams.get('ref') // Referral code

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    // If referral code present and user is newly created
    if (ref && data.user) {
      try {
        // Look up referrer by referral code
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', ref)
          .single()

        if (referrer) {
          // Update the new user's referred_by field
          const { error: updateError } = await supabase
            .from('users')
            .update({ referred_by_user_id: referrer.id })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('Error updating referral:', updateError)
          } else {
            console.log(`User ${data.user.id} referred by ${referrer.id}`)
          }
        }
      } catch (error) {
        console.error('Error processing referral:', error)
        // Don't fail the auth flow if referral tracking fails
      }
    }

    // Check if this is a new user (just confirmed email) and queue welcome email
    if (data.user && data.user.email) {
      try {
        // Check if user already has a welcome email queued/sent
        const { data: existingEmail } = await supabase
          .from('email_queue')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('email_type', 'welcome')
          .maybeSingle()

        // If no welcome email exists, queue one
        if (!existingEmail) {
          const firstName = data.user.user_metadata?.first_name ||
                          data.user.user_metadata?.name ||
                          data.user.email.split('@')[0]

          await supabase.rpc('queue_welcome_email', {
            p_user_id: data.user.id,
            p_email: data.user.email,
            p_first_name: firstName,
            p_dashboard_url: `${new URL(request.url).origin}/dashboard`
          })

          console.log(`Queued welcome email for ${data.user.email}`)
        }
      } catch (error) {
        console.error('Error queuing welcome email:', error)
        // Don't fail auth flow if email queueing fails
      }
    }

    // Successful auth - redirect to next URL
    return NextResponse.redirect(new URL(next, request.url))
  }

  // No code present - redirect to login page
  return NextResponse.redirect(new URL('/login', request.url))
}
