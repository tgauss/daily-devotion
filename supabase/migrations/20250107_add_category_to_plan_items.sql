-- Add category field to plan_items to support multiple readings per day
-- This allows labeling items as "Gospel", "Early Church", "Wisdom", "History & Prophets", etc.

ALTER TABLE public.plan_items
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add index for querying by category
CREATE INDEX IF NOT EXISTS idx_plan_items_category ON public.plan_items(category);

-- Comment for documentation
COMMENT ON COLUMN public.plan_items.category IS 'Category label for multi-reading plans (e.g., Gospel, Early Church, Wisdom, History & Prophets)';
