-- Migration: Clear Old Lessons
-- Date: 2025-01-10
-- Description: Removes all existing lessons to prepare for canonical lesson regeneration.
--              This is safe because we're regenerating them with the new architecture.

DO $$
DECLARE
  progress_count INTEGER;
  lessons_count INTEGER;
  plan_items_count INTEGER;
BEGIN
  -- ============================================================================
  -- STEP 1: Clear progress records (they reference lessons)
  -- ============================================================================

  DELETE FROM public.progress;
  GET DIAGNOSTICS progress_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % progress records. Users will start fresh with new canonical lessons.', progress_count;

  -- ============================================================================
  -- STEP 2: Delete all existing lessons
  -- ============================================================================

  DELETE FROM public.lessons;
  GET DIAGNOSTICS lessons_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % existing lessons. Ready for canonical lesson generation.', lessons_count;

  -- ============================================================================
  -- STEP 3: Update plan_items status back to pending
  -- ============================================================================

  UPDATE public.plan_items
  SET status = 'pending'
  WHERE status IN ('ready', 'published');
  GET DIAGNOSTICS plan_items_count = ROW_COUNT;
  RAISE NOTICE 'Reset % plan_items to pending status.', plan_items_count;

  -- ============================================================================
  -- Summary
  -- ============================================================================

  RAISE NOTICE '✅ Cleanup complete! Progress: %, Lessons: %, Plan Items: %',
    progress_count, lessons_count, plan_items_count;
  RAISE NOTICE 'Next Step: Generate canonical lessons!';
END $$;
