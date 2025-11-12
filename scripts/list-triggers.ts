import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listTriggers() {
  console.log('Checking database for triggers and functions...\n')

  // Check if handle_new_user function exists
  console.log('1. Checking if handle_new_user() function exists...')
  try {
    const { data, error } = await serviceClient
      .from('pg_proc')
      .select('proname')
      .ilike('proname', '%handle_new_user%')

    if (error) {
      console.log('Cannot query pg_proc directly')
    } else {
      console.log('Functions found:', data)
    }
  } catch (e) {
    console.log('Cannot access pg_proc')
  }

  // Check public.users structure
  console.log('\n2. Checking public.users table...')
  try {
    const { count, error } = await serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('✅ public.users table exists with', count, 'users')
    }
  } catch (e: any) {
    console.error('Error:', e.message)
  }

  // Try to check if there's an issue with the email_queue table
  console.log('\n3. Checking email_queue table (might be trigger dependency)...')
  try {
    const { data, error } = await serviceClient
      .from('email_queue')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ email_queue error:', error.message)
      console.log('This might be the issue - the on_auth_user_confirmed trigger tries to insert into email_queue')
    } else {
      console.log('✅ email_queue table exists')
    }
  } catch (e: any) {
    console.error('❌ email_queue error:', e.message)
  }

  // Try using regular signup (not Admin API)
  console.log('\n4. Testing with regular signUp() instead of Admin API...')
  try {
    const testEmail = `test-regular-${Date.now()}@example.com`

    const { data, error } = await serviceClient.auth.signUp({
      email: testEmail,
      password: 'testpass123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        }
      }
    })

    if (error) {
      console.error('❌ Regular signUp error:', error)
    } else {
      console.log('✅ Regular signUp works! User:', data.user?.id)
      console.log('Session:', data.session ? 'Created' : 'Pending email confirmation')

      // Clean up
      if (data.user?.id) {
        await serviceClient.auth.admin.deleteUser(data.user.id)
        console.log('✅ Cleaned up test user')
      }
    }
  } catch (e: any) {
    console.error('❌ Exception:', e.message)
  }
}

listTriggers()
