# Daily Devotion - Bible Study Web App

A mobile-first Bible study app that creates personalized reading plans, generates AI-powered lessons, and delivers content as beautiful tappable Web Stories.

## Features

- **📖 Study Plans**: Create guided, custom, or imported Bible reading plans
- **🤖 AI-Powered Lessons**: Automatically generate engaging lesson content with context, takeaways, and discussion questions
- **📱 Web Stories**: Read lessons as tappable, mobile-friendly stories
- **✅ Quizzes**: Test comprehension with auto-generated multiple-choice quizzes
- **📊 Progress Tracking**: Monitor your study progress and quiz scores
- **🔔 Smart Nudges**: In-app reminders for overdue lessons
- **🔗 Shareable Links**: Share lessons publicly via unique URLs

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Bible API**: ESV API (free for non-commercial use)
- **AI**: OpenAI GPT-4 for lesson generation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key
- ESV API key (provided in `.env.example`)

### 1. Clone and Install

```bash
git clone <repository-url>
cd daily-devotion
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
# Supabase (get from Supabase dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ESV API (already included in .env.example)
ESV_API_KEY=320cff8ad7c7d420c62ebf558fbeb2cc37622e2f

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Go to your Supabase project's SQL Editor
2. Copy and run the migration from `supabase/migrations/20250106_initial_schema.sql`
3. This creates all tables, indexes, RLS policies, and triggers

See `supabase/README.md` for detailed database documentation.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
daily-devotion/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── plans/            # Plan creation
│   │   ├── lessons/          # Lesson generation
│   │   └── progress/         # Progress tracking
│   ├── auth/                 # Authentication
│   ├── dashboard/            # User dashboard
│   ├── plans/                # Plan management
│   ├── quiz/                 # Quiz pages
│   └── s/                    # Public story viewer
├── components/               # React components
│   ├── auth/                 # Login/signup forms
│   ├── dashboard/            # Dashboard components
│   ├── lessons/              # Web Story renderer
│   ├── plans/                # Plan creation forms
│   └── quiz/                 # Quiz components
├── lib/                      # Core library code
│   ├── services/             # Business logic
│   │   ├── esv-adapter.ts    # ESV API integration
│   │   ├── ai-lesson-generator.ts  # OpenAI integration
│   │   ├── story-compiler.ts # Web Story generation
│   │   └── passage-adapter.ts # Translation abstraction
│   ├── supabase/             # Supabase clients
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
└── supabase/
    └── migrations/           # Database schema
```

## Key Workflows

### Creating a Plan

1. Navigate to Dashboard
2. Click "New Plan"
3. Choose:
   - **Guided**: Pre-made plans (Gospels, Psalms, etc.)
   - **Custom**: Build your own with specific references
   - **Import**: Paste a list of references

### Generating Lessons

1. Go to a plan's detail page
2. Click "Generate All Lessons"
3. The app will:
   - Fetch passages from ESV API
   - Generate AI content (intro, message, recap, context, questions, quiz)
   - Compile into Web Story format
   - Store in database with unique share link

### Reading a Lesson

1. Click "View" on any ready lesson
2. Tap or use arrow keys to navigate pages
3. Progress is automatically tracked
4. Complete the story to mark it as done

### Taking a Quiz

1. After reading, click "Start Quiz"
2. Answer 3-5 multiple-choice questions
3. Submit to see results with explanations
4. Score is saved to progress

## API Routes

### POST /api/plans/create
Creates a new study plan with plan items.

**Request:**
```json
{
  "userId": "uuid",
  "title": "My Plan",
  "description": "...",
  "theme": "Faith",
  "source": "custom",
  "references": ["John 1", "John 2"],
  "scheduleType": "daily"
}
```

### POST /api/lessons/generate
Generates lessons for all plan items in a plan.

**Request:**
```json
{
  "planId": "uuid"
}
```

### POST /api/progress/complete
Marks a lesson as completed (called automatically).

**Request:**
```json
{
  "userId": "uuid",
  "lessonId": "uuid",
  "timeSpent": 180
}
```

### POST /api/progress/quiz
Saves quiz score.

**Request:**
```json
{
  "userId": "uuid",
  "lessonId": "uuid",
  "score": 80
}
```

## Extending the App

### Adding New Translations

1. Implement a new adapter in `lib/services/` (see `api-bible-adapter.ts` stub)
2. Add it to `getPassageAdapter()` factory in `passage-adapter.ts`
3. Example: NIV via API.Bible

### Customizing AI Prompts

Edit `lib/services/ai-lesson-generator.ts`:
- `SYSTEM_PROMPT`: Overall tone and guidelines
- `USER_PROMPT_TEMPLATE`: Input format for each lesson

### Styling Web Stories

Modify `components/lessons/story-page.tsx` to customize:
- Colors and gradients
- Typography
- Layout and spacing
- Animations

## Security

- **Row Level Security (RLS)**: All Supabase tables protected
- **Server-Side Keys**: API keys never exposed to client
- **User Isolation**: Users can only access their own data
- **Public Stories**: Lessons are publicly shareable by design

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Works on any platform supporting Next.js 15+ (Netlify, Railway, etc.)

## Licensing and Terms

- **ESV API**: Free for non-commercial use. For commercial use, contact Crossway.
- **Code**: Your project license here
- Always respect Bible translation copyrights

## Roadmap

- [ ] AI theme-based plan generator
- [ ] More Bible translations (NIV, NASB via API.Bible)
- [ ] Email/push notifications
- [ ] Badges and streaks
- [ ] PDF export
- [ ] Collaborative study groups
- [ ] Audio narration

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Check the documentation in `/supabase/README.md`
- Review the code comments

## Acknowledgments

- ESV API by Crossway
- Bible content from ESV translation
- AI generation powered by OpenAI
- Built with Next.js and Supabase

---

Built with ❤️ for Bible study
