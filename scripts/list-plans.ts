/**
 * List all plans in the database
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listPlans() {
  console.log('🔍 Looking for user...')

  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'tgaussoin@gmail.com')
    .single()

  if (!users) {
    console.error('❌ User not found')
    return
  }

  console.log(`✅ Found user: ${users.email} (${users.id})`)
  console.log('\n📚 Plans for this user:\n')

  const { data: plans } = await supabase
    .from('plans')
    .select('id, title, created_at')
    .eq('user_id', users.id)
    .order('created_at', { ascending: false })

  if (!plans || plans.length === 0) {
    console.log('❌ No plans found')
    return
  }

  for (const plan of plans) {
    console.log(`- ${plan.title}`)
    console.log(`  ID: ${plan.id}`)
    console.log(`  Created: ${new Date(plan.created_at).toLocaleDateString()}`)

    // Count plan items
    const { data: items } = await supabase
      .from('plan_items')
      .select('id, status')
      .eq('plan_id', plan.id)

    const published = items?.filter(i => i.status === 'published').length || 0
    const total = items?.length || 0

    console.log(`  Items: ${published}/${total} published\n`)
  }
}

listPlans().catch(console.error)
