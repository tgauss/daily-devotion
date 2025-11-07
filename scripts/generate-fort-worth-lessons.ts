/**
 * Generate next 5 Fort Worth lessons with audio
 * Run with: npx tsx scripts/generate-fort-worth-lessons.ts
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

async function generateFortWorthLessons() {
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

  // Find the Fort Worth plan with 3 published items (the one we've been working with)
  const { data: plans } = await supabase
    .from('plans')
    .select('id, title')
    .eq('user_id', users.id)
    .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
    .order('created_at', { ascending: false })

  if (!plans || plans.length === 0) {
    console.error('❌ Fort Worth plan not found')
    return
  }

  // If multiple plans, find the one with published items
  let plan
  for (const p of plans) {
    const { data: items } = await supabase
      .from('plan_items')
      .select('status')
      .eq('plan_id', p.id)
      .eq('status', 'published')

    if (items && items.length > 0) {
      plan = p
      break
    }
  }

  // If no plan has published items, use the most recent one
  if (!plan) {
    plan = plans[0]
  }

  if (!plan) {
    console.error('❌ Fort Worth plan not found')
    return
  }

  console.log(`✅ Found plan: ${plan.title} (${plan.id})`)

  // Get all plan items
  const { data: allPlanItems } = await supabase
    .from('plan_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('index', { ascending: true })

  if (!allPlanItems || allPlanItems.length === 0) {
    console.error('❌ No plan items found')
    return
  }

  // Find items without lessons (status != 'published')
  const unpublishedItems = allPlanItems.filter(item => item.status !== 'published')

  if (unpublishedItems.length === 0) {
    console.log('✅ All lessons already generated!')
    return
  }

  const itemsToGenerate = unpublishedItems.slice(0, 30)

  console.log(`\n📚 Generating ${itemsToGenerate.length} lessons...\n`)
  console.log(`Total plan items: ${allPlanItems.length}`)
  console.log(`Already published: ${allPlanItems.length - unpublishedItems.length}`)
  console.log(`Remaining: ${unpublishedItems.length}`)
  console.log(`Generating now: ${itemsToGenerate.length}\n`)
  console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`)

  const passageAdapter = getPassageAdapter('ESV')
  const aiGenerator = getAILessonGenerator()
  const storyCompiler = getStoryCompiler()
  const audioGenerator = getAudioGenerator()

  for (const [index, item] of itemsToGenerate.entries()) {
    try {
      console.log(`\n[${index + 1}/${itemsToGenerate.length}] ${item.references_text[0]}`)
      console.log('─'.repeat(50))

      // 1. Fetch passage text to get canonical reference
      console.log('⏳ Fetching passage...')
      const passage = await passageAdapter.getPassageText(
        item.references_text[0],
        item.translation
      )
      console.log(`   ✓ Canonical: ${passage.canonical}`)

      // 2. Check if canonical lesson already exists
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('passage_canonical', passage.canonical)
        .eq('translation', item.translation)
        .single()

      let lessonId: string

      if (existingLesson) {
        console.log('✅ Canonical lesson exists - reusing it!')
        lessonId = existingLesson.id
      } else {
        // 3. Generate AI content
        console.log('🤖 Generating AI content...')
        const lessonContent = await aiGenerator.generateLessonContent({
          translation: item.translation,
          references: item.references_text,
          passage_text: passage.text,
          plan_theme: plan.title,
        })
        console.log('   ✓ Content generated')

        // 4. Generate share slug
        const shareSlug = crypto.randomBytes(16).toString('hex')

        // 5. Compile Web Story
        console.log('📖 Compiling Web Story...')
        const storyManifest = storyCompiler.compile(lessonContent, {
          title: plan.title,
          reference: passage.canonical,
          translation: item.translation,
          quizUrl: `/quiz/${shareSlug}`,
          passageText: passage.text,
        })
        console.log(`   ✓ ${storyManifest.pages.length} pages created`)

        // 6. Generate audio
        let audioManifest = null
        try {
          console.log('🎙️  Generating audio narration...')
          const tempLessonId = crypto.randomBytes(16).toString('hex')
          audioManifest = await audioGenerator.generateAudioForLesson(
            tempLessonId,
            storyManifest
          )
          console.log(`   ✅ Generated audio for ${audioManifest.pages.length} pages`)
        } catch (audioError: any) {
          console.error('   ⚠️  Audio generation failed:', audioError.message)
          console.log('   → Continuing without audio...')
        }

        // 7. Store canonical lesson
        console.log('💾 Saving to database...')
        const { data: newLesson, error: lessonError } = await supabase
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
          console.error('❌ Error creating lesson:', lessonError)
          continue
        }

        lessonId = newLesson.id
        console.log(`✅ Lesson created with audio!`)
        console.log(`   View at: http://localhost:3000/s/${shareSlug}`)
      }

      // 8. Create plan_item → lesson mapping
      await supabase.from('plan_item_lessons').insert({
        plan_item_id: item.id,
        lesson_id: lessonId,
      })

      // 9. Update plan item status to published
      await supabase
        .from('plan_items')
        .update({ status: 'published' })
        .eq('id', item.id)

      console.log(`✅ Plan item ${item.index + 1} marked as published`)

    } catch (error: any) {
      console.error(`❌ Error generating lesson:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Lesson generation complete!')
  console.log(`⏰ Finished at: ${new Date().toLocaleString()}`)
  console.log('='.repeat(50))
}

generateFortWorthLessons().catch(console.error)
