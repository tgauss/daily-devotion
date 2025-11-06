import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export default async function PlanDebugPage({ params }: { params: Promise<{ id: string }> }) {
  let id = 'ERROR'
  let user = null
  let planWithRLS = null
  let rlsError = null
  let planWithoutRLS = null
  let serviceError = null
  let errors: string[] = []

  try {
    const resolvedParams = await params
    id = resolvedParams.id
  } catch (e: any) {
    errors.push(`Failed to get params: ${e.message}`)
  }

  try {
    const supabase = await createClient()
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (e: any) {
    errors.push(`Failed to get user: ${e.message}`)
  }

  try {
    const supabase = await createClient()
    const result = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()
    planWithRLS = result.data
    rlsError = result.error
  } catch (e: any) {
    errors.push(`Failed RLS query: ${e.message}`)
  }

  try {
    const serviceSupabase = createServiceClient()
    const result = await serviceSupabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()
    planWithoutRLS = result.data
    serviceError = result.error
  } catch (e: any) {
    errors.push(`Failed service query: ${e.message}`)
  }

  return (
    <div className="min-h-screen bg-sandstone p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-2xl font-heading mb-6">Plan Debug Info</h1>

        <div className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
              <strong className="text-red-800 text-lg">Critical Errors:</strong>
              <ul className="mt-2 list-disc list-inside">
                {errors.map((err, idx) => (
                  <li key={idx} className="text-red-700 text-sm">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <strong>Plan ID:</strong> {id}
          </div>

          <div>
            <strong>Current User:</strong> {user ? user.id : 'Not logged in'}
          </div>

          <div>
            <strong>User Email:</strong> {user?.email || 'N/A'}
          </div>

          <div>
            <strong>Environment Check:</strong>
            <ul className="text-sm mt-2">
              <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
              <li>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}</li>
            </ul>
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
