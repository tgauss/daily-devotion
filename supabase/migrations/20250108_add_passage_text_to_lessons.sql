-- Add passage_text field to lessons table
-- This stores the actual Bible passage so users can read the Scripture

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS passage_text TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.lessons.passage_text IS 'The actual Bible passage text from the chosen translation';
