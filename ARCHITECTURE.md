# Architecture Documentation

## System Overview

My Daily Bread.faith is a full-stack web application built with modern serverless architecture, focusing on Bible reading plans with AI-generated supplementary content.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Next.js 16 React App - Server & Client Components)       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────┐
                 │                                 │
┌────────────────▼────────────┐    ┌──────────────▼──────────┐
│   Supabase Services         │    │   External APIs         │
│  ┌──────────────────────┐   │    │  ┌──────────────────┐  │
│  │  PostgreSQL DB       │   │    │  │  OpenAI API      │  │
│  │  - Users             │   │    │  │  (GPT-4)         │  │
│  │  - Plans             │   │    │  │                  │  │
│  │  - Lessons           │   │    │  │  ESV Bible API   │  │
│  │  - Progress          │   │    │  │  (Crossway)      │  │
│  └──────────────────────┘   │    │  └──────────────────┘  │
│                              │    │                         │
│  ┌──────────────────────┐   │    └─────────────────────────┘
│  │  Auth Service        │   │
│  │  - OAuth             │   │
│  │  - Session Mgmt      │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │  Storage             │   │
│  │  - User Avatars      │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Build Tool**: Turbopack (dev), Webpack (prod)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: Custom React components
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (planned)

### External Services
- **AI**: OpenAI GPT-4 (content generation)
- **Bible API**: ESV API (Crossway)
- **Hosting**: Vercel (Edge Network)
- **Domain**: CloudFlare (DNS) + Vercel

### Development
- **Node Version**: 20.x (via nvm)
- **Package Manager**: npm
- **Version Control**: Git + GitHub

---

## Data Flow Architecture

### 1. User Authentication Flow
```
User Sign Up
    ↓
Supabase Auth (auth.users)
    ↓
Trigger: handle_new_user()
    ↓
Create Profile (public.users)
    ↓
Session Created
    ↓
Redirect to Dashboard
```

### 2. Reading Plan Creation Flow
```
User Creates Plan
    ↓
POST /api/plans/create
    ↓
Insert into plans table
    ↓
Create plan_items (multiple)
    ↓
Status: "pending" (no lessons yet)
    ↓
Return plan ID
    ↓
Redirect to /plans/[id]
```

### 3. Lesson Generation Flow
```
User Opens Pending Lesson
    ↓
Check: Does lesson exist for this reference?
    │
    ├─ YES → Display existing lesson
    │
    └─ NO → Generate new lesson:
        ↓
    POST /api/lessons/generate
        ↓
    Fetch passage from ESV API
        ↓
    Send to OpenAI GPT-4
        ↓
    Parse JSON response:
        - Triptych (intro, body, conclusion)
        - Story Manifest (web story pages)
        - Quiz Questions (3-5)
        ↓
    Insert into lessons table
        ↓
    Update plan_item.status = "published"
        ↓
    Return lesson
        ↓
    Display to user
```

### 4. Fort Worth Plan Import Flow
```
User Clicks "Add to My Reading Plans"
    ↓
POST /api/plans/import-fort-worth
    ↓
Create plan (user's personal copy)
    ↓
Create 244 plan_items
    ↓
Search for existing Fort Worth plan
    │
    ├─ Found → Copy all lessons (instant!)
    │   ↓
    │   Insert lessons with new share_slugs
    │   ↓
    │   Mark items as "published"
    │
    └─ Not Found → Leave items as "pending"
        ↓
    Return success + lessons_copied count
```

---

## Component Architecture

### Page Hierarchy
```
app/
├── (root)
│   └── page.tsx                    # Landing page
├── auth/
│   └── page.tsx                    # Sign in/up
├── dashboard/
│   └── page.tsx                    # User dashboard (server component)
├── plans/
│   ├── create/page.tsx             # Create new plan
│   └── [id]/page.tsx               # View plan details
├── s/
│   └── [slug]/page.tsx             # Shared lesson view (public)
├── quiz/
│   └── [slug]/page.tsx             # Quiz page
└── admin/
    └── page.tsx                    # Admin panel
```

### Component Patterns

**Server Components** (default in App Router):
- Fetch data directly from Supabase
- No client-side JavaScript
- Examples: Dashboard, Plan pages

**Client Components** (`'use client'`):
- Interactive UI (forms, modals, buttons)
- React hooks (useState, useEffect)
- Examples: WelcomeModal, CreateUserForm

### Shared Components
```
components/
├── dashboard/
│   ├── dashboard-header.tsx        # Header with user greeting
│   ├── plans-list.tsx              # List of user's plans
│   ├── progress-overview.tsx       # Progress stats
│   └── nudge-card.tsx              # Overdue lesson reminders
├── lessons/
│   ├── web-story.tsx               # Story container (swipeable)
│   └── story-page.tsx              # Individual story pages
├── onboarding/
│   └── welcome-modal.tsx           # First-time user guide
├── plans/
│   └── import-fort-worth-button.tsx
└── admin/
    ├── create-user-form.tsx
    └── users-list.tsx
```

---

## Database Architecture

### Schema Design Principles
1. **Separation**: `auth.users` (Supabase) vs `public.users` (custom)
2. **Lesson Sharing**: One lesson → many users (via progress table)
3. **RLS**: Row-level security on all tables
4. **Triggers**: Auto-create user profiles, auto-update timestamps

### Key Tables (Detailed in DATABASE.md)
- `auth.users` - Authentication (Supabase-managed)
- `public.users` - Profile data
- `plans` - Reading plans
- `plan_items` - Individual readings
- `lessons` - AI-generated content
- `progress` - User completion tracking
- `nudges` - Reminder system

### Relationships
```sql
-- One-to-One
auth.users ←→ public.users

-- One-to-Many
users → plans
plans → plan_items
plan_items → lessons (one lesson per reference)

-- Many-to-Many
users ←→ lessons (via progress table)
```

---

## API Architecture

### API Routes Pattern
```typescript
// app/api/your-route/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse request
  const body = await req.json()

  // 3. Validate input
  if (!body.required_field) {
    return NextResponse.json({ error: 'Missing field' }, { status: 400 })
  }

  // 4. Business logic
  const result = await doSomething(body)

  // 5. Return response
  return NextResponse.json({ success: true, data: result })
}
```

### Available Endpoints

**Plans**
- `POST /api/plans/create` - Create new reading plan
- `POST /api/plans/import-fort-worth` - Import Fort Worth plan

**Lessons**
- `POST /api/lessons/generate` - Generate single lesson
- `POST /api/lessons/generate-batch` - Generate multiple lessons

**Progress**
- `POST /api/progress/complete` - Mark lesson complete
- `POST /api/progress/quiz` - Submit quiz answers

**Admin**
- `POST /api/admin/create-user` - Create new user (manual)

---

## Security Architecture

### Authentication
- **Provider**: Supabase Auth
- **Method**: Email + Password (OAuth planned)
- **Session**: HTTP-only cookies (managed by Supabase)
- **Token**: JWT with auto-refresh

### Authorization (RLS Policies)

**Users Table**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

**Plans Table**
```sql
-- Users can view their own plans
CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public plans
CREATE POLICY "Users can view public plans"
  ON public.plans FOR SELECT
  USING (is_public = true);
```

**Lessons Table**
```sql
-- Anyone can view published lessons
CREATE POLICY "Anyone can view published lessons"
  ON public.lessons FOR SELECT
  USING (published_at IS NOT NULL);
```

### Service Role (Admin)
- **Purpose**: Bypass RLS for admin operations
- **Key**: `SUPABASE_SERVICE_ROLE_KEY` (never expose to client!)
- **Usage**: User creation, lesson copying
- **Access Pattern**: Server-side only via `createServiceClient()`

---

## Performance Optimizations

### Lesson Sharing
**Problem**: Generating same lesson for multiple users is expensive
**Solution**: Share lessons across users
- One lesson record for "John 3:16-21 ESV"
- Multiple users link to same lesson via progress table
- Saves: API calls, database storage, user wait time

### Static Generation
- Landing page: Static (regenerated on deploy)
- Auth page: Static
- Other pages: Dynamic (user-specific data)

### Code Splitting
- Next.js automatic code splitting by route
- Client components loaded on-demand

### Database Indexing
```sql
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plan_items_plan_id ON public.plan_items(plan_id);
CREATE INDEX idx_lessons_share_slug ON public.lessons(share_slug);
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
```

---

## Scalability Considerations

### Current Scale
- **Users**: < 100
- **Lessons**: ~ 300 (Fort Worth plan baseline)
- **Database**: < 1GB
- **Traffic**: Minimal

### Scaling Strategy

**Phase 1** (Current): Single database, serverless functions
- Sufficient for 1,000-10,000 users
- Supabase Free Tier → Supabase Pro (if needed)

**Phase 2** (Future): Optimization
- Database connection pooling
- Redis caching for frequent queries
- CDN for static assets
- Lesson pre-generation for popular plans

**Phase 3** (Growth): Infrastructure
- Read replicas for database
- Separate AI generation queue (background jobs)
- Multi-region deployment

---

## Deployment Architecture

### Vercel Setup
```
GitHub Repository
    ↓
Push to 'main' branch
    ↓
Vercel automatic deploy
    ↓
Build (npm run build)
    ↓
Deploy to Edge Network
    ↓
Live at mydailybread.faith
```

### Environment Variables
- **Build-time**: `NEXT_PUBLIC_*` (exposed to client)
- **Runtime**: All others (server-only)
- **Management**: Vercel dashboard → Settings → Environment Variables

### Domains
- **Primary**: mydailybread.faith
- **Vercel**: mydailybread.vercel.app (fallback)

---

## Monitoring & Observability

### Current Setup
- **Logs**: Vercel deployment logs
- **Errors**: Console errors (no error tracking service yet)
- **Database**: Supabase Dashboard metrics

### Planned Improvements
- Sentry for error tracking
- Plausible/Fathom for privacy-friendly analytics
- Supabase realtime for collaborative features

---

## Development Workflow

### Local Development
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Set up .env.local with required variables

# 4. Run dev server
npm run dev

# 5. Open http://localhost:3000
```

### Making Changes
1. Create feature branch (optional)
2. Make changes
3. Test locally: `npm run build`
4. Commit with descriptive message
5. Push to main → Auto-deploy to Vercel

### Database Changes
1. Create SQL migration file
2. Test locally (if local DB setup)
3. Run in production Supabase SQL Editor
4. Update TypeScript types if schema changed
5. Commit migration file

---

## Future Architecture Plans

### Short Term
- Profile settings page
- Admin role-based access control
- Email notifications (Supabase email templates)

### Medium Term
- Social features (study groups, shared plans)
- Advanced progress analytics
- Mobile app (React Native + shared API)

### Long Term
- Custom AI models (fine-tuned for Bible study)
- Collaborative annotations
- Community-created content
- Multi-language support

---

**Last Updated**: 2025-01-09
**Document Version**: 1.0
