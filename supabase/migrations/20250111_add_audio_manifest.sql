-- Add audio manifest column to store ElevenLabs generated audio metadata
-- Migration: 20250111_add_audio_manifest.sql

-- Add audio_manifest_json column to lessons table
ALTER TABLE public.lessons
  ADD COLUMN audio_manifest_json JSONB;

-- Add comment describing the column
COMMENT ON COLUMN public.lessons.audio_manifest_json IS
  'Audio files metadata for each story page, generated via ElevenLabs TTS. Contains voice IDs, audio URLs, durations, and text hashes.';

-- Create index for querying lessons with audio
CREATE INDEX idx_lessons_has_audio ON public.lessons((audio_manifest_json IS NOT NULL))
  WHERE audio_manifest_json IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Added audio_manifest_json column to lessons table';
  RAISE NOTICE '✅ Created index for audio-enabled lessons';
END $$;
