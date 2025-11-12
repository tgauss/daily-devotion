import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSignup() {
  console.log('Testing user creation with Admin API...\n')

  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpass123'

  try {
    console.log('1. Creating user with auth.admin.createUser()...')
    const { data: { user }, error: signUpError } = await serviceClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        referred_by_code: null,
      },
    })

    if (signUpError) {
      console.error('❌ Signup error:', {
        message: signUpError.message,
        status: signUpError.status,
        name: signUpError.name,
      })
      return
    }

    if (!user) {
      console.error('❌ No user returned')
      return
    }

    console.log('✅ User created in auth.users:', user.id)

    // Check if user exists in public.users
    console.log('\n2. Checking if user exists in public.users...')
    const { data: publicUser, error: fetchError } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching from public.users:', fetchError)
    } else if (publicUser) {
      console.log('✅ User exists in public.users:', publicUser)
    } else {
      console.log('⚠️  User does NOT exist in public.users - trigger may not be set up')
    }

    // Clean up - delete the test user
    console.log('\n3. Cleaning up test user...')
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError)
    } else {
      console.log('✅ Test user deleted')
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testSignup()
