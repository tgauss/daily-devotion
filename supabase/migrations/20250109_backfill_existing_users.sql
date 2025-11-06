-- Backfill existing auth.users into public.users
-- This handles users who were created before the trigger was set up

INSERT INTO public.users (id, email, first_name, last_name, avatar_url, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', NULL) as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', NULL) as last_name,
  COALESCE(au.raw_user_meta_data->>'avatar_url', NULL) as avatar_url,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Optional: Update existing public.users with data from auth.users if it's missing
UPDATE public.users pu
SET
  first_name = COALESCE(pu.first_name, au.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(pu.last_name, au.raw_user_meta_data->>'last_name'),
  avatar_url = COALESCE(pu.avatar_url, au.raw_user_meta_data->>'avatar_url')
FROM auth.users au
WHERE pu.id = au.id
  AND (
    (pu.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL)
    OR (pu.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL)
    OR (pu.avatar_url IS NULL AND au.raw_user_meta_data->>'avatar_url' IS NOT NULL)
  );
