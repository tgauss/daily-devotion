/**
 * Email Helper Utilities with Resend Integration
 *
 * Beautiful, branded email templates for My Daily Bread
 * Free tier: 3,000 emails/month, 100 emails/day
 *
 * Design Principles:
 * - Black text on white backgrounds for maximum readability
 * - Clear visual hierarchy with strong contrast
 * - Simple, clean layouts
 * - Professional and inspiring
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: params.from || 'My Daily Bread <noreply@mydailybread.faith>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    if (error) {
      console.error('Email send error:', error)
      return false
    }

    console.log('Email sent successfully:', { id: data?.id, to: params.to, subject: params.subject })
    return true
  } catch (error) {
    console.error('Email send failed:', error)
    return false
  }
}

/**
 * Base email template with My Daily Bread branding
 * Maximum contrast and readability
 */
function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>My Daily Bread</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    @media (prefers-color-scheme: dark) {
      .email-container { background-color: #1a1a1a !important; }
      .email-content { background-color: #2d2d2d !important; }
      .text-dark { color: #e5e5e5 !important; }
      .border-color { border-color: #4a4a4a !important; }
      .card-bg { background-color: #3a3a3a !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-content" style="max-width: 600px; width: 100%; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #5a5e3f; padding: 40px 30px; text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/my-daily-break-logo.png" alt="My Daily Bread" width="80" height="80" style="display: block; margin: 0 auto 16px auto; border-radius: 8px;">
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 0.5px;">
                My Daily Bread
              </h1>
              <p style="margin: 0; color: #ffffff; font-size: 15px; font-style: italic; opacity: 0.9;">
                Man shall not live by bread alone — Matthew 4:4
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 2px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 15px; font-weight: 600;">
                Nourishing your faith, one day at a time
              </p>
              <p style="margin: 0 0 15px 0; color: #555555; font-size: 13px; line-height: 1.5;">
                My Daily Bread<br>
                Daily Bible study and spiritual growth
              </p>
              <p style="margin: 0; color: #888888; font-size: 12px;">
                © ${new Date().getFullYear()} My Daily Bread. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Outlook-compatible button
 */
function getButtonHTML(url: string, text: string): string {
  return `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="#5a5e3f">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${text}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="${url}" style="display: inline-block; background-color: #5a5e3f; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 5px; font-weight: bold; font-size: 16px; line-height: 1.2;">${text}</a>
    <!--<![endif]-->
  `
}

/**
 * Plan Invitation Email Data
 */
export interface PlanInviteEmailData {
  inviterName: string
  planTitle: string
  planDescription: string
  joinUrl: string
  personalMessage?: string
}

/**
 * Plan Invitation Email Template
 */
export function getPlanInviteEmailHTML(data: PlanInviteEmailData): string {
  const content = `
    <!-- Opening Scripture -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 8px 0; color: #000000; font-size: 16px; line-height: 1.6; font-style: italic;">
            "As iron sharpens iron, so one person sharpens another."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">
            PROVERBS 27:17
          </p>
        </td>
      </tr>
    </table>

    <h2 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 26px; font-weight: 700; line-height: 1.3;">
      You're Invited to Join a Bible Study
    </h2>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      <strong>${data.inviterName}</strong> has invited you to join their reading plan on My Daily Bread.
    </p>

    <!-- Plan Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg border-color" style="background-color: #f9f9f9; border: 2px solid #5a5e3f; border-radius: 8px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <h3 class="text-dark" style="margin: 0 0 12px 0; color: #000000; font-size: 20px; font-weight: 700; line-height: 1.3;">
            ${data.planTitle}
          </h3>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 16px; line-height: 1.6;">
            ${data.planDescription}
          </p>
        </td>
      </tr>
    </table>

    ${data.personalMessage ? `
    <!-- Personal Message -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <p class="text-dark" style="margin: 0 0 12px 0; color: #000000; font-size: 16px; line-height: 1.7; font-style: italic;">
            "${data.personalMessage}"
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 14px; font-weight: 600;">
            — ${data.inviterName}
          </p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          ${getButtonHTML(data.joinUrl, 'Join Reading Plan')}
        </td>
      </tr>
    </table>

    <!-- Benefits -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg border-color" style="background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 6px; margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 25px;">
          <p class="text-dark" style="margin: 0 0 15px 0; color: #000000; font-size: 16px; font-weight: 700;">
            What you'll get:
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 15px; line-height: 1.8;">
            • Personalized Bible reading plans<br>
            • AI-generated lessons and insights<br>
            • Track your progress and growth<br>
            • Join community studies
          </p>
        </td>
      </tr>
    </table>

    <p class="text-dark" style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5; text-align: center;">
      Don't have an account? Creating one is quick and free.
    </p>
  `

  return getEmailTemplate(content)
}

/**
 * Lesson Reminder Email Data
 */
export interface LessonReminderEmailData {
  firstName: string
  overdueLessons: Array<{
    planTitle: string
    lessonTitle: string
    daysOverdue: number
    lessonUrl: string
  }>
}

/**
 * Lesson Reminder Email Template
 */
export function getLessonReminderEmailHTML(data: LessonReminderEmailData): string {
  const lessonCount = data.overdueLessons.length
  const lessonList = data.overdueLessons.map((lesson, index) => `
    <tr>
      <td style="padding: 20px; ${index < data.overdueLessons.length - 1 ? 'border-bottom: 1px solid #dddddd;' : ''}">
        <h4 class="text-dark" style="margin: 0 0 8px 0; color: #000000; font-size: 18px; font-weight: 700;">
          ${lesson.planTitle}
        </h4>
        <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 15px; line-height: 1.5;">
          ${lesson.lessonTitle}
        </p>
        <p style="margin: 0 0 15px 0; color: #cc0000; font-size: 14px; font-weight: bold;">
          ${lesson.daysOverdue} day${lesson.daysOverdue > 1 ? 's' : ''} overdue
        </p>
        <a href="${lesson.lessonUrl}" style="color: #5a5e3f; text-decoration: none; font-weight: bold; font-size: 15px;">
          Continue Reading →
        </a>
      </td>
    </tr>
  `).join('')

  const content = `
    <!-- Opening Scripture -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 8px 0; color: #000000; font-size: 16px; line-height: 1.6; font-style: italic;">
            "Today, if you hear his voice, do not harden your hearts."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">
            HEBREWS 3:15
          </p>
        </td>
      </tr>
    </table>

    <h2 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 26px; font-weight: 700; line-height: 1.3;">
      Don't miss your daily bread, ${data.firstName}
    </h2>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      You have <strong>${lessonCount} lesson${lessonCount > 1 ? 's' : ''}</strong> waiting for you. Let's get back on track with your spiritual growth.
    </p>

    <!-- Lessons List -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="border-color" style="background-color: #ffffff; border: 2px solid #5a5e3f; border-radius: 8px; margin: 0 0 30px 0; overflow: hidden;">
      ${lessonList}
    </table>

    <!-- Scripture Quote -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 25px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 17px; line-height: 1.6; font-style: italic;">
            "Man shall not live by bread alone, but by every word that comes from the mouth of God."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">
            MATTHEW 4:4
          </p>
        </td>
      </tr>
    </table>

    <p class="text-dark" style="margin: 0; color: #555555; font-size: 14px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="color: #5a5e3f; text-decoration: underline; font-weight: 600;">
        Update your email preferences
      </a>
    </p>
  `

  return getEmailTemplate(content)
}

/**
 * Welcome Email Data
 */
export interface WelcomeEmailData {
  firstName: string
  dashboardUrl: string
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailHTML(data: WelcomeEmailData): string {
  const content = `
    <!-- Opening Scripture -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 8px 0; color: #000000; font-size: 16px; line-height: 1.6; font-style: italic;">
            "Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers, but whose delight is in the law of the Lord, and who meditates on his law day and night."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">
            PSALM 1:1-2
          </p>
        </td>
      </tr>
    </table>

    <h2 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 26px; font-weight: 700; line-height: 1.3;">
      Welcome to Your Spiritual Journey, ${data.firstName}
    </h2>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      Thank you for joining My Daily Bread! We're honored to walk with you through God's Word as you grow in faith and understanding.
    </p>

    <!-- Scripture Quote -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 25px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 18px; line-height: 1.6; font-style: italic;">
            "Your word is a lamp to my feet and a light to my path."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">
            PSALM 119:105
          </p>
        </td>
      </tr>
    </table>

    <h3 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 20px; font-weight: 700;">
      Your account is ready — here's what you can do:
    </h3>

    <!-- Features -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg border-color" style="background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 6px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 15px; line-height: 1.8;">
            • <strong>Create Reading Plans</strong> — Guided, custom, or imported<br>
            • <strong>AI-Generated Lessons</strong> — Deep insights and reflections<br>
            • <strong>Beautiful Web Stories</strong> — Mobile-optimized reading<br>
            • <strong>Track Progress</strong> — See your spiritual growth<br>
            • <strong>Join Community</strong> — Study with others
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          ${getButtonHTML(data.dashboardUrl, 'Start Your Journey')}
        </td>
      </tr>
    </table>

    <!-- Pro Tip -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px; margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 14px; font-weight: bold; letter-spacing: 0.3px;">
            PRO TIP
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 15px; line-height: 1.6;">
            Start with a short reading plan like "Psalms of Comfort" to get familiar with the platform. Consistency is more important than length!
          </p>
        </td>
      </tr>
    </table>

    <p class="text-dark" style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5; text-align: center;">
      Need help? Just reply to this email — we're here for you.
    </p>
  `

  return getEmailTemplate(content)
}

/**
 * Send a plan invitation email
 */
export async function sendPlanInviteEmail(
  to: string,
  data: PlanInviteEmailData
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${data.inviterName} invited you to join "${data.planTitle}"`,
    html: getPlanInviteEmailHTML(data),
  })
}

/**
 * Send lesson reminder email
 */
export async function sendLessonReminderEmail(
  to: string,
  data: LessonReminderEmailData
): Promise<boolean> {
  const lessonCount = data.overdueLessons.length
  return sendEmail({
    to,
    subject: `${lessonCount} overdue lesson${lessonCount > 1 ? 's' : ''} waiting for you`,
    html: getLessonReminderEmailHTML(data),
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Welcome to My Daily Bread — Your Spiritual Journey Begins',
    html: getWelcomeEmailHTML(data),
  })
}

/**
 * Email Verification Data
 */
export interface EmailVerificationData {
  firstName: string
  verificationUrl: string
}

/**
 * Email Verification Template
 */
export function getEmailVerificationHTML(data: EmailVerificationData): string {
  const content = `
    <h2 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 26px; font-weight: 700; line-height: 1.3;">
      Welcome to My Daily Bread${data.firstName ? `, ${data.firstName}` : ''}!
    </h2>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      Thank you for joining our community! We're excited to support your daily spiritual growth journey.
    </p>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      Click the button below to verify your email address and get started:
    </p>

    <!-- CTA -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          ${getButtonHTML(data.verificationUrl, 'Verify Email Address')}
        </td>
      </tr>
    </table>

    <!-- Alternative Link -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg" style="background-color: #f9f9f9; border-radius: 6px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; color: #5a5e3f; font-size: 13px; word-break: break-all;">
            ${data.verificationUrl}
          </p>
        </td>
      </tr>
    </table>

    <!-- Scripture Quote -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffef5; border-left: 4px solid #d4af37; border-radius: 4px; margin: 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p class="text-dark" style="margin: 0 0 8px 0; color: #000000; font-size: 16px; line-height: 1.6; font-style: italic;">
            "Man shall not live by bread alone, but by every word that comes from the mouth of God."
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">
            MATTHEW 4:4
          </p>
        </td>
      </tr>
    </table>
  `

  return getEmailTemplate(content)
}

/**
 * Password Reset Data
 */
export interface PasswordResetData {
  firstName: string
  resetUrl: string
}

/**
 * Password Reset Template
 */
export function getPasswordResetHTML(data: PasswordResetData): string {
  const content = `
    <h2 class="text-dark" style="margin: 0 0 20px 0; color: #000000; font-size: 26px; font-weight: 700; line-height: 1.3;">
      Reset Your Password
    </h2>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      Hi${data.firstName ? ` ${data.firstName}` : ''},
    </p>

    <p class="text-dark" style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    <!-- CTA -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          ${getButtonHTML(data.resetUrl, 'Reset Password')}
        </td>
      </tr>
    </table>

    <!-- Alternative Link -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg" style="background-color: #f9f9f9; border-radius: 6px; margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; color: #5a5e3f; font-size: 13px; word-break: break-all;">
            ${data.resetUrl}
          </p>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <p class="text-dark" style="margin: 0 0 10px 0; color: #000000; font-size: 14px; font-weight: bold;">
            Security Notice
          </p>
          <p class="text-dark" style="margin: 0; color: #000000; font-size: 14px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email or contact us if you have concerns. This link will expire in 1 hour.
          </p>
        </td>
      </tr>
    </table>
  `

  return getEmailTemplate(content)
}

/**
 * Send email verification
 */
export async function sendEmailVerification(
  to: string,
  data: EmailVerificationData
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Verify Your Email — My Daily Bread',
    html: getEmailVerificationHTML(data),
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetData
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Reset Your Password — My Daily Bread',
    html: getPasswordResetHTML(data),
  })
}
