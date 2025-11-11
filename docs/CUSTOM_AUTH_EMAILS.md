# Custom Authentication Emails with Resend

This guide explains how to use your custom Resend email templates for Supabase authentication emails instead of the default Supabase emails.

## Current Setup

Currently, Supabase sends default styled emails for:
- Email verification (signup confirmation)
- Password reset
- Magic link login

## Option 1: Disable Supabase Emails & Use Custom Flow (Recommended)

### Step 1: Disable Supabase Auth Emails

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template (Confirm signup, Reset password, Magic Link):
   - Disable the "Enable email confirmations" toggle
   OR
   - Set a custom SMTP server that doesn't send (to effectively disable)

### Step 2: Send Custom Emails via Resend

We already have this infrastructure in place:

#### For Signup Confirmation:
```typescript
// In app/api/auth/signup/route.ts (create this)
export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json()

  // Create user with Supabase (email confirmation disabled)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) throw error

  // Generate email verification token
  const { data: tokenData } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: email,
  })

  // Send custom email via Resend
  await fetch('/api/email/send', {
    method: 'POST',
    body: JSON.stringify({
      type: 'email_verification',
      to: email,
      data: {
        firstName: firstName,
        verificationUrl: tokenData.properties.action_link,
      }
    })
  })

  return Response.json({ success: true })
}
```

#### For Password Reset:
Similar approach - intercept the password reset request and send custom email.

## Option 2: Customize Supabase Email Templates (Easier)

1. Go to **Authentication** → **Email Templates** in Supabase Dashboard
2. For "Confirm signup" template, paste:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 0; text-align: center;">
              <img src="https://www.mydailybread.faith/my-daily-break-logo.png" alt="My Daily Bread" width="80" height="80" style="display: block; margin: 0 auto 24px;">
              <h1 style="margin: 0 0 16px; color: #3d3429; font-size: 28px; font-weight: bold;">Welcome to My Daily Bread!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 48px;">
              <p style="margin: 0 0 24px; color: #5c5248; font-size: 16px; line-height: 1.6;">
                Thank you for joining our community! We're excited to support your daily spiritual growth journey.
              </p>
              <p style="margin: 0 0 32px; color: #5c5248; font-size: 16px; line-height: 1.6;">
                Click the button below to confirm your email address and get started:
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background-color: #6b5d4f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #8a7f73; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #6b5d4f; font-size: 14px; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px 48px; border-top: 1px solid #e5e1db;">
              <p style="margin: 0 0 8px; color: #8a7f73; font-size: 14px;">
                God bless,<br>
                The My Daily Bread Team
              </p>
              <p style="margin: 16px 0 0; color: #a39a8e; font-size: 12px;">
                "Man shall not live by bread alone, but by every word that proceeds from the mouth of God." - Matthew 4:4
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

3. Save the template
4. Test by creating a new account

## Recommended Approach

**For MVP**: Use Option 2 (Customize Supabase templates) - it's faster and requires no code changes.

**For Production**: Implement Option 1 for full control over email delivery, tracking, and branding consistency with your Resend templates.

## Testing

1. Create a test account
2. Check the email received
3. Verify the confirmation link works and redirects properly

## Current Issue with Redirect URL

The Supabase confirmation URL is currently redirecting to `/?code=...` instead of `/auth/callback?code=...`.

**Fix**: In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Set **Site URL**: `https://www.mydailybread.faith`
- Set **Redirect URLs**:
  - `https://www.mydailybread.faith/auth/callback`
  - `http://localhost:3001/auth/callback` (for development)

This ensures emails link correctly to the auth callback route which handles the session exchange.
