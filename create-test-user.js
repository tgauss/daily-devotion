const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://zeuhfxlpscrowoqqvsxny.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldWhmeGxwc2Nyd29xcXZzeG55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMxNjg0MywiZXhwIjoyMDc3ODkyODQzfQ.RmgjiQvkYNaq9z7tKyhLni9gPGkMptX6Bv9n_mgNIbA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createTestUser() {
  console.log('Creating test user...')

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'tgauss@test.com',
    password: 'password',
    email_confirm: true
  })

  if (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  }

  console.log('✓ Test user created successfully!')
  console.log('Email: tgauss@test.com')
  console.log('Password: password')
  console.log('User ID:', data.user.id)
  process.exit(0)
}

createTestUser()
