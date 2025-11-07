/**
 * Test Script: Generate lessons with audio
 * Run with: npx tsx scripts/test-audio.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { getPassageAdapter } from '../lib/services/passage-adapter'
import { getAILessonGenerator } from '../lib/services/ai-lesson-generator'
import { getStoryCompiler } from '../lib/services/story-compiler'
import { getAudioGenerator } from '../lib/services/audio-generator'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test passages
const TEST_PASSAGES = [
  'John 3:16-17',
  'Psalm 23:1-6',
  'Romans 8:28-30',
]

async function testAudioGeneration() {
  console.log('🎙️  Testing Audio Generation for Lessons')
  console.log('=' .repeat(50))

  const passageAdapter = getPassageAdapter('ESV')
  const aiGenerator = getAILessonGenerator()
  const storyCompiler = getStoryCompiler()
  const audioGenerator = getAudioGenerator()

  for (const [index, reference] of TEST_PASSAGES.entries()) {
    try {
      console.log(`\n[${index + 1}/${TEST_PASSAGES.length}] ${reference}`)
      console.log('─'.repeat(50))

      // 1. Fetch passage
      console.log('⏳ Fetching passage...')
      const passage = await passageAdapter.getPassageText(reference, 'ESV')
      console.log(`   ✓ Canonical: ${passage.canonical}`)

      // 2. Check if lesson already exists
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id, share_slug, audio_manifest_json')
        .eq('passage_canonical', passage.canonical)
        .eq('translation', 'ESV')
        .single()

      if (existingLesson) {
        console.log('✅ Lesson already exists!')
        console.log(`   View at: http://localhost:3000/s/${existingLesson.share_slug}`)
        if (existingLesson.audio_manifest_json) {
          console.log(`   🎙️  Audio: ${existingLesson.audio_manifest_json.pages.length} pages with audio`)
        } else {
          console.log('   ⚠️  No audio manifest found')
        }
        continue
      }

      // 3. Generate AI content
      console.log('🤖 Generating AI content...')
      const lessonContent = await aiGenerator.generateLessonContent({
        translation: 'ESV',
        references: [reference],
        passage_text: passage.text,
        plan_theme: 'Audio Narration Test',
      })
      console.log('   ✓ Content generated')

      // 4. Compile story
      const shareSlug = crypto.randomBytes(16).toString('hex')
      console.log('📖 Compiling Web Story...')
      const storyManifest = storyCompiler.compile(lessonContent, {
        title: 'Audio Test Lesson',
        reference: passage.canonical,
        translation: 'ESV',
        quizUrl: `/quiz/${shareSlug}`,
        passageText: passage.text,
      })
      console.log(`   ✓ ${storyManifest.pages.length} pages created`)

      // 5. Generate audio
      let audioManifest = null
      try {
        console.log('🎙️  Generating audio narration...')
        const tempLessonId = crypto.randomBytes(16).toString('hex')

        console.log('   → Calling ElevenLabs API...')
        audioManifest = await audioGenerator.generateAudioForLesson(
          tempLessonId,
          storyManifest
        )

        console.log(`   ✅ Audio generated successfully!`)
        console.log(`   ✓ Pages with audio: ${audioManifest.pages.length}`)
        console.log(`   ✓ Teaching voice: ${audioManifest.teaching_voice_id}`)
        console.log(`   ✓ Scripture voice: ${audioManifest.scripture_voice_id}`)

        // Show details for each page
        audioManifest.pages.forEach((page, idx) => {
          console.log(`   ✓ Page ${idx}: ${page.pageType} (${page.duration}s, ${Math.round(page.fileSize / 1024)}KB)`)
        })
      } catch (audioError: any) {
        console.error('   ❌ Audio generation failed:', audioError.message)
        console.error('   Stack:', audioError.stack)
        console.log('   → Continuing without audio...')
      }

      // 6. Save lesson
      console.log('💾 Saving to database...')
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
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
        .select()
        .single()

      if (lessonError) {
        console.error('❌ Error saving lesson:', lessonError)
        continue
      }

      console.log(`✅ Lesson created with ${audioManifest ? 'audio' : 'NO audio'}!`)
      console.log(`   View at: http://localhost:3000/s/${shareSlug}`)

    } catch (error: any) {
      console.error(`❌ Error:`, error.message)
      console.error('Stack:', error.stack)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Audio generation test complete!')
  console.log('='.repeat(50))
}

testAudioGeneration().catch(console.error)
