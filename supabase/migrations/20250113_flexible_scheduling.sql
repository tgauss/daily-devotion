-- Migration: Flexible Scheduling System
-- Date: 2025-01-13
-- Description: Adds support for self-guided vs synchronized plans.
--              Users can choose their own start date for self-guided plans,
--              while synchronized plans keep everyone on the same schedule.

-- Add schedule_mode to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS schedule_mode TEXT DEFAULT 'self-guided'
  CHECK (schedule_mode IN ('self-guided', 'synchronized'));

-- Add custom_start_date to user_plan_enrollments
ALTER TABLE user_plan_enrollments ADD COLUMN IF NOT EXISTS custom_start_date DATE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_schedule_mode
  ON plans(schedule_mode) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_enrollments_custom_start
  ON user_plan_enrollments(custom_start_date)
  WHERE custom_start_date IS NOT NULL;

-- Backfill existing plans
-- Fort Worth plans should be synchronized (everyone on same schedule)
UPDATE plans
SET schedule_mode = 'synchronized'
WHERE source = 'import'  -- Fort Worth imports
  AND title LIKE '%Fort Worth%';

-- AI-generated and custom plans default to self-guided
UPDATE plans
SET schedule_mode = 'self-guided'
WHERE source IN ('ai-theme', 'custom', 'guided')
  AND schedule_mode IS NULL;

-- Function to calculate effective date for a plan item based on enrollment
CREATE OR REPLACE FUNCTION get_effective_date(
  p_plan_id UUID,
  p_user_id UUID,
  p_item_index INTEGER,
  p_original_date DATE
) RETURNS DATE AS $$
DECLARE
  v_schedule_mode TEXT;
  v_schedule_type TEXT;
  v_custom_start_date DATE;
  v_interval_days INTEGER;
  v_effective_date DATE;
BEGIN
  -- Get plan's schedule mode and type
  SELECT schedule_mode, schedule_type INTO v_schedule_mode, v_schedule_type
  FROM plans
  WHERE id = p_plan_id;

  -- If synchronized, use original date
  IF v_schedule_mode = 'synchronized' THEN
    RETURN p_original_date;
  END IF;

  -- For self-guided, check if user has custom start date
  SELECT custom_start_date INTO v_custom_start_date
  FROM user_plan_enrollments
  WHERE plan_id = p_plan_id
    AND user_id = p_user_id
    AND is_active = TRUE;

  -- If no custom start date, return NULL (pure self-paced, no dates)
  IF v_custom_start_date IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate interval based on schedule type
  v_interval_days := CASE
    WHEN v_schedule_type = 'weekly' THEN 7
    ELSE 1  -- daily is default
  END;

  -- Calculate effective date
  v_effective_date := v_custom_start_date + (p_item_index * v_interval_days);

  RETURN v_effective_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments for documentation
COMMENT ON COLUMN plans.schedule_mode IS
  'Scheduling type: self-guided (users choose start date) or synchronized (everyone on same schedule)';

COMMENT ON COLUMN user_plan_enrollments.custom_start_date IS
  'For self-guided plans: user''s chosen start date. For synchronized plans: NULL (use plan dates)';

COMMENT ON FUNCTION get_effective_date IS
  'Calculates the effective due date for a plan item based on enrollment and schedule mode';

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FLEXIBLE SCHEDULING MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '1. Added schedule_mode to plans (self-guided | synchronized)';
  RAISE NOTICE '2. Added custom_start_date to user_plan_enrollments';
  RAISE NOTICE '3. Created get_effective_date() function for date calculation';
  RAISE NOTICE '4. Backfilled existing plans:';
  RAISE NOTICE '   - Fort Worth → synchronized';
  RAISE NOTICE '   - AI/Custom → self-guided';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update enrollment APIs to accept custom_start_date';
  RAISE NOTICE '2. Add start date picker to enrollment UI';
  RAISE NOTICE '3. Update plan display logic to use effective dates';
  RAISE NOTICE '========================================';
END $$;
