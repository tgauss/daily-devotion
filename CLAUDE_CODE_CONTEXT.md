# Claude Code Context - MyDailyBread.faith

> **IMPORTANT**: Read this file first when starting a new Claude Code session on this project.

This document provides everything a new Claude Code session needs to understand the project, make changes safely, and maintain consistency.

---

## 🎯 Project Overview

**MyDailyBread.faith** is a web platform for daily Bible reading with AI-generated lessons, interactive quizzes, and progress tracking.

**Tech Stack:**
- Next.js 16 (App Router, Turbopack)
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- OpenAI API (GPT-4 for content generation)
- Vercel (hosting)

**Live URL:** https://mydailybread.faith

---

## 📁 Project Structure

```
daily-devotion/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel for user creation
│   ├── api/                      # API routes
│   │   ├── admin/create-user/    # Manual user creation
│   │   ├── lessons/generate/     # AI lesson generation
│   │   ├── plans/                # Plan management
│   │   └── progress/             # Progress tracking
│   ├── dashboard/                # User dashboard
│   ├── plans/                    # Reading plans
│   ├── quiz/                     # Quiz pages
│   └── s/                        # Shared lesson links
├── components/                   # React components
│   ├── admin/                    # Admin UI components
│   ├── dashboard/                # Dashboard components
│   ├── lessons/                  # Lesson display (web-story, story-page)
│   ├── onboarding/               # Welcome modal
│   └── plans/                    # Plan components
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   ├── types/                    # TypeScript types
│   └── ai/                       # AI service integrations
├── supabase/migrations/          # Database migrations (SQL)
├── data/                         # Static data (fort-worth-bible-plan.json)
└── public/                       # Static assets
```

---

## 🗄️ Database Architecture

### Core Tables

**`auth.users`** (Managed by Supabase Auth)
- Primary source for authentication
- Don't modify directly - use Supabase Admin API

**`public.users`** (Your table)
- Profile data: first_name, last_name, phone, avatar, bio
- Foreign key to auth.users(id)
- Auto-created via trigger when auth user signs up

**`plans`**
- User's reading plans
- Fields: title, description, schedule_type, is_public

**`plan_items`**
- Individual readings in a plan
- Fields: references_text[], category, date_target, status

**`lessons`**
- AI-generated content for each reading
- Fields: passage_text, ai_triptych_json, story_manifest_json, quiz_json
- **IMPORTANT**: Lessons are shared across users for same reference
- Each lesson has unique share_slug for public links

**`progress`**
- Tracks user completion of lessons
- Links user → lesson (many-to-many with metadata)

### Key Relationships
```
auth.users (1) → (1) public.users [profile data]
public.users (1) → (N) plans
plans (1) → (N) plan_items
plan_items (1) → (1) lessons
users (N) ← → (N) lessons [via progress table]
```

---

## 🔐 Authentication & Authorization

### User Types
1. **Regular Users**: Can create plans, read lessons, track progress
2. **Admin Users**: Can create other users (currently no role table - TODO)

### Auth Flow
```
1. User signs up → Supabase Auth creates entry in auth.users
2. Trigger fires → Creates profile in public.users
3. User logs in → Gets session via Supabase Auth
4. Pages use supabase.auth.getUser() to check authentication
5. Pages query public.users for profile data
```

### Service Client Usage
- Regular client: `createClient()` from `lib/supabase/server`
- Service client: `createServiceClient()` - bypasses RLS
- **Only use service client for**: Admin operations, lesson copying
- **Requires**: `SUPABASE_SERVICE_ROLE_KEY` environment variable

---

## 🎨 Design System

### Colors (Tailwind)
- `charcoal`: Primary text (#2C2C2C)
- `olivewood`: Primary brand (#4A5D23)
- `golden-wheat`: Accent (#D4A574)
- `clay-rose`: Secondary (#A67C52)
- `sandstone`: Background (#E8DCC4)

### Fonts
- Headings: `font-heading` (serif)
- Body: `font-sans` (sans-serif)

### Component Patterns
- **Server Components**: Pages, data fetching
- **Client Components**: Forms, modals, interactive UI (marked with `'use client'`)
- **Responsive**: Mobile-first with `sm:` and `md:` breakpoints

---

## 🤖 AI Content Generation

### Lesson Generation Process
```
1. User adds reading to plan (e.g., "John 3:16-21")
2. System checks if lesson already exists for this reference
3. If not, generates via /api/lessons/generate:
   a. Fetch passage text from ESV API
   b. Send to OpenAI GPT-4 with structured prompt
   c. Generate: Triptych, Story Manifest, Quiz
   d. Store in lessons table
   e. Mark plan_item as "published"
```

### AI Services
- **OpenAI**: GPT-4 for content generation
- **Prompt Structure**: See `lib/ai/` directory
- **Cost Optimization**: Lessons are shared across users

---

## 🔄 Fort Worth Bible Plan (Special Feature)

### What It Is
- Pre-defined 244-reading plan (Oct 30 - Dec 31, 2025)
- 4 daily readings: Gospel, Early Church, Wisdom, History/Prophets
- Can be added to any user's account via "Import" button or admin panel

### Lesson Sharing
When a user imports Fort Worth plan:
1. System creates personal plan + plan_items for user
2. Checks if lessons already exist for these references
3. If yes: **Copies lesson references** (instant setup!)
4. If no: Marks items as "pending" (will generate on-demand)

**Why?** Avoids regenerating same content for multiple users.

---

## 🚀 Deployment & Environment

### Environment Variables Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Admin operations only!

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://mydailybread.faith
```

### Deployment Platform
- **Vercel** (automatic deploys from main branch)
- Build command: `npm run build`
- Framework: Next.js

### Critical Files
- **`vercel.json`**: Deployment config (DO NOT add wildcard rewrites!)
- **`.env.local`**: Local development env vars (not committed)

---

## 🛠️ Common Development Tasks

### Running Locally
```bash
# Use Node 20 (via nvm)
nvm use 20

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Database Migrations
1. Create SQL file in `supabase/migrations/`
2. Name format: `YYYYMMDD_description.sql`
3. Run in Supabase SQL Editor (no CLI setup yet)
4. Use `IF NOT EXISTS` for safety

### Creating New User (Admin)
```
1. Go to /admin
2. Fill in form
3. Check "Pre-load Fort Worth" if desired
4. User created with confirmed email
```

### Generating Lessons
- Automatically triggered when user opens a pending lesson
- Can be manually triggered via `/api/lessons/generate` POST
- Batch generation: `/api/lessons/generate-batch` POST

---

## ⚠️ Common Pitfalls & Solutions

### Issue: "Failed to run sql query: trigger already exists"
**Solution**: Use `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`

### Issue: Plan pages redirect to dashboard
**Solution**: Check `vercel.json` - remove any wildcard rewrite rules

### Issue: User has no profile in public.users
**Solution**: Run backfill migration:
```sql
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.id = auth.users.id)
ON CONFLICT (id) DO NOTHING;
```

### Issue: RLS blocking admin operations
**Solution**: Use `createServiceClient()` instead of `createClient()`

### Issue: Build fails with type errors
**Solution**:
1. Check `lib/types/database.ts` matches actual DB schema
2. Run `npm run build` to see specific errors

---

## 🎯 Feature Implementation Patterns

### Adding a New Page
1. Create file in `app/your-page/page.tsx`
2. Server component by default (async function)
3. Fetch data via Supabase
4. Use client components for interactivity

### Adding a New API Route
1. Create `app/api/your-route/route.ts`
2. Export `POST`, `GET`, etc. functions
3. Validate authentication:
```typescript
const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```
4. Return `NextResponse.json()`

### Adding User Profile Fields
1. Create migration to add column
2. Update `lib/types/database.ts` User interface
3. Update `handle_new_user()` function if needed
4. Update UI components to display/edit

---

## 📊 Monitoring & Debugging

### Logs
- API routes: Use `console.log()` with prefixes like `[Admin]`, `[Import]`
- Check Vercel deployment logs for production errors

### Database Queries
- Supabase Dashboard → Table Editor
- SQL Editor for complex queries
- Check RLS policies if queries return no data

### Common Debug Commands
```bash
# Check build locally
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check environment variables loaded
echo $NEXT_PUBLIC_SUPABASE_URL
```

---

## 🔮 Future Session Guidelines

### Before Making Changes
1. Read CHANGELOG.md for recent updates
2. Check ARCHITECTURE.md for system design
3. Run `npm run build` to verify current state
4. Review recent git commits: `git log --oneline -10`

### Making Changes Safely
1. Use `IF NOT EXISTS` in SQL migrations
2. Maintain backward compatibility for API changes
3. Update TypeScript types when changing DB schema
4. Test build before committing
5. Update CHANGELOG.md

### Commit Message Format
```
Brief description of change

- Bullet points of what changed
- Include file names or component names
- Note any breaking changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 📚 Related Documentation

- `CHANGELOG.md` - Version history and changes
- `ARCHITECTURE.md` - System design and infrastructure
- `DATABASE.md` - Database schema details
- `README.md` - Project overview and quick start
- `DEVELOPMENT.md` - Development setup and guidelines

---

## 🆘 Getting Help

### If Claude Code Gets Stuck
1. Check this file first (you're reading it!)
2. Review CHANGELOG.md for context
3. Run `npm run build` to identify errors
4. Check Supabase Dashboard for data/auth issues
5. Review recent git commits for changes

### Key Commands to Remember
```bash
git log --oneline -10                    # Recent changes
npm run build                            # Test build
ls supabase/migrations/                  # View migrations
cat CHANGELOG.md | head -100             # Recent updates
```

---

**Last Updated**: 2025-01-09
**Project Status**: Active Development
**Current Version**: 0.1.0 (Unreleased)
