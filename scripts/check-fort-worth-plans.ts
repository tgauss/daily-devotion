import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPlans() {
  console.log('🔍 Finding all Fort Worth plans...\n')

  // Get all plans with "Fort Worth" in the title
  const { data: plans, error } = await supabase
    .from('plans')
    .select('id, user_id, title, created_at, source')
    .ilike('title', '%Fort Worth%')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!plans || plans.length === 0) {
    console.log('No Fort Worth plans found')
    return
  }

  console.log(`Found ${plans.length} Fort Worth plans:\n`)

  for (const plan of plans) {
    // Get plan items count
    const { count: totalItems } = await supabase
      .from('plan_items')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', plan.id)

    // Get published items count
    const { count: publishedItems } = await supabase
      .from('plan_items')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', plan.id)
      .eq('status', 'published')

    // Count lessons by joining
    const { data: planItems } = await supabase
      .from('plan_items')
      .select('id')
      .eq('plan_id', plan.id)

    let lessonsCount = 0
    if (planItems && planItems.length > 0) {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .in('plan_item_id', planItems.map(item => item.id))

      lessonsCount = count || 0
    }

    console.log(`Plan: ${plan.title}`)
    console.log(`  ID: ${plan.id}`)
    console.log(`  User ID: ${plan.user_id}`)
    console.log(`  Created: ${new Date(plan.created_at).toLocaleString()}`)
    console.log(`  Source: ${plan.source}`)
    console.log(`  Total items: ${totalItems}`)
    console.log(`  Published items: ${publishedItems}`)
    console.log(`  Lessons generated: ${lessonsCount}`)
    console.log('')
  }
}

checkPlans()
