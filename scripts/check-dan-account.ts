import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDanAccount() {
  console.log('🔍 Investigating dan@sitealtitude.com account...\n')

  // Find Dan's user
  const { data: users } = await supabase.auth.admin.listUsers()
  const dan = users.users.find(u => u.email === 'dan@sitealtitude.com')

  if (!dan) {
    console.log('❌ User dan@sitealtitude.com not found')
    return
  }

  console.log(`✅ Found user: ${dan.email}`)
  console.log(`   User ID: ${dan.id}\n`)

  // Check Dan's plans
  const { data: plans } = await supabase
    .from('plans')
    .select('id, title, created_at')
    .eq('user_id', dan.id)

  console.log(`📋 Dan has ${plans?.length || 0} plan(s):\n`)

  if (!plans || plans.length === 0) {
    console.log('   No plans found')
    return
  }

  for (const plan of plans) {
    console.log(`   Plan: ${plan.title}`)
    console.log(`   ID: ${plan.id}`)
    console.log(`   Created: ${new Date(plan.created_at).toLocaleString()}\n`)

    // Check plan items
    const { data: planItems } = await supabase
      .from('plan_items')
      .select('id, status, references_text')
      .eq('plan_id', plan.id)

    console.log(`   Total plan items: ${planItems?.length || 0}`)

    // Check how many have lesson mappings
    const { data: mappings } = await supabase
      .from('plan_item_lessons')
      .select('plan_item_id, lesson_id, lessons(id, passage_canonical)')
      .in('plan_item_id', planItems?.map(i => i.id) || [])

    console.log(`   Mapped to lessons: ${mappings?.length || 0}`)
    console.log(`   Not mapped: ${(planItems?.length || 0) - (mappings?.length || 0)}\n`)

    if (mappings && mappings.length > 0) {
      console.log(`   Sample mappings:`)
      mappings.slice(0, 3).forEach(m => {
        const lesson = m.lessons as any
        console.log(`     - ${lesson?.passage_canonical || 'N/A'}`)
      })
      console.log()
    }
  }

  // Check total canonical lessons available
  console.log('📚 Checking canonical lessons...\n')
  const { data: allLessons, count } = await supabase
    .from('lessons')
    .select('id, passage_canonical', { count: 'exact' })
    .eq('translation', 'ESV')

  console.log(`   Total canonical ESV lessons in database: ${count}`)

  if (allLessons && allLessons.length > 0) {
    console.log(`   Sample lessons:`)
    allLessons.slice(0, 5).forEach(l => {
      console.log(`     - ${l.passage_canonical}`)
    })
  }
}

checkDanAccount()
