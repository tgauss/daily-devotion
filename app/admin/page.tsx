import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { CreateUserForm } from '@/components/admin/create-user-form'
import { UsersList } from '@/components/admin/users-list'
import { FortWorthPlansList } from '@/components/admin/fort-worth-plans-list'
import { FeaturedLessonsManager } from '@/components/admin/featured-lessons-manager'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
      plan_items(
        id,
        status,
        plan_item_lessons(
          id
        )
      )
    `)
    .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
    .order('created_at', { ascending: false })

  // Fetch user details separately
  const enrichedPlans = await Promise.all(
    (fortWorthPlans || []).map(async (plan) => {
      const { data: userData} = await serviceClient
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', plan.user_id)
        .single()

      return {
        ...plan,
        users: userData ? [userData] : []
      }
    })
  )

  // Fetch all lessons for featured lessons management
  const { data: rawLessons, error: lessonsError } = await serviceClient
    .from('lessons')
    .select(`
      id,
      title,
      scripture_reference,
      is_featured,
      plan_id
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError)
  }

  // Fetch plan details separately and enrich lessons
  const allLessons = await Promise.all(
    (rawLessons || []).map(async (lesson: any) => {
      if (!lesson.plan_id) {
        return {
          id: lesson.id,
          title: lesson.title,
          scripture_reference: lesson.scripture_reference,
          is_featured: lesson.is_featured,
          plans: { title: 'No Plan' }
        }
      }

      const { data: planData } = await serviceClient
        .from('plans')
        .select('title')
        .eq('id', lesson.plan_id)
        .single()

      return {
        id: lesson.id,
        title: lesson.title,
        scripture_reference: lesson.scripture_reference,
        is_featured: lesson.is_featured,
        plans: {
          title: planData?.title || 'Unknown Plan'
        }
      }
    })
  )

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
          <FortWorthPlansList plans={enrichedPlans || []} />
        </div>

        {/* Featured Lessons Management */}
        <div className="mb-8 bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-2">Featured Lessons</h2>
          <p className="text-sm text-charcoal/60 font-sans mb-6">
            Select lessons to feature on the public homepage for visitor preview
          </p>
          <FeaturedLessonsManager lessons={allLessons || []} />
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
