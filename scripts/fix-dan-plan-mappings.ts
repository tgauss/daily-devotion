import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDanPlanMappings() {
  console.log('🔧 Fixing lesson mappings for dan@sitealtitude.com...\n')

  // Find Dan's user
  const { data: users } = await supabase.auth.admin.listUsers()
  const dan = users.users.find(u => u.email === 'dan@sitealtitude.com')

  if (!dan) {
    console.log('❌ User dan@sitealtitude.com not found')
    return
  }

  console.log(`✅ Found user: ${dan.email}`)
  console.log(`   User ID: ${dan.id}\n`)

  // Get Dan's Fort Worth plan
  const { data: plans } = await supabase
    .from('plans')
    .select('id, title')
    .eq('user_id', dan.id)
    .ilike('title', '%Fort Worth%')

  if (!plans || plans.length === 0) {
    console.log('❌ No Fort Worth plan found for Dan')
    return
  }

  const plan = plans[0]
  console.log(`📋 Found plan: ${plan.title}`)
  console.log(`   Plan ID: ${plan.id}\n`)

  // Get all plan items that don't have lesson mappings
  const { data: planItems } = await supabase
    .from('plan_items')
    .select(`
      id,
      references_text,
      translation,
      plan_item_lessons(lesson_id)
    `)
    .eq('plan_id', plan.id)

  if (!planItems) {
    console.log('❌ No plan items found')
    return
  }

  // Filter to items without mappings
  const unmappedItems = planItems.filter(
    item => !item.plan_item_lessons || item.plan_item_lessons.length === 0
  )

  console.log(`📊 Plan items: ${planItems.length}`)
  console.log(`   Already mapped: ${planItems.length - unmappedItems.length}`)
  console.log(`   Need mapping: ${unmappedItems.length}\n`)

  if (unmappedItems.length === 0) {
    console.log('✅ All plan items already have lesson mappings!')
    return
  }

  console.log('🔍 Looking up canonical lessons...\n')

  let mappedCount = 0
  const mappingsToCreate = []

  for (const item of unmappedItems) {
    const reference = item.references_text[0]

    // Normalize reference format: convert regular hyphens to en-dashes
    // Fort Worth plan uses "-" but canonical lessons use "–"
    const normalizedReference = reference.replace(/-/g, '–')

    // Look up canonical lesson for this passage
    const { data: canonicalLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('passage_canonical', normalizedReference)
      .eq('translation', item.translation)
      .single()

    if (canonicalLesson) {
      mappingsToCreate.push({
        plan_item_id: item.id,
        lesson_id: canonicalLesson.id
      })
      mappedCount++
    } else {
      console.log(`   ⚠️  No canonical lesson found for: "${reference}" (normalized: "${normalizedReference}")`)
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`   Found canonical lessons: ${mappedCount}`)
  console.log(`   Not found: ${unmappedItems.length - mappedCount}\n`)

  if (mappingsToCreate.length === 0) {
    console.log('❌ No mappings to create')
    return
  }

  // Create all mappings in batch
  console.log(`💾 Creating ${mappingsToCreate.length} lesson mappings...`)

  const { error: mappingError } = await supabase
    .from('plan_item_lessons')
    .insert(mappingsToCreate)

  if (mappingError) {
    console.error('❌ Error creating lesson mappings:', mappingError)
    return
  }

  // Update plan items status to published
  const mappedItemIds = mappingsToCreate.map(m => m.plan_item_id)
  const { error: updateError } = await supabase
    .from('plan_items')
    .update({ status: 'published' })
    .in('id', mappedItemIds)

  if (updateError) {
    console.error('❌ Error updating plan items:', updateError)
    return
  }

  console.log(`✅ Successfully mapped ${mappedCount} lessons!`)
  console.log(`\n🎉 Dan's plan now has access to all ${mappedCount} existing canonical lessons!`)
}

fixDanPlanMappings()
