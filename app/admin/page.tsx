import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { CreateUserForm } from '@/components/admin/create-user-form'
import { UsersList } from '@/components/admin/users-list'
import { FortWorthPlansList } from '@/components/admin/fort-worth-plans-list'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch all users for display
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all Fort Worth plans with lesson counts
  const serviceClient = createServiceClient()
  const { data: fortWorthPlans } = await serviceClient
    .from('plans')
    .select(`
      id,
      title,
      user_id,
      created_at,
      users!inner(email, first_name, last_name),
      plan_items(
        id,
        status
      )
    `)
    .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
    .order('created_at', { ascending: false })

  return (
    <div
      className="min-h-screen bg-sandstone"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-charcoal mb-2">Admin Dashboard</h1>
            <p className="text-charcoal/60 font-sans">Manage users and system settings</p>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-white/90 hover:bg-white text-charcoal rounded-md border border-olivewood/20 transition-all font-sans text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Fort Worth Plans Management */}
        <div className="mb-8 bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-2">Fort Worth Plans</h2>
          <p className="text-sm text-charcoal/60 font-sans mb-6">
            Manage Fort Worth Bible plans and copy lessons between users
          </p>
          <FortWorthPlansList plans={fortWorthPlans || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create User Section */}
          <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
            <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">Create New User</h2>
            <CreateUserForm />
          </div>

          {/* Users List Section */}
          <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
            <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">All Users</h2>
            <UsersList users={users || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
