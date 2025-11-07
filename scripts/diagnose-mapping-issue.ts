import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fortWorthPlan from '../data/fort-worth-bible-plan.json'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseMappingIssue() {
  console.log('🔍 Diagnosing mapping issue...\n')

  // Get all canonical lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, passage_canonical')
    .eq('translation', 'ESV')

  console.log(`📚 Found ${lessons?.length || 0} canonical lessons:\n`)

  const lessonRefs = new Set(lessons?.map(l => l.passage_canonical) || [])
  lessons?.slice(0, 10).forEach(l => {
    console.log(`   - "${l.passage_canonical}"`)
  })
  console.log()

  // Get sample references from Fort Worth plan
  console.log('📋 Sample references from Fort Worth plan:\n')
  const sampleReferences = fortWorthPlan
    .slice(0, 10)
    .flatMap(day => day.readings.map(r => r.reference))

  sampleReferences.forEach(ref => {
    const matched = lessonRefs.has(ref)
    console.log(`   ${matched ? '✅' : '❌'} "${ref}"`)
  })

  console.log('\n🔎 Checking for partial matches...\n')

  // Check for patterns
  const planRefs = fortWorthPlan.flatMap(day =>
    day.readings.map(r => r.reference)
  )

  let exactMatches = 0
  let noMatches = 0

  for (const ref of planRefs) {
    if (lessonRefs.has(ref)) {
      exactMatches++
    } else {
      noMatches++
      if (noMatches <= 5) {
        console.log(`   Missing: "${ref}"`)
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Total references in plan: ${planRefs.length}`)
  console.log(`   Exact matches found: ${exactMatches}`)
  console.log(`   No matches: ${noMatches}`)
  console.log(`   Available lessons: ${lessons?.length || 0}`)
}

diagnoseMappingIssue()
