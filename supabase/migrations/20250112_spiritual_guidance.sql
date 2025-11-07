-- Migration: Spiritual Guidance Feature
-- Date: 2025-01-12
-- Description: Create table and policies for personal spiritual guidance feature

-- ============================================================================
-- PART 1: Create spiritual_guidance table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.spiritual_guidance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- User's input
  situation_text TEXT NOT NULL,

  -- AI-generated passages (array of passage suggestions)
  passages JSONB NOT NULL,
  -- Structure: [{ reference, text, relevance, translation }]

  -- AI-generated guidance content
  guidance_content JSONB NOT NULL,
  -- Structure: { opening, scriptural_insights, reflections, prayer_points, encouragement }

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.spiritual_guidance IS
  'Personal spiritual guidance requests. Strictly private per-user. Users can request guidance on life situations and receive AI-curated Bible passages with compassionate guidance.';

COMMENT ON COLUMN public.spiritual_guidance.situation_text IS
  'User-provided description of their situation, struggle, or celebration (max 500 chars)';

COMMENT ON COLUMN public.spiritual_guidance.passages IS
  'AI-suggested Bible passages relevant to the situation. JSONB array with reference, text, relevance explanation';

COMMENT ON COLUMN public.spiritual_guidance.guidance_content IS
  'AI-generated compassionate guidance with opening, insights, reflections, prayers, encouragement';

-- ============================================================================
-- PART 2: Create indexes for performance
-- ============================================================================

-- Index for user-specific queries (most common query pattern)
CREATE INDEX idx_spiritual_guidance_user_id
  ON public.spiritual_guidance(user_id);

-- Index for chronological ordering (history list)
CREATE INDEX idx_spiritual_guidance_created_at
  ON public.spiritual_guidance(created_at DESC);

-- Composite index for user's history ordered by date
CREATE INDEX idx_spiritual_guidance_user_created
  ON public.spiritual_guidance(user_id, created_at DESC);

-- GIN index for full-text search on situation_text (for history search)
CREATE INDEX idx_spiritual_guidance_situation_search
  ON public.spiritual_guidance
  USING gin(to_tsvector('english', situation_text));

-- ============================================================================
-- PART 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.spiritual_guidance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: RLS Policies (Privacy-First)
-- ============================================================================

-- Policy: Users can only view their own guidance
DROP POLICY IF EXISTS "Users can view their own guidance" ON public.spiritual_guidance;
CREATE POLICY "Users can view their own guidance"
  ON public.spiritual_guidance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only create their own guidance
DROP POLICY IF EXISTS "Users can create their own guidance" ON public.spiritual_guidance;
CREATE POLICY "Users can create their own guidance"
  ON public.spiritual_guidance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own guidance (for bookmarking, notes, etc.)
DROP POLICY IF EXISTS "Users can update their own guidance" ON public.spiritual_guidance;
CREATE POLICY "Users can update their own guidance"
  ON public.spiritual_guidance
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own guidance
DROP POLICY IF EXISTS "Users can delete their own guidance" ON public.spiritual_guidance;
CREATE POLICY "Users can delete their own guidance"
  ON public.spiritual_guidance
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 5: Update function for auto-updating updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_spiritual_guidance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spiritual_guidance_updated_at ON public.spiritual_guidance;
CREATE TRIGGER update_spiritual_guidance_updated_at
  BEFORE UPDATE ON public.spiritual_guidance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spiritual_guidance_updated_at();

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SPIRITUAL GUIDANCE MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '1. spiritual_guidance table with JSONB columns';
  RAISE NOTICE '2. Performance indexes (user_id, created_at, full-text search)';
  RAISE NOTICE '3. RLS policies (strictly private per-user)';
  RAISE NOTICE '4. Auto-update trigger for updated_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Privacy Guarantees:';
  RAISE NOTICE '- Users can only see/edit/delete their own guidance';
  RAISE NOTICE '- No public sharing (unlike lessons)';
  RAISE NOTICE '- Full history searchable per user';
  RAISE NOTICE '========================================';
END $$;
