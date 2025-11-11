# Email Integration - Quick Start

## TL;DR

1. Run the migration in Supabase SQL Editor
2. Set up a cron job to process emails every 5 minutes
3. Done! Welcome emails send automatically when users confirm their email

## Step 1: Run Migration (Required)

Copy the contents of `supabase/migrations/20250111_email_queue_system.sql` and run it in your Supabase SQL Editor.

This creates:
- ✅ `email_queue` table - Stores emails to be sent
- ✅ Helper functions - Queue emails from your app
- ✅ No `auth.users` triggers - Avoids permission errors

## Step 2: How It Works

**Welcome Emails (Automatic)**
```
User signs up → Confirms email → Auth callback → Queue welcome email → Cron sends it
```

The welcome email is queued in `/app/auth/callback/route.ts` when users confirm their email.

**Other Emails (Manual)**
```typescript
// Queue a plan invitation
await supabase.rpc('queue_plan_invite_email', {
  p_recipient_email: 'friend@example.com',
  p_inviter_name: 'John',
  p_plan_title: 'Psalms of Comfort',
  p_plan_description: 'A 10-day journey...',
  p_join_url: 'https://mydailybread.faith/join/abc',
  p_personal_message: 'You\'ll love this!'
})

// Queue a lesson reminder
await supabase.rpc('queue_lesson_reminder_email', {
  p_user_id: userId,
  p_email: 'user@example.com',
  p_first_name: 'John',
  p_overdue_lessons: [
    {
      planTitle: 'Gospel of John',
      lessonTitle: 'John 3:16',
      daysOverdue: 2,
      lessonUrl: 'https://mydailybread.faith/plans/123/lessons/1'
    }
  ]
})
```

## Step 3: Set Up Cron Job

### Option A: Vercel Cron (Recommended)

Add to `vercel.json`:
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

### Option B: External Cron Service

Use cron-job.org or similar:
```bash
# Run every 5 minutes
curl -X POST https://mydailybread.faith/api/emails/process-queue \
  -H "Authorization: Bearer your-cron-secret"
```

### Option C: Manual Testing

```bash
# Process queue manually
curl -X POST http://localhost:3001/api/emails/process-queue

# Check queue status
curl http://localhost:3001/api/emails/process-queue
```

## Step 4: Test It!

1. **Create a test user** via your signup form
2. **Check email** - Supabase sends confirmation email
3. **Click confirm link** - This triggers the auth callback
4. **Check database**:
   ```sql
   SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;
   ```
5. **Process queue manually**:
   ```bash
   curl -X POST http://localhost:3001/api/emails/process-queue
   ```
6. **Check your inbox** - Welcome email should arrive!

## Monitoring

### Check Queue Status
```bash
curl http://localhost:3001/api/emails/process-queue
```

Returns:
```json
{
  "queue": {
    "pending": 3,
    "sent": 45,
    "failed": 1
  }
}
```

### View Queue in Database
```sql
-- Pending emails
SELECT * FROM email_queue WHERE sent_at IS NULL;

-- Failed emails
SELECT * FROM email_queue WHERE attempts >= 3 AND sent_at IS NULL;

-- Recently sent
SELECT * FROM email_queue WHERE sent_at IS NOT NULL ORDER BY sent_at DESC LIMIT 10;
```

## Troubleshooting

### No emails being sent?

1. **Check Resend API key**:
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check queue**:
   ```sql
   SELECT * FROM email_queue WHERE sent_at IS NULL;
   ```

3. **Manually process**:
   ```bash
   curl -X POST http://localhost:3001/api/emails/process-queue
   ```

4. **Check logs** for errors

### Welcome email not queued?

The welcome email is queued in `/app/auth/callback/route.ts`. Check:
- User confirmed their email?
- Auth callback route is being called?
- Check server logs for "Queued welcome email"

### Rate limit errors?

Resend free tier limits:
- 100 emails/day
- 2 requests/second

Solution:
- Upgrade Resend plan
- Or reduce cron frequency

## Next Steps

### Configure Password Reset Emails

1. Go to Supabase → Authentication → Email Templates
2. Configure SMTP to use Resend
3. Customize password reset template

### Send More Email Types

Use the helper functions:
- `queue_welcome_email()` - Welcome new users
- `queue_plan_invite_email()` - Invite to plans
- `queue_lesson_reminder_email()` - Remind about lessons

## Files Modified

- ✅ `supabase/migrations/20250111_email_queue_system.sql` - Database setup
- ✅ `app/api/emails/process-queue/route.ts` - Queue processor
- ✅ `app/auth/callback/route.ts` - Queue welcome emails
- ✅ `lib/email/helpers.ts` - Email templates with logo & scriptures

## Support

Questions? Check:
- Full docs: `EMAIL_INTEGRATION.md`
- Test script: `scripts/test-email.ts`
- Preview: http://localhost:3001/preview-emails
