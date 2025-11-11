import { createServiceClient } from '@/lib/supabase/service'
import { sendEmailVerification } from '@/lib/email/helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, referralCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()

    // Create user with Supabase Admin API (bypasses email confirmation requirement)
    const { data: { user }, error: signUpError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User needs to confirm email
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        referred_by_code: referralCode || null,
      },
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Generate email verification link
    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (linkError || !linkData) {
      console.error('Error generating verification link:', linkError)
      // User is created but email won't send - they can request a new one later
      return NextResponse.json({
        success: true,
        message: 'Account created. Please check your email for verification link.',
      })
    }

    // Send verification email via Resend
    const emailSent = await sendEmailVerification(email, {
      firstName: firstName || email.split('@')[0],
      verificationUrl: linkData.properties.action_link,
    })

    if (!emailSent) {
      console.error('Failed to send verification email')
      // User is created but email failed - they can request a new one later
    }

    // Handle referral if present
    if (referralCode) {
      try {
        const { data: referrer } = await serviceClient
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single()

        if (referrer) {
          await serviceClient
            .from('users')
            .update({ referred_by_user_id: referrer.id })
            .eq('id', user.id)
        }
      } catch (error) {
        console.error('Error tracking referral:', error)
        // Don't fail signup if referral tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your address.',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during signup' },
      { status: 500 }
    )
  }
}
