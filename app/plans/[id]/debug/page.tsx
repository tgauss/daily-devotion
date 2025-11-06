import { createClient } from '@/lib/supabase/server'

export default async function PlanDebugPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: plan, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  return (
    <div className="min-h-screen bg-sandstone p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-2xl font-heading mb-6">Plan Debug Info</h1>

        <div className="space-y-4">
          <div>
            <strong>Plan ID:</strong> {id}
          </div>

          <div>
            <strong>Current User:</strong> {user ? user.id : 'Not logged in'}
          </div>

          <div>
            <strong>User Email:</strong> {user?.email || 'N/A'}
          </div>

          <hr className="my-4" />

          {error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <strong className="text-red-800">Error fetching plan:</strong>
              <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
            </div>
          ) : plan ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <strong className="text-green-800">Plan found!</strong>
              <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(plan, null, 2)}</pre>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <strong className="text-yellow-800">No plan and no error (weird)</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
