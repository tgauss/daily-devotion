import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// The plan we want to keep (the one with the generated lessons)
const PLAN_TO_KEEP = '18a36cb1-ca50-461f-88dc-a74233db87fa'

// Plans to delete
const PLANS_TO_DELETE = [
  '3d0d7f16-21c8-43e3-b244-ca61a34736d8', // Old plan, same user
  '3e5203c7-1990-4e1d-8c5c-f81606d3cb67', // Different user, no data
  'eca064ec-4378-4705-82e1-632b6fea0a08', // Different user, no data
]

async function cleanup() {
  console.log('🧹 Starting Fort Worth plan cleanup...\n')
  console.log(`✅ Keeping plan: ${PLAN_TO_KEEP}`)
  console.log(`❌ Deleting ${PLANS_TO_DELETE.length} duplicate plans\n`)

  for (const planId of PLANS_TO_DELETE) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Processing plan: ${planId}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Check for any user progress on this plan
    const { data: planItems } = await supabase
      .from('plan_items')
      .select('id')
      .eq('plan_id', planId)

    if (!planItems || planItems.length === 0) {
      console.log('  No plan items found')
    } else {
      console.log(`  Found ${planItems.length} plan items`)

      // Check for lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, share_slug')
        .in('plan_item_id', planItems.map(item => item.id))

      if (lessons && lessons.length > 0) {
        console.log(`  ⚠️  Found ${lessons.length} lessons linked to this plan:`)
        lessons.forEach(lesson => {
          console.log(`     - Lesson ${lesson.id} (${lesson.share_slug})`)
        })
        console.log('  ❌ SKIPPING: Cannot delete plan with existing lessons')
        continue
      } else {
        console.log('  ✓ No lessons found')
      }

      // Check for user progress
      const { data: progress } = await supabase
        .from('progress')
        .select('id, user_id, lesson_id')
        .in('lesson_id', planItems.map(item => item.id))

      if (progress && progress.length > 0) {
        console.log(`  ⚠️  Found ${progress.length} progress records`)
        console.log('  ❌ SKIPPING: Cannot delete plan with user progress')
        continue
      } else {
        console.log('  ✓ No progress records found')
      }
    }

    // Safe to delete - no lessons or progress
    console.log('\n  🗑️  Deleting plan items...')
    if (planItems && planItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('plan_items')
        .delete()
        .eq('plan_id', planId)

      if (itemsError) {
        console.error('  ❌ Error deleting plan items:', itemsError.message)
        continue
      }
      console.log(`  ✓ Deleted ${planItems.length} plan items`)
    }

    console.log('  🗑️  Deleting plan...')
    const { error: planError } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)

    if (planError) {
      console.error('  ❌ Error deleting plan:', planError.message)
      continue
    }

    console.log('  ✅ Plan deleted successfully!')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Cleanup complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Verify final state
  console.log('📊 Final state:')
  const { data: remainingPlans } = await supabase
    .from('plans')
    .select('id, title, user_id')
    .ilike('title', '%Fort Worth%')

  if (remainingPlans) {
    console.log(`\n✅ ${remainingPlans.length} Fort Worth plan(s) remaining:`)
    remainingPlans.forEach(plan => {
      console.log(`   - ${plan.title}`)
      console.log(`     ID: ${plan.id}`)
      console.log(`     User: ${plan.user_id}`)
    })
  }
}

cleanup()
