import { config } from 'dotenv'
import { createServiceClient } from '../lib/supabase/service'

// Load .env.local which contains Supabase credentials
config({ path: '.env.local' })

async function checkLessons() {
  const serviceClient = createServiceClient()

  console.log('Checking lessons in database...\n')

  // First, check total lesson count
  const { count, error: countError } = await serviceClient
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting lessons:', countError)
    return
  }

  console.log(`Total lessons in database: ${count}\n`)

  if (count === 0) {
    console.log('No lessons found in the database.')
    console.log('You may need to create some lessons first before you can feature them.')
    return
  }

  // Fetch some sample lessons
  const { data: lessons, error } = await serviceClient
    .from('lessons')
    .select(`
      id,
      title,
      scripture_reference,
      is_featured,
      plan_id,
      plans(title)
    `)
    .limit(10)

  if (error) {
    console.error('Error fetching lessons:', error)
    return
  }

  console.log(`Sample of first 10 lessons:\n`)
  lessons?.forEach((lesson, index) => {
    console.log(`${index + 1}. ${lesson.title}`)
    console.log(`   Scripture: ${lesson.scripture_reference}`)
    console.log(`   Plan: ${lesson.plans ? (lesson.plans as any).title : 'No plan'}`)
    console.log(`   Featured: ${lesson.is_featured}`)
    console.log(`   ID: ${lesson.id}\n`)
  })

  // Check for lessons without plans
  const { count: noPlanCount } = await serviceClient
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .is('plan_id', null)

  if (noPlanCount && noPlanCount > 0) {
    console.log(`⚠️  Warning: ${noPlanCount} lessons have no associated plan`)
  }
}

checkLessons()
