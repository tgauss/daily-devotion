-- =====================================================
-- Migration: Auth Enhancements
-- Date: 2025-01-14
-- Description: Adds Google OAuth support, referral tracking,
--              and email notification preferences
-- =====================================================

-- =====================================================
-- 1. REFERRAL TRACKING
-- =====================================================

-- Add referral tracking columns to users table
ALTER TABLE public.users
  ADD COLUMN referred_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN referral_code TEXT UNIQUE;

-- Create index for faster referral lookups
CREATE INDEX idx_users_referred_by ON public.users(referred_by_user_id);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);

-- Generate unique referral codes for existing users (8 character alphanumeric)
UPDATE public.users
SET referral_code = substr(md5(random()::text || id::text), 1, 8)
WHERE referral_code IS NULL;

-- Add comment
COMMENT ON COLUMN public.users.referred_by_user_id IS 'User who referred this user (for referral tracking)';
COMMENT ON COLUMN public.users.referral_code IS 'Unique code for this user to share with others';

-- =====================================================
-- 2. EMAIL NOTIFICATION PREFERENCES
-- =====================================================

-- Add email preference columns to users table
ALTER TABLE public.users
  ADD COLUMN email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN email_frequency TEXT DEFAULT 'daily'
    CHECK (email_frequency IN ('daily', 'weekly', 'off'));

-- Add comments
COMMENT ON COLUMN public.users.email_notifications IS 'Whether user wants to receive email notifications';
COMMENT ON COLUMN public.users.email_frequency IS 'How often to send lesson reminder emails (daily, weekly, or off)';

-- =====================================================
-- 3. PLAN INVITE EMAIL TRACKING
-- =====================================================

-- Add email tracking columns to plan_shares table
ALTER TABLE plan_shares
  ADD COLUMN sent_to_email TEXT,
  ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for email invite lookups
CREATE INDEX idx_plan_shares_sent_to_email ON plan_shares(sent_to_email);

-- Add comments
COMMENT ON COLUMN plan_shares.sent_to_email IS 'Email address invitation was sent to (if sent via email)';
COMMENT ON COLUMN plan_shares.sent_at IS 'When the email invitation was sent';

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to generate a unique referral code for a user
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := substr(md5(random()::text), 1, 8);

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$;

-- Function to get referral statistics for a user
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS TABLE (
  total_referrals INTEGER,
  active_referrals INTEGER,
  referral_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_referrals,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::INTEGER AS active_referrals,
    (SELECT u.referral_code FROM public.users u WHERE u.id = p_user_id) AS referral_code
  FROM public.users
  WHERE referred_by_user_id = p_user_id;
END;
$$;

-- =====================================================
-- 5. UPDATED TRIGGER FOR NEW USERS
-- =====================================================

-- Update the handle_new_user trigger to generate referral code
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    referral_code,
    email_notifications,
    email_frequency
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    generate_referral_code(),
    true,
    'daily'
  );
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Users can view their own referral stats
CREATE POLICY "Users can view their referral stats"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    auth.uid() = referred_by_user_id
  );

-- Users can update their own email preferences
CREATE POLICY "Users can update their email preferences"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. GRANTS
-- =====================================================

-- Grant execute permission on helper functions
GRANT EXECUTE ON FUNCTION generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats(UUID) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- ✅ Added referral_by_user_id and referral_code to users
-- ✅ Added email_notifications and email_frequency to users
-- ✅ Added sent_to_email and sent_at to plan_shares
-- ✅ Generated referral codes for existing users
-- ✅ Created helper functions for referral management
-- ✅ Updated RLS policies
-- ✅ Updated handle_new_user trigger
