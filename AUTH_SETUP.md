# Authentication Setup Guide

Complete guide for configuring Google OAuth, email templates, and authentication features for My Daily Bread.faith.

---

## Table of Contents

1. [Database Migration](#database-migration)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Supabase Email Configuration](#supabase-email-configuration)
4. [Email Templates](#email-templates)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)

---

## Database Migration

### 1. Run the Auth Enhancements Migration

In your Supabase SQL Editor, run:

```bash
supabase/migrations/20250114_auth_enhancements.sql
```

This migration adds:
- ✅ Referral tracking (`referred_by_user_id`, `referral_code`)
- ✅ Email preferences (`email_notifications`, `email_frequency`)
- ✅ Email invite tracking (`sent_to_email`, `sent_at`)
- ✅ Helper functions for referral stats
- ✅ Updated RLS policies

### 2. Verify Migration

```sql
-- Check users table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('referred_by_user_id', 'referral_code', 'email_notifications', 'email_frequency');

-- Check all existing users have referral codes
SELECT COUNT(*) as users_with_codes
FROM public.users
WHERE referral_code IS NOT NULL;
```

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Search for "Google+ API" in APIs & Services
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `My Daily Bread.faith`

4. **Configure Authorized Redirect URIs**

   Add these redirect URIs (one for local, one for production):

   ```
   http://localhost:3000/auth/callback
   https://mydailybread.faith/auth/callback
   ```

5. **Save Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

### Step 2: Configure Supabase Google Provider

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in sidebar
   - Click "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the provider list
   - Toggle it **ON**

4. **Add Google Credentials**
   - Paste **Client ID** from Step 1
   - Paste **Client Secret** from Step 1
   - Click "Save"

5. **Configure Redirect URL**
   - Supabase shows your callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
   - This is automatically configured (no action needed)

### Step 3: Update Environment Variables

Add to your `.env.local`:

```env
# Google OAuth (optional - managed by Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** The client ID is embedded in Supabase, so this is optional. Only needed if you want to customize the Google button.

---

## Supabase Email Configuration

### Step 1: Configure Email Settings

1. **Go to Supabase Dashboard → Project Settings → Auth**

2. **Email Auth Settings**
   - ✅ Enable Email Provider
   - ✅ Confirm Email: **ON** (users must verify email)
   - Double Confirm Email: OFF
   - Secure Email Change: ON

3. **Email Rate Limits**
   - Set appropriate rate limits (default: 4 emails/hour per user)

### Step 2: Configure SMTP (Optional for Production)

For production, use custom SMTP instead of Supabase's default:

1. **Go to: Project Settings → Auth → SMTP Settings**

2. **Recommended Providers:**
   - **Resend.com** (3,000 free emails/month, modern API)
   - **SendGrid** (100 emails/day free)
   - **Postmark** (100 emails/month free)

3. **SMTP Configuration Example (Resend):**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender Email: noreply@mydailybread.faith
   Sender Name: My Daily Bread
   ```

### Step 3: Set Up Custom Domain (Production)

1. **Add DNS Records**
   - Add SPF record: `v=spf1 include:_spf.supabase.co ~all`
   - Add DKIM record (provided by Supabase/SMTP provider)

2. **Verify Domain**
   - Follow Supabase verification steps
   - Wait for DNS propagation (up to 48 hours)

---

## Email Templates

Supabase provides default email templates. Customize them with My Daily Bread branding:

### Step 1: Access Email Templates

1. **Go to: Authentication → Email Templates**

2. **Available Templates:**
   - Confirm Signup
   - Magic Link
   - Change Email Address
   - Reset Password

### Step 2: Customize Templates

#### Example: Confirm Signup Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .tagline {
      color: #6b7280;
      font-size: 14px;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📖 My Daily Bread</div>
      <div class="tagline">Man shall not live by bread alone - Matthew 4:4</div>
    </div>

    <h1>Welcome to Your Daily Spiritual Journey!</h1>

    <p>Thank you for joining My Daily Bread.faith! We're excited to walk with you through God's Word.</p>

    <p>To get started, please confirm your email address by clicking the button below:</p>

    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email</a>
    </div>

    <p>Once confirmed, you'll be able to:</p>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>📖 Create personalized Bible reading plans</li>
      <li>🤖 Get AI-generated lessons and insights</li>
      <li>📱 Read beautiful Web Stories on any device</li>
      <li>✅ Track your progress and growth</li>
      <li>👥 Join community reading plans</li>
    </ul>

    <p>If you didn't create an account, you can safely ignore this email.</p>

    <div class="footer">
      <p>This email was sent by My Daily Bread.faith<br>
      Questions? Reply to this email for support.</p>
    </div>
  </div>
</body>
</html>
```

#### Example: Reset Password Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📖 My Daily Bread</div>
      <div class="tagline">Man shall not live by bread alone - Matthew 4:4</div>
    </div>

    <h1>Reset Your Password</h1>

    <p>We received a request to reset your password for your My Daily Bread account.</p>

    <p>Click the button below to create a new password:</p>

    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    </div>

    <p style="color: #ef4444; font-weight: 600;">This link expires in 1 hour for security.</p>

    <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>

    <div class="footer">
      <p>This email was sent by My Daily Bread.faith<br>
      Questions? Reply to this email for support.</p>
    </div>
  </div>
</body>
</html>
```

### Step 3: Save Templates

- Click "Save" for each template
- Send test emails to verify formatting
- Check spam folder if emails don't arrive

---

## Environment Variables

### Complete `.env.local` Configuration

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Bible APIs
ESV_API_KEY=320cff8ad7c7d420c62ebf558fbeb2cc37622e2f
API_BIBLE_KEY=your-api-bible-key

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# OAuth (Optional - managed by Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Production Environment Variables (Vercel)

Add all above variables in Vercel Dashboard:
- Go to: Project Settings → Environment Variables
- Add each variable for **Production**, **Preview**, and **Development**

---

## Testing

### Test Google OAuth Flow

1. **Clear Browser Cache & Cookies**
   - Ensures fresh OAuth flow

2. **Test Signup**
   - Go to `/auth`
   - Click "Continue with Google"
   - Select Google account
   - Verify redirect to `/dashboard`
   - Check database for new user record

3. **Test Login**
   - Sign out
   - Go to `/auth`
   - Click "Continue with Google"
   - Verify auto-login (no password needed)

4. **Check User Profile**
   - Verify `first_name`, `last_name`, `avatar_url` populated from Google
   - Verify `referral_code` generated automatically

### Test Email Flows

1. **Test Email Confirmation**
   - Create account with email/password
   - Check email inbox
   - Click confirmation link
   - Verify redirect and login

2. **Test Password Reset**
   - Go to `/auth`
   - Click "Forgot Password?"
   - Enter email
   - Check inbox for reset link
   - Reset password and login

3. **Test Referral Tracking**
   - Get referral link from dashboard: `/auth?ref=abc12345`
   - Sign up new user with this link
   - Check database: new user's `referred_by_user_id` should be set
   - Check referrer's stats show +1 referral

### Test Email Preferences

1. **Update Preferences**
   - Go to `/profile` (or settings page)
   - Toggle email notifications
   - Change frequency (daily/weekly/off)
   - Verify saved in database

2. **Test Lesson Reminders**
   - Trigger cron job manually or wait for scheduled run
   - Verify emails sent only to users with `email_notifications = true`
   - Verify frequency respected

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Solution: Add exact callback URL to Google Cloud Console
- Must match: `http://localhost:3000/auth/callback` (local) or `https://mydailybread.faith/auth/callback` (prod)

**Error: "Access blocked: This app's request is invalid"**
- Solution: Enable Google+ API in Google Cloud Console
- Solution: Verify OAuth consent screen is configured

**Users not created in database**
- Solution: Check `handle_new_user()` trigger exists
- Solution: Run migration `20250114_auth_enhancements.sql`

### Email Issues

**Emails not sending**
- Check Supabase logs: Dashboard → Logs → Auth
- Verify email provider is enabled
- Check SMTP credentials if using custom provider
- Verify sender email domain is verified

**Emails going to spam**
- Add SPF and DKIM DNS records
- Use verified custom domain
- Avoid spam trigger words in subject/body

**Confirmation links not working**
- Check redirect URL in Supabase settings
- Verify middleware allows `/auth/callback` route
- Check browser console for errors

### Referral Tracking Issues

**Referral codes not generated**
- Run migration: `20250114_auth_enhancements.sql`
- Check `generate_referral_code()` function exists
- Manually update: `UPDATE users SET referral_code = generate_referral_code() WHERE referral_code IS NULL`

**Referrals not tracked**
- Check URL has `?ref=` parameter
- Verify signup flow captures `ref` from query string
- Check `referred_by_user_id` in database

---

## Security Checklist

- ✅ Email confirmation enabled
- ✅ RLS policies protect user data
- ✅ Service role key never exposed to client
- ✅ OAuth redirect URLs whitelisted
- ✅ HTTPS enforced in production
- ✅ Rate limiting enabled for emails
- ✅ Referral codes are unique and random
- ✅ Password reset links expire in 1 hour

---

## Next Steps

1. **Run database migration** in Supabase SQL Editor
2. **Configure Google OAuth** in Google Cloud Console and Supabase
3. **Customize email templates** with My Daily Bread branding
4. **Test all flows** (signup, login, password reset, referrals)
5. **Deploy to production** and update OAuth redirect URLs
6. **Monitor logs** for any auth errors

---

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Project Issues**: Open a GitHub issue for bugs or questions

Built with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
