-- Add is_featured column to lessons table for public homepage display
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_is_featured ON public.lessons(is_featured) WHERE is_featured = true;

-- Comments
COMMENT ON COLUMN public.lessons.is_featured IS 'Whether this lesson should be displayed on the public homepage as a preview';
