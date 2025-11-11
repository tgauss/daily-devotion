-- Email Queue System for Resend Integration
-- Simpler approach that doesn't require auth.users triggers

-- Create email queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'plan_invite', 'lesson_reminder', 'password_reset')),
  recipient_email TEXT NOT NULL,
  email_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attempts INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_unsent ON public.email_queue(created_at) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_type ON public.email_queue(email_type);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage email queue"
  ON public.email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own email queue"
  ON public.email_queue
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT ON public.email_queue TO authenticated;
GRANT ALL ON public.email_queue TO service_role;

-- Helper function to queue welcome email (can be called from app)
CREATE OR REPLACE FUNCTION public.queue_welcome_email(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_dashboard_url TEXT DEFAULT 'https://mydailybread.faith/dashboard'
)
RETURNS UUID AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.email_queue (
    user_id,
    email_type,
    recipient_email,
    email_data
  ) VALUES (
    p_user_id,
    'welcome',
    p_email,
    jsonb_build_object(
      'firstName', COALESCE(p_first_name, split_part(p_email, '@', 1)),
      'dashboardUrl', p_dashboard_url
    )
  ) RETURNING id INTO queue_id;

  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to queue plan invite email
CREATE OR REPLACE FUNCTION public.queue_plan_invite_email(
  p_recipient_email TEXT,
  p_inviter_name TEXT,
  p_plan_title TEXT,
  p_plan_description TEXT,
  p_join_url TEXT,
  p_personal_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.email_queue (
    email_type,
    recipient_email,
    email_data
  ) VALUES (
    'plan_invite',
    p_recipient_email,
    jsonb_build_object(
      'inviterName', p_inviter_name,
      'planTitle', p_plan_title,
      'planDescription', p_plan_description,
      'joinUrl', p_join_url,
      'personalMessage', p_personal_message
    )
  ) RETURNING id INTO queue_id;

  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to queue lesson reminder email
CREATE OR REPLACE FUNCTION public.queue_lesson_reminder_email(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_overdue_lessons JSONB
)
RETURNS UUID AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.email_queue (
    user_id,
    email_type,
    recipient_email,
    email_data
  ) VALUES (
    p_user_id,
    'lesson_reminder',
    p_email,
    jsonb_build_object(
      'firstName', p_first_name,
      'overdueLessons', p_overdue_lessons
    )
  ) RETURNING id INTO queue_id;

  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.queue_welcome_email TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.queue_plan_invite_email TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.queue_lesson_reminder_email TO authenticated, service_role;

-- Comments
COMMENT ON TABLE public.email_queue IS 'Queue for sending branded emails via Resend API';
COMMENT ON FUNCTION public.queue_welcome_email IS 'Queue a welcome email for a new user';
COMMENT ON FUNCTION public.queue_plan_invite_email IS 'Queue a plan invitation email';
COMMENT ON FUNCTION public.queue_lesson_reminder_email IS 'Queue a lesson reminder email';
