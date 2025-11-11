import 'dotenv/config'
import { sendLessonReminderEmail } from '../lib/email/helpers'

sendLessonReminderEmail('tgaussoin@gmail.com', {
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
}).then(result => {
  console.log(result ? '✅ Lesson reminder sent!' : '❌ Failed to send')
}).catch(console.error)
