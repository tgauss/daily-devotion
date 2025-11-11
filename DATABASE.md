# Database Documentation

Complete database schema, relationships, and migration guide for My Daily Bread.faith.

---

## Database Overview

**Database**: PostgreSQL 15 (via Supabase)
**Location**: Supabase Cloud
**Access**: RLS-protected with service role bypass option

---

## Table Schemas

### `auth.users` (Supabase Auth - DO NOT MODIFY DIRECTLY)

Managed by Supabase Auth. Contains authentication data.

```sql
-- Partial schema (Supabase-managed)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  raw_user_meta_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Key Fields:**
- `id`: User's unique identifier (referenced by all other tables)
- `email`: User's email address
- `raw_user_meta_data`: JSON with custom fields (first_name, last_name, avatar_url)
- `email_confirmed_at`: NULL if email not confirmed

**Access**: Via Supabase Auth API only

---

### `public.users`

User profile data (extends auth.users).

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Foreign key to auth.users (same UUID)
- `email`: Denormalized for convenience
- `first_name`: User's first name
- `last_name`: User's last name
- `phone_number`: Optional phone
- `avatar_url`: URL to profile picture (Supabase Storage or external)
- `bio`: User bio/description
- `created_at`: Account creation timestamp
- `updated_at`: Auto-updated on any change (via trigger)

**Indexes:**
- Primary key on `id`

**Triggers:**
- `update_users_updated_at`: Auto-updates `updated_at` on UPDATE
- `on_auth_user_created`: Auto-creates profile when auth user signs up

**RLS Policies:**
- Users can SELECT their own profile
- Users can UPDATE their own profile

---

### `plans`

Reading plans created by users.

```sql
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schedule_type schedule_type NOT NULL DEFAULT 'daily',
  source plan_source NOT NULL DEFAULT 'guided',
  theme TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE schedule_type AS ENUM ('daily', 'weekly');
CREATE TYPE plan_source AS ENUM ('guided', 'custom', 'import', 'ai-theme');
```

**Fields:**
- `id`: Unique plan identifier
- `user_id`: Owner of the plan
- `title`: Plan name (e.g., "Fort Worth Bible Church 2025")
- `description`: Longer description
- `schedule_type`: How often to read ('daily' or 'weekly')
- `source`: How plan was created:
  - `guided`: Step-by-step wizard
  - `custom`: Manual entry
  - `import`: Imported from template (e.g., Fort Worth)
  - `ai-theme`: AI-generated based on theme
- `theme`: Optional theme/topic (e.g., "Complete Bible Reading")
- `is_public`: TRUE if shareable with others
- `created_at`: Creation timestamp
- `updated_at`: Auto-updated (trigger)

**Indexes:**
- `idx_plans_user_id ON (user_id)`
- `idx_plans_is_public ON (is_public)`

**RLS Policies:**
- Users can SELECT their own plans
- Users can SELECT public plans
- Users can INSERT/UPDATE/DELETE their own plans

---

### `plan_items`

Individual readings within a plan.

```sql
CREATE TABLE public.plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  date_target DATE,
  references_text TEXT[] NOT NULL,
  category TEXT,
  translation TEXT NOT NULL DEFAULT 'ESV',
  status plan_item_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, index)
);

CREATE TYPE plan_item_status AS ENUM ('pending', 'ready', 'published');
```

**Fields:**
- `id`: Unique item identifier
- `plan_id`: Parent plan
- `index`: Order within plan (0-indexed)
- `date_target`: Optional scheduled date
- `references_text`: Array of Bible references (e.g., `["John 3:16-21"]`)
- `category`: Optional category (e.g., "Gospel", "Wisdom")
- `translation`: Bible translation code ('ESV', 'NIV', etc.)
- `status`:
  - `pending`: No lesson generated yet
  - `ready`: Lesson generation queued
  - `published`: Lesson available
- `created_at`: Creation timestamp

**Indexes:**
- `idx_plan_items_plan_id ON (plan_id)`
- `idx_plan_items_status ON (status)`
- Unique constraint on `(plan_id, index)`

**RLS Policies:**
- Users can SELECT items from their plans or public plans
- Users can INSERT/UPDATE/DELETE items in their own plans

---

### `lessons`

AI-generated lesson content (shared across users).

```sql
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_item_id UUID NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  passage_canonical TEXT NOT NULL,
  passage_text TEXT,
  translation TEXT NOT NULL DEFAULT 'ESV',
  ai_triptych_json JSONB NOT NULL,
  story_manifest_json JSONB NOT NULL,
  quiz_json JSONB NOT NULL,
  share_slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique lesson identifier
- `plan_item_id`: First plan_item this was created for (reference)
- `passage_canonical`: Standardized reference (e.g., "John 3:16-21")
- `passage_text`: Full Bible passage text
- `translation`: Bible translation used
- `ai_triptych_json`: AI commentary structure:
  ```json
  {
    "intro": "Introduction text",
    "body": "Main teaching",
    "conclusion": "Conclusion",
    "context": {
      "historical": "Historical context",
      "narrative": "Narrative context"
    },
    "key_takeaways": ["Takeaway 1", "Takeaway 2"],
    "reflection_prompts": ["Question 1", "Question 2"],
    "discussion_questions": ["Question 1", "Question 2"]
  }
  ```
- `story_manifest_json`: Web story pages:
  ```json
  {
    "pages": [
      {
        "type": "cover",
        "content": {
          "title": "John 3:16-21",
          "text": "God's Love for the World"
        }
      },
      {
        "type": "passage",
        "content": {
          "title": "The Scripture",
          "text": "For God so loved the world..."
        }
      },
      {
        "type": "content",
        "content": {
          "title": "Understanding the Context",
          "text": "This conversation took place..."
        }
      },
      {
        "type": "takeaways",
        "content": {
          "title": "Key Takeaways",
          "bullets": ["Point 1", "Point 2", "Point 3"]
        }
      },
      {
        "type": "cta",
        "content": {
          "title": "Test Your Knowledge",
          "text": "Take the quiz to reinforce what you've learned",
          "cta": {
            "text": "Start Quiz",
            "href": "/quiz/[slug]"
          }
        }
      }
    ],
    "metadata": {
      "title": "John 3:16-21",
      "reference": "John 3:16-21",
      "translation": "ESV"
    }
  }
  ```
- `quiz_json`: Quiz questions:
  ```json
  [
    {
      "q": "What motivated God to send his Son?",
      "choices": ["Anger", "Love", "Duty", "Obligation"],
      "answer": "Love",
      "explanation": "John 3:16 says 'For God so loved the world...'"
    }
  ]
  ```
- `share_slug`: Unique URL-safe slug for sharing (e.g., `/s/abc123def456`)
- `published_at`: When lesson was published (NULL = draft)
- `created_at`: Generation timestamp

**Indexes:**
- `idx_lessons_plan_item_id ON (plan_item_id)`
- `idx_lessons_share_slug ON (share_slug)`

**RLS Policies:**
- Anyone can SELECT published lessons (published_at IS NOT NULL)
- Service role can manage all lessons

**Important**: Lessons are **shared** across users. Multiple plan_items can reference the same lesson via the `progress` table.

---

### `progress`

Tracks which lessons users have completed.

```sql
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  time_spent_sec INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

**Fields:**
- `id`: Unique progress record identifier
- `user_id`: User who completed the lesson
- `lesson_id`: The lesson completed
- `completed_at`: When user finished (NULL = in progress)
- `quiz_score`: Number correct (out of total questions)
- `time_spent_sec`: Time spent on lesson (seconds)
- `created_at`: First access timestamp

**Indexes:**
- `idx_progress_user_id ON (user_id)`
- `idx_progress_lesson_id ON (lesson_id)`
- Unique constraint on `(user_id, lesson_id)`

**RLS Policies:**
- Users can SELECT their own progress
- Users can INSERT/UPDATE their own progress

**Usage**:
```sql
-- Mark lesson complete
INSERT INTO progress (user_id, lesson_id, completed_at, quiz_score, time_spent_sec)
VALUES ('user-uuid', 'lesson-uuid', NOW(), 4, 180)
ON CONFLICT (user_id, lesson_id)
DO UPDATE SET completed_at = NOW(), quiz_score = 4, time_spent_sec = 180;
```

---

### `nudges`

Reminder system for overdue lessons.

```sql
CREATE TABLE public.nudges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type nudge_type NOT NULL,
  last_shown_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE nudge_type AS ENUM ('overdue', 'reminder', 'encouragement');
```

**Fields:**
- `id`: Unique nudge identifier
- `user_id`: User being nudged
- `type`: Type of nudge
  - `overdue`: Lesson past due date
  - `reminder`: Scheduled reminder
  - `encouragement`: Motivational message
- `last_shown_at`: Last time nudge was displayed
- `created_at`: Nudge creation timestamp

**Indexes:**
- `idx_nudges_user_id ON (user_id)`

**RLS Policies:**
- Users can SELECT their own nudges
- Users can UPDATE their own nudges
- Service role can manage all nudges

---

## Relationships Diagram

```
auth.users (1) ────── (1) public.users
                            │
                            │ (1)
                            │
                            ▼ (N)
                        plans
                            │
                            │ (1)
                            │
                            ▼ (N)
                      plan_items
                            │
                            │ (1)
                            │
                            ▼ (1)
                        lessons ◄──────┐
                            │          │
                            │          │
                            │ (N)      │ (N)
                            │          │
                            ▼          │
public.users (N) ────► progress ──────┘
```

---

## Triggers & Functions

### `update_updated_at_column()`

Auto-updates `updated_at` field on UPDATE.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Applied to:**
- `plans` table
- `users` table

### `handle_new_user()`

Auto-creates user profile when auth user signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Migrations

### Migration Files
Located in `supabase/migrations/`:

1. **`20250106_initial_schema.sql`**
   - Creates all tables
   - Sets up RLS policies
   - Creates indexes
   - Sets up triggers

2. **`20250107_add_category_to_plan_items.sql`**
   - Adds `category` column to `plan_items`

3. **`20250108_add_passage_text_to_lessons.sql`**
   - Adds `passage_text` column to `lessons`

4. **`20250109_add_user_profile_fields.sql`**
   - Adds profile fields to `users` table
   - Updates `handle_new_user()` function

5. **`20250109_backfill_existing_users.sql`**
   - Syncs existing auth users to public.users

### Running Migrations

**Option 1: Supabase Dashboard**
```
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Paste migration SQL
4. Run
```

**Option 2: Supabase CLI** (if configured)
```bash
supabase db push
```

### Creating New Migrations

**Template:**
```sql
-- Migration: <brief description>
-- Date: YYYY-MM-DD

-- Add your changes here
ALTER TABLE your_table ADD COLUMN new_column TEXT;

-- Don't forget indexes if needed
CREATE INDEX idx_your_table_new_column ON your_table(new_column);

-- Update RLS policies if needed
CREATE POLICY "Policy name"
  ON your_table FOR SELECT
  USING (your_condition);
```

**Naming**: `YYYYMMDD_description.sql`

**Best Practices:**
- Use `IF NOT EXISTS` for safety
- Use `DROP ... IF EXISTS` before `CREATE TRIGGER`
- Test locally if possible
- Always create indexes for foreign keys
- Update TypeScript types in `lib/types/database.ts`

---

## Common Queries

### Get user's plans with progress
```sql
SELECT
  p.id,
  p.title,
  p.description,
  COUNT(pi.id) as total_items,
  COUNT(pr.id) FILTER (WHERE pr.completed_at IS NOT NULL) as completed_items
FROM plans p
LEFT JOIN plan_items pi ON pi.plan_id = p.id
LEFT JOIN lessons l ON l.plan_item_id = pi.id
LEFT JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = 'user-uuid'
WHERE p.user_id = 'user-uuid'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Find lessons for a specific reference
```sql
SELECT * FROM lessons
WHERE passage_canonical = 'John 3:16-21'
  AND translation = 'ESV'
  AND published_at IS NOT NULL
LIMIT 1;
```

### Get overdue lessons
```sql
SELECT
  pi.id,
  pi.date_target,
  pi.references_text,
  l.id as lesson_id,
  l.share_slug
FROM plan_items pi
LEFT JOIN lessons l ON l.plan_item_id = pi.id
LEFT JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = 'user-uuid'
WHERE pi.plan_id IN (SELECT id FROM plans WHERE user_id = 'user-uuid')
  AND pi.date_target < CURRENT_DATE
  AND (pr.completed_at IS NULL OR pr.completed_at IS NULL)
ORDER BY pi.date_target ASC;
```

---

## Backup & Restore

### Supabase Automatic Backups
- Supabase Pro: Daily backups (7-day retention)
- Manual backups: Available via Supabase Dashboard

### Manual Backup
```bash
# If you have database credentials
pg_dump -h db.yourproject.supabase.co -U postgres -d postgres > backup.sql
```

### Restore
```bash
psql -h db.yourproject.supabase.co -U postgres -d postgres < backup.sql
```

---

## Performance Considerations

### Indexes
All foreign keys are indexed for fast JOINs.

### Query Optimization
- Use `SELECT specific_columns` instead of `SELECT *`
- Add indexes for frequently queried columns
- Use `LIMIT` for large result sets

### Connection Pooling
Supabase handles connection pooling automatically.

---

**Last Updated**: 2025-01-09
**Database Version**: PostgreSQL 15
