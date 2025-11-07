-- Migration: Canonical Lessons Architecture
-- Date: 2025-01-10
-- Description: Restructures lessons to be canonical (shared across users)
--              instead of duplicated per user. Adds junction table for
--              plan_items → lessons many-to-many relationship.

-- ============================================================================
-- STEP 1: Create junction table for plan_items ↔ lessons
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_item_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_item_id UUID NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_item_id, lesson_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_plan_item_lessons_plan_item_id
  ON public.plan_item_lessons(plan_item_id);

CREATE INDEX IF NOT EXISTS idx_plan_item_lessons_lesson_id
  ON public.plan_item_lessons(lesson_id);

COMMENT ON TABLE public.plan_item_lessons IS
  'Junction table mapping plan items to canonical lessons. Allows many-to-many relationship.';

-- ============================================================================
-- STEP 2: Make lessons.plan_item_id nullable (transition step)
-- ============================================================================

-- Drop the NOT NULL constraint (keep column for reference during migration)
ALTER TABLE public.lessons
  ALTER COLUMN plan_item_id DROP NOT NULL;

COMMENT ON COLUMN public.lessons.plan_item_id IS
  'DEPRECATED: Use plan_item_lessons junction table instead. Kept for backward compatibility during migration.';

-- ============================================================================
-- STEP 3: Add unique constraint to lessons (one lesson per passage+translation)
-- ============================================================================

-- First, let's add an index to help with lookups
CREATE INDEX IF NOT EXISTS idx_lessons_passage_translation
  ON public.lessons(passage_canonical, translation);

-- Add unique constraint
-- Note: If this fails, clear lessons first with next migration
ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS unique_lesson_passage;

ALTER TABLE public.lessons
  ADD CONSTRAINT unique_lesson_passage
  UNIQUE(passage_canonical, translation);

-- ============================================================================
-- STEP 4: Update RLS policies for new junction table
-- ============================================================================

-- Enable RLS on junction table
ALTER TABLE public.plan_item_lessons ENABLE ROW LEVEL SECURITY;

-- Users can see plan_item_lessons for their own plans
CREATE POLICY "Users can view their plan item lessons"
  ON public.plan_item_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_items pi
      JOIN public.plans p ON p.id = pi.plan_id
      WHERE pi.id = plan_item_lessons.plan_item_id
        AND p.user_id = auth.uid()
    )
  );

-- Service role can manage all plan_item_lessons
CREATE POLICY "Service role can manage plan item lessons"
  ON public.plan_item_lessons FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- STEP 5: Update lessons RLS policies to allow canonical sharing
-- ============================================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;

-- Recreate with better naming
CREATE POLICY "Published lessons are public"
  ON public.lessons FOR SELECT
  USING (published_at IS NOT NULL);

-- Service role can manage all lessons
DROP POLICY IF EXISTS "Service role can manage lessons" ON public.lessons;
CREATE POLICY "Service role can manage lessons"
  ON public.lessons FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- STEP 6: Update progress table to link directly to canonical lessons
-- ============================================================================

-- Progress already links to lessons.id, so no schema change needed
-- Just verify the foreign key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'progress_lesson_id_fkey'
  ) THEN
    ALTER TABLE public.progress
      ADD CONSTRAINT progress_lesson_id_fkey
      FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- Summary of Changes
-- ============================================================================

-- 1. ✅ Created plan_item_lessons junction table (many-to-many)
-- 2. ✅ Made lessons.plan_item_id nullable (will remove later)
-- 3. ✅ Added unique constraint on (passage_canonical, translation)
-- 4. ✅ Updated RLS policies for sharing
-- 5. ✅ Lessons are now canonical (one per passage+translation)
-- 6. ✅ Multiple plan_items can reference the same lesson
-- 7. ✅ Progress still tracks per-user completion

-- Next Steps:
-- 1. Clear old lessons (they'll be regenerated)
-- 2. Update lesson generation code to check for existing lessons
-- 3. Update Fort Worth import to map to canonical lessons
-- 4. Generate Fort Worth lessons once
-- 5. All future imports will reuse those canonical lessons

COMMENT ON TABLE public.lessons IS
  'Canonical lesson library shared across all users. One lesson per passage+translation combination.';
