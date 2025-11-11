import {
  getWelcomeEmailHTML,
  getPlanInviteEmailHTML,
  getLessonReminderEmailHTML
} from '@/lib/email/helpers'

export default function EmailPreviewPage() {
  // Sample data for each email type
  const welcomeHTML = getWelcomeEmailHTML({
    firstName: 'Friend',
    dashboardUrl: 'https://mydailybread.faith/dashboard',
  })

  const planInviteHTML = getPlanInviteEmailHTML({
    inviterName: 'John',
    planTitle: 'Psalms of Comfort',
    planDescription: 'A 10-day journey through the most comforting psalms in Scripture. Find peace and encouragement in God\'s Word.',
    joinUrl: 'https://mydailybread.faith/join/test123',
    personalMessage: 'I think you would really enjoy this study! These psalms have been such a blessing to me.',
  })

  const lessonReminderHTML = getLessonReminderEmailHTML({
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

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Email Template Preview
        </h1>
        <p className="text-slate-300 text-center mb-12">
          Preview of branded email templates for My Daily Bread.faith
        </p>

        <div className="space-y-12">
          {/* Welcome Email */}
          <EmailPreview
            title="1. Welcome Email"
            description="Sent to new users after signup"
            html={welcomeHTML}
          />

          {/* Plan Invitation Email */}
          <EmailPreview
            title="2. Plan Invitation Email"
            description="Sent when sharing a plan with someone"
            html={planInviteHTML}
          />

          {/* Lesson Reminder Email */}
          <EmailPreview
            title="3. Lesson Reminder Email"
            description="Sent to remind users about overdue lessons"
            html={lessonReminderHTML}
          />
        </div>
      </div>
    </div>
  )
}

function EmailPreview({ title, description, html }: { title: string; description: string; html: string }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        <iframe
          srcDoc={html}
          className="w-full h-[800px] border-0"
          title={title}
          sandbox="allow-same-origin"
        />
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-slate-300 hover:text-white transition-colors">
          View HTML Source
        </summary>
        <pre className="mt-2 bg-slate-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
          {html}
        </pre>
      </details>
    </div>
  )
}
