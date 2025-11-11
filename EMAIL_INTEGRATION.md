# Email Integration Guide

Complete integration of Resend email templates with Supabase Auth.

## Overview

This system uses **Resend** for all branded email delivery with custom templates:
- Welcome emails
- Plan invitations
- Lesson reminders
- Password reset (via Supabase + Resend SMTP)
- Email confirmation (via Supabase + Resend SMTP)

## Architecture

### 1. Welcome Emails (Automated)
**Trigger:** When user confirms their email
**Flow:**
```
User confirms email → Database trigger → email_queue table → Process queue API → Resend
```

### 2. Password Reset & Confirmation (Supabase)
**Method:** Configure Supabase to use Resend as SMTP provider
**Templates:** Managed in Supabase Dashboard

### 3. Plan Invitations & Reminders (Manual/Cron)
**Trigger:** Application logic
**Flow:**
```
User action → Direct Resend API call → Email sent
```

## Setup Instructions

### Step 1: Run Database Migration

```bash
# Apply the email triggers migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250111_auth_email_triggers.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase/migrations/20250111_auth_email_triggers.sql`
3. Run

### Step 2: Configure Supabase Auth to Use Resend SMTP

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Click "SMTP Settings"
3. Configure:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 465 (SSL) or 587 (TLS)
   SMTP User: resend
   SMTP Password: re_bdpxZGuv_M8LfTNbSzwZuUG3PqG5XQNWC
   Sender Email: noreply@mydailybread.faith
   Sender Name: My Daily Bread
   ```

### Step 3: Customize Supabase Email Templates

Go to: Authentication → Email Templates

#### Confirm Signup Template
```html
<h2>Welcome to My Daily Bread!</h2>
<p>Thank you for signing up. Please confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>Or copy and paste this URL: {{ .ConfirmationURL }}</p>
```

#### Reset Password Template
```html
<h2>Reset Your Password</h2>
<p>We received a request to reset your My Daily Bread password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Or copy and paste this URL: {{ .ConfirmationURL }}</p>
```

### Step 4: Set Up Cron Job to Process Email Queue

Add to `vercel.json` (or your deployment platform):

```json
{
  "crons": [
    {
      "path": "/api/emails/process-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Or use an external cron service (cron-job.org, etc):
```bash
curl -X POST https://mydailybread.faith/api/emails/process-queue \
  -H "Authorization: Bearer your-cron-secret"
```

### Step 5: Add Environment Variables

Update `.env` or deployment environment:

```bash
# Resend API
RESEND_API_KEY=re_bdpxZGuv_M8LfTNbSzwZuUG3PqG5XQNWC

# App URL
NEXT_PUBLIC_APP_URL=https://mydailybread.faith

# Cron Secret (optional, for security)
CRON_SECRET=your-random-secret-here
```

## Email Queue System

### How It Works

1. **Database Trigger**: When user confirms email, trigger adds row to `email_queue`
2. **Queue Processor**: Cron job calls `/api/emails/process-queue` every 5 minutes
3. **Send Emails**: Processes up to 10 emails per run using Resend API
4. **Retry Logic**: Failed emails retry up to 3 times
5. **Rate Limiting**: 500ms delay between emails to respect Resend limits

### Monitor Queue Status

```bash
curl https://mydailybread.faith/api/emails/process-queue
```

Returns:
```json
{
  "queue": {
    "pending": 5,
    "sent": 120,
    "failed": 2
  }
}
```

### Manually Process Queue

```bash
curl -X POST https://mydailybread.faith/api/emails/process-queue \
  -H "Authorization: Bearer your-cron-secret"
```

## Email Templates

### Available Templates

1. **Welcome Email** (`sendWelcomeEmail`)
   - Sent after email confirmation
   - Includes Psalm 1:1-2
   - Features list and CTA to dashboard

2. **Plan Invitation** (`sendPlanInviteEmail`)
   - Sent when sharing a plan
   - Includes Proverbs 27:17
   - Shows plan details and personal message

3. **Lesson Reminder** (`sendLessonReminderEmail`)
   - Sent for overdue lessons
   - Includes Hebrews 3:15
   - Lists overdue lessons with CTAs

### Calling Templates Directly

```typescript
import { sendWelcomeEmail, sendPlanInviteEmail, sendLessonReminderEmail } from '@/lib/email/helpers'

// Send welcome email
await sendWelcomeEmail('user@example.com', {
  firstName: 'John',
  dashboardUrl: 'https://mydailybread.faith/dashboard'
})

// Send plan invitation
await sendPlanInviteEmail('friend@example.com', {
  inviterName: 'John',
  planTitle: 'Psalms of Comfort',
  planDescription: 'A 10-day journey...',
  joinUrl: 'https://mydailybread.faith/join/abc123',
  personalMessage: 'I think you\'ll love this!'
})

// Send lesson reminder
await sendLessonReminderEmail('user@example.com', {
  firstName: 'John',
  overdueLessons: [
    {
      planTitle: 'Gospel of John',
      lessonTitle: 'John 3:16',
      daysOverdue: 2,
      lessonUrl: 'https://mydailybread.faith/plans/123/lessons/1'
    }
  ]
})
```

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**
   ```bash
   # Verify key is set
   echo $RESEND_API_KEY
   ```

2. **Check Email Queue**
   ```bash
   # View pending emails in database
   SELECT * FROM email_queue WHERE sent_at IS NULL;
   ```

3. **Check Cron Job**
   - Verify cron is running
   - Check logs for errors
   - Manually trigger: `curl -X POST /api/emails/process-queue`

4. **Check Rate Limits**
   - Resend free tier: 100 emails/day
   - System sends max 10 emails per cron run
   - 500ms delay between emails

### Failed Emails

View failed emails:
```sql
SELECT * FROM email_queue
WHERE sent_at IS NULL
AND attempts >= 3;
```

Retry failed email:
```sql
UPDATE email_queue
SET attempts = 0, error = NULL
WHERE id = 'email-id-here';
```

### Testing

Test email queue system:
```bash
# 1. Create test user
# 2. Confirm their email
# 3. Check email_queue table
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;

# 4. Manually trigger queue processor
curl -X POST http://localhost:3001/api/emails/process-queue

# 5. Check user's inbox
```

## Resend Dashboard

Monitor email delivery:
- Dashboard: https://resend.com/emails
- API Keys: https://resend.com/api-keys
- Logs: View delivery status, opens, clicks
- Analytics: Track email performance

## Rate Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- 2 requests/second

**System Safeguards:**
- Max 10 emails per cron run
- 500ms delay between sends
- 5-minute cron interval
- = Max 120 emails/hour (within limits)

## Future Enhancements

1. **Email Preferences**
   - Let users opt out of reminders
   - Choose email frequency
   - Manage subscriptions

2. **Email Analytics**
   - Track open rates
   - Track click rates
   - A/B test templates

3. **Additional Templates**
   - Weekly digests
   - Achievement emails
   - Social features

4. **Advanced Features**
   - Email scheduling
   - Personalized send times
   - Dynamic content based on user progress
