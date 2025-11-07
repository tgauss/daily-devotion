import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PASSAGES = ['John 3:16–17', 'Psalm 23', 'Romans 8:28–30']

async function deleteTestLessons() {
  for (const passage of PASSAGES) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('passage_canonical', passage)
      .eq('translation', 'ESV')

    if (error) {
      console.error(`Error deleting ${passage}:`, error)
    } else {
      console.log(`✓ Deleted lesson for ${passage}`)
    }
  }
}

deleteTestLessons()
