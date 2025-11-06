import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export default async function PlanDebugPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Try with regular client (with RLS)
  const { data: planWithRLS, error: rlsError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  // Try with service client (bypasses RLS)
  const { data: planWithoutRLS, error: serviceError } = await serviceSupabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  return (
    <div className="min-h-screen bg-sandstone p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-2xl font-heading mb-6">Plan Debug Info</h1>

        <div className="space-y-6">
          <div>
            <strong>Plan ID:</strong> {id}
          </div>

          <div>
            <strong>Current User:</strong> {user ? user.id : 'Not logged in'}
          </div>

          <div>
            <strong>User Email:</strong> {user?.email || 'N/A'}
          </div>

          <hr className="my-6" />

          <div>
            <h2 className="text-xl font-heading mb-4">Query with RLS (normal client):</h2>
            {rlsError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <strong className="text-red-800">Error with RLS:</strong>
                <pre className="mt-2 text-sm">{JSON.stringify(rlsError, null, 2)}</pre>
              </div>
            ) : planWithRLS ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <strong className="text-green-800">Plan found with RLS!</strong>
                <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(planWithRLS, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <strong className="text-yellow-800">RLS blocked: No plan returned, no error</strong>
                <p className="text-sm mt-2">This means RLS policies are filtering out the plan.</p>
              </div>
            )}
          </div>

          <hr className="my-6" />

          <div>
            <h2 className="text-xl font-heading mb-4">Query WITHOUT RLS (service client):</h2>
            {serviceError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <strong className="text-red-800">Error without RLS:</strong>
                <pre className="mt-2 text-sm">{JSON.stringify(serviceError, null, 2)}</pre>
              </div>
            ) : planWithoutRLS ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <strong className="text-green-800">Plan found without RLS!</strong>
                <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(planWithoutRLS, null, 2)}</pre>
                <div className="mt-4 text-sm">
                  <p><strong>Owner ID:</strong> {planWithoutRLS.user_id}</p>
                  <p><strong>Is Public:</strong> {planWithoutRLS.is_public ? 'Yes' : 'No'}</p>
                  <p><strong>Match:</strong> {planWithoutRLS.user_id === user?.id ? 'You own this plan' : 'You DO NOT own this plan'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <strong className="text-red-800">Plan not found in database at all!</strong>
                <p className="text-sm mt-2">This plan ID doesn't exist in production database.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
