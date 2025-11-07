import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { getPassageAdapter } from '../lib/services/passage-adapter'
import { getAILessonGenerator } from '../lib/services/ai-lesson-generator'
import { getStoryCompiler } from '../lib/services/story-compiler'
import { getAudioGenerator } from '../lib/services/audio-generator'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function regenerate() {
  // Delete John 3:16-17
  await supabase
    .from('lessons')
    .delete()
    .eq('passage_canonical', 'John 3:16–17')
    .eq('translation', 'ESV')

  console.log('🎙️  Regenerating John 3:16-17 with fixed audio...\n')

  const passageAdapter = getPassageAdapter('ESV')
  const aiGenerator = getAILessonGenerator()
  const storyCompiler = getStoryCompiler()
  const audioGenerator = getAudioGenerator()

  const passage = await passageAdapter.getPassageText('John 3:16-17', 'ESV')
  console.log('⏳ Fetching passage...')
  console.log(`   ✓ Canonical: ${passage.canonical}`)

  console.log('🤖 Generating AI content...')
  const lessonContent = await aiGenerator.generateLessonContent({
    translation: 'ESV',
    references: ['John 3:16-17'],
    passage_text: passage.text,
    plan_theme: 'Audio Narration Test',
  })

  const shareSlug = crypto.randomBytes(16).toString('hex')
  console.log('📖 Compiling Web Story...')
  const storyManifest = storyCompiler.compile(lessonContent, {
    title: 'Audio Test Lesson',
    reference: passage.canonical,
    translation: 'ESV',
    quizUrl: `/quiz/${shareSlug}`,
    passageText: passage.text,
  })

  console.log('🎙️  Generating audio narration...')
  const tempLessonId = crypto.randomBytes(16).toString('hex')
  const audioManifest = await audioGenerator.generateAudioForLesson(
    tempLessonId,
    storyManifest
  )

  console.log(`   ✅ Audio generated!`)
  audioManifest.pages.forEach((page, idx) => {
    console.log(`   ✓ Page ${idx}: ${page.pageType} (${page.duration}s)`)
  })

  console.log('💾 Saving to database...')
  await supabase.from('lessons').insert({
    plan_item_id: null,
    passage_canonical: passage.canonical,
    passage_text: passage.text,
    translation: 'ESV',
    ai_triptych_json: lessonContent,
    story_manifest_json: storyManifest,
    quiz_json: lessonContent.quiz,
    audio_manifest_json: audioManifest,
    share_slug: shareSlug,
    published_at: new Date().toISOString(),
  })

  console.log(`\n✅ Lesson regenerated!`)
  console.log(`   View at: http://localhost:3000/s/${shareSlug}`)
}

regenerate()
