# Custom Signup with Resend Email Verification

## What Was Fixed

### 1. Database Trigger Error ✅
**Problem:** `Database error saving new user` when trying to sign up

**Root Cause:** A failing database trigger on `auth.users` table that tried to create `public.users` records

**Fix:**
```sql
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

The signup API now manually creates the `public.users` record instead of relying on database triggers.

### 2. TypeScript Build Error ✅
**Problem:** Vercel deployment failed with "Property 'password' is missing"

**Fix:** Added `password` parameter to `generateLink()` call in `app/api/auth/signup/route.ts:73`

## How It Works Now

### Signup Flow:
1. User fills out form at `/signup`
2. Form calls `/api/auth/signup` with email, password, firstName, lastName
3. API creates user in `auth.users` using Admin API
4. API manually creates record in `public.users` with referral code
5. API generates email verification link
6. API sends branded email via Resend
7. User receives email and clicks link
8. User is redirected to `/auth/callback` and logged in
9. User lands on `/dashboard`

## Configuration Checklist

### ✅ Local (.env.local)
- [x] `RESEND_API_KEY` - Set and working
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Set and working
- [x] `NEXT_PUBLIC_APP_URL` - Should be `http://localhost:3001` for dev

### 🔲 Vercel Environment Variables
Make sure these are set in your Vercel project settings:
- [ ] `RESEND_API_KEY` - Your Resend API key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://mydailybread.faith`)

### 🔲 Supabase Dashboard
1. **Disable default email confirmations:**
   - Go to Authentication → Providers → Email
   - Toggle OFF "Enable email confirmations"
   - This prevents Supabase from sending duplicate emails

2. **Configure redirect URLs:**
   - Go to Authentication → URL Configuration
   - Add to "Redirect URLs":
     - `https://www.mydailybread.faith/auth/callback`
     - `https://mydailybread.faith/auth/callback`
     - `http://localhost:3001/auth/callback` (for development)

3. **Verify trigger is disabled:**
   - The `handle_new_user` trigger should be dropped (already done)
   - API now handles user creation manually

## Testing the Flow

### Local Testing:
1. Go to `http://localhost:3001/signup`
2. Fill out the form with a real email address
3. Click "Create Account"
4. Check server logs for:
   ```
   Attempting to send verification email to: [email]
   ✅ Verification email sent successfully to: [email]
   ```
5. Check your email inbox
6. Click the verification link
7. Should be logged in and redirected to dashboard

### What to Check if Emails Aren't Sending:

1. **Check Resend Dashboard** - https://resend.com/emails
   - See if emails are showing up in the logs
   - Check for any API errors

2. **Check Server Logs** - Look for:
   - `❌ Failed to send verification email` - Email sending failed
   - `Email send error:` - Specific error from Resend API

3. **Verify Resend API Key**:
   ```bash
   # Should show key (masked)
   grep RESEND_API_KEY .env.local
   ```

4. **Test Resend directly**:
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer YOUR_RESEND_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "My Daily Bread <noreply@mydailybread.faith>",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>This is a test</p>"
     }'
   ```

## Troubleshooting

### Signup succeeds but no email received:
- Check spam folder
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- Verify the "from" address is verified in Resend

### "Database error saving new user":
- Make sure you ran `DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;` in Supabase SQL Editor
- Check that trigger is not recreated

### TypeScript build errors on deploy:
- Run `npm run build` locally to test
- All builds should pass now after latest fix

### Email verification link doesn't work:
- Check redirect URLs are configured in Supabase
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that `/auth/callback` route exists and works

## Files Modified

- `app/api/auth/signup/route.ts` - Custom signup API with Resend integration
- `lib/email/helpers.ts` - Email verification template
- `components/auth/signup-form.tsx` - Form that calls custom API
- `app/signup/page.tsx` - Dedicated signup page
- `docs/DISABLE_SUPABASE_EMAILS.md` - Complete documentation

## Next Steps

1. Test signup on production once Vercel deploys
2. Disable Supabase email confirmations (see checklist above)
3. Add `RESEND_API_KEY` to Vercel if not already there
4. Consider adding password reset flow with Resend (future enhancement)
