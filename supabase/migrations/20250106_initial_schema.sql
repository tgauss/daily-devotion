-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE schedule_type AS ENUM ('daily', 'weekly');
CREATE TYPE plan_source AS ENUM ('guided', 'custom', 'import', 'ai-theme');
CREATE TYPE plan_item_status AS ENUM ('pending', 'ready', 'published');
CREATE TYPE nudge_type AS ENUM ('overdue', 'reminder', 'encouragement');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schedule_type schedule_type NOT NULL DEFAULT 'daily',
  source plan_source NOT NULL DEFAULT 'guided',
  theme TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan items table
CREATE TABLE IF NOT EXISTS public.plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  date_target DATE,
  references_text TEXT[] NOT NULL,
  translation TEXT NOT NULL DEFAULT 'ESV',
  status plan_item_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, index)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_item_id UUID NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  passage_canonical TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'ESV',
  ai_triptych_json JSONB NOT NULL,
  story_manifest_json JSONB NOT NULL,
  quiz_json JSONB NOT NULL,
  share_slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  time_spent_sec INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Nudges table
CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type nudge_type NOT NULL,
  last_shown_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_is_public ON public.plans(is_public);
CREATE INDEX idx_plan_items_plan_id ON public.plan_items(plan_id);
CREATE INDEX idx_plan_items_status ON public.plan_items(status);
CREATE INDEX idx_lessons_plan_item_id ON public.lessons(plan_item_id);
CREATE INDEX idx_lessons_share_slug ON public.lessons(share_slug);
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_lesson_id ON public.progress(lesson_id);
CREATE INDEX idx_nudges_user_id ON public.nudges(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to plans table
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Plans policies
CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public plans"
  ON public.plans FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.plans FOR DELETE
  USING (auth.uid() = user_id);

-- Plan items policies
CREATE POLICY "Users can view plan items of their plans"
  ON public.plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = plan_items.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view plan items of public plans"
  ON public.plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = plan_items.plan_id
      AND plans.is_public = true
    )
  );

CREATE POLICY "Users can create plan items for their plans"
  ON public.plan_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = plan_items.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update plan items of their plans"
  ON public.plan_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = plan_items.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete plan items of their plans"
  ON public.plan_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = plan_items.plan_id
      AND plans.user_id = auth.uid()
    )
  );

-- Lessons policies
CREATE POLICY "Anyone can view published lessons"
  ON public.lessons FOR SELECT
  USING (published_at IS NOT NULL);

CREATE POLICY "Service role can manage all lessons"
  ON public.lessons FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Progress policies
CREATE POLICY "Users can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Nudges policies
CREATE POLICY "Users can view their own nudges"
  ON public.nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges"
  ON public.nudges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all nudges"
  ON public.nudges FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
