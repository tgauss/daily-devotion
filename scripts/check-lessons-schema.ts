import { config } from 'dotenv'
import { createServiceClient } from '../lib/supabase/service'

// Load .env.local which contains Supabase credentials
config({ path: '.env.local' })

async function checkSchema() {
  const serviceClient = createServiceClient()

  console.log('Checking lessons table schema...\n')

  // Fetch one lesson to see what columns exist
  const { data: sampleLesson, error } = await serviceClient
    .from('lessons')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching sample lesson:', error)
    return
  }

  if (!sampleLesson) {
    console.log('No lessons found in database')
    return
  }

  console.log('Sample lesson data:')
  console.log(JSON.stringify(sampleLesson, null, 2))
  console.log('\n\nColumn names:')
  console.log(Object.keys(sampleLesson).join(', '))
}

checkSchema()
