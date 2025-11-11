-- Auth Email Integration with Resend
-- Triggers to send custom branded emails on auth events

-- Create function to send welcome email via webhook/API
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Extract first name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'name',
    split_part(user_email, '@', 1)
  );

  -- Insert into a queue table that will be processed by an API route
  INSERT INTO public.email_queue (
    user_id,
    email_type,
    recipient_email,
    email_data,
    created_at
  ) VALUES (
    NEW.id,
    'welcome',
    user_email,
    jsonb_build_object(
      'firstName', user_name,
      'dashboardUrl', COALESCE(
        current_setting('app.settings.app_url', true),
        'https://mydailybread.faith/dashboard'
      )
    ),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Create index for processing queue
CREATE INDEX IF NOT EXISTS idx_email_queue_unsent ON public.email_queue(created_at) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON public.email_queue(user_id);

-- Enable RLS on email_queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage email queue"
  ON public.email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can view their own queued emails
CREATE POLICY "Users can view their own email queue"
  ON public.email_queue
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger: Send welcome email after user confirms email
CREATE OR REPLACE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email_confirmed_at IS NULL
    AND NEW.email_confirmed_at IS NOT NULL
  )
  EXECUTE FUNCTION public.send_welcome_email();

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.email_queue TO authenticated;
GRANT ALL ON public.email_queue TO service_role;

-- Comment the objects
COMMENT ON TABLE public.email_queue IS 'Queue for sending branded emails via Resend API';
COMMENT ON FUNCTION public.send_welcome_email() IS 'Queues welcome email when user confirms their email address';
COMMENT ON TRIGGER on_auth_user_confirmed ON auth.users IS 'Triggers welcome email after email confirmation';
