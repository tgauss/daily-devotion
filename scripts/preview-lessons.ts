/**
 * Preview Script: Generate first 3 Fort Worth lessons
 * Run with: npx tsx scripts/preview-lessons.ts
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
  console.error('   Make sure .env.local has:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generatePreviewLessons() {
  console.log('🔍 Finding Fort Worth plan...')

  // Find Fort Worth plan for tgaussoin@gmail.com
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'tgaussoin@gmail.com')
    .single()

  if (!users) {
    console.error('❌ User not found')
    return
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('id, title')
    .eq('user_id', users.id)
    .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
    .single()

  if (!plan) {
    console.error('❌ Fort Worth plan not found')
    return
  }

  console.log(`✅ Found plan: ${plan.title} (${plan.id})`)

  // Get first 3 plan items
  const { data: planItems } = await supabase
    .from('plan_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('index', { ascending: true })
    .limit(3)

  if (!planItems || planItems.length === 0) {
    console.error('❌ No plan items found')
    return
  }

  console.log(`\n📚 Generating ${planItems.length} preview lessons...\n`)

  const passageAdapter = getPassageAdapter('ESV')
  const aiGenerator = getAILessonGenerator()
  const storyCompiler = getStoryCompiler()
  const audioGenerator = getAudioGenerator()

  for (const [index, item] of planItems.entries()) {
    try {
      console.log(`\n[${ index + 1}/3] ${item.references_text[0]}`)
      console.log('─'.repeat(50))

      // Check if canonical lesson already exists
      const passage = await passageAdapter.getPassageText(
        item.references_text[0],
        item.translation
      )

      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id, share_slug')
        .eq('passage_canonical', passage.canonical)
        .eq('translation', item.translation)
        .single()

      if (existingLesson) {
        console.log('✅ Canonical lesson already exists!')
        console.log(`   View at: /s/${existingLesson.share_slug}`)

        // Create mapping
        await supabase.from('plan_item_lessons').insert({
          plan_item_id: item.id,
          lesson_id: existingLesson.id,
        })

        await supabase
          .from('plan_items')
          .update({ status: 'published' })
          .eq('id', item.id)

        continue
      }

      console.log('⏳ Fetching passage...')
      console.log(`   Canonical: ${passage.canonical}`)

      console.log('🤖 Generating AI content...')
      const lessonContent = await aiGenerator.generateLessonContent({
        translation: item.translation,
        references: item.references_text,
        passage_text: passage.text,
        plan_theme: 'Complete Bible Reading',
      })

      console.log('   ✓ Intro:', lessonContent.intro.substring(0, 60) + '...')
      console.log('   ✓ Context:', lessonContent.context.substring(0, 60) + '...')
      console.log('   ✓ Takeaways:', lessonContent.key_takeaways.length)
      console.log('   ✓ Quiz questions:', lessonContent.quiz.length)

      const shareSlug = crypto.randomBytes(16).toString('hex')

      console.log('📖 Compiling Web Story...')
      const storyManifest = storyCompiler.compile(lessonContent, {
        title: plan.title,
        reference: passage.canonical,
        translation: item.translation,
        quizUrl: `/quiz/${shareSlug}`,
        passageText: passage.text,
      })

      console.log(`   ✓ ${storyManifest.pages.length} pages created`)

      // Generate audio for all pages
      let audioManifest = null
      try {
        console.log('🎙️  Generating audio narration...')
        const tempLessonId = crypto.randomBytes(16).toString('hex')
        audioManifest = await audioGenerator.generateAudioForLesson(
          tempLessonId,
          storyManifest
        )
        console.log(`   ✓ Generated audio for ${audioManifest.pages.length} pages`)
        console.log(`   ✓ Teaching voice: ${audioManifest.teaching_voice_id}`)
        console.log(`   ✓ Scripture voice: ${audioManifest.scripture_voice_id}`)
      } catch (audioError: any) {
        console.error('   ⚠️  Audio generation failed:', audioError.message)
        console.log('   → Continuing without audio...')
      }

      console.log('💾 Saving to database...')
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          plan_item_id: null, // Canonical
          passage_canonical: passage.canonical,
          passage_text: passage.text,
          translation: item.translation,
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

      // Create mapping
      await supabase.from('plan_item_lessons').insert({
        plan_item_id: item.id,
        lesson_id: lesson.id,
      })

      await supabase
        .from('plan_items')
        .update({ status: 'published' })
        .eq('id', item.id)

      console.log(`✅ Lesson created!`)
      console.log(`   View at: /s/${shareSlug}`)
      console.log(`   Pages: ${storyManifest.pages.length}`)

    } catch (error: any) {
      console.error(`❌ Error generating lesson:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Preview generation complete!')
  console.log('='.repeat(50))
  console.log('\nView your lessons at:')
  console.log(`https://mydailybread.faith/plans/${plan.id}`)
}

generatePreviewLessons().catch(console.error)
