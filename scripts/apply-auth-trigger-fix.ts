import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('Applying auth trigger fix migration...\n')

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250117_fix_auth_trigger.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  // Split into individual statements (rough split on semicolons outside of function bodies)
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')

  console.log('Executing migration SQL...\n')

  try {
    // Execute each statement separately for better error reporting
    const parts = statements.split(';').filter(s => s.trim())

    for (let i = 0; i < parts.length; i++) {
      const statement = parts[i].trim()
      if (!statement) continue

      console.log(`Executing statement ${i + 1}/${parts.length}...`)

      const { data, error } = await serviceClient.rpc('exec_sql', {
        query: statement + ';'
      }) as any

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error)
        console.log('Statement:', statement.substring(0, 100) + '...')
        // Continue to try remaining statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('\n✅ Migration applied! Testing user creation...\n')

    // Test creating a user
    const testEmail = `test-${Date.now()}@example.com`
    const { data: { user }, error: signUpError } = await serviceClient.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: false,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
      },
    })

    if (signUpError) {
      console.error('❌ User creation still failing:', signUpError)
      return
    }

    console.log('✅ User created successfully:', user?.id)

    // Check if user exists in public.users
    const { data: publicUser } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .single()

    if (publicUser) {
      console.log('✅ User also exists in public.users with referral code:', publicUser.referral_code)
    }

    // Clean up
    await serviceClient.auth.admin.deleteUser(user!.id)
    console.log('✅ Test user cleaned up')

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

applyMigration()
