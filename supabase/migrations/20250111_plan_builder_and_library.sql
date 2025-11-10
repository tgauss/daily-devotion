-- Migration: Plan Builder and Public Library Features
-- Date: 2025-01-11
-- Description: Adds support for AI-powered plan builder with depth levels,
--              public plan library with sharing, and invite system

-- Add new columns to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS depth_level TEXT DEFAULT 'moderate' CHECK (depth_level IN ('simple', 'moderate', 'deep'));
ALTER TABLE plans ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- Create plan_shares table for invite tracking
CREATE TABLE IF NOT EXISTS plan_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  used_count INTEGER DEFAULT 0
);

-- Create plan_library_stats for participation tracking
CREATE TABLE IF NOT EXISTS plan_library_stats (
  plan_id UUID PRIMARY KEY REFERENCES plans(id) ON DELETE CASCADE,
  participant_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  last_started_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plan_shares_token ON plan_shares(token);
CREATE INDEX IF NOT EXISTS idx_plan_shares_plan_id ON plan_shares(plan_id);
CREATE INDEX IF NOT EXISTS idx_plans_featured ON plans(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_plans_public ON plans(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_plans_depth_level ON plans(depth_level);

-- Enable RLS on new tables
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_library_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plan_shares
CREATE POLICY "Users can create share links for owned plans"
  ON plan_shares FOR INSERT
  WITH CHECK (shared_by_user_id = auth.uid());

CREATE POLICY "Users can view their own share links"
  ON plan_shares FOR SELECT
  USING (shared_by_user_id = auth.uid());

CREATE POLICY "Anyone can view valid share links by token"
  ON plan_shares FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "Users can update their own share links"
  ON plan_shares FOR UPDATE
  USING (shared_by_user_id = auth.uid());

-- RLS Policies for plan_library_stats
CREATE POLICY "Anyone can view plan stats for public plans"
  ON plan_library_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_library_stats.plan_id
      AND plans.is_public = TRUE
    )
  );

CREATE POLICY "System can insert/update plan stats"
  ON plan_library_stats FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Function to update plan_library_stats when plan is joined
CREATE OR REPLACE FUNCTION increment_plan_participant_count(p_plan_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO plan_library_stats (plan_id, participant_count, last_started_at, updated_at)
  VALUES (p_plan_id, 1, NOW(), NOW())
  ON CONFLICT (plan_id) DO UPDATE
  SET participant_count = plan_library_stats.participant_count + 1,
      last_started_at = NOW(),
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment share link usage
CREATE OR REPLACE FUNCTION increment_share_link_usage(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE plan_shares
  SET used_count = used_count + 1
  WHERE token = p_token AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on columns for documentation
COMMENT ON COLUMN plans.depth_level IS 'Study depth: simple (5-7min), moderate (10-12min), deep (15-20min)';
COMMENT ON COLUMN plans.featured IS 'Whether this plan appears in featured section of library';
COMMENT ON COLUMN plans.created_by_name IS 'Denormalized creator name for display in library';
COMMENT ON TABLE plan_shares IS 'Tracks invite links shared by users for collaborative study';
COMMENT ON TABLE plan_library_stats IS 'Aggregated statistics for public plans';
