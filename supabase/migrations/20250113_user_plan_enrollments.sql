-- Migration: User Plan Enrollments
-- Date: 2025-01-13
-- Description: Adds enrollment-based architecture for shared plans.
--              Instead of duplicating plans when users join, create enrollment records.
--              This prevents waste and allows true shared/collaborative plans.

-- Create user_plan_enrollments table
CREATE TABLE IF NOT EXISTS public.user_plan_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE, -- When user first accessed a lesson
  completed_at TIMESTAMP WITH TIME ZONE, -- When user completed all lessons
  last_accessed_at TIMESTAMP WITH TIME ZONE, -- Last time user viewed this plan
  is_active BOOLEAN DEFAULT TRUE, -- Users can un-enroll/archive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id) -- User can only enroll once per plan
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_plan_enrollments_user_id
  ON public.user_plan_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_user_plan_enrollments_plan_id
  ON public.user_plan_enrollments(plan_id);

CREATE INDEX IF NOT EXISTS idx_user_plan_enrollments_active
  ON public.user_plan_enrollments(user_id, is_active)
  WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.user_plan_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.user_plan_enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments"
  ON public.user_plan_enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments"
  ON public.user_plan_enrollments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own enrollments"
  ON public.user_plan_enrollments FOR DELETE
  USING (user_id = auth.uid());

-- Service role can manage all enrollments
CREATE POLICY "Service role can manage all enrollments"
  ON public.user_plan_enrollments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Function to update last_accessed_at when user views plan
CREATE OR REPLACE FUNCTION update_enrollment_last_accessed(p_user_id UUID, p_plan_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_plan_enrollments
  SET last_accessed_at = NOW()
  WHERE user_id = p_user_id AND plan_id = p_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark enrollment as started
CREATE OR REPLACE FUNCTION mark_enrollment_started(p_user_id UUID, p_plan_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_plan_enrollments
  SET started_at = NOW(),
      last_accessed_at = NOW()
  WHERE user_id = p_user_id
    AND plan_id = p_plan_id
    AND started_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and mark enrollment as completed
CREATE OR REPLACE FUNCTION check_enrollment_completion(p_user_id UUID, p_plan_id UUID)
RETURNS VOID AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  -- Count total plan items
  SELECT COUNT(*) INTO total_items
  FROM plan_items
  WHERE plan_id = p_plan_id AND status = 'published';

  -- Count completed items (user has completed the lesson)
  SELECT COUNT(DISTINCT pi.id) INTO completed_items
  FROM plan_items pi
  JOIN plan_item_lessons pil ON pil.plan_item_id = pi.id
  JOIN progress p ON p.lesson_id = pil.lesson_id
  WHERE pi.plan_id = p_plan_id
    AND pi.status = 'published'
    AND p.user_id = p_user_id
    AND p.completed_at IS NOT NULL;

  -- If all items completed, mark enrollment as complete
  IF total_items > 0 AND completed_items >= total_items THEN
    UPDATE public.user_plan_enrollments
    SET completed_at = NOW()
    WHERE user_id = p_user_id
      AND plan_id = p_plan_id
      AND completed_at IS NULL;

    -- Increment completion count in stats
    UPDATE plan_library_stats
    SET completion_count = completion_count + 1,
        updated_at = NOW()
    WHERE plan_id = p_plan_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.user_plan_enrollments IS
  'Tracks user enrollments in plans. Users can enroll in shared public plans without duplicating data.';
COMMENT ON COLUMN public.user_plan_enrollments.enrolled_at IS
  'When the user enrolled/joined this plan';
COMMENT ON COLUMN public.user_plan_enrollments.started_at IS
  'When the user first accessed a lesson in this plan';
COMMENT ON COLUMN public.user_plan_enrollments.completed_at IS
  'When the user completed all lessons in this plan';
COMMENT ON COLUMN public.user_plan_enrollments.is_active IS
  'Whether this enrollment is active (users can un-enroll or archive)';

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ENROLLMENT MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '1. Created user_plan_enrollments table';
  RAISE NOTICE '2. Added RLS policies for user data privacy';
  RAISE NOTICE '3. Created helper functions for enrollment tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update join APIs to create enrollments instead of copies';
  RAISE NOTICE '2. Update dashboard to query enrolled plans';
  RAISE NOTICE '3. Update plan detail pages to work with enrollments';
  RAISE NOTICE '========================================';
END $$;
