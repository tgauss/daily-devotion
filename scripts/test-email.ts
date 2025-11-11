/**
 * Test Email Script
 * Tests Resend integration with beautiful branded templates
 *
 * Usage: npx tsx scripts/test-email.ts
 */

import 'dotenv/config'
import { sendWelcomeEmail, sendPlanInviteEmail, sendLessonReminderEmail } from '../lib/email/helpers'

async function testEmails() {
  console.log('📧 Testing Resend Email Integration...\n')

  const TEST_EMAIL = 'tgaussoin@gmail.com'

  console.log(`📮 Sending test emails to: ${TEST_EMAIL}\n`)

  // Test 1: Welcome Email
  console.log('1️⃣  Testing Welcome Email...')
  const welcomeResult = await sendWelcomeEmail(TEST_EMAIL, {
    firstName: 'Friend',
    dashboardUrl: 'https://mydailybread.faith/dashboard',
  })
  console.log(welcomeResult ? '   ✅ Welcome email sent!' : '   ❌ Welcome email failed')
  console.log('')

  // Test 2: Plan Invitation Email
  console.log('2️⃣  Testing Plan Invitation Email...')
  const inviteResult = await sendPlanInviteEmail(TEST_EMAIL, {
    inviterName: 'John',
    planTitle: 'Psalms of Comfort',
    planDescription: 'A 10-day journey through the most comforting psalms in Scripture. Find peace and encouragement in God\'s Word.',
    joinUrl: 'https://mydailybread.faith/join/test123',
    personalMessage: 'I think you would really enjoy this study! These psalms have been such a blessing to me.',
  })
  console.log(inviteResult ? '   ✅ Plan invitation sent!' : '   ❌ Plan invitation failed')
  console.log('')

  // Test 3: Lesson Reminder Email
  console.log('3️⃣  Testing Lesson Reminder Email...')
  const reminderResult = await sendLessonReminderEmail(TEST_EMAIL, {
    firstName: 'Friend',
    overdueLessons: [
      {
        planTitle: 'Psalms of Comfort',
        lessonTitle: 'Psalm 23 - The Lord is My Shepherd',
        daysOverdue: 2,
        lessonUrl: 'https://mydailybread.faith/plans/123/lessons/1',
      },
      {
        planTitle: 'Gospel of John',
        lessonTitle: 'John 3:16 - For God So Loved the World',
        daysOverdue: 1,
        lessonUrl: 'https://mydailybread.faith/plans/456/lessons/5',
      },
    ],
  })
  console.log(reminderResult ? '   ✅ Lesson reminder sent!' : '   ❌ Lesson reminder failed')
  console.log('')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Test Summary:')
  console.log(`   Welcome Email: ${welcomeResult ? '✅' : '❌'}`)
  console.log(`   Plan Invitation: ${inviteResult ? '✅' : '❌'}`)
  console.log(`   Lesson Reminder: ${reminderResult ? '✅' : '❌'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📬 Check your inbox (and spam folder) for the test emails!')
  console.log('🎨 The emails should have beautiful My Daily Bread branding')
  console.log('')
}

testEmails().catch(console.error)
