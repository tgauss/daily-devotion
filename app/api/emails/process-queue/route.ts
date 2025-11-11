import { createServiceClient } from '@/lib/supabase/service'
import { sendWelcomeEmail, sendPlanInviteEmail, sendLessonReminderEmail } from '@/lib/email/helpers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/emails/process-queue
 * Processes queued emails and sends them via Resend
 * Can be called by cron job or manually
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (optional: add CRON_SECRET check)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Fetch unsent emails from queue (limit to 10 at a time to avoid rate limits)
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .is('sent_at', null)
      .lt('attempts', 3) // Max 3 attempts
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching email queue:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
    }

    if (!queuedEmails || queuedEmails.length === 0) {
      return NextResponse.json({ message: 'No emails to process', processed: 0 })
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each email
    for (const email of queuedEmails) {
      results.processed++

      try {
        let success = false

        // Send based on email type
        switch (email.email_type) {
          case 'welcome':
            success = await sendWelcomeEmail(email.recipient_email, email.email_data)
            break
          case 'plan_invite':
            success = await sendPlanInviteEmail(email.recipient_email, email.email_data)
            break
          case 'lesson_reminder':
            success = await sendLessonReminderEmail(email.recipient_email, email.email_data)
            break
          default:
            throw new Error(`Unknown email type: ${email.email_type}`)
        }

        if (success) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({
              sent_at: new Date().toISOString(),
              attempts: email.attempts + 1
            })
            .eq('id', email.id)

          results.sent++
        } else {
          throw new Error('Email send returned false')
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`${email.id}: ${error.message}`)

        // Update attempt count and error
        await supabase
          .from('email_queue')
          .update({
            attempts: email.attempts + 1,
            error: error.message
          })
          .eq('id', email.id)
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      message: 'Queue processed',
      ...results
    })
  } catch (error: any) {
    console.error('Error processing email queue:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/emails/process-queue
 * Check queue status
 */
export async function GET() {
  try {
    const supabase = createServiceClient()

    const { count: pending } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .is('sent_at', null)

    const { count: sent } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .not('sent_at', 'is', null)

    const { count: failed } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .is('sent_at', null)
      .gte('attempts', 3)

    return NextResponse.json({
      queue: {
        pending: pending || 0,
        sent: sent || 0,
        failed: failed || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get queue status', details: error.message },
      { status: 500 }
    )
  }
}
