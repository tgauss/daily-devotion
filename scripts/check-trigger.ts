import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

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

async function checkTrigger() {
  console.log('Checking for handle_new_user trigger...\n')

  try {
    // Check if trigger exists on auth.users
    const { data, error } = await serviceClient.rpc('exec_sql', {
      query: `
        SELECT
          t.tgname AS trigger_name,
          t.tgenabled AS enabled,
          p.proname AS function_name,
          pg_get_triggerdef(t.oid) AS trigger_definition
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth'
        AND c.relname = 'users'
        AND p.proname LIKE '%handle_new_user%';
      `
    })

    if (error) {
      console.log('Note: Cannot query triggers directly (expected if exec_sql RPC does not exist)')
      console.log('Trying alternative method...\n')

      // Try to call the function directly to see if it exists
      const testResult = await serviceClient.rpc('generate_referral_code')
      console.log('generate_referral_code() result:', testResult)
    } else {
      console.log('Trigger info:', data)
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }

  // Test if generate_referral_code function exists and works
  console.log('\n2. Testing generate_referral_code() function...')
  try {
    const { data, error } = await serviceClient.rpc('generate_referral_code')

    if (error) {
      console.error('❌ generate_referral_code() error:', error)
    } else {
      console.log('✅ generate_referral_code() works:', data)
    }
  } catch (error: any) {
    console.error('❌ Exception calling generate_referral_code():', error.message)
  }

  // Check if public.users table has all required columns
  console.log('\n3. Checking public.users table structure...')
  try {
    const { data, error } = await serviceClient
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error querying users table:', error)
    } else {
      if (data && data.length > 0) {
        console.log('✅ users table columns:', Object.keys(data[0]))
      } else {
        console.log('⚠️  users table is empty, cannot check columns')
      }
    }
  } catch (error: any) {
    console.error('❌ Exception:', error.message)
  }
}

checkTrigger()
