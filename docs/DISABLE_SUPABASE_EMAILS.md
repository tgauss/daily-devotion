# Disabling Supabase Built-in Emails

Now that we're using Resend for all authentication emails, you need to disable Supabase's built-in email system to avoid sending duplicate emails.

## Step 1: Disable Email Confirmations

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find the section "Confirm email"
4. **Toggle OFF** "Enable email confirmations"
5. Click "Save"

This prevents Supabase from sending its own verification emails when users sign up.

## Step 2: Verify Custom Emails Are Working

Test the new flow:

1. Go to `/signup` on your site
2. Create a test account
3. You should receive a beautifully branded email from Resend (not Supabase's default email)
4. Click the verification link
5. You should be logged in automatically and redirected to `/dashboard`

## What We Built

### Custom Signup Flow:
1. User submits signup form
2. API creates user via Supabase Admin API (with `email_confirm: false`)
3. API generates verification link using Supabase
4. API sends branded email via Resend
5. User clicks link → redirected to `/auth/callback` → logged in → dashboard

### Files Created:
- `app/api/auth/signup/route.ts` - Custom signup API
- `lib/email/helpers.ts` - Added email verification and password reset templates
- Updated `components/auth/signup-form.tsx` - Uses new API

### Benefits:
✅ Beautiful branded emails matching your site design
✅ No ".faith TLD" warnings from Supabase
✅ Better deliverability through Resend's infrastructure
✅ Full control over email content and timing
✅ Consistent email design across all communications

## Future: Password Reset

To use Resend for password resets too, you'll need to:

1. Create a custom password reset form that calls an API route
2. The API route generates a reset link using Supabase admin
3. Send the reset email via Resend using the template we created

For now, password resets will still use Supabase's system, but you can migrate that later if needed.

## Troubleshooting

### Emails not sending?
- Check your `RESEND_API_KEY` in `.env.local`
- Check server logs for errors
- Verify Resend dashboard shows the email was sent

### Verification link not working?
- Make sure redirect URLs are configured in Supabase (see main docs)
- Check that `NEXT_PUBLIC_APP_URL` is set correctly in `.env.local`

### User can't log in after verification?
- The auth callback route handles the session exchange
- Check browser console for errors
- Verify the code parameter is being passed to `/auth/callback`

### "Database error saving new user" on signup?
This was caused by a failing database trigger on `auth.users`. **Fixed by running:**
```sql
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

The signup API now manually creates the `public.users` record instead of relying on database triggers, which is more reliable when using the Admin API.
