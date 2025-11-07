-- Migration: Canonical Lessons Architecture (Combined)
-- Date: 2025-01-10
-- Description: Complete migration to canonical lessons architecture.
--              Clears old lessons first, then applies new schema.

-- ============================================================================
-- PART 1: CLEANUP - Clear all existing lessons
-- ============================================================================

DO $$
DECLARE
  progress_count INTEGER;
  lessons_count INTEGER;
  plan_items_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 1: Cleaning up existing data...';
  RAISE NOTICE '========================================';

  -- Clear progress records (they reference lessons)
  DELETE FROM public.progress;
  GET DIAGNOSTICS progress_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % progress records.', progress_count;

  -- Delete all existing lessons
  DELETE FROM public.lessons;
  GET DIAGNOSTICS lessons_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % existing lessons.', lessons_count;

  -- Reset plan_items to pending
  UPDATE public.plan_items
  SET status = 'pending'
  WHERE status IN ('ready', 'published');
  GET DIAGNOSTICS plan_items_count = ROW_COUNT;
  RAISE NOTICE 'Reset % plan_items to pending status.', plan_items_count;

  RAISE NOTICE '✅ Cleanup complete!';
END $$;

-- ============================================================================
-- PART 2: SCHEMA CHANGES - Create canonical lessons architecture
-- ============================================================================

-- Create junction table for plan_items ↔ lessons
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

-- Make lessons.plan_item_id nullable
ALTER TABLE public.lessons
  ALTER COLUMN plan_item_id DROP NOT NULL;

COMMENT ON COLUMN public.lessons.plan_item_id IS
  'DEPRECATED: Use plan_item_lessons junction table instead. Kept for backward compatibility.';

-- Add index for lesson lookups
CREATE INDEX IF NOT EXISTS idx_lessons_passage_translation
  ON public.lessons(passage_canonical, translation);

-- Add unique constraint (now safe because lessons table is empty)
ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS unique_lesson_passage;

ALTER TABLE public.lessons
  ADD CONSTRAINT unique_lesson_passage
  UNIQUE(passage_canonical, translation);

DO $$
BEGIN
  RAISE NOTICE '✅ Created plan_item_lessons junction table';
  RAISE NOTICE '✅ Made lessons.plan_item_id nullable';
  RAISE NOTICE '✅ Added unique constraint on (passage_canonical, translation)';
END $$;

-- ============================================================================
-- PART 3: RLS POLICIES
-- ============================================================================

-- Enable RLS on junction table
ALTER TABLE public.plan_item_lessons ENABLE ROW LEVEL SECURITY;

-- Users can see plan_item_lessons for their own plans
DROP POLICY IF EXISTS "Users can view their plan item lessons" ON public.plan_item_lessons;
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
DROP POLICY IF EXISTS "Service role can manage plan item lessons" ON public.plan_item_lessons;
CREATE POLICY "Service role can manage plan item lessons"
  ON public.plan_item_lessons FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Update lessons RLS policies
DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;
DROP POLICY IF EXISTS "Published lessons are public" ON public.lessons;
CREATE POLICY "Published lessons are public"
  ON public.lessons FOR SELECT
  USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS "Service role can manage lessons" ON public.lessons;
CREATE POLICY "Service role can manage lessons"
  ON public.lessons FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DO $$
BEGIN
  RAISE NOTICE '✅ Updated RLS policies';
END $$;

-- Verify progress table foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'progress_lesson_id_fkey'
  ) THEN
    ALTER TABLE public.progress
      ADD CONSTRAINT progress_lesson_id_fkey
      FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added progress.lesson_id foreign key';
  ELSE
    RAISE NOTICE '✅ progress.lesson_id foreign key already exists';
  END IF;
END $$;

-- Update table comment
COMMENT ON TABLE public.lessons IS
  'Canonical lesson library shared across all users. One lesson per passage+translation combination.';

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '1. Cleared all existing lessons and progress';
  RAISE NOTICE '2. Created plan_item_lessons junction table';
  RAISE NOTICE '3. Made lessons canonical (unique per passage+translation)';
  RAISE NOTICE '4. Updated RLS policies for lesson sharing';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update lesson generation code';
  RAISE NOTICE '2. Generate canonical Fort Worth lessons';
  RAISE NOTICE '3. All users will share the same canonical lessons';
  RAISE NOTICE '========================================';
END $$;
