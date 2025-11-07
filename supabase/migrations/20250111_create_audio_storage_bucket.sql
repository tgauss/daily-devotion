-- Create storage bucket for lesson audio files
-- Migration: 20250111_create_audio_storage_bucket.sql

-- Create the lesson-audio bucket (public access enabled)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-audio',
  'lesson-audio',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3'];

DO $$
BEGIN
  RAISE NOTICE '✅ Created lesson-audio storage bucket with public access';
  RAISE NOTICE '✅ Configured 50MB file size limit';
  RAISE NOTICE '✅ Restricted to audio/mpeg and audio/mp3 mime types';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Storage policies will be automatically managed by Supabase';
  RAISE NOTICE 'Public bucket allows read access to all files';
  RAISE NOTICE 'Service role can upload/update/delete files';
END $$;
